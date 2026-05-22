const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Check if data already exists
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log('Data already seeded, skipping...');
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@ticketing.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // Create more users
  const users = [
    { email: 'agent@ticketing.com', firstName: 'Support', lastName: 'Agent', role: 'AGENT' },
    { email: 'manager@ticketing.com', firstName: 'Manager', lastName: 'User', role: 'MANAGER' },
    { email: 'customer@ticketing.com', firstName: 'Customer', lastName: 'User', role: 'CUSTOMER' },
  ];

  for (const userData of users) {
    const hashedPwd = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPwd,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        status: 'ACTIVE',
      },
    });
  }

  // Create categories
  const categories = [
    { name: 'Technical Support', description: 'Technical issues and troubleshooting' },
    { name: 'Billing', description: 'Billing and payment inquiries' },
    { name: 'Account Management', description: 'Account creation and management' },
    { name: 'Product Feedback', description: 'Product suggestions and feedback' },
  ];

  for (const cat of categories) {
    await prisma.category.create({
      data: cat,
    });
  }

  // Create SLAs
  const slas = [
    { name: 'Standard SLA', description: '24 hours response, 72 hours resolution', responseTime: 24 * 60, resolutionTime: 72 },
    { name: 'Premium SLA', description: '4 hours response, 24 hours resolution', responseTime: 4 * 60, resolutionTime: 24 },
    { name: 'Critical SLA', description: '1 hour response, 4 hours resolution', responseTime: 60, resolutionTime: 4 },
  ];

  for (const sla of slas) {
    await prisma.sLA.create({
      data: sla,
    });
  }

  // Create sample tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-2024-00001',
      subject: 'Unable to login to my account',
      description: 'I am unable to login to my account despite using the correct credentials.',
      priority: 'HIGH',
      status: 'OPEN',
      type: 'INCIDENT',
      source: 'WEB',
      creator: { connect: { email: 'customer@ticketing.com' } },
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-2024-00002',
      subject: 'Question about billing invoice',
      description: 'Could you please explain the charges on my latest invoice?',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      type: 'SERVICE_REQUEST',
      source: 'EMAIL',
      creator: { connect: { email: 'customer@ticketing.com' } },
    },
  });

  console.log('Seed completed successfully');
  console.log({ admin, ticketCount: 2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });