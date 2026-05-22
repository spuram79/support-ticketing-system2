# Next.js Support Ticketing System - Technical Architecture

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [Authentication & Authorization](#authentication--authorization)
8. [Components](#components)
9. [Deployment](#deployment)
10. [Development Guide](#development-guide)

---

## System Overview

The Support Ticketing System is a modern, enterprise-grade issue management platform built with Next.js. It provides multi-channel ticket ingestion, intelligent categorization, SLA management, and role-based access control.

### Key Features
- **Ticket Management**: Full lifecycle from creation to resolution
- **Multi-Role Access**: Admin, Lead, Agent, Customer roles with RBAC
- **API-First Design**: RESTful API with JWT authentication
- **SQLite Database**: Embedded database with automatic seeding
- **Responsive UI**: Tailwind CSS styled components

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                          │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Application (Port 3000)                 │
│  ┌───────────────────┐    ┌──────────────────────────────┐   │
│  │   React Pages     │    │      API Routes              │   │
│  │  (app/*.tsx)      │    │    (app/api/*/route.ts)      │   │
│  │                   │    │                              │   │
│  │  - Dashboard      │◄──►│  - /api/auth               │   │
│  │  - Login          │    │  - /api/tickets            │   │
│  │  - Tickets List   │    │  - /api/tickets/[id]       │   │
│  │  - New Ticket     │    │                              │   │
│  └───────────────────┘    └──────────────────────────────┘   │
│                                │                             │
│  ┌───────────────────┐         │                             │
│  │   Lib Layer       │         ▼                             │
│  │                   │  ┌─────────────────┐                 │
│  │  - db.ts          │──► better-sqlite3 │                 │
│  │  - auth.ts        │  │   (tickets.db)  │                 │
│  └───────────────────┘  └─────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 15.0.0 | Full-stack React framework |
| **Runtime** | Node.js | 18+ | JavaScript runtime |
| **Language** | TypeScript | 5.3.2 | Type-safe JavaScript |
| **Database** | SQLite | 3.x | Embedded relational database |
| **DB Driver** | better-sqlite3 | 9.0.0 | Synchronous SQLite driver |
| **Styling** | Tailwind CSS | 3.4.0 | Utility-first CSS framework |
| **Authentication** | JWT | 9.0.2 | JSON Web Tokens |
| **Password Hashing** | bcryptjs | 2.4.3 | Secure password storage |
| **Icons** | Lucide React | 0.303.0 | Icon library |
| **State Management** | Zustand | 4.4.7 | Lightweight state management |
| **Date Utilities** | date-fns | 3.0.0 | Date formatting |

---

## Project Structure

```
nextjs-app/
├── .env.example                 # Environment variables template
├── next.config.js               # Next.js configuration
├── package.json                 # Dependencies and scripts
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── postcss.config.js            # PostCSS configuration
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── api/                 # API Routes
│   │   │   ├── auth/
│   │   │   │   └── route.ts     # POST: login, GET: current user
│   │   │   └── tickets/
│   │   │       └── route.ts     # GET: list, POST: create
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Main dashboard UI
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx         # Authentication page
│   │   │
│   │   ├── tickets/
│   │   │   ├── new/
│   │   │   │   └── page.tsx     # Create ticket form
│   │   │   └── page.tsx         # Tickets list with filters
│   │   │
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Landing page
│   │
│   ├── lib/                     # Shared libraries
│   │   ├── auth.ts              # JWT utilities, role checking
│   │   └── db.ts                # Database setup and seeding
│   │
│   └── next-env.d.ts            # Next.js type declarations
│
└── tickets.db                   # SQLite database (auto-created)
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,          -- bcrypt hashed
  name TEXT NOT NULL,
  role TEXT DEFAULT 'agent',       -- admin, lead, agent, customer
  department TEXT,                 -- Hardware, Software, etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tickets Table

```sql
CREATE TABLE tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_number TEXT UNIQUE NOT NULL,  -- TKT-YYYY-NNNNN
  subject TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Software',    -- Hardware, Software, Network, Security, Other
  priority TEXT DEFAULT 'Medium',       -- Critical, High, Medium, Low
  severity TEXT DEFAULT 'Minor',        -- Critical, Major, Minor, Trivial
  status TEXT DEFAULT 'Open',           -- Open, In Progress, Resolved, Closed
  source TEXT DEFAULT 'Portal',         -- Portal, Email, Phone, SMS, WhatsApp
  assigned_to INTEGER,                  -- FK to users.id
  created_by INTEGER,                   -- FK to users.id
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Ticket Comments Table

```sql
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

### Ticket History Table

```sql
CREATE TABLE ticket_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  field TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by INTEGER,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id)
);
```

---

## API Documentation

### Authentication

#### POST /api/auth
Login with email and password.

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@company.com",
      "name": "Admin User",
      "role": "admin",
      "department": "IT"
    }
  }
}
```

#### GET /api/auth
Get current user (requires Bearer token).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@company.com",
    "name": "Admin User",
    "role": "admin",
    "department": "IT"
  }
}
```

### Tickets

#### GET /api/tickets
List tickets with optional filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status (all, Open, In Progress, Resolved, Closed) |
| priority | string | Filter by priority (all, Critical, High, Medium, Low) |
| category | string | Filter by category (all, Hardware, Software, Network, Security, Other) |
| search | string | Search in subject and description |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ticket_number": "TKT-2024-000001",
      "subject": "Computer won't boot",
      "description": "My laptop is not turning on...",
      "category": "Hardware",
      "priority": "High",
      "severity": "Major",
      "status": "In Progress",
      "source": "Portal",
      "created_at": "2024-01-15T10:30:00.000Z",
      "assigned_to": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

#### POST /api/tickets
Create a new ticket.

**Request Body:**
```json
{
  "subject": "Email not working",
  "description": "Cannot send emails from Outlook",
  "category": "Software",
  "priority": "Critical",
  "severity": "Critical",
  "source": "Portal"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "ticket_number": "TKT-2024-000003",
    "subject": "Email not working",
    "description": "Cannot send emails from Outlook",
    ...
  }
}
```

---

## Authentication & Authorization

### JWT Token Structure

```typescript
interface UserPayload {
  id: number;
  email: string;
  name: string;
  role: string;
  department?: string;
}
```

### Role Permissions Matrix

| Role | Create | View All | View Own | Update | Assign | Escalate | Modify Templates |
|------|--------|----------|----------|--------|--------|----------|------------------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Lead** | ✅ | Team | Team | Team | ✅ | ✅ | ❌ |
| **Agent** | ✅ Own | Own Dept | Own | Own | ❌ | ❌ | ❌ |
| **Customer** | ✅ Own | Own | Own | Comment Only | ❌ | ❌ | ❌ |

### Helper Functions

```typescript
// Check if role can create tickets
canCreateTicket(role: string): boolean

