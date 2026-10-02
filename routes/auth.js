// ==================== routes/auth.js ====================
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Public routes
router.post('/send-otp', authController.sendOTP);
router.post('/send-email-otp', authController.sendEmailOTP);
router.post('/verify-email-otp', authController.verifyEmailOTP);
router.post('/verify-otp', authController.verifyOTP);
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [customer, owner, staff, vendor]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authController.login);

router.post('/logout', authController.logout);
router.post('/reset-password', authController.resetPasswordWithOTP);
router.post('/test-login', authController.testLogin); // ⚠️ TEMPORARY: Remove in production

// Protected routes
router.get('/me', auth.verifyToken, authController.getCurrentUser);
router.put('/profile', auth.verifyToken, authController.updateProfile);
router.post('/fcm-token', auth.verifyToken, authController.updateFCMToken);

module.exports = router;
