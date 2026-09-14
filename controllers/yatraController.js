// ==================== controllers/yatraController.js ====================
const YatraPackage = require('../models/YatraPackage');
const YatraBooking = require('../models/YatraBooking');
const Bus = require('../models/Bus');
const Wallet = require('../models/Wallet');
const walletController = require('./walletController');
const fs = require('fs');
const path = require('path');

// ============================================================
// OWNER APIS
// ============================================================

/**
 * POST /yatra/owner/packages/upload-images
 * Upload images for a yatra package
 */
exports.uploadYatraImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const backupDir = path.join(__dirname, '../../../backups/yatra_images');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const filePaths = [];
    
    for (const file of req.files) {
      // file path in the local server uploads dir (Multer will save it there based on config in route)
      const localUrlPath = `/uploads/yatra/${file.filename}`;
      filePaths.push(localUrlPath);

      // Copy to backup dir
      const backupFilePath = path.join(backupDir, file.filename);
      fs.copyFileSync(file.path, backupFilePath);
    }

    res.status(200).json({ success: true, data: filePaths, message: 'Images uploaded and backed up successfully' });
  } catch (error) {
    console.error('Yatra image upload error:', error);
    res.status(500).json({ success: false, message: 'Server error during upload' });
  }
};

/**  
 * POST /yatra/owner/packages
 * Create a new Yatra package
 */
