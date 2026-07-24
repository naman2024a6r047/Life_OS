const { ActivityLog, User, Badge, Challenge, Milestone, MilestoneTask, WorkoutPlan, Exercise, CodingProfile } = require('../models');
const { Op } = require('sequelize');

exports.getSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [
            user,
            totalGoals,
            activeGoals,
            completedGoals,
            totalMilestones,
            completedMilestones,
            totalTasks,
            completedTasks
        ] = await Promise.all([
            User.findByPk(userId, { raw: true }),
            Challenge.count({ where: { user_id: userId } }),
            Challenge.count({ where: { user_id: userId, status: 'active' } }),
            Challenge.count({ where: { user_id: userId, status: 'completed' } }),
            Milestone.count({ include: [{ model: Challenge, where: { user_id: userId } }] }),
            Milestone.count({ include: [{ model: Challenge, where: { user_id: userId } }], where: { status: 'completed' } }),
            MilestoneTask.count({ include: [{ model: Milestone, include: [{ model: Challenge, where: { user_id: userId } }] }] }),
            MilestoneTask.count({ include: [{ model: Milestone, include: [{ model: Challenge, where: { user_id: userId } }] }], where: { is_completed: true } })
        ]);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const streak = user.current_streak || 0;
        const totalItems = totalTasks;
        const completedItems = completedTasks;

        let disciplineScore = 0;
        let growthScore = 0;
        let healthScore = 0;
        let focusScore = 0;
        let overallLifeScore = 0;

        if (totalItems > 0 || totalGoals > 0 || streak > 0) {
            const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
            const streakBonus = Math.min(streak * 10, 30);
            const goalsBonus = Math.min(completedGoals * 15, 20);

            disciplineScore = Math.min(100, Math.round((totalItems > 0 ? (completedItems / totalItems) * 70 : 0) + streakBonus));
            growthScore = Math.min(100, Math.round((totalGoals > 0 ? (completedGoals / totalGoals) * 70 : 0) + goalsBonus));
            healthScore = Math.min(100, Math.round(streak > 0 ? 50 : 0));
            focusScore = Math.min(100, Math.round(totalItems > 0 ? (completedItems / totalItems) * 100 : 0));

            overallLifeScore = Math.min(100, Math.round((completionRate * 0.5) + streakBonus + goalsBonus));
        }

        res.status(200).json({
            lifeScore: overallLifeScore,
            disciplineScore,
            growthScore,
            healthScore,
            focusScore,
            totalGoals,
            activeGoals,
            completedGoals,
            totalMilestones,
            completedMilestones,
            totalTasks,
            completedTasks,
            level: user.level || 1,
            xp: user.xp || 0,
            streak: streak,
            graceTokens: user.grace_tokens || 0
        });
    } catch (error) {
        console.error('Analytics summary error:', error);
        res.status(500).json({ message: 'Error calculating analytics summary' });
    }
};

exports.getHeatmap = async (req, res) => {
    try {
        const logs = await ActivityLog.findAll({
            where: { user_id: req.user.id },
            attributes: ['createdAt', 'xp_awarded'],
            order: [['createdAt', 'ASC']],
            raw: true
        });

        const heatmapData = {};
        logs.forEach(log => {
            const dateStr = new Date(log.createdAt).toISOString().split('T')[0];
            if (!heatmapData[dateStr]) {
                heatmapData[dateStr] = 0;
            }
            heatmapData[dateStr] += 1;
        });

        const formatted = Object.keys(heatmapData).map(date => ({
            date,
            count: heatmapData[date]
        }));

        res.status(200).json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching heatmap' });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'level', 'xp', 'current_streak', 'avatar_url'],
            order: [
                ['xp', 'DESC'],
                ['current_streak', 'DESC']
            ],
            limit: 50
        });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
};

exports.getBadges = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{ model: Badge }]
        });
        const allBadges = await Badge.findAll();
        
        res.status(200).json({
            unlocked: user?.Badges || [],
            all: allBadges
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching badges' });
    }
};

