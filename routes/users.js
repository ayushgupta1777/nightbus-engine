// ==================== routes/users.js ====================
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Protected routes - require authentication
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: GET /api/users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/', auth.verifyToken, userController.getAllUsers);
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: GET /api/users/{id}
 *     tags: [Users]
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
router.get('/:id', auth.verifyToken, userController.getUserById);
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: PUT /api/users/{id}
 *     tags: [Users]
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
router.put('/:id', auth.verifyToken, userController.updateUser);
/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: DELETE /api/users/{id}
 *     tags: [Users]
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
router.delete('/:id', auth.verifyToken, auth.checkRole('admin'), userController.deleteUser);
/**
 * @swagger
 * /api/users/{id}/bookings:
 *   get:
 *     summary: GET /api/users/{id}/bookings
 *     tags: [Users]
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
router.get('/:id/bookings', auth.verifyToken, userController.getUserBookings);
/**
 * @swagger
 * /api/users/{id}/transactions:
 *   get:
 *     summary: GET /api/users/{id}/transactions
 *     tags: [Users]
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
router.get('/:id/transactions', auth.verifyToken, userController.getUserTransactions);

module.exports = router;
