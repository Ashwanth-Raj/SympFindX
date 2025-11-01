// Text preprocessing utilities for symptom analysis

// Common eye disease related keywords
const EYE_DISEASE_KEYWORDS = {
  diabetic_retinopathy: [
    'blurred vision', 'floaters', 'dark spots', 'vision loss', 'difficulty seeing at night',
    'fluctuating vision', 'empty areas in vision', 'diabetes', 'diabetic', 'blood sugar'
  ],
  glaucoma: [
    'peripheral vision loss', 'tunnel vision', 'eye pain', 'headache', 'nausea',
    'halos around lights', 'eye pressure', 'gradual vision loss', 'blind spots'
  ],
  macular_degeneration: [
    'central vision loss', 'straight lines appear wavy', 'difficulty reading',
    'blurred central vision', 'color perception changes', 'age related', 'elderly'
  ],
  cataracts: [
    'cloudy vision', 'glare sensitivity', 'double vision', 'difficulty night driving',
    'colors appear faded', 'frequent prescription changes', 'halos around lights'
  ],
  conjunctivitis: [
    'red eyes', 'itchy eyes', 'watery eyes', 'discharge', 'pink eye',
    'burning sensation', 'foreign body sensation', 'swollen eyelids'
  ],
  dry_eye: [
    'dry eyes', 'scratchy feeling', 'burning eyes', 'excessive tearing',
    'tired eyes', 'difficulty wearing contact lenses', 'light sensitivity'
  ]
};

// Severity indicators
const SEVERITY_INDICATORS = {
  mild: ['slight', 'minor', 'little', 'occasional', 'sometimes', 'mild'],
  moderate: ['noticeable', 'frequent', 'regular', 'moderate', 'getting worse'],
  severe: ['severe', 'intense', 'constant', 'very', 'extreme', 'unbearable', 'significant'],
  emergency: ['sudden', 'acute', 'immediate', 'emergency', 'urgent', 'rapid', 'dramatic']
};

// Duration indicators
const DURATION_INDICATORS = {
  acute: ['sudden', 'today', 'yesterday', 'hours', 'just started'],
  subacute: ['few days', 'this week', 'recently', 'past week'],
  chronic: ['weeks', 'months', 'years', 'long time', 'chronic', 'ongoing']
};

// Clean and normalize text
const cleanText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\b\d+\b/g, '') // Remove standalone numbers
    .trim();
};

// Extract keywords from text
const extractKeywords = (text) => {
  const cleanedText = cleanText(text);
  const words = cleanedText.split(' ').filter(word => word.length > 2);
  
  // Remove common stop words
  const stopWords = [
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
    'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
    'how', 'its', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did',
    'have', 'been', 'from', 'they', 'know', 'want', 'been', 'good', 'much',
    'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long',
    'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'
  ];

  return words.filter(word => !stopWords.includes(word));
};

// Analyze symptom text for disease indicators
const analyzeSymptoms = (symptomText) => {
  const cleanedText = cleanText(symptomText);
  const analysis = {
    detectedConditions: [],
    severity: 'unknown',
    duration: 'unknown',
    urgency: 'routine',
    keywords: [],
    confidence: 0
  };

  // Extract keywords
  analysis.keywords = extractKeywords(cleanedText);

  // Check for disease-specific keywords
  Object.keys(EYE_DISEASE_KEYWORDS).forEach(disease => {
    const keywords = EYE_DISEASE_KEYWORDS[disease];
    const matches = keywords.filter(keyword => 
      cleanedText.includes(keyword.toLowerCase())
    );

    if (matches.length > 0) {
      const confidence = (matches.length / keywords.length) * 100;
      analysis.detectedConditions.push({
        condition: disease,
        matchedKeywords: matches,
        confidence: Math.round(confidence)
      });
    }
  });

  // Determine severity
  Object.keys(SEVERITY_INDICATORS).forEach(level => {
    const indicators = SEVERITY_INDICATORS[level];
    if (indicators.some(indicator => cleanedText.includes(indicator))) {
      analysis.severity = level;
    }
  });

  // Determine duration
  Object.keys(DURATION_INDICATORS).forEach(duration => {
    const indicators = DURATION_INDICATORS[duration];
    if (indicators.some(indicator => cleanedText.includes(indicator))) {
      analysis.duration = duration;
    }
  });

  // Determine urgency
  if (analysis.severity === 'emergency' || analysis.duration === 'acute') {
    analysis.urgency = 'emergency';
  } else if (analysis.severity === 'severe') {
    analysis.urgency = 'urgent';
  } else if (analysis.severity === 'moderate') {
    analysis.urgency = 'moderate';
  }

  // Calculate overall confidence
  if (analysis.detectedConditions.length > 0) {
    analysis.confidence = Math.round(
      analysis.detectedConditions.reduce((sum, condition) => 
        sum + condition.confidence, 0
      ) / analysis.detectedConditions.length
    );
  }

  // Sort conditions by confidence
  analysis.detectedConditions.sort((a, b) => b.confidence - a.confidence);

  return analysis;
};

