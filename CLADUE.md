# CLADUE - Support Ticketing System Documentation

**Version:** 1.0.0  
**Last Updated:** May 21, 2026  
**Author:** Santosh Puram

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Backend Implementation](#3-backend-implementation)
4. [Frontend Implementation](#4-frontend-implementation)
5. [Database Design](#5-database-design)
6. [API Reference](#6-api-reference)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Multi-Channel Ingestion](#8-multi-channel-ingestion)
9. [Docker & Deployment](#9-docker--deployment)
10. [Environment Configuration](#10-environment-configuration)
11. [Development Setup](#11-development-setup)
12. [Testing](#12-testing)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. System Overview

### 1.1 Purpose

CLADUE (Customer Life-cycle & Agent DUgation Engine) is an enterprise-grade, scalable ticketing and issue management system designed for Hardware & Software support operations. It provides a comprehensive platform for managing support requests across multiple channels with intelligent routing, workflow automation, and advanced analytics.

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
| **Knowledge base** | Auto-generated from resolved tickets |

### 1.3 Success Criteria

- Handle 5,000+ tickets/day at peak load
- Support 50+ concurrent agents + 500 concurrent customers
- Achieve <500ms API latency (p95)
- Maintain 99.5% system availability
- GDPR, ISO 27001, SOC 2 compliant
- Container-based deployment (on-prem to cloud migration)

---

## 2. Architecture

### 2.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Frontend  │  │    Backend   │  │    Workers   │     │
│  │   (React)    │  │  (Node.js)   │  │  (BullMQ)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
├─────────────────────────────────────────────────────────────┤
│                    Shared Services                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │    Redis     │  │   Socket.io  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | React | 18.x | UI Framework |
| | TypeScript | 5.x | Type safety |
| | Vite | 4.x | Build tool |
| | TailwindCSS | 3.x | Styling |
| | React Query | 5.x | Server state |
| | Zustand | 4.x | State management |
| **Backend** | Node.js | 20.x | Runtime |
| | Express | 4.x | Web framework |
| | TypeScript | 5.x | Type safety |
| | Prisma | 5.x | ORM |
| | PostgreSQL | 15 | Database |
| | Redis | 7 | Caching/Queues |
| | Socket.io | 4.x | Real-time |
| | BullMQ | 4.x | Job queue |
| | JWT | - | Authentication |
| |bcrypt| - | Password hashing |
| | Winston | 3.x | Logging |
| **Infrastructure** | Docker | - | Containerization |
| | Docker Compose | - | Orchestration |
| | Nginx | 1.25 | Reverse proxy |
| | Kubernetes | 1.28+ | Orchestration |

### 2.3 Project Structure

```
ticketing-system/
├── backend/                     # Backend API
│   ├── src/
│   │   ├── index.ts            # Entry point
│   │   ├── db.ts               # Prisma client
│   │   ├── middleware/
│   │   │   ├── auth.ts         # Auth middleware
│   │   │   └── validation.ts   # Input validation
│   │   ├── controllers/
│   │   │   ├── auth.ts
│   │   │   ├── tickets.ts
│   │   │   ├── users.ts
│   │   │   └── channels.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── tickets.ts
│   │   │   ├── users.ts
│   │   │   └── channels.ts
│   │   ├── utils/
│   │   │   ├── ticketNumber.ts
│   │   │   ├── logger.ts
│   │   │   └── socket.ts
│   │   └── types/
│   │       └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── Dockerfile
│   └── package.json
├── frontend/                    # Frontend App
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Tickets.tsx
│   │   │   ├── TicketDetail.tsx
│   │   │   ├── Customers.tsx
│   │   │   └── Settings.tsx
│   │   ├── components/
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── hooks/
│   │   ├── stores/
│   │   └── utils/
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── nginx.conf
└── docs/
    ├── IMPLEMENTATION.md
    ├── TECHNICAL_DETAILS.md
    └── API.md
```

---

## 3. Backend Implementation

### 3.1 Entry Point (`src/index.ts`)

```typescript
import express from 'express';
import { createServer } from 'http';
import helmet from 'helmet';
import cors from 'cors';
import ticketRoutes from './routes/tickets';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';

const app = express();
const httpServer = createServer(app);

// Security headers
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;
const server = httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down');
  server.close(() => process.exit(0));
});
```

### 3.2 Database Client (`src/db.ts`)

```typescript
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      { level: 'query', emit: 'stdout' },
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  });
};

declare global {
  var __globalPrisma__: ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.__globalPrisma__ ||= prismaClientSingleton();

export { prisma };
```

**Pattern Rationale:**
- Singleton pattern prevents connection pool exhaustion
- Essential for serverless environments
- Enables hot reload without memory leaks

### 3.3 Authentication Middleware (`src/middleware/auth.ts`)

```typescript
import jwt from 'jsonwebtoken';
import { prisma } from '../db';

interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string; status: string };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  const token = authHeader.substring(7);
  const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';

  try {
    const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string; role: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 3.4 Role-Based Authorization (`src/middleware/requireRole.ts`)

```typescript
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
};

// Usage example
router.delete('/:id', authenticate, requireRole(['ADMIN']), deleteTicket);
```

### 3.5 Ticket Number Generator (`src/utils/ticketNumber.ts`)

```typescript
import { prisma } from '../db';

export const generateTicketNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.ticket.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      },
    },
  });

  const sequence = (count + 1).toString().padStart(6, '0');
  return `TKT-${year}-${sequence}`;
};
```

**Format:** `TKT-{YYYY}-{NNNNN}` (e.g., TKT-2024-001001)

---

## 4. Frontend Implementation

### 4.1 Project Structure

```
frontend/src/
├── App.tsx                  # Main app with routes
├── main.tsx                 # Entry point
├── pages/
│   ├── Dashboard.tsx        # Main dashboard
│   ├── Login.tsx            # Login page
│   ├── Tickets.tsx          # Tickets list
│   ├── TicketDetail.tsx     # Ticket details
│   ├── Customers.tsx        # Customer management
│   └── Settings.tsx         # Settings page
├── components/              # Reusable components
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── services/
│   └── api.ts               # API service layer
├── hooks/                   # Custom hooks
├── stores/                  # State management
├── utils/
│   └── cn.ts                # Class name utility
└── constants/
    └── api.ts               # API URL constant
```

### 4.2 Authentication Context (`src/contexts/AuthContext.tsx`)

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchProfile(token);
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };
    initAuth();
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/auth/me`);
      setState({
        user: response.data.user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      localStorage.removeItem('token');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/api/v1/auth/login`, {
      email,
      password,
    });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setState({ user, token, isAuthenticated: true, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### 4.3 API Service (`src/services/api.ts`)

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const api = {
  tickets: {
    getAll: (params?: any) =>
      fetch(`${API_URL}/api/v1/tickets?${new URLSearchParams(params || {})}`, {
        headers: getHeaders(),
      }),
    getById: (id: string) =>
      fetch(`${API_URL}/api/v1/tickets/${id}`, { headers: getHeaders() }),
    create: (data: any) =>
      fetch(`${API_URL}/api/v1/tickets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetch(`${API_URL}/api/v1/tickets/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetch(`${API_URL}/api/v1/tickets/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }),
  },
  auth: {
    login: (email: string, password: string) =>
      fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }),
    logout: () => {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    },
    me: () => fetch(`${API_URL}/api/v1/auth/me`, { headers: getHeaders() }),
  },
};
```

### 4.4 TailwindCSS Utility (`src/utils/cn.ts`)

```typescript
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// Usage
<span className={cn(
  "px-2 py-1 text-xs rounded",
  ticket.status === 'OPEN' && 'bg-blue-100 text-blue-800',
  ticket.priority === 'CRITICAL' && 'border-red-500'
)}>
  {ticket.status}
