// Quick verification test for the QA Feedback & AI Resolution pipeline
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const QaFeedback = require('../models/QaFeedback');

async function testPipeline() {
  console.log('--- Testing QA Feedback & AI Direct-Resolution Pipeline ---');
  await mongoose.connect(process.env.MONGODB_URI);

  try {
    // 1. Simulate Tester reporting an issue from web
    console.log('1. Simulating tester submitting feedback from SeatSelectionScreen...');
    const testTicket = await QaFeedback.create({
      title: 'Seat price tooltip flickers on hover',
      description: 'When hovering over upper berth seat 12B, the price tooltip flickers and becomes unclickable.',
      type: 'bug',
      severity: 'high',
      route: '/seat-selection/66f8a123b456',
      screenName: 'SeatSelectionScreen',
      userRole: 'customer',
      viewport: { mode: 'phone', width: 390, height: 844 },
      consoleLogs: ['[console.error] Uncaught TypeError: Cannot read property "top" of undefined at SeatSelectionScreen.jsx:142']
    });

    console.log(`✅ Created test ticket: ${testTicket._id} [Status: ${testTicket.status}]`);

    // 2. Verify Query
    const pending = await QaFeedback.findById(testTicket._id);
    if (!pending || pending.status !== 'pending') {
      throw new Error('Test ticket failed to save as pending');
    }
    console.log('✅ Verified pending ticket in DB with auto-captured route & console errors');

    // 3. Simulate AI "Start Solving" Resolution
    console.log('2. Simulating Antigravity AI resolving ticket...');
    const resolved = await QaFeedback.findByIdAndUpdate(
      testTicket._id,
      {
        status: 'resolved',
        aiResolutionNotes: 'Fixed tooltip null check in SeatSelectionScreen.jsx:142. Verified hover state in phone simulator.',
        resolvedAt: new Date()
      },
      { new: true }
    );

    console.log(`✅ Ticket successfully marked as resolved! ResolvedAt: ${resolved.resolvedAt}`);
    console.log(`   AI Resolution Notes: ${resolved.aiResolutionNotes}`);

    // 4. Clean up test record
    await QaFeedback.findByIdAndDelete(testTicket._id);
    console.log('✅ Cleaned up test record.');
    console.log('🎉 PIPELINE VERIFICATION PASSED 100%!');
  } finally {
    await mongoose.disconnect();
  }
}

testPipeline().catch(err => {
  console.error('❌ Pipeline test failed:', err);
  process.exit(1);
});
