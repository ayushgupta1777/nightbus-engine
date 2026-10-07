// ==================== routes/reviewRoutes.js ====================
const express = require('express');
const router = express.Router();
const { submitReview, getProviderRating } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: POST /api/reviews
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/', submitReview);
/**
 * @swagger
 * /api/reviews/provider/{providerId}:
 *   get:
 *     summary: GET /api/reviews/provider/{providerId}
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/provider/:providerId', getProviderRating);

module.exports = router;
