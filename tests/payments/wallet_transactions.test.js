const request = require('supertest');
const { app } = require('../../server');
const mongoose = require('mongoose');
const User = require('../../models/User');

describe('Wallet & Payments Controller', () => {
  let customerToken = '';
  let customerUser = null;

  beforeEach(async () => {
    // Create a mock customer for wallet operations
    const custEmail = `cust_wallet_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
    await request(app).post('/api/auth/register').send({
      name: 'Wallet Customer',
      email: custEmail,
      phone: `91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: 'password123',
      role: 'customer'
    });

    customerUser = await User.findOne({ email: custEmail });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: custEmail,
      password: 'password123'
    });
    customerToken = loginRes.body.token;
  });

  it('should get initial wallet balance as 0', async () => {
    const res = await request(app)
      .get('/api/wallet')
      .set('Authorization', `Bearer ${customerToken}`);
      
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.wallet.balance).toBe(0);
  });

  it('should add funds to wallet via add-money', async () => {
    const res = await request(app)
      .post('/api/wallet/add-money')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        amount: 500,
        source: 'razorpay',
        paymentMethod: 'upi',
        idempotencyKey: `IDEMP_${Date.now()}`
      });
      
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.balance).toBe(500);
  });

  it('should verify balance check endpoint works', async () => {
    // Add funds first
    await request(app)
      .post('/api/wallet/add-money')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        amount: 500,
        source: 'razorpay',
        paymentMethod: 'upi',
        idempotencyKey: `IDEMP_CHK_${Date.now()}`
      });

    // Check with sufficient balance
    const okRes = await request(app)
      .get('/api/wallet/check-balance?requiredAmount=300')
      .set('Authorization', `Bearer ${customerToken}`);
      
    expect(okRes.statusCode).toBe(200);
    expect(okRes.body.success).toBe(true);
    expect(okRes.body.data.hasSufficientBalance).toBe(true);

    // Check with insufficient balance
    const failRes = await request(app)
      .get('/api/wallet/check-balance?requiredAmount=1000')
      .set('Authorization', `Bearer ${customerToken}`);
      
    expect(failRes.statusCode).toBe(200);
    expect(failRes.body.success).toBe(true);
    expect(failRes.body.data.hasSufficientBalance).toBe(false);
  });
});
