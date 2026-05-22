# Setup Guide for Support Ticketing System

## Prerequisites

- Node.js 18+
- npm or pnpm

## Database Setup Options

### Option 1: SQLite (Recommended for Development)

SQLite is built into Prisma and requires no server setup. Perfect for local development.

```bash
# The DATABASE_URL is already configured for SQLite in backend/.env
# No additional setup needed!

# Run migrations
cd backend
npx prisma migrate dev --name init

# Seed initial data
npm run seed
```

### Option 2: Local PostgreSQL with Docker

```bash
# Start PostgreSQL container
docker run -d \
  --name ticketing-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ticketing_dev \
  -p 5432:5432 \
  postgres:15

# Run migrations
cd backend
npx prisma migrate dev --name init
```

### Option 3: Free Cloud PostgreSQL (Recommended for Team Development)

1. **Sign up for a free tier:**
   - [Supabase](https://supabase.com/) (500MB free)
   - [Railway](https://railway.app/) (PostgreSQL included)
   - [ElephantSQL](https://www.elephantsql.com/) (20MB free)

2. **Get your connection string:**
   ```
   postgresql://username:password@host:port/database?sslmode=require
   ```

3. **Update `.env` file:**
   ```
   DATABASE_URL="your-postgresql-connection-string"
   ```

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp backend/.env.example backend/.env  # Edit with your values

# Generate Prisma Client
cd backend && npx prisma generate

# Run database migrations (if using database)
npx prisma migrate dev --name init

# Seed initial data (if using database)
npm run seed

# Start development servers
npm run dev
```

## Project Structure

```
/support-ticketing-system
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── controllers/  # API route handlers
│   │   ├── middleware/   # Auth, validation middleware
│   │   ├── routes/       # Express routes
│   │   ├── db.ts         # Prisma client
│   │   └── index.ts      # Server entry
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
├── frontend/         # React dashboard
│   ├── src/
│   │   ├── pages/      #Page components
│   │   ├── contexts/   # React contexts
│   │   └── App.tsx     # Main app
│   └── package.json
├── docker-compose.yml  # Docker setup
└── package.json       # Root scripts
```

## Available Endpoints

### Backend (Port 3001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/tickets` | List all tickets |
| POST | `/api/v1/tickets` | Create ticket |
| GET | `/api/v1/tickets/:id` | Get ticket details |
| PUT | `/api/v1/tickets/:id` | Update ticket |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/register` | Register |
| POST | `/api/v1/channels/email` | Email channel webhook |
| POST | `/api/v1/channels/sms` | SMS channel webhook |
| POST | `/api/v1/channels/whatsapp` | WhatsApp channel webhook |

### Frontend (Port 3000)

- Login: `/login`
- Dashboard: `/`
- Tickets: `/tickets`
- Ticket Detail: `/tickets/:id`
- Customers: `/customers`
- Settings: `/settings`

## Default Credentials (After Seeding)

- Admin: `admin@ticketing.com` / `admin123`
- Agent: `agent@ticketing.com` / `password123`
- Manager: `manager@ticketing.com` / `password123`
- Customer: `customer@ticketing.com` / `password123`

## Next Steps

1. Set up your PostgreSQL database
2. Run `npx prisma migrate dev` to create tables
3. Run `npm run seed` to create initial data
4. Test endpoints with curl or Postman
5. Open frontend at http://localhost:3000