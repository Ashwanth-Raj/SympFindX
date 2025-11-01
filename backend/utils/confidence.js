// Confidence calculation and analysis utilities

// Calculate combined confidence from image and text analysis
const calculateCombinedConfidence = (imageConfidence, textAnalysis, weights = {}) => {
  const {
    imageWeight = 0.7,
    textWeight = 0.3,
    consistencyBonus = 0.1,
    penaltyThreshold = 0.3
  } = weights;

  // Normalize weights
  const totalWeight = imageWeight + textWeight;
  const normalizedImageWeight = imageWeight / totalWeight;
  const normalizedTextWeight = textWeight / totalWeight;

  // Calculate text confidence (average of detected conditions)
  let textConfidence = 0;
  if (textAnalysis.detectedConditions && textAnalysis.detectedConditions.length > 0) {
    textConfidence = textAnalysis.detectedConditions.reduce((sum, condition) => 
      sum + (condition.confidence / 100), 0
    ) / textAnalysis.detectedConditions.length;
  }

  // Basic weighted average
  let combinedConfidence = (imageConfidence * normalizedImageWeight) + 
                          (textConfidence * normalizedTextWeight);

  // Consistency check - bonus if image and text suggest similar conditions
  const consistencyScore = calculateConsistencyScore(imageConfidence, textAnalysis);
  if (consistencyScore > 0.7) {
    combinedConfidence += consistencyBonus;
  }

  // Apply penalty for very low individual scores
  if (imageConfidence < penaltyThreshold || textConfidence < penaltyThreshold) {
    combinedConfidence *= 0.8; // 20% penalty
  }

  // Ensure confidence is between 0 and 1
  return Math.max(0, Math.min(1, combinedConfidence));
};

// Calculate consistency between image and text analysis
const calculateConsistencyScore = (imageConfidence, textAnalysis) => {
  // This is a simplified implementation
  // In practice, you'd compare the actual predicted conditions
  
  if (!textAnalysis.detectedConditions || textAnalysis.detectedConditions.length === 0) {
    return 0.5; // Neutral when no text conditions detected
  }

  // For now, assume consistency based on overall confidence levels
  const textConfidence = textAnalysis.detectedConditions[0].confidence / 100;
  const difference = Math.abs(imageConfidence - textConfidence);
  
  // Convert difference to consistency score (0-1)
  return Math.max(0, 1 - (difference * 2));
};

// Determine confidence level category
const getConfidenceLevel = (confidence) => {
  if (confidence >= 0.9) return 'very_high';
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.7) return 'moderate';
  if (confidence >= 0.5) return 'low';
  return 'very_low';
};

// Generate confidence explanation
const generateConfidenceExplanation = (confidence, imageConfidence, textAnalysis) => {
  const level = getConfidenceLevel(confidence);
  let explanation = '';

  switch (level) {
    case 'very_high':
      explanation = 'Very high confidence: Both image analysis and symptom description strongly indicate the same condition.';
      break;
    case 'high':
      explanation = 'High confidence: Strong agreement between image analysis and reported symptoms.';
      break;
    case 'moderate':
      explanation = 'Moderate confidence: Good indicators present, but some uncertainty remains.';
      break;
    case 'low':
      explanation = 'Low confidence: Limited or conflicting evidence. Professional consultation recommended.';
      break;
    case 'very_low':
      explanation = 'Very low confidence: Insufficient or unclear information for reliable assessment.';
      break;
  }

  // Add specific details
  if (imageConfidence < 0.5) {
    explanation += ' Image quality or features may be affecting analysis accuracy.';
  }

  if (!textAnalysis.detectedConditions || textAnalysis.detectedConditions.length === 0) {
    explanation += ' Symptom description did not match common eye condition patterns.';
  }

  return explanation;
};

// Calculate urgency score based on confidence and condition severity
const calculateUrgencyScore = (confidence, predictedCondition, textAnalysis) => {
  let urgencyScore = 0;

  // Base urgency from predicted condition
  const conditionUrgency = {
    'retinal_detachment': 10,
    'acute_glaucoma': 9,
    'diabetic_retinopathy_severe': 8,
    'central_retinal_artery_occlusion': 10,
    'optic_neuritis': 7,
    'glaucoma': 6,
    'diabetic_retinopathy': 5,
    'macular_degeneration': 4,
    'cataracts': 2,
    'dry_eye': 1,
    'conjunctivitis': 2
  };

  urgencyScore += conditionUrgency[predictedCondition] || 3;

  // Adjust based on confidence
  if (confidence > 0.8) {
    urgencyScore += 2;
  } else if (confidence < 0.5) {
    urgencyScore -= 1;
  }

  // Adjust based on text analysis urgency
  const textUrgencyBonus = {
    'emergency': 3,
    'urgent': 2,
    'moderate': 1,
    'routine': 0
  };

  urgencyScore += textUrgencyBonus[textAnalysis.urgency] || 0;

  // Severity adjustment
  const severityBonus = {
    'emergency': 4,
    'severe': 3,
    'moderate': 1,
    'mild': 0
  };

  urgencyScore += severityBonus[textAnalysis.severity] || 0;

  return Math.max(1, Math.min(10, urgencyScore));
};

