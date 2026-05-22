import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import ticketRoutes from './routes/tickets';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import { logger } from './db';

const app = express();
const httpServer = createServer(app);

// Security headers
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    name: 'Support Ticketing System API',
    version: '1.0.0',
    endpoints: {
      tickets: '/api/v1/tickets',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
    },
  });
});

// API Routes
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// Multi-channel endpoints
app.post('/api/v1/channels/email', (req, res) => {
  res.json({ success: true, data: { id: `email_${Date.now()}`, source: 'EMAIL', from: req.body.from, subject: req.body.subject } });
});

app.post('/api/v1/channels/sms', (req, res) => {
  res.json({ success: true, data: { id: `sms_${Date.now()}`, source: 'SMS', from: req.body.from } });
});

app.post('/api/v1/channels/whatsapp', (req, res) => {
  res.json({ success: true, data: { id: `wa_${Date.now()}`, source: 'WHATSAPP', from: req.body.from } });
});

app.post('/api/v1/channels/phone', (req, res) => {
  res.json({ success: true, data: { id: `phone_${Date.now()}`, source: 'PHONE', from: req.body.from } });
});

// Webhook
app.post('/api/v1/webhooks/:id', (req, res) => {
  res.json({ success: true, message: 'Webhook received' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;
const server = httpServer.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
  logger.info(`🌐 API Base URL: http://localhost:${PORT}/api/v1`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down');
  server.close(() => process.exit(0));
});

export { app, server };