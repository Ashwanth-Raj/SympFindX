const Prediction = require('../models/Prediction');
const { validationResult } = require('express-validator');
const axios = require('axios');
const FormData = require('form-data');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

const PREDICT_SERVICE_URL = process.env.PREDICT_SERVICE_URL || 'http://127.0.0.1:7000/api/predict';
const SAVE_TO_CLOUDINARY = (process.env.SAVE_TO_CLOUDINARY || 'false').toLowerCase() === 'true';

async function uploadToCloudinaryFromBuffer(buffer, filename) {
return new Promise((resolve, reject) => {
const uploadStream = cloudinary.uploader.upload_stream(
{ resource_type: 'image', folder: 'sympfindx/uploads', public_id: filename?.split('.')?.[0] },
(error, result) => {
if (error) return reject(error);
resolve(result);
}
);
streamifier.createReadStream(buffer).pipe(uploadStream);
});
}

// Map final diagnosis and confidence to your enum: ['low','moderate','high','emergency']
function deriveUrgencyLevel(disease, confidenceFloat) {
const d = (disease || '').toLowerCase();
if (d === 'normal') return 'low';
if (confidenceFloat >= 0.95) return 'emergency'; // very high confidence of disease -> treat as highest urgency
if (confidenceFloat >= 0.85) return 'high';
return 'moderate';
}

// Optional helper: pick a specialist for routing (not required fields)
function pickRecommendedSpecialist(disease) {
const d = (disease || '').toLowerCase();
if (d.includes('glaucoma')) return 'glaucoma_specialist';
if (d.includes('retinopathy') || d.includes('retinal')) return 'retinal_specialist';
// Outer-eye surface conditions could be ophthalmologist/optometrist
return 'ophthalmologist';
}

const analyzePrediction = async (req, res) => {
const startTime = Date.now();

const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(400).json({ success: false, errors: errors.array() });
}
if (!req.file) {
return res.status(400).json({ success: false, error: 'Image file is required.' });
}

try {
// Buffer for Python: use preprocessed 224x224 if present (from your middleware), else original
const imageBuffer = req.file?.processed?.buffer || req.file.buffer;
const originalName = req.file.originalname || 'upload.jpg';

const imageTypeRaw = (req.body.image_type || 'fundus').toLowerCase();
const imageType = imageTypeRaw === 'outer_eye' ? 'outer' : imageTypeRaw; // Python expects 'fundus' or 'outer'
const symptomsText = (req.body.symptoms || '').trim();

// Optional Cloudinary upload
let cloudinaryUrl = null;
let cloudinaryPublicId = null;
if (SAVE_TO_CLOUDINARY) {
  try {
    const uploaded = await uploadToCloudinaryFromBuffer(imageBuffer, originalName);
    cloudinaryUrl = uploaded.secure_url;
    cloudinaryPublicId = uploaded.public_id;
  } catch (err) {
    console.warn('Cloudinary upload failed (continuing):', err.message);
  }
}

// Send to Python microservice
// Build form-data for Python microservice
const form = new FormData();
form.append('file', imageBuffer, { filename: originalName });
form.append('image_type', imageType);
form.append('symptoms', symptomsText);

// NEW: forward relax flag if present in the multipart body
const relaxRaw = (req.body.relax || '').toString().toLowerCase();
const relax = relaxRaw === '1' || relaxRaw === 'true' || relaxRaw === 'yes';
if (relax) form.append('relax', '1');

const { data: svc } = await axios.post(PREDICT_SERVICE_URL, form, {
headers: form.getHeaders(),
timeout: 30000,
maxBodyLength: Infinity,
});


// Handle microservice rejection
if (svc?.rejected) {
  return res.status(200).json({
    success: true,
    data: {
      rejected: true,
      reason: svc.reason || 'Rejected by model gates',
      heuristics: svc.heuristics || null,
      ood_scores: svc.ood_scores || null,
    },
    message: 'Image rejected by quality/heuristics/OOD checks.',
  });
}

// Validate shape
if (!svc || svc.ok !== true || !svc.prediction || typeof svc.confidence !== 'number') {
  return res.status(502).json({ success: false, error: 'Invalid response from AI service' });
}

// Transform response for frontend
const transformed = {
  prediction: svc.prediction,                // label string
  confidence_float: svc.confidence,          // 0..1
  top_predictions: svc.top3 || [],           // [{label, confidence}]
  type: svc.type,                            // 'fundus' or 'outer'
  symptom_pred: svc.symptom_pred || null,
  symptom_agrees: !!svc.symptom_agrees,
  heuristics: svc.heuristics || null,
  ood_scores: svc.ood_scores || null,
  cloudinary_url: cloudinaryUrl,
};

// Build required DB doc per schema
const finalDiagnosis = transformed.prediction;
const overallConfidence = transformed.confidence_float;
const urgencyLevel = deriveUrgencyLevel(finalDiagnosis, overallConfidence);

// imageData required fields, even when Cloudinary is off
const imageData = {
  originalUrl: cloudinaryUrl || `local://${originalName}`,
  cloudinaryPublicId: cloudinaryPublicId || (originalName.split('.').slice(0, -1).join('.') || 'local_upload'),
  processedUrl: null,
  metadata: {
    format: req.file?.mimetype || 'image/jpeg',
    width: req.file?.imageMetadata?.width || 224,
    height: req.file?.imageMetadata?.height || 224,
    size: req.file?.processed?.size || req.file?.size || null,
  },
};

// imageAnalysis (required)
// Map top_predictions -> probabilities array in details
const probabilities = (transformed.top_predictions || []).map(tp => ({
  disease: tp.label || 'Unknown',
  probability: typeof tp.confidence === 'number' ? tp.confidence : null,
}));

const imageAnalysis = {
  disease: finalDiagnosis,                 // required
  confidence: overallConfidence,           // required
  details: {
    probabilities,
    detectedFeatures: [] // can push heuristics-derived notes if needed
  }
};

// textAnalysis (optional) from symptoms
const textAnalysis = {
  suggestedConditions: transformed.symptom_pred
    ? [{ condition: transformed.symptom_pred, score: 1.0 }]
    : [],
  riskFactors: [],
  matchedKeywords: symptomsText
    ? symptomsText.split(',').map(s => s.trim()).filter(Boolean)
    : []
};

// combinedResult (required)
const combinedResult = {
  finalDiagnosis,
  overallConfidence,
  urgencyLevel,                            // enum: low | moderate | high | emergency
  recommendations: [
    'Maintain regular eye check-ups.',
    'If symptoms persist or worsen, consult an ophthalmologist.'
  ],
};

// symptoms block (required description)
const symptomsBlock = {
  description: symptomsText || 'Not provided',
  duration: undefined,              // optional; leave unset if not provided
  severity: undefined,              // optional
  additionalSymptoms: symptomsText
    ? symptomsText.split(',').map(s => s.trim()).filter(Boolean)
    : []
};

// Compose full document
const doc = {
  user: req.user.id,
  imageData,
  symptoms: symptomsBlock,
  predictions: {
    imageAnalysis,
    textAnalysis,
    combinedResult
  },
  status: 'completed',
  processingTime: Date.now() - startTime
};

// Save and allow schema to validate; if it fails, return 422
try {
  const newPrediction = new Prediction(doc);
  await newPrediction.validate();
  await newPrediction.save();

  // Optionally set routing flags (not required by schema)
  // newPrediction.specialistRouting.isRoutingRequired = newPrediction.shouldRouteToSpecialist();
  // newPrediction.specialistRouting.recommendedSpecialist = pickRecommendedSpecialist(finalDiagnosis);
  // await newPrediction.save();
} catch (validationErr) {
  console.error('Prediction save validation error:', validationErr.message);
  return res.status(422).json({
    success: false,
    message: 'Validation failed while saving prediction',
    error: validationErr.message
  });
}

// Return the transformed payload the frontend expects
return res.status(200).json({ success: true, data: transformed });
} catch (error) {
console.error('Prediction analyze error:', error.message);
const msg = error.response?.data?.error || error.response?.data?.message || error.message || 'AI service unavailable.';
return res.status(500).json({
success: false,
message: 'Server error during prediction analysis',
error: msg,
});
}
};

