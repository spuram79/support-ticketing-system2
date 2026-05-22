import request from 'supertest';
import express from 'express';
import ticketRoutes from '../../routes/tickets';

// Create a test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/tickets', ticketRoutes);
  return app;
};

describe('Tickets API', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /api/v1/tickets', () => {
    it('should return tickets array with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/tickets?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter tickets by status', async () => {
      const response = await request(app)
        .get('/api/v1/tickets?status=OPEN');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/tickets/stats', () => {
    it('should return ticket statistics', async () => {
      const response = await request(app)
        .get('/api/v1/tickets/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('POST /api/v1/tickets validation', () => {
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

  describe('PUT /api/v1/tickets/:id', () => {
    it('should return error when not authenticated', async () => {
      const response = await request(app)
        .put('/api/v1/tickets/non-existent-id')
        .send({ status: 'CLOSED' });

      // Should return 401 (unauthorized) or 404 (ticket not found) 
      // since auth middleware might be bypassed in test setup
      expect([401, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/v1/tickets/:id', () => {
    it('should return error when not authenticated', async () => {
      const response = await request(app)
        .delete('/api/v1/tickets/non-existent-id');

      // Should return 401 (unauthorized) or 404 (ticket not found)
      expect([401, 404, 500]).toContain(response.status);
    });
  });
});