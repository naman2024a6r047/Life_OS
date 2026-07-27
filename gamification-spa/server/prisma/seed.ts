import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create User
  const user = await prisma.user.create({
    data: {
      name: 'Ghanshyam Thakur',
      quote: 'Discipline today, freedom tomorrow.',
      dayStreak: 12,
      totalXp: 4500,
      level: 1,
      levelTitle: 'Pro Builder',
      lifeScore: 78,
      graceTokens: 3,
    },
  });

  console.log(`Created user: ${user.name}`);

  // 2. Create Tasks
  await prisma.task.createMany({
    data: [
      { userId: user.id, title: 'Complete NDA Math Mock Test', status: 'Active', category: 'Exam' },
      { userId: user.id, title: 'Read Chapter 4 of CDS History', status: 'Completed', category: 'Exam', completedAt: new Date() },
      { userId: user.id, title: 'Morning 5km Run', status: 'Completed', category: 'Fitness', completedAt: new Date() },
      { userId: user.id, title: '100 Pushups Challenge', status: 'Active', category: 'Fitness' },
      { userId: user.id, title: 'Solve 3 LeetCode Mediums', status: 'Active', category: 'Coding' },
      { userId: user.id, title: 'Revise Operating Systems Notes', status: 'Skipped', category: 'Study' },
    ],
  });

  // 3. Create Activity Logs (Current Week)
  const today = new Date();
  const pastDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - i);
    return d;
  });

  for (const date of pastDays) {
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        date: date,
        category: 'Study',
        durationHours: Math.floor(Math.random() * 4) + 1, // 1 to 4 hours
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        date: date,
        category: 'Fitness',
        completed: Math.random() > 0.3, // 70% chance of completion
      },
    });
  }

  // 4. Create Accountability Partners & Inquiries
  const partner1 = await prisma.accountabilityPartner.create({
    data: {
      userId: user.id,
      name: 'Amit Singh',
      status: 'Online',
    },
  });

  const partner2 = await prisma.accountabilityPartner.create({
    data: {
      userId: user.id,
      name: 'Priya Sharma',
      status: 'Offline',
      lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
  });

  await prisma.inquiry.create({
    data: {
      userId: user.id,
      partnerId: partner1.id,
      message: 'asked about your Day 12 (Skipped)',
      isRead: false,
    },
  });

  // 5. Create Achievements
  await prisma.achievement.createMany({
    data: [
      { userId: user.id, title: 'First Blood', description: 'Complete your first task', xpAwarded: 100 },
      { userId: user.id, title: 'Marathoner', description: 'Log 10 consecutive fitness days', xpAwarded: 500 },
      { userId: user.id, title: 'Code Warrior', description: 'Solve 50 coding problems', xpAwarded: 300 },
    ],
  });

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
