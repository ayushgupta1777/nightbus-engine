// ==================== routes/vendors.js ====================
const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const auth = require('../middleware/auth');

// Public routes
/**
 * @swagger
 * /api/vendors:
 *   get:
 *     summary: GET /api/vendors
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/', vendorController.getAllVendors);
/**
 * @swagger
 * /api/vendors/{id}:
 *   get:
 *     summary: GET /api/vendors/{id}
 *     tags: [Vendors]
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
router.get('/:id', vendorController.getVendorById);

// Protected routes - require vendor role
/**
 * @swagger
 * /api/vendors/profile:
 *   get:
 *     summary: GET /api/vendors/profile
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/profile', auth.verifyToken, auth.checkRole('vendor'), vendorController.getVendorProfile);
/**
 * @swagger
 * /api/vendors/profile:
 *   put:
 *     summary: PUT /api/vendors/profile
 *     tags: [Vendors]
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
router.put('/profile', auth.verifyToken, auth.checkRole('vendor'), vendorController.updateVendorProfile);
/**
 * @swagger
 * /api/vendors/analytics/{vendorId}:
 *   get:
 *     summary: GET /api/vendors/analytics/{vendorId}
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/analytics/:vendorId', auth.verifyToken, auth.checkRole('vendor'), vendorController.getAnalytics);
/**
 * @swagger
 * /api/vendors/orders/{vendorId}:
 *   get:
 *     summary: GET /api/vendors/orders/{vendorId}
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/orders/:vendorId', auth.verifyToken, auth.checkRole('vendor'), vendorController.getVendorOrders);
/**
 * @swagger
 * /api/vendors/orders/{id}:
 *   put:
 *     summary: PUT /api/vendors/orders/{id}
 *     tags: [Vendors]
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
router.put('/orders/:id', auth.verifyToken, auth.checkRole('vendor'), vendorController.updateVendorOrderStatus);
/**
 * @swagger
 * /api/vendors/items/{vendorId}:
 *   get:
 *     summary: GET /api/vendors/items/{vendorId}
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/items/:vendorId', auth.verifyToken, auth.checkRole('vendor'), vendorController.getVendorItems);
/**
 * @swagger
 * /api/vendors/items:
 *   post:
 *     summary: POST /api/vendors/items
 *     tags: [Vendors]
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
router.post('/items', auth.verifyToken, auth.checkRole('vendor'), vendorController.addVendorItem);

module.exports = router;
