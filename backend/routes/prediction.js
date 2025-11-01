const express = require('express');
const { body } = require('express-validator');
const {
analyzePrediction,
getPredictionHistory,
getPrediction,
deletePrediction,
getPredictionAnalytics,
} = require('../controllers/predictionController');
const { protect } = require('../middleware/auth');

const {
uploadSingleImage,
validateImageSpecs,
preprocessImage,
securityCheck,
} = require('../middleware/upload');

const router = express.Router();

router.post(
'/analyze',
protect,
uploadSingleImage('image'),
securityCheck(),
validateImageSpecs({
minWidth: 100,
minHeight: 100,
maxWidth: 4000,
maxHeight: 4000,
aspectRatioRange: [0.5, 2.0],
}),
preprocessImage(), // sets req.file.processed.buffer (224x224)
[
body('symptoms').optional().isString().trim(),
body('image_type')
.optional()
.isIn(['fundus', 'outer_eye'])
.withMessage('Invalid image type. Use "fundus" or "outer_eye".'),
],
analyzePrediction
);

router.get('/history', protect, getPredictionHistory);
router.get('/analytics', protect, getPredictionAnalytics);
router.get('/:id', protect, getPrediction);
router.delete('/:id', protect, deletePrediction);

module.exports = router;