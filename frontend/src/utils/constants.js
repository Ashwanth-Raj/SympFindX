export const APP_NAME = 'SympFindX';
export const APP_DESCRIPTION = 'AI-powered eye disease detection with specialist routing';

export const DISEASE_TYPES = {
  DIABETIC_RETINOPATHY: 'diabetic_retinopathy',
  GLAUCOMA: 'glaucoma',
  MACULAR_DEGENERATION: 'macular_degeneration',
  CATARACT: 'cataract',
  NORMAL: 'normal'
};

export const URGENCY_LEVELS = {
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const URGENCY_COLORS = {
  low: 'text-green-400',
  moderate: 'text-yellow-400',
  high: 'text-orange-400',
  critical: 'text-red-400'
};

export const CONFIDENCE_LEVELS = {
  LOW: { min: 0, max: 50, color: 'text-red-400', label: 'Low Confidence' },
  MODERATE: { min: 51, max: 75, color: 'text-yellow-400', label: 'Moderate Confidence' },
  HIGH: { min: 76, max: 89, color: 'text-blue-400', label: 'High Confidence' },
  VERY_HIGH: { min: 90, max: 100, color: 'text-green-400', label: 'Very High Confidence' }
};

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export const FEATURES = [
  {
    title: 'AI-Powered Detection',
    description: 'Advanced CNN algorithms analyze retinal images to detect eye diseases with high accuracy',
    icon: 'Brain'
  },
  {
    title: 'Symptom Analysis',
    description: 'Natural language processing of symptoms combined with image analysis for comprehensive diagnosis',
    icon: 'FileText'
  },
  {
    title: 'Specialist Routing',
    description: 'Intelligent matching with qualified eye specialists based on detected conditions',
    icon: 'Users'
  },
  {
    title: 'Early Detection',
    description: 'Identify eye diseases in early stages when treatment is most effective',
    icon: 'Eye'
  },
  {
    title: 'Accessible Healthcare',
    description: 'Remote screening capabilities for underserved communities',
    icon: 'Globe'
  },
  {
    title: 'Detailed Reports',
    description: 'Comprehensive analysis reports with recommendations and treatment guidance',
    icon: 'FileText'
  }
];

export const TESTIMONIALS = [
  {
    name: 'Dr. Sarah Johnson',
    role: 'Ophthalmologist',
    message: 'SympFindX has revolutionized early detection in our practice. The accuracy is remarkable.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Patient',
    message: 'Early detection of my diabetic retinopathy through SympFindX saved my vision.',
    rating: 5
  },
  {
    name: 'Dr. Priya Sharma',
    role: 'Retina Specialist',
    message: 'An excellent tool for screening patients. The specialist routing feature is incredibly helpful.',
    rating: 5
  }
];

export const DISEASE_CATEGORIES = [
  {
    name: 'Diabetic Retinopathy',
    description: 'Diabetes-related eye damage',
    prevalence: '40% of diabetics',
    severity: 'High'
  },
  {
    name: 'Glaucoma',
    description: 'Optic nerve damage',
    prevalence: '3% of adults over 40',
    severity: 'High'
  },
  {
    name: 'Macular Degeneration',
    description: 'Central vision loss',
    prevalence: '8.7% of adults over 45',
    severity: 'Moderate to High'
  },
  {
    name: 'Cataract',
    description: 'Lens clouding',
    prevalence: '50% of adults over 65',
    severity: 'Low to Moderate'
  }
];

export const PREVENTION_TIPS = [
  'Schedule regular comprehensive eye exams',
  'Maintain healthy blood sugar levels if diabetic',
  'Protect eyes from UV radiation with sunglasses',
  'Eat a diet rich in omega-3 fatty acids and antioxidants',
  'Don\'t smoke and limit alcohol consumption',
  'Exercise regularly to maintain good circulation',
  'Take frequent breaks from computer screens',
  'Keep blood pressure and cholesterol in check'
];

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  DIAGNOSIS: '/diagnosis',
  ABOUT: '/about',
  CONTACT: '/contact',
  REPORTS: '/reports'
};