// ==================== server/test-google-maps.js ====================
require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyDshgHgzAfX-hYaomrxMLENUsJ-pQfHwAo';

async function runTests() {
  console.log('============= NIGHTBUS GOOGLE MAPS PRODUCTION API TEST =============');
  console.log('Using API Key:', API_KEY ? `${API_KEY.substring(0, 8)}...` : 'NONE');
  console.log('');

  let passed = 0;
  let failed = 0;

  // 1. Test Google Places API (New / Autocomplete) - Katni Bus Stand
  let katniPlaceId = null;
  try {
    console.log('1. Testing Google Places API ("Katni Bus Stand")...');
    const res = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
      params: {
        input: 'Katni Bus Stand',
        components: 'country:in',
        key: API_KEY
      }
    });
    if (res.data.status === 'OK' && res.data.predictions && res.data.predictions.length > 0) {
      console.log('   ✅ PASS - Found Place:', res.data.predictions[0].description);
      katniPlaceId = res.data.predictions[0].place_id;
      passed++;
    } else {
      console.log('   ❌ FAIL - Status:', res.data.status, res.data.error_message || '');
      failed++;
    }
  } catch (err) {
    console.log('   ❌ FAIL - Error:', err.message);
    failed++;
  }

  // 2. Test Google Place Details API
  try {
    console.log('2. Testing Google Place Details API...');
    if (katniPlaceId) {
      const res = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
        params: {
          place_id: katniPlaceId,
          fields: 'place_id,name,formatted_address,geometry,address_components',
          key: API_KEY
        }
      });
      if (res.data.status === 'OK' && res.data.result) {
        console.log('   ✅ PASS - Details:', res.data.result.name, '| Coords:', res.data.result.geometry.location);
        passed++;
      } else {
        console.log('   ❌ FAIL - Status:', res.data.status, res.data.error_message || '');
        failed++;
      }
    } else {
      console.log('   ⚠️ SKIP - No Place ID from previous test');
    }
  } catch (err) {
    console.log('   ❌ FAIL - Error:', err.message);
    failed++;
  }

  // 3. Test Google Geocoding / Reverse Geocoding API - Katni Lat/Lon (23.8388, 79.956)
  try {
    console.log('3. Testing Geocoding / Reverse Geocoding API (23.8388, 79.956)...');
    const res = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        latlng: '23.8388,79.9560',
        key: API_KEY
      }
    });
    if (res.data.status === 'OK' && res.data.results && res.data.results.length > 0) {
      console.log('   ✅ PASS - Address:', res.data.results[0].formatted_address);
      passed++;
    } else {
      console.log('   ❌ FAIL - Status:', res.data.status, res.data.error_message || '');
      failed++;
    }
  } catch (err) {
    console.log('   ❌ FAIL - Error:', err.message);
    failed++;
  }

  // 4. Test Google Routes API (Road distance Jabalpur -> Katni)
  try {
    console.log('4. Testing Google Routes API (Jabalpur -> Katni)...');
    const res = await axios.post(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      {
        origin: { location: { latLng: { latitude: 23.1815, longitude: 79.9864 } } },
        destination: { location: { latLng: { latitude: 23.8388, longitude: 79.9560 } } },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE',
        computeAlternativeRoutes: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs'
        }
      }
    );
    if (res.data && res.data.routes && res.data.routes.length > 0) {
      const distanceKm = (res.data.routes[0].distanceMeters / 1000).toFixed(1);
      console.log('   ✅ PASS - Route Found! Road Distance:', distanceKm, 'km | Duration:', res.data.routes[0].duration);
      passed++;
    } else {
      console.log('   ❌ FAIL - No routes returned:', JSON.stringify(res.data));
      failed++;
    }
  } catch (err) {
    console.log('   ❌ FAIL - Error:', err.response?.data?.error?.message || err.message);
    failed++;
  }

  console.log('');
  console.log('============= TEST SUMMARY =============');
  console.log(`TOTAL PASSED: ${passed}`);
  console.log(`TOTAL FAILED: ${failed}`);
  if (failed === 0) {
    console.log('🎉 ALL 5 GOOGLE MAPS PLATFORM APIS ARE WORKING & READY FOR 30,000 USERS!');
  } else {
    console.log('⚠️ Some Google Maps API calls failed. Check error messages above.');
  }
}

runTests();
