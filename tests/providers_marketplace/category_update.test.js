const request = require('supertest');
const { app } = require('../../server');
const ServiceProvider = require('../../models/ServiceProvider');
const User = require('../../models/User');

describe('Service Category Update & New Categories Test', () => {
  const newCategories = ['Auto Parts Shop', 'Vehicle Washing Center', 'Flat Tire Repair', 'Workshop'];
  const testUser = {
    name: 'Category Tester',
    email: 'cat_tester_unique@example.com',
    phone: '9998887771',
    password: 'password123'
  };

  let token = '';

  beforeAll(async () => {
    // Register & Login user
    await request(app).post('/api/auth/register').send(testUser);
    const loginRes = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password
    });
    token = loginRes.body.token;

    // Create provider profile initial state
    await request(app)
      .post('/api/marketplace/provider/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        serviceType: 'Mechanic',
        businessName: 'Original Business Name',
        description: 'Testing category updates',
        location: { city: 'Indore' }
      });
  });

  newCategories.forEach(cat => {
    it(`should successfully update service category to "${cat}"`, async () => {
      const res = await request(app)
        .put('/api/marketplace/provider/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          serviceType: cat,
          businessName: `Business - ${cat}`,
          description: 'Updated description',
          location: { city: 'Indore' }
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.serviceType).toBe(cat);

      // Verify User record was updated as well
      const user = await User.findOne({ email: testUser.email });
      expect(user.serviceType).toBe(cat);
    });
  });
});
