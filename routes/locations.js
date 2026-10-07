const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const auth = require('../middleware/auth');

// Search locations with auto-suggestions (Optional auth to show private landmarks)
/**
 * @swagger
 * /api/locations/search:
 *   get:
 *     summary: GET /api/locations/search
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/search', auth.optionalProtect, locationController.searchLocations);

// Get popular locations
/**
 * @swagger
 * /api/locations/popular:
 *   get:
 *     summary: GET /api/locations/popular
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/popular', locationController.getPopularLocations);

// Create a new landmark (Requires auth)
/**
 * @swagger
 * /api/locations:
 *   post:
 *     summary: POST /api/locations
 *     tags: [Locations]
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
router.post('/', auth.protect, locationController.createLocation);

// Parse speech input (for voice search)
/**
 * @swagger
 * /api/locations/parse-speech:
 *   post:
 *     summary: POST /api/locations/parse-speech
 *     tags: [Locations]
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
router.post('/parse-speech', locationController.parseSpeech);

// Google Maps cached endpoints (Req 6)
/**
 * @swagger
 * /api/locations/google-places:
 *   get:
 *     summary: GET /api/locations/google-places
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/google-places', locationController.googlePlacesSearch);
/**
 * @swagger
 * /api/locations/google-details:
 *   get:
 *     summary: GET /api/locations/google-details
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/google-details', locationController.googlePlaceDetails);
/**
 * @swagger
 * /api/locations/google-geocode:
 *   get:
 *     summary: GET /api/locations/google-geocode
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/google-geocode', locationController.googleReverseGeocode);
/**
 * @swagger
 * /api/locations/google-route:
 *   post:
 *     summary: POST /api/locations/google-route
 *     tags: [Locations]
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
router.post('/google-route', locationController.googleRoute);
/**
 * @swagger
 * /api/locations/google-roads:
 *   post:
 *     summary: POST /api/locations/google-roads
 *     tags: [Locations]
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
router.post('/google-roads', locationController.googleRoads);

// Save selected location attributes (Req 7)
/**
 * @swagger
 * /api/locations/save-selected:
 *   post:
 *     summary: POST /api/locations/save-selected
 *     tags: [Locations]
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
router.post('/save-selected', auth.optionalProtect, locationController.saveSelectedLocation);

module.exports = router;