// ==================== routes/staffRoutes.js ====================
const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { verifyToken, checkRole } = require('../middleware/auth');

// All staff routes require authentication and staff role
router.use(verifyToken);
router.use(checkRole(['staff']));

// Operational Routes
/**
 * @swagger
 * /api/staff/active-trip:
 *   get:
 *     summary: GET /api/staff/active-trip
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/active-trip', staffController.getActiveTrip);
/**
 * @swagger
 * /api/staff/trip/{tripId}/manifest:
 *   get:
 *     summary: GET /api/staff/trip/{tripId}/manifest
 *     tags: [Staff]
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
router.get('/trip/:tripId/manifest', staffController.getPassengerManifest);
/**
 * @swagger
 * /api/staff/active-incidents:
 *   get:
 *     summary: GET /api/staff/active-incidents
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/active-incidents', staffController.getActiveIncidents);

/**
 * @swagger
 * /api/staff/verify-boarding:
 *   post:
 *     summary: POST /api/staff/verify-boarding
 *     tags: [Staff]
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
router.post('/verify-boarding', staffController.verifyBoarding);
/**
 * @swagger
 * /api/staff/verify-drop:
 *   post:
 *     summary: POST /api/staff/verify-drop
 *     tags: [Staff]
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
router.post('/verify-drop', staffController.verifyDrop);
/**
 * @swagger
 * /api/staff/update-position:
 *   post:
 *     summary: POST /api/staff/update-position
 *     tags: [Staff]
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
router.post('/update-position', staffController.updatePosition);
/**
 * @swagger
 * /api/staff/trip-status:
 *   post:
 *     summary: POST /api/staff/trip-status
 *     tags: [Staff]
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
router.post('/trip-status', staffController.updateTripStatus);

module.exports = router;