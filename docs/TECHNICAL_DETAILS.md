# Technical Implementation Details

## Backend Implementation Patterns

### 1. Database Client Pattern (src/db.ts)

```typescript
// Singleton pattern for Prisma client
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      { level: 'query', emit: 'stdout' },
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  });
};

// Global for hot reload in development
declare global {
  var __globalPrisma__: ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.__globalPrisma__ ||= prismaClientSingleton();
```

**Why Singleton?**
- Prevents connection pool exhaustion
- Essential for serverless environments
- Enables hot reload without memory leaks

### 2. Controller Pattern

```typescript
// Example: src/controllers/tickets.ts
export const getTickets = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    return res.json({
      success: true,
      count: tickets.length,
      total,
      page,
      limit,
      data: tickets,
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};
```

**Best Practices:**
- Always return typed Promise
- Separate error logging from user-facing errors
- Use `include` for relational data (avoid N+1 queries)
- Implement pagination at database level

### 3. Authentication Middleware

```typescript
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
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

**Key Features:**
- Token validation with JWT
- Database lookup for current user status
- Account status verification (ACTIVE check)
- Type augmentation for request object

### 4. Role-Based Authorization

```typescript
export const requireRole = (roles: string[]): Middleware => {
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

// Usage
router.delete('/:id', authenticate, requireRole(['ADMIN']), deleteTicket);
```

### 5. Error Handling Middleware

```typescript
// Error handler (src/index.ts)
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});
```

### 6. Graceful Shutdown

```typescript
const PORT = process.env.PORT || 3001;
const server = httpServer.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
});

// SIGTERM for container shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  server.close(() => process.exit(0));
});

// SIGINT for manual shutdown (Ctrl+C)
process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down');
  server.close(() => process.exit(0));
});
```

---

## Frontend Implementation Patterns

### 1. Authentication Context

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

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
```

**Key Features:**
- Token persistence in localStorage
- Automatic header setup for axios
- Profile fetch on app init
- Loading state management

### 2. API Service Layer

```typescript
export const api = {
  tickets: {
    getAll: (params?: any) => 
      fetch(`${API_URL}/api/v1/tickets?${new URLSearchParams(params || {})}`, { 
        headers: getHeaders() 
      }),
    create: (data: any) => 
      fetch(`${API_URL}/api/v1/tickets`, { 
        method: 'POST', 
        headers: getHeaders(), 
        body: JSON.stringify(data) 
      }),
  },
};
```

**Best Practices:**
- Centralized error handling
- Consistent header management
- Type-safe parameter passing
- Promise-based interface

### 3. Component Data Fetching Pattern

```typescript
const Dashboard = () => {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ticketsRes] = await Promise.all([
          api.tickets.getStats(),
          api.tickets.getAll({ limit: 10 }),
        ]);
        
        const statsData = await statsRes.json();
        const ticketsData = await ticketsRes.json();
        
        setStats(statsData.data);
        setTickets(ticketsData.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
```

**Key Features:**
- Parallel requests with Promise.all
- Loading state management
- Error handling
- Cleanup on unmount

### 4. TailwindCSS Utility

```typescript
// src/utils/cn.ts
import { className } from 'tailwind-merge';

export function cn(...inputs: classValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<span className={cn(
  "px-2 py-1 text-xs rounded",
  ticket.status === 'OPEN' && 'bg-blue-100 text-blue-800',
  ticket.status === 'IN_PROGRESS' && 'bg-yellow-100 text-yellow-800'
)}>
  {ticket.status}
</span>
```

---

## Database Schema Design

### Core Models

#### User Model
```prisma
model User {
  id          String   @id @default(uuid())
  email       String   @unique
  password    String
  firstName   String?
  lastName    String?
  phone       String?
  avatar      String?
  role        String   @default("AGENT")  // AGENT, LEAD, ENGINEER, MANAGER, ADMIN
  status      String   @default("ACTIVE") // ACTIVE, INACTIVE, SUSPENDED
  lastLoginAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  createdTickets   Ticket[]      @relation("CreatedTickets")
  assignedTickets  Ticket[]      @relation("AssignedTickets")
  comments         Comment[]
  sessions         Session[]
  auditLogs        AuditLog[]
}
```

#### Ticket Model
```prisma
model Ticket {
  id            String      @id @default(uuid())
  ticketNumber  String      @unique  // Format: TKT-{YYYY}-{NNNNN}
  subject       String
  description   String
  priority      String      @default("MEDIUM")  // CRITICAL, HIGH, MEDIUM, LOW
  status        String      @default("OPEN")    // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  type          String      @default("INCIDENT") // INCIDENT, PROBLEM, CHANGE
  source        String      @default("WEB")     // WEB, EMAIL, SMS, WHATSAPP, PHONE
  
  // Assignment
  assigneeId    String?
  assignee      User?       @relation("AssignedTickets", fields: [assigneeId], references: [id])
  creatorId     String
  creator       User        @relation("CreatedTickets", fields: [creatorId], references: [id])

  // SLA
  slaId         String?
  sla           SLA?        @relation(fields: [slaId], references: [id])
  dueDate       DateTime?
  resolvedAt    DateTime?
  closedAt      DateTime?

  // AI Insights
  aiScore       Float?
  aiCategory    String?
  aiTags        String?     // JSON string for SQLite

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  comments      Comment[]
  attachments   Attachment[]
}
```

