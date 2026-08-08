const request = require('supertest');
const { app } = require('../../server');
const mongoose = require('mongoose');
const Segment = require('../../models/Segment');
const Journey = require('../../models/Journey');
const Bus = require('../../models/Bus');
const User = require('../../models/User');
const Route = require('../../models/Route');

describe('Ticket Boarding & OTP Verification Complete Suite', () => {
  let staffToken = '';
  let staffUser = null;
  let customerUser = null;
  let testBus = null;
  let testRoute = null;
  let testJourney = null;
  let testSegment = null;

  beforeEach(async () => {
    // 1. Create Staff User
    const staffEmail = `staff_boarding_${Date.now()}_${Math.random()}@example.com`;
    const staffReg = await request(app).post('/api/auth/register').send({
      name: 'Boarding Staff',
      email: staffEmail,
      phone: `91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: 'password123',
      role: 'staff'
    });

    staffUser = await User.findOne({ email: staffEmail });
    staffUser.permissions.set('verify_ticket', true);
    staffUser.permissions.set('manage_boarding', true);
    staffUser.permissions.set('verify_drop', true);
    await staffUser.save();

    const staffLogin = await request(app).post('/api/auth/login').send({
      email: staffEmail,
      password: 'password123'
    });
    staffToken = staffLogin.body.token;

    // 2. Create Customer User
    const custEmail = `cust_boarding_${Date.now()}_${Math.random()}@example.com`;
    await request(app).post('/api/auth/register').send({
      name: 'Passenger User',
      email: custEmail,
      phone: `91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: 'password123'
    });
    customerUser = await User.findOne({ email: custEmail });

    // 3. Create Bus & Route & Journey & Segment
    testBus = await Bus.create({
      registrationNumber: `MP09AB${Math.floor(1000 + Math.random() * 9000)}`,
      busNumber: `MP09AB${Math.floor(1000 + Math.random() * 9000)}`,
      totalSeats: 40,
      capacity: 40,
      chassisNumber: '1HGCR2F83HA000000',
      ownerId: customerUser._id,
      operatorId: customerUser._id
    });

    testRoute = await Route.create({
      routeName: 'Jabalpur to Shahdol',
      busId: testBus._id,
      ownerId: customerUser._id,
      basePrice: 500,
      totalDistance: 200,
      estimatedDuration: 300,
      stops: [
        { name: 'Jabalpur', sequence: 1, coordinates: { latitude: 23.18, longitude: 79.98 } },
        { name: 'Shahdol', sequence: 2, coordinates: { latitude: 23.29, longitude: 81.35 } }
      ]
    });

    testJourney = await Journey.create({
      customerId: customerUser._id,
      busId: testBus._id,
      routeId: testRoute._id,
      departureDate: new Date(),
      totalAmount: 500,
      status: 'confirmed'
    });

    testSegment = await Segment.create({
      journeyId: testJourney._id,
      routeId: testRoute._id,
      busId: testBus._id,
      customerId: customerUser._id,
      fromStop: { name: 'Jabalpur' },
      toStop: { name: 'Shahdol' },
      seatNumber: 'S1',
      passengerDetails: { name: 'Passenger User', age: 28, gender: 'male' },
      travelDate: new Date(),
      price: 500,
      totalAmount: 500,
      status: 'confirmed'
    });

    await testSegment.generateBoardingOTP();
  });

  it('should successfully resolve segment from a raw JSON QR string', async () => {
    const jsonQR = JSON.stringify({
      segmentId: testSegment._id.toString(),
      journeyId: testJourney._id.toString(),
      bookingId: testSegment._id.toString().slice(-6).toUpperCase(),
      seatNumber: 'S1'
    });

    const res = await request(app)
      .post('/api/staff/verify-boarding')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ segmentId: jsonQR, method: 'qr_scan' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const reloaded = await Segment.findById(testSegment._id);
    expect(reloaded.status).toBe('boarded');
  });

  it('should successfully generate and verify Exit OTP', async () => {
    // First mark as boarded
    testSegment.status = 'boarded';
    testSegment.boardedAt = new Date();
    await testSegment.save();

    // Generate exit OTP
    const exitCode = await testSegment.generateExitOTP();
    expect(exitCode).toBeDefined();

    // Verify exit OTP via /api/staff/verify-drop
    const dropRes = await request(app)
      .post('/api/staff/verify-drop')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ segmentId: testSegment._id.toString(), otp: exitCode });

    expect(dropRes.statusCode).toBe(200);
    expect(dropRes.body.success).toBe(true);

    const reloaded = await Segment.findById(testSegment._id);
    expect(reloaded.status).toBe('completed');
  });

  it('should handle Boarding OTP verification correctly', async () => {
    const otpCode = testSegment.boardingOTP.code;

    const res = await request(app)
      .post('/api/staff/verify-boarding')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        segmentId: testSegment._id.toString().slice(-6).toUpperCase(),
        otp: otpCode,
        method: 'otp'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const reloaded = await Segment.findById(testSegment._id);
    expect(reloaded.status).toBe('boarded');
  });
});
