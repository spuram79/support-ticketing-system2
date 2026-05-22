# Next.js Application Setup Guide

A comprehensive guide to setting up and running the Support Ticketing System Next.js application locally.

## ⚠️ Important Notes

- **This is a standalone Next.js application** that runs independently from the main monorepo
- **SQLite database is used** - no separate database server needed
- **Development server is NOT running yet** - you must install dependencies first

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Required Software Installation](#required-software-installation)
3. [Project Setup Steps](#project-setup-steps)
4. [Running the Application](#running-the-application)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Development Workflow](#development-workflow)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 18.0 or higher | JavaScript runtime |
| **npm** | 9.0 or higher | Package manager (comes with Node.js) |
| **pnpm** | 8.0 or higher | Recommended package manager |
| **Git** | 2.30 or higher | Version control |

---

## Required Software Installation

### 1. Install Node.js

**Option A: Using Node Version Manager (Recommended)**

```bash
# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload shell configuration
source ~/.bashrc  # or ~/.zshrc

# Install Node.js 20 LTS
nvm install 20
nvm use 20

# Verify installation
node --version  # Should output: v20.x.x
npm --version   # Should output: 10.x.x
```

**Option B: Direct Installation**

Download from [nodejs.org](https://nodejs.org) and install Node.js 20 LTS.

### 2. Install pnpm (Recommended)

```bash
# Using npm
npm install -g pnpm

# Or using the official script
curl -fsSL https://get.pnpm.io/install.sh | sh

# Verify installation
pnpm --version
```

### 3. Install Git

**macOS:**
```bash
brew install git
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install git
```

**Windows:**
Download from [git-scm.com](https://git-scm.com)

---

## Project Setup Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/spuram79/support-ticketing-system2.git
cd support-ticketing-system2
```

### Step 2: Navigate to Next.js App Directory

```bash
cd nextjs-app
```

### Step 3: Install Dependencies

Using pnpm (recommended):
```bash
pnpm install
```

Or using npm:
```bash
npm install
```

### Step 4: Set Up Environment Variables

Create a `.env.local` file from the example:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your preferred settings:

```env
# JWT Secret for authentication
JWT_SECRET=your-secret-key-change-in-production

# Next.js environment
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

### Step 5: Verify Installation

Run the type check to verify everything is set up correctly:

```bash
pnpm type-check
# or
npm run type-check
```

---

## Running the Application

### Development Mode

```bash
pnpm dev
# or
npm run dev
```

The application will be available at: **http://localhost:3000**

### Production Build

```bash
# Build the application
pnpm build
# or
npm run build

# Start production server
pnpm start
# or
npm run start
```

---

## Environment Configuration

### Environment Variables Reference

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|----------|
| `JWT_SECRET` | Secret key for JWT token signing | `your-secret-key` | Yes (change in production) |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | Auto-generated | Recommended |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` | Yes |
| `NODE_ENV` | Environment mode | `development` | Auto-set |

### .env.local Example

```env
# Authentication
JWT_SECRET=super-secret-jwt-key-change-this-in-production
NEXTAUTH_SECRET=nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000

# Database (SQLite is used by default)
# No additional configuration needed
```

---

## Database Setup

### SQLite Database (Default)

The Next.js version uses SQLite by default - no additional setup required. The database file `tickets.db` will be created automatically in the project root when you first run the application.

### Database Location

```
nextjs-app/tickets.db
```

### Viewing Database Data

You can use any SQLite browser:

```bash
# Install sqlite3 CLI
npm install -g sqlite3

# Or on macOS
brew install sqlite

# View database
sqlite3 tickets.db
```

### Database Schema

The database contains the following tables:

- **users** - User accounts with role-based access
- **tickets** - Support tickets with full lifecycle
- **ticket_comments** - Comments on tickets
- **ticket_history** - Change tracking/audit log

---

## Development Workflow

### Code Structure

```
nextjs-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── route.ts      # Authentication API
│   │   │   └── tickets/
│   │   │       └── route.ts      # Tickets API
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard page
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   ├── tickets/
│   │   │   ├── page.tsx          # Tickets list
│   │   │   └── new/
│   │   │       └── page.tsx      # New ticket form
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/
│       ├── auth.ts               # JWT utilities
│       └── db.ts                 # SQLite database setup
├── public/
├── package.json
└── tsconfig.json
```

### Available Scripts

```json
{
  "dev": "next dev",                    // Start development server
  "build": "next build",                // Build for production
  "start": "next start",                // Start production server
  "lint": "next lint",                  // Run ESLint
  "type-check": "tsc --noEmit",         // TypeScript type checking
  "test": "vitest run",                 // Run unit tests
  "test:watch": "vitest",               // Run tests in watch mode
  "test:coverage": "vitest run --coverage", // Run tests with coverage
  "test:e2e": "playwright test",        // Run E2E tests
  "test:e2e:ui": "playwright test --ui" // Run E2E tests with UI
}
```

---

## Testing

### Running Tests

**Unit Tests:**
```bash
pnpm test
# or
npm run test
```

**Tests with Coverage:**
```bash
pnpm test:coverage
```

**E2E Tests:**
```bash
pnpm test:e2e
```

**E2E Tests with UI:**
```bash
pnpm test:e2e:ui
```

### Test Structure

```
nextjs-app/
├── src/
│   ├── pages/__tests__/        # Component tests
│   │   ├── Dashboard.test.tsx
│   │   └── Login.test.tsx
│   └── e2e/                    # E2E tests
│       ├── auth.spec.ts
│  	     ├── dashboard.spec.ts
│       └── tickets.spec.ts
└── vitest.config.ts            # Vitest configuration
```

---

## Troubleshooting

### Common Issues

**1. Port 3000 Already in Use**

```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Or use a different port
pnpm dev --port 3001
```

**2. Node Modules Issues**

```bash
# Clear node modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**3. TypeScript Errors**

```bash
# Run type check
pnpm type-check

# Clear Next.js cache
rm -rf .next
```

**4. Database Issues**

```bash
# Delete the database to start fresh
rm tickets.db

# Restart the development server
pnpm dev
```

**5. Missing Dependencies Error**

If you see errors like `Cannot find module 'next'` or similar:

```bash
# Ensure you're in the nextjs-app directory
cd nextjs-app

# Install dependencies
pnpm install

# Or if pnpm fails, try npm
npm install
```

**6. better-sqlite3 Installation Issues**

The native module may fail to install on some systems:

```bash
# Set the installation flag
export BAMF_THRESHOLD=1000
pnpm install better-sqlite3

# Or rebuild if already installed
pnpm install --force better-sqlite3
```

**7. Tailwind CSS Not Working**

If styles are not applied:

```bash
# Check the Tailwind configuration
cat tailwind.config.js

# Ensure the content paths are correct
# Should include: './src/app/**/*.{js,ts,jsx,tsx,mdx}'
```

### Getting Help

- Check the console for error messages
- Ensure all environment variables are set correctly
- Verify Node.js and pnpm versions meet requirements
- Consult the main [README.md](../README.md) for project overview

---

## Quick Reference Commands

```bash
# Navigate to Next.js app
cd nextjs-app

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Type check
pnpm type-check
```

---

## Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@company.com | password123 | Admin |
| john@company.com | password123 | Agent (Hardware) |
| jane@company.com | password123 | Agent (Software) |
| bob@company.com | password123 | Lead |
| customer@example.com | password123 | Customer |

---

## Next Steps

After setting up the application:

1. Visit **http://localhost:3000**
2. Login with demo credentials
3. Explore the dashboard and ticket management features
4. Run tests to verify functionality: `pnpm test`
5. Check the API documentation at **http://localhost:3000/api/docs**

For more information, see:
- [Main Documentation](../CLADUE.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Project API Documentation](../docs/API.md)