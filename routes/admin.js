// ==================== routes/admin.js ====================
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Protected routes - admin only
router.use(auth.verifyToken, auth.checkRole('admin'));

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: GET /api/admin/users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/users', adminController.getAllUsers);
/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: GET /api/admin/users/{id}
 *     tags: [Admin]
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
router.get('/users/:id', adminController.getUserDetails);
/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: PUT /api/admin/users/{id}
 *     tags: [Admin]
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
router.put('/users/:id', adminController.updateUser);
/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: DELETE /api/admin/users/{id}
 *     tags: [Admin]
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
router.delete('/users/:id', adminController.deleteUser);

/**
 * @swagger
 * /api/admin/bookings:
 *   get:
 *     summary: GET /api/admin/bookings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/bookings', adminController.getAllBookings);
/**
 * @swagger
 * /api/admin/bookings/{id}:
 *   get:
 *     summary: GET /api/admin/bookings/{id}
 *     tags: [Admin]
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
router.get('/bookings/:id', adminController.getBookingDetails);

/**
 * @swagger
 * /api/admin/buses:
 *   get:
 *     summary: GET /api/admin/buses
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/buses', adminController.getAllBuses);
/**
 * @swagger
 * /api/admin/routes:
 *   get:
 *     summary: GET /api/admin/routes
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/routes', adminController.getAllRoutes);

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: GET /api/admin/analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/analytics', adminController.getAnalytics);
/**
 * @swagger
 * /api/admin/transactions:
 *   get:
 *     summary: GET /api/admin/transactions
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/transactions', adminController.getTransactions);
/**
 * @swagger
 * /api/admin/platform-stats:
 *   get:
 *     summary: GET /api/admin/platform-stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/platform-stats', adminController.getPlatformStats);

/**
 * @swagger
 * /api/admin/verify-vendor/{vendorId}:
 *   post:
 *     summary: POST /api/admin/verify-vendor/{vendorId}
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
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
router.post('/verify-vendor/:vendorId', adminController.verifyVendor);
/**
 * @swagger
 * /api/admin/verify-owner/{ownerId}:
 *   post:
 *     summary: POST /api/admin/verify-owner/{ownerId}
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ownerId
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
router.post('/verify-owner/:ownerId', adminController.verifyOwner);

// New Production-Ready Admin Routes
/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   patch:
 *     summary: PATCH /api/admin/users/{id}/status
 *     tags: [Admin]
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
router.patch('/users/:id/status', adminController.updateUserStatus); // block/unblock
/**
 * @swagger
 * /api/admin/providers/{providerId}/approval:
 *   patch:
 *     summary: PATCH /api/admin/providers/{providerId}/approval
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
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
router.patch('/providers/:providerId/approval', adminController.updateProviderApproval);

// Categories
/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: GET /api/admin/categories
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/categories', adminController.getAllCategories);
/**
 * @swagger
 * /api/admin/categories:
 *   post:
 *     summary: POST /api/admin/categories
 *     tags: [Admin]
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
router.post('/categories', adminController.addCategory);
/**
 * @swagger
 * /api/admin/categories/{id}:
 *   delete:
 *     summary: DELETE /api/admin/categories/{id}
 *     tags: [Admin]
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
router.delete('/categories/:id', adminController.deleteCategory);

// ==================== GLOBAL COMMUNICATION ====================
/**
 * @swagger
 * /api/admin/broadcast:
 *   post:
 *     summary: POST /api/admin/broadcast
 *     tags: [Admin]
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
router.post('/broadcast', adminController.sendGlobalBroadcast);
/**
 * @swagger
 * /api/admin/announcements:
 *   get:
 *     summary: GET /api/admin/announcements
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/announcements', adminController.getGlobalAnnouncements);

// ==================== DEPARTMENT OVERSIGHT ====================
// Finance
/**
 * @swagger
 * /api/admin/settlements/all:
 *   get:
 *     summary: GET /api/admin/settlements/all
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/settlements/all', adminController.getAllSettlements);
/**
 * @swagger
 * /api/admin/settlements/{id}/status:
 *   patch:
 *     summary: PATCH /api/admin/settlements/{id}/status
 *     tags: [Admin]
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
router.patch('/settlements/:id/status', adminController.updateSettlementStatus);

// Marketplace
/**
 * @swagger
 * /api/admin/marketplace/products:
 *   get:
 *     summary: GET /api/admin/marketplace/products
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/marketplace/products', adminController.getAllProducts);
/**
 * @swagger
 * /api/admin/marketplace/products/{productId}/status:
 *   patch:
 *     summary: PATCH /api/admin/marketplace/products/{productId}/status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
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
router.patch('/marketplace/products/:productId/status', adminController.toggleProductStatus);

// Food
/**
 * @swagger
 * /api/admin/food/stats:
 *   get:
 *     summary: GET /api/admin/food/stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/food/stats', adminController.getGlobalFoodStats);

module.exports = router;

