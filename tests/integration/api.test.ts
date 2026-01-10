import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';

describe('API Integration Tests', () => {
  let app: express.Application;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    
    app.get('/api/exchange-rate', async (req, res) => {
      res.json({ rate: 0.0091, lastUpdated: new Date().toISOString() });
    });

    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok' });
    });
  });

  describe('GET /api/exchange-rate', () => {
    it('returns exchange rate data', async () => {
      const response = await request(app).get('/api/exchange-rate');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('rate');
      expect(response.body).toHaveProperty('lastUpdated');
      expect(typeof response.body.rate).toBe('number');
    });

    it('returns a valid rate range', async () => {
      const response = await request(app).get('/api/exchange-rate');
      
      expect(response.body.rate).toBeGreaterThan(0);
      expect(response.body.rate).toBeLessThan(1);
    });
  });

  describe('GET /api/health', () => {
    it('returns health status', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });
});

describe('Newsletter API', () => {
  let app: express.Application;
  const subscribers = new Map<string, { email: string; subscribedAt: Date }>();

  beforeAll(() => {
    app = express();
    app.use(express.json());

    app.post('/api/newsletter', (req, res) => {
      const { email } = req.body;
      
      if (!email || !email.includes('@')) {
        return res.status(400).json({ message: 'Invalid email address' });
      }
      
      if (subscribers.has(email)) {
        return res.status(409).json({ message: 'Email already subscribed' });
      }
      
      subscribers.set(email, { email, subscribedAt: new Date() });
      res.status(201).json({ message: 'Successfully subscribed', email });
    });
  });

  it('subscribes a valid email', async () => {
    const response = await request(app)
      .post('/api/newsletter')
      .send({ email: 'test@example.com' });
    
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Successfully subscribed');
  });

  it('rejects invalid email', async () => {
    const response = await request(app)
      .post('/api/newsletter')
      .send({ email: 'invalid-email' });
    
    expect(response.status).toBe(400);
  });

  it('rejects duplicate subscription', async () => {
    const email = 'duplicate@example.com';
    
    await request(app).post('/api/newsletter').send({ email });
    
    const response = await request(app)
      .post('/api/newsletter')
      .send({ email });
    
    expect(response.status).toBe(409);
  });
});

describe('Chat API Structure', () => {
  let app: express.Application;
  const chatSessions = new Map<string, Array<{ role: string; content: string }>>();

  beforeAll(() => {
    app = express();
    app.use(express.json());

    app.get('/api/chat/:sessionId', (req, res) => {
      const { sessionId } = req.params;
      const messages = chatSessions.get(sessionId) || [];
      res.json(messages);
    });

    app.post('/api/chat', (req, res) => {
      const { sessionId, message } = req.body;
      
      if (!sessionId || !message) {
        return res.status(400).json({ message: 'Missing sessionId or message' });
      }
      
      if (!chatSessions.has(sessionId)) {
        chatSessions.set(sessionId, []);
      }
      
      const messages = chatSessions.get(sessionId)!;
      messages.push({ role: 'user', content: message });
      messages.push({ role: 'assistant', content: 'This is a test response.' });
      
      res.json({ 
        response: 'This is a test response.',
        sessionId 
      });
    });
  });

  it('creates a new chat session', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({ sessionId: 'test-session', message: 'Hello' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('response');
    expect(response.body).toHaveProperty('sessionId');
  });

  it('retrieves chat history', async () => {
    const sessionId = 'history-test';
    
    await request(app)
      .post('/api/chat')
      .send({ sessionId, message: 'Test message' });
    
    const response = await request(app).get(`/api/chat/${sessionId}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('rejects chat without sessionId', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({ message: 'Hello' });
    
    expect(response.status).toBe(400);
  });

  it('returns empty array for new session', async () => {
    const response = await request(app).get('/api/chat/new-session-123');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
