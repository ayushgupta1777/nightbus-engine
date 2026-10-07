// ==================== routes/foodRoutes.js ====================
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/food');
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'food-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const { 
  getVendors,
  createOrder,
  getUserOrders,
  getFoodOrderDetails,
  updateOrderStatus,
  cancelOrderUser,
  addVendorItem,
  getVendorOrders,
  registerFoodVendor,
  updateFoodVendorProfile,
  getFoodVendorProfile,
  toggleFoodVendorStatus,
  getVendorItems,
  updateVendorItem,
  deleteVendorItem,
  uploadFoodImages,
  getVendorDashboardStats
} = require('../controllers/foodController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Customer endpoints
/**
 * @swagger
 * /api/food/vendors:
 *   get:
 *     summary: GET /api/food/vendors
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/vendors', getVendors);
/**
 * @swagger
 * /api/food/orders:
 *   post:
 *     summary: POST /api/food/orders
 *     tags: [Food]
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
router.post('/orders', createOrder);
/**
 * @swagger
 * /api/food/orders/my:
 *   get:
 *     summary: GET /api/food/orders/my
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/orders/my', getUserOrders);
/**
 * @swagger
 * /api/food/orders/{id}:
 *   get:
 *     summary: GET /api/food/orders/{id}
 *     tags: [Food]
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
router.get('/orders/:id', getFoodOrderDetails);
/**
 * @swagger
 * /api/food/orders/{id}/cancel:
 *   put:
 *     summary: PUT /api/food/orders/{id}/cancel
 *     tags: [Food]
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
router.put('/orders/:id/cancel', cancelOrderUser);

// Vendor endpoints
/**
 * @swagger
 * /api/food/vendor/upload-images:
 *   post:
 *     summary: POST /api/food/vendor/upload-images
 *     tags: [Food]
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
router.post('/vendor/upload-images', upload.array('images', 5), uploadFoodImages);
/**
 * @swagger
 * /api/food/vendor/items:
 *   get:
 *     summary: GET /api/food/vendor/items
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/vendor/items', getVendorItems);
/**
 * @swagger
 * /api/food/vendor/items:
 *   post:
 *     summary: POST /api/food/vendor/items
 *     tags: [Food]
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
router.post('/vendor/items', addVendorItem);
/**
 * @swagger
 * /api/food/vendor/items/{id}:
 *   put:
 *     summary: PUT /api/food/vendor/items/{id}
 *     tags: [Food]
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
router.put('/vendor/items/:id', updateVendorItem);
/**
 * @swagger
 * /api/food/vendor/items/{id}:
 *   delete:
 *     summary: DELETE /api/food/vendor/items/{id}
 *     tags: [Food]
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
router.delete('/vendor/items/:id', deleteVendorItem);

/**
 * @swagger
 * /api/food/vendor/orders:
 *   get:
 *     summary: GET /api/food/vendor/orders
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/vendor/orders', getVendorOrders);
/**
 * @swagger
 * /api/food/vendor/register:
 *   post:
 *     summary: POST /api/food/vendor/register
 *     tags: [Food]
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
router.post('/vendor/register', registerFoodVendor);
/**
 * @swagger
 * /api/food/vendor/profile:
 *   get:
 *     summary: GET /api/food/vendor/profile
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/vendor/profile', getFoodVendorProfile);
/**
 * @swagger
 * /api/food/vendor/profile:
 *   put:
 *     summary: PUT /api/food/vendor/profile
 *     tags: [Food]
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
router.put('/vendor/profile', updateFoodVendorProfile);
/**
 * @swagger
 * /api/food/vendor/status:
 *   put:
 *     summary: PUT /api/food/vendor/status
 *     tags: [Food]
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
router.put('/vendor/status', toggleFoodVendorStatus);
/**
 * @swagger
 * /api/food/vendor/stats:
 *   get:
 *     summary: GET /api/food/vendor/stats
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/vendor/stats', getVendorDashboardStats);
/**
 * @swagger
 * /api/food/orders/{id}/status:
 *   put:
 *     summary: PUT /api/food/orders/{id}/status
 *     tags: [Food]
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
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;
