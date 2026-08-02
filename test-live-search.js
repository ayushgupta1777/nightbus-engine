// ==================== server/test-live-search.js ====================
require('dotenv').config();
const mongoose = require('mongoose');
const journeyController = require('./controllers/journeyController');

async function testLiveSearch() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bus_app';
  console.log('Connecting to:', mongoUri);
  await mongoose.connect(mongoUri);

  const datesToTest = ['2026-08-02', '2026-08-03', '2026-08-04'];
  const routesToTest = [
    { from: 'Jabalpur', to: 'Katni' },
    { from: 'Katni', to: 'Jabalpur' },
    { from: 'Jabalpur', to: 'Satna' },
    { from: 'Delhi', to: 'Agra Fort' },
    { from: 'Jaipur', to: 'Delhi' },
    { from: 'Katni', to: 'Indore' }
  ];

  for (const route of routesToTest) {
    for (const date of datesToTest) {
      let responseData = null;
      const req = {
        body: {
          from: route.from,
          to: route.to,
          date,
          passengers: 1
        }
      };
      const res = {
        status: () => ({ json: (d) => { responseData = d; } }),
        json: (d) => { responseData = d; }
      };

      await journeyController.searchJourneys(req, res);
      const count = responseData?.journeys?.length || 0;
      console.log(`[SEARCH] ${route.from} -> ${route.to} on ${date}: Found ${count} journey(s) (Success: ${responseData?.success})`);
      if (count > 0) {
        console.log(`   -> Sample Journey: ${responseData.journeys[0].journeyId} | Price: ₹${responseData.journeys[0].totalPrice}`);
      } else if (responseData?.suggestion) {
        console.log(`   -> Next available date suggestion: ${responseData.suggestion.nextAvailableDate}`);
      }
    }
  }

  await mongoose.disconnect();
}

testLiveSearch();
