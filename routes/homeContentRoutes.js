const express = require('express');
const router = express.Router();
const { 
  getHomeContent, 
  createBanner, 
  deleteBanner, 
  createFeaturedDestination, 
  deleteFeaturedDestination,
  getAdminHomeContent,
  createAdBanner,
  deleteAdBanner
} = require('../controllers/homeContentController');
const { protect } = require('../middleware/auth');

// Public
/**
 * @swagger
 * /api/home-content:
 *   get:
 *     summary: GET /api/home-content
 *     tags: [Home-content]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/', getHomeContent);

const multer = require('multer');
const upload = multer({ dest: 'uploads/temp/' });

// Admin
/**
 * @swagger
 * /api/home-content/admin:
 *   get:
 *     summary: GET /api/home-content/admin
 *     tags: [Home-content]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/admin', protect, getAdminHomeContent);
/**
 * @swagger
 * /api/home-content/upload:
 *   post:
 *     summary: POST /api/home-content/upload
 *     tags: [Home-content]
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
router.post('/upload', protect, upload.single('image'), require('../controllers/homeContentController').uploadHomeImage);
/**
 * @swagger
 * /api/home-content/banners:
 *   post:
 *     summary: POST /api/home-content/banners
 *     tags: [Home-content]
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
router.post('/banners', protect, createBanner);
/**
 * @swagger
 * /api/home-content/banners/{id}:
 *   put:
 *     summary: PUT /api/home-content/banners/{id}
 *     tags: [Home-content]
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
router.put('/banners/:id', protect, require('../controllers/homeContentController').updateBanner);
/**
 * @swagger
 * /api/home-content/banners/{id}:
 *   delete:
 *     summary: DELETE /api/home-content/banners/{id}
 *     tags: [Home-content]
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
router.delete('/banners/:id', protect, deleteBanner);
/**
 * @swagger
 * /api/home-content/featured:
 *   post:
 *     summary: POST /api/home-content/featured
 *     tags: [Home-content]
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
router.post('/featured', protect, createFeaturedDestination);
/**
 * @swagger
 * /api/home-content/featured/{id}:
 *   put:
 *     summary: PUT /api/home-content/featured/{id}
 *     tags: [Home-content]
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
router.put('/featured/:id', protect, require('../controllers/homeContentController').updateFeaturedDestination);
/**
 * @swagger
 * /api/home-content/featured/{id}:
 *   delete:
 *     summary: DELETE /api/home-content/featured/{id}
 *     tags: [Home-content]
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
router.delete('/featured/:id', protect, deleteFeaturedDestination);

// Ad Banners
/**
 * @swagger
 * /api/home-content/ads:
 *   post:
 *     summary: POST /api/home-content/ads
 *     tags: [Home-content]
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
router.post('/ads', protect, createAdBanner);
/**
 * @swagger
 * /api/home-content/ads/{id}:
 *   put:
 *     summary: PUT /api/home-content/ads/{id}
 *     tags: [Home-content]
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
router.put('/ads/:id', protect, require('../controllers/homeContentController').updateAdBanner);
/**
 * @swagger
 * /api/home-content/ads/{id}:
 *   delete:
 *     summary: DELETE /api/home-content/ads/{id}
 *     tags: [Home-content]
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
router.delete('/ads/:id', protect, deleteAdBanner);

module.exports = router;
