import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// For demonstration, we assume a single user. In a real app, use authentication.
const getUserId = async () => {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found. Please run seed script.");
  return user.id;
};

// 1. Fetch User Data
app.get('/api/user', async (req, res) => {
  try {
    const userId = await getUserId();
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// 2. Fetch Tasks (Active & Completed)
app.get('/api/tasks', async (req, res) => {
  try {
    const userId = await getUserId();
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// 3. Fetch Activity Summary (Heatmap & Hours)
app.get('/api/activities/summary', async (req, res) => {
  try {
    const userId = await getUserId();
    const activities = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { date: 'asc' }
    });
    
    // Calculate total focus hours for the current week
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyFocusHours = activities
      .filter(a => a.date >= oneWeekAgo && a.durationHours)
      .reduce((acc, curr) => acc + (curr.durationHours || 0), 0);

    res.json({
      activities,
      weeklyFocusHours
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity summary' });
  }
});

// 4. Fetch Accountability Partners
app.get('/api/partners', async (req, res) => {
  try {
    const userId = await getUserId();
    const partners = await prisma.accountabilityPartner.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    });
    res.json(partners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch partners' });
  }
});

// 5. Fetch Pending Inquiries
app.get('/api/inquiries', async (req, res) => {
  try {
    const userId = await getUserId();
    const inquiries = await prisma.inquiry.findMany({
      where: { userId, isRead: false },
      include: { partner: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// 6. Fetch Achievements
app.get('/api/achievements', async (req, res) => {
  try {
    const userId = await getUserId();
    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' },
      take: 5
    });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
