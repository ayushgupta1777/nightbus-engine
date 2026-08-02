// ==================== server/test-backend-proxy.js ====================
require('dotenv').config();
const mongoose = require('mongoose');
const locationController = require('./controllers/locationController');

async function testBackendProxy() {
  console.log('============= NIGHTBUS BACKEND GOOGLE MAPS PROXY TEST =============');
  let passed = 0;
  let failed = 0;

  // Connect to MongoDB
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/nightbus';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB for caching test...');
  } catch (err) {
    console.log('⚠️ Could not connect to local MongoDB, testing proxy directly...');
  }

  // Mock res object
  const createMockRes = (name) => {
    return {
      status: (code) => {
        return {
          json: (data) => {
            if (data && data.success) {
              console.log(`   ✅ [${name}] PASS - Code: ${code} | Result:`, 
                data.predictions ? `Found ${data.predictions.length} places (${data.predictions[0].description})` :
                data.result ? `Place: ${data.result.name} (${data.result.geometry.location.lat}, ${data.result.geometry.location.lng})` :
                data.address ? `Address: ${data.address}` :
                data.routes ? `Route distance: ${(data.routes[0].legs[0].distance.value / 1000).toFixed(1)} km` :
                JSON.stringify(data)
              );
              passed++;
            } else {
              console.log(`   ❌ [${name}] FAIL - Code: ${code} | Data:`, JSON.stringify(data));
              failed++;
            }
          }
        };
      },
      json: (data) => {
        if (data && data.success) {
          console.log(`   ✅ [${name}] PASS - Result:`, 
            data.predictions ? `Found ${data.predictions.length} places (${data.predictions[0].description})` :
            data.result ? `Place: ${data.result.name}` :
            data.address ? `Address: ${data.address}` :
            data.routes ? `Route distance: ${(data.routes[0].legs[0].distance.value / 1000).toFixed(1)} km` :
            JSON.stringify(data)
          );
          passed++;
        } else {
          console.log(`   ❌ [${name}] FAIL - Data:`, JSON.stringify(data));
          failed++;
        }
      }
    };
  };

  // 1. Test googlePlacesSearch proxy
  try {
    console.log('1. Testing Proxy -> googlePlacesSearch("Katni Bus Stand")...');
    const req = { query: { query: 'Katni Bus Stand' } };
    await locationController.googlePlacesSearch(req, createMockRes('googlePlacesSearch'));
  } catch (err) {
    console.log('   ❌ [googlePlacesSearch] FAIL - Exception:', err.message);
    failed++;
  }

  // 2. Test googleReverseGeocode proxy
  try {
    console.log('2. Testing Proxy -> googleReverseGeocode(23.8388, 79.956)...');
    const req = { query: { lat: '23.8388', lon: '79.9560' } };
    await locationController.googleReverseGeocode(req, createMockRes('googleReverseGeocode'));
  } catch (err) {
    console.log('   ❌ [googleReverseGeocode] FAIL - Exception:', err.message);
    failed++;
  }

  // 3. Test googleRoute proxy
  try {
    console.log('3. Testing Proxy -> googleRoute(Jabalpur -> Katni)...');
    const req = {
      body: {
        origin: { latitude: 23.1815, longitude: 79.9864 },
        destination: { latitude: 23.8388, longitude: 79.9560 },
        waypoints: [],
        alternatives: false
      }
    };
    await locationController.googleRoute(req, createMockRes('googleRoute'));
  } catch (err) {
    console.log('   ❌ [googleRoute] FAIL - Exception:', err.message);
    failed++;
  }

  console.log('');
  console.log('============= PROXY SUMMARY =============');
  console.log(`TOTAL PASSED: ${passed}`);
  console.log(`TOTAL FAILED: ${failed}`);
  if (failed === 0) {
    console.log('🎉 ALL BACKEND GOOGLE MAPS PROXY ENDPOINTS ARE WORKING PERFECTLY!');
  }

  try {
    await mongoose.disconnect();
  } catch (e) {}
}

testBackendProxy();
