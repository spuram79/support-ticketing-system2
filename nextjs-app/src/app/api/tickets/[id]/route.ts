import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET /api/tickets/[id] - Get ticket by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const ticketId = params.id;
    const ticket = db.prepare(`
      SELECT t.*, 
             u1.name as creator_name, u1.email as creator_email,
             u2.name as assignee_name, u2.email as assignee_email
      FROM tickets t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE t.id = ?
    `).get(ticketId);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Role-based access control
    if (user.role === 'customer' && ticket.created_by !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get assignee and creator info
    const result = {
      ...ticket,
      creator: ticket.creator_name ? {
        id: ticket.created_by,
        name: ticket.creator_name,
        email: ticket.creator_email
      } : undefined,
      assignee: ticket.assignee_name ? {
        id: ticket.assigned_to,
        name: ticket.assignee_name,
        email: ticket.assignee_email
      } : undefined
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/tickets/[id] - Update ticket
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const ticketId = params.id;
    const body = await request.json();

    // Check if ticket exists
    const existingTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId);
    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Update ticket
    const updateTicket = db.prepare(`
      UPDATE tickets SET
        subject = COALESCE(?, subject),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        priority = COALESCE(?, priority),
        severity = COALESCE(?, severity),
        status = COALESCE(?, status),
        assigned_to = COALESCE(?, assigned_to),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateTicket.run(
      body.subject,
      body.description,
      body.category,
      body.priority,
      body.severity,
      body.status,
      body.assigned_to,
      ticketId
    );

    const updatedTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId);

    return NextResponse.json({
      success: true,
      data: updatedTicket,
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}