// Determine if specialist referral is needed
const needsSpecialistReferral = (confidence, predictedCondition, urgencyScore, textAnalysis) => {
  const referralCriteria = {
    lowConfidence: confidence < 0.6,
    highUrgency: urgencyScore >= 7,
    seriousCondition: [
      'retinal_detachment',
      'acute_glaucoma',
      'diabetic_retinopathy_severe',
      'central_retinal_artery_occlusion',
      'optic_neuritis'
    ].includes(predictedCondition),
    emergencySymptoms: textAnalysis.urgency === 'emergency',
    severeSymptoms: textAnalysis.severity === 'severe' || textAnalysis.severity === 'emergency'
  };

  // Any of these criteria triggers specialist referral
  return Object.values(referralCriteria).some(criteria => criteria);
};

// Generate recommendations based on confidence and analysis
const generateRecommendations = (confidence, predictedCondition, urgencyScore, textAnalysis) => {
  const recommendations = [];
  const level = getConfidenceLevel(confidence);

  // General recommendations based on confidence level
  if (level === 'very_low' || level === 'low') {
    recommendations.push('Schedule a comprehensive eye examination with an eye care professional');
    recommendations.push('Consider retaking the photo with better lighting and focus');
  }

  if (urgencyScore >= 8) {
    recommendations.push('Seek immediate medical attention - visit emergency room or urgent care');
  } else if (urgencyScore >= 6) {
    recommendations.push('Schedule an urgent appointment with an ophthalmologist within 24-48 hours');
  } else if (urgencyScore >= 4) {
    recommendations.push('Schedule an appointment with an eye care professional within 1-2 weeks');
  }

  // Condition-specific recommendations
  const conditionRecommendations = {
    'diabetic_retinopathy': [
      'Monitor blood sugar levels closely',
      'Follow up with your endocrinologist',
      'Schedule regular dilated eye exams'
    ],
    'glaucoma': [
      'Regular eye pressure monitoring',
      'Follow prescribed eye drop regimen if diagnosed',
      'Inform family members about glaucoma risk'
    ],
    'macular_degeneration': [
      'Use Amsler grid for daily vision monitoring',
      'Consider nutritional supplements (AREDS formula)',
      'Protect eyes from UV light'
    ],
    'cataracts': [
      'Discuss surgical options with ophthalmologist',
      'Use proper lighting for reading and tasks',
      'Update eyeglass prescription regularly'
    ],
    'dry_eye': [
      'Use preservative-free artificial tears',
      'Take frequent breaks from screen time',
      'Consider humidifier in dry environments'
    ]
  };

  if (conditionRecommendations[predictedCondition]) {
    recommendations.push(...conditionRecommendations[predictedCondition]);
  }

  // Lifestyle recommendations
  if (textAnalysis.severity !== 'emergency') {
    recommendations.push('Maintain a healthy diet rich in omega-3 fatty acids and antioxidants');
    recommendations.push('Protect eyes from UV radiation with quality sunglasses');
    recommendations.push('Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds');
  }

  return recommendations;
};

// Calculate model performance metrics
const calculateModelMetrics = (predictions, actualResults) => {
  if (!predictions || !actualResults || predictions.length !== actualResults.length) {
    return null;
  }

  let correct = 0;
  let totalConfidence = 0;
  const confidenceThresholds = [0.5, 0.7, 0.9];
  const thresholdStats = confidenceThresholds.map(threshold => ({
    threshold,
    correct: 0,
    total: 0
  }));

  predictions.forEach((pred, index) => {
    const actual = actualResults[index];
    totalConfidence += pred.confidence;

    if (pred.condition === actual.condition) {
      correct++;
    }

    thresholdStats.forEach(stat => {
      if (pred.confidence >= stat.threshold) {
        stat.total++;
        if (pred.condition === actual.condition) {
          stat.correct++;
        }
      }
    });
  });

  return {
    accuracy: correct / predictions.length,
    averageConfidence: totalConfidence / predictions.length,
    thresholdAccuracy: thresholdStats.map(stat => ({
      threshold: stat.threshold,
      accuracy: stat.total > 0 ? stat.correct / stat.total : 0,
      count: stat.total
    }))
  };
};

module.exports = {
  calculateCombinedConfidence,
  calculateConsistencyScore,
  getConfidenceLevel,
  generateConfidenceExplanation,
  calculateUrgencyScore,
  needsSpecialistReferral,
  generateRecommendations,
  calculateModelMetrics
};