"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = exports.logger = void 0;
// Simple logger
exports.logger = {
    info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
    error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
    warn: (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args),
};
const createLogger = () => exports.logger;
exports.createLogger = createLogger;