</span>
```

---

## 5. Database Design

### 5.1 Prisma Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id          String   @id @default(uuid())
  email       String   @unique
  password    String
  firstName   String?
  lastName    String?
  phone       String?
  avatar      String?
  role        String   @default("AGENT")
  status      String   @default("ACTIVE")
  lastLoginAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  createdTickets   Ticket[]      @relation("CreatedTickets")
  assignedTickets  Ticket[]      @relation("AssignedTickets")
  comments         Comment[]
  sessions         Session[]
  auditLogs        AuditLog[]
  notifications    Notification[]
}

model Ticket {
  id            String      @id @default(uuid())
  ticketNumber  String      @unique
  subject       String
  description   String
  priority      String      @default("MEDIUM")
  status        String      @default("OPEN")
  type          String      @default("INCIDENT")
  source        String      @default("WEB")
  
  assigneeId    String?
  assignee      User?       @relation("AssignedTickets", fields: [assigneeId], references: [id])
  creatorId     String
  creator       User        @relation("CreatedTickets", fields: [creatorId], references: [id])

  slaId         String?
  sla           SLA?        @relation(fields: [slaId], references: [id])
  dueDate       DateTime?
  resolvedAt    DateTime?
  closedAt      DateTime?

  aiScore       Float?
  aiCategory    String?
  aiTags        String?

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  comments      Comment[]
  attachments   Attachment[]

  @@index([ticketNumber])
  @@index([status, priority])
  @@index([assigneeId])
  @@index([createdAt])
}

model Comment {
  id        String   @id @default(uuid())
  ticketId  String
  authorId  String
  content   String
  isPublic  Boolean  @default(false)
  createdAt DateTime @default(now())

  ticket    Ticket   @relation(fields: [ticketId], references: [id])
  author    User     @relation(fields: [authorId], references: [id])
}

model SLA {
  id            String   @id @default(uuid())
  name          String
  responseTime  Int      // in hours
  resolutionTime Int     // in hours
  isActive      Boolean  @default(true)
}

enum UserRole {
  AGENT
  LEAD
  ENGINEER
  MANAGER
  ADMIN
  CUSTOMER
}

enum TicketPriority {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
  ESCALATED
  ON_HOLD
}
```

