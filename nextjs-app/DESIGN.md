# DESIGN - Next.js Support Ticketing System

**Version:** 1.0.0  
**Last Updated:** May 22, 2026  
**Author:** Santosh Puram

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Next.js Implementation](#3-nextjs-implementation)
4. [API Layer](#4-api-layer)
5. [Database Design](#5-database-design)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Frontend Components](#7-frontend-components)
8. [Testing Strategy](#8-testing-strategy)
9. [Deployment](#9-deployment)
10. [Environment Configuration](#10-environment-configuration)

---

## 1. System Overview

### 1.1 Purpose

This document describes the architecture and implementation of a **scalable, enterprise-grade ticketing and issue management system** built with Next.js 15 App Router. The system handles multi-channel support operations for Hardware & Software support.

### 1.2 Key Features

| Feature | Description |
|---------|-------------|
| **Multi-channel ingestion** | Web, Email, SMS, WhatsApp, Phone, API |
| **Ticket lifecycle management** | Full CRUD operations with status tracking |
| **AI-powered categorization** | Automatic ticket classification and tagging |
| **ITSM compliance** | Incident, Problem, Change, and Asset management |
| **Role-based access control** | 6 distinct roles with granular permissions |
| **SLA management** | Configurable SLAs with escalation support |
| **Workflow automation** | Rule-based automation engine |
| **Real-time notifications** | WebSocket-based live updates |

---

## 2. Architecture

### 2.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Next.js   │  │   Backend    │  │   Workers    │     │
│  │   (App Router)│  │  (Node.js)   │  │  (BullMQ)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
├─────────────────────────────────────────────────────────────┤
│                    Shared Services                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  SQLite DB   │  │    Redis     │  │   Socket.io  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Runtime** | Node.js | 20.x | Server runtime |
| **Framework** | Next.js | 15.x | React framework with App Router |
| **Database** | SQLite | 3.x | Lightweight database with better-sqlite3 |
| **ORM** | better-sqlite3 | 9.x | Native SQLite driver for Node.js |
| **Authentication** | JWT | 9.x | Token-based authentication |
| **Password Hashing** | bcryptjs | 2.x | Secure password storage |
| **Testing** | Vitest | 1.x | Unit and integration testing |
| **Testing** | React Testing Library | 14.x | Component testing |
| **Styling** | TailwindCSS | 3.x | Utility-first CSS framework |

### 2.3 Project Structure

```
nextjs-app/
├── src/
│   ├── app/                    # App Router directory
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   │   └── route.ts
│   │   │   └── tickets/
│   │   │       ├── [id]/
│   │   │       │   ├── route.ts
│   │   │       │   └── comments/
│   │   │       │       └── route.ts
│   │   │       └── route.ts
│   │   ├── tickets/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/                   # Shared utilities
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   └── types.ts
│   ├── __tests__/             # Test files
│   │   ├── api/
│   │   └── components/
│   └── globals.css
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 3. Next.js Implementation

### 3.1 App Router Structure

The application uses Next.js 15 App Router with the following routing conventions:

```typescript
// Route: /api/tickets/[id]
// File: src/app/api/tickets/[id]/route.ts
// Handlers: GET, PUT

// Route: /tickets/[id]
// File: src/app/tickets/[id]/page.tsx
// Component: TicketDetailsPage

// Route: /tickets/new
// File: src/app/tickets/new/page.tsx
// Component: NewTicketPage
```

### 3.2 Server Actions & API Routes

API routes are implemented using Next.js Extended Routes pattern:

```typescript
// GET /api/tickets/[id] - Retrieve ticket by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Authentication
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Role-based access control
  const ticket = db.prepare(`SELECT * FROM tickets WHERE id = ?`).get(params.id);
  
  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  // Return ticket data
  return NextResponse.json({ success: true, data: ticket });
}
```

### 3.3 Database Connection Pattern

```typescript
// src/lib/db.ts
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'tickets.db');
const db = new Database(dbPath);

// Create tables on initialization
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'agent',
    department TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_number TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Software',
    priority TEXT DEFAULT 'Medium',
    severity TEXT DEFAULT 'Minor',
    status TEXT DEFAULT 'Open',
    source TEXT DEFAULT 'Portal',
    assigned_to INTEGER,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  );
`);

export { db };
```

---

## 4. API Layer

### 4.1 Authentication API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth` | POST | User login with email/password |
| `/api/auth` | GET | Token verification and user info |

```typescript
// POST /api/auth - Login
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return NextResponse.json({ success: true, data: { token, user } });
}
```

### 4.2 Tickets API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tickets` | GET | List all tickets (paginated) |
| `/api/tickets` | POST | Create new ticket |
| `/api/tickets/[id]` | GET | Get ticket by ID |
| `/api/tickets/[id]` | PUT | Update ticket |
| `/api/tickets/[id]/comments` | GET | Get ticket comments |
| `/api/tickets/[id]/comments` | POST | Add comment to ticket |

### 4.3 Role-Based Permissions

```typescript
// src/lib/auth.ts
export const ROLES = {
  ADMIN: 'admin',
  LEAD: 'lead',
  AGENT: 'agent',
  CUSTOMER: 'customer',
} as const;

export function canViewAllTickets(role: string): boolean {
  return [ROLES.ADMIN, ROLES.LEAD, ROLES.AGENT].includes(role as any);
}

export function canAssignTickets(role: string): boolean {
  return [ROLES.ADMIN, ROLES.LEAD].includes(role as any);
}
```

---

## 5. Database Design

### 5.1 Schema

```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'agent',
  department TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table
CREATE TABLE tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_number TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Software',
  priority TEXT DEFAULT 'Medium',  -- Critical, High, Medium, Low
  severity TEXT DEFAULT 'Minor',   -- Critical, Major, Minor, Trivial
  status TEXT DEFAULT 'Open',      -- Open, In Progress, Resolved, Closed, Escalated, On Hold
  source TEXT DEFAULT 'Portal',    -- Portal, Email, Phone, SMS, API
  assigned_to INTEGER,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Ticket comments
CREATE TABLE ticket_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  user_id INTEGER,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 6. Authentication & Authorization

### 6.1 JWT Token Generation

```typescript
// src/lib/auth.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export function generateToken(user: UserPayload): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
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
```

### 6.2 Protected API Pattern

```typescript
export async function GET(request: NextRequest) {
  // 1. Extract token
  const token = request.headers.get('authorization')?.split(' ')[1];
  
  // 2. Verify token
  const user = token ? verifyToken(token) : null;
  
  // 3. Check authorization
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 4. Apply role-based access control
  if (user.role === 'customer' && ticket.created_by !== user.id) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  
  // 5. Return data
  return NextResponse.json({ success: true, data: result });
}
```

---

## 7. Frontend Components

### 7.1 Ticket Details Page

```tsx
// src/app/tickets/[id]/page.tsx
export default function TicketDetailsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tickets/${params.id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      setTicket(data.data);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) return <LoadingSpinner />;
  if (!ticket) return <NotFound />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <TicketHeader ticket={ticket} />
      <TicketComments ticketId={ticket.id} />
      <TicketActions ticket={ticket} />
    </div>
  );
}
```

### 7.2 Component Testing Pattern

```tsx
// src/__tests__/components/ticket-details.test.tsx
describe('TicketDetails', () => {
  it('should render ticket information correctly', async () => {
    const mockTicket = {
      id: 1,
      ticket_number: 'TKT-2024-000001',
      subject: 'Test Ticket',
      status: 'Open',
      priority: 'High',
    };

    render(
      <QueryClientProvider client={queryClient}>
        <TicketDetails ticket={mockTicket} />
      </QueryClientProvider>
    );

    expect(screen.getByText('TKT-2024-000001')).toBeInTheDocument();
    expect(screen.getByText('Test Ticket')).toBeInTheDocument();
  });
});
```

---

## 8. Testing Strategy

### 8.1 Test Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setup-tests.ts'],
  },
});
```

### 8.2 Test Coverage

| Test Type | Files | Count | Description |
|-----------|-------|-------|-------------|
| API Tests | `__tests__/api/*.test.ts` | 35 | Endpoint testing |
| Component Tests | `__tests__/components/*.test.tsx` | 27 | UI component testing |
| Integration Tests | `__tests__/api/integration.test.ts` | 7 | End-to-end scenarios |

### 8.3 Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test -- --coverage

# Run specific test file
pnpm test auth.test.ts
```

---

## 9. Deployment

### 9.1 Environment Variables

```bash
# .env
JWT_SECRET=your-production-secret-key
NODE_ENV=production
PORT=3000
```

### 9.2 Build Commands

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Start production server
pnpm start

# Development mode
pnpm dev
```

### 9.3 Docker Deployment (Optional)

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
```

---

## 10. Environment Configuration

### 10.1 Required Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `NODE_ENV` | Environment (development/production) | No (defaults to development) |
| `PORT` | Server port | No (defaults to 3000) |

### 10.2 Development Setup

```bash
# Clone repository
git clone https://github.com/spuram79/support-ticketing-system2.git
cd support-ticketing-system2

# Install dependencies
pnpm install

# Set up environment
cp nextjs-app/.env.example nextjs-app/.env

# Run development server
pnpm dev

# Open browser
open http://localhost:3000
```

---

## Appendix A: API Response Formats

### A.1 Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### A.2 Error Response

```json
{
  "error": "Error message"
}
```

### A.3 Paginated Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Appendix B: Role Permissions Matrix

| Action | Admin | Lead | Agent | Customer |
|--------|-------|------|-------|----------|
| Create Ticket | ✅ | ✅ | ✅ | ✅ |
| View All Tickets | ✅ | ✅ | ✅ | ❌ |
| View Own Tickets | ✅ | ✅ | ✅ | ✅ |
| Update Ticket | ✅ | ✅ | ✅ | ⚠️ (own only) |
| Assign Tickets | ✅ | ✅ | ❌ | ❌ |
| Escalate Tickets | ✅ | ✅ | ❌ | ❌ |
| Delete Tickets | ✅ | ❌ | ❌ | ❌ |

⚠️ = Only own tickets