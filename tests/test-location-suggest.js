// ==================== server/test-location-suggest.js ====================
require('dotenv').config();
const mongoose = require('mongoose');
const locationController = require('./controllers/locationController');

async function testLocationSuggestions() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bus_app';
  console.log('Connecting to:', mongoUri);
  await mongoose.connect(mongoUri);

  const queries = ['Jabalpur', 'Katni', 'Satna', 'Del', 'Jai'];

  for (const q of queries) {
    let responseData = null;
    const req = {
      query: { query: q, limit: 10 }
    };
    const res = {
      json: (d) => { responseData = d; }
    };

    await locationController.searchLocations(req, res);
    console.log(`\n[SUGGESTION SEARCH] Query: "${q}" -> Success: ${responseData?.success} | Found: ${responseData?.locations?.length || 0}`);
    if (responseData?.locations && responseData.locations.length > 0) {
      responseData.locations.slice(0, 3).forEach((loc, idx) => {
        console.log(`   [${idx + 1}] name="${loc.name}" | state="${loc.state}" | type="${loc.type}" | isBusStop=${loc.isBusStop}`);
      });
    }
  }

  await mongoose.disconnect();
}

testLocationSuggestions();
