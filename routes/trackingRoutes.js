const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetryController');
const trackingController = require('../controllers/trackingController');
const auth = require('../middleware/auth');

// Public telemetry tracking (existing logic)
/**
 * @swagger
 * /api/tracking/telemetry/{busId}:
 *   get:
 *     summary: GET /api/tracking/telemetry/{busId}
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: busId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/telemetry/:busId', telemetryController.getBusStatus);

// New advanced GPS tracking 
/**
 * @swagger
 * /api/tracking/update-location:
 *   post:
 *     summary: POST /api/tracking/update-location
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/update-location', trackingController.updateLocation); // Device hits this endpoint
/**
 * @swagger
 * /api/tracking/bus/{busId}:
 *   get:
 *     summary: GET /api/tracking/bus/{busId}
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: busId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/bus/:busId', trackingController.getBusLocation); // Frontend retrieves live bus context
/**
 * @swagger
 * /api/tracking/trip-state/{tripId}:
 *   get:
 *     summary: GET /api/tracking/trip-state/{tripId}
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/trip-state/:tripId', trackingController.getTripState); // WebSockets reconnection payload

module.exports = router;
