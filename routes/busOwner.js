// ==================== routes/owner.js (COMPLETE) ====================
const express = require('express');
const router = express.Router();
const busOwnerController = require('../controllers/busOwnerController');
const auth = require('../middleware/auth');

// Apply authentication and owner role check to all routes
router.use(auth.verifyToken);
router.use((req, res, next) => {
  if (req.user.role !== 'owner' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Owner role required.'
    });
  }
  next();
});

// ==================== PING (DEBUG) ====================
/**
 * @swagger
 * /api/bus-owner/ping:
 *   get:
 *     summary: GET /api/bus-owner/ping
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/ping', (req, res) => res.json({ success: true, message: 'Owner API is alive 🚀' }));

// ==================== BUS MANAGEMENT ====================
/**
 * @swagger
 * /api/bus-owner/buses:
 *   post:
 *     summary: POST /api/bus-owner/buses
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/buses', busOwnerController.createBus);
/**
 * @swagger
 * /api/bus-owner/buses:
 *   get:
 *     summary: GET /api/bus-owner/buses
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/buses', busOwnerController.getOwnerBuses);
/**
 * @swagger
 * /api/bus-owner/buses/{busId}/routes:
 *   get:
 *     summary: GET /api/bus-owner/buses/{busId}/routes
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/buses/{busId}/routes:
 *   get:
 *     summary: GET /api/owner/buses/{busId}/routes
 *     tags: [Owner]
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
router.get('/buses/:busId/routes', busOwnerController.getBusRoutes); // Moved here
/**
 * @swagger
 * /api/bus-owner/buses/{busId}:
 *   get:
 *     summary: GET /api/bus-owner/buses/{busId}
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/buses/{busId}:
 *   get:
 *     summary: GET /api/owner/buses/{busId}
 *     tags: [Owner]
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
router.get('/buses/:busId', busOwnerController.getBusDetails);
/**
 * @swagger
 * /api/bus-owner/buses/{busId}:
 *   put:
 *     summary: PUT /api/bus-owner/buses/{busId}
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/buses/{busId}:
 *   put:
 *     summary: PUT /api/owner/buses/{busId}
 *     tags: [Owner]
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
router.put('/buses/:busId', busOwnerController.updateBus);
/**
 * @swagger
 * /api/bus-owner/buses/{busId}:
 *   delete:
 *     summary: DELETE /api/bus-owner/buses/{busId}
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/buses/{busId}:
 *   delete:
 *     summary: DELETE /api/owner/buses/{busId}
 *     tags: [Owner]
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
router.delete('/buses/:busId', busOwnerController.deleteBus);
/**
 * @swagger
 * /api/bus-owner/buses/{busId}/seats/configure:
 *   put:
 *     summary: PUT /api/bus-owner/buses/{busId}/seats/configure
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/buses/{busId}/seats/configure:
 *   put:
 *     summary: PUT /api/owner/buses/{busId}/seats/configure
 *     tags: [Owner]
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
router.put('/buses/:busId/seats/configure', busOwnerController.configureSeatPlatforms);
/**
 * @swagger
 * /api/bus-owner/buses/{busId}/live-trip:
 *   get:
 *     summary: GET /api/bus-owner/buses/{busId}/live-trip
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/buses/{busId}/live-trip:
 *   get:
 *     summary: GET /api/owner/buses/{busId}/live-trip
 *     tags: [Owner]
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
router.get('/buses/:busId/live-trip', busOwnerController.getLiveTrip);
/**
 * @swagger
 * /api/bus-owner/buses/{busId}/history:
 *   get:
 *     summary: GET /api/bus-owner/buses/{busId}/history
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/buses/{busId}/history:
 *   get:
 *     summary: GET /api/owner/buses/{busId}/history
 *     tags: [Owner]
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
router.get('/buses/:busId/history', busOwnerController.getBusTripHistory);

// ==================== ROUTE MANAGEMENT ====================
/**
 * @swagger
 * /api/bus-owner/routes:
 *   post:
 *     summary: POST /api/bus-owner/routes
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/routes', busOwnerController.createRoute);
/**
 * @swagger
 * /api/bus-owner/routes:
 *   get:
 *     summary: GET /api/bus-owner/routes
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/routes', busOwnerController.getOwnerRoutes);
/**
 * @swagger
 * /api/bus-owner/routes/{routeId}/details:
 *   get:
 *     summary: GET /api/bus-owner/routes/{routeId}/details
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/routes/{routeId}/details:
 *   get:
 *     summary: GET /api/owner/routes/{routeId}/details
 *     tags: [Owner]
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
router.get('/routes/:routeId/details', busOwnerController.getRouteDetails);
/**
 * @swagger
 * /api/bus-owner/routes/{routeId}:
 *   put:
 *     summary: PUT /api/bus-owner/routes/{routeId}
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/routes/{routeId}:
 *   put:
 *     summary: PUT /api/owner/routes/{routeId}
 *     tags: [Owner]
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
router.put('/routes/:routeId', busOwnerController.updateRoute);
/**
 * @swagger
 * /api/bus-owner/routes/{routeId}/status:
 *   put:
 *     summary: PUT /api/bus-owner/routes/{routeId}/status
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/routes/{routeId}/status:
 *   put:
 *     summary: PUT /api/owner/routes/{routeId}/status
 *     tags: [Owner]
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
router.put('/routes/:routeId/status', busOwnerController.updateRouteStatus);
/**
 * @swagger
 * /api/bus-owner/routes/{routeId}/stops:
 *   put:
 *     summary: PUT /api/bus-owner/routes/{routeId}/stops
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/routes/{routeId}/stops:
 *   put:
 *     summary: PUT /api/owner/routes/{routeId}/stops
 *     tags: [Owner]
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
router.put('/routes/:routeId/stops', busOwnerController.updateRouteStops);
/**
 * @swagger
 * /api/bus-owner/routes/{routeId}:
 *   delete:
 *     summary: DELETE /api/bus-owner/routes/{routeId}
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/routes/{routeId}:
 *   delete:
 *     summary: DELETE /api/owner/routes/{routeId}
 *     tags: [Owner]
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
router.delete('/routes/:routeId', busOwnerController.deleteRoute);

// ==================== BOOKING APPROVAL ====================
/**
 * @swagger
 * /api/bus-owner/pending-approvals:
 *   get:
 *     summary: GET /api/bus-owner/pending-approvals
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/pending-approvals', busOwnerController.getPendingApprovals);
/**
 * @swagger
 * /api/bus-owner/segments/{segmentId}/approve:
 *   put:
 *     summary: PUT /api/bus-owner/segments/{segmentId}/approve
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/segments/{segmentId}/approve:
 *   put:
 *     summary: PUT /api/owner/segments/{segmentId}/approve
 *     tags: [Owner]
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
router.put('/segments/:segmentId/approve', busOwnerController.approveBooking);
/**
 * @swagger
 * /api/bus-owner/segments/{segmentId}/reject:
 *   put:
 *     summary: PUT /api/bus-owner/segments/{segmentId}/reject
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/segments/{segmentId}/reject:
 *   put:
 *     summary: PUT /api/owner/segments/{segmentId}/reject
 *     tags: [Owner]
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
router.put('/segments/:segmentId/reject', busOwnerController.rejectBooking);
/**
 * @swagger
 * /api/bus-owner/buses/{busId}/bookings/date/{date}:
 *   get:
 *     summary: GET /api/bus-owner/buses/{busId}/bookings/date/{date}
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: busId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
/**
 * @swagger
 * /api/owner/buses/{busId}/bookings/date/{date}:
 *   get:
 *     summary: GET /api/owner/buses/{busId}/bookings/date/{date}
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: busId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/buses/:busId/bookings/date/:date', busOwnerController.getBusBookingsByDate);

// ==================== STAFF MANAGEMENT ====================
/**
 * @swagger
 * /api/bus-owner/staff:
 *   get:
 *     summary: GET /api/bus-owner/staff
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/staff', busOwnerController.getOwnerStaff);
/**
 * @swagger
 * /api/bus-owner/staff:
 *   post:
 *     summary: POST /api/bus-owner/staff
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/staff', busOwnerController.createStaff);
/**
 * @swagger
 * /api/bus-owner/staff/{staffId}:
 *   put:
 *     summary: PUT /api/bus-owner/staff/{staffId}
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
/**
 * @swagger
 * /api/owner/staff/{staffId}:
 *   put:
 *     summary: PUT /api/owner/staff/{staffId}
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.put('/staff/:staffId', busOwnerController.updateStaff);
/**
 * @swagger
 * /api/bus-owner/staff/{staffId}:
 *   delete:
 *     summary: DELETE /api/bus-owner/staff/{staffId}
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
/**
 * @swagger
 * /api/owner/staff/{staffId}:
 *   delete:
 *     summary: DELETE /api/owner/staff/{staffId}
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.delete('/staff/:staffId', busOwnerController.deleteStaff);
/**
 * @swagger
 * /api/bus-owner/staff/assign:
 *   post:
 *     summary: POST /api/bus-owner/staff/assign
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/staff/assign', busOwnerController.assignStaff);
/**
 * @swagger
 * /api/bus-owner/staff/{staffId}/assignments:
 *   get:
 *     summary: GET /api/bus-owner/staff/{staffId}/assignments
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
/**
 * @swagger
 * /api/owner/staff/{staffId}/assignments:
 *   get:
 *     summary: GET /api/owner/staff/{staffId}/assignments
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/staff/:staffId/assignments', busOwnerController.getStaffAssignments);
/**
 * @swagger
 * /api/bus-owner/staff/{staffId}/status:
 *   put:
 *     summary: PUT /api/bus-owner/staff/{staffId}/status
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
/**
 * @swagger
 * /api/owner/staff/{staffId}/status:
 *   put:
 *     summary: PUT /api/owner/staff/{staffId}/status
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.put('/staff/:staffId/status', busOwnerController.updateStaffStatus);

// ==================== DASHBOARD & ANALYTICS ====================
/**
 * @swagger
 * /api/bus-owner/dashboard/stats:
 *   get:
 *     summary: GET /api/bus-owner/dashboard/stats
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/dashboard/stats', busOwnerController.getDashboardStats);
/**
 * @swagger
 * /api/bus-owner/analytics/revenue:
 *   get:
 *     summary: GET /api/bus-owner/analytics/revenue
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/analytics/revenue', busOwnerController.getRevenueAnalytics);
/**
 * @swagger
 * /api/bus-owner/analytics/transactions:
 *   get:
 *     summary: GET /api/bus-owner/analytics/transactions
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/analytics/transactions', busOwnerController.getRevenueTransactions);
/**
 * @swagger
 * /api/bus-owner/settlements:
 *   get:
 *     summary: GET /api/bus-owner/settlements
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/settlements', busOwnerController.getSettlements);
/**
 * @swagger
 * /api/bus-owner/wallet/withdraw:
 *   post:
 *     summary: POST /api/bus-owner/wallet/withdraw
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/wallet/withdraw', busOwnerController.requestWithdrawal);
/**
 * @swagger
 * /api/bus-owner/bookings/{id}/cancel-approve:
 *   put:
 *     summary: PUT /api/bus-owner/bookings/{id}/cancel-approve
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/bookings/{id}/cancel-approve:
 *   put:
 *     summary: PUT /api/owner/bookings/{id}/cancel-approve
 *     tags: [Owner]
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
router.put('/bookings/:id/cancel-approve', busOwnerController.approveCancellation);
/**
 * @swagger
 * /api/bus-owner/bookings/{id}/cancel-reject:
 *   put:
 *     summary: PUT /api/bus-owner/bookings/{id}/cancel-reject
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/bookings/{id}/cancel-reject:
 *   put:
 *     summary: PUT /api/owner/bookings/{id}/cancel-reject
 *     tags: [Owner]
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
router.put('/bookings/:id/cancel-reject', busOwnerController.rejectCancellation);
/**
 * @swagger
 * /api/bus-owner/journeys/upcoming:
 *   get:
 *     summary: GET /api/bus-owner/journeys/upcoming
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/journeys/upcoming', busOwnerController.getUpcomingJourneys);

// ==================== SETTINGS ====================
/**
 * @swagger
 * /api/bus-owner/settings:
 *   get:
 *     summary: GET /api/bus-owner/settings
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/settings', busOwnerController.getOwnerSettings);
/**
 * @swagger
 * /api/bus-owner/settings:
 *   put:
 *     summary: PUT /api/bus-owner/settings
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.put('/settings', busOwnerController.updateOwnerSettings);

// ==================== COMMUNICATION ====================
/**
 * @swagger
 * /api/bus-owner/announcement:
 *   post:
 *     summary: POST /api/bus-owner/announcement
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/announcement', busOwnerController.sendTripAnnouncement);

module.exports = router;


// // ==================== routes/owner.js (COMPLETE) ====================
// const express = require('express');
// const router = express.Router();
// const busOwnerController = require('../controllers/busOwnerController');
// const auth = require('../middleware/auth');

// // Apply authentication and owner role check to all routes
// router.use(auth.verifyToken);
// router.use((req, res, next) => {
//   if (req.user.role !== 'owner') {
//     return res.status(403).json({
//       success: false,
//       message: 'Access denied. Owner role required.'
//     });
//   }
//   next();
// });

// // Bus Management
// /**
 * @swagger
 * /api/bus-owner/buses:
 *   get:
 *     summary: GET /api/bus-owner/buses
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/buses', busOwnerController.getOwnerBuses);
// /**
 * @swagger
 * /api/bus-owner/buses:
 *   post:
 *     summary: POST /api/bus-owner/buses
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/buses', busOwnerController.createBus);
// /**
 * @swagger
 * /api/bus-owner/buses/{busId}:
 *   get:
 *     summary: GET /api/bus-owner/buses/{busId}
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/buses/{busId}:
 *   get:
 *     summary: GET /api/owner/buses/{busId}
 *     tags: [Owner]
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
router.get('/buses/:busId', busOwnerController.getBusDetails);
// /**
 * @swagger
 * /api/bus-owner/buses/{busId}:
 *   put:
 *     summary: PUT /api/bus-owner/buses/{busId}
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/buses/{busId}:
 *   put:
 *     summary: PUT /api/owner/buses/{busId}
 *     tags: [Owner]
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
router.put('/buses/:busId', busOwnerController.updateBus);
// /**
 * @swagger
 * /api/bus-owner/buses/{busId}:
 *   delete:
 *     summary: DELETE /api/bus-owner/buses/{busId}
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/buses/{busId}:
 *   delete:
 *     summary: DELETE /api/owner/buses/{busId}
 *     tags: [Owner]
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
router.delete('/buses/:busId', busOwnerController.deleteBus);

// // Route Management
// /**
 * @swagger
 * /api/bus-owner/routes:
 *   get:
 *     summary: GET /api/bus-owner/routes
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/routes', busOwnerController.getOwnerRoutes);
// /**
 * @swagger
 * /api/bus-owner/routes:
 *   post:
 *     summary: POST /api/bus-owner/routes
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/routes', busOwnerController.createRoute);
// /**
 * @swagger
 * /api/bus-owner/routes/{routeId}:
 *   put:
 *     summary: PUT /api/bus-owner/routes/{routeId}
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/routes/{routeId}:
 *   put:
 *     summary: PUT /api/owner/routes/{routeId}
 *     tags: [Owner]
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
router.put('/routes/:routeId', busOwnerController.updateRoute);
// /**
 * @swagger
 * /api/bus-owner/routes/{routeId}:
 *   delete:
 *     summary: DELETE /api/bus-owner/routes/{routeId}
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/routes/{routeId}:
 *   delete:
 *     summary: DELETE /api/owner/routes/{routeId}
 *     tags: [Owner]
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
router.delete('/routes/:routeId', busOwnerController.deleteRoute);
// /**
 * @swagger
 * /api/bus-owner/routes/{routeId}/occupancy:
 *   get:
 *     summary: GET /api/bus-owner/routes/{routeId}/occupancy
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/routes/{routeId}/occupancy:
 *   get:
 *     summary: GET /api/owner/routes/{routeId}/occupancy
 *     tags: [Owner]
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
router.get('/routes/:routeId/occupancy', busOwnerController.getRouteOccupancy);

// // Staff Management
// /**
 * @swagger
 * /api/bus-owner/staff:
 *   get:
 *     summary: GET /api/bus-owner/staff
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/staff', busOwnerController.getOwnerStaff);
// /**
 * @swagger
 * /api/bus-owner/staff/assign:
 *   post:
 *     summary: POST /api/bus-owner/staff/assign
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/staff/assign', busOwnerController.assignStaff);
// /**
 * @swagger
 * /api/bus-owner/staff/{staffId}:
 *   put:
 *     summary: PUT /api/bus-owner/staff/{staffId}
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
/**
 * @swagger
 * /api/owner/staff/{staffId}:
 *   put:
 *     summary: PUT /api/owner/staff/{staffId}
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.put('/staff/:staffId', busOwnerController.updateStaffStatus);
// /**
 * @swagger
 * /api/bus-owner/staff/{staffId}/assignments:
 *   get:
 *     summary: GET /api/bus-owner/staff/{staffId}/assignments
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
/**
 * @swagger
 * /api/owner/staff/{staffId}/assignments:
 *   get:
 *     summary: GET /api/owner/staff/{staffId}/assignments
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/staff/:staffId/assignments', busOwnerController.getStaffAssignments);

// // Analytics & Dashboard
// /**
 * @swagger
 * /api/bus-owner/analytics/revenue:
 *   get:
 *     summary: GET /api/bus-owner/analytics/revenue
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/analytics/revenue', busOwnerController.getRevenueAnalytics);
// /**
 * @swagger
 * /api/bus-owner/journeys/upcoming:
 *   get:
 *     summary: GET /api/bus-owner/journeys/upcoming
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/journeys/upcoming', busOwnerController.getUpcomingJourneys);
// /**
 * @swagger
 * /api/bus-owner/dashboard/stats:
 *   get:
 *     summary: GET /api/bus-owner/dashboard/stats
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/dashboard/stats', busOwnerController.getDashboardStats);

// module.exports = router;

// // ==================== routes/busOwner.js ====================
// const express = require('express');
// const router = express.Router();
// const busOwnerController = require('../controllers/busOwnerController');
// const auth = require('../middleware/auth');

// // All routes require authentication and 'owner' role
// router.use(auth.verifyToken);
// router.use((req, res, next) => {
//   if (req.user.role !== 'owner') {
//     return res.status(403).json({ success: false, message: 'Only bus owners can access this' });
//   }
//   next();
// });

// /**
//  * ROUTE MANAGEMENT
//  */
// /**
 * @swagger
 * /api/bus-owner/routes:
 *   post:
 *     summary: POST /api/bus-owner/routes
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/routes', busOwnerController.createRoute);
// /**
 * @swagger
 * /api/bus-owner/routes:
 *   get:
 *     summary: GET /api/bus-owner/routes
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/routes', busOwnerController.getOwnerRoutes);
// /**
 * @swagger
 * /api/bus-owner/routes/{routeId}:
 *   put:
 *     summary: PUT /api/bus-owner/routes/{routeId}
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/routes/{routeId}:
 *   put:
 *     summary: PUT /api/owner/routes/{routeId}
 *     tags: [Owner]
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
router.put('/routes/:routeId', busOwnerController.updateRoute);
// /**
 * @swagger
 * /api/bus-owner/routes/{routeId}:
 *   delete:
 *     summary: DELETE /api/bus-owner/routes/{routeId}
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/routes/{routeId}:
 *   delete:
 *     summary: DELETE /api/owner/routes/{routeId}
 *     tags: [Owner]
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
router.delete('/routes/:routeId', busOwnerController.deleteRoute);

