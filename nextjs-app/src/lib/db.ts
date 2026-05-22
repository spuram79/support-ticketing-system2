import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

// Initialize SQLite database
const dbPath = path.join(process.cwd(), 'tickets.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'agent',
    department TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_number TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Software',
    priority TEXT DEFAULT 'Medium',
    severity TEXT DEFAULT 'Minor',
    status TEXT DEFAULT 'Open',
    source TEXT DEFAULT 'Portal',
    assigned_to INTEGER,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS ticket_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    user_id INTEGER,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS ticket_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    field TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by INTEGER,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
  CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
  CREATE INDEX IF NOT EXISTS idx_tickets_assignee ON tickets(assigned_to);
  CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
`);

// Seed data
function seedDatabase() {
  const checkUsers = db.prepare('SELECT COUNT(*) as count FROM users');
  const userCount = checkUsers.get().count;

  if (userCount > 0) {
    console.log('Database already seeded');
    return;
  }

  const insertUser = db.prepare(`
    INSERT INTO users (email, password, name, role, department)
    VALUES (?, ?, ?, ?, ?)
  `);

  const hashedPassword = bcrypt.hashSync('password123', 10);

  // Create admin user
  insertUser.run('admin@company.com', hashedPassword, 'Admin User', 'admin', 'IT');

  // Create support agents
  insertUser.run('john@company.com', hashedPassword, 'John Smith', 'agent', 'Hardware');
  insertUser.run('jane@company.com', hashedPassword, 'Jane Doe', 'agent', 'Software');
  insertUser.run('bob@company.com', hashedPassword, 'Bob Wilson', 'lead', 'Software');

  // Create test customer
  insertUser.run('customer@example.com', hashedPassword, 'Test Customer', 'customer', null);

  // Create sample tickets
  const insertTicket = db.prepare(`
    INSERT INTO tickets (ticket_number, subject, description, category, priority, severity, status, source, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTicket.run(
    'TKT-2024-000001',
    'Computer won\'t boot',
    'My laptop is not turning on. The power light is blinking but nothing happens.',
    'Hardware',
    'High',
    'Major',
    'In Progress',
    'Portal',
    4
  );

  insertTicket.run(
    'TKT-2024-000002',
    'Email not working',
    'Cannot send emails from Outlook. Getting error "Server not found".',
    'Software',
    'Critical',
    'Critical',
    'Open',
    'Email',
    4
  );

  insertTicket.run(
    'TKT-2024-000003',
    'VPN connection issues',
    'Unable to connect to VPN from home. Was working yesterday.',
    'Network',
    'Medium',
    'Minor',
    'Open',
    'Portal',
    4
  );

  console.log('Database seeded successfully');
}

seedDatabase();

export { db };