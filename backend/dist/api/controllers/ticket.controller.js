"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTicketStats = exports.forwardTicket = exports.addInternalNote = exports.toggleFollow = exports.assignTicket = exports.addComment = exports.deleteTicket = exports.updateTicket = exports.createTicket = exports.getTicket = exports.getMyTickets = exports.getTickets = void 0;
const prisma_js_1 = require("../../config/prisma.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const bullmq_1 = require("bullmq");
const redis_js_1 = require("../../config/redis.js");
// @desc    Get all tickets
// @route   GET /api/v1/tickets
// @access  Private
const getTickets = async (req, res) => {
    const { page = 1, limit = 20, status, priority, assigneeId, search, sortBy = 'createdAt', sortOrder = 'desc', } = req.query;
    const skip = (page - 1) * limit;
    const where = {};
    if (status)
        where.status = status;
    if (priority)
        where.priority = priority;
    if (assigneeId)
        where.assigneeId = assigneeId;
    if (search) {
        where.OR = [
            { subject: { contains: search } },
            { ticketNumber: { contains: search } },
            { description: { contains: search } },
        ];
    }
    const tickets = await prisma_js_1.prisma.ticket.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
            assignee: { select: { firstName: true, lastName: true, email: true } },
            creator: { select: { firstName: true, lastName: true, email: true } },
            category: { select: { name: true } },
            _count: { select: { comments: true, followers: true } },
        },
    });
    const total = await prisma_js_1.prisma.ticket.count({ where });
    res.status(200).json({
        success: true,
        count: tickets.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        data: tickets,
    });
};
exports.getTickets = getTickets;
// @desc    Get my tickets
// @route   GET /api/v1/tickets/my-tickets
// @access  Private
const getMyTickets = async (req, res) => {
    const tickets = await prisma_js_1.prisma.ticket.findMany({
        where: { assigneeId: req.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            creator: { select: { firstName: true, lastName: true, email: true } },
            category: { select: { name: true } },
        },
    });
    res.status(200).json({ success: true, count: tickets.length, data: tickets });
};
exports.getMyTickets = getMyTickets;
// @desc    Get ticket by ID
// @route   GET /api/v1/tickets/:id
// @access  Private
const getTicket = async (req, res) => {
    const ticket = await prisma_js_1.prisma.ticket.findUnique({
        where: { id: req.params.id },
        include: {
            assignee: { select: { firstName: true, lastName: true, email: true } },
            creator: { select: { firstName: true, lastName: true, email: true } },
            category: true,
            comments: {
                orderBy: { createdAt: 'asc' },
                include: { author: { select: { firstName: true, lastName: true, email: true } } },
            },
            followers: { include: { user: { select: { firstName: true, lastName: true } } } },
            attachments: true,
        },
    });
    if (!ticket) {
        throw new errorHandler_js_1.AppError('Ticket not found', 404);
    }
    res.status(200).json({ success: true, data: ticket });
};
exports.getTicket = getTicket;
// @desc    Create ticket
// @route   POST /api/v1/tickets
// @access  Private
const createTicket = async (req, res) => {
    const { subject, description, priority = 'MEDIUM', type = 'INCIDENT', source = 'WEB', categoryId, metadata, } = req.body;
    // Generate ticket number
    const ticketNumber = `TKT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const ticket = await prisma_js_1.prisma.ticket.create({
        data: {
            ticketNumber,
            subject,
            description,
            priority,
            type,
            source,
            categoryId,
            creatorId: req.user.id,
            metadata,
        },
    });
    // Queue AI categorization
    const categorizationQueue = new bullmq_1.Queue('ai-categorization', redis_js_1.redisConnection);
    await categorizationQueue.add('categorize', { ticketId: ticket.id });
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
        io.emit('ticketCreated', ticket);
    }
    res.status(201).json({ success: true, data: ticket });
};
exports.createTicket = createTicket;
// @desc    Update ticket
// @route   PATCH /api/v1/tickets/:id
// @access  Private
const updateTicket = async (req, res) => {
    const ticket = await prisma_js_1.prisma.ticket.update({
        where: { id: req.params.id },
        data: req.body,
    });
    res.status(200).json({ success: true, data: ticket });
};
exports.updateTicket = updateTicket;
// @desc    Delete ticket
// @route   DELETE /api/v1/tickets/:id
// @access  Private
const deleteTicket = async (req, res) => {
    await prisma_js_1.prisma.ticket.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Ticket deleted' });
};
exports.deleteTicket = deleteTicket;
// @desc    Add comment
// @route   POST /api/v1/tickets/:id/comments
// @access  Private
const addComment = async (req, res) => {
    const { content, isInternal = false } = req.body;
    const comment = await prisma_js_1.prisma.comment.create({
        data: {
            ticketId: req.params.id,
            authorId: req.user.id,
            content,
            isInternal,
        },
        include: { author: { select: { firstName: true, lastName: true } } },
    });
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
        io.emit('commentAdded', { ...comment, ticketId: req.params.id });
    }
    res.status(201).json({ success: true, data: comment });
};
exports.addComment = addComment;
// @desc    Assign ticket
// @route   POST /api/v1/tickets/:id/assign
// @access  Private
const assignTicket = async (req, res) => {
    const { assigneeId } = req.body;
    const ticket = await prisma_js_1.prisma.ticket.update({
        where: { id: req.params.id },
        data: { assigneeId },
        include: {
            assignee: { select: { firstName: true, lastName: true, email: true } },
        },
    });
    res.status(200).json({ success: true, data: ticket });
};
exports.assignTicket = assignTicket;
// @desc    Toggle follow ticket
// @route   POST /api/v1/tickets/:id/follow
// @access  Private
const toggleFollow = async (req, res) => {
    const existing = await prisma_js_1.prisma.ticketFollower.findUnique({
        where: {
            ticketId_userId: { ticketId: req.params.id, userId: req.user.id },
        },
    });
    if (existing) {
        await prisma_js_1.prisma.ticketFollower.delete({
            where: { ticketId_userId: { ticketId: req.params.id, userId: req.user.id } },
        });
        return res.status(200).json({ success: true, message: 'Unfollowed ticket' });
    }
    await prisma_js_1.prisma.ticketFollower.create({
        data: { ticketId: req.params.id, userId: req.user.id },
    });
    res.status(201).json({ success: true, message: 'Following ticket' });
};
exports.toggleFollow = toggleFollow;
// @desc    Add internal note
// @route   POST /api/v1/tickets/:id/notes
// @access  Private
const addInternalNote = async (req, res) => {
    const { content } = req.body;
    const comment = await prisma_js_1.prisma.comment.create({
        data: {
            ticketId: req.params.id,
            authorId: req.user.id,
            content,
            isInternal: true,
        },
    });
    res.status(201).json({ success: true, data: comment });
};
exports.addInternalNote = addInternalNote;
// @desc    Forward ticket
// @route   POST /api/v1/tickets/:id/forward
// @access  Private
const forwardTicket = async (req, res) => {
    const { toEmail, note } = req.body;
    // In production, send email notification
    res.status(200).json({ success: true, message: 'Ticket forwarded' });
};
exports.forwardTicket = forwardTicket;
// @desc    Get ticket statistics
// @route   GET /api/v1/tickets/stats
// @access  Private
const getTicketStats = async (req, res) => {
    const stats = await prisma_js_1.prisma.ticket.groupBy({
        by: ['status'],
        _count: { id: true },
    });
    const priorityStats = await prisma_js_1.prisma.ticket.groupBy({
        by: ['priority'],
        _count: { id: true },
    });
    res.status(200).json({
        success: true,
        data: {
            statusStats: stats,
            priorityStats,
        },
    });
};
exports.getTicketStats = getTicketStats;