### Indexing Strategy

```prisma
@@index([ticketNumber])
@@index([status, priority])
@@index([assigneeId])
@@index([createdAt])
```

**Rationale:**
- `ticketNumber`: Fast lookup by ticket ID
- `status, priority`: Common filter combinations
- `assigneeId`: Agent workload queries
- `createdAt`: Sorting and date range queries

---

## Security Implementation

### 1. Password Hashing

```typescript
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash(password, 12);
const isValid = await bcrypt.compare(password, user.password);
```

**Parameters:**
- Cost factor: 12 (good balance between security and performance)
- Salt rounds: 12 (automatically generated)

### 2. JWT Configuration

```typescript
const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  jwtSecret,
  { expiresIn: '7d' }
);
```

**Best Practices:**
- Short-lived tokens (7 days max)
- Include minimal claims
- Use environment variable for secret
- Implement refresh token (future enhancement)

### 3. Input Validation (Zod - Future Implementation)

```typescript
import { z } from 'zod';

const createTicketSchema = z.object({
  subject: z.string().min(1).max(255),
  description: z.string().min(1),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  type: z.enum(['INCIDENT', 'PROBLEM', 'CHANGE']).default('INCIDENT'),
});
```

### 4. Security Headers

```typescript
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

**Headers Set:**
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content-Security-Policy

---

## Multi-Channel Implementation

### Channel Adapters

```typescript
// Email adapter
app.post('/api/v1/channels/email', async (req, res) => {
  const { from, subject, body } = req.body;
  
  // Create ticket from email
  const ticket = await prisma.ticket.create({
    data: {
      subject,
      description: body,
      source: 'EMAIL',
      creator: { connectOrCreate: { where: { email: from }, create: { email: from } } },
    },
  });
  
  res.json({ success: true, data: ticket });
});
```

### Message Flow

1. **Receive** → Channel endpoint receives message
2. **Parse** → Extract sender, subject, body
3. **Dedupe** → Check for recent similar messages
4. **Create** → Generate ticket with source metadata
5. **Notify** → Send acknowledgment
6. **Route** → Assign based on rules

---

## Deployment Patterns

### Docker Multi-stage Build

```dockerfile
# Backend Dockerfile
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Health Check

```typescript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});
```

---

## Performance Optimizations

### 1. Database Query Optimization

```typescript
// Use select to limit returned fields
prisma.user.findMany({
  select: { id: true, email: true, firstName: true, lastName: true },
});

// Use include instead of separate queries
prisma.ticket.findMany({
  include: {
    assignee: { select: { id: true, firstName: true } },
  },
});
```

### 2. Pagination

```typescript
const page = parseInt(req.query.page as string) || 1;
const limit = parseInt(req.query.limit as string) || 20;

prisma.ticket.findMany({
  skip: (page - 1) * limit,
  take: limit,
});
```

### 3. Caching Strategy (Future)

```typescript
// Redis caching for frequently accessed data
const cachedStats = await redis.get('ticket_stats');
if (!cachedStats) {
  const stats = await computeStats();
  await redis.setex('ticket_stats', 300, JSON.stringify(stats));
}
```

---

## Testing Strategy (Future)

### Unit Tests

```typescript
describe('Ticket Service', () => {
  it('should create a ticket with auto-generated number', async () => {
    const ticket = await createTicket({ subject: 'Test' });
    expect(ticket.ticketNumber).toMatch(/^TKT-\d{4}-\d{6}$/);
  });
});
```

### Integration Tests

```typescript
describe('API Endpoints', () => {
  it('should return 401 for protected routes without auth', async () => {
    const res = await request(app).get('/api/v1/tickets');
    expect(res.statusCode).toBe(401);
  });
});
```

---

## Monitoring & Logging

### Structured Logging

```typescript
// Using winston
const logger = createLogger();

logger.info('User logged in', { userId: user.id, email: user.email });
logger.error('Failed to create ticket', { error: err.message, userId: req.user?.id });
```

### Metrics to Track

- API response time (p50, p95, p99)
- Database query performance
- Authentication success/failure rate
- Ticket creation rate
- Active users count

---

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL in .env
   - Verify database is running
   - Check network connectivity

2. **JWT Secret Invalid**
   - Ensure JWT_SECRET is set
   - Check token expiration
   - Verify token in Authorization header

3. **CORS Errors**
   - Set CORS_ORIGIN in .env
   - Match frontend URL exactly
   - Include credentials flag

4. **Migration Errors**
   - Delete prisma/migrations folder
   - Run `npx prisma migrate dev --name init`
   - Check DATABASE_URL points to correct database

### Debug Commands

```bash
# Check database
npx prisma studio

# Reset database
npx prisma migrate reset

# Generate client after schema change
npx prisma generate

# Seed data
npx prisma db seed
```