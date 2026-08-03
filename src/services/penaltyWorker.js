const cron = require('node-cron');
const { User, Challenge, Milestone, MilestoneTask, Penalty, ActivityLog, Friend, PartnerIntervention, sequelize } = require('../models');
const { Op } = require('sequelize');

// ════════════════════════════════════════════════════════════════════════
//  PENALTY RULES:
//    HARD   → 1 missed day triggers penalty (100 XP, milestone restart)
//    MEDIUM → 2 consecutive missed days triggers penalty (50 XP, milestone restart)
//    EASY   → No penalty ever
// ════════════════════════════════════════════════════════════════════════

// Run every 1 minute
const startPenaltyWorker = () => {
    cron.schedule('* * * * *', async () => {
        try {
            console.log('[PenaltyWorker] Running scheduled penalty checks...');
            const todayStr = new Date().toISOString().split('T')[0];

            // Fetch all active challenges (skip users in exam mode)
            const activeChallenges = await Challenge.findAll({
                where: { status: 'active' },
                include: [
                    {
                        model: User,
                        where: { is_in_exam_mode: false },
                        attributes: ['id', 'username', 'xp', 'current_streak', 'is_in_exam_mode']
                    },
                    {
                        model: Milestone,
                        as: 'milestones',
                        where: { status: 'unlocked' },
                        required: false,
                        include: [{ model: MilestoneTask, as: 'tasks' }]
                    }
                ]
            });

            for (const challenge of activeChallenges) {
                // ── EASY MODE: No penalties ever ──────────────────────
                if (challenge.penalty_mode === 'easy') continue;

                const milestone = challenge.milestones?.[0];
                if (!milestone || !milestone.tasks?.length) continue;

                // ── Build a date→tasks map ───────────────────────────
                const tasksByDate = {};
                for (const task of milestone.tasks) {
                    if (!task.date) continue;
                    const dateKey = typeof task.date === 'string'
                        ? task.date.split('T')[0]
                        : new Date(task.date).toISOString().split('T')[0];
                    if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
                    tasksByDate[dateKey].push(task);
                }

                // ── Get all past dates (before today) sorted descending ──
                const pastDates = Object.keys(tasksByDate)
                    .filter(date => date < todayStr)
                    .sort((a, b) => b.localeCompare(a)); // most recent first

                if (pastDates.length === 0) continue;

                // ── Fetch existing penalties for this challenge to avoid double-counting ──
                const existingPenalties = await Penalty.findAll({
                    where: { challenge_id: challenge.id }
                });

                // ── Count consecutive missed days (from most recent backwards) ──
                let consecutiveMissedDays = 0;
                let missedDates = [];

                for (const date of pastDates) {
                    const tasks = tasksByDate[date];
                    
                    // If this date was already part of a previous penalty, it breaks the new streak
                    const alreadyPenalized = existingPenalties.some(p => p.description && p.description.includes(date));
                    if (alreadyPenalized) {
                        break;
                    }

                    const allCompleted = tasks.every(t => t.is_completed);
                    if (!allCompleted) {
                        consecutiveMissedDays++;
                        missedDates.push(date);
                    } else {
                        break; // Streak of missed days broken by a completed day
                    }
                }

                if (consecutiveMissedDays === 0) continue;

                // ── Determine threshold based on penalty_mode ────────
                let threshold, xpDeducted, severity;

                if (challenge.penalty_mode === 'hard') {
                    threshold = 1;   // 1 skip = penalty
                    xpDeducted = 100;
                    severity = 'High';
                } else if (challenge.penalty_mode === 'medium') {
                    threshold = 2;   // 2 consecutive skips = penalty
                    xpDeducted = 50;
                    severity = 'Medium';
                } else {
                    continue; // Safety fallback
                }

                // ── Check if threshold is met ────────────────────────
                if (consecutiveMissedDays < threshold) continue;

                // ── Check if we already penalized for these specific missed dates ──
                const latestMissedDate = missedDates[0]; // most recent missed date
                const existingPenalty = existingPenalties.find(p => p.description && p.description.includes(latestMissedDate));

                if (existingPenalty) continue;

                // ── APPLY PENALTY ────────────────────────────────────
                const user = await User.findByPk(challenge.user_id);
                if (!user) continue;

                // Find the first incomplete task title for the notification message
                const latestMissedTasks = tasksByDate[latestMissedDate] || [];
                const firstIncompleteTask = latestMissedTasks.find(t => !t.is_completed);
                const missedTaskTitle = firstIncompleteTask?.title || 'daily tasks';

                const penaltyDescription = challenge.penalty_mode === 'hard'
                    ? `Missed tasks on ${latestMissedDate}. 1 day skipped → HARD penalty triggered.`
                    : `Missed tasks on ${missedDates.slice(0, 2).join(' & ')}. ${consecutiveMissedDays} consecutive days skipped → MEDIUM penalty triggered.`;

                await sequelize.transaction(async (t) => {
                    // 1. Create Penalty Record
                    await Penalty.create({
                        user_id: user.id,
                        challenge_id: challenge.id,
                        title: `Missed Tasks Penalty (${challenge.penalty_mode.toUpperCase()})`,
                        description: penaltyDescription,
                        severity,
                        penalty_type: 'Goal Restart & XP Loss',
                        xp_deducted: xpDeducted,
                        status: 'Active'
                    }, { transaction: t });

                    // 2. Deduct XP and Reset Streak
                    const newXp = Math.max(0, (user.xp || 0) - xpDeducted);
                    await user.update({ xp: newXp, current_streak: 0 }, { transaction: t });

                    // 3. Restart Milestone — reset all task progress (keep dates intact)
                    const tasksToReset = await MilestoneTask.findAll({
                        where: { milestone_id: milestone.id },
                        transaction: t
                    });

                    for (const task of tasksToReset) {
                        task.is_completed = false;
                        if (task.completed !== undefined) {
                            task.completed = false;
                        }
                        await task.save({ transaction: t });
                    }

                    await milestone.update({ status: 'unlocked' }, { transaction: t });

                    // 4. Log Activity
                    await ActivityLog.create({
                        user_id: user.id,
                        action_type: 'penalty_applied',
                        xp_awarded: -xpDeducted
                    }, { transaction: t });

                    // 5. Notify Partners/Friends
                    try {
                        const friends = await Friend.findAll({
                            where: {
                                [Op.or]: [{ user_id: user.id }, { friend_id: user.id }],
                                status: 'accepted'
                            },
                            transaction: t
                        });

                        const friendIds = friends.map(f => f.user_id === user.id ? f.friend_id : f.user_id);
                        for (const friendId of friendIds) {
                            await PartnerIntervention.create({
                                sender_id: user.id,
                                receiver_id: friendId,
                                type: 'message',
                                item_type: 'Penalty',
                                item_title: 'Missed Task Penalty',
                                message: `System Alert: Your accountability partner ${user.username || 'your friend'} missed their task "${missedTaskTitle}" on ${latestMissedDate} and received a ${challenge.penalty_mode.toUpperCase()} penalty (-${xpDeducted} XP).`
                            }, { transaction: t });
                        }
                    } catch (friendErr) {
                        console.error('[PenaltyWorker] Friend notification error (non-fatal):', friendErr.message);
                    }
                });

                console.log(`[PenaltyWorker] ${challenge.penalty_mode.toUpperCase()} penalty applied to user ${user.id} for challenge "${challenge.title}" (${consecutiveMissedDays} missed days, -${xpDeducted} XP)`);
            }
        } catch (error) {
            console.error('[PenaltyWorker] Error:', error);
        }
    });
};

module.exports = { startPenaltyWorker };
