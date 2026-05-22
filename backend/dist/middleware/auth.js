"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header required' });
    }
    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const user = await db_1.prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, role: true, status: true },
        });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        if (user.status !== 'ACTIVE') {
            return res.status(403).json({ error: 'Account is inactive' });
        }
        req.user = user;
        return next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
exports.authenticate = authenticate;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
