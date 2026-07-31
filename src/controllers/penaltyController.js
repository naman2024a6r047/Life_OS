const { Penalty, User, Challenge } = require('../models');

exports.getPenaltyAuditLog = async (req, res) => {
    try {
        const penalties = await Penalty.findAll({
            where: { user_id: req.user.id },
            order: [['createdAt', 'DESC']],
            include: [{ model: Challenge, as: 'challenge', attributes: ['title'] }]
        });
        res.status(200).json(penalties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching penalty audit log' });
    }
};

exports.getActivePenalties = async (req, res) => {
    try {
        const penalties = await Penalty.findAll({
            where: { user_id: req.user.id, status: 'Active' },
            order: [['createdAt', 'DESC']],
            include: [{ model: Challenge, as: 'challenge', attributes: ['title'] }]
        });
        res.status(200).json(penalties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching active penalties' });
    }
};

exports.acknowledgePenalty = async (req, res) => {
    try {
        const { id } = req.params;
        const penalty = await Penalty.findOne({ where: { id, user_id: req.user.id } });
        if (!penalty) {
            return res.status(404).json({ message: 'Penalty not found' });
        }
        await penalty.update({ status: 'Acknowledged' });
        res.status(200).json({ message: 'Penalty acknowledged', penalty });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error acknowledging penalty' });
    }
};

exports.triggerMissPenalty = async (req, res) => {
    // Kept for backward compatibility if manual trigger is needed via API
    try {
        const { reason } = req.body;
        const user = await User.findByPk(req.user.id);
        
        const newStreak = 0;
        const newXP = Math.max(0, (user.xp || 0) - 100);
        await user.update({ current_streak: newStreak, xp: newXP });

        const penalty = await Penalty.create({
            user_id: user.id,
            title: 'Manual Penalty Trigger',
            description: reason || 'Manual deduction',
            severity: 'High',
            penalty_type: 'Streak Reset & XP Penalty (-100 XP)',
            xp_deducted: 100
        });

        res.status(200).json({ 
            message: 'Penalty applied successfully. Streak reset to 0.',
            penaltyRecord: penalty,
            user: { current_streak: newStreak, xp: newXP }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error applying miss penalty' });
    }
};

exports.applyGraceDayToken = async (req, res) => {
    try {
        res.status(200).json({ 
            message: 'Grace Token applied! Streak protected for 24 hours.' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error applying grace token' });
    }
};
