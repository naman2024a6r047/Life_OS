const { Challenge, Milestone, MilestoneTask } = require('../models');

// Helper to add days
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

exports.createChallenge = async (req, res) => {
    try {
        const { title, description, category, start_date, end_date, visibility, difficulty, penalty_rule, color, icon } = req.body;
        
        const challenge = await Challenge.create({
            user_id: req.user.id,
            title,
            description,
            category,
            start_date,
            end_date,
            visibility,
            difficulty,
            penalty_rule,
            color,
            icon
        });

        // Auto-generate Milestones (10 days each)
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        const durationInTime = endDate.getTime() - startDate.getTime();
        const durationInDays = Math.ceil(durationInTime / (1000 * 3600 * 24));
        
        const milestoneCount = Math.ceil(durationInDays / 10) || 1;
        const milestones = [];

        for (let i = 0; i < milestoneCount; i++) {
            const mStart = addDays(startDate, i * 10);
            let mEnd = addDays(startDate, (i * 10) + 9);
            if (mEnd > endDate) mEnd = endDate;
            
            milestones.push({
                challenge_id: challenge.id,
                title: `Milestone ${i + 1}`,
                start_date: mStart,
                deadline: mEnd,
                status: i === 0 ? 'unlocked' : 'locked'
            });
        }

        const createdMilestones = await Milestone.bulkCreate(milestones);

        // Pre-populate tasks for the first milestone
        const tasks = [];
        const m1 = createdMilestones[0];
        const m1Days = Math.ceil((new Date(m1.deadline).getTime() - new Date(m1.start_date).getTime()) / (1000 * 3600 * 24)) + 1;
        
        for (let j = 0; j < m1Days; j++) {
            tasks.push({
                milestone_id: m1.id,
                title: `Daily Task - Day ${j + 1}`,
                date: addDays(m1.start_date, j)
            });
        }
        await MilestoneTask.bulkCreate(tasks);

        res.status(201).json(challenge);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating challenge' });
    }
};

exports.getChallenges = async (req, res) => {
    try {
        const challenges = await Challenge.findAll({
            where: { user_id: req.user.id },
            include: [{ model: Milestone, as: 'milestones' }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(challenges);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching challenges' });
    }
};

exports.getChallenge = async (req, res) => {
    try {
        const challenge = await Challenge.findOne({
            where: { id: req.params.id, user_id: req.user.id },
            include: [
                { 
                    model: Milestone, 
                    as: 'milestones',
                    include: [{ model: MilestoneTask, as: 'tasks' }]
                }
            ],
            order: [
                [{ model: Milestone, as: 'milestones' }, 'start_date', 'ASC'],
                [{ model: Milestone, as: 'milestones' }, { model: MilestoneTask, as: 'tasks' }, 'date', 'ASC']
            ]
        });

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        res.status(200).json(challenge);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching challenge' });
    }
};

exports.deleteChallenge = async (req, res) => {
    try {
        const { id } = req.params;
        const challenge = await Challenge.findOne({
            where: { id, user_id: req.user.id }
        });

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        // Clean up linked milestones and tasks
        const milestones = await Milestone.findAll({ where: { challenge_id: id } });
        const milestoneIds = milestones.map(m => m.id);
        if (milestoneIds.length > 0) {
            await MilestoneTask.destroy({ where: { milestone_id: milestoneIds } });
            await Milestone.destroy({ where: { challenge_id: id } });
        }

        await challenge.destroy();
        res.status(200).json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Delete challenge error:', error);
        res.status(500).json({ message: 'Error deleting challenge' });
    }
};

exports.addMilestone = async (req, res) => {
    try {
        const { challenge_id, title, start_date, deadline } = req.body;
        if (!challenge_id || !title) {
            return res.status(400).json({ message: 'Challenge ID and title are required' });
        }

        const milestone = await Milestone.create({
            challenge_id,
            title,
            start_date: start_date || new Date(),
            deadline: deadline || new Date(Date.now() + 7 * 86400000),
            status: 'unlocked'
        });

        res.status(201).json(milestone);
    } catch (error) {
        console.error('Add milestone error:', error);
        res.status(500).json({ message: 'Error adding milestone' });
    }
};

exports.deleteMilestone = async (req, res) => {
    try {
        const { id } = req.params;
        const milestone = await Milestone.findByPk(id);
        if (!milestone) {
            return res.status(404).json({ message: 'Milestone not found' });
        }
        await MilestoneTask.destroy({ where: { milestone_id: id } });
        await milestone.destroy();
        res.status(200).json({ message: 'Milestone deleted successfully' });
    } catch (error) {
        console.error('Delete milestone error:', error);
        res.status(500).json({ message: 'Error deleting milestone' });
    }
};
