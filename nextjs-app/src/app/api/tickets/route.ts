import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = 'SELECT * FROM tickets WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (priority && priority !== 'all') {
      query += ' AND priority = ?';
      params.push(priority);
    }
    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (subject LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Role-based filtering
    if (user.role === 'customer') {
      query += ' AND created_by = ?';
      params.push(user.id);
    } else if (user.role === 'agent') {
      query += ' AND (assigned_to = ? OR created_by = ?)';
      params.push(user.id, user.id);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const tickets = db.prepare(query).all(...params);
    const countResult = db.prepare('SELECT COUNT(*) as total FROM tickets').get();

    return NextResponse.json({
      success: true,
      data: tickets,
      pagination: {
        page,
        limit,
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, description, category, priority, severity, source } = body;

    // Generate ticket number
    const year = new Date().getFullYear();
    const countResult = db.prepare(
      'SELECT COUNT(*) as count FROM tickets WHERE strftime("%Y", created_at) = ?'
    ).get(year.toString());
    const ticketNumber = `TKT-${year}-${String(countResult.count + 1).padStart(6, '0')}`;

    const insertTicket = db.prepare(`
      INSERT INTO tickets (ticket_number, subject, description, category, priority, severity, status, source, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertTicket.run(
      ticketNumber,
      subject,
      description || '',
      category || 'Software',
      priority || 'Medium',
      severity || 'Minor',
      'Open',
      source || 'Portal',
      user.id
    );

    const newTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({
      success: true,
      data: newTicket,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}