exports.backfillDummyData = async (req, res) => {
    try {
        const logs = [];
        const today = new Date();
        const actionTypes = ['daily_task_completed', 'daily_task_completed', 'study_session', 'gym_workout', 'mock_activity'];

        for (let i = 0; i < 90; i++) {
            const numActivities = Math.floor(Math.random() * 6) + 1;
            const targetDate = new Date();
            targetDate.setDate(today.getDate() - i);
            
            for (let j = 0; j < numActivities; j++) {
                const action = actionTypes[Math.floor(Math.random() * actionTypes.length)];
                logs.push({
                    user_id: req.user.id,
                    action_type: action,
                    xp_awarded: Math.floor(Math.random() * 25) + 10,
                    createdAt: targetDate,
                    updatedAt: targetDate
                });
            }
        }
        await ActivityLog.bulkCreate(logs);

        const badgesExist = await Badge.count();
        if (badgesExist === 0) {
            await Badge.bulkCreate([
                { name: '7-Day Streak', description: 'Maintained discipline for a week.', icon: 'FiZap' },
                { name: 'First Milestone', description: 'Completed your first 10-day milestone.', icon: 'FiTarget' },
                { name: 'Iron Forged', description: 'Completed a workout protocol.', icon: 'FiActivity' }
            ]);
        }

        res.status(200).json({ message: 'Telemetry data generated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating telemetry' });
    }
};

exports.getTimeSeriesData = async (req, res) => {
    try {
        const { horizon = 'daily' } = req.query; // 'daily', 'monthly', 'yearly'
        
        let startDate = new Date();
        if (horizon === 'daily') {
            startDate.setDate(startDate.getDate() - 30); // Last 30 days
        } else if (horizon === 'monthly') {
            startDate.setMonth(startDate.getMonth() - 11); // Last 12 months
            startDate.setDate(1);
        } else {
            startDate.setFullYear(startDate.getFullYear() - 4); // Last 5 years
            startDate.setMonth(0, 1);
        }

        const logs = await ActivityLog.findAll({
            where: { 
                user_id: req.user.id,
                createdAt: { [Op.gte]: startDate }
            },
            attributes: ['createdAt', 'xp_awarded', 'action_type'],
            order: [['createdAt', 'ASC']],
            raw: true
        });

        // Initialize buckets
        const buckets = {};
        const now = new Date();
        
        if (horizon === 'daily') {
            for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
                const key = d.toISOString().split('T')[0];
                buckets[key] = { date: key, xp: 0, tasks: 0, activities: 0 };
            }
        } else if (horizon === 'monthly') {
            for (let d = new Date(startDate); d <= now; d.setMonth(d.getMonth() + 1)) {
                const key = d.toISOString().slice(0, 7); // YYYY-MM
                buckets[key] = { date: key, xp: 0, tasks: 0, activities: 0 };
            }
        } else {
            for (let y = startDate.getFullYear(); y <= now.getFullYear(); y++) {
                const key = y.toString();
                buckets[key] = { date: key, xp: 0, tasks: 0, activities: 0 };
            }
        }

        // Aggregate data
        logs.forEach(log => {
            let key;
            if (horizon === 'daily') {
                key = log.createdAt.toISOString().split('T')[0];
            } else if (horizon === 'monthly') {
                key = log.createdAt.toISOString().slice(0, 7);
            } else {
                key = log.createdAt.getFullYear().toString();
            }

            if (buckets[key]) {
                buckets[key].xp += (log.xp_awarded || 0);
                buckets[key].activities += 1;
                // Count any task/activity as completed task unit for velocity chart
                if (log.action_type === 'daily_task_completed' || log.action_type === 'mock_activity' || log.action_type === 'gym_workout') {
                    buckets[key].tasks += 1;
                }
            }
        });

        res.status(200).json(Object.values(buckets));
    } catch (error) {
        console.error('Time series error:', error);
        res.status(500).json({ message: 'Error fetching time series data' });
    }
};
