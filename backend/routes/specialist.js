const express = require('express');
const { body, query } = require('express-validator');
const {
  getAvailableSpecialists,
  assignSpecialistToCase,
  getSpecialistCases,
  submitSpecialistReview,
  updateSpecialistProfile,
  getSpecialistStats,
  toggleAvailability,
} = require('../controllers/specialistController');
const { protect, authorize, verifySpecialist } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const assignSpecialistValidation = [
  body('predictionId')
    .isMongoId()
    .withMessage('Valid prediction ID is required'),
  body('specialistId')
    .optional()
    .isMongoId()
    .withMessage('Valid specialist ID is required'),
  body('urgency')
    .optional()
    .isIn(['routine', 'urgent', 'emergency'])
    .withMessage('Urgency must be routine, urgent, or emergency'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

const reviewValidation = [
  body('predictionId')
    .isMongoId()
    .withMessage('Valid prediction ID is required'),
  body('review')
    .notEmpty()
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Review must be between 50 and 2000 characters'),
  body('modifiedDiagnosis')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Modified diagnosis must be between 2 and 100 characters'),
  body('confidence')
    .isFloat({ min: 0, max: 1 })
    .withMessage('Confidence must be between 0 and 1'),
  body('recommendedActions')
    .optional()
    .isArray()
    .withMessage('Recommended actions must be an array'),
  body('followUpRequired')
    .optional()
    .isBoolean()
    .withMessage('Follow up required must be boolean'),
  body('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Follow up date must be a valid date'),
];

const specialistProfileValidation = [
  body('qualifications')
    .optional()
    .isArray()
    .withMessage('Qualifications must be an array'),
  body('clinicName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Clinic name must be between 2 and 100 characters'),
  body('consultationFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a positive number'),
  body('workingHours')
    .optional()
    .isArray()
    .withMessage('Working hours must be an array'),
  body('maxPatientsPerDay')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Max patients per day must be between 1 and 100'),
];

const casesQueryValidation = [
  query('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status filter'),
  query('urgency')
    .optional()
    .isIn(['routine', 'urgent', 'emergency'])
    .withMessage('Invalid urgency filter'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];

const availableSpecialistsValidation = [
  query('specialization')
    .optional()
    .isIn(['ophthalmologist', 'optometrist', 'retinal_specialist', 'glaucoma_specialist'])
    .withMessage('Invalid specialization'),
  query('urgency')
    .optional()
    .isIn(['routine', 'urgent', 'emergency'])
    .withMessage('Invalid urgency level'),
  query('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
];

// Public routes (for finding specialists)
router.get(
  '/available',
  availableSpecialistsValidation,
  getAvailableSpecialists
);

// Patient routes (protected)
router.post(
  '/assign',
  protect,
  authorize('patient', 'admin'),
  assignSpecialistValidation,
  assignSpecialistToCase
);

// Specialist routes (protected + verified specialist)
router.get(
  '/cases',
  protect,
  verifySpecialist,
  casesQueryValidation,
  getSpecialistCases
);

router.post(
  '/review',
  protect,
  verifySpecialist,
  reviewValidation,
  submitSpecialistReview
);

router.put(
  '/profile',
  protect,
  verifySpecialist,
  specialistProfileValidation,
  updateSpecialistProfile
);

router.get(
  '/stats',
  protect,
  verifySpecialist,
  getSpecialistStats
);

router.put(
  '/availability',
  protect,
  verifySpecialist,
  toggleAvailability
);

module.exports = router;