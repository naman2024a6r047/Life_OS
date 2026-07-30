const { MilestoneTask, ActivityLog, User } = require('../models');
const { Op } = require('sequelize');

exports.toggleTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await MilestoneTask.findByPk(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.is_completed = !task.is_completed;
        await task.save();

        if (task.is_completed) {
            const xpReward = task.priority === 'P1' ? 30 : task.priority === 'P2' ? 20 : 10;
            await ActivityLog.create({
                user_id: req.user.id,
                action_type: 'daily_task_completed',
                xp_awarded: xpReward
            });

            // --- Level-Up Logic ---
            const user = await User.findByPk(req.user.id);
            let newXP = (user.xp || 0) + xpReward;
            let newLevel = user.level || 1;

            // Check level up (XP threshold = Level * 100)
            while (newXP >= newLevel * 100) {
                newXP -= newLevel * 100;
                newLevel += 1;
            }

            // --- Streak Logic ---
            // Check if user had any activity yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            const yesterdayEnd = new Date(yesterday);
            yesterdayEnd.setHours(23, 59, 59, 999);

            const yesterdayActivity = await ActivityLog.findOne({
                where: {
                    user_id: req.user.id,
                    createdAt: { [Op.between]: [yesterday, yesterdayEnd] }
                }
            });

            let newStreak = user.current_streak || 0;

            // Check if we already counted today's activity for streak
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const todayActivityCount = await ActivityLog.count({
                where: {
                    user_id: req.user.id,
                    action_type: 'daily_task_completed',
                    createdAt: { [Op.between]: [todayStart, todayEnd] }
                }
            });

            // Only update streak on the FIRST task completion of the day
            if (todayActivityCount <= 1) {
                if (yesterdayActivity) {
                    newStreak = newStreak + 1;
                } else {
                    newStreak = 1; // Reset streak, but today counts as day 1
                }
            }

            const newLongestStreak = Math.max(user.longest_streak || 0, newStreak);

            await user.update({
                xp: newXP,
                level: newLevel,
                current_streak: newStreak,
                longest_streak: newLongestStreak
            });
        }

        res.status(200).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error toggling daily task' });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, priority, energy_level, estimated_minutes, hours, actual_hours, date } = req.body;

        const task = await MilestoneTask.findByPk(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (title) task.title = title;
        if (priority) task.priority = priority;
        if (energy_level) task.energy_level = energy_level;
        if (estimated_minutes) task.estimated_minutes = estimated_minutes;
        if (hours !== undefined) task.hours = hours;
        if (actual_hours !== undefined) task.actual_hours = actual_hours;
        if (date) task.date = date;

        await task.save();
        res.status(200).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating task' });
    }
};

exports.createTask = async (req, res) => {
    try {
        const { milestone_id, title, priority, energy_level, estimated_minutes, hours, date } = req.body;
        if (!milestone_id || !title) {
            return res.status(400).json({ message: 'Milestone ID and title are required' });
        }

        const task = await MilestoneTask.create({
            milestone_id,
            title,
            priority: priority || 'P1',
            energy_level: energy_level || 'high',
            estimated_minutes: estimated_minutes || 30,
            hours: hours || 0,
            date: date || new Date().toISOString().split('T')[0],
            is_completed: false
        });

        res.status(201).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating task' });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await MilestoneTask.findByPk(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        await task.destroy();
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting task' });
    }
};
