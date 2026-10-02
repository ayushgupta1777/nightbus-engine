// ==================== routes/notifications.js ====================
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

const noCache = (req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
};

// Protected routes
router.use(noCache);
/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: GET /api/notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/', auth.verifyToken, notificationController.getUserNotifications);
/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: GET /api/notifications/unread-count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/unread-count', auth.verifyToken, notificationController.getUnreadCount);
/**
 * @swagger
 * /api/notifications/active-topics:
 *   get:
 *     summary: GET /api/notifications/active-topics
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/active-topics', auth.verifyToken, notificationController.getActiveTopics);
/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: GET /api/notifications/{id}
 *     tags: [Notifications]
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
router.get('/:id', auth.verifyToken, notificationController.getNotificationById);
/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: PUT /api/notifications/{id}/read
 *     tags: [Notifications]
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
router.put('/:id/read', auth.verifyToken, notificationController.markAsRead);
/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: DELETE /api/notifications/{id}
 *     tags: [Notifications]
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
router.delete('/:id', auth.verifyToken, notificationController.deleteNotification);
/**
 * @swagger
 * /api/notifications/send:
 *   post:
 *     summary: POST /api/notifications/send
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/send', auth.verifyToken, auth.checkRole(['admin', 'owner']), notificationController.sendNotification);
/**
 * @swagger
 * /api/notifications/test-push:
 *   post:
 *     summary: POST /api/notifications/test-push
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/test-push', auth.verifyToken, notificationController.testPush);

// Bus-specific notification routes
/**
 * @swagger
 * /api/notifications/bus-location-update:
 *   post:
 *     summary: POST /api/notifications/bus-location-update
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/bus-location-update', auth.verifyToken, notificationController.busLocationUpdate);
/**
 * @swagger
 * /api/notifications/bus-delay-notification:
 *   post:
 *     summary: POST /api/notifications/bus-delay-notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/bus-delay-notification', auth.verifyToken, notificationController.busDelayNotification);
/**
 * @swagger
 * /api/notifications/booking-confirmation:
 *   post:
 *     summary: POST /api/notifications/booking-confirmation
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/booking-confirmation', auth.verifyToken, notificationController.bookingConfirmation);
/**
 * @swagger
 * /api/notifications/booking-cancellation:
 *   post:
 *     summary: POST /api/notifications/booking-cancellation
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/booking-cancellation', auth.verifyToken, notificationController.bookingCancellation);

module.exports = router;
