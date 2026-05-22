"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTicketStats = exports.deleteTicket = exports.updateTicket = exports.createTicket = exports.getTicketById = exports.getTickets = void 0;
const db_1 = require("../db");
const ticketNumber_1 = require("../utils/ticketNumber");
const getTickets = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status;
        const priority = req.query.priority;
        const assigneeId = req.query.assigneeId;
        const search = req.query.search;
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
                { description: { contains: search } },
            ];
        }
        const [tickets, total] = await Promise.all([
            db_1.prisma.ticket.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
                    creator: { select: { id: true, firstName: true, lastName: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            db_1.prisma.ticket.count({ where }),
        ]);
        return res.json({
            success: true,
            count: tickets.length,
            total,
            page,
            limit,
            data: tickets,
        });
    }
    catch (error) {
        console.error('Error fetching tickets:', error);
        return res.status(500).json({ error: 'Failed to fetch tickets' });
    }
};
exports.getTickets = getTickets;
const getTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await db_1.prisma.ticket.findUnique({
            where: { id },
            include: {
                assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
                creator: { select: { id: true, firstName: true, lastName: true, email: true } },
                comments: {
                    include: { author: { select: { id: true, firstName: true, lastName: true, email: true } } },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        return res.json({ success: true, data: ticket });
    }
    catch (error) {
        console.error('Error fetching ticket:', error);
        return res.status(500).json({ error: 'Failed to fetch ticket' });
    }
};
exports.getTicketById = getTicketById;
const createTicket = async (req, res) => {
    try {
        const { subject, description, priority, type, categoryId, assigneeId } = req.body;
        const ticketNumber = await (0, ticketNumber_1.generateTicketNumber)();
        // Get creator ID from authenticated user or use first user as fallback
        let creatorId;
        if (req.user?.id) {
            creatorId = req.user.id;
        }
        else {
            const firstUser = await db_1.prisma.user.findFirst();
            creatorId = firstUser?.id || '';
        }
        const ticket = await db_1.prisma.ticket.create({
            data: {
                ticketNumber,
                subject,
                description,
                priority: priority || 'MEDIUM',
                type: type || 'INCIDENT',
                categoryId,
                assigneeId,
                creatorId,
            },
        });
        // Create audit log
        await db_1.prisma.auditLog.create({
            data: {
                action: 'TICKET_CREATED',
                resource: 'Ticket',
                resourceId: ticket.id,
                userId: req.user?.id,
            },
        });
        return res.status(201).json({ success: true, data: ticket });
    }
    catch (error) {
        console.error('Error creating ticket:', error);
        return res.status(500).json({ error: 'Failed to create ticket' });
    }
};
exports.createTicket = createTicket;
const updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const ticket = await db_1.prisma.ticket.update({
            where: { id },
            data: updates,
        });
        // Create audit log
        await db_1.prisma.auditLog.create({
            data: {
                action: 'TICKET_UPDATED',
                resource: 'Ticket',
                resourceId: ticket.id,
                userId: req.user?.id,
                details: updates,
            },
        });
        return res.json({ success: true, data: ticket });
    }
    catch (error) {
        console.error('Error updating ticket:', error);
        return res.status(500).json({ error: 'Failed to update ticket' });
    }
};
exports.updateTicket = updateTicket;
const deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.prisma.ticket.delete({ where: { id } });
        return res.json({ success: true, message: 'Ticket deleted' });
    }
    catch (error) {
        console.error('Error deleting ticket:', error);
        return res.status(500).json({ error: 'Failed to delete ticket' });
    }
};
exports.deleteTicket = deleteTicket;
const getTicketStats = async (req, res) => {
    try {
        const stats = await db_1.prisma.ticket.groupBy({
            by: ['status'],
            _count: { id: true },
        });
        const result = {};
        stats.forEach((curr) => {
            result[curr.status] = curr._count.id;
        });
        return res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('Error fetching ticket stats:', error);
        return res.status(500).json({ error: 'Failed to fetch stats' });
    }
};
exports.getTicketStats = getTicketStats;
