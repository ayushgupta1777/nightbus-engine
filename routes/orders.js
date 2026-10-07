// ==================== routes/orders.js ====================
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

// Protected routes
/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: POST /api/orders
 *     tags: [Orders]
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
router.post('/', auth.verifyToken, orderController.createOrder);
/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: GET /api/orders/{id}
 *     tags: [Orders]
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
router.get('/:id', auth.verifyToken, orderController.getOrderById);
/**
 * @swagger
 * /api/orders/customer/{customerId}:
 *   get:
 *     summary: GET /api/orders/customer/{customerId}
 *     tags: [Orders]
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
router.get('/customer/:customerId', auth.verifyToken, orderController.getCustomerOrders);
/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: PUT /api/orders/{id}
 *     tags: [Orders]
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
router.put('/:id', auth.verifyToken, orderController.updateOrder);
/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   put:
 *     summary: PUT /api/orders/{id}/cancel
 *     tags: [Orders]
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
router.put('/:id/cancel', auth.verifyToken, orderController.cancelOrder);

module.exports = router;
