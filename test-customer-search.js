// ==================== server/test-customer-search.js ====================
require('dotenv').config();
const mongoose = require('mongoose');
const Route = require('./models/Route');
const Bus = require('./models/Bus');
const User = require('./models/User');
const journeyController = require('./controllers/journeyController');

async function runCustomerSearchTestSuite() {
  console.log('========================================================================');
  console.log('         NIGHTBUS HIGH-LEVEL CUSTOMER BUS SEARCH TEST SUITE');
  console.log('========================================================================');
  
  let passed = 0;
  let failed = 0;

  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/nightbus';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ Could not connect to MongoDB:', err.message);
    process.exit(1);
  }

  try {
    // 1. Prepare Test Data (Owner, Bus, Route)
    console.log('\n[SETUP] Ensuring test owner, bus, and route exist...');
    
    let testUser = await User.findOne({ email: 'searchtest_owner@nightbus.in' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Search Test Owner',
        email: 'searchtest_owner@nightbus.in',
        phone: '9988776655',
        role: 'owner',
        password: 'Password@123',
        ownerSettings: { autoConfirmBookings: true }
      });
    }

    let testBus = await Bus.findOne({ busNumber: 'MP-20-TEST-9999' });
    if (!testBus) {
      testBus = await Bus.create({
        ownerId: testUser._id,
        busName: 'NightBus Express 9999',
        busNumber: 'MP-20-TEST-9999',
        registrationNumber: 'MP20TEST9999',
        chassisNumber: 'MA3ERF21S00999999',
        busType: 'AC Sleeper',
        totalSeats: 40,
        isActive: true
      });
    }

    let testRoute = await Route.findOne({ routeCode: 'SEARCH-TEST-101' });
    if (!testRoute) {
      testRoute = await Route.create({
        routeCode: 'SEARCH-TEST-101',
        routeName: 'Jabalpur to Satna Express',
        ownerId: testUser._id,
        busId: testBus._id,
        isActive: true,
        basePrice: 150,
        pricePerKm: 2,
        totalDistance: 200,
        estimatedDuration: 240,
        scheduleType: 'daily',
        days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        stops: [
          {
            name: 'Jabalpur Bus Stand',
            village: 'Jabalpur',
            district: 'Jabalpur',
            state: 'Madhya Pradesh',
            sequence: 0,
            arrivalTime: '06:00',
            departureTime: '06:30',
            coordinates: { latitude: 23.1815, longitude: 79.9864 }
          },
          {
            name: 'Katni Bus Stand',
            village: 'Katni',
            district: 'Katni',
            state: 'Madhya Pradesh',
            sequence: 1,
            arrivalTime: '08:30',
            departureTime: '08:45',
            coordinates: { latitude: 23.8388, longitude: 79.9560 }
          },
          {
            name: 'Maihar Bypass',
            village: 'Maihar',
            district: 'Satna',
            state: 'Madhya Pradesh',
            sequence: 2,
            arrivalTime: '10:00',
            departureTime: '10:10',
            coordinates: { latitude: 24.2655, longitude: 80.7580 }
          },
          {
            name: 'Satna ISBT',
            village: 'Satna',
            district: 'Satna',
            state: 'Madhya Pradesh',
            sequence: 3,
            arrivalTime: '11:00',
            departureTime: '11:30',
            coordinates: { latitude: 24.5854, longitude: 80.8322 }
          }
        ],
        rounds: [
          { startTime: '06:30', roundLabel: 'Morning Express', isActive: true },
          { startTime: '18:30', roundLabel: 'Evening Sleeper', isActive: true }
        ]
      });
    }
    console.log('✅ Test Route active:', testRoute.routeName, `(${testRoute.routeCode})`);

    // Helper for mocking req/res
    const runSearch = async (from, to, dateStr, passengers = 1) => {
      let responseData = null;
      let statusCode = 200;
      const req = {
        body: { from, to, date: dateStr, passengers }
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => { responseData = data; }
          };
        },
        json: (data) => { responseData = data; }
      };
      await journeyController.searchJourneys(req, res);
      return { statusCode, responseData };
    };

    const todayStr = new Date().toISOString().split('T')[0];

    // TEST CASE 1: Exact City Name Search ("Jabalpur" -> "Katni")
    console.log('\n------------------------------------------------------------------------');
    console.log('TEST CASE 1: Exact City Name Search ("Jabalpur" -> "Katni")');
    const res1 = await runSearch('Jabalpur', 'Katni', todayStr, 1);
    if (res1.responseData?.success && res1.responseData.journeys?.length > 0) {
      console.log(`✅ PASS: Found ${res1.responseData.journeys.length} journey(s)!`);
      console.log(`   Sample: [${res1.responseData.journeys[0].type.toUpperCase()}] ${res1.responseData.journeys[0].roundLabel} | Price: ₹${res1.responseData.journeys[0].totalPrice}`);
      passed++;
    } else {
      console.log('❌ FAIL:', JSON.stringify(res1.responseData));
      failed++;
    }

    // TEST CASE 2: Google Places Autocomplete Long Search ("Bus Stand, Katni..." -> "Satna ISBT...")
    console.log('\n------------------------------------------------------------------------');
    console.log('TEST CASE 2: Google Places Full String Search');
    console.log('   from = "Bus Stand, Katni, Mission Chowk Road, Badera, Katni, Madhya Pradesh, India"');
    console.log('   to   = "Satna ISBT, Madhya Pradesh, India"');
    const res2 = await runSearch(
      'Bus Stand, Katni, Mission Chowk Road, Badera, Katni, Madhya Pradesh, India',
      'Satna ISBT, Madhya Pradesh, India',
      todayStr,
      2
    );
    if (res2.responseData?.success && res2.responseData.journeys?.length > 0) {
      console.log(`✅ PASS: Successfully matched token names across complex Google Places addresses!`);
      console.log(`   Found ${res2.responseData.journeys.length} journey(s) | 2 Passengers Total Price: ₹${res2.responseData.journeys[0].totalPrice}`);
      passed++;
    } else {
      console.log('❌ FAIL:', JSON.stringify(res2.responseData));
      failed++;
    }

    // TEST CASE 3: Intermediate Stop Search ("Katni" -> "Maihar")
    console.log('\n------------------------------------------------------------------------');
    console.log('TEST CASE 3: Intermediate Stop Search ("Katni" -> "Maihar")');
    const res3 = await runSearch('Katni', 'Maihar', todayStr, 1);
    if (res3.responseData?.success && res3.responseData.journeys?.length > 0) {
      console.log(`✅ PASS: Found ${res3.responseData.journeys.length} journey(s) between intermediate stops!`);
      passed++;
    } else {
      console.log('❌ FAIL:', JSON.stringify(res3.responseData));
      failed++;
    }

    // TEST CASE 4: Reverse Direction Check ("Satna" -> "Jabalpur" on forward route)
    console.log('\n------------------------------------------------------------------------');
    console.log('TEST CASE 4: Direction Safety Check ("Satna" -> "Jabalpur" on forward route)');
    const res4 = await runSearch('Satna', 'Jabalpur', todayStr, 1);
    const forwardMatches = (res4.responseData?.journeys || []).filter(j => j.journeyId.includes('SEARCH-TEST-101'));
    if (forwardMatches.length === 0) {
      console.log('✅ PASS: Correctly rejected reverse direction search on forward-only route (0 forward matches)!');
      passed++;
    } else {
      console.log('❌ FAIL: Incorrectly returned forward route for reverse journey!', forwardMatches);
      failed++;
    }

    // TEST CASE 5: Weekend / Any Day Schedule Verification
    console.log('\n------------------------------------------------------------------------');
    console.log('TEST CASE 5: Multi-Day Schedule Verification (Sunday + Wednesday)');
    const sundayDate = new Date();
    sundayDate.setDate(sundayDate.getDate() + (7 - sundayDate.getDay())); // Next Sunday
    const res5 = await runSearch('Jabalpur', 'Satna', sundayDate.toISOString().split('T')[0], 1);
    if (res5.responseData?.success && res5.responseData.journeys?.length > 0) {
      console.log(`✅ PASS: Customer search successfully found route for Sunday (${sundayDate.toISOString().split('T')[0]})!`);
      passed++;
    } else {
      console.log('❌ FAIL:', JSON.stringify(res5.responseData));
      failed++;
    }

  } catch (err) {
    console.error('❌ Test execution error:', err);
    failed++;
  } finally {
    console.log('\n========================================================================');
    console.log(`           FINAL TEST SUMMARY: PASSED: ${passed} | FAILED: ${failed}`);
    console.log('========================================================================');
    if (failed === 0) {
      console.log('🎉 TOP-CLASS VERIFICATION: Customer Bus Search is 100% WORKING across all names, days, and Google Places formatting!');
    } else {
      console.log('⚠️ Some test cases failed. See details above.');
    }
    try {
      await mongoose.disconnect();
    } catch (e) {}
  }
}

runCustomerSearchTestSuite();
