const cron = require('node-cron');
const { User, Challenge, Milestone, MilestoneTask, Penalty, ActivityLog, Friend, PartnerIntervention, sequelize } = require('../models');
const { Op } = require('sequelize');

// Run every 1 minute
const startPenaltyWorker = () => {
    cron.schedule('* * * * *', async () => {
        try {
            console.log('[PenaltyWorker] Running scheduled penalty checks...');
            const todayStr = new Date().toISOString().split('T')[0];

            const activeChallenges = await Challenge.findAll({
                where: { status: 'active' },
                include: [
                    {
                        model: User,
                        where: { is_in_exam_mode: false },
                        attributes: ['id', 'is_in_exam_mode']
                    },
                    {
                        model: Milestone,
                        as: 'milestones',
                        where: { status: 'unlocked' },
                        include: [{ model: MilestoneTask, as: 'tasks' }]
                    }
                ]
            });

            for (const challenge of activeChallenges) {
                if (challenge.penalty_mode === 'easy') continue;

                const milestone = challenge.milestones[0];
                if (!milestone) continue;

                // Group tasks by date
                const tasksByDate = {};
                for (const task of milestone.tasks) {
                    if (!task.date) continue;
                    if (!tasksByDate[task.date]) tasksByDate[task.date] = [];
                    tasksByDate[task.date].push(task);
                }

                // Identify missed days (dates before today where NOT all tasks are completed)
                const pastDates = Object.keys(tasksByDate).filter(date => date < todayStr).sort();
                
                let missedDaysCounter = 0;
                let latestMissedDate = null;

                for (let i = pastDates.length - 1; i >= 0; i--) {
                    const date = pastDates[i];
                    const tasks = tasksByDate[date];
                    const allCompleted = tasks.every(t => t.is_completed);
                    if (!allCompleted) {
                        missedDaysCounter++;
                        if (!latestMissedDate) latestMissedDate = date;
                    } else {
                        break; // Streak of missed days broken
                    }
                }

                if (missedDaysCounter === 0) continue;

                // Check if we already penalized for this latest missed date
                const existingPenalty = await Penalty.findOne({
                    where: {
                        challenge_id: challenge.id,
                        description: { [Op.like]: `%${latestMissedDate}%` }
                    }
                });

                if (existingPenalty) continue;

                let shouldPenalize = false;
                let penaltyType = '';
                let xpDeducted = 0;
                let severity = 'Medium';
                
                if (challenge.penalty_mode === 'hard' && missedDaysCounter >= 1) {
                    shouldPenalize = true;
                    penaltyType = 'Goal Restart & XP Loss';
                    xpDeducted = 100;
                    severity = 'High';
                } else if (challenge.penalty_mode === 'medium' && missedDaysCounter >= 2) {
                    shouldPenalize = true;
                    penaltyType = 'Goal Restart & XP Loss';
                    xpDeducted = 50;
                    severity = 'Medium';
                }

                if (shouldPenalize) {
                    const user = await User.findByPk(challenge.user_id);
                    if (!user) continue;

                    // Apply Penalty
                    await sequelize.transaction(async (t) => {
                        // 1. Create Penalty Record
                        await Penalty.create({
                            user_id: user.id,
                            challenge_id: challenge.id,
                            title: 'Missed Tasks Penalty',
                            description: `Missed tasks on ${latestMissedDate}. Penalty mode: ${challenge.penalty_mode.toUpperCase()}`,
                            severity,
                            penalty_type: penaltyType,
                            xp_deducted: xpDeducted,
                            status: 'Active'
                        }, { transaction: t });

                        // 2. Deduct XP and Reset Streak
                        const newXp = Math.max(0, (user.xp || 0) - xpDeducted);
                        await user.update({ xp: newXp, current_streak: 0 }, { transaction: t });

                        // 3. Restart Milestone (Goal Restart) - Reset task progress without shifting dates
                        const tasksToReset = await MilestoneTask.findAll({
                            where: { milestone_id: milestone.id },
                            order: [['createdAt', 'ASC']],
                            transaction: t
                        });

                        for (let i = 0; i < tasksToReset.length; i++) {
                            tasksToReset[i].is_completed = false;
                            if (tasksToReset[i].completed !== undefined) {
                                tasksToReset[i].completed = false;
                            }
                            await tasksToReset[i].save({ transaction: t });
                        }

                        await milestone.update({ 
                            status: 'unlocked'
                        }, { transaction: t });

                        // 4. Log Activity
                        await ActivityLog.create({
                            user_id: user.id,
                            action_type: 'penalty_applied',
                            xp_awarded: -xpDeducted
                        }, { transaction: t });
                        
                        // 5. Notify Partners/Friends
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
                                message: `System Alert: Your accountability partner ${user.username || 'your friend'} missed their task "${missedTasks[0].title}" on ${latestMissedDate} and received a ${challenge.penalty_mode.toUpperCase()} penalty.`
                            }, { transaction: t });
                        }
                    });
                    
                    console.log(`[PenaltyWorker] Penalty applied to user ${user.id} for challenge ${challenge.id}`);
                }
            }
        } catch (error) {
            console.error('[PenaltyWorker] Error:', error);
        }
    });
};

module.exports = { startPenaltyWorker };
