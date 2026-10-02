
// =============== routes/segments.js ====================
const express = require('express');
const router = express.Router();
const segmentController = require('../controllers/segmentController');
const auth = require('../middleware/auth');

// Protected routes
/**
 * @swagger
 * /api/segments/pending:
 *   get:
 *     summary: GET /api/segments/pending
 *     tags: [Segments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/pending', auth.verifyToken, segmentController.getPendingSegments);
/**
 * @swagger
 * /api/segments/{id}([0-9a-fA-F]{24}):
 *   get:
 *     summary: GET /api/segments/{id}([0-9a-fA-F]{24})
 *     tags: [Segments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: 24
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/:id([0-9a-fA-F]{24})', auth.verifyToken, segmentController.getSegmentById);
/**
 * @swagger
 * /api/segments/{id}/status:
 *   put:
 *     summary: PUT /api/segments/{id}/status
 *     tags: [Segments]
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
router.put('/:id/status', auth.verifyToken, auth.checkRole('owner'), segmentController.updateSegmentStatus);
/**
 * @swagger
 * /api/segments/journey/{journeyId}:
 *   get:
 *     summary: GET /api/segments/journey/{journeyId}
 *     tags: [Segments]
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
router.get('/journey/:journeyId', auth.verifyToken, segmentController.getJourneySegments);

module.exports = router;
