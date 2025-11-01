const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  imageData: {
    originalUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    processedUrl: String,
    metadata: {
      format: String,
      width: Number,
      height: Number,
      size: Number,
    },
  },

  symptoms: {
    description: { type: String, required: true, maxlength: 1000 },
    duration: { type: String, enum: ['less_than_week','week_to_month','month_to_year','more_than_year'] },
    severity: { type: Number, min: 1, max: 10 },
    additionalSymptoms: [String],
  },

  predictions: {
    imageAnalysis: {
      disease: { type: String, required: true },
      confidence: { type: Number, required: true, min: 0, max: 1 },
      details: {
        probabilities: [{ disease: String, probability: Number }],
        detectedFeatures: [String],
      },
    },
    textAnalysis: {
      suggestedConditions: [{ condition: String, score: Number }],
      riskFactors: [String],
      matchedKeywords: [String],
    },
    combinedResult: {
      finalDiagnosis: { type: String, required: true },
      overallConfidence: { type: Number, required: true, min: 0, max: 1 },
      urgencyLevel: { type: String, enum: ['low','moderate','high','emergency'], required: true },
      recommendations: [String],
    },
  },

  specialistRouting: {
    isRoutingRequired: { type: Boolean, default: false },
    recommendedSpecialist: {
      type: String,
      enum: ['ophthalmologist','optometrist','retinal_specialist','glaucoma_specialist'],
    },
    urgency: { type: String, enum: ['routine','urgent','emergency'], default: 'routine' },
    assignedSpecialist: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    routingDate: Date,
    consultationStatus: { type: String, enum: ['pending','scheduled','completed','cancelled'], default: 'pending' },
  },

  status: { type: String, enum: ['processing','completed','failed','review_required'], default: 'processing' },
  processingTime: Number,
  errorMessage: String,

  feedback: {
    accuracy: { type: Number, min: 1, max: 5 },
    helpful: Boolean,
    comments: String,
    providedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },

  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

// Indexes
predictionSchema.index({ user: 1, createdAt: -1 });
predictionSchema.index({ 'predictions.combinedResult.finalDiagnosis': 1 });
predictionSchema.index({ 'specialistRouting.assignedSpecialist': 1 });
predictionSchema.index({ status: 1 });

// Virtuals
predictionSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Methods
predictionSchema.methods.setProcessingTime = function(startTime) {
  this.processingTime = Date.now() - startTime;
  return this;
};

predictionSchema.methods.shouldRouteToSpecialist = function() {
  const highRiskConditions = ['glaucoma','diabetic_retinopathy','macular_degeneration','retinal_detachment'];
  const diagnosis = this.predictions.combinedResult.finalDiagnosis.toLowerCase();
  const confidence = this.predictions.combinedResult.overallConfidence;
  const urgency = this.predictions.combinedResult.urgencyLevel;

  return highRiskConditions.some(c => diagnosis.includes(c)) || urgency === 'high' || urgency === 'emergency' || confidence < 0.7;
};

// Statics
predictionSchema.statics.getStatistics = async function() {
  return this.aggregate([
    { $group: { _id: '$predictions.combinedResult.finalDiagnosis', count: { $sum: 1 }, avgConfidence: { $avg: '$predictions.combinedResult.overallConfidence' } } },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Prediction', predictionSchema);
