const { ActivityLog, User, CalendarEvent, MilestoneTask, Milestone, Challenge } = require('../models');
const { Op } = require('sequelize');

exports.getCalendarEvents = async (req, res) => {
    try {
        const events = await CalendarEvent.findAll({
            where: { user_id: req.user.id },
            order: [['date', 'ASC'], ['time', 'ASC']]
        });

        const tasks = await MilestoneTask.findAll({
            where: { date: { [Op.not]: null } },
            include: [{
                model: Milestone,
                required: true,
                include: [{
                    model: Challenge,
                    required: true,
                    where: { user_id: req.user.id }
                }]
            }]
        });

        const taskEvents = tasks.map(task => ({
            id: task.id,
            title: task.title,
            block_type: 'task',
            date: task.date,
            time: 'All Day',
            category: 'Goal Task',
            completed: task.is_completed,
            color: '#F59E0B',
            isTask: true
        }));

        res.status(200).json([...events, ...taskEvents]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching calendar events' });
    }
};

exports.createCalendarEvent = async (req, res) => {
    try {
        const { title, block_type, date, time, category, color } = req.body;
        const newEvent = await CalendarEvent.create({
            user_id: req.user.id,
            title: title || 'New Time Block',
            block_type: block_type || 'deep_work',
            date: date || new Date(),
            time: time || '09:00 - 10:00 AM',
            category: category || 'General',
            completed: false,
            color: color || '#4F46E5'
        });
        res.status(201).json(newEvent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating calendar event' });
    }
};

exports.toggleCalendarEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await CalendarEvent.findOne({ where: { id, user_id: req.user.id } });
        if (event) {
            event.completed = !event.completed;
            await event.save();
            
            if (event.completed) {
                await ActivityLog.create({
                    user_id: req.user.id,
                    action_type: 'calendar_block_completed',
                    xp_awarded: 25
                });
                await User.increment({ xp: 25 }, { where: { id: req.user.id } });
            }
            return res.status(200).json(event);
        }
        res.status(404).json({ message: 'Time block not found' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating calendar event' });
    }
};

exports.logFocusSession = async (req, res) => {
    try {
        const { duration_minutes, block_type } = req.body;
        // In a real app we might have a FocusSession model, using ActivityLog for now
        await ActivityLog.create({
            user_id: req.user.id,
            action_type: 'focus_session_completed',
            xp_awarded: 50
        });
        await User.increment({ xp: 50 }, { where: { id: req.user.id } });

        res.status(201).json({ message: 'Focus session logged successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging focus session' });
    }
};
