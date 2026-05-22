# Support Ticketing System - Next.js Edition

A modern, enterprise-grade ticketing and issue management system built with Next.js and SQLite. No containerization required - runs directly on Node.js.

## Features

### Core Features (Tier 1)
- **Ticket Lifecycle Management**: Create, update, assign, and track tickets through Open → In Progress → Resolved → Closed
- **Multi-Channel Support**: Ingest tickets from email, phone, WhatsApp, SMS, and web portal
- **Automatic Ticket Numbering**: Format `TKT-YYYY-NNNNN` (e.g., TKT-2024-000001)
- **Categorization**: Hardware, Software, Network, Security, Other
- **Priority & Severity Levels**: Critical, High, Medium, Low with corresponding severity
- **Search & Filter**: Filter by status, priority, category, date range, keywords

### Automation (Tier 2)
- **Auto-Routing Rules**: Route based on category, priority, skill tags
- **SLA Management**: 2hr response for hardware, 4hr for software
- **Auto-Responses**: Immediate acknowledgment with expected response time

### User Management (Tier 3)
- **Role-Based Access Control**: Admin, Lead, Agent, Customer roles
- **Permission Matrix**: Granular permissions per role

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (via better-sqlite3)
- **Authentication**: JWT

## Prerequisites

- Node.js 18+ 
- npm or pnpm

## Installation & Setup

### 1. Navigate to the Next.js app directory

```bash
cd nextjs-app
```

### 2. Install dependencies

```bash
npm install
# or
pnpm install
```

### 3. Set environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your settings
```

### 4. Run the development server

```bash
npm run dev
# or
pnpm dev
```

The app will be available at: http://localhost:3000

## Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@company.com | password123 | Admin |
| john@company.com | password123 | Agent (Hardware) |
| jane@company.com | password123 | Agent (Software) |
| bob@company.com | password123 | Lead |
| customer@example.com | password123 | Customer |

## API Endpoints

### Authentication
- `POST /api/auth` - Login (email, password)
- `GET /api/auth` - Get current user (requires Bearer token)

### Tickets
- `GET /api/tickets` - List tickets (optional filters: status, priority, category, search)
- `POST /api/tickets` - Create ticket (requires authentication)

## Project Structure

```
nextjs-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── route.ts      # Auth API
│   │   │   └── tickets/
│   │   │       └── route.ts      # Tickets API
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard UI
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   ├── tickets/
│   │   │   ├── page.tsx          # Tickets list
│   │   │   └── new/
│   │   │       └── page.tsx      # New ticket form
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx              # Home page
│   └── lib/
│       ├── auth.ts               # JWT utilities
│       └── db.ts                 # SQLite database setup
├── .env.example
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Database Schema

The SQLite database (`tickets.db`) contains:

- `users` - User accounts with role-based access
- `tickets` - Support tickets with full lifecycle
- `ticket_comments` - Comments on tickets
- `ticket_history` - Change tracking

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. No environment variables required (uses defaults)

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Differences from Containerized Version

| Feature | Original (Docker) | Next.js Edition |
|---------|------------------|-----------------|
| Database | PostgreSQL | SQLite |
| Container | Docker + Kubernetes | None |
| Runtime | Node.js + Nginx | Next.js only |
| Deployment | Complex | Simple `npm start` |
| Development | Multi-service | Single command |

## License

MIT