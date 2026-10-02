// ==================== routes/payment.js ====================
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth'); // Assuming this exists for auth

// Create a new Razorpay order
/**
 * @swagger
 * /api/payment/create-order:
 *   post:
 *     summary: POST /api/payment/create-order
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/create-order', protect, paymentController.createOrder);

// Verify payment from client
/**
 * @swagger
 * /api/payment/verify:
 *   post:
 *     summary: POST /api/payment/verify
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/verify', protect, paymentController.verifyPayment);

// Razorpay Webhook (No JWT protect, verified by signature)
/**
 * @swagger
 * /api/payment/webhook:
 *   post:
 *     summary: POST /api/payment/webhook
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
