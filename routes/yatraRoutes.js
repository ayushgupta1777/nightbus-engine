// ==================== routes/yatraRoutes.js ====================
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const yatraController = require('../controllers/yatraController');
const { protect } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/yatra');
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'yatra-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.use(protect);

// ── Customer ─────────────────────────────────────────────────
/**
 * @swagger
 * /api/yatra/packages:
 *   get:
 *     summary: GET /api/yatra/packages
 *     tags: [Yatra]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/packages', yatraController.listPackages);
/**
 * @swagger
 * /api/yatra/packages/{id}:
 *   get:
 *     summary: GET /api/yatra/packages/{id}
 *     tags: [Yatra]
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
router.get('/packages/:id', yatraController.getPackageDetails);
/**
 * @swagger
 * /api/yatra/book:
 *   post:
 *     summary: POST /api/yatra/book
 *     tags: [Yatra]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/book', yatraController.bookPackage);
/**
 * @swagger
 * /api/yatra/my-bookings:
 *   get:
 *     summary: GET /api/yatra/my-bookings
 *     tags: [Yatra]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/my-bookings', yatraController.getMyBookings);
/**
 * @swagger
 * /api/yatra/bookings/{id}:
 *   get:
 *     summary: GET /api/yatra/bookings/{id}
 *     tags: [Yatra]
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
router.get('/bookings/:id', yatraController.getBookingDetails);
/**
 * @swagger
 * /api/yatra/bookings/{id}/cancel:
 *   put:
 *     summary: PUT /api/yatra/bookings/{id}/cancel
 *     tags: [Yatra]
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
router.put('/bookings/:id/cancel', yatraController.cancelBooking);

// ── Owner ─────────────────────────────────────────────────────
/**
 * @swagger
 * /api/yatra/owner/packages/upload-images:
 *   post:
 *     summary: POST /api/yatra/owner/packages/upload-images
 *     tags: [Yatra]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/owner/packages/upload-images', upload.array('images', 5), yatraController.uploadYatraImages);
/**
 * @swagger
 * /api/yatra/owner/packages:
 *   post:
 *     summary: POST /api/yatra/owner/packages
 *     tags: [Yatra]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/owner/packages', yatraController.createPackage);
/**
 * @swagger
 * /api/yatra/owner/packages:
 *   get:
 *     summary: GET /api/yatra/owner/packages
 *     tags: [Yatra]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/owner/packages', yatraController.getOwnerPackages);
/**
 * @swagger
 * /api/yatra/owner/packages/{id}:
 *   put:
 *     summary: PUT /api/yatra/owner/packages/{id}
 *     tags: [Yatra]
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
router.put('/owner/packages/:id', yatraController.updatePackage);
/**
 * @swagger
 * /api/yatra/owner/packages/{id}/complete:
 *   put:
 *     summary: PUT /api/yatra/owner/packages/{id}/complete
 *     tags: [Yatra]
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
router.put('/owner/packages/:id/complete', yatraController.completeYatra);
/**
 * @swagger
 * /api/yatra/owner/packages/{id}/cancel:
 *   put:
 *     summary: PUT /api/yatra/owner/packages/{id}/cancel
 *     tags: [Yatra]
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
router.put('/owner/packages/:id/cancel', yatraController.cancelYatraByOwner);
/**
 * @swagger
 * /api/yatra/owner/packages/{id}:
 *   delete:
 *     summary: DELETE /api/yatra/owner/packages/{id}
 *     tags: [Yatra]
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
router.delete('/owner/packages/:id', yatraController.deletePackage);
/**
 * @swagger
 * /api/yatra/owner/packages/{id}/bookings:
 *   get:
 *     summary: GET /api/yatra/owner/packages/{id}/bookings
 *     tags: [Yatra]
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
router.get('/owner/packages/:id/bookings', yatraController.getPackageBookings);

module.exports = router;