---

## 6. API Reference

### 6.1 Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/login` | User login | No |
| POST | `/api/v1/auth/register` | User registration | No |
| GET | `/api/v1/auth/me` | Get current user | Yes |
| PATCH | `/api/v1/auth/me` | Update profile | Yes |
| PATCH | `/api/v1/auth/change-password` | Change password | Yes |

#### Login Request
```json
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "AGENT"
  }
}
```

### 6.2 Ticket Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/tickets` | List tickets (paginated) | No |
| GET | `/api/v1/tickets/stats` | Get statistics | No |
| GET | `/api/v1/tickets/:id` | Get by ID | No |
| POST | `/api/v1/tickets` | Create ticket | Yes |
| PATCH | `/api/v1/tickets/:id` | Update ticket | Yes |
| DELETE | `/api/v1/tickets/:id` | Delete ticket | Yes |

#### Create Ticket
```json
POST /api/v1/tickets
{
  "subject": "Computer won't boot",
  "description": "Laptop fails to start",
  "priority": "HIGH",
  "category": "Hardware"
}
```

### 6.3 Multi-Channel Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/channels/email` | Email webhook |
| POST | `/api/v1/channels/sms` | SMS webhook |
| POST | `/api/v1/channels/whatsapp` | WhatsApp webhook |
| POST | `/api/v1/channels/phone` | Phone webhook |

---

## 7. Authentication & Authorization

### 7.1 Role-Based Access Control (RBAC)

| Role | Create | View | Update | Assign | Escalate | Scope |
|------|--------|------|--------|--------|----------|-------|
| **Agent** | Own | Own/Dept | Own | No | No | Department |
| **Lead** | Yes | Team | Team | Yes | Yes | Department |
| **Engineer** | No | Assigned | Assigned | No | No | Escalated |
| **Manager** | No | Reports | No | No | No | Team |
| **Admin** | Yes | All | All | Yes | Yes | System-wide |
| **Customer** | Own | Own | Comment | No | No | Own |