// /**
//  * BUS MANAGEMENT
//  */
// /**
 * @swagger
 * /api/bus-owner/buses:
 *   post:
 *     summary: POST /api/bus-owner/buses
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post('/buses', busOwnerController.createBus);
// /**
 * @swagger
 * /api/bus-owner/buses:
 *   get:
 *     summary: GET /api/bus-owner/buses
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/buses', busOwnerController.getOwnerBuses);
// /**
 * @swagger
 * /api/bus-owner/buses/{busId}:
 *   put:
 *     summary: PUT /api/bus-owner/buses/{busId}
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/buses/{busId}:
 *   put:
 *     summary: PUT /api/owner/buses/{busId}
 *     tags: [Owner]
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
router.put('/buses/:busId', busOwnerController.updateBus);

// /**
//  * ANALYTICS & REAL-TIME
//  */
// /**
 * @swagger
 * /api/bus-owner/routes/{routeId}/occupancy:
 *   get:
 *     summary: GET /api/bus-owner/routes/{routeId}/occupancy
 *     tags: [Bus-owner]
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
/**
 * @swagger
 * /api/owner/routes/{routeId}/occupancy:
 *   get:
 *     summary: GET /api/owner/routes/{routeId}/occupancy
 *     tags: [Owner]
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
router.get('/routes/:routeId/occupancy', busOwnerController.getRouteOccupancy);
// /**
 * @swagger
 * /api/bus-owner/analytics/revenue:
 *   get:
 *     summary: GET /api/bus-owner/analytics/revenue
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/analytics/revenue', busOwnerController.getRevenueAnalytics);
// /**
 * @swagger
 * /api/bus-owner/journeys/upcoming:
 *   get:
 *     summary: GET /api/bus-owner/journeys/upcoming
 *     tags: [Bus-owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/journeys/upcoming', busOwnerController.getUpcomingJourneys);

// module.exports = router;
