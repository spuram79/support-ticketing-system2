import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface UserPayload {
  id: number;
  email: string;
  name: string;
  role: string;
  department?: string;
}

export function generateToken(user: UserPayload): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export const ROLES = {
  ADMIN: 'admin',
  LEAD: 'lead',
  AGENT: 'agent',
  CUSTOMER: 'customer',
} as const;

export function canCreateTicket(role: string): boolean {
  return [ROLES.ADMIN, ROLES.LEAD, ROLES.AGENT, ROLES.CUSTOMER].includes(role as any);
}

export function canViewAllTickets(role: string): boolean {
  return [ROLES.ADMIN, ROLES.LEAD, ROLES.AGENT].includes(role as any);
}

export function canAssignTickets(role: string): boolean {
  return [ROLES.ADMIN, ROLES.LEAD].includes(role as any);
}

export function canEscalateTickets(role: string): boolean {
  return [ROLES.ADMIN, ROLES.LEAD].includes(role as any);
}