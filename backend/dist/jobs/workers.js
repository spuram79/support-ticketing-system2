"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWorkers = exports.emailWorker = exports.slaWorker = exports.categorizationWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_js_1 = require("./redis.js");
const logger_js_1 = require("../utils/logger.js");
const prisma_js_1 = require("../config/prisma.js");
// Ticket categorization worker
exports.categorizationWorker = new bullmq_1.Worker('categorization', async (job) => {
    const { ticketId } = job.data;
    const ticket = await prisma_js_1.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket)
        return;
    // Simple categorization based on keywords
    const categories = {
        hardware: ['computer', 'laptop', 'mouse', 'keyboard', 'monitor', 'printer'],
        software: ['application', 'install', 'software', 'program', 'app'],
        network: ['wifi', 'network', 'internet', 'connection', 'router'],
        password: ['password', 'login', 'access', 'authentication'],
    };
    let category = 'general';
    const description = ticket.description.toLowerCase();
    for (const [cat, keywords] of Object.entries(categories)) {
        if (keywords.some((kw) => description.includes(kw))) {
            category = cat;
            break;
        }
    }
    await prisma_js_1.prisma.ticket.update({
        where: { id: ticketId },
        data: { aiCategory: category },
    });
    logger_js_1.logger.info('Ticket categorized', { ticketId, category });
}, { connection: redis_js_1.redisConnection });
// SLA check worker
exports.slaWorker = new bullmq_1.Worker('sla-check', async (job) => {
    const { ticketId } = job.data;
    const ticket = await prisma_js_1.prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { sla: true },
    });
    if (!ticket)
        return;
    // Check if SLA is breached
    if (ticket.dueDate && new Date() > ticket.dueDate && ticket.status !== 'RESOLVED') {
        await prisma_js_1.prisma.ticket.update({
            where: { id: ticketId },
            data: { status: 'OPEN' }, // Escalate
        });
        // Emit notification
        logger_js_1.logger.warn('SLA breached', { ticketId });
    }
}, { connection: redis_js_1.redisConnection });
// Email sending worker
exports.emailWorker = new bullmq_1.Worker('email', async (job) => {
    const { to, subject, body } = job.data;
    // In production, send actual email
    logger_js_1.logger.info('Email sent', { to, subject });
}, { connection: redis_js_1.redisConnection });
// Start workers
const startWorkers = () => {
    exports.categorizationWorker.on('completed', (job) => {
        logger_js_1.logger.info('Categorization job completed', { jobId: job.id });
    });
    exports.categorizationWorker.on('failed', (job, err) => {
        logger_js_1.logger.error('Categorization job failed', { jobId: job?.id, error: err.message });
    });
    exports.slaWorker.on('completed', (job) => {
        logger_js_1.logger.info('SLA check completed', { jobId: job.id });
    });
    exports.emailWorker.on('completed', (job) => {
        logger_js_1.logger.info('Email sent', { jobId: job.id });
    });
};
exports.startWorkers = startWorkers;
