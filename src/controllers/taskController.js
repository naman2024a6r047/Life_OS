const { MilestoneTask, ActivityLog, User } = require('../models');
const { Op } = require('sequelize');

exports.toggleTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await MilestoneTask.findByPk(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (!task.is_completed) {

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
            await User.increment({ xp: xpReward }, { where: { id: req.user.id } });
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
        const { title, priority, energy_level, estimated_minutes, date } = req.body;

        const task = await MilestoneTask.findByPk(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (title) task.title = title;
        if (priority) task.priority = priority;
        if (energy_level) task.energy_level = energy_level;
        if (estimated_minutes) task.estimated_minutes = estimated_minutes;
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
        const { milestone_id, title, priority, energy_level, estimated_minutes, date } = req.body;
        if (!milestone_id || !title) {
            return res.status(400).json({ message: 'Milestone ID and title are required' });
        }

        const task = await MilestoneTask.create({
            milestone_id,
            title,
            priority: priority || 'P1',
            energy_level: energy_level || 'high',
            estimated_minutes: estimated_minutes || 30,
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
