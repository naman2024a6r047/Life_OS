const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { Friend, PartnerIntervention, UserBadge, Badge, User, ActivityLog } = require('../models');

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

// Get XP Breakdown and Focus Stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const logs = await ActivityLog.findAll({
      where: { user_id: req.user.id }
    });

    // XP Breakdown
    let breakdown = {
      Challenges: 0,
      Study: 0,
      Fitness: 0,
      Coding: 0,
      Other: 0
    };
    
    let totalStudyHours = 0;
    let totalCodingHours = 0;
    let totalWorkouts = 0;

    logs.forEach(log => {
      const type = log.action_type || '';
      const xp = log.xp_awarded || 0;
      
      if (type.includes('study') || type.includes('exam') || type.includes('read')) {
        breakdown.Study += xp;
        totalStudyHours += 1.5; // Assuming avg session
      } else if (type.includes('gym') || type.includes('workout') || type.includes('fitness')) {
        breakdown.Fitness += xp;
        totalWorkouts += 1;
      } else if (type.includes('code') || type.includes('dev') || type.includes('commit')) {
        breakdown.Coding += xp;
        totalCodingHours += 2.0;
      } else if (type.includes('task') || type.includes('goal')) {
        breakdown.Challenges += xp;
      } else {
        breakdown.Other += xp;
      }
    });

    const totalXPBreakdown = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1; // avoid /0
    
    const formattedBreakdown = [
      { label: 'Challenges', pct: Math.round((breakdown.Challenges / totalXPBreakdown) * 100), color: '#6366F1' },
      { label: 'Study', pct: Math.round((breakdown.Study / totalXPBreakdown) * 100), color: '#06B6D4' },
      { label: 'Fitness', pct: Math.round((breakdown.Fitness / totalXPBreakdown) * 100), color: '#22C55E' },
      { label: 'Coding', pct: Math.round((breakdown.Coding / totalXPBreakdown) * 100), color: '#F59E0B' },
      { label: 'Other', pct: Math.round((breakdown.Other / totalXPBreakdown) * 100), color: '#64748B' },
    ].sort((a,b) => b.pct - a.pct);

    res.json({
      xpBreakdown: formattedBreakdown,
      focusHours: (totalStudyHours + totalCodingHours).toFixed(1),
      studyHours: totalStudyHours.toFixed(1),
      codingHours: totalCodingHours.toFixed(1),
      workouts: totalWorkouts,
      totalXP: Object.values(breakdown).reduce((a, b) => a + b, 0)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
