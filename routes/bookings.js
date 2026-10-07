// ==================== routes/bookings.js ====================
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Middleware to handle status vs ID routing
const statusOrIdRouter = (req, res, next) => {
  const { id } = req.params;
  const validStatuses = ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'];
  
  // Check if it's a valid MongoDB ObjectId
  if (mongoose.Types.ObjectId.isValid(id)) {
    // It's an ID, proceed to getBookingDetails
    return bookingController.getBookingDetails(req, res);
  } else if (validStatuses.includes(id)) {
    // It's a status, treat it as such
    req.params.status = id;
    return bookingController.getBookingsByStatus(req, res);
  } else {
    // Invalid format
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid booking ID or status' 
    });
  }
};

// Protected routes
/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: POST /api/bookings
 *     tags: [Bookings]
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
router.post('/', auth.verifyToken, bookingController.createBooking);
/**
 * @swagger
 * /api/bookings/lock-seats:
 *   post:
 *     summary: POST /api/bookings/lock-seats
 *     tags: [Bookings]
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
router.post('/lock-seats', auth.verifyToken, bookingController.lockSeats);
/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: GET /api/bookings/{id}
 *     tags: [Bookings]
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
router.get('/:id', auth.verifyToken, statusOrIdRouter);
/**
 * @swagger
 * /api/bookings/user/{userId}:
 *   get:
 *     summary: GET /api/bookings/user/{userId}
 *     tags: [Bookings]
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
router.get('/user/:userId', auth.verifyToken, bookingController.getUserBookings);
/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   put:
 *     summary: PUT /api/bookings/{id}/cancel
 *     tags: [Bookings]
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
router.put('/:id/cancel', auth.verifyToken, bookingController.cancelBooking);
/**
 * @swagger
 * /api/bookings/{id}/qr-code:
 *   get:
 *     summary: GET /api/bookings/{id}/qr-code
 *     tags: [Bookings]
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
router.get('/:id/qr-code', auth.verifyToken, bookingController.getQRCode);
/**
 * @swagger
 * /api/bookings/{id}/panic:
 *   post:
 *     summary: POST /api/bookings/{id}/panic
 *     tags: [Bookings]
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
router.post('/:id/panic', auth.verifyToken, bookingController.triggerPanic);

module.exports = router;
