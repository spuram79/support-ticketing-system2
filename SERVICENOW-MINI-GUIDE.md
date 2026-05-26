# ServiceNow Mini — Ticketing System Transformation Guide

> **Version:** 1.0.0 | **Last Updated:** 2026-05-26 | **Status:** 🚧 In Progress

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [ServiceNow Parity Mapping](#servicenow-parity-mapping)
4. [Implementation Roadmap](#implementation-roadmap)
5. [Feature Requirements](#feature-requirements)
6. [Technical Architecture](#technical-architecture)
7. [UI/UX Design System](#uiux-design-system)
8. [Database Schema](#database-schema)
9. [API Endpoints](#api-endpoints)
10. [RBAC Implementation](#rbac-implementation)
11. [Testing Strategy](#testing-strategy)
12. [Deployment Guide](#deployment-guide)
13. [Migration Checklist](#migration-checklist)
14. [Success Metrics](#success-metrics)
15. [Support Matrix](#support-matrix)

---

## Executive Summary

This document outlines the transformation of the existing Support Ticketing System into a **mini ServiceNow application** — a self-service IT service management (ITSM) platform that delivers enterprise-grade ticketing, workflow automation, and service delivery capabilities at a fraction of the complexity.

---

## Current State Analysis

### Components to Be Implemented

| Component | Status | Stack | Description |
|-----------|--------|-------|-------------|
| **Frontend** | ⏳ Pending | Next.js 14 | React-based web app with Tailwind CSS |
| **Backend** | ⏳ Pending | SQLite / Better-SQLite3 | Database with prepared statements |
| **Auth** | ⏳ Pending | JWT | Token-based authentication with role management |
| **API** | ⏳ Pending | REST | RESTful endpoints for tickets, auth, comments |
| **UI** | ⏳ Pending | Basic | Ticket list, details, creation forms |

### Existing Features (Baseline)

- User authentication (login/logout)
- Ticket CRUD operations
- Ticket listing with filters (status, priority, search)
- Ticket details view
- Ticket comments
- Role-based access (admin, agent, customer)

---

## ServiceNow Parity Mapping

### Core Modules

| ServiceNow Module | Mini Equivalent | Status |
|-------------------|----------------|--------|
| **Incident Management** | Ticket Management | ⏳ In Progress |
| **Problem Management** | Problem Tickets | ⏳ To Implement |
| **Change Management** | Change Requests | ⏳ To Implement |
| **Knowledge Base** | Knowledge Base | ⏳ To Implement |
| **Service Catalog** | Service Request Forms | ⏳ To Implement |
| **Asset Management** | Asset Database | ⏳ To Implement |
| **User Management** | User / RBAC | ⚠️ Partial |
| **Workflow Engine** | Automation Rules | ⏳ To Implement |
| **SLA Management** | SLA Tracking | ⏳ To Implement |
| **Reporting** | Dashboards & Reports | ⏳ To Implement |

---

## Implementation Roadmap

### Phase 1 — Foundation

- [ ] Core authentication system
- [ ] Ticket management (create, read, update)
- [ ] Basic UI components
- [ ] SQLite database schema
- [ ] Enhanced ticket attributes (tags, assignments, history)
- [ ] Improved RBAC (department scoping, permissions matrix)
- [ ] Ticket comments API

### Phase 2 — Automation

- [ ] Workflow engine (rule-based automation)
- [ ] SLA management (response / resolution times)
- [ ] Auto-routing (skill-based assignment)
- [ ] Escalation rules (time-based)
- [ ] Notification system (email templates)

### Phase 3 — Self-Service

- [ ] Knowledge base (articles, search)
- [ ] Customer portal (ticket submission, tracking)
- [ ] Service catalog (request forms)
- [ ] Chatbot integration (FAQ, ticket creation)
- [ ] Multi-channel ingestion (email, SMS)

### Phase 4 — Analytics

- [ ] Dashboard widgets (KPIs, charts)
- [ ] Reports generator (SLA compliance, trends)
- [ ] Audit trail (all actions logged)
- [ ] Export capabilities (CSV, PDF)
- [ ] Performance metrics (p95 latency tracking)

---

## Feature Requirements

### 1. Ticket Management

#### Ticket Numbering

```
Format:  TKT-YYYY-NNNNN
Example: TKT-2024-00001
Rule:    Auto-incremented per calendar year
```

#### Ticket Categories

- Hardware
- Software
- Network
- Security
- Other

#### Priority Levels

| Priority | Indicator | Response SLA |
|----------|-----------|-------------|
| Critical | 🔴 Red | 30 minutes |
| High | 🟠 Orange | 2 hours |
| Medium | 🟡 Yellow | 4 hours |
| Low | 🟢 Green | 8 hours |

#### Severity Levels

| Severity | Description |
|----------|-------------|
| Critical | Service completely down |
| Major | Major functionality impacted |
| Minor | Minor issue, workaround available |
| Trivial | Cosmetic or very minor issue |

#### Ticket Status Lifecycle

```
Open ──► In Progress ──► Resolved ──► Closed
       ╲
        ╲──► Escalated
        ╲──► On Hold
```

---

### 2. Assignment & Workflow

#### Assignment Rules

1. Auto-assign to least-loaded agent with matching skills
2. Fallback to team lead if no eligible agents are available
3. Manual override permitted by leads and managers

#### Skills Matrix (Example)

| Skill | Agents |
|-------|--------|
| Windows OS | Agent A, Agent B |
| Linux OS | Agent B, Agent C |
| Dell Hardware | Agent A |
| HP Hardware | Agent C |
| Exchange | Agent B |

---

### 3. SLA Management

#### Default SLA Matrix

| Category | Response Time | Resolution Time |
|----------|--------------|-----------------|
| Hardware | 2 hours | 8 hours |
| Software | 4 hours | 24 hours |
| Critical (any) | 30 minutes | 4 hours |

#### SLA Health States

| State | Indicator | Meaning |
|-------|-----------|---------|
| On Track | 🟢 Green | Within SLA |
| At Risk | 🟡 Yellow | ≤50% time remaining |
| Breached | 🔴 Red | SLA exceeded |

---

### 4. Notifications

| Event | Recipients | Channels |
|-------|-----------|---------|
| Ticket Created | Customer | Email, SMS |
| Ticket Assigned | Agent | Email, In-app |
| SLA Breached | Team Lead | Email, SMS |
| Ticket Resolved | Customer | Email, SMS |
| Escalation | Manager | Email |

---

## Technical Architecture

### Tech Stack

```
┌─────────────────────────────────────────┐
│              Frontend Layer             │
│  Next.js 14 (App Router)                │
│  React 18                               │
│  Tailwind CSS                           │
│  Lucide React (Icons)                   │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│              Backend Layer              │
│  Next.js API Routes                     │
│  SQLite (Better-SQLite3)                │
│  JWT Authentication                     │
│  bcrypt Password Hashing                │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│             Infrastructure              │
│  Vercel (Hosting)                       │
│  SQLite File (Database)                 │
│  Email / SMS (Notifications)            │
└─────────────────────────────────────────┘
```

### Project Structure

```
nextjs-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── route.ts
│   │   │   └── tickets/
│   │   │       ├── [id]/
│   │   │       │   └── comments/
│   │   │       └── route.ts
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── tickets/
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   └── types.ts
│   └── setup-tests.ts
├── package.json
└── tailwind.config.js
```

---

## UI/UX Design System

### Color Palette

| Purpose | Name | Hex |
|---------|------|-----|
| Primary | Blue | `#2563eb` |
| Success | Green | `#10b981` |
| Warning | Amber | `#f59e0b` |
| Error | Red | `#ef4444` |
| Background | Gray | `#f9fafb` |
| Card | White | `#ffffff` |

### Component Library

| Component | Variants |
|-----------|---------|
| **Buttons** | Primary, Secondary, Danger |
| **Cards** | Shadow, Bordered |
| **Tables** | Sortable, Paginated |
| **Forms** | Input, Select, Textarea with validation |
| **Badges** | Status, Priority, Severity |
| **Modals** | Confirmation, Form dialogs |

### Dashboard Layout Wireframe

```
┌───────────────────────────────────────────────────────────────┐
│  Header: Logo | Navigation | User Menu                        │
├──────────────────┬────────────────────────────────────────────┤
│  Sidebar         │  Main Content                              │
│                  │                                            │
│  › Tickets       │  ┌──────────────────────────────────────┐  │
│  › Dashboard     │  │  KPI Cards (4-column grid)           │  │
│  › Knowledge     │  ├──────────────────────────────────────┤  │
│  › Reports       │  │  Charts & Ticket Tables              │  │
│  › Admin         │  └──────────────────────────────────────┘  │
│                  │                                            │
└──────────────────┴────────────────────────────────────────────┘
```

---

## Database Schema

### Core Tables

```sql
-- Users (agents, admins, customers)
CREATE TABLE users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT UNIQUE NOT NULL,
  password     TEXT NOT NULL,
  name         TEXT NOT NULL,
  role         TEXT DEFAULT 'agent',
  department   TEXT,
  skills       TEXT,          -- JSON array of skill strings
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tickets (core entity)
CREATE TABLE tickets (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_number         TEXT UNIQUE NOT NULL,
  subject               TEXT NOT NULL,
  description           TEXT,
  category              TEXT DEFAULT 'Software',
  priority              TEXT DEFAULT 'Medium',
  severity              TEXT DEFAULT 'Minor',
  status                TEXT DEFAULT 'Open',
  source                TEXT DEFAULT 'Portal',
  tags                  TEXT,          -- JSON array
  assigned_to           INTEGER,
  created_by            INTEGER,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at           DATETIME,
  closed_at             DATETIME,
  sla_response_deadline DATETIME,
  sla_resolution_deadline DATETIME,
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (created_by)  REFERENCES users(id)
);

-- Ticket Comments (thread)
CREATE TABLE ticket_comments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id   INTEGER NOT NULL,
  user_id     INTEGER,
  comment     TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  is_public   BOOLEAN DEFAULT TRUE,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)   REFERENCES users(id)
);

-- Ticket History (audit trail)
CREATE TABLE ticket_history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id   INTEGER NOT NULL,
  field       TEXT NOT NULL,
  old_value   TEXT,
  new_value   TEXT,
  changed_by  INTEGER,
  changed_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id)  REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Knowledge Base Articles
CREATE TABLE knowledge_base (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT NOT NULL,
  content       TEXT,
  category      TEXT,
  tags          TEXT,
  views         INTEGER DEFAULT 0,
  helpful_votes INTEGER DEFAULT 0,
  created_by    INTEGER,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Automation Rules
CREATE TABLE automation_rules (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT NOT NULL,
  trigger_event  TEXT NOT NULL,
  conditions     TEXT,          -- JSON condition object
  action_type    TEXT NOT NULL,
  action_value   TEXT,
  active         BOOLEAN DEFAULT TRUE,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SLA Definitions
CREATE TABLE sla_definitions (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  name             TEXT NOT NULL,
  category         TEXT,
  priority         TEXT,
  response_hours   INTEGER,
  resolution_hours INTEGER,
  active           BOOLEAN DEFAULT TRUE
);
```

---

## API Endpoints

### Authentication

```http
POST /api/auth         → Login; returns JWT token + user data
GET  /api/auth         → Validate token; returns current user
```

### Tickets

```http
GET    /api/tickets          → Paginated list (params: status, priority, category, search, page)
POST   /api/tickets          → Create ticket; auto-generate ticket number
GET    /api/tickets/:id      → Ticket details including comments
PUT    /api/tickets/:id      → Update ticket; log history entry
DELETE /api/tickets/:id      → Soft delete
```

### Comments

```http
GET  /api/tickets/:id/comments   → List all comments
POST /api/tickets/:id/comments   → Add a new comment
```

### Users _(Admin only)_

```http
GET    /api/users       → Paginated user list
POST   /api/users       → Create user
PUT    /api/users/:id   → Update user
DELETE /api/users/:id   → Deactivate user
```

### Reports

```http
GET /api/reports/tickets   → Ticket metrics (params: date range, group by)
GET /api/reports/sla       → SLA compliance report
```

---

## RBAC Implementation

### Permission Matrix

| Feature | Admin | Manager | Lead | Agent | Customer |
|---------|:-----:|:-------:|:----:|:-----:|:--------:|
| **Tickets** | | | | | |
| Create | ✅ | ❌ | ❌ | ❌ | ✅ Own |
| View All | ✅ | ✅ Team | ✅ Team | ✅ Assigned | ✅ Own |
| Update | ✅ | ❌ | ✅ Team | ✅ Own | ⚠️ Comment |
| Assign | ✅ | ❌ | ✅ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Users** | | | | | |
| View | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create | ✅ | ❌ | ❌ | ❌ | ❌ |
| Update | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Settings** | | | | | |
| Templates | ✅ | ❌ | ❌ | ❌ | ❌ |
| SLA Config | ✅ | ❌ | ❌ | ❌ | ❌ |
| Automation | ✅ | ❌ | ❌ | ❌ | ❌ |

### Permission Helper

```typescript
// lib/middleware.ts
export function checkPermission(
  user: User,
  action: string,
  resource: string
): boolean {
  const permissions = ROLE_PERMISSIONS[user.role];
  return permissions[`${resource}:${action}`] ?? false;
}

// Usage inside an API route
if (!checkPermission(user, 'update', 'tickets')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

## Testing Strategy

### Unit Tests

- API route testing — Jest + Supertest
- Database operations — SQLite in-memory
- Utility functions (SLA calculations, ticket numbering)

### Integration Tests

- Ticket lifecycle: `Open → Assign → Resolve → Close`
- RBAC enforcement across all roles
- SLA deadline calculation and breach detection

### E2E Tests

- Login and session management
- Ticket creation end-to-end
- Ticket search and filter
- Dashboard navigation and KPI rendering

---

## Deployment Guide

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| pnpm | Latest |
| SQLite3 | 3.x |

### Quick Start

```bash
# Clone repository
git clone https://github.com/spuram79/support-ticketing-system2.git
cd support-ticketing-system2

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3000
```

### Environment Variables

```env
# .env.local
DATABASE_URL="./tickets.db"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
```

### Production Build

```bash
# Build
pnpm build

# Start
pnpm start
```

> **Production checklist:**
> - Set `JWT_SECRET` to a cryptographically random value
> - Migrate to PostgreSQL for production workloads
> - Configure email / SMS providers

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
```

---

## Migration Checklist

> Track progress from current baseline to full ServiceNow Mini parity.

- [ ] Add ticket tags functionality
- [ ] Implement assignment / workload tracking
- [ ] Add ticket history / audit trail
- [ ] Create dashboard with KPIs
- [ ] Add SLA tracking and breach detection
- [ ] Implement auto-routing rules
- [ ] Add knowledge base module
- [ ] Create service catalog forms
- [ ] Add notification system
- [ ] Implement reporting module
- [ ] Add export functionality (CSV, PDF)
- [ ] Create mobile-responsive design
- [ ] Add keyboard shortcuts
- [ ] Implement bulk operations

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| P95 Latency | < 500 ms | TBD |
| Availability | 99.5 % | TBD |
| Daily Tickets | 5,000+ | TBD |
| Concurrent Users | 550 | TBD |

---

## Support Matrix

| Channel | Coverage |
|---------|---------|
| Portal | 24 / 7 |
| Email | 24 / 7 |
| Phone | Business Hours |
| Chat | Business Hours |

---

> 📝 **Contributing:** Edit this file directly on GitHub or submit a PR to propose changes.  
> 🔗 **Repository:** [spuram79/support-ticketing-system2](https://github.com/spuram79/support-ticketing-system2)
