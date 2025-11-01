import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { usePrediction } from '../../context/PredictionContext';
import predictionService from '../../services/predictionService';

const SymptomForm = () => {
const {
symptoms, setSymptoms,
previousStep, setStep,
setCurrentPrediction, setLoading, loading,
uploadedImage, imageType
} = usePrediction();

const [localSymptoms, setLocalSymptoms] = useState(symptoms || '');
const [formError, setFormError] = useState('');
const inFlight = useRef(false);

useEffect(() => {
setLocalSymptoms(symptoms || '');
}, [symptoms]);

const buildPredictionObject = (data) => ({
id: Date.now().toString(),
disease: data.prediction || 'Unknown',
confidence: Math.round((data.confidence_float || 0) * 100),
description: 'AI analysis result based on the uploaded eye image.',
recommendations: [
'If symptoms persist or worsen, consult an ophthalmologist.',
'Maintain regular eye check-ups.',
'Ensure good lighting and clarity for future images.'
],
urgency: (data.prediction || '').toLowerCase() === 'normal' ? 'low' : 'medium',
specialists: [],
createdAt: new Date().toISOString(),
imageUrl: null,
symptoms: (localSymptoms || '').trim(),
raw: data
});

const onSubmit = async (e) => {
e.preventDefault();
if (loading || inFlight.current) return;

if (!uploadedImage) {
  setFormError('Please upload an image first.');
  return;
}

// Stay on Step 2 while analyzing to avoid unmount/remount “glitch”
setFormError('');
inFlight.current = true;
setLoading(true);
setCurrentPrediction(null);

try {
  const result = await predictionService.uploadAndAnalyze(
    uploadedImage,
    (localSymptoms || '').trim(),
    imageType
  );

  if (!result.success) {
    // Rejected/failed: stay here and show the reason
    setFormError(result.message || 'Analysis failed. Please try again.');
    setLoading(false);
    inFlight.current = false;
    return;
  }

  const data = result.data;
  setSymptoms((localSymptoms || '').trim());
  setCurrentPrediction(buildPredictionObject(data));

  // Jump directly to results
  setLoading(false);
  setStep(4);
  inFlight.current = false;
} catch (err) {
  setFormError(err?.message || 'A critical error occurred.');
  setLoading(false);
  inFlight.current = false;
}
};

if (!uploadedImage) {
return (
<div className="card text-center py-12">
<p className="text-navy-300">Please upload an image first.</p>
<button onClick={previousStep} className="btn-secondary mt-4">
<ArrowLeft className="w-4 h-4 mr-2" /> Back to Upload
</button>
</div>
);
}

return (
<div className="card relative">
{/* Optional inline overlay while loading */}
{loading && (
<div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg z-10">
<div className="flex items-center space-x-3 bg-navy-900/80 px-4 py-2 rounded-md">
<Loader2 className="w-5 h-5 animate-spin text-white" />
<span className="text-white text-sm">Analyzing...</span>
</div>
</div>
)}

  <h2 className="text-2xl font-bold text-white mb-4 font-roboto-slab">Describe Your Symptoms (Optional)</h2>
  <p className="text-navy-300 mb-6">
    Add any symptoms you’re experiencing. If symptoms agree with the image, the UI confidence indicator increases slightly.
  </p>

  {formError && (
    <div className="mb-4 bg-red-400/10 border border-red-400/30 rounded-lg p-3">
      <div className="flex items-center space-x-2">
        <AlertCircle className="w-5 h-5 text-red-400" />
        <span className="text-red-400 text-sm">
          {formError}
        </span>
      </div>
      {/* Friendly tips */}
      <ul className="mt-2 list-disc list-inside text-navy-300 text-sm">
        <li>Ensure the photo contains an eye close-up or a retinal (fundus) view.</li>
        <li>Avoid logos, full-face passport photos, or random scenes.</li>
        <li>Try better lighting and focus.</li>
      </ul>
    </div>
  )}

  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label className="block text-sm text-white mb-2">Symptoms (comma-separated)</label>
      <textarea
        className="input-field w-full h-28"
        placeholder="e.g., blurred vision, eye pain, redness"
        value={localSymptoms}
        onChange={(e) => setLocalSymptoms(e.target.value)}
        disabled={loading}
      />
      <p className="text-navy-400 text-xs mt-1">Image type: {imageType}</p>
    </div>

    <div className="flex items-center space-x-3">
      <button type="button" onClick={previousStep} className="btn-secondary" disabled={loading}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Analyzing...' : <>Analyze <Send className="w-4 h-4 ml-2" /></>}
      </button>
    </div>
  </form>
</div>
);
};

export default SymptomForm;