// ==================== server/scripts/qaResolver.js ====================
// Autonomous AI Pipeline Helper for resolving QA Feedback issues

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const QaFeedback = require('../models/QaFeedback');

const SCREEN_FILE_MAP = {
  HomeScreen: 'web/src/screens/customer/HomeScreen.jsx',
  SearchScreen: 'web/src/screens/customer/SearchScreen.jsx',
  JourneyResultsScreen: 'web/src/screens/customer/JourneyResultsScreen.jsx',
  SeatSelectionScreen: 'web/src/screens/customer/SeatSelectionScreen.jsx',
  PassengerDetailsScreen: 'web/src/screens/customer/PassengerDetailsScreen.jsx',
  BookingConfirmationScreen: 'web/src/screens/customer/BookingConfirmationScreen.jsx',
  MyBookingsScreen: 'web/src/screens/customer/MyBookingsScreen.jsx',
  BookingDetailsScreen: 'web/src/screens/customer/BookingDetailsScreen.jsx',
  LiveTrackingScreen: 'web/src/screens/customer/LiveTrackingScreen.jsx',
  YatraListScreen: 'web/src/screens/customer/YatraListScreen.jsx',
  YatraDetailsScreen: 'web/src/screens/customer/YatraDetailsScreen.jsx',
  RentalRequestScreen: 'web/src/screens/customer/RentalRequestScreen.jsx',
  FoodHomeScreen: 'web/src/screens/customer/FoodHomeScreen.jsx',
  WalletScreen: 'web/src/screens/customer/WalletScreen.jsx',
  ProfileScreen: 'web/src/screens/common/ProfileScreen.jsx',
  LoginScreen: 'web/src/screens/auth/LoginScreen.jsx',
  TestLoginScreen: 'web/src/screens/auth/TestLoginScreen.jsx',
  OwnerDashboardScreen: 'web/src/screens/owner/OwnerDashboardScreen.jsx',
  BusManagementScreen: 'web/src/screens/owner/BusManagementScreen.jsx',
  SmartRouteBuilderScreen: 'web/src/screens/owner/SmartRouteBuilderScreen.jsx',
  OwnerYatraScreen: 'web/src/screens/owner/OwnerYatraScreen.jsx',
  StaffDashboardScreen: 'web/src/screens/staff/StaffDashboardScreen.jsx',
  QRScannerScreen: 'web/src/screens/staff/QRScannerScreen.jsx',
  PassengerManifestScreen: 'web/src/screens/staff/PassengerManifestScreen.jsx',
  ManualVerificationScreen: 'web/src/screens/staff/ManualVerificationScreen.jsx',
  ManualLocationScreen: 'web/src/screens/staff/ManualLocationScreen.jsx',
  DeveloperDashboardScreen: 'web/src/screens/developer/DeveloperDashboardScreen.jsx'
};

async function main() {
  const args = process.argv.slice(2);
  const action = args[0] || '--next';

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI missing in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try {
    if (action === '--list') {
      const pending = await QaFeedback.find({ status: 'pending' }).sort({ createdAt: 1 }).lean();
      console.log(`\n📋 Found ${pending.length} pending QA issue(s):\n`);
      pending.forEach((issue, index) => {
        console.log(`[${index + 1}] ID: ${issue._id} | [${issue.severity.toUpperCase()}] ${issue.title}`);
        console.log(`    Route: ${issue.route} | Screen: ${issue.screenName} | Role: ${issue.userRole}`);
      });
      console.log('');
    } else if (action === '--resolve') {
      const id = args[1];
      const notesIndex = args.indexOf('--notes');
      const notes = notesIndex !== -1 ? args.slice(notesIndex + 1).join(' ') : 'Resolved by Antigravity AI';

      if (!id) {
        console.error('❌ Usage: node qaResolver.js --resolve <id> --notes "<resolution notes>"');
        process.exit(1);
      }

      const updated = await QaFeedback.findByIdAndUpdate(
        id,
        {
          status: 'resolved',
          aiResolutionNotes: notes,
          resolvedAt: new Date()
        },
        { new: true }
      );

      if (!updated) {
        console.error(`❌ Issue ${id} not found.`);
      } else {
        console.log(`✅ Issue ${id} marked as RESOLVED!`);
        console.log(`   Notes: ${notes}`);
      }
    } else {
      // Default: --next (Fetch next pending issue for AI resolution)
      const severityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
      const pendingIssues = await QaFeedback.find({ status: 'pending' }).lean();

      if (!pendingIssues || pendingIssues.length === 0) {
        console.log('\n🎉 No pending QA issues in queue! System is completely clean.\n');
        process.exit(0);
      }

      pendingIssues.sort((a, b) => {
        const aSev = severityOrder[a.severity] || 3;
        const bSev = severityOrder[b.severity] || 3;
        if (aSev !== bSev) return aSev - bSev;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      const issue = pendingIssues[0];
      const targetFilePath = SCREEN_FILE_MAP[issue.screenName] || 'web/src/screens/...';

      console.log('\n============================================================');
      console.log('🤖 ANTIGRAVITY AI RESOLVER: NEXT PENDING QA TICKET');
      console.log('============================================================');
      console.log(`Issue ID    : ${issue._id}`);
      console.log(`Title       : ${issue.title}`);
      console.log(`Severity    : [${issue.severity.toUpperCase()}] | Type: ${issue.type}`);
      console.log(`Route       : ${issue.route}`);
      console.log(`Screen Name : ${issue.screenName}`);
      console.log(`Target File : ${targetFilePath}`);
      console.log(`User Role   : ${issue.userRole} (Mode: ${issue.viewport?.mode || 'phone'})`);
      console.log(`Created At  : ${new Date(issue.createdAt).toLocaleString()}`);
      console.log('------------------------------------------------------------');
      console.log('Description & Desired Change:');
      console.log(issue.description);
      console.log('------------------------------------------------------------');

      if (issue.consoleLogs && issue.consoleLogs.length > 0) {
        console.log('Auto-Captured Console Logs:');
        issue.consoleLogs.forEach((l, i) => console.log(`  [${i + 1}] ${l}`));
        console.log('------------------------------------------------------------');
      }

      console.log(`To mark resolved when done:`);
      console.log(`  node scripts/qaResolver.js --resolve ${issue._id} --notes "Fixed problem in ${issue.screenName}"\n`);
    }
  } catch (err) {
    console.error('Error in qaResolver:', err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
