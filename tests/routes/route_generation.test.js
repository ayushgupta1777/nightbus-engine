const request = require('supertest');
const { app } = require('../../server');

describe('Route Builder - Route Generation & Polyline Complete Suite', () => {
  it('should successfully calculate multi-leg route and return per-leg and overview polylines', async () => {
    const origin = { latitude: 22.7196, longitude: 75.8577 }; // Indore (Bus Stand)
    const destination = { latitude: 23.8343, longitude: 80.3989 }; // Katni (Stand Katni MP)
    const waypoints = [
      { latitude: 23.1765, longitude: 75.7885 }, // Ujjain
      { latitude: 23.8388, longitude: 78.7378 }  // Sagar
    ];

    const res = await request(app)
      .post('/api/locations/google-route')
      .send({
        origin,
        destination,
        waypoints,
        alternatives: false
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.routes).toBeDefined();
    expect(res.body.routes.length).toBeGreaterThan(0);

    const primaryRoute = res.body.routes[0];
    expect(primaryRoute.overview_polyline).toBeDefined();
    expect(primaryRoute.overview_polyline.points).toBeDefined();
    expect(primaryRoute.legs).toBeDefined();
    expect(primaryRoute.legs.length).toBeGreaterThanOrEqual(1);

    // Verify each leg has a polyline and valid distance
    primaryRoute.legs.forEach((leg) => {
      expect(leg.distance).toBeDefined();
      expect(leg.duration).toBeDefined();
      expect(leg.polyline).toBeDefined();
      expect(typeof leg.polyline.points).toBe('string');
    });
  });

  it('should handle origin to destination route without waypoints', async () => {
    const origin = { latitude: 22.7196, longitude: 75.8577 };
    const destination = { latitude: 23.8343, longitude: 80.3989 };

    const res = await request(app)
      .post('/api/locations/google-route')
      .send({
        origin,
        destination,
        waypoints: [],
        alternatives: false
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.routes.length).toBeGreaterThan(0);
    expect(res.body.routes[0].overview_polyline.points).toBeDefined();
  });

  it('should return 400 Bad Request if origin or destination is missing', async () => {
    const res = await request(app)
      .post('/api/locations/google-route')
      .send({
        origin: { latitude: 22.7196, longitude: 75.8577 }
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
