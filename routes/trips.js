const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const auth = require('../middleware/auth'); // Optionally use this

// Trip Management endpoints 
/**
 * @swagger
 * /api/trips/active:
 *   get:
 *     summary: GET /api/trips/active
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/active', tripController.getActiveTrip);
/**
 * @swagger
 * /api/trips/start:
 *   post:
 *     summary: POST /api/trips/start
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/start', tripController.startTrip);
/**
 * @swagger
 * /api/trips/manual-override:
 *   post:
 *     summary: POST /api/trips/manual-override
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/manual-override', tripController.manualOverrideStop);
/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: GET /api/trips
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/', auth.verifyToken, tripController.getTimeline);

module.exports = router;
