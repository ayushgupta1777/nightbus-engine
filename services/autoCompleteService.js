// ==================== server/services/autoCompleteService.js ====================
const Segment = require('../models/Segment');
const Journey = require('../models/Journey');
const Bus = require('../models/Bus');
const Wallet = require('../models/Wallet');

/**
 * AUTO-COMPLETE SERVICE
 * Scans for segments where the travelDate is in the past and marks them as completed.
 * Also credits the bus owner's wallet and updates the parent Journey status.
 */
const autoCompletePastJourneys = async () => {
  try {
    const now = new Date();
    // We look for segments older than 24 hours to ensure the journey is definitely over
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Find past-dated segments that aren't completed or cancelled
    const pastSegments = await Segment.find({
      status: { $in: ['confirmed', 'boarded', 'in_transit'] },
      travelDate: { $lt: yesterday }
    });

    if (pastSegments.length === 0) return;

    console.log(`[AUTO-COMPLETE] Found ${pastSegments.length} past segments to complete`);

    const journeyIdsToUpdate = new Set();

    for (const segment of pastSegments) {
      segment.status = 'completed';
      segment.completedAt = segment.completedAt || now;
      if (!segment.exitVerifiedBy?.staffName) {
         segment.exitVerifiedBy = {
            staffName: 'System',
            method: 'auto'
         };
      }
      await segment.save();

      // Credit the bus owner's wallet if they haven't been credited yet
      try {
        const bus = await Bus.findById(segment.busId);
        if (bus && bus.ownerId && segment.ownerEarnings > 0) {
          await Wallet.atomicCredit(bus.ownerId, segment.ownerEarnings, {
            source: 'booking_completion',
            description: `Auto-complete earnings for segment #${segment._id.toString().slice(-6).toUpperCase()} (Seat ${segment.seatNumber})`,
            metadata: { segmentId: segment._id, autoCompleted: true }
          });
          console.log(`[AUTO-COMPLETE] Credited ₹${segment.ownerEarnings} to owner ${bus.ownerId} for segment ${segment._id}`);
        }
      } catch (creditErr) {
        console.error(`[AUTO-COMPLETE] Error crediting owner for segment ${segment._id}:`, creditErr.message);
      }
      
      if (segment.journeyId) {
        journeyIdsToUpdate.add(segment.journeyId.toString());
      }
    }

    // 2. Update parent Journeys
    for (const journeyId of journeyIdsToUpdate) {
      const journey = await Journey.findById(journeyId).populate('segments');
      if (journey && journey.status !== 'completed' && journey.status !== 'cancelled') {
        const allFinished = journey.segments.every(s => 
          ['completed', 'cancelled', 'rejected', 'refunded'].includes(s.status)
        );

        if (allFinished) {
          journey.status = 'completed';
          console.log(`[AUTO-COMPLETE] Marking Journey #${journey._id.toString().slice(-6).toUpperCase()} as COMPLETED`);
          await journey.save();
        }
      }
    }

    console.log('[AUTO-COMPLETE] Process completed');
  } catch (error) {
    console.error('[AUTO-COMPLETE ERROR]', error);
  }
};

exports.autoCompletePastJourneys = autoCompletePastJourneys;

/**
 * START THE AUTO-COMPLETE JOB
 * Runs every 6 hours
 */
exports.initAutoCompleteJob = () => {
  console.log('[JOBS] Initializing Auto-Complete background job (Every 6 hours)');

  // Run immediately on start
  autoCompletePastJourneys();

  // Schedule intervals (6 hours)
  setInterval(autoCompletePastJourneys, 6 * 60 * 60 * 1000);
};