### 7.2 JWT Token Structure

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "role": "AGENT",
  "exp": 1716307200,
  "iat": 1715527200
}
```

### 7.3 Password Security

- Bcrypt hashing with cost factor 12
- Salt rounds: 12 (automatically generated)
- Passwords never stored in plain text

---

## 8. Multi-Channel Ingestion

### 8.1 Channel Types

1. **Web Portal** - Direct ticket creation via frontend
2. **Email** - Incoming email → ticket conversion
3. **SMS** - Text message → ticket conversion
4. **WhatsApp** - WhatsApp message → ticket conversion
5. **Phone** - Call → ticket conversion
6. **API** - Programmatic ticket creation

### 8.2 Webhook Examples

#### Email Webhook
```json
POST /api/v1/channels/email
{
  "from": "customer@example.com",
  "subject": "Support Request",
  "body": "My keyboard is broken",
  "channelId": "email-123"
}
```

#### SMS Webhook
```json
POST /api/v1/channels/sms
{
  "from": "+1234567890",
  "message": "Help with my account"
}
```

### 8.3 Deduplication

- Messages deduplicated by sender + subject hash
- Configurable window (default: 5 minutes)

---

## 9. Docker & Deployment

### 9.1 Docker Compose

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ticketing
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/ticketing
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"

volumes:
  postgres_data:
```

### 9.2 Build Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Build images
docker-compose build
```

### 9.3 Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ticketing-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ticketing-backend
  template:
    metadata:
      labels:
        app: ticketing-backend
    spec:
      containers:
      - name: backend
        image: ticketing/backend:latest
        ports:
        - containerPort: 3001
        envFrom:
        - configMapRef:
            name: ticketing-config
```

---

## 10. Environment Configuration

### 10.1 Backend (.env)

```env
# Application
NODE_ENV=development
PORT=3001

# Database (SQLite for dev, PostgreSQL for prod)
DATABASE_URL="file:./prisma/dev.db"
# DATABASE_URL=postgresql://user:password@localhost:5432/ticketing

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 10.2 Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
```

---

## 11. Development Setup

### 11.1 Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- SQLite (for local development) or PostgreSQL
- Redis (optional)

### 11.2 Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations (if using PostgreSQL)
cd backend && npx prisma migrate dev

# Start development servers
pnpm dev
```

### 11.3 Available Scripts

```bash
pnpm dev              # Start both frontend and backend
pnpm dev:backend      # Start only backend
pnpm dev:frontend     # Start only frontend
pnpm build            # Build both applications
pnpm docker:up        # Start Docker containers
pnpm docker:down      # Stop Docker containers
```

---

## 12. Testing

### 12.1 API Testing with curl

```bash
# Test backend health
curl http://localhost:3001/health

# Create ticket
curl -X POST http://localhost:3001/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{"subject":"Test Issue","description":"Computer won'\''t boot"}'

# Test email channel
curl -X POST http://localhost:3001/api/v1/channels/email \
  -H "Content-Type: application/json" \
  -d '{"from":"user@example.com","subject":"Support","body":"Help needed"}'
```

---

## 13. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **502 Bad Gateway** | Check if services are running; verify port mappings |
| **Database connection failed** | Verify DATABASE_URL; check PostgreSQL status |
| **JWT verification failed** | Ensure JWT_SECRET matches in .env |
| **CORS errors** | Update CORS_ORIGIN in .env |
| **Port already in use** | Change PORT in .env or kill existing process |

### Logs

```bash
# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend

# All logs
docker-compose logs -f
```

---

## Appendix A: File Checksums

| File | SHA256 |
|------|--------|
| ticketing-system-clean.zip | `sha256sum ticketing-system-clean.zip` |

Run the command to verify integrity:
```bash
sha256sum -c ticketing-system-clean.zip.sha256
```

---

## Appendix B: Migration Checklist

- [ ] Download `ticketing-system-clean.zip`
- [ ] Extract to new sandbox
- [ ] Run `pnpm install` in root
- [ ] Run `pnpm install` in `backend/`
- [ ] Run `pnpm install` in `frontend/`
- [ ] Configure `.env` files
- [ ] Run database migrations
- [ ] Start development servers
- [ ] Verify API endpoints
- [ ] Test multi-channel ingestion

---

*Documentation generated by Poolside Shimmer IDE on May 21, 2026*