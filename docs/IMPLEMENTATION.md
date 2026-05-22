# Support Ticketing System - Implementation Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Authentication & Authorization](#authentication--authorization)
8. [Multi-Channel Ingestion](#multi-channel-ingestion)
9. [Docker Deployment](#docker-deployment)
10. [Kubernetes Deployment](#kubernetes-deployment)
11. [Environment Configuration](#environment-configuration)
12. [Development Setup](#development-setup)

---

## Project Overview

The Support Ticketing System is an enterprise-grade, scalable ticketing and issue management system designed for Hardware & Software support operations. It provides:

- **Multi-channel ingestion**: Web, Email, SMS, WhatsApp, Phone
- **Ticket lifecycle management**: Full CRUD operations with status tracking
- **Role-based access control**: 6 distinct user roles with granular permissions
- **ITSM compliance**: Incident, Problem, Change, and Asset management
- **Kubernetes-ready**: Containerized architecture for on-prem to cloud migration

**Success Criteria:**
- Handle 5,000+ tickets/day at peak load
- Support 50+ concurrent agents + 500 concurrent customers
- Achieve <500ms API latency (p95)
- Maintain 99.5% system availability
- GDPR, ISO 27001, SOC 2 compliant

---

## Architecture

### System Architecture Diagram

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

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React + TypeScript + Vite | User interface |
| Frontend | TailwindCSS | Styling |
| Backend | Node.js + Express | API server |
| Backend | TypeScript | Type safety |
| Database | PostgreSQL/SQLite | Data persistence |
| ORM | Prisma | Database access |
| Authentication | JWT + bcrypt | User authentication |
| Real-time | Socket.io | Notifications |
| Queue | BullMQ + Redis | Background jobs |

---

## Backend Implementation

### Project Structure

```
backend/
├── src/
│   ├── index.ts              # Application entry point
│   ├── db.ts                 # Database client & logger setup
│   ├── middleware/
│   │   └── auth.ts          # Authentication middleware
│   ├── controllers/
│   │   ├── auth.ts          # Auth controller
│   │   └── tickets.ts       # Ticket controller
│   ├── routes/
│   │   ├── auth.ts          # Auth routes
│   │   ├── tickets.ts       # Ticket routes
│   │   └── users.ts         # User routes
│   ├── utils/
│   │   ├── ticketNumber.ts  # Ticket number generator
│   │   └── logger.ts        # Logger utility
│   └── types/
│       └── index.ts         # TypeScript types
├── prisma/
│   └── schema.prisma        # Database schema
└── Dockerfile
```

### Key Implementation Details

#### 1. Server Setup (`src/index.ts`)

```typescript
// Security headers with Helmet
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Body parsing with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
```

#### 2. Authentication Middleware (`src/middleware/auth.ts`)

- Validates JWT tokens from Authorization header
- Checks user status (ACTIVE/INACTIVE)
- Attaches user info to request object
- Returns appropriate error responses

#### 3. Ticket Number Generation (`src/utils/ticketNumber.ts`)

- Format: `TKT-{YYYY}-{NNNNN}` (e.g., TKT-2024-001001)
- Uses Prisma to count existing tickets for current year
- Pads sequence number to 6 digits

---

## Frontend Implementation

### Project Structure

```
frontend/
├── src/
│   ├── App.tsx              # Main app with routes
│   ├── main.tsx             # Entry point
│   ├── pages/
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Login.tsx        # Login page
│   │   ├── Tickets.tsx      # Tickets list
│   │   ├── TicketDetail.tsx # Ticket details
│   │   ├── Customers.tsx    # Customer management
│   │   └── Settings.tsx     # Settings page
│   ├── components/          # Reusable components
│   ├── contexts/
│   │   └── AuthContext.tsx  # Authentication context
│   ├── services/
│   │   └── api.ts           # API service layer
│   ├── hooks/               # Custom hooks
│   ├── stores/              # State management
│   ├── utils/
│   │   └── cn.ts            # Class name utility
│   ├── constants/
│   │   └── api.ts           # API URL constant
│   └── assets/              # Static assets
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

### Key Components

#### 1. Authentication Context (`src/contexts/AuthContext.tsx`)

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

- Manages user session state
- Persists token in localStorage
- Provides login/logout functionality
- Fetches user profile on app init

#### 2. API Service (`src/services/api.ts`)

```typescript
export const api = {
  tickets: {
    getAll: (params?: any) => fetch(`${API_URL}/api/v1/tickets?...`, ...),
    getById: (id: string) => fetch(`${API_URL}/api/v1/tickets/${id}`, ...),
    create: (data: any) => fetch(`${API_URL}/api/v1/tickets`, { method: 'POST', ... }),
    update: (id: string, data: any) => fetch(`${API_URL}/api/v1/tickets/${id}`, { method: 'PATCH', ... }),
    delete: (id: string) => fetch(`${API_URL}/api/v1/tickets/${id}`, { method: 'DELETE', ... }),
    getStats: () => fetch(`${API_URL}/api/v1/tickets/stats`, ...),
  },
  // ... other services
};
```

#### 3. Dashboard Component (`src/pages/Dashboard.tsx`)

- Displays ticket statistics (Open, In Progress, Resolved, Closed)
- Shows recent tickets table
- Fetches data on component mount

---

## Database Schema

### Prisma Schema Overview (`prisma/schema.prisma`)

### Models

| Model | Description | Key Fields |
|-------|-------------|------------|
| User | User accounts | id, email, password, role, status |
| Session | User sessions | id, userId, token, expiresAt |
| Ticket | Support tickets | ticketNumber, subject, status, priority |
| Category | Ticket categories | id, name, parent (hierarchy) |
| Comment | Ticket comments | ticketId, authorId, content |
| Attachment | File attachments | ticketId, filename, url |
| SLA | SLA definitions | responseTime, resolutionTime |
| Incident | ITSM incidents | ticketId, impact, urgency |
| Problem | ITSM problems | ticketId, rootCause |
| Change | ITSM changes | ticketId, riskLevel, status |
| Asset | Asset management | serialNumber, status, owner |
| AuditLog | Audit trail | userId, action, resource |
| Notification | User notifications | userId, type, read |
| Channel | Multi-channel config | type, name, config |
| Webhook | Webhook endpoints | url, events, secret |

### Enums

- **User Role**: AGENT, LEAD, ENGINEER, MANAGER, ADMIN, CUSTOMER
- **User Status**: ACTIVE, INACTIVE, SUSPENDED
- **Ticket Priority**: CRITICAL, HIGH, MEDIUM, LOW
- **Ticket Status**: OPEN, IN_PROGRESS, RESOLVED, CLOSED, ESCALATED, ON_HOLD

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/login` | User login | No |
| POST | `/api/v1/auth/register` | User registration | No |
| GET | `/api/v1/auth/me` | Get current user | Yes |
| PATCH | `/api/v1/auth/me` | Update profile | Yes |
| PATCH | `/api/v1/auth/change-password` | Change password | Yes |

### Tickets

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/tickets` | List all tickets | No |
| GET | `/api/v1/tickets/stats` | Get ticket statistics | No |
| GET | `/api/v1/tickets/:id` | Get ticket by ID | No |
| POST | `/api/v1/tickets` | Create ticket | Yes |
| PATCH | `/api/v1/tickets/:id` | Update ticket | Yes |
| DELETE | `/api/v1/tickets/:id` | Delete ticket | Yes |

### Multi-Channel

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/channels/email` | Email webhook |
| POST | `/api/v1/channels/sms` | SMS webhook |
| POST | `/api/v1/channels/whatsapp` | WhatsApp webhook |
| POST | `/api/v1/channels/phone` | Phone webhook |
| POST | `/api/v1/webhooks/:id` | Generic webhook |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | List all users |
| GET | `/api/v1/users/:id` | Get user by ID |
| PATCH | `/api/v1/users/:id` | Update user |

---

## Authentication & Authorization

### Role-Based Access Control (RBAC)

| Role | Create Ticket | View Tickets | Update Ticket | Assign | Escalate | Scope |
|------|---------------|--------------|---------------|--------|----------|-------|
| Support Agent | Own | Own/Dept | Own | No | No | Department |
| Support Lead | Yes | Team | Team | Yes | Yes | Department |
| Engineer | No | Assigned | Assigned | No | No | Escalated |
| Manager | No | Reports | No | No | No | Team |
| Admin | Yes | All | All | Yes | Yes | System-wide |
| Customer | Own | Own | Comment only | No | No | Own tickets |

### JWT Token Structure

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "role": "AGENT",
  "exp": 1716307200,
  "iat": 1715527200
}
```

### Password Security

- Bcrypt hashing with cost factor 12
- Passwords never stored in plain text
- Minimum password requirements enforced

---

## Multi-Channel Ingestion

### Channel Types

1. **Web Portal**: Direct ticket creation via frontend
2. **Email**: Incoming email → ticket conversion
3. **SMS**: Text message → ticket conversion
4. **WhatsApp**: WhatsApp message → ticket conversion
5. **Phone**: Call → ticket conversion
6. **API**: Programmatic ticket creation

### Webhook Endpoints

```typescript
// Email webhook
POST /api/v1/channels/email
{
  "from": "customer@example.com",
  "subject": "Support Request",
  "body": "My keyboard is broken"
}

// SMS webhook
POST /api/v1/channels/sms
{
  "from": "+1234567890",
  "message": "Help with my account"
}
```

### Deduplication

- Messages deduplicated by sender + subject hash
- Configurable deduplication window (default: 5 minutes)

---

## Docker Deployment

### Docker Compose (`docker-compose.yml`)

```yaml
services:
  postgres:         # PostgreSQL 15 database
  redis:            # Redis 7 for caching/queues
  backend:          # Node.js API server
  frontend:         # React/Vite frontend
```

### Build Commands

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | Yes |
| JWT_SECRET | JWT signing secret | Yes |
| REDIS_URL | Redis connection string | No |
| PORT | Server port | No |

---

## Kubernetes Deployment

### Directory Structure (`kubernetes/`)

```
kubernetes/
├── base/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
├── manifests/
│   └── production/
│       ├── kustomization.yaml
│       └── patch.yaml
└── overlays/
    └── development/
        └── kustomization.yaml
```

### Deployment Commands

```bash
# Apply to cluster
kubectl apply -k kubernetes/overlays/production

# View deployments
kubectl get deployments

# View logs
kubectl logs -l app=ticketing-backend
```

---

## Environment Configuration

### Backend (.env)

```env
# Application
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=file:./prisma/dev.db

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
```

---

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- SQLite (for local development) or PostgreSQL
- Redis (optional)

### Installation

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

### Available Scripts

```bash
pnpm dev              # Start both frontend and backend
pnpm dev:backend      # Start only backend
pnpm dev:frontend     # Start only frontend
pnpm build            # Build both applications
pnpm docker:up        # Start Docker containers
pnpm docker:down      # Stop Docker containers
pnpm lint             # Run linter
pnpm test             # Run tests
```

### Project URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api

---

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Rate Limiting**: API request throttling (to be implemented)
3. **Input Validation**: Zod schema validation (to be implemented)
4. **Security Headers**: Helmet.js for security headers
5. **Audit Logging**: Comprehensive audit trail
6. **Data Encryption**: Password hashing with bcrypt
7. **CORS**: Configurable origin restrictions

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| API Latency (p95) | < 500ms | TBD |
| Concurrent Agents | 50+ | TBD |
| Concurrent Customers | 500+ | TBD |
| Daily Tickets | 5,000+ | TBD |
| Availability | 99.5% | TBD |

---

## License

MIT