const getPredictionHistory = async (req, res) => {
try {
const { page = 1, limit = 10, status, diagnosis } = req.query;
const query = { user: req.user.id };
if (status) query.status = status;
if (diagnosis) query['predictions.combinedResult.finalDiagnosis'] = new RegExp(diagnosis, 'i');

const predictions = await Prediction.find(query)
  .sort({ createdAt: -1 })
  .limit(Number(limit))
  .skip((Number(page) - 1) * Number(limit));

const total = await Prediction.countDocuments(query);
res.status(200).json({
  success: true,
  data: { predictions, totalPages: Math.ceil(total / limit), currentPage: Number(page), total },
});
} catch (err) {
console.error(err);
res.status(500).json({ success: false, message: 'Server error fetching prediction history' });
}
};

const getPrediction = async (req, res) => {
try {
const prediction = await Prediction.findById(req.params.id);
if (!prediction) return res.status(404).json({ success: false, message: 'Prediction not found' });
if (prediction.user.toString() !== req.user.id && req.user.role !== 'admin') {
return res.status(403).json({ success: false, message: 'Access denied' });
}
res.status(200).json({ success: true, data: prediction });
} catch (err) {
console.error(err);
res.status(500).json({ success: false, message: 'Server error fetching prediction' });
}
};

const deletePrediction = async (req, res) => {
try {
const prediction = await Prediction.findById(req.params.id);
if (!prediction) return res.status(404).json({ success: false, message: 'Prediction not found' });
if (prediction.user.toString() !== req.user.id && req.user.role !== 'admin') {
return res.status(403).json({ success: false, message: 'Access denied' });
}
await Prediction.findByIdAndDelete(req.params.id);
res.status(200).json({ success: true, message: 'Prediction deleted successfully' });
} catch (err) {
console.error(err);
res.status(500).json({ success: false, message: 'Server error deleting prediction' });
}
};

const getPredictionAnalytics = async (req, res) => {
try {
const { timeframe = '30d' } = req.query;
const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
const daysBack = daysMap[timeframe] || 30;
const startDate = new Date();
startDate.setDate(startDate.getDate() - daysBack);

const analytics = await Prediction.aggregate([
  { $match: { user: req.user.id, createdAt: { $gte: startDate } } },
  {
    $group: {
      _id: '$predictions.combinedResult.finalDiagnosis',
      count: { $sum: 1 },
      avgConfidence: { $avg: '$predictions.combinedResult.overallConfidence' },
    },
  },
  { $sort: { count: -1 } },
]);

res.status(200).json({
  success: true,
  data: {
    timeframe,
    analytics,
    totalPredictions: analytics.reduce((sum, i) => sum + i.count, 0),
  },
});
} catch (err) {
console.error(err);
res.status(500).json({ success: false, message: 'Server error fetching analytics' });
}
};

module.exports = { analyzePrediction, getPredictionHistory, getPrediction, deletePrediction, getPredictionAnalytics };