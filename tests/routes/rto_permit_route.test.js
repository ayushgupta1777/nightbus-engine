const request = require('supertest');
const { app } = require('../../server');
const Route = require('../../models/Route');
const User = require('../../models/User');

describe('RTO Transport Permit Route Builder Complete Suite', () => {
  let ownerUser = null;
  let ownerToken = '';

  beforeEach(async () => {
    const ownerEmail = `permit_owner_${Date.now()}_${Math.random()}@example.com`;
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Transport Permit Operator',
      email: ownerEmail,
      phone: `91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: 'password123',
      role: 'owner'
    });

    ownerUser = await User.findOne({ email: ownerEmail });
    const loginRes = await request(app).post('/api/auth/login').send({
      email: ownerEmail,
      password: 'password123'
    });
    ownerToken = loginRes.body.token;
  });

  it('should successfully create an RTO permit route with manual leg distances', async () => {
    const Bus = require('../../models/Bus');
    const testBus = await Bus.create({
      registrationNumber: `MP09AB${Math.floor(1000 + Math.random() * 9000)}`,
      busNumber: `MP09AB${Math.floor(1000 + Math.random() * 9000)}`,
      totalSeats: 40,
      capacity: 40,
      chassisNumber: `1HGCR2F83HA${Math.floor(100000 + Math.random() * 900000)}`,
      ownerId: ownerUser._id,
      operatorId: ownerUser._id
    });

    const stopsPayload = [
      { name: 'Jabalpur', sequence: 0, coordinates: { latitude: 23.1815, longitude: 79.9864 }, distanceFromPrevious: 0, cumDistance: 0 },
      { name: 'Sihora', sequence: 1, coordinates: { latitude: 23.4883, longitude: 80.1154 }, distanceFromPrevious: 35, cumDistance: 35 },
      { name: 'Sleemanabad', sequence: 2, coordinates: { latitude: 23.6421, longitude: 80.2458 }, distanceFromPrevious: 25, cumDistance: 60 },
      { name: 'Katni', sequence: 3, coordinates: { latitude: 23.8343, longitude: 80.3989 }, distanceFromPrevious: 30, cumDistance: 90 },
      { name: 'Mandla', sequence: 4, coordinates: { latitude: 22.5986, longitude: 80.3712 }, distanceFromPrevious: 250, cumDistance: 340 }
    ];

    const pricePerKm = 2;
    const totalDistance = 340; // Sum of leg distances: 35 + 25 + 30 + 250 = 340 km

    const customPricing = [
      { fromStop: 'Jabalpur', toStop: 'Katni', price: 180 }, // 90km * 2 = 180
      { fromStop: 'Jabalpur', toStop: 'Mandla', price: 680 }  // 340km * 2 = 680
    ];

    const payload = {
      busId: testBus._id,
      routeName: 'Jabalpur – Mandla Permit Express',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      departureTime: '06:00',
      basePrice: Math.round(totalDistance * pricePerKm),
      pricePerKm,
      totalDistance,
      estimatedDuration: 420,
      stops: stopsPayload,
      customPricing
    };

    const res = await request(app)
      .post('/api/owner/routes')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.route).toBeDefined();

    const createdRoute = res.body.data.route;
    expect(createdRoute.totalDistance).toBe(340);
    expect(createdRoute.stops.length).toBe(5);
    expect(createdRoute.stops[1].distanceFromPrevious).toBe(35);
    expect(createdRoute.stops[2].distanceFromPrevious).toBe(25);
    expect(createdRoute.stops[3].distanceFromPrevious).toBe(30);
    expect(createdRoute.stops[4].distanceFromPrevious).toBe(250);
    expect(createdRoute.stops[4].cumDistance).toBe(340);
  });
});
