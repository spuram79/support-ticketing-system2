CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'CUSTOMER',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    last_loginAt TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'OPEN',
    type VARCHAR(50) DEFAULT 'INCIDENT',
    source VARCHAR(50) DEFAULT 'WEB',
    category_id UUID,
    assignee_id UUID,
    creator_id UUID NOT NULL,
    due_date TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,
    ai_score DECIMAL(3,2),
    ai_category VARCHAR(100),
    ai_tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX idx_tickets_creator ON tickets(creator_id);
CREATE INDEX idx_tickets_created ON tickets(created_at);
CREATE INDEX idx_tickets_subject ON tickets USING gin(to_tsvector('english', subject));