// ==================== routes/boarding.js ====================
const express = require('express');
const router = express.Router();
const boardingController = require('../controllers/boardingController');
const auth = require('../middleware/auth');

// ==================== QR CODE SCANNING & BOARDING ====================

/**
 * POST /api/boarding/scan-qr
 * Scan QR code and board passenger
 * Access: Staff, Owner
 */
/**
 * @swagger
 * /api/boarding/scan-qr:
 *   post:
 *     summary: POST /api/boarding/scan-qr
 *     tags: [Boarding]
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
router.post(
  '/scan-qr',
  auth.verifyToken,
  auth.checkRole(['staff', 'owner']),
  boardingController.scanQRAndBoard
);

/**
 * POST /api/boarding/verify-exit-otp
 * Verify exit OTP and complete journey segment
 * Access: Staff, Owner
 */
/**
 * @swagger
 * /api/boarding/verify-exit-otp:
 *   post:
 *     summary: POST /api/boarding/verify-exit-otp
 *     tags: [Boarding]
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
router.post(
  '/verify-exit-otp',
  auth.verifyToken,
  auth.checkRole(['staff', 'owner']),
  boardingController.verifyExitOTP
);

/**
 * POST /api/boarding/manual-board
 * Manually board passenger without QR scan (emergency)
 * Access: Staff, Owner
 */
/**
 * @swagger
 * /api/boarding/manual-board:
 *   post:
 *     summary: POST /api/boarding/manual-board
 *     tags: [Boarding]
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
router.post(
  '/manual-board',
  auth.verifyToken,
  auth.checkRole(['staff', 'owner']),
  boardingController.manualBoard
);

// ==================== PASSENGER MANAGEMENT ====================

/**
 * GET /api/boarding/bus/:busId/today
 * Get today's passenger list for a bus
 * Access: Staff, Owner
 */
/**
 * @swagger
 * /api/boarding/bus/{busId}/today:
 *   get:
 *     summary: GET /api/boarding/bus/{busId}/today
 *     tags: [Boarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: busId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get(
  '/bus/:busId/today',
  auth.verifyToken,
  auth.checkRole(['staff', 'owner']),
  boardingController.getTodaysPassengers
);

/**
 * GET /api/boarding/bus/:busId/stats
 * Get boarding statistics for a bus
 * Access: Staff, Owner
 */
/**
 * @swagger
 * /api/boarding/bus/{busId}/stats:
 *   get:
 *     summary: GET /api/boarding/bus/{busId}/stats
 *     tags: [Boarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: busId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get(
  '/bus/:busId/stats',
  auth.verifyToken,
  auth.checkRole(['staff', 'owner']),
  boardingController.getBoardingStats
);

/**
 * GET /api/boarding/status/:busId
 * Get current boarding status for a bus
 * Access: Authenticated users
 */
/**
 * @swagger
 * /api/boarding/status/{busId}:
 *   get:
 *     summary: GET /api/boarding/status/{busId}
 *     tags: [Boarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: busId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get(
  '/status/:busId',
  auth.verifyToken,
  boardingController.getBoardingStatus
);

// ==================== SEAT APPROVAL (BUS OWNER) ====================

/**
 * PUT /api/boarding/segment/:segmentId/approve
 * Approve or reject seat request
 * Access: Owner only
 * Body: { action: 'approve' | 'reject', reason?: string }
 */
/**
 * @swagger
 * /api/boarding/segment/{segmentId}/approve:
 *   put:
 *     summary: PUT /api/boarding/segment/{segmentId}/approve
 *     tags: [Boarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: segmentId
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
router.put(
  '/segment/:segmentId/approve',
  auth.verifyToken,
  auth.checkRole('owner'),
  boardingController.approveSeatRequest
);

/**
 * GET /api/boarding/pending-approvals
 * Get all pending seat approval requests for owner
 * Access: Owner only
 */
/**
 * @swagger
 * /api/boarding/pending-approvals:
 *   get:
 *     summary: GET /api/boarding/pending-approvals
 *     tags: [Boarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get(
  '/pending-approvals',
  auth.verifyToken,
  auth.checkRole('owner'),
  boardingController.getPendingApprovals
);

/**
 * PUT /api/boarding/bulk-approve
 * Bulk approve/reject multiple seat requests
 * Access: Owner only
 * Body: { segmentIds: string[], action: 'approve' | 'reject', reason?: string }
 */
/**
 * @swagger
 * /api/boarding/bulk-approve:
 *   put:
 *     summary: PUT /api/boarding/bulk-approve
 *     tags: [Boarding]
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
router.put(
  '/bulk-approve',
  auth.verifyToken,
  auth.checkRole('owner'),
  boardingController.bulkApproveSeatRequests
);

// ==================== OTP MANAGEMENT ====================

/**
 * POST /api/boarding/generate-exit-otp
 * Manually generate exit OTP for a segment
 * Access: Staff, Owner
 * Body: { segmentId: string }
 */
