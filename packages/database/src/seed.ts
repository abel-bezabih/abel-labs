import { PrismaClient, UserRole, ProjectType, ProjectStatus, Currency } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@abellabs.ca' },
    update: {},
    create: {
      email: 'admin@abellabs.ca',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
      phone: '+251911234567',
    },
  });

  // Create developer user
  const devPassword = await bcrypt.hash('dev123', 10);
  const developer = await prisma.user.upsert({
    where: { email: 'dev@abellabs.ca' },
    update: {},
    create: {
      email: 'dev@abellabs.ca',
      name: 'Developer User',
      password: devPassword,
      role: UserRole.DEVELOPER,
      phone: '+251911234568',
    },
  });

  // Create sample client
  const clientPassword = await bcrypt.hash('client123', 10);
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      name: 'Sample Client',
      password: clientPassword,
      role: UserRole.CLIENT,
      phone: '+251911234569',
    },
  });

  // Create sample project brief
  const conversation = await prisma.aIConversation.upsert({
    where: { sessionId: 'sample_session_001' },
    update: {},
    create: {
      sessionId: 'sample_session_001',
      messages: [
        {
          role: 'user',
          content: 'I need a website for my restaurant',
          timestamp: new Date(),
        },
        {
          role: 'assistant',
          content: 'Great! Tell me more about your restaurant...',
          timestamp: new Date(),
        },
      ],
      intent: ProjectType.WEBSITE,
      status: 'COMPLETED',
    },
  });

  const brief = await prisma.projectBrief.upsert({
    where: { conversationId: conversation.sessionId },
    update: {},
    create: {
      conversationId: conversation.sessionId,
      projectType: ProjectType.WEBSITE,
      businessType: 'Restaurant',
      features: ['Menu Display', 'Online Reservations', 'Contact Form', 'Gallery'],
      designPreferences: 'Modern, warm colors, food photography',
      timeline: '4-6 weeks',
      budgetRange: '70,000 - 100,000 ETB',
      summary: 'A modern restaurant website with menu display, online reservations, and gallery.',
      status: ProjectStatus.APPROVED,
      approvedBudget: 85000,
      approvedCurrency: Currency.ETB,
      approvedDeadline: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000), // 42 days
    },
  });

  // Create sample project (find existing or create new)
  let project = await prisma.project.findFirst({
    where: { briefId: brief.id },
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        title: 'Restaurant Website',
        description: 'Modern restaurant website with menu display and online reservations',
        type: ProjectType.WEBSITE,
        status: ProjectStatus.IN_PROGRESS,
        clientId: client.id,
        assignedToId: developer.id,
        briefId: brief.id,
        budget: 85000,
        currency: Currency.ETB,
        deadline: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Create sample invoice (upsert by invoice number)
  await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-2024-001' },
    update: {},
    create: {
      projectId: project.id,
      invoiceNumber: 'INV-2024-001',
      amount: 85000,
      currency: Currency.ETB,
      status: 'SENT',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      items: [
        {
          description: 'Website Development - Restaurant',
          quantity: 1,
          unitPrice: 85000,
          total: 85000,
        },
      ],
    },
  });

  console.log('✅ Seeding completed!');
  console.log('📧 Admin: admin@abellabs.ca / admin123');
  console.log('👨‍💻 Developer: dev@abellabs.ca / dev123');
  console.log('👤 Client: client@example.com / client123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

