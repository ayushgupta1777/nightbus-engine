// ==================== routes/buses.js ====================
const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');
const auth = require('../middleware/auth');

// Public routes
/**
 * @swagger
 * /api/buses:
 *   get:
 *     summary: GET /api/buses
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/', busController.getAllBuses);
/**
 * @swagger
 * /api/buses/{id}:
 *   get:
 *     summary: GET /api/buses/{id}
 *     tags: [Buses]
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
router.get('/:id', busController.getBusById);
/**
 * @swagger
 * /api/buses/{id}/seats:
 *   get:
 *     summary: GET /api/buses/{id}/seats
 *     tags: [Buses]
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
router.get('/:id/seats', busController.getBusSeats);

// Protected routes - require owner role
/**
 * @swagger
 * /api/buses:
 *   post:
 *     summary: POST /api/buses
 *     tags: [Buses]
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
router.post('/', auth.verifyToken, auth.checkRole('owner'), busController.createBus);
/**
 * @swagger
 * /api/buses/{id}:
 *   put:
 *     summary: PUT /api/buses/{id}
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
router.put('/:id', auth.verifyToken, auth.checkRole('owner'), busController.updateBus);
/**
 * @swagger
 * /api/buses/{id}:
 *   delete:
 *     summary: DELETE /api/buses/{id}
 *     tags: [Buses]
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
router.delete('/:id', auth.verifyToken, auth.checkRole('owner'), busController.deleteBus);
/**
 * @swagger
 * /api/buses/{id}/availability:
 *   post:
 *     summary: POST /api/buses/{id}/availability
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
router.post('/:id/availability', auth.verifyToken, auth.checkRole('owner'), busController.updateAvailability);

module.exports = router;
