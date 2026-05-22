"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_js_1 = require("../config/env.js");
const prisma_js_1 = require("../config/prisma.js");
const errorHandler_js_1 = require("./errorHandler.js");
const authentication = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return next(new errorHandler_js_1.AppError('Not authenticated', 401));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_js_1.env.JWT_SECRET);
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: decoded.id },
        });
        if (!user) {
            return next(new errorHandler_js_1.AppError('User not found', 404));
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        next();
    }
    catch (error) {
        return next(new errorHandler_js_1.AppError('Invalid token', 401));
    }
};
exports.authentication = authentication;
