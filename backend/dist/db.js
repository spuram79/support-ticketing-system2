"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("./utils/logger");
// Create Prisma client singleton
const prismaClientSingleton = () => {
    return new client_1.PrismaClient({
        log: [
            { level: 'query', emit: 'stdout' },
            { level: 'error', emit: 'stdout' },
            { level: 'warn', emit: 'stdout' },
        ],
    });
};
const prisma = globalThis.__globalPrisma__ || (globalThis.__globalPrisma__ = prismaClientSingleton());
exports.prisma = prisma;
exports.logger = (0, logger_1.createLogger)();
