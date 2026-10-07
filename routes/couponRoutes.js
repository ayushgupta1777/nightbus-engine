const express = require('express');
const router = express.Router();
const { 
  createCoupon, 
  getCoupons, 
  validateCoupon, 
  deleteCoupon,
  getActiveOffers
} = require('../controllers/couponController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /api/coupons/get-active:
 *   get:
 *     summary: GET /api/coupons/get-active
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/get-active', getActiveOffers);
/**
 * @swagger
 * /api/coupons/validate:
 *   post:
 *     summary: POST /api/coupons/validate
 *     tags: [Coupons]
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
router.post('/validate', protect, validateCoupon);

// Admin only routes
/**
 * @swagger
 * /api/coupons:
 *   post:
 *     summary: POST /api/coupons
 *     tags: [Coupons]
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
router.post('/', protect, createCoupon);
/**
 * @swagger
 * /api/coupons:
 *   get:
 *     summary: GET /api/coupons
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/', protect, getCoupons);
/**
 * @swagger
 * /api/coupons/{id}:
 *   put:
 *     summary: PUT /api/coupons/{id}
 *     tags: [Coupons]
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
router.put('/:id', protect, require('../controllers/couponController').updateCoupon);
/**
 * @swagger
 * /api/coupons/{id}:
 *   delete:
 *     summary: DELETE /api/coupons/{id}
 *     tags: [Coupons]
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
router.delete('/:id', protect, deleteCoupon);

module.exports = router;
