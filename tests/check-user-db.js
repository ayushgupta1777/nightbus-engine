// ==================== server/check-user-db.js ====================
require('dotenv').config();
const mongoose = require('mongoose');
const Route = require('./models/Route');
const Bus = require('./models/Bus');
const User = require('./models/User');

async function inspectUserDatabase() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bus_app';
  console.log('🔍 Connecting to:', mongoUri);

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected successfully!');

    const busCount = await Bus.countDocuments();
    const activeBusCount = await Bus.countDocuments({ isActive: true });
    const routeCount = await Route.countDocuments();
    const activeRouteCount = await Route.countDocuments({ isActive: true });

    console.log(`\n📊 DATABASE OVERVIEW:`);
    console.log(`   Total Buses: ${busCount} (${activeBusCount} active)`);
    console.log(`   Total Routes: ${routeCount} (${activeRouteCount} active)`);

    const routes = await Route.find().populate('busId').lean();
    console.log(`\n🛣️ EXISTING ROUTES DETAILS:`);
    if (routes.length === 0) {
      console.log('   ⚠️ No routes found in the database!');
    } else {
      routes.forEach((r, idx) => {
        console.log(`\n--- ROUTE #${idx + 1} ---`);
        console.log(`   ID: ${r._id}`);
        console.log(`   Name: "${r.routeName}" | Code: ${r.routeCode}`);
        console.log(`   Active: ${r.isActive}`);
        console.log(`   Bus: ${r.busId ? `${r.busId.busName} (${r.busId.busNumber}) - Active: ${r.busId.isActive}` : '❌ NO BUS LINKED OR BUS DELETED'}`);
        console.log(`   ScheduleType: ${r.scheduleType} | Days: ${JSON.stringify(r.days)}`);
        console.log(`   Rounds: ${r.rounds ? r.rounds.length : 0}`);
        console.log(`   Stops (${r.stops ? r.stops.length : 0}):`);
        if (r.stops) {
          r.stops.forEach((s, sIdx) => {
            console.log(`      [${sIdx}] name="${s.name}" | village="${s.village || ''}" | district="${s.district || ''}" | dep="${s.departureTime}"`);
          });
        }
      });
    }

  } catch (err) {
    console.error('❌ Error inspecting DB:', err);
  } finally {
    try { await mongoose.disconnect(); } catch(e) {}
  }
}

inspectUserDatabase();
