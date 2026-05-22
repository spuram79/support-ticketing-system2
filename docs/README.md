# Support Ticketing System

Enterprise-grade, scalable ticketing and issue management system for Hardware & Software support operations.

## Features

- **Multi-channel Ingestion**: Web, Email, SMS, WhatsApp, Phone
- **AI-Powered Categorization**: Automatic ticket routing and classification
- **ITSM-Compliant**: Incident, Problem, Change, and Asset Management
- **Kubernetes-Ready**: Containerized architecture for on-prem to cloud migration
- **Enterprise Security**: GDPR, ISO 27001, SOC 2 compliant

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/support-ticketing-system.git
cd support-ticketing-system

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
cd backend && npx prisma migrate dev

# Start development servers
npm run dev
```

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Architecture

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

## API Documentation

### Authentication

```bash
# Login
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}

# Response
{
  "success": true,
  "token": "jwt_token_here",
  "user": { "id": "...", "email": "...", "role": "AGENT" }
}
```

### Tickets

```bash
# Create ticket
POST /api/v1/tickets
Authorization: Bearer <token>

{
  "subject": "Computer not turning on",
  "description": "My laptop won't boot",
  "priority": "HIGH",
  "type": "INCIDENT"
}

# Get all tickets
GET /api/v1/tickets?page=1&limit=20&status=OPEN
Authorization: Bearer <token>

# Get ticket by ID
GET /api/v1/tickets/:id
Authorization: Bearer <token>

# Update ticket
PATCH /api/v1/tickets/:id
Authorization: Bearer <token>
```

### Multi-Channel Ingestion

```bash
# Email webhook
POST /api/v1/channels/email
Content-Type: application/json

{
  "from": "customer@example.com",
  "subject": "Support Request",
  "body": "My keyboard is broken"
}

# SMS webhook
POST /api/v1/channels/sms
Content-Type: application/json

{
  "from": "+1234567890",
  "message": "Help with my account"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `DATABASE_URL` | PostgreSQL connection string | required |
| `REDIS_URL` | Redis connection string | redis://localhost:6379 |
| `JWT_SECRET` | JWT signing secret | required |
| `OPENAI_API_KEY` | OpenAI API key (optional) | - |

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API request throttling
- **Input Validation**: Zod schema validation
- **Security Headers**: Helmet.js for security headers
- **Audit Logging**: Comprehensive audit trail
- **Data Encryption**: Password hashing with bcrypt

## Performance Targets

| Metric | Target |
|--------|--------|
| API Latency (p95) | < 500ms |
| Concurrent Agents | 50+ |
| Concurrent Customers | 500+ |
| Daily Tickets | 5,000+ |
| Availability | 99.5% |

## License

MIT