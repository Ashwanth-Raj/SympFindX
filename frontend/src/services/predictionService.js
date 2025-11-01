import api from './api';

class PredictionService {
async uploadAndAnalyze(file, symptoms, imageType, options = {}) {
try {
const formData = new FormData();
formData.append('image', file);
formData.append('symptoms', symptoms || '');
formData.append('image_type', imageType || 'fundus');
if (options.relax) formData.append('relax', '1');

  const response = await api.post('/prediction/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  if (!response?.data) {
    return { success: false, message: 'Empty response from server' };
  }

  const { success, data, message, error } = response.data;
  if (!success) {
    return { success: false, message: message || error || 'Server error' };
  }

  if (data?.rejected) {
    const reason = data?.reason || 'Image rejected (quality/heuristics/OOD).';
    return { success: false, message: reason };
  }

  return { success: true, data, message: 'Analysis completed successfully!' };
} catch (err) {
  return {
    success: false,
    message: err.response?.data?.error || err.response?.data?.message || 'Analysis failed. Please try again.',
  };
}
}

validateImageFile(file) {
const errors = [];
const maxSize = 10 * 1024 * 1024;
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
if (!file) {
errors.push('Please select an image file');
return { isValid: false, errors };
}
if (!allowedTypes.includes(file.type)) errors.push('Please upload a valid image file (JPEG, PNG, WebP)');
if (file.size > maxSize) errors.push('Image size should be less than 10MB');
return { isValid: errors.length === 0, errors };
}

validateSymptoms(symptoms) {
const errors = [];
if (symptoms && symptoms.trim().length > 1000) {
errors.push('Symptoms description is too long (maximum 1000 characters)');
}
return { isValid: errors.length === 0, errors };
}
}

const predictionService = new PredictionService();
export default predictionService;