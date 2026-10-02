// ==================== routes/serviceBookings.js ====================
const express = require('express');
const router = express.Router();
const serviceBookingController = require('../controllers/serviceBookingController');
const auth = require('../middleware/auth');

// Protected routes
/**
 * @swagger
 * /api/service-bookings:
 *   post:
 *     summary: POST /api/service-bookings
 *     tags: [Service-bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/', auth.verifyToken, serviceBookingController.createServiceBooking);
/**
 * @swagger
 * /api/service-bookings/{id}:
 *   get:
 *     summary: GET /api/service-bookings/{id}
 *     tags: [Service-bookings]
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
router.get('/:id', auth.verifyToken, serviceBookingController.getServiceBookingById);
/**
 * @swagger
 * /api/service-bookings/customer/{customerId}:
 *   get:
 *     summary: GET /api/service-bookings/customer/{customerId}
 *     tags: [Service-bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/customer/:customerId', auth.verifyToken, serviceBookingController.getCustomerServiceBookings);
/**
 * @swagger
 * /api/service-bookings/{id}/cancel:
 *   put:
 *     summary: PUT /api/service-bookings/{id}/cancel
 *     tags: [Service-bookings]
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
router.put('/:id/cancel', auth.verifyToken, serviceBookingController.cancelServiceBooking);
/**
 * @swagger
 * /api/service-bookings/{id}/complete:
 *   put:
 *     summary: PUT /api/service-bookings/{id}/complete
 *     tags: [Service-bookings]
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
router.put('/:id/complete', auth.verifyToken, auth.checkRole('vendor'), serviceBookingController.completeServiceBooking);

module.exports = router;
