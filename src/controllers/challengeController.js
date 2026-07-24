const { Challenge, Milestone, MilestoneTask } = require('../models');

// Helper to add days
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

// Helper to parse multi-day raw curriculum text into structured day & task objects
const cleanChecklistPrefix = (str) => {
    if (!str) return '';
    let result = str.replace(/^[\s\u2610\u2611\u2612\u25A0\u25A1\u25A2\u25A3\u2705\u274C\u2022\-\*\•]+/, '').trim();
    result = result.replace(/^\[\s*\]\s*/, '').replace(/^\[x\]\s*/i, '').trim();
    return result;
};

const parseRawCurriculum = (text) => {
    if (!text || !text.trim()) return [];

    const lines = text.split('\n');
    const days = [];
    let currentDay = null;
    let currentCategory = 'General';

    lines.forEach(rawLine => {
        const line = rawLine.trim();
        if (!line) return;

        // Detect Day Header (e.g. 📅 Day 1, Day 1, Day 01, Day-1, DAY 1)
        const dayMatch = line.match(/(?:📅\s*)?Day[\s\-]*(\d+)/i);
        if (dayMatch) {
            const dayNum = parseInt(dayMatch[1], 10);
            currentDay = {
                dayNum,
                tasks: []
            };
            days.push(currentDay);
            currentCategory = 'General';
            return;
        }

        // If no Day header has been found yet, auto-create Day 1
        if (!currentDay) {
            currentDay = {
                dayNum: 1,
                tasks: []
            };
            days.push(currentDay);
        }

        const cleanTitle = cleanChecklistPrefix(line);

        if (cleanTitle && cleanTitle !== line) {
            // Checklist item detected
            currentDay.tasks.push({
                title: currentCategory !== 'General' ? `${currentCategory}: ${cleanTitle}` : cleanTitle,
                category: currentCategory
            });
        } else {
            // Category header check or plain task fallback
            if (line.length < 45 && !line.includes(':') && !line.startsWith('http') && !line.toLowerCase().startsWith('sprint review')) {
                currentCategory = line;
            } else {
                currentDay.tasks.push({
                    title: currentCategory !== 'General' ? `${currentCategory}: ${cleanTitle || line}` : (cleanTitle || line),
                    category: currentCategory
                });
            }
        }
    });

    return days;
};

exports.createChallenge = async (req, res) => {
    try {
        const { title, description, category, start_date, end_date, visibility, difficulty, penalty_rule, color, icon, raw_curriculum } = req.body;
        
        let parsedDays = [];
        if (raw_curriculum) {
            parsedDays = parseRawCurriculum(raw_curriculum);
        }

        const calculatedDuration = parsedDays.length > 0 ? Math.max(parsedDays.length, Number(req.body.duration_days) || 10) : (Number(req.body.duration_days) || 30);
        const startDate = new Date(start_date || new Date());
        const endDate = new Date(startDate.getTime() + (calculatedDuration - 1) * 86400000);

        const challenge = await Challenge.create({
            user_id: req.user.id,
            title: title || (parsedDays.length > 0 ? `Full Stack & AI ${calculatedDuration}-Day Challenge` : 'New Challenge'),
            description: description || (parsedDays.length > 0 ? `Auto-generated ${calculatedDuration}-day curriculum with multi-track daily tasks.` : ''),
            category: category || 'Learning',
            start_date: startDate,
            end_date: endDate,
            visibility,
            difficulty,
            penalty_rule,
            color: color || '#6366F1',
            icon
        });

        // Auto-generate Milestones (10 days each)
        const milestoneCount = Math.ceil(calculatedDuration / 10) || 1;
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

        // Populate tasks across all created milestones
        const allTasks = [];

        createdMilestones.forEach((milestone, idx) => {
            const milestoneStartDay = idx * 10 + 1;
            const milestoneEndDay = (idx + 1) * 10;

            for (let dNum = milestoneStartDay; dNum <= Math.min(calculatedDuration, milestoneEndDay); dNum++) {
                const dayOffsetIndex = dNum - 1;
                const taskDate = addDays(startDate, dayOffsetIndex);
                const dayData = parsedDays.find(pd => pd.dayNum === dNum);

                if (dayData && dayData.tasks.length > 0) {
                    dayData.tasks.forEach((t, tIdx) => {
                        allTasks.push({
                            milestone_id: milestone.id,
                            title: t.title,
                            priority: tIdx < 3 ? 'P1' : 'P2',
                            date: taskDate
                        });
                    });
                } else {
                    allTasks.push({
                        milestone_id: milestone.id,
                        title: `Daily Task - Day ${dNum}`,
                        priority: 'P1',
                        date: taskDate
                    });
                }
            }
        });

        if (allTasks.length > 0) {
            await MilestoneTask.bulkCreate(allTasks);
        }

        res.status(201).json(challenge);
    } catch (error) {
        console.error('Error creating challenge:', error);
        res.status(500).json({ message: 'Error creating challenge' });
    }
};

