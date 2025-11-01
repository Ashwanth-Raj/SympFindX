// frontend/src/context/PredictionContext.jsx

import React, { createContext, useState, useContext } from 'react';

const PredictionContext = createContext();

export const usePrediction = () => {
  const context = useContext(PredictionContext);
  if (!context) {
    throw new Error('usePrediction must be used within a PredictionProvider');
  }
  return context;
};

export const PredictionProvider = ({ children }) => {
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [imageType, setImageType] = useState('fundus'); // New state for image type
  const [step, setStep] = useState(1); // 1: Upload, 2: Symptoms, 3: Results

  const resetPrediction = () => {
    setCurrentPrediction(null);
    setUploadedImage(null);
    setSymptoms('');
    setImageType('fundus'); // Reset image type
    setStep(1);
    setLoading(false);
  };

  const addPredictionToHistory = (prediction) => {
    setPredictionHistory(prev => [prediction, ...prev]);
  };

  const nextStep = () => {
    // Assuming your Diagnosis page has 4 steps in its UI array
    setStep(prev => Math.min(prev + 1, 4));
  };

  const previousStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const value = {
    currentPrediction,
    setCurrentPrediction,
    predictionHistory,
    setPredictionHistory,
    loading,
    setLoading,
    uploadedImage,
    setUploadedImage,
    symptoms,
    setSymptoms,
    imageType, // Expose imageType
    setImageType, // Expose setter for imageType
    step,
    setStep,
    resetPrediction,
    addPredictionToHistory,
    nextStep,
    previousStep
  };

  return (
    <PredictionContext.Provider value={value}>
      {children}
    </PredictionContext.Provider>
  );
};