/**
 * @swagger
 * /api/boarding/generate-exit-otp:
 *   post:
 *     summary: POST /api/boarding/generate-exit-otp
 *     tags: [Boarding]
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
router.post(
  '/generate-exit-otp',
  auth.verifyToken,
  auth.checkRole(['staff', 'owner']),
  boardingController.generateExitOTP
);

/**
 * POST /api/boarding/resend-otp
 * Resend exit OTP to customer
 * Access: Staff, Owner
 * Body: { segmentId: string }
 */
/**
 * @swagger
 * /api/boarding/resend-otp:
 *   post:
 *     summary: POST /api/boarding/resend-otp
 *     tags: [Boarding]
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
router.post(
  '/resend-otp',
  auth.verifyToken,
  auth.checkRole(['staff', 'owner']),
  boardingController.resendExitOTP
);

// ==================== CUSTOMER QUERIES ====================

/**
 * GET /api/boarding/my-segments/:journeyId
 * Get all segments for a customer's journey
 * Access: Authenticated customer
 */
/**
 * @swagger
 * /api/boarding/my-segments/{journeyId}:
 *   get:
 *     summary: GET /api/boarding/my-segments/{journeyId}
 *     tags: [Boarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: journeyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get(
  '/my-segments/:journeyId',
  auth.verifyToken,
  boardingController.getMySegments
);

/**
 * GET /api/boarding/segment/:segmentId
 * Get details of a specific segment
 * Access: Authenticated users
 */
/**
 * @swagger
 * /api/boarding/segment/{segmentId}:
 *   get:
 *     summary: GET /api/boarding/segment/{segmentId}
 *     tags: [Boarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: segmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get(
  '/segment/:segmentId',
  auth.verifyToken,
  boardingController.getSegmentDetails
);

// ==================== REPORTING & ANALYTICS ====================

/**
 * GET /api/boarding/route/:routeId/analytics
 * Get boarding analytics for a route
 * Access: Owner, Admin
 */
/**
 * @swagger
 * /api/boarding/route/{routeId}/analytics:
 *   get:
 *     summary: GET /api/boarding/route/{routeId}/analytics
 *     tags: [Boarding]
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
router.get(
  '/route/:routeId/analytics',
  auth.verifyToken,
  auth.checkRole(['owner', 'admin']),
  boardingController.getRouteAnalytics
);

/**
 * GET /api/boarding/daily-report/:busId
 * Get daily boarding report for a bus
 * Access: Owner, Admin
 */
/**
 * @swagger
 * /api/boarding/daily-report/{busId}:
 *   get:
 *     summary: GET /api/boarding/daily-report/{busId}
 *     tags: [Boarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: busId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get(
  '/daily-report/:busId',
  auth.verifyToken,
  auth.checkRole(['owner', 'admin']),
  boardingController.getDailyReport
);

// ==================== EMERGENCY OPERATIONS ====================

/**
 * POST /api/boarding/mark-no-show
 * Mark passenger as no-show
 * Access: Staff, Owner
 * Body: { segmentId: string, reason: string }
 */
/**
 * @swagger
 * /api/boarding/mark-no-show:
 *   post:
 *     summary: POST /api/boarding/mark-no-show
 *     tags: [Boarding]
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
router.post(
  '/mark-no-show',
  auth.verifyToken,
  auth.checkRole(['staff', 'owner']),
  boardingController.markNoShow
);

/**
 * POST /api/boarding/emergency-complete
 * Emergency complete journey without OTP
 * Access: Owner, Admin only
 * Body: { segmentId: string, reason: string }
 */
/**
 * @swagger
 * /api/boarding/emergency-complete:
 *   post:
 *     summary: POST /api/boarding/emergency-complete
 *     tags: [Boarding]
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
router.post(
  '/emergency-complete',
  auth.verifyToken,
  auth.checkRole(['owner', 'admin']),
  boardingController.emergencyComplete
);

// ==================== VALIDATION ====================

/**
 * POST /api/boarding/validate-qr
 * Validate QR code without boarding (for testing)
 * Access: Staff, Owner
 * Body: { qrData: string }
 */
/**
 * @swagger
 * /api/boarding/validate-qr:
 *   post:
 *     summary: POST /api/boarding/validate-qr
 *     tags: [Boarding]
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
router.post(
  '/validate-qr',
  auth.verifyToken,
  auth.checkRole(['staff', 'owner']),
  boardingController.validateQRCode
);

module.exports = router;
