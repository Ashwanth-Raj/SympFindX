// frontend/src/components/Prediction/ImageUpload.jsx

import React, { useState, useRef } from 'react';
import { Camera, X, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { usePrediction } from '../../context/PredictionContext';
import predictionService from '../../services/predictionService';

const ImageUpload = () => {
  const { uploadedImage, setUploadedImage, imageType, setImageType, nextStep } = usePrediction();
  
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    setError('');
    const validation = predictionService.validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      setUploadedImage(null);
      setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    setUploadedImage(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setPreview(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleContinue = () => {
    if (uploadedImage) {
      nextStep(); // This correctly updates the context, and Diagnosis.jsx will react to it
    }
  };

  return (
    <div className="card">
      <div className="text-center mb-8">
        <Eye className="w-16 h-16 text-primary-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2 font-roboto-slab">Upload Eye Image</h2>
        <p className="text-navy-300">Upload a clear, well-lit image of your eye or retinal scan for AI analysis</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-400/10 border border-red-400/30 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}
      
      <div className="mb-6">
        <label htmlFor="imageType" className="block text-md font-semibold text-white mb-2">1. Select Image Type</label>
        <select id="imageType" value={imageType} onChange={(e) => setImageType(e.target.value)} className="input-field w-full">
          <option value="fundus">Fundus (Back of the eye)</option>
          <option value="outer_eye">Outer Eye (Front of the eye)</option>
        </select>
      </div>
      
      <label className="block text-md font-semibold text-white mb-2">2. Upload Your Image</label>
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${ dragActive ? 'border-primary-500 bg-primary-500/10' : preview ? 'border-green-400 bg-green-400/10' : 'border-navy-600 hover:border-primary-500' }`}
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
      >
        <input ref={fileInputRef} type="file" accept="image/jpeg, image/png, image/webp" onChange={handleInputChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
        {preview ? (
          <div className="text-center">
            <div className="relative inline-block">
              <img src={preview} alt="Uploaded eye" className="max-w-xs max-h-64 rounded-lg shadow-lg"/>
              <button onClick={(e) => { e.stopPropagation(); removeImage(); }} className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-center space-x-2"><CheckCircle className="w-5 h-5 text-green-400" /><span className="text-green-400 font-medium">Image uploaded successfully</span></div>
            <p className="text-navy-400 text-sm mt-2">File: {uploadedImage?.name} ({uploadedImage && Math.round(uploadedImage.size / 1024)}KB)</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-24 h-24 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4"><Camera className="w-12 h-12 text-navy-400" /></div>
            <h3 className="text-lg font-semibold text-white mb-2">Upload Eye Image</h3>
            <p className="text-navy-300 mb-4">Drag and drop, or click to browse</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-center">
        <button onClick={handleContinue} disabled={!uploadedImage} className={`btn-primary inline-flex items-center ${ !uploadedImage ? 'opacity-50 cursor-not-allowed' : '' }`}>
          Continue to Symptoms <Eye className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default ImageUpload;
