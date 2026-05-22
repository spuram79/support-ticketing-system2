# API Documentation

## Base URL

```
http://localhost:3001/api/v1
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### POST /auth/login

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "AGENT"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

---

### GET /auth/me

Get current authenticated user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "AGENT",
    "status": "ACTIVE"
  }
}
```

---

### PATCH /auth/me

Update current user profile.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

---

### PATCH /auth/change-password

Change user password.

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## Ticket Endpoints

### GET /tickets

List all tickets with pagination and filtering.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| status | string | - | Filter by status |
| priority | string | - | Filter by priority |
| assigneeId | string | - | Filter by assignee |
| search | string | - | Search in subject/description |

**Success Response (200):**
```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "page": 1,
  "limit": 20,
  "data": [
    {
      "id": "ticket-uuid",
      "ticketNumber": "TKT-2024-001001",
      "subject": "Computer won't boot",
      "description": "My laptop won't turn on",
      "priority": "HIGH",
      "status": "OPEN",
      "type": "INCIDENT",
      "source": "WEB",
      "assignee": {
        "id": "agent-uuid",
        "firstName": "Agent",
        "lastName": "Name",
        "email": "agent@example.com"
      },
      "creator": {
        "id": "user-uuid",
        "firstName": "Customer",
        "lastName": "Name",
        "email": "customer@example.com"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### GET /tickets/stats

Get ticket statistics by status.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "OPEN": 25,
    "IN_PROGRESS": 10,
    "RESOLVED": 50,
    "CLOSED": 15,
    "PENDING": 5
  }
}
```

---

### GET /tickets/:id

Get a single ticket by ID.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "ticket-uuid",
    "ticketNumber": "TKT-2024-001001",
    "subject": "Computer won't boot",
    "description": "My laptop won't turn on",
    "priority": "HIGH",
    "status": "OPEN",
    "type": "INCIDENT",
    "source": "WEB",
    "assignee": { ... },
    "creator": { ... },
    "comments": [
      {
        "id": "comment-uuid",
        "content": "I can help with this",
        "author": { ... },
        "createdAt": "2024-01-15T11:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### POST /tickets

Create a new ticket.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "subject": "Computer won't boot",
  "description": "My laptop won't turn on",
  "priority": "HIGH",
  "type": "INCIDENT",
  "categoryId": "category-uuid",
  "assigneeId": "agent-uuid"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "ticket-uuid",
    "ticketNumber": "TKT-2024-001001",
    ...
  }
}
```

---

### PATCH /tickets/:id

Update a ticket.

**Request Body:**
```json
{
  "status": "IN_PROGRESS",
  "priority": "CRITICAL",
  "assigneeId": "new-agent-uuid"
}
```

---

### DELETE /tickets/:id

Delete a ticket.

---

## User Endpoints

### GET /users

List all users.

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "AGENT",
      "status": "ACTIVE"
    }
  ]
}
```

---

### GET /users/:id

Get a user by ID.

---

### PATCH /users/:id

Update a user.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1987654321",
  "role": "LEAD",
  "status": "ACTIVE"
}
```

---

## Multi-Channel Endpoints

### POST /channels/email

Create a ticket from email.

**Request Body:**
```json
{
  "from": "customer@example.com",
  "subject": "Support Request",
  "body": "My keyboard is broken",
  "name": "John Doe"  // Optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "email_1234567890",
    "source": "EMAIL",
    "from": "customer@example.com",
    "subject": "Support Request"
  }
}
```

---

### POST /channels/sms

Create a ticket from SMS.

**Request Body:**
```json
{
  "from": "+1234567890",
  "message": "Help with my account"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "sms_1234567890",
    "source": "SMS",
    "from": "+1234567890"
  }
}
```

---

### POST /channels/whatsapp

Create a ticket from WhatsApp.

**Request Body:**
```json
{
  "from": "+1234567890",
  "message": "Help with my account",
  "name": "John Doe"  // Optional
}
```

---

### POST /channels/phone

Create a ticket from phone call.

**Request Body:**
```json
{
  "from": "+1234567890",
  "caller": "John Doe",  // Optional
  "description": "Call about billing issue"  // Optional
}
```

---

### POST /webhooks/:id

Generic webhook endpoint for custom integrations.

---

## Ticket Status Flow

```
    ┌─────┐
    │ OPEN │
    └──┬──┘
       │
       ▼
┌─────────────┐
│ IN_PROGRESS │
└──────┬──────┘
       │
       ▼
┌─────────┐    ┌─────────┐
│ RESOLVED │───▶│ ESCALATED │
└─────────┘    └─────────┘
     │
     ▼
┌───────┐
│ CLOSED │
└───────┘
```

---

## Ticket Priority Levels

| Priority | Description | Response Time | Resolution Time |
|----------|-------------|---------------|-----------------|
| CRITICAL | System down | 30 min | 4 hours |
| HIGH | Major impact | 2 hours | 8 hours |
| MEDIUM | Standard issue | 4 hours | 24 hours |
| LOW | Minor issue | 8 hours | 72 hours |

---

## Ticket Types

| Type | Description |
|------|-------------|
| INCIDENT | Service disruption |
| PROBLEM | Root cause investigation |
| CHANGE | Change request |
| FEATURE | New feature request |
| TASK | General task |

---

## User Roles

| Role | Permissions |
|------|-------------|
| AGENT | Create own tickets, view own tickets |
| LEAD | All agent permissions + assign, escalate |
| ENGINEER | View assigned tickets, technical notes |
| MANAGER | View reports, team dashboards |
| ADMIN | Full system access |
| CUSTOMER | Create own tickets, view own tickets |

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Ticket not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

---

## Rate Limiting

Rate limiting is implemented per IP address:
- 100 requests per minute for authenticated endpoints
- 1000 requests per minute for public endpoints

---

## Pagination

All list endpoints support pagination:

```json
{
  "success": true,
  "count": 20,
  "total": 100,
  "page": 1,
  "limit": 20,
  "data": [...]
}
```

- `count`: Items on current page
- `total`: Total items in database
- `page`: Current page number
- `limit`: Items per page