// Check if role can view all tickets
canViewAllTickets(role: string): boolean

// Check if role can assign tickets
canAssignTickets(role: string): boolean

// Check if role can escalate tickets
canEscalateTickets(role: string): boolean
```

---

## Components

### Pages

| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Landing page with features overview |
| Login | `/login` | User authentication |
| Dashboard | `/dashboard` | Stats and recent tickets |
| Tickets | `/tickets` | List all tickets with filters |
| New Ticket | `/tickets/new` | Create new ticket form |

### UI Components

#### Stats Cards (Dashboard)
- Total Tickets count
- Open tickets count (yellow)
- In Progress count (blue)
- Resolved count (green)

#### Tickets Table
- Ticket number with link
- Subject with truncation
- Category badge
- Priority badge (color-coded)
- Status badge (color-coded)
- Created date

---

## Deployment

### Environment Variables

```bash
# .env.local
JWT_SECRET=your-secret-key-change-in-production
```

### Build Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Deploy to Vercel

1. Push to GitHub
2. Import project at vercel.com
3. No environment variables required

---

## Development Guide

### Getting Started

```bash
# 1. Clone repository
git clone https://github.com/spuram79/support-ticketing-system2.git
cd nextjs-app

# 2. Install dependencies
npm install

# 3. Set environment variables
cp .env.example .env.local

# 4. Run development server
npm run dev
```

### Adding New Features

1. **Database Changes**: Update `src/lib/db.ts`
2. **API Routes**: Add to `src/app/api/*/route.ts`
3. **UI Components**: Add to `src/app/**/*.tsx`
4. **Types**: Update interfaces in relevant files

### Code Style

- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- Handle errors with try/catch
- Log errors to console

---

## Performance Considerations

- **SQLite**: Synchronous queries, good for < 1000 concurrent users
- **JWT**: Stateless authentication, no session storage needed
- **Tailwind CSS**: Purged in production build
- **API Routes**: Serverless functions in production

---

## Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens expire in 7 days
- Role-based access control enforced in API routes
- CORS configured for cross-origin requests
- Helmet-style security headers via Next.js

---

## Troubleshooting

### Common Issues

1. **Database locked**: Delete `tickets.db` and restart
2. **JWT errors**: Check `JWT_SECRET` in `.env.local`
3. **Type errors**: Run `npm run build` to check TypeScript

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev
```