// Generate TF-IDF features for ML model
const generateTFIDF = (documents, query) => {
  // Simple TF-IDF implementation
  const vocabulary = new Set();
  
  // Build vocabulary
  documents.concat([query]).forEach(doc => {
    const words = extractKeywords(doc);
    words.forEach(word => vocabulary.add(word));
  });

  const vocabArray = Array.from(vocabulary);
  
  // Calculate TF-IDF for query
  const queryWords = extractKeywords(query);
  const queryTF = {};
  
  // Term frequency
  queryWords.forEach(word => {
    queryTF[word] = (queryTF[word] || 0) + 1;
  });

  // Convert to relative frequencies
  Object.keys(queryTF).forEach(word => {
    queryTF[word] = queryTF[word] / queryWords.length;
  });

  // Calculate IDF
  const idf = {};
  vocabArray.forEach(word => {
    const docCount = documents.filter(doc => 
      extractKeywords(doc).includes(word)
    ).length;
    
    idf[word] = Math.log(documents.length / (docCount || 1));
  });

  // Generate TF-IDF vector
  const vector = vocabArray.map(word => {
    const tf = queryTF[word] || 0;
    return tf * (idf[word] || 0);
  });

  return {
    vector,
    vocabulary: vocabArray,
    length: Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
  };
};

// Prepare text data for ML model
const prepareTextForML = (symptomText, additionalInfo = {}) => {
  const analysis = analyzeSymptoms(symptomText);
  
  return {
    cleanedText: cleanText(symptomText),
    keywords: analysis.keywords,
    detectedConditions: analysis.detectedConditions,
    severity: analysis.severity,
    duration: analysis.duration,
    urgency: analysis.urgency,
    confidence: analysis.confidence,
    additionalInfo,
    // Features for ML model
    features: {
      textLength: symptomText.length,
      wordCount: analysis.keywords.length,
      severityScore: getSeverityScore(analysis.severity),
      durationScore: getDurationScore(analysis.duration),
      urgencyScore: getUrgencyScore(analysis.urgency)
    }
  };
};

// Convert categorical values to numerical scores
const getSeverityScore = (severity) => {
  const scores = { unknown: 0, mild: 1, moderate: 2, severe: 3, emergency: 4 };
  return scores[severity] || 0;
};

const getDurationScore = (duration) => {
  const scores = { unknown: 0, acute: 1, subacute: 2, chronic: 3 };
  return scores[duration] || 0;
};

const getUrgencyScore = (urgency) => {
  const scores = { routine: 1, moderate: 2, urgent: 3, emergency: 4 };
  return scores[urgency] || 1;
};

// Validate symptom text
const validateSymptomText = (text) => {
  const validation = {
    isValid: true,
    issues: [],
    suggestions: []
  };

  if (!text || typeof text !== 'string') {
    validation.isValid = false;
    validation.issues.push('Symptom description is required');
    return validation;
  }

  const cleanedText = cleanText(text);

  if (cleanedText.length < 10) {
    validation.isValid = false;
    validation.issues.push('Symptom description is too short (minimum 10 characters)');
  }

  if (cleanedText.length > 1000) {
    validation.isValid = false;
    validation.issues.push('Symptom description is too long (maximum 1000 characters)');
  }

  const keywords = extractKeywords(cleanedText);
  if (keywords.length < 3) {
    validation.suggestions.push('Try to provide more specific details about your symptoms');
  }

  // Check for eye-related content
  const eyeKeywords = ['eye', 'vision', 'sight', 'see', 'look', 'visual', 'ocular'];
  const hasEyeContent = eyeKeywords.some(keyword => cleanedText.includes(keyword));
  
  if (!hasEyeContent) {
    validation.suggestions.push('Please focus on eye-related symptoms for accurate analysis');
  }

  return validation;
};

// Generate symptom summary
const generateSymptomSummary = (symptomData) => {
  const analysis = analyzeSymptoms(symptomData.description);
  
  let summary = `Patient reports: ${symptomData.description.substring(0, 100)}...`;
  
  if (analysis.detectedConditions.length > 0) {
    const topCondition = analysis.detectedConditions[0];
    summary += ` Symptoms suggest possible ${topCondition.condition.replace('_', ' ')} (confidence: ${topCondition.confidence}%).`;
  }

  if (analysis.severity !== 'unknown') {
    summary += ` Severity: ${analysis.severity}.`;
  }

  if (analysis.duration !== 'unknown') {
    summary += ` Duration: ${analysis.duration}.`;
  }

  if (analysis.urgency !== 'routine') {
    summary += ` Urgency level: ${analysis.urgency}.`;
  }

  return summary;
};

module.exports = {
  cleanText,
  extractKeywords,
  analyzeSymptoms,
  generateTFIDF,
  prepareTextForML,
  validateSymptomText,
  generateSymptomSummary,
  EYE_DISEASE_KEYWORDS,
  SEVERITY_INDICATORS,
  DURATION_INDICATORS
};