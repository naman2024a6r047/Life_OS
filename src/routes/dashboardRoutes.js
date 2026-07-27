const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { Friend, PartnerIntervention, UserBadge, Badge, User } = require('../models');

// Get Accountability Partners (Friends)
router.get('/partners', authMiddleware, async (req, res) => {
  try {
    const friends = await Friend.findAll({
      where: { user_id: req.user.id, status: 'accepted' },
      include: [{ model: User, as: 'recipient', attributes: ['id', 'username'] }]
    });
    // Format to match the frontend expectations
    const partners = friends.map(f => ({
      id: f.id,
      name: f.recipient?.username || 'Unknown',
      status: 'Online', // Placeholder since we don't have real-time status in DB
      lastSeen: new Date(),
    }));
    res.json(partners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Pending Inquiries (Partner Interventions)
router.get('/inquiries', authMiddleware, async (req, res) => {
  try {
    const interventions = await PartnerIntervention.findAll({
      where: { receiver_id: req.user.id, status: 'pending' },
      include: [{ model: User, as: 'sender', attributes: ['id', 'username'] }],
      order: [['createdAt', 'DESC']]
    });
    const inquiries = interventions.map(inv => ({
      id: inv.id,
      message: inv.message || 'asked about your progress',
      createdAt: inv.createdAt,
      partner: { name: inv.sender?.username || 'Partner' }
    }));
    res.json(inquiries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Achievements (User Badges)
router.get('/achievements', authMiddleware, async (req, res) => {
  try {
    const userBadges = await UserBadge.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Badge }],
      order: [['earned_at', 'DESC']],
      limit: 5
    });
    const achievements = userBadges.map(ub => ({
      id: ub.id,
      title: ub.Badge?.name || 'Achievement',
      description: ub.Badge?.description || '',
      xpAwarded: ub.Badge?.xp_reward || 100,
      icon: ub.Badge?.icon || '🏆'
    }));
    res.json(achievements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
