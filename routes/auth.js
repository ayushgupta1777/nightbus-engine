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
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [customer, owner, staff, vendor]
 *           examples:
 *             customer:
 *               summary: Customer Registration
 *               value:
 *                 name: "John Customer"
 *                 phone: "9123456780"
 *                 email: "john@customer.com"
 *                 password: "password123"
 *                 role: "customer"
 *             owner:
 *               summary: Bus Owner Registration
 *               value:
 *                 name: "Jane Owner"
 *                 phone: "9123456781"
 *                 email: "jane@owner.com"
 *                 password: "password123"
 *                 role: "owner"
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
 *     summary: Login a user (Email + Password)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               otp:
 *                 type: string
 *           examples:
 *             admin:
 *               summary: Admin login (Requires password to be set)
 *               value:
 *                 email: "admin_v2@test.com"
 *                 password: "password123"
 *             owner:
 *               summary: Bus Owner login
 *               value:
 *                 email: "owner_v2@test.com"
 *                 password: "password123"
 *             staff:
 *               summary: Staff login
 *               value:
 *                 email: "staff_v2@test.com"
 *                 password: "password123"
 *             customer:
 *               summary: Customer login
 *               value:
 *                 email: "customer_v2@test.com"
 *                 password: "password123"
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

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP & Login (Phone)
 *     description: Used for mobile login. In development, any 6-digit OTP works.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *               otp:
 *                 type: string
 *           examples:
 *             customer:
 *               summary: Customer Login (Seed Data)
 *               value:
 *                 phone: "9876500001"
 *                 otp: "123456"
 *             owner:
 *               summary: Bus Owner Login (Seed Data)
 *               value:
 *                 phone: "8765400001"
 *                 otp: "123456"
 *             staff:
 *               summary: Staff Login (Seed Data)
 *               value:
 *                 phone: "7654300001"
 *                 otp: "123456"
 *             vendor:
 *               summary: Vendor Login (Seed Data)
 *               value:
 *                 phone: "6543200001"
 *                 otp: "123456"
 *             admin:
 *               summary: Admin Login (Seed Data)
 *               value:
 *                 phone: "5432100001"
 *                 otp: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */
router.post('/verify-otp', authController.verifyOTP);

/**
 * @swagger
 * /api/auth/test-login:
 *   post:
 *     summary: Bypass Login (Testing Only)
 *     description: Instantly log in as any role. Creates user if doesn't exist. DO NOT USE IN PRODUCTION.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - role
 *             properties:
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [customer, owner, staff, vendor, provider]
 *           examples:
 *             admin:
 *               summary: Login as Admin
 *               value:
 *                 phone: "9999999999"
 *                 role: "admin"
 *             owner:
 *               summary: Login as Bus Owner
 *               value:
 *                 phone: "8888888888"
 *                 role: "owner"
 *     responses:
 *       200:
 *         description: Test Login successful
 */
router.post('/test-login', authController.testLogin);

// Protected routes
router.get('/me', auth.verifyToken, authController.getCurrentUser);
router.put('/profile', auth.verifyToken, authController.updateProfile);
router.post('/fcm-token', auth.verifyToken, authController.updateFCMToken);

module.exports = router;
