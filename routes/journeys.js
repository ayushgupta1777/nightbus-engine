// ==================== routes/journeys.js ====================
const express = require('express');
const router = express.Router();
const journeyController = require('../controllers/journeyController');
const auth = require('../middleware/auth');

// Public routes
/**
 * @swagger
 * /api/journeys/search:
 *   post:
 *     summary: POST /api/journeys/search
 *     tags: [Journeys]
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
router.post('/search', journeyController.searchJourneys);
/**
 * @swagger
 * /api/journeys/calculate-price:
 *   post:
 *     summary: POST /api/journeys/calculate-price
 *     tags: [Journeys]
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
router.post('/calculate-price', journeyController.calculatePrice);
/**
 * @swagger
 * /api/journeys/booked-seats:
 *   post:
 *     summary: POST /api/journeys/booked-seats
 *     tags: [Journeys]
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
router.post('/booked-seats', journeyController.getBookedSeats);
/**
 * @swagger
 * /api/journeys/recommendations:
 *   post:
 *     summary: POST /api/journeys/recommendations
 *     tags: [Journeys]
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
router.post('/recommendations', journeyController.getRecommendations);

// Protected routes
/**
 * @swagger
 * /api/journeys/{id}:
 *   get:
 *     summary: GET /api/journeys/{id}
 *     tags: [Journeys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/:id', auth.verifyToken, journeyController.getJourneyById);
/**
 * @swagger
 * /api/journeys/user/{userId}:
 *   get:
 *     summary: GET /api/journeys/user/{userId}
 *     tags: [Journeys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/user/:userId', auth.verifyToken, journeyController.getUserJourneys);

module.exports = router;