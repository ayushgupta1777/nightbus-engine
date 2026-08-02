const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const auth = require('../middleware/auth');

// Search locations with auto-suggestions (Optional auth to show private landmarks)
router.get('/search', auth.optionalProtect, locationController.searchLocations);

// Get popular locations
router.get('/popular', locationController.getPopularLocations);

// Create a new landmark (Requires auth)
router.post('/', auth.protect, locationController.createLocation);

// Parse speech input (for voice search)
router.post('/parse-speech', locationController.parseSpeech);

// Google Maps cached endpoints (Req 6)
router.get('/google-places', locationController.googlePlacesSearch);
router.get('/google-details', locationController.googlePlaceDetails);
router.get('/google-geocode', locationController.googleReverseGeocode);
router.post('/google-route', locationController.googleRoute);
router.post('/google-roads', locationController.googleRoads);

// Save selected location attributes (Req 7)
router.post('/save-selected', auth.optionalProtect, locationController.saveSelectedLocation);

module.exports = router;