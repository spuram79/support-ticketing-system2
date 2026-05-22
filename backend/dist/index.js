"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const http_1 = require("http");
const tickets_1 = __importDefault(require("./routes/tickets"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const db_1 = require("./db");
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
// Security headers
app.use((0, helmet_1.default)({
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
}));
// CORS
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
// Compression
app.use((0, compression_1.default)());
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
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
app.use('/api/v1/tickets', tickets_1.default);
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/users', users_1.default);
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
app.use((err, req, res, next) => {
    db_1.logger.error('Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});
const PORT = process.env.PORT || 3001;
const server = httpServer.listen(PORT, () => {
    db_1.logger.info(`✅ Server running on port ${PORT}`);
    db_1.logger.info(`🌐 API Base URL: http://localhost:${PORT}/api/v1`);
});
exports.server = server;
// Graceful shutdown
process.on('SIGTERM', () => {
    db_1.logger.info('SIGTERM received, shutting down');
    server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
    db_1.logger.info('SIGINT received, shutting down');
    server.close(() => process.exit(0));
});
