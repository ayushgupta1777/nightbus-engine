// ==================== routes/realtime.js ====================
const express = require('express');
const router = express.Router();
const realtimeController = require('../controllers/realtimeController');
const auth = require('../middleware/auth');

// Real-time notification endpoints
/**
 * @swagger
 * /api/realtime/booking-confirmed:
 *   post:
 *     summary: POST /api/realtime/booking-confirmed
 *     tags: [Realtime]
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
router.post('/booking-confirmed', auth.verifyToken, realtimeController.notifyBookingConfirmed);
/**
 * @swagger
 * /api/realtime/bus-location:
 *   post:
 *     summary: POST /api/realtime/bus-location
 *     tags: [Realtime]
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
router.post('/bus-location', auth.verifyToken, auth.checkRole('owner'), realtimeController.notifyBusLocationUpdate);
/**
 * @swagger
 * /api/realtime/notification:
 *   post:
 *     summary: POST /api/realtime/notification
 *     tags: [Realtime]
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
router.post('/notification', auth.verifyToken, realtimeController.sendRealTimeNotification);

module.exports = router;
