// ==================== routes/rentalRoutes.js ====================
const express = require('express');
const router = express.Router();
const { 
  createRequest,
  getCustomerRequests,
  getMatchingRequestsForOwner,
  getMatchingOwnersForCustomer,
  closeRequest,
  addRouteConfig,
  getOwnerRouteConfigs,
  updateRouteConfig,
  deleteRouteConfig,
  addRentalService,
  getOwnerRentalServices,
  deleteRentalService,
  getOwnerLeads,
  updateLeadStatus
} = require('../controllers/rentalController');
const { protect } = require('../middleware/auth');
const { 
  rentalRequestValidation, 
  routeConfigValidation, 
  rentalServiceValidation 
} = require('../middleware/validation');

const noCache = (req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
};

router.use(protect);
router.use(noCache);

/**
 * @swagger
 * /api/rental-requests:
 *   post:
 *     summary: POST /api/rental-requests
 *     tags: [Rental-requests]
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
router.post('/', rentalRequestValidation, createRequest);
/**
 * @swagger
 * /api/rental-requests/customer:
 *   get:
 *     summary: GET /api/rental-requests/customer
 *     tags: [Rental-requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/customer', getCustomerRequests);
/**
 * @swagger
 * /api/rental-requests/owner/matching:
 *   get:
 *     summary: GET /api/rental-requests/owner/matching
 *     tags: [Rental-requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/owner/matching', getMatchingRequestsForOwner);
/**
 * @swagger
 * /api/rental-requests/{requestId}/matching-owners:
 *   get:
 *     summary: GET /api/rental-requests/{requestId}/matching-owners
 *     tags: [Rental-requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
/**
 * @swagger
 * /api/rental/{requestId}/matching-owners:
 *   get:
 *     summary: GET /api/rental/{requestId}/matching-owners
 *     tags: [Rental]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/:requestId/matching-owners', getMatchingOwnersForCustomer);
/**
 * @swagger
 * /api/rental-requests/{requestId}/close:
 *   put:
 *     summary: PUT /api/rental-requests/{requestId}/close
 *     tags: [Rental-requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
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
/**
 * @swagger
 * /api/rental/{requestId}/close:
 *   put:
 *     summary: PUT /api/rental/{requestId}/close
 *     tags: [Rental]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
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
router.put('/:requestId/close', closeRequest);

// Owner Supply Endpoints - Route Config (Capability)
/**
 * @swagger
 * /api/rental-requests/route-config:
 *   post:
 *     summary: POST /api/rental-requests/route-config
 *     tags: [Rental-requests]
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
router.post('/route-config', routeConfigValidation, addRouteConfig);
/**
 * @swagger
 * /api/rental-requests/route-config:
 *   get:
 *     summary: GET /api/rental-requests/route-config
 *     tags: [Rental-requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/route-config', getOwnerRouteConfigs);
/**
 * @swagger
 * /api/rental-requests/route-config/{id}:
 *   put:
 *     summary: PUT /api/rental-requests/route-config/{id}
 *     tags: [Rental-requests]
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
/**
 * @swagger
 * /api/rental/route-config/{id}:
 *   put:
 *     summary: PUT /api/rental/route-config/{id}
 *     tags: [Rental]
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
router.put('/route-config/:id', routeConfigValidation, updateRouteConfig);
/**
 * @swagger
 * /api/rental-requests/route-config/{id}:
 *   delete:
 *     summary: DELETE /api/rental-requests/route-config/{id}
 *     tags: [Rental-requests]
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
 * /api/rental/route-config/{id}:
 *   delete:
 *     summary: DELETE /api/rental/route-config/{id}
 *     tags: [Rental]
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
router.delete('/route-config/:id', deleteRouteConfig);

// Owner Supply Endpoints - Rental Service (Availability)
/**
 * @swagger
 * /api/rental-requests/service:
 *   post:
 *     summary: POST /api/rental-requests/service
 *     tags: [Rental-requests]
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
router.post('/service', rentalServiceValidation, addRentalService);
/**
 * @swagger
 * /api/rental-requests/service/owner:
 *   get:
 *     summary: GET /api/rental-requests/service/owner
 *     tags: [Rental-requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/service/owner', getOwnerRentalServices);
// Lead Management (Matching Engine)
/**
 * @swagger
 * /api/rental-requests/owner/leads:
 *   get:
 *     summary: GET /api/rental-requests/owner/leads
 *     tags: [Rental-requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/owner/leads', getOwnerLeads);
/**
 * @swagger
 * /api/rental-requests/owner/leads/{leadId}:
 *   put:
 *     summary: PUT /api/rental-requests/owner/leads/{leadId}
 *     tags: [Rental-requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leadId
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
/**
 * @swagger
 * /api/rental/owner/leads/{leadId}:
 *   put:
 *     summary: PUT /api/rental/owner/leads/{leadId}
 *     tags: [Rental]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leadId
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
router.put('/owner/leads/:leadId', updateLeadStatus);

/**
 * @swagger
 * /api/rental-requests/service/{id}:
 *   delete:
 *     summary: DELETE /api/rental-requests/service/{id}
 *     tags: [Rental-requests]
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
 * /api/rental/service/{id}:
 *   delete:
 *     summary: DELETE /api/rental/service/{id}
 *     tags: [Rental]
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
router.delete('/service/:id', deleteRentalService);

module.exports = router;
