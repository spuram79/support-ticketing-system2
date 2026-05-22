import { Request, Response } from 'express';
import { prisma } from '../db';
import { generateTicketNumber } from '../utils/ticketNumber';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const getTickets = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const assigneeId = req.query.assigneeId as string;
    const search = req.query.search as string;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (search) {
      where.OR = [
        { subject: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
          creator: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.ticket.count({ where }),
    ]);

    return res.json({
      success: true,
      count: tickets.length,
      total,
      page,
      limit,
      data: tickets,
    });
  } catch (error) {
    logger.error('Error fetching tickets:', error);
    return res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

export const getTicketById = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
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
  } catch (error) {
    logger.error('Error fetching ticket:', error);
    return res.status(500).json({ error: 'Failed to fetch ticket' });
  }
};

export const createTicket = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { subject, description, priority, type, categoryId, assigneeId } = req.body;

    // Validate required fields
    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const ticketNumber = await generateTicketNumber();

    // Get creator ID from authenticated user or use first user as fallback
    let creatorId: string;
    if (req.user?.id) {
      creatorId = req.user.id;
    } else {
      const firstUser = await prisma.user.findFirst();
      creatorId = firstUser?.id || '';
    }

    const ticket = await prisma.ticket.create({
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
    await prisma.auditLog.create({
      data: {
        action: 'TICKET_CREATED',
        resource: 'Ticket',
        resourceId: ticket.id,
        userId: req.user?.id,
      },
    });

    return res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    logger.error('Error creating ticket:', error);
    return res.status(500).json({ error: 'Failed to create ticket' });
  }
};

export const updateTicket = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if ticket exists
    const existingTicket = await prisma.ticket.findUnique({ where: { id } });
    if (!existingTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: updates,
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'TICKET_UPDATED',
        resource: 'Ticket',
        resourceId: ticket.id,
        userId: req.user?.id,
        details: updates,
      },
    });

    return res.json({ success: true, data: ticket });
  } catch (error) {
    logger.error('Error updating ticket:', error);
    return res.status(500).json({ error: 'Failed to update ticket' });
  }
};

export const deleteTicket = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;

    // Check if ticket exists first
    const existingTicket = await prisma.ticket.findUnique({ where: { id } });
    if (!existingTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    await prisma.ticket.delete({ where: { id } });
    return res.json({ success: true, message: 'Ticket deleted' });
  } catch (error) {
    logger.error('Error deleting ticket:', error);
    return res.status(500).json({ error: 'Failed to delete ticket' });
  }
};

export const getTicketStats = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const stats = await prisma.ticket.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const result: Record<string, number> = {};
    stats.forEach((curr: { status: string; _count: { id: number } }) => {
      result[curr.status] = curr._count.id;
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error fetching ticket stats:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
};