exports.getChallenges = async (req, res) => {
    try {
        const challenges = await Challenge.findAll({
            where: { user_id: req.user.id },
            include: [
                {
                    model: Milestone,
                    as: 'milestones',
                    include: [{ model: MilestoneTask, as: 'tasks' }]
                }
            ],
            order: [
                ['createdAt', 'DESC'],
                [{ model: Milestone, as: 'milestones' }, 'start_date', 'ASC'],
                [{ model: Milestone, as: 'milestones' }, { model: MilestoneTask, as: 'tasks' }, 'date', 'ASC']
            ]
        });
        res.status(200).json(challenges);
    } catch (error) {
        console.error('Error fetching challenges:', error);
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

exports.updateChallenge = async (req, res) => {
    try {
        const { id } = req.params;
        const challenge = await Challenge.findOne({ where: { id, user_id: req.user.id } });
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        await challenge.update(req.body);
        res.status(200).json(challenge);
    } catch (error) {
        console.error('Update challenge error:', error);
        res.status(500).json({ message: 'Error updating challenge' });
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

exports.importCurriculum = async (req, res) => {
    try {
        const { id } = req.params;
        const { raw_curriculum } = req.body;

        const challenge = await Challenge.findOne({
            where: { id, user_id: req.user.id },
            include: [{ model: Milestone, as: 'milestones' }]
        });

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        const parsedDays = parseRawCurriculum(raw_curriculum);
        if (parsedDays.length === 0) {
            return res.status(400).json({ message: 'No valid day data detected in text' });
        }

        let milestones = challenge.milestones || [];

        // If challenge has no milestones, create them automatically
        if (milestones.length === 0) {
            const startDate = new Date(challenge.start_date || new Date());
            const milestoneCount = Math.ceil(parsedDays.length / 10) || 1;
            const newMilestones = [];

            for (let i = 0; i < milestoneCount; i++) {
                const mStart = addDays(startDate, i * 10);
                let mEnd = addDays(startDate, (i * 10) + 9);
                newMilestones.push({
                    challenge_id: challenge.id,
                    title: `Milestone ${i + 1}`,
                    start_date: mStart,
                    deadline: mEnd,
                    status: i === 0 ? 'unlocked' : 'locked'
                });
            }
            milestones = await Milestone.bulkCreate(newMilestones);
        }

        const milestoneIds = milestones.map(m => m.id);
        if (milestoneIds.length > 0) {
            await MilestoneTask.destroy({ where: { milestone_id: milestoneIds } });
        }

        const startDate = new Date(challenge.start_date || new Date());
        const allTasks = [];

        milestones.forEach((milestone, idx) => {
            const milestoneStartDay = idx * 10 + 1;
            const milestoneEndDay = (idx + 1) * 10;

            for (let dNum = milestoneStartDay; dNum <= Math.min(parsedDays.length, milestoneEndDay); dNum++) {
                const dayOffsetIndex = dNum - 1;
                const taskDate = addDays(startDate, dayOffsetIndex);
                const dayData = parsedDays.find(pd => pd.dayNum === dNum);

                if (dayData && dayData.tasks.length > 0) {
                    dayData.tasks.forEach((t, tIdx) => {
                        allTasks.push({
                            milestone_id: milestone.id,
                            title: t.title,
                            priority: tIdx < 3 ? 'P1' : 'P2',
                            date: taskDate
                        });
                    });
                }
            }
        });

        if (allTasks.length > 0) {
            await MilestoneTask.bulkCreate(allTasks);
        }

        res.status(200).json({ message: 'Curriculum imported successfully', taskCount: allTasks.length });
    } catch (error) {
        console.error('Import curriculum error:', error);
        res.status(500).json({ message: 'Error importing curriculum' });
    }
};
