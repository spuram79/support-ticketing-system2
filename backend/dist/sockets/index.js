"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketIO = void 0;
const socket_io_1 = require("socket.io");
const logger_js_1 = require("../utils/logger.js");
const SocketIO = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true,
        },
    });
    // Store connected users
    const connectedUsers = new Map();
    io.on('connection', (socket) => {
        logger_js_1.logger.info('Client connected', { socketId: socket.id });
        socket.on('join', (room) => {
            socket.join(room);
        });
        socket.on('authenticate', (token) => {
            // Verify JWT and authenticate
            // In production, decode and verify token
            socket.join('authenticated');
        });
        socket.on('subscribe-ticket', (ticketId) => {
            socket.join(`ticket-${ticketId}`);
        });
        socket.on('unsubscribe-ticket', (ticketId) => {
            socket.leave(`ticket-${ticketId}`);
        });
        socket.on('disconnect', () => {
            connectedUsers.delete(socket.id);
            logger_js_1.logger.info('Client disconnected', { socketId: socket.id });
        });
    });
    // Make io available globally
    global.io = io;
    return io;
};
exports.SocketIO = SocketIO;
