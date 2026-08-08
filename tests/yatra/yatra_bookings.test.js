const request = require('supertest');
const { app } = require('../../server');
const mongoose = require('mongoose');
const YatraPackage = require('../../models/YatraPackage');
const YatraBooking = require('../../models/YatraBooking');
const Journey = require('../../models/Journey');
const Segment = require('../../models/Segment');
const Bus = require('../../models/Bus');
const User = require('../../models/User');
const Route = require('../../models/Route');
const Wallet = require('../../models/Wallet');

describe('Yatra Bookings & Tickets Visibility Complete Suite', () => {
  let customerUser = null;
  let customerToken = '';
  let ownerUser = null;
  let yatraPkg = null;

  beforeEach(async () => {
    // 1. Create Customer User & Wallet
    const custEmail = `cust_yatra_${Date.now()}_${Math.random()}@example.com`;
    const custReg = await request(app).post('/api/auth/register').send({
      name: 'Yatra Traveler',
      email: custEmail,
      phone: `91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: 'password123',
      role: 'customer'
    });

    customerUser = await User.findOne({ email: custEmail });
    const custLogin = await request(app).post('/api/auth/login').send({
      email: custEmail,
      password: 'password123'
    });
    customerToken = custLogin.body.token;

    await Wallet.create({
      userId: customerUser._id,
      balance: 10000,
      currency: 'INR'
    });

    // 2. Create Owner User & Yatra Package
    const ownerEmail = `owner_yatra_${Date.now()}_${Math.random()}@example.com`;
    await request(app).post('/api/auth/register').send({
      name: 'Yatra Organizer',
      email: ownerEmail,
      phone: `91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: 'password123',
      role: 'owner'
    });
    ownerUser = await User.findOne({ email: ownerEmail });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 10);

    const testBus = await Bus.create({
      registrationNumber: `MP09AB${Math.floor(1000 + Math.random() * 9000)}`,
      busNumber: `MP09AB${Math.floor(1000 + Math.random() * 9000)}`,
      totalSeats: 40,
      capacity: 40,
      chassisNumber: `1HGCR2F83HA${Math.floor(100000 + Math.random() * 900000)}`,
      ownerId: ownerUser._id,
      operatorId: ownerUser._id
    });

    yatraPkg = await YatraPackage.create({
      ownerId: ownerUser._id,
      busId: testBus._id,
      title: 'Divine Char Dham Yatra 2026',
      description: 'Complete sacred pilgrimage tour',
      category: 'religious',
      departurePoint: { city: 'Haridwar', state: 'Uttarakhand' },
      destinationCity: 'Badrinath',
      startDate,
      endDate,
      durationDays: 4,
      totalSeats: 30,
      bookedSeats: 0,
      pricePerPerson: 2500,
      status: 'active'
    });
  });

  it('should successfully book a Yatra Package and fetch it via /api/yatra/my-bookings', async () => {
    const bookRes = await request(app)
      .post('/api/yatra/book')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        packageId: yatraPkg._id.toString(),
        passengers: [
          { name: 'Yatra Traveler', age: 30, gender: 'male', idProofType: 'aadhar', idProofNumber: '123456789012' }
        ],
        mealPreference: 'veg',
        paymentMethod: 'wallet'
      });

    expect(bookRes.statusCode).toBe(201);
    expect(bookRes.body.success).toBe(true);
    expect(bookRes.body.data.boardingOtp).toBeDefined();

    // Fetch user's Yatra bookings
    const myBookingsRes = await request(app)
      .get('/api/yatra/my-bookings')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(myBookingsRes.statusCode).toBe(200);
    expect(myBookingsRes.body.success).toBe(true);
    expect(myBookingsRes.body.data.length).toBeGreaterThanOrEqual(1);

    const foundBooking = myBookingsRes.body.data.find(b => b._id.toString() === bookRes.body.data._id.toString());
    expect(foundBooking).toBeDefined();
    expect(foundBooking.packageId.title).toBe('Divine Char Dham Yatra 2026');
  });

  it('should include Yatra Ticket Journeys in /api/yatra/my-bookings', async () => {
    // Create a Yatra bus ticket journey
    const testBus = await Bus.create({
      registrationNumber: `MP09AB${Math.floor(1000 + Math.random() * 9000)}`,
      busNumber: `MP09AB${Math.floor(1000 + Math.random() * 9000)}`,
      totalSeats: 40,
      capacity: 40,
      chassisNumber: `1HGCR2F83HA${Math.floor(100000 + Math.random() * 900000)}`,
      ownerId: ownerUser._id,
      operatorId: ownerUser._id
    });

    const testRoute = await Route.create({
      routeName: 'Ujjain Mahakal Teerth Yatra Special',
      busId: testBus._id,
      ownerId: ownerUser._id,
      basePrice: 800,
      totalDistance: 250,
      estimatedDuration: 360,
      stops: [
        { name: 'Indore', sequence: 1, coordinates: { latitude: 22.71, longitude: 75.85 } },
        { name: 'Ujjain', sequence: 2, coordinates: { latitude: 23.17, longitude: 75.78 } }
      ]
    });

    const yatraJourney = await Journey.create({
      customerId: customerUser._id,
      busId: testBus._id,
      routeId: testRoute._id,
      departureDate: new Date(),
      totalAmount: 800,
      status: 'confirmed',
      bookingType: 'yatra',
      isYatra: true
    });

    const yatraSegment = await Segment.create({
      journeyId: yatraJourney._id,
      routeId: testRoute._id,
      busId: testBus._id,
      customerId: customerUser._id,
      fromStop: { name: 'Indore' },
      toStop: { name: 'Ujjain' },
      seatNumber: 'S5',
      passengerDetails: { name: 'Yatra Traveler', age: 30, gender: 'male' },
      travelDate: new Date(),
      price: 800,
      totalAmount: 800,
      status: 'confirmed'
    });

    yatraJourney.segments = [yatraSegment._id];
    await yatraJourney.save();

    // Fetch user's Yatra bookings & tickets
    const myBookingsRes = await request(app)
      .get('/api/yatra/my-bookings')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(myBookingsRes.statusCode).toBe(200);
    expect(myBookingsRes.body.success).toBe(true);

    const ticketBooking = myBookingsRes.body.data.find(b => b._id.toString() === yatraJourney._id.toString());
    expect(ticketBooking).toBeDefined();
    expect(ticketBooking.packageId.title).toBe('Ujjain Mahakal Teerth Yatra Special');
  });
});
