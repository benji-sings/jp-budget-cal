import { describe, it, expect } from 'vitest';
import request from 'supertest';

const BASE_URL = 'http://localhost:5000';

describe('Express API Integration Tests', () => {
  describe('GET /api/health', () => {
    it('should return health status with checks', async () => {
      const response = await request(BASE_URL).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('checks');
      expect(response.body.checks).toHaveProperty('server');
      expect(response.body.checks.server).toBe('healthy');
    });

    it('should include database health check', async () => {
      const response = await request(BASE_URL).get('/api/health');
      expect(response.body.checks).toHaveProperty('database');
    });
  });

  describe('GET /api/health/live', () => {
    it('should return liveness probe status', async () => {
      const response = await request(BASE_URL).get('/api/health/live');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('alive');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/health/ready', () => {
    it('should return readiness probe status', async () => {
      const response = await request(BASE_URL).get('/api/health/ready');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(['ready', 'not_ready']).toContain(response.body.status);
    });
  });

  describe('GET /api/exchange-rate', () => {
    it('should return exchange rate data', async () => {
      const response = await request(BASE_URL).get('/api/exchange-rate');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('rate');
      expect(response.body).toHaveProperty('lastUpdated');
      expect(typeof response.body.rate).toBe('number');
      expect(response.body.rate).toBeGreaterThan(0);
    });

    it('should return ETag header for caching', async () => {
      const response = await request(BASE_URL).get('/api/exchange-rate');
      expect(response.status).toBe(200);
      expect(response.headers).toHaveProperty('etag');
      expect(response.headers).toHaveProperty('cache-control');
      expect(response.headers['cache-control']).toMatch(/max-age=\d+/);
    });

    it('should return 304 Not Modified for matching ETag', async () => {
      const firstResponse = await request(BASE_URL).get('/api/exchange-rate');
      expect(firstResponse.status).toBe(200);
      const etag = firstResponse.headers['etag'];
      expect(etag).toBeDefined();
      
      const secondResponse = await request(BASE_URL)
        .get('/api/exchange-rate')
        .set('If-None-Match', etag);
      expect(secondResponse.status).toBe(304);
      expect(secondResponse.body).toEqual({});
    });
  });

  describe('GET /api/weather/:city', () => {
    it('should return weather for Tokyo', async () => {
      const response = await request(BASE_URL).get('/api/weather/Tokyo');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('city');
      expect(response.body).toHaveProperty('daily');
      expect(response.body.city).toBe('Tokyo');
    });

    it('should return weather for Kyoto', async () => {
      const response = await request(BASE_URL).get('/api/weather/Kyoto');
      expect(response.status).toBe(200);
      expect(response.body.city).toBe('Kyoto');
    });

    it('should return 400 for unknown city', async () => {
      const response = await request(BASE_URL).get('/api/weather/UnknownCity');
      expect(response.status).toBe(400);
    });

    it('should return ETag header for caching', async () => {
      const response = await request(BASE_URL).get('/api/weather/Tokyo');
      expect(response.status).toBe(200);
      expect(response.headers).toHaveProperty('etag');
      expect(response.headers).toHaveProperty('cache-control');
      expect(response.headers['cache-control']).toMatch(/max-age=\d+/);
    });

    it('should return 304 Not Modified for matching ETag', async () => {
      const firstResponse = await request(BASE_URL).get('/api/weather/Tokyo');
      expect(firstResponse.status).toBe(200);
      const etag = firstResponse.headers['etag'];
      expect(etag).toBeDefined();
      
      const secondResponse = await request(BASE_URL)
        .get('/api/weather/Tokyo')
        .set('If-None-Match', etag);
      expect(secondResponse.status).toBe(304);
      expect(secondResponse.body).toEqual({});
    });
  });

  describe('GET /api/attractions/:city', () => {
    it('should return attractions for Tokyo', async () => {
      const response = await request(BASE_URL).get('/api/attractions/Tokyo').timeout(30000);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('city');
      expect(response.body).toHaveProperty('attractions');
      expect(response.body).toHaveProperty('source');
    }, 35000);

    it('should return 400 for unknown city', async () => {
      const response = await request(BASE_URL).get('/api/attractions/UnknownCity');
      expect(response.status).toBe(400);
    });

    it('should return ETag header for caching', async () => {
      const response = await request(BASE_URL).get('/api/attractions/Osaka').timeout(30000);
      expect(response.status).toBe(200);
      expect(response.headers).toHaveProperty('etag');
      expect(response.headers).toHaveProperty('cache-control');
      expect(response.headers['cache-control']).toMatch(/max-age=\d+/);
    }, 35000);

    it('should return 304 Not Modified for matching ETag', async () => {
      const firstResponse = await request(BASE_URL).get('/api/attractions/Kyoto').timeout(30000);
      expect(firstResponse.status).toBe(200);
      const etag = firstResponse.headers['etag'];
      expect(etag).toBeDefined();
      
      const secondResponse = await request(BASE_URL)
        .get('/api/attractions/Kyoto')
        .set('If-None-Match', etag)
        .timeout(30000);
      expect(secondResponse.status).toBe(304);
      expect(secondResponse.body).toEqual({});
    }, 35000);
  });

  describe('GET /api/place-details', () => {
    it('should return 400 when missing parameters', async () => {
      const response = await request(BASE_URL).get('/api/place-details');
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/maps-embed', () => {
    it('should return 400 when missing lat/lng', async () => {
      const response = await request(BASE_URL).get('/api/maps-embed');
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/chat/:sessionId', () => {
    it('should return chat history for valid UUID session', async () => {
      const validUUID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
      const response = await request(BASE_URL).get(`/api/chat/${validUUID}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messages');
      expect(Array.isArray(response.body.messages)).toBe(true);
    });

    it('should return empty messages for new UUID session', async () => {
      const newUUID = 'f1e2d3c4-b5a6-4978-8901-234567890abc';
      const response = await request(BASE_URL).get(`/api/chat/${newUUID}`);
      expect(response.status).toBe(200);
      expect(response.body.messages).toEqual([]);
    });

    it('should return 400 for invalid session ID format', async () => {
      const invalidSessionWithSpaces = 'invalid session with spaces';
      const response = await request(BASE_URL).get(`/api/chat/${encodeURIComponent(invalidSessionWithSpaces)}`);
      expect(response.status).toBe(400);
    });

    it('should accept legacy session ID format', async () => {
      const response = await request(BASE_URL).get('/api/chat/valid-session-id');
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/chat', () => {
    it('should return 400 when messages array is missing', async () => {
      const response = await request(BASE_URL)
        .post('/api/chat')
        .send({ sessionId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d' });
      expect(response.status).toBe(400);
    });

    it('should return 400 when sessionId is missing', async () => {
      const response = await request(BASE_URL)
        .post('/api/chat')
        .send({ messages: [{ role: 'user', content: 'Hello' }] });
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/analytics/budget', () => {
    it('should track budget calculation event', async () => {
      const response = await request(BASE_URL)
        .post('/api/analytics/budget')
        .send({
          travelers: 2,
          cities: ['Tokyo'],
          travelStyle: 'midrange',
          totalBudgetSgd: 5000,
          perPersonSgd: 2500,
          exchangeRate: 0.0089,
          breakdown: { flights: 1000, accommodation: 2000, food: 1000, transport: 500, activities: 500 }
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(BASE_URL)
        .post('/api/analytics/budget')
        .send({ cities: ['Tokyo'] });
      expect(response.status).toBe(400);
    });

    it('should return 400 for empty cities array', async () => {
      const response = await request(BASE_URL)
        .post('/api/analytics/budget')
        .send({
          travelers: 2,
          cities: [],
          travelStyle: 'midrange',
          totalBudgetSgd: 5000,
          perPersonSgd: 2500,
          exchangeRate: 0.0089,
          breakdown: {}
        });
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/analytics/pageview', () => {
    it('should track pageview event', async () => {
      const response = await request(BASE_URL)
        .post('/api/analytics/pageview')
        .send({
          pagePath: '/calculator',
          referrer: 'https://google.com'
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for missing pagePath field', async () => {
      const response = await request(BASE_URL)
        .post('/api/analytics/pageview')
        .send({ referrer: 'https://google.com' });
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/analytics/event', () => {
    it('should track custom event', async () => {
      const response = await request(BASE_URL)
        .post('/api/analytics/event')
        .send({
          eventType: 'button_click',
          eventCategory: 'user_interaction',
          eventData: { button: 'calculate' }
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for missing eventType or eventCategory', async () => {
      const response = await request(BASE_URL)
        .post('/api/analytics/event')
        .send({ eventType: 'button_click' });
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/analytics/dashboard', () => {
    it('should return analytics dashboard data', async () => {
      const response = await request(BASE_URL).get('/api/analytics/dashboard');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('period');
    });
  });
});
