const request = require('supertest');
const { app } = require('../../server');
const mongoose = require('mongoose');
const User = require('../../models/User');
const ServiceProvider = require('../../models/ServiceProvider');
const ServiceRequest = require('../../models/ServiceRequest');

describe('Marketplace Controller', () => {
  let providerToken = '';
  let customerToken = '';
  let providerUser = null;
  let customerUser = null;

  beforeEach(async () => {
    // 1. Create Provider
    const provEmail = `provider_${Date.now()}_${Math.random()}@example.com`;
    await request(app).post('/api/auth/register').send({
      name: 'Test Mechanic',
      email: provEmail,
      phone: `91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: 'password123',
      role: 'customer'
    });

    provUser = await User.findOne({ email: provEmail });

    const provLogin = await request(app).post('/api/auth/login').send({
      email: provEmail,
      password: 'password123'
    });
    providerToken = provLogin.body.token;

    // Register provider profile
    await request(app)
      .post('/api/marketplace/provider/register')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        serviceType: 'Mechanic',
        businessName: 'Speedy Bus Repairs',
        description: '24/7 on-road emergency repair',
        location: { city: 'Indore', coordinates: [75.8577, 22.7196] },
        pricing: '1500 INR flat fee',
        availability: '24/7'
      });

    // 2. Create Customer
    const custEmail = `cust_market_${Date.now()}_${Math.random()}@example.com`;
    await request(app).post('/api/auth/register').send({
      name: 'Market Customer',
      email: custEmail,
      phone: `91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: 'password123',
      role: 'customer'
    });

    const custLogin = await request(app).post('/api/auth/login').send({
      email: custEmail,
      password: 'password123'
    });
    customerToken = custLogin.body.token;
  });

  it('provider should have active marketplace profile and receive search matches', async () => {
    const res = await request(app)
      .get('/api/marketplace/services/search?serviceType=Mechanic&city=Indore')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].businessName).toBe('Speedy Bus Repairs');
  });

  it('customer should be able to create a service request and provider gets matched lead', async () => {
    const reqRes = await request(app)
      .post('/api/marketplace/requests')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        serviceType: 'Mechanic',
        location: 'Indore',
        date: new Date(),
        budget: 2000,
        description: 'Engine overheated near bypass'
      });

    expect(reqRes.statusCode).toBe(201);
    expect(reqRes.body.success).toBe(true);
    expect(reqRes.body.data.description).toBe('Engine overheated near bypass');

    // Provider fetches matching leads
    const leadsRes = await request(app)
      .get('/api/marketplace/provider/leads')
      .set('Authorization', `Bearer ${providerToken}`);

    expect(leadsRes.statusCode).toBe(200);
    expect(leadsRes.body.success).toBe(true);
    expect(Array.isArray(leadsRes.body.data)).toBe(true);
    expect(leadsRes.body.data.length).toBeGreaterThan(0);
    expect(leadsRes.body.data[0].serviceType).toBe('Mechanic');
  });
});
