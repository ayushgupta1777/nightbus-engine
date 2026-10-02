// ==================== routes/routes.js ====================
const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const auth = require('../middleware/auth');

// Public routes
/**
 * @swagger
 * /api/routes:
 *   get:
 *     summary: GET /api/routes
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/', routeController.getAllRoutes);
/**
 * @swagger
 * /api/routes/{id}:
 *   get:
 *     summary: GET /api/routes/{id}
 *     tags: [Routes]
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
router.get('/:id', routeController.getRouteById);
/**
 * @swagger
 * /api/routes/schedule/{routeId}:
 *   get:
 *     summary: GET /api/routes/schedule/{routeId}
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/schedule/:routeId', routeController.getSchedule);

// Protected routes - require owner role
/**
 * @swagger
 * /api/routes:
 *   post:
 *     summary: POST /api/routes
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/', auth.verifyToken, auth.checkRole('owner'), routeController.createRoute);
/**
 * @swagger
 * /api/routes/{id}:
 *   put:
 *     summary: PUT /api/routes/{id}
 *     tags: [Routes]
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
router.put('/:id', auth.verifyToken, auth.checkRole('owner'), routeController.updateRoute);
/**
 * @swagger
 * /api/routes/{id}/status:
 *   put:
 *     summary: PUT /api/routes/{id}/status
 *     tags: [Routes]
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
router.put('/:id/status', auth.verifyToken, auth.checkRole('owner'), routeController.updateRouteStatus);
/**
 * @swagger
 * /api/routes/{id}:
 *   delete:
 *     summary: DELETE /api/routes/{id}
 *     tags: [Routes]
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
router.delete('/:id', auth.verifyToken, auth.checkRole('owner'), routeController.deleteRoute);
/**
 * @swagger
 * /api/routes/{id}/stops:
 *   post:
 *     summary: POST /api/routes/{id}/stops
 *     tags: [Routes]
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
router.post('/:id/stops', auth.verifyToken, auth.checkRole('owner'), routeController.addStop);

module.exports = router;
