const express = require('express');
const { body, query } = require('express-validator');
const {
  getReports,
  getReport,
  shareReport,
  updateReport,
  downloadReport,
  getSharedReport
} = require('../controllers/reportController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Query validations
const reportsQueryValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('status').optional().isIn(['draft','pending_review','completed','archived']),
  query('priority').optional().isIn(['low','normal','high','urgent']),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601(),
];

// Share validations
const shareReportValidation = [
  body('shareWith').optional().isArray(),
  body('shareWith.*.email').optional().isEmail(),
  body('shareWith.*.permissions').optional().isIn(['view','edit','full']),
  body('generatePublicLink').optional().isBoolean(),
  body('publicLinkExpiry').optional().isISO8601(),
  body('message').optional().trim().isLength({ max:500 }),
];

// Update validations
const updateReportValidation = [
  body('title').optional().trim().isLength({ min:5, max:200 }),
  body('summary').optional().trim().isLength({ min:50, max:2000 }),
  body('findings').optional().isArray(),
  body('recommendations').optional().isObject(),
  body('status').optional().isIn(['draft','pending_review','completed','archived']),
  body('priority').optional().isIn(['low','normal','high','urgent']),
];

// Routes
router.get('/', protect, reportsQueryValidation, getReports);
router.get('/:id', protect, getReport);
router.post('/:id/share', protect, shareReportValidation, shareReport);
router.put('/:id', protect, authorize('specialist','admin'), updateReportValidation, updateReport);
router.get('/:id/download', protect, downloadReport);

// Public route for shared reports
router.get('/shared/:token', optionalAuth, getSharedReport);

module.exports = router;
