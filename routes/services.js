// ==================== routes/services.js ====================
const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth');

// Public routes
/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: GET /api/services
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/', serviceController.getAllServices);
/**
 * @swagger
 * /api/services/category/{categoryId}:
 *   get:
 *     summary: GET /api/services/category/{categoryId}
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/category/:categoryId', serviceController.getServicesByCategory);
/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: GET /api/services/{id}
 *     tags: [Services]
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
router.get('/:id', serviceController.getServiceById);

// Protected routes - require vendor role
/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: POST /api/services
 *     tags: [Services]
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
router.post('/', auth.verifyToken, auth.checkRole('vendor'), serviceController.createService);
/**
 * @swagger
 * /api/services/{id}:
 *   put:
 *     summary: PUT /api/services/{id}
 *     tags: [Services]
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
router.put('/:id', auth.verifyToken, auth.checkRole('vendor'), serviceController.updateService);
/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     summary: DELETE /api/services/{id}
 *     tags: [Services]
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
router.delete('/:id', auth.verifyToken, auth.checkRole('vendor'), serviceController.deleteService);

module.exports = router;
