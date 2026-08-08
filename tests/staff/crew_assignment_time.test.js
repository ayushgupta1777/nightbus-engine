const request = require('supertest');
const { app } = require('../../server');
const User = require('../../models/User');
const Bus = require('../../models/Bus');

describe('Crew Assignment 24-Hour Time Picker & Shift Timing Suite', () => {
  let ownerUser = null;
  let ownerToken = '';
  let conductorUser = null;
  let testBus = null;

  beforeEach(async () => {
    // 1. Register owner
    const ownerEmail = `crew_owner_${Date.now()}_${Math.random()}@example.com`;
    await request(app).post('/api/auth/register').send({
      name: 'Crew Owner',
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

    // 2. Register conductor staff
    const staffEmail = `crew_conductor_${Date.now()}_${Math.random()}@example.com`;
    await request(app).post('/api/auth/register').send({
      name: 'Conductor Rajesh',
      email: staffEmail,
      phone: `91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: 'password123',
      role: 'staff',
      staffRole: 'conductor',
      createdByOwnerId: ownerUser._id
    });
    conductorUser = await User.findOne({ email: staffEmail });

    // 3. Create Bus
    testBus = await Bus.create({
      registrationNumber: `MP09AB${Math.floor(1000 + Math.random() * 9000)}`,
      busNumber: `MP09AB${Math.floor(1000 + Math.random() * 9000)}`,
      totalSeats: 40,
      capacity: 40,
      chassisNumber: `1HGCR2F83HA${Math.floor(100000 + Math.random() * 900000)}`,
      ownerId: ownerUser._id,
      operatorId: ownerUser._id
    });
  });

  it('should successfully assign crew member with 24-hour formatted shift times', async () => {
    const shiftDate = new Date().toISOString().split('T')[0];
    const shiftStartTime = '09:30';
    const shiftEndTime = '18:45';

    const assignRes = await request(app)
      .post('/api/owner/staff/assign')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        staffId: conductorUser._id.toString(),
        busId: testBus._id.toString(),
        role: 'conductor',
        shiftDate,
        shiftStartTime,
        shiftEndTime
      });

    expect(assignRes.statusCode).toBe(200);
    expect(assignRes.body.success).toBe(true);

    const updatedConductor = await User.findById(conductorUser._id);
    expect(updatedConductor.assignedBus.toString()).toBe(testBus._id.toString());
    expect(updatedConductor.currentAssignment).toBeDefined();
    expect(updatedConductor.currentAssignment.shiftStartTime).toBe('09:30');
    expect(updatedConductor.currentAssignment.shiftEndTime).toBe('18:45');
  });

  it('should save overnight 24-hour shift times (e.g. 22:00 to 06:00)', async () => {
    const shiftDate = new Date().toISOString().split('T')[0];
    const shiftStartTime = '22:00';
    const shiftEndTime = '06:00';

    const assignRes = await request(app)
      .post('/api/owner/staff/assign')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        staffId: conductorUser._id.toString(),
        busId: testBus._id.toString(),
        role: 'conductor',
        shiftDate,
        shiftStartTime,
        shiftEndTime
      });

    expect(assignRes.statusCode).toBe(200);
    expect(assignRes.body.success).toBe(true);

    const updatedConductor = await User.findById(conductorUser._id);
    expect(updatedConductor.currentAssignment.shiftStartTime).toBe('22:00');
    expect(updatedConductor.currentAssignment.shiftEndTime).toBe('06:00');
  });
});
