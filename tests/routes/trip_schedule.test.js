const request = require('supertest');
const { app } = require('../../server');
const Route = require('../../models/Route');
const User = require('../../models/User');
const Bus = require('../../models/Bus');

describe('Trip Schedule & Status Toggle Complete Integration Suite', () => {
  let ownerUser = null;
  let ownerToken = '';
  let testBus = null;
  let testRoute = null;

  beforeEach(async () => {
    const ownerEmail = `schedule_owner_${Date.now()}_${Math.random()}@example.com`;
    await request(app).post('/api/auth/register').send({
      name: 'Schedule Operator',
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

    testBus = await Bus.create({
      registrationNumber: `MP09AB${Math.floor(1000 + Math.random() * 9000)}`,
      busNumber: `MP09AB${Math.floor(1000 + Math.random() * 9000)}`,
      totalSeats: 40,
      capacity: 40,
      chassisNumber: `1HGCR2F83HA${Math.floor(100000 + Math.random() * 900000)}`,
      ownerId: ownerUser._id,
      operatorId: ownerUser._id
    });

    testRoute = await Route.create({
      ownerId: ownerUser._id,
      busId: testBus._id,
      routeName: 'Jabalpur – Varanasi Express',
      totalDistance: 450,
      estimatedDuration: 540,
      basePrice: 1200,
      days: ['Mon', 'Wed', 'Fri', 'Sun'],
      departureTime: '07:00',
      isActive: true,
      status: 'active',
      stops: [
        { name: 'Jabalpur', sequence: 0, departureTime: '07:00', coordinates: { latitude: 23.1815, longitude: 79.9864 } },
        { name: 'Varanasi', sequence: 1, arrivalTime: '16:00', coordinates: { latitude: 25.3176, longitude: 82.9739 } }
      ]
    });
  });

  it('should successfully update schedule days to alternate-day combination (Mon, Wed, Fri, Sun)', async () => {
    const newDays = ['Mon', 'Wed', 'Fri', 'Sun'];
    const updateRes = await request(app)
      .put(`/api/owner/routes/${testRoute._id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        days: newDays,
        basePrice: 1250,
        departureTime: '07:30'
      });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.success).toBe(true);

    const dbRoute = await Route.findById(testRoute._id);
    expect(dbRoute.days).toEqual(expect.arrayContaining(['Mon', 'Wed', 'Fri', 'Sun']));
    expect(dbRoute.basePrice).toBe(1250);
    expect(dbRoute.departureTime).toBe('07:30');
    expect(dbRoute.stops[0].departureTime).toBe('07:30');
  });

  it('should toggle schedule status between Active and Pause via /api/owner/routes/:id/status', async () => {
    // 1. Pause schedule (isActive: false)
    const pauseRes = await request(app)
      .put(`/api/owner/routes/${testRoute._id}/status`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ isActive: false });

    expect(pauseRes.statusCode).toBe(200);
    expect(pauseRes.body.success).toBe(true);

    let dbRoute = await Route.findById(testRoute._id);
    expect(dbRoute.isActive).toBe(false);
    expect(dbRoute.status).toBe('inactive');

    // 2. Resume schedule (isActive: true)
    const resumeRes = await request(app)
      .put(`/api/owner/routes/${testRoute._id}/status`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ isActive: true });

    expect(resumeRes.statusCode).toBe(200);
    expect(resumeRes.body.success).toBe(true);

    dbRoute = await Route.findById(testRoute._id);
    expect(dbRoute.isActive).toBe(true);
    expect(dbRoute.status).toBe('active');
  });

  it('should toggle schedule status via fallback endpoint /api/routes/:id/status', async () => {
    const toggleRes = await request(app)
      .put(`/api/routes/${testRoute._id}/status`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ isActive: false });

    expect(toggleRes.statusCode).toBe(200);
    expect(toggleRes.body.success).toBe(true);

    const dbRoute = await Route.findById(testRoute._id);
    expect(dbRoute.isActive).toBe(false);
  });
});
