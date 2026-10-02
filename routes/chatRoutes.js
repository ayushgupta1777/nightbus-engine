// ==================== routes/chatRoutes.js ====================
const express = require('express');
const router = express.Router();
const {
  getOrCreateChat,
  getOrCreateSupportChat,
  sendMessage,
  getUserChats,
  getChatHistory,
  updateChatStatus
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * /api/chats/init:
 *   post:
 *     summary: POST /api/chats/init
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/init', getOrCreateChat);
/**
 * @swagger
 * /api/chats/init-support:
 *   post:
 *     summary: POST /api/chats/init-support
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/init-support', getOrCreateSupportChat);
/**
 * @swagger
 * /api/chats:
 *   get:
 *     summary: GET /api/chats
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/', getUserChats);
/**
 * @swagger
 * /api/chats/{chatId}:
 *   get:
 *     summary: GET /api/chats/{chatId}
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/:chatId', getChatHistory);
/**
 * @swagger
 * /api/chats/{chatId}/messages:
 *   post:
 *     summary: POST /api/chats/{chatId}/messages
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/:chatId/messages', sendMessage);
/**
 * @swagger
 * /api/chats/{chatId}/status:
 *   patch:
 *     summary: PATCH /api/chats/{chatId}/status
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.patch('/:chatId/status', updateChatStatus);

module.exports = router;

