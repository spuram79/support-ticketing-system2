"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketRateLimiter = exports.authRateLimiter = exports.rateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// General API rate limit
exports.rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
// Strict rate limit for auth endpoints
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many authentication attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
// Ticket creation rate limit
exports.ticketRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50,
    message: { error: 'Ticket creation limit reached' },
    standardHeaders: true,
    legacyHeaders: false,
});
