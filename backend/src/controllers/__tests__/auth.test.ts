import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/auth';
import ticketRoutes from '../../routes/tickets';
import { logger } from '../../utils/logger';

// Create a test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/tickets', ticketRoutes);
  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  return app;
};

describe('Auth API', () => {
  let app: express.Application;
  let testUser: any;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password required');
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password required');
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password required');
    });
  });
});

describe('Tickets API', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /api/v1/tickets', () => {
    it('should return tickets array', async () => {
      const response = await request(app)
        .get('/api/v1/tickets');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/tickets/stats', () => {
    it('should return ticket stats', async () => {
      const response = await request(app)
        .get('/api/v1/tickets/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/tickets', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/v1/tickets')
        .send({ description: 'Test description' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/tickets/:id', () => {
    it('should return 404 for non-existent ticket', async () => {
      const response = await request(app)
        .get('/api/v1/tickets/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Ticket not found');
    });
  });
});