const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get Accountability Partners
router.get('/partners', authMiddleware, async (req, res) => {
  try {
    const partners = await prisma.accountabilityPartner.findMany({
      where: { userId: req.user.id },
      orderBy: { name: 'asc' }
    });
    res.json(partners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Pending Inquiries
router.get('/inquiries', authMiddleware, async (req, res) => {
  try {
    const inquiries = await prisma.inquiry.findMany({
      where: { userId: req.user.id, isRead: false },
      include: { partner: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(inquiries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Achievements
router.get('/achievements', authMiddleware, async (req, res) => {
  try {
    const achievements = await prisma.achievement.findMany({
      where: { userId: req.user.id },
      orderBy: { unlockedAt: 'desc' },
      take: 5
    });
    res.json(achievements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
