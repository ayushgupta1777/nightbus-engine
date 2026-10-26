const request = require('supertest');
const { app } = require('../../server');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Bus = require('../../models/Bus');
const Route = require('../../models/Route');
const Journey = require('../../models/Journey');
const Segment = require('../../models/Segment');
const Wallet = require('../../models/Wallet');
const Settlement = require('../../models/Settlement');

describe('Comprehensive End-to-End Bus Booking & Payout Lifecycle', () => {
  it('Executes complete lifecycle: Registration -> Bus/Route Creation -> Booking -> QR Boarding -> Exit OTP -> Owner Wallet Payout -> Withdrawal -> Admin Settlement', async () => {
    const timestamp = Date.now();

    // 1. Register & Login Owner
    const ownerEmail = `owner_${timestamp}@test.com`;
    await request(app).post('/api/auth/register').send({
      name: 'E2E Bus Owner',
      email: ownerEmail,
      phone: `91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: 'password123',
      role: 'owner'
    });
    const ownerLogin = await request(app).post('/api/auth/login').send({
      email: ownerEmail,
      password: 'password123'
    });
    const ownerToken = ownerLogin.body.token;
    const ownerUser = await User.findOne({ email: ownerEmail });
    expect(ownerToken).toBeDefined();

    // Enable auto-confirm on owner settings
    ownerUser.ownerSettings = { autoConfirmBookings: true };
    await ownerUser.save();

    // 2. Register & Login Customer
    const customerEmail = `customer_${timestamp}@test.com`;
    await request(app).post('/api/auth/register').send({
      name: 'E2E Passenger',
      email: customerEmail,
      phone: `91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: 'password123',
      role: 'customer'
    });
    const customerLogin = await request(app).post('/api/auth/login').send({
      email: customerEmail,
      password: 'password123'
    });
    const customerToken = customerLogin.body.token;
    const customerUser = await User.findOne({ email: customerEmail });
    expect(customerToken).toBeDefined();

    // 3. Register & Login Staff
    const staffEmail = `staff_${timestamp}@test.com`;
    await request(app).post('/api/auth/register').send({
      name: 'E2E Conductor',
      email: staffEmail,
      phone: `91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: 'password123',
      role: 'staff'
    });
    const staffLogin = await request(app).post('/api/auth/login').send({
      email: staffEmail,
      password: 'password123'
    });
    const staffToken = staffLogin.body.token;
    const staffUser = await User.findOne({ email: staffEmail });
    staffUser.permissions.set('verify_ticket', true);
    staffUser.permissions.set('manage_boarding', true);
    staffUser.permissions.set('verify_drop', true);
    await staffUser.save();
    expect(staffToken).toBeDefined();

    // 4. Register & Login Admin
    const adminEmail = `admin_${timestamp}@test.com`;
    await request(app).post('/api/auth/register').send({
      name: 'E2E Super Admin',
      email: adminEmail,
      phone: `91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: 'password123',
      role: 'admin'
    });
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: adminEmail,
      password: 'password123'
    });
    const adminToken = adminLogin.body.token;
    expect(adminToken).toBeDefined();

    // 5. Owner creates Bus
    const busRes = await request(app)
      .post('/api/owner/buses')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        busNumber: `NB-${Date.now().toString().slice(-4)}`,
        busType: 'AC Seater',
        totalSeats: 30,
        registrationNumber: `MP09E2E${Math.floor(1000 + Math.random() * 9000)}`,
        chassisNumber: `CHAS${Date.now().toString().slice(-12)}X`,
        insurancePolicyNumber: 'INS-E2E-1234',
        insuranceIssueDate: new Date().toISOString(),
        insuranceExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        permitNumber: 'PERM-E2E-5678',
        permitIssueDate: new Date().toISOString(),
        permitExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        fitnessNumber: 'FIT-E2E-9012'
      });
    expect(busRes.statusCode).toBe(201);
    const createdBus = busRes.body.data.bus;
    expect(createdBus.totalSeats).toBe(30);

    // 6. Owner creates Route
    const createdRoute = await Route.create({
      ownerId: ownerUser._id,
      busId: createdBus._id,
      routeName: 'Indore to Bhopal Express',
      routeCode: `IBE${Date.now().toString().slice(-4)}`,
      totalDistance: 190,
      estimatedDuration: 240,
      basePrice: 450,
      stops: [
        { name: 'Indore Navlakha', sequence: 1, coordinates: { latitude: 22.7196, longitude: 75.8577 } },
        { name: 'Dewas Bypass', sequence: 2, coordinates: { latitude: 22.9676, longitude: 76.0534 } },
        { name: 'Bhopal ISBT', sequence: 3, coordinates: { latitude: 23.2599, longitude: 77.4126 } }
      ],
      price: 450,
      totalSeats: 30,
      availableSeats: 30,
      status: 'active'
    });
    expect(createdRoute._id).toBeDefined();

    // 7. Customer locks seat
    const lockRes = await request(app)
      .post('/api/bookings/lock-seats')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        routeId: createdRoute._id,
        busId: createdBus._id,
        travelDate: new Date().toISOString(),
        seats: ['A1']
      });
    expect(lockRes.statusCode).toBe(200);
    expect(lockRes.body.success).toBe(true);

    // 8. Customer completes booking using Wallet
    await Wallet.atomicCredit(customerUser._id, 1000, {
      source: 'manual',
      description: 'Initial funds'
    });

    const bookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        segments: [{
          routeId: createdRoute._id,
          busId: createdBus._id,
          fromStop: { name: 'Indore Navlakha' },
          toStop: { name: 'Bhopal ISBT' },
          seatNumber: 'A1',
          seatGender: 'male',
          travelDate: new Date().toISOString(),
          price: 450,
          departureTime: '06:00',
          arrivalTime: '10:00',
          passengerDetails: {
            name: 'E2E Passenger',
            age: 28,
            gender: 'male'
          }
        }],
        totalAmount: 450,
        paymentMethod: 'wallet'
      });
    expect(bookingRes.statusCode).toBe(200);
    expect(bookingRes.body.success).toBe(true);
    const createdJourney = bookingRes.body.journey;
    expect(createdJourney.status).toBe('confirmed');

    const createdSegment = createdJourney.segments[0];
    expect(createdSegment.seatNumber).toBe('A1');
    expect(createdSegment.ownerEarnings).toBe(Math.round(450 * 0.9));

    // 9. Staff scans ticket QR and confirms boarding
    const boardingRes = await request(app)
      .post('/api/staff/verify-boarding')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        segmentId: createdSegment._id,
        method: 'qr_scan',
        location: { latitude: 22.7196, longitude: 75.8577 }
      });
    expect(boardingRes.statusCode).toBe(200);
    expect(boardingRes.body.success).toBe(true);
    expect(boardingRes.body.data.segment.status).toBe('boarded');

    // 10. Staff verifies drop / exit -> Owner Wallet credited atomically!
    const refreshedSegment = await Segment.findById(createdSegment._id);
    const dropRes = await request(app)
      .post('/api/staff/verify-drop')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        segmentId: createdSegment._id,
        otp: refreshedSegment.exitOTP.code
      });
    expect(dropRes.statusCode).toBe(200);
    expect(dropRes.body.success).toBe(true);

    const finalSegment = await Segment.findById(createdSegment._id);
    expect(finalSegment.status).toBe('completed');

    // Verify Owner Wallet received payout
    const ownerWallet = await Wallet.findOne({ userId: ownerUser._id });
    expect(ownerWallet).toBeDefined();
    expect(ownerWallet.balance).toBe(createdSegment.ownerEarnings);

    // 11. Owner requests payout (withdrawal) to bank account
    const payoutRes = await request(app)
      .post('/api/wallet/payout-request')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        amount: ownerWallet.balance,
        bankDetails: 'HDFC Bank - A/C 50100234567890 - IFSC HDFC0001234'
      });
    expect(payoutRes.statusCode).toBe(201);
    expect(payoutRes.body.success).toBe(true);
    expect(payoutRes.body.settlement.status).toBe('pending');

    // Wallet balance deducted (held in settlement escrow)
    const ownerWalletAfter = await Wallet.findOne({ userId: ownerUser._id });
    expect(ownerWalletAfter.balance).toBe(0);

    // 12. Admin approves and finalizes the settlement
    const pendingSettlement = await Settlement.findOne({ ownerId: ownerUser._id, status: 'pending' });
    expect(pendingSettlement).toBeDefined();

    const approvalRes = await request(app)
      .patch(`/api/admin/settlements/${pendingSettlement._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'paid',
        transactionId: `UTR${Date.now()}BANKREF`,
        notes: 'Disbursed via IMPS'
      });
    expect(approvalRes.statusCode).toBe(200);
    expect(approvalRes.body.success).toBe(true);
    expect(approvalRes.body.settlement.status).toBe('paid');
    expect(approvalRes.body.settlement.paidAt).toBeDefined();
  });

  it('Executes Cancellation & Refund Flow: Customer requests cancellation -> Owner approves -> Atomic Wallet Refund', async () => {
    const timestamp = Date.now() + 1000;

    // 1. Register & Login Owner
    const ownerEmail = `owner_cancel_${timestamp}@test.com`;
    await request(app).post('/api/auth/register').send({
      name: 'Cancel Test Owner',
      email: ownerEmail,
      phone: `91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: 'password123',
      role: 'owner'
    });
    const ownerLogin = await request(app).post('/api/auth/login').send({
      email: ownerEmail,
      password: 'password123'
    });
    const ownerToken = ownerLogin.body.token;
    const ownerUser = await User.findOne({ email: ownerEmail });

    // 2. Register & Login Customer
    const customerEmail = `customer_cancel_${timestamp}@test.com`;
    await request(app).post('/api/auth/register').send({
      name: 'Cancel Test Passenger',
      email: customerEmail,
      phone: `91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: 'password123',
      role: 'customer'
    });
    const customerLogin = await request(app).post('/api/auth/login').send({
      email: customerEmail,
      password: 'password123'
    });
    const customerToken = customerLogin.body.token;
    const customerUser = await User.findOne({ email: customerEmail });

    // 3. Create Bus & Route
    const bus = await Bus.create({
      ownerId: ownerUser._id,
      busNumber: `NB-C-${Date.now().toString().slice(-4)}`,
      busType: 'AC Seater',
      totalSeats: 30,
      registrationNumber: `MP09CC${Math.floor(1000 + Math.random() * 9000)}`,
      chassisNumber: `CHASC${Date.now().toString().slice(-11)}X`,
      insurancePolicyNumber: 'INS-C-1234',
      insuranceIssueDate: new Date(),
      insuranceExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      permitNumber: 'PERM-C-5678',
      permitIssueDate: new Date(),
      permitExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      fitnessNumber: 'FIT-C-9012'
    });

    const route = await Route.create({
      ownerId: ownerUser._id,
      busId: bus._id,
      routeName: 'Indore to Ujjain Express',
      routeCode: `IUE${Date.now().toString().slice(-4)}`,
      totalDistance: 60,
      estimatedDuration: 90,
      basePrice: 200,
      stops: [
        { name: 'Indore', sequence: 1, coordinates: { latitude: 22.7196, longitude: 75.8577 } },
        { name: 'Ujjain', sequence: 2, coordinates: { latitude: 23.1765, longitude: 75.7885 } }
      ],
      price: 200,
      totalSeats: 30,
      availableSeats: 30,
      status: 'active'
    });

    // 4. Fund customer wallet and book ticket
    await Wallet.atomicCredit(customerUser._id, 500, {
      source: 'manual',
      description: 'Initial balance'
    });

    const travelDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const bookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        segments: [{
          routeId: route._id,
          busId: bus._id,
          fromStop: { name: 'Indore' },
          toStop: { name: 'Ujjain' },
          seatNumber: 'B1',
          seatGender: 'male',
          travelDate: travelDate.toISOString(),
          departureTime: '08:00',
          arrivalTime: '09:30',
          price: 200,
          passengerDetails: { name: 'Cancel Test', age: 25, gender: 'male' }
        }],
        totalAmount: 200,
        paymentMethod: 'wallet'
      });
    expect(bookingRes.statusCode).toBe(200);
    const journeyId = bookingRes.body.journey._id;

    // Check wallet balance after booking: 500 - 200 = 300
    let custWallet = await Wallet.findOne({ userId: customerUser._id });
    expect(custWallet.balance).toBe(300);

    // 5. Customer requests cancellation
    const cancelReq = await request(app)
      .put(`/api/bookings/${journeyId}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ reason: 'Change of travel plans' });

    expect(cancelReq.statusCode).toBe(200);
    expect(cancelReq.body.success).toBe(true);
    expect(cancelReq.body.booking.status).toBe('cancellation_requested');
    const projectedRefund = cancelReq.body.booking.projectedRefundAmount;
    expect(projectedRefund).toBeGreaterThan(0);

    // 6. Owner approves cancellation
    const approveRes = await request(app)
      .put(`/api/owner/bookings/${journeyId}/cancel-approve`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send();

    expect(approveRes.statusCode).toBe(200);
    expect(approveRes.body.success).toBe(true);

    // 7. Verify atomic refund credited back to customer wallet!
    custWallet = await Wallet.findOne({ userId: customerUser._id });
    expect(custWallet.balance).toBe(300 + projectedRefund);

    // Verify journey status is cancelled
    const cancelledJourney = await Journey.findById(journeyId);
    expect(cancelledJourney.status).toBe('cancelled');
  });

  it('Executes Auto-Complete Fallback: Unscanned past trip -> Background job auto-completes -> Owner Wallet credited atomically', async () => {
    const { autoCompletePastJourneys } = require('../../services/autoCompleteService');
    const timestamp = Date.now() + 2000;

    // 1. Create Owner & Customer
    const ownerEmail = `owner_auto_${timestamp}@test.com`;
    await request(app).post('/api/auth/register').send({
      name: 'Auto Owner',
      email: ownerEmail,
      phone: `91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: 'password123',
      role: 'owner'
    });
    const ownerUser = await User.findOne({ email: ownerEmail });

    const customerEmail = `customer_auto_${timestamp}@test.com`;
    await request(app).post('/api/auth/register').send({
      name: 'Auto Passenger',
      email: customerEmail,
      phone: `91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: 'password123',
      role: 'customer'
    });
    const customerUser = await User.findOne({ email: customerEmail });

    // 2. Create Bus & Route
    const bus = await Bus.create({
      ownerId: ownerUser._id,
      busNumber: `NB-A-${Date.now().toString().slice(-4)}`,
      busType: 'AC Sleeper',
      totalSeats: 30,
      registrationNumber: `MP09AC${Math.floor(1000 + Math.random() * 9000)}`,
      chassisNumber: `CHASA${Date.now().toString().slice(-11)}X`,
      insurancePolicyNumber: 'INS-A-1234',
      insuranceIssueDate: new Date(),
      insuranceExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      permitNumber: 'PERM-A-5678',
      permitIssueDate: new Date(),
      permitExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      fitnessNumber: 'FIT-A-9012'
    });

    const route = await Route.create({
      ownerId: ownerUser._id,
      busId: bus._id,
      routeName: 'Indore to Mumbai Superfast',
      routeCode: `IMS${Date.now().toString().slice(-4)}`,
      totalDistance: 600,
      estimatedDuration: 720,
      basePrice: 1200,
      stops: [
        { name: 'Indore', sequence: 1, coordinates: { latitude: 22.7196, longitude: 75.8577 } },
        { name: 'Mumbai', sequence: 2, coordinates: { latitude: 19.0760, longitude: 72.8777 } }
      ],
      price: 1200,
      totalSeats: 30,
      availableSeats: 30,
      status: 'active'
    });

    // 3. Create a Segment and Journey dated 2 days ago (unscanned / past trip)
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const earnings = 1080; // 90% of 1200
    const dummyJourneyId = new mongoose.Types.ObjectId();

    const segment = await Segment.create({
      journeyId: dummyJourneyId,
      routeId: route._id,
      busId: bus._id,
      customerId: customerUser._id,
      fromStop: { name: 'Indore' },
      toStop: { name: 'Mumbai' },
      seatNumber: 'C1',
      price: 1200,
      totalAmount: 1200,
      platformCommission: 120,
      ownerEarnings: earnings,
      travelDate: twoDaysAgo,
      departureTime: '18:00',
      estimatedArrivalTime: '06:00',
      status: 'boarded',
      paymentStatus: 'completed',
      passengerDetails: {
        name: 'Auto Passenger',
        age: 30,
        gender: 'male'
      }
    });

    const journey = await Journey.create({
      _id: dummyJourneyId,
      customerId: customerUser._id,
      segments: [segment._id],
      totalAmount: 1200,
      status: 'boarded',
      paymentMethod: 'wallet',
      paymentStatus: 'completed',
      travelDate: twoDaysAgo
    });

    // Verify initial owner wallet is 0
    let ownerWallet = await Wallet.findOne({ userId: ownerUser._id });
    expect(ownerWallet ? ownerWallet.balance : 0).toBe(0);

    // 4. Trigger auto-complete background service
    await autoCompletePastJourneys();

    // 5. Verify segment and journey are marked completed
    const updatedSegment = await Segment.findById(segment._id);
    expect(updatedSegment.status).toBe('completed');
    expect(updatedSegment.exitVerifiedBy.method).toBe('auto');

    const updatedJourney = await Journey.findById(journey._id);
    expect(updatedJourney.status).toBe('completed');

    // 6. Verify Owner Wallet was automatically credited!
    ownerWallet = await Wallet.findOne({ userId: ownerUser._id });
    expect(ownerWallet).toBeDefined();
    expect(ownerWallet.balance).toBe(earnings);
  });
});
