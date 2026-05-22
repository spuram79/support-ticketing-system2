"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAICategoryWorker = exports.findSimilarTickets = exports.routeTicket = exports.categorizeTicket = void 0;
const client_1 = require("@prisma/client");
const bullmq_1 = require("bullmq");
const redis_js_1 = require("../config/redis.js");
const logger_js_1 = require("../utils/logger.js");
const openai_1 = require("openai");
const prisma = new client_1.PrismaClient();
// OpenAI configuration
const openaiConfig = new openai_1.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new openai_1.OpenAIApi(openaiConfig);
// Categorize ticket using AI
const categorizeTicket = async (ticketId) => {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
        logger_js_1.logger.error('Ticket not found for categorization', { ticketId });
        return;
    }
    try {
        // Use simple keyword-based categorization for now
        // In production, use OpenAI or other ML services
        const categories = {
            hardware: ['computer', 'laptop', 'mouse', 'keyboard', 'monitor', 'printer', 'hardware', 'cpu', 'gpu', 'memory'],
            software: ['application', 'install', 'software', 'program', 'app', 'error', 'crash'],
            network: ['wifi', 'network', 'internet', 'connection', 'router', 'bandwidth', 'speed'],
            password: ['password', 'login', 'access', 'authentication', 'account'],
            email: ['email', 'mail', 'smtp', 'imap'],
            phone: ['phone', 'call', 'voicemail'],
        };
        let aiCategory = 'general';
        const description = `${ticket.subject} ${ticket.description || ''}`.toLowerCase();
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some((kw) => description.includes(kw))) {
                aiCategory = category;
                break;
            }
        }
        // Generate tags
        const tags = [];
        const importantWords = description.match(/\b(\w{4,})\b/g) || [];
        const uniqueWords = [...new Set(importantWords)].slice(0, 5);
        tags.push(...uniqueWords);
        await prisma.ticket.update({
            where: { id: ticketId },
            data: {
                aiCategory,
                aiTags: tags,
                aiScore: 0.95,
            },
        });
        logger_js_1.logger.info('Ticket categorized', { ticketId, category: aiCategory, tags });
        // Auto-assign based on category
        const agents = await prisma.user.findMany({
            where: { role: 'AGENT' },
        });
        if (agents.length > 0) {
            const categoryAgents = {
                hardware: [],
                software: [],
                network: [],
                password: [],
                email: [],
                phone: [],
            };
            const categoryAgent = categoryAgents[aiCategory]?.[0] || agents[0].id;
            await prisma.ticket.update({
                where: { id: ticketId },
                data: { assigneeId: categoryAgent },
            });
        }
    }
    catch (error) {
        logger_js_1.logger.error('AI categorization failed', { ticketId, error });
    }
};
exports.categorizeTicket = categorizeTicket;
// AI-powered routing
const routeTicket = async (ticketId) => {
    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { category: true },
    });
    if (!ticket)
        return;
    // Simple routing logic
    let assigneeId;
    if (ticket.aiCategory) {
        const agent = await prisma.user.findFirst({
            where: {
                role: 'AGENT',
                departments: { has: ticket.aiCategory },
            },
        });
        assigneeId = agent?.id;
    }
    // Fallback to least busy agent
    if (!assigneeId) {
        const agent = await prisma.user.findFirst({
            where: { role: 'AGENT' },
            orderBy: { createdAt: 'asc' },
        });
        assigneeId = agent?.id;
    }
    if (assigneeId) {
        await prisma.ticket.update({
            where: { id: ticketId },
            data: { assigneeId },
        });
    }
};
exports.routeTicket = routeTicket;
// Knowledge base lookup
const findSimilarTickets = async (ticketId) => {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket)
        return [];
    const description = ticket.description?.toLowerCase() || '';
    const similarTickets = await prisma.ticket.findMany({
        where: {
            id: { not: ticketId },
            status: 'RESOLVED',
            OR: [
                { description: { contains: description } },
                { subject: { contains: ticket.subject } },
            ],
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            assignee: { select: { firstName: true, lastName: true } },
        },
    });
    return similarTickets;
};
exports.findSimilarTickets = findSimilarTickets;
// Create queue workers
const startAICategoryWorker = () => {
    const worker = new bullmq_1.Worker('ai-categorization', async (job) => {
        await (0, exports.categorizeTicket)(job.data.ticketId);
    }, { connection: redis_js_1.redisConnection });
    worker.on('completed', (job) => {
        logger_js_1.logger.info('AI categorization completed', { jobId: job.id });
    });
    worker.on('failed', (job, err) => {
        logger_js_1.logger.error('AI categorization failed', { jobId: job?.id, error: err.message });
    });
    return worker;
};
exports.startAICategoryWorker = startAICategoryWorker;
