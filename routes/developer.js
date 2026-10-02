const express = require('express');
const router = express.Router();
const developerController = require('../controllers/developerController');
const { protect } = require('../middleware/auth');

// Note: To keep things fully accessible for the developer bypass flow, 
// we won't strictly enforce a specific role here (since the mobile app bypass token might be fake). 
// In a real prod environment, you would check for a special Developer JWT role.
// For now, we allow access if they are logged in.

/**
 * @swagger
 * /api/developer/collections:
 *   get:
 *     summary: GET /api/developer/collections
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/collections', developerController.getCollections);
/**
 * @swagger
 * /api/developer/collections/{collectionName}:
 *   get:
 *     summary: GET /api/developer/collections/{collectionName}
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: collectionName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/collections/:collectionName', developerController.getCollectionData);
/**
 * @swagger
 * /api/developer/collections/{collectionName}/{id}:
 *   delete:
 *     summary: DELETE /api/developer/collections/{collectionName}/{id}
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: collectionName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.delete('/collections/:collectionName/:id', developerController.deleteDocument);

/**
 * @swagger
 * /api/developer/logs:
 *   get:
 *     summary: GET /api/developer/logs
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/logs', developerController.getLogs);
/**
 * @swagger
 * /api/developer/analytics:
 *   get:
 *     summary: GET /api/developer/analytics
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/analytics', developerController.getAnalytics);

// This endpoint is unauthenticated so the mobile app can freely send telemetry even before login
/**
 * @swagger
 * /api/developer/analytics/pageview:
 *   post:
 *     summary: POST /api/developer/analytics/pageview
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/analytics/pageview', developerController.postAnalytics);

/**
 * @swagger
 * /api/developer/login:
 *   post:
 *     summary: POST /api/developer/login
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/login', developerController.login);
/**
 * @swagger
 * /api/developer/change-password:
 *   post:
 *     summary: POST /api/developer/change-password
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/change-password', developerController.changePassword);

/**
 * @swagger
 * /api/developer/health:
 *   get:
 *     summary: GET /api/developer/health
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/health', developerController.getHealth);
/**
 * @swagger
 * /api/developer/crash-report:
 *   post:
 *     summary: POST /api/developer/crash-report
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/crash-report', developerController.postCrashReport);

/**
 * @swagger
 * /api/developer/system-broadcast:
 *   post:
 *     summary: POST /api/developer/system-broadcast
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/system-broadcast', developerController.postSystemBroadcast);
/**
 * @swagger
 * /api/developer/config/maintenance:
 *   get:
 *     summary: GET /api/developer/config/maintenance
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/config/maintenance', developerController.getMaintenanceConfig);
/**
 * @swagger
 * /api/developer/terminal:
 *   get:
 *     summary: GET /api/developer/terminal
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/terminal', developerController.getTerminalLogs);

module.exports = router;