exports.createPackage = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const {
      busId, title, description, category, highlights,
      startDate, endDate, departurePoint, destinationCity, itinerary,
      inclusions, exclusions, pricePerPerson, totalSeats,
      contactPhone, images, pickupPoints
    } = req.body;

    // Validate bus ownership
    const bus = await Bus.findOne({ _id: busId, ownerId });
    if (!bus) {
      return res.status(403).json({ success: false, message: 'Bus not found or not authorized' });
    }

    if (!title || !startDate || !endDate || !pricePerPerson || !totalSeats || !destinationCity) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    const pkg = new YatraPackage({
      ownerId,
      busId,
      title,
      description,
      category: category || 'religious',
      highlights: highlights || [],
      startDate,
      endDate,
      departurePoint,
      pickupPoints: pickupPoints || [],
      itinerary: itinerary || [],
      inclusions: inclusions || [],
      exclusions: exclusions || [],
      pricePerPerson,
      totalSeats,
      destinationCity,
      contactPhone,
      images: images || [],
      status: req.body.status || 'draft'
    });

    await pkg.save();
    res.status(201).json({ success: true, data: pkg });
  } catch (error) {
    console.error('Create Yatra package error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /yatra/owner/packages
 * List all packages belonging to the owner
 */
exports.getOwnerPackages = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const packages = await YatraPackage.find({ ownerId })
      .populate('busId', 'busNumber busType')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /yatra/owner/packages/:id
 * Update a package (only if draft or active)
 */
exports.updatePackage = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const pkg = await YatraPackage.findOne({ _id: req.params.id, ownerId });
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

    if (['completed', 'cancelled'].includes(pkg.status)) {
      return res.status(400).json({ success: false, message: 'Cannot edit a completed or cancelled package' });
    }

    const allowed = [
      'busId', 'title', 'description', 'highlights', 'startDate', 'endDate',
      'departurePoint', 'pickupPoints', 'destinationCity', 'itinerary', 'inclusions', 'exclusions', 
      'pricePerPerson', 'totalSeats', 'contactPhone', 'images', 'status', 'category'
    ];

    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        pkg[field] = req.body[field];
      }
    });

    await pkg.save();
    res.json({ success: true, data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /yatra/owner/packages/:id/complete
 * Complete a Yatra and credit the owner's wallet
 */
exports.completeYatra = async (req, res) => {
  try {
    const ownerId = req.user.id;
    
    // 1. Atomic Status Update to prevent double-completion payouts
    const pkg = await YatraPackage.findOneAndUpdate(
      { 
        _id: req.params.id, 
        ownerId,
        status: { $in: ['active', 'full'] }
      },
      { status: 'completed' },
      { new: true }
    );

    if (!pkg) {
      // Check why it failed
      const checkPkg = await YatraPackage.findOne({ _id: req.params.id, ownerId });
      if (!checkPkg) return res.status(404).json({ success: false, message: 'Package not found' });
      return res.status(400).json({ success: false, message: `Cannot complete a ${checkPkg.status} package (may already be completed).` });
    }

    // Find all valid bookings
    const bookings = await YatraBooking.find({
      packageId: pkg._id,
      status: 'confirmed',
      paymentStatus: 'paid'
    });

    let totalRevenue = 0;
    bookings.forEach(b => { totalRevenue += b.totalAmount; });

    // Platform Commission (10%)
    const commissionRate = 0.10;
    const platformFee = totalRevenue * commissionRate;
    const ownerPayout = totalRevenue - platformFee;

    // Credit Owner Wallet
    if (ownerPayout > 0) {
      try {
        await Wallet.atomicCredit(ownerId, ownerPayout, {
          transactionId: `YTR_PAYOUT_${pkg._id.toString().slice(-8)}`,
          source: 'yatra_payout',
          description: `Payout for completed Yatra: ${pkg.title} (Revenue: ₹${totalRevenue}, Commission: ₹${platformFee})`
        });
      } catch (walletErr) {
        // If wallet fails, we should ideally rollback status to 'active' or queue it for retry. 
        // For now, log critically.
        console.error(`CRITICAL: Wallet payout failed for completed Yatra ${pkg._id}:`, walletErr.message);
        return res.status(500).json({ success: false, message: 'Wallet payout failed: ' + walletErr.message });
      }
    }

    res.json({
      success: true,
      message: 'Yatra completed successfully. Earnings credited to wallet.',
      data: {
        totalRevenue,
        platformFee,
        ownerPayout
      }
    });
  } catch (error) {
    console.error('Yatra complete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /yatra/owner/packages/:id/cancel
 * Owner cancels a Yatra, automatically refunding all customers
 */
exports.cancelYatraByOwner = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const pkg = await YatraPackage.findOne({ _id: req.params.id, ownerId });
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

    if (pkg.status === 'completed' || pkg.status === 'cancelled') {
      return res.status(400).json({ success: false, message: `Package is already ${pkg.status}` });
    }

    // Find all paid bookings
    const bookings = await YatraBooking.find({
      packageId: pkg._id,
      status: 'confirmed',
      paymentStatus: 'paid'
    });

    let refundedCount = 0;
    let totalRefunded = 0;

    // Mass Refund
    for (const booking of bookings) {
      try {
        await Wallet.atomicCredit(booking.customerId, booking.totalAmount, {
          transactionId: `REFUND_YTR_CANCEL_${booking._id.toString().slice(-8)}`,
          source: 'money_added',
          description: `Refund for cancelled Yatra: ${pkg.title}`
        });

        booking.status = 'cancelled';
        booking.paymentStatus = 'refunded';
        booking.cancellationDate = new Date();
        booking.cancellationReason = req.body.reason || 'Cancelled by organizer';
        booking.refundAmount = booking.totalAmount;
        await booking.save();
        
        refundedCount++;
        totalRefunded += booking.totalAmount;
      } catch (err) {
        console.error(`Failed to refund booking ${booking._id}:`, err.message);
      }
    }

    pkg.status = 'cancelled';
    pkg.bookedSeats = 0; // release all seats
    await pkg.save();

    res.json({
      success: true,
      message: `Yatra cancelled successfully. Refunded ${refundedCount} bookings (Total: ₹${totalRefunded}).`,
      data: pkg
    });
  } catch (error) {
    console.error('Yatra cancel error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /yatra/owner/packages/:id
 * Delete only draft packages
 */
exports.deletePackage = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const pkg = await YatraPackage.findOne({ _id: req.params.id, ownerId });
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

    if (pkg.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft packages can be deleted. Cancel it first.' });
    }

    await YatraPackage.findByIdAndDelete(pkg._id);
    res.json({ success: true, message: 'Package deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /yatra/owner/packages/:id/bookings
 * See all bookings for a specific package
 */
exports.getPackageBookings = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const pkg = await YatraPackage.findOne({ _id: req.params.id, ownerId });
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

    const bookings = await YatraBooking.find({ packageId: pkg._id })
      .populate('customerId', 'name phone email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// CUSTOMER APIS
// ============================================================

/**
 * GET /yatra/packages
 * Browse all active Yatra packages
 */
exports.listPackages = async (req, res) => {
  try {
    const { category, city } = req.query;

    const query = { 
      status: 'active',
      startDate: { $gte: new Date() }
    };

    if (category) {
      query.category = category;
    }

    if (city) {
      query['departurePoint.city'] = { $regex: city, $options: 'i' };
    }

    const packages = await YatraPackage.find(query)
      .populate('busId', 'busNumber busType amenities')
      .populate('ownerId', 'name phone')
      .sort({ startDate: 1 });

    res.json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /yatra/packages/:id
 * Full details of a single Yatra package
 */
exports.getPackageDetails = async (req, res) => {
  try {
    const pkg = await YatraPackage.findById(req.params.id)
      .populate('busId', 'busNumber busType amenities totalSeats')
      .populate('ownerId', 'name phone');

    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    if (!['active', 'full'].includes(pkg.status)) {
      return res.status(404).json({ success: false, message: 'Package not available' });
    }
    if (pkg.startDate < new Date()) {
      return res.status(400).json({ success: false, message: 'This Yatra has already departed/started' });
    }

    res.json({ success: true, data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /yatra/book
 * Customer books seats in a Yatra (Hardened for Concurrency)
 */
exports.bookPackage = async (req, res) => {
  try {
    const customerId = req.user._id || req.user.id || req.userId;
    const { packageId, passengers, mealPreference, specialRequests, paymentMethod, idempotencyKey } = req.body;

    if (!packageId || !passengers || passengers.length === 0) {
      return res.status(400).json({ success: false, message: 'packageId and passengers are required' });
    }

    // 1. Idempotency Check (Double-Tap Prevention)
    if (idempotencyKey) {
      const existingBooking = await YatraBooking.findOne({ idempotencyKey, customerId });
      if (existingBooking) {
        return res.json({ success: true, message: 'Booking already processed', data: existingBooking });
      }
    }

    const seatsRequested = passengers.length;

    // 2. ATOMIC SEAT RESERVATION (Race Condition Fix)
    // Find active package with enough seats and atomically increment bookedSeats
    const pkg = await YatraPackage.findOneAndUpdate(
      {
        _id: packageId,
        status: 'active',
        startDate: { $gte: new Date() },
        $expr: { $gte: [ { $subtract: ["$totalSeats", "$bookedSeats"] }, seatsRequested ] }
      },
      {
        $inc: { bookedSeats: seatsRequested }
      },
      { new: true } // Return updated doc
    );

    if (!pkg) {
      // Check WHY it failed
      const checkPkg = await YatraPackage.findById(packageId);
      if (!checkPkg) return res.status(404).json({ success: false, message: 'Package not found' });
      if (checkPkg.status !== 'active') return res.status(400).json({ success: false, message: `Package is ${checkPkg.status}` });
      if (checkPkg.startDate < new Date()) return res.status(400).json({ success: false, message: 'Yatra has already departed' });
      
      return res.status(400).json({
        success: false,
        message: 'Sorry, not enough seats available. Someone else just booked them!'
      });
    }

    const totalAmount = pkg.pricePerPerson * seatsRequested;
    const boardingOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Create Booking Record
    const booking = new YatraBooking({
      packageId,
      customerId,
      passengers,
      seatsBooked: seatsRequested,
      pricePerPerson: pkg.pricePerPerson,
      totalAmount,
      mealPreference: mealPreference || 'veg',
      specialRequests,
      boardingOtp,
      status: 'confirmed',
      paymentStatus: 'pending',
      idempotencyKey
    });

    // 4. Payment Processing (with Rollback Safety)
    try {
      if (paymentMethod === 'card' || paymentMethod === 'upi' || paymentMethod === 'razorpay') {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
          throw new Error('Missing Razorpay signature details');
        }
        
        const crypto = require('crypto');
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                                        .update(body.toString())
                                        .digest('hex');

        if (expectedSignature !== razorpay_signature) {
          throw new Error('Invalid payment signature from Razorpay');
        }

        await Wallet.atomicCredit(customerId, totalAmount, {
          transactionId: `YTR_DEP_${booking._id.toString()}`,
          source: 'money_added',
          description: `Online Payment Deposit (via Razorpay ${razorpay_payment_id})`
        });
      }

      // Deduct from wallet
      await walletController.deductMoney(customerId, totalAmount, {
        purpose: 'yatra_booking',
        bookingId: booking._id.toString(),
        description: `Yatra booking: ${pkg.title} (${seatsRequested} seat${seatsRequested > 1 ? 's' : ''})`
      });

      booking.paymentStatus = 'paid';
      booking.transactionId = `YTR_${booking._id.toString().slice(-8).toUpperCase()}`;
      await booking.save();

      // Update package revenue (seat is already incremented)
      await YatraPackage.findByIdAndUpdate(pkg._id, {
        $inc: { totalRevenue: totalAmount }
      });

      res.status(201).json({ success: true, data: booking });

    } catch (payErr) {
      // 5. ROLLBACK on Payment Failure
      console.warn(`Payment failed for booking ${booking._id}, rolling back seats...`);
      await YatraPackage.findByIdAndUpdate(pkg._id, {
        $inc: { bookedSeats: -seatsRequested }
      });
      return res.status(400).json({ success: false, message: 'Payment failed: ' + payErr.message });
    }

  } catch (error) {
    console.error('Yatra booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /yatra/my-bookings
 * Customer's own Yatra bookings & tickets
 */
exports.getMyBookings = async (req, res) => {
  try {
    const Journey = require('../models/Journey');
    const mongoose = require('mongoose');

    // Robustly extract userId — always cast to ObjectId to avoid string vs ObjectId mismatch
    const rawId = req.user?._id || req.user?.id || req.userId;
    if (!rawId) {
      return res.json({ success: true, data: [] });
    }

    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(rawId.toString());
    } catch (e) {
      console.error('❌ Invalid userId format:', rawId);
      return res.json({ success: true, data: [] });
    }

    console.log(`📋 getMyBookings called for user: ${userObjectId}`);

    // 1. Fetch YatraPackage bookings — search by both ObjectId forms to be safe
    const yatraBookings = await YatraBooking.find({
      customerId: userObjectId
    })
      .populate('packageId', 'title startDate endDate departurePoint category pricePerPerson status images pickupPoints')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${yatraBookings.length} yatra bookings for ${userObjectId}`);



    // 2. Fetch Journey Yatra tickets (where isYatra === true or bookingType === 'yatra')
    let journeyYatras = [];
    try {
      journeyYatras = await Journey.find({
        $and: [
          { customerId: userObjectId },
          {
            $or: [
              { isYatra: true },
              { bookingType: 'yatra' },
              { bookingType: 'package' }
            ]
          }
        ]
      })
        .populate({
          path: 'segments',
          populate: [{ path: 'busId' }, { path: 'routeId' }]
        })
        .sort({ createdAt: -1 });
    } catch (jErr) {
      console.warn('⚠️ Could not query Journey Yatra tickets:', jErr.message);
    }


    // Format Journey Yatra tickets to align with YatraBooking interface
    const formattedJourneyYatras = (journeyYatras || []).map(j => {
      const seg = j.segments?.[0] || {};
      return {
        _id: j._id,
        isJourneyTicket: true,
        customerId: j.customerId,
        status: j.status,
        totalAmount: j.totalAmount,
        seatsBooked: seg.seatNumber ? 1 : 1,
        boardingOtp: seg.boardingOTP?.code,
        packageId: {
          title: seg.routeId?.routeName || 'Yatra Ticket Journey',
          startDate: seg.travelDate || j.createdAt,
          endDate: seg.travelDate || j.createdAt,
          departurePoint: { city: seg.fromStop?.name || 'Origin' },
          category: 'Yatra Ticket',
          status: j.status
        },
        createdAt: j.createdAt,
        updatedAt: j.updatedAt
      };
    });

    // Merge both arrays (prevent duplicates by _id)
    const combinedMap = new Map();
    yatraBookings.forEach(b => combinedMap.set(b._id.toString(), b));
    formattedJourneyYatras.forEach(b => {
      if (!combinedMap.has(b._id.toString())) {
        combinedMap.set(b._id.toString(), b);
      }
    });

    const combinedList = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    res.json({ success: true, data: combinedList });
  } catch (error) {
    console.error('❌ getMyBookings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /yatra/bookings/:id
 * Get single booking details
 */
exports.getBookingDetails = async (req, res) => {
  try {
    const booking = await YatraBooking.findOne({
      _id: req.params.id,
      customerId: req.user.id
    }).populate('packageId');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /yatra/bookings/:id/cancel
 * Customer cancels their Yatra booking
 */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await YatraBooking.findOne({
      _id: req.params.id,
      customerId: req.user.id
    }).populate('packageId');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Already cancelled' });
    }
    if (booking.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed trip' });
    }

    const pkg = booking.packageId;
    const now = new Date();
    const startDate = new Date(pkg.startDate);
    const daysUntilStart = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));

    // Refund policy
    let refundAmount = 0;
    if (daysUntilStart >= 7) {
      refundAmount = booking.totalAmount; // 100% refund
    } else if (daysUntilStart >= 3) {
      refundAmount = booking.totalAmount * 0.5; // 50% refund
    } else {
      refundAmount = 0; // No refund within 3 days
    }

    // Process refund
    if (refundAmount > 0 && booking.paymentStatus === 'paid') {
      try {
        await Wallet.atomicCredit(booking.customerId, refundAmount, {
          transactionId: `REFUND_YTR_${booking._id.toString().slice(-8)}`,
          source: 'money_added',
          description: `Refund for cancelled Yatra: ${pkg.title}`
        });
        booking.paymentStatus = 'refunded';
      } catch (e) {
        console.error('Refund failed:', e);
      }
    }

    booking.status = 'cancelled';
    booking.cancellationDate = now;
    booking.cancellationReason = req.body.reason || 'Customer cancelled';
    booking.refundAmount = refundAmount;

    await booking.save();

    // Free up seats in package
    const yatraPkg = await YatraPackage.findById(booking.packageId._id || booking.packageId);
    if (yatraPkg) {
      yatraPkg.bookedSeats = Math.max(0, yatraPkg.bookedSeats - booking.seatsBooked);
      if (yatraPkg.status === 'full') yatraPkg.status = 'active';
      await yatraPkg.save();
    }

    res.json({
      success: true,
      data: booking,
      refundAmount,
      message: refundAmount > 0
        ? `Booking cancelled. ₹${refundAmount} refunded to your wallet.`
        : 'Booking cancelled. No refund applicable (within 3 days of trip).'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
