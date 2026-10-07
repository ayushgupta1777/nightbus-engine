// ==================== routes/marketplaceRoutes.js ====================
const express = require('express');
const router = express.Router();
const {
  registerProvider,
  searchServices,
  createServiceRequest,
  getMatchingLeads,
  getMyProviderProfile,
  updateProviderCoverage,
  getAllProviders,
  updateProviderStatus,
  toggleProviderStatus,
  updateProviderProfile,
  uploadLicenseImage,
  uploadFitnessImage,
  uploadInsuranceImage,
  uploadMechanicImage
} = require('../controllers/marketplaceController');
const { protect } = require('../middleware/auth');

const multer = require('multer');
const upload = multer({ dest: 'uploads/temp/' });

router.use(protect); // Secure all routes for MVP

// Models A & B Customer endpoints
/**
 * @swagger
 * /api/marketplace/services/search:
 *   get:
 *     summary: GET /api/marketplace/services/search
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/services/search', searchServices);
/**
 * @swagger
 * /api/marketplace/requests:
 *   post:
 *     summary: POST /api/marketplace/requests
 *     tags: [Marketplace]
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
router.post('/requests', createServiceRequest);

// Provider endpoints
/**
 * @swagger
 * /api/marketplace/provider/register:
 *   post:
 *     summary: POST /api/marketplace/provider/register
 *     tags: [Marketplace]
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
router.post('/provider/register', registerProvider);
/**
 * @swagger
 * /api/marketplace/provider/upload-license:
 *   post:
 *     summary: POST /api/marketplace/provider/upload-license
 *     tags: [Marketplace]
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
router.post('/provider/upload-license', upload.single('licenseImage'), uploadLicenseImage);
/**
 * @swagger
 * /api/marketplace/provider/upload-fitness:
 *   post:
 *     summary: POST /api/marketplace/provider/upload-fitness
 *     tags: [Marketplace]
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
router.post('/provider/upload-fitness', upload.single('fitnessImage'), uploadFitnessImage);
/**
 * @swagger
 * /api/marketplace/provider/upload-insurance:
 *   post:
 *     summary: POST /api/marketplace/provider/upload-insurance
 *     tags: [Marketplace]
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
router.post('/provider/upload-insurance', upload.single('insuranceImage'), uploadInsuranceImage);
/**
 * @swagger
 * /api/marketplace/provider/upload-mechanic:
 *   post:
 *     summary: POST /api/marketplace/provider/upload-mechanic
 *     tags: [Marketplace]
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
router.post('/provider/upload-mechanic', upload.single('mechanicImage'), uploadMechanicImage);
/**
 * @swagger
 * /api/marketplace/provider/leads:
 *   get:
 *     summary: GET /api/marketplace/provider/leads
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/provider/leads', getMatchingLeads);
/**
 * @swagger
 * /api/marketplace/provider/profile:
 *   get:
 *     summary: GET /api/marketplace/provider/profile
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/provider/profile', getMyProviderProfile);
/**
 * @swagger
 * /api/marketplace/provider/coverage:
 *   put:
 *     summary: PUT /api/marketplace/provider/coverage
 *     tags: [Marketplace]
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
router.put('/provider/coverage', updateProviderCoverage);
/**
 * @swagger
 * /api/marketplace/provider/status:
 *   put:
 *     summary: PUT /api/marketplace/provider/status
 *     tags: [Marketplace]
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
router.put('/provider/status', toggleProviderStatus);
/**
 * @swagger
 * /api/marketplace/provider/profile:
 *   put:
 *     summary: PUT /api/marketplace/provider/profile
 *     tags: [Marketplace]
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
router.put('/provider/profile', updateProviderProfile);

// Admin endpoints (Role enforcement simplified for MVP)
/**
 * @swagger
 * /api/marketplace/admin/providers:
 *   get:
 *     summary: GET /api/marketplace/admin/providers
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/admin/providers', getAllProviders);
/**
 * @swagger
 * /api/marketplace/admin/providers/{id}/status:
 *   put:
 *     summary: PUT /api/marketplace/admin/providers/{id}/status
 *     tags: [Marketplace]
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
router.put('/admin/providers/:id/status', updateProviderStatus);

module.exports = router;
