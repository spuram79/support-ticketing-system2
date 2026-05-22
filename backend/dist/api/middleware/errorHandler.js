"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const logger_js_1 = require("../utils/logger.js");
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Log error
    logger_js_1.logger.error('Error stack:', err.stack);
    // Prisma errors
    if (err.name === 'PrismaKnownRequestError') {
        const message = 'Resource not found';
        error = new AppError(message, 404);
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new AppError(message, 401);
    }
    // Validation errors
    if (err.name === 'ValidationError') {
        const message = 'Validation error';
        error = new AppError(message, 400);
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
