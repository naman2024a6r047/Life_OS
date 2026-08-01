const { Challenge, Milestone, MilestoneTask, ActivityLog } = require('../models');

// Helper to add days
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const evaluateChallengePenalty = async (challenge) => {
    if (!challenge || challenge.status !== 'active') return { warning: false, applied: false };
    if (!challenge.penalty_mode || challenge.penalty_mode === 'easy') return { warning: false, applied: false };
    if (!challenge.milestones || challenge.milestones.length === 0) return { warning: false, applied: false };

    let activeMilestone = null;
    let activeMilestoneIndex = -1;
    for (let i = 0; i < challenge.milestones.length; i++) {
        if (challenge.milestones[i].status === 'in_progress' || challenge.milestones[i].status === 'pending') {
            activeMilestone = challenge.milestones[i];
            activeMilestoneIndex = i;
            break;
        }
    }
    
    if (!activeMilestone || !activeMilestone.tasks || activeMilestone.tasks.length === 0) return { warning: false, applied: false };

    const tasksByDate = {};
    activeMilestone.tasks.forEach(task => {
        if (task.date) {
            if (!tasksByDate[task.date]) tasksByDate[task.date] = [];
            tasksByDate[task.date].push(task);
        }
    });

    const today = new Date();
    today.setHours(0,0,0,0);

    const sortedDates = Object.keys(tasksByDate).sort((a,b) => new Date(b) - new Date(a));
    const pastDates = sortedDates.filter(d => {
        const [y, m, day] = d.split('-');
        const tDate = new Date(y, m - 1, day);
        return tDate < today;
    });

    let consecutiveMisses = 0;
    for (const d of pastDates) {
        const dayTasks = tasksByDate[d];
        const allCompleted = dayTasks.every(t => t.is_completed);
        if (!allCompleted) {
            consecutiveMisses++;
        } else {
            break;
        }
    }

    const threshold = challenge.penalty_mode === 'hard' ? 1 : 2;
    let applied = false;
    let warning = false;

    if (consecutiveMisses >= threshold) {
        const activeTasksSorted = activeMilestone.tasks.filter(t=>t.date).sort((a,b) => new Date(a.date) - new Date(b.date));
        if (activeTasksSorted.length > 0) {
            const firstDateStr = activeTasksSorted[0].date;
            const [y, m, d] = firstDateStr.split('-');
            const originalStartDate = new Date(y, m - 1, d);
            const diffDays = Math.round((today - originalStartDate) / (1000 * 60 * 60 * 24));

            for (const task of activeMilestone.tasks) {
                const updates = { is_completed: false };
                if (diffDays !== 0 && task.date) {
                    const [ty, tm, td] = task.date.split('-');
                    const tDate = new Date(ty, tm - 1, td);
                    tDate.setDate(tDate.getDate() + diffDays);
                    // format YYYY-MM-DD local
                    const yy = tDate.getFullYear();
                    const mm = String(tDate.getMonth() + 1).padStart(2, '0');
                    const dd = String(tDate.getDate()).padStart(2, '0');
                    updates.date = `${yy}-${mm}-${dd}`;
                }
                await require('../models/MilestoneTask').update(updates, { where: { id: task.id } });
            }

            for (let i = activeMilestoneIndex + 1; i < challenge.milestones.length; i++) {
                const ms = challenge.milestones[i];
                if (ms.tasks && diffDays !== 0) {
                    for (const task of ms.tasks) {
                        if (task.date) {
                            const [ty, tm, td] = task.date.split('-');
                            const tDate = new Date(ty, tm - 1, td);
                            tDate.setDate(tDate.getDate() + diffDays);
                            const yy = tDate.getFullYear();
                            const mm = String(tDate.getMonth() + 1).padStart(2, '0');
                            const dd = String(tDate.getDate()).padStart(2, '0');
                            await require('../models/MilestoneTask').update({ date: `${yy}-${mm}-${dd}` }, { where: { id: task.id } });
                        }
                    }
                }
            }

            try {
                await require('../models/ActivityLog').create({
                    user_id: challenge.user_id,
                    action_type: 'PENALTY_TRIGGERED',
                    xp_awarded: 0
                });
            } catch (e) {}
            
            applied = true;
        }
    } else if (consecutiveMisses === threshold - 1 && threshold > 1) {
        warning = true;
    }

    return { warning, applied };
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
    let daysGap = 0; // New: track gap between days
    const currentYear = new Date().getFullYear();

    lines.forEach(rawLine => {
        const line = rawLine.trim();
        if (!line) return;

        // Detect Gap syntax (e.g., "days gap[1]", "day gap [2]")
        const gapMatch = line.match(/^days?\s*gap\s*\[(\d+)\]/i);
        if (gapMatch) {
            daysGap = parseInt(gapMatch[1], 10);
            return;
        }

        // Detect Day Header (e.g. 📅 Day 1, Day 1, Day 01, Day-1, DAY 1)
        // Optionally capture explicit dates in parentheses: 📅 Day 1 (Sun, Aug 2)
        const dayMatch = line.match(/^(?:📅\s*)?Day[\s\-]*(\d+)(?:\s*\((.*?)\))?/i);
        if (dayMatch) {
            const rawDayNum = parseInt(dayMatch[1], 10);
            const dateStr = dayMatch[2];
            let explicitDate = null;

            if (dateStr) {
                const cleanDateStr = dateStr.replace(/^[A-Za-z]+,\s*/, '').trim(); 
                const nativeDate = new Date(`${cleanDateStr}, ${currentYear}`);
                if (!isNaN(nativeDate.getTime())) {
                    // format as YYYY-MM-DD in local time
                    const offset = nativeDate.getTimezoneOffset()
                    const localDate = new Date(nativeDate.getTime() - (offset*60*1000))
                    explicitDate = localDate.toISOString().split('T')[0];
                }
            }

            // Apply the gap multiplier
            const actualDayNum = 1 + (rawDayNum - 1) * (1 + daysGap);
            
            currentDay = {
                dayNum: actualDayNum,
                explicitDateStr: dateStr ? dateStr.trim() : null,
                explicitDate,
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
        const { title, description, category, start_date, end_date, visibility, difficulty, penalty_mode, penalty_rule, color, icon, raw_curriculum, daily_minutes } = req.body;
        
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
            penalty_mode: penalty_mode || 'easy',
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
        const allTasks = []; console.log('parsedDays:', JSON.stringify(parsedDays)); console.log('milestones length:', milestones.length);

        createdMilestones.forEach((milestone, idx) => {
            const milestoneStartDay = idx * 10 + 1;
            const milestoneEndDay = (idx + 1) * 10;

            for (let dNum = milestoneStartDay; dNum <= Math.min(calculatedDuration, milestoneEndDay); dNum++) {
                const dayOffsetIndex = dNum - 1;
                const dayData = parsedDays.find(pd => pd.dayNum === dNum);
                
                const taskDate = (dayData && dayData.explicitDate) ? new Date(dayData.explicitDate) : addDays(startDate, dayOffsetIndex);

                const targetDailyMins = Number(daily_minutes) || 45;

                if (dayData && dayData.tasks.length > 0) {
                    const taskMins = Math.round(targetDailyMins / dayData.tasks.length);
                    dayData.tasks.forEach((t, tIdx) => {
                        allTasks.push({
                            milestone_id: milestone.id,
                            title: t.title,
                            priority: tIdx < 3 ? 'P1' : 'P2',
                            estimated_minutes: taskMins,
                            date: taskDate
                        });
                    });
                } else {
                    allTasks.push({
                        milestone_id: milestone.id,
                        title: `Daily Task - Day ${dNum}`,
                        priority: 'P1',
                        estimated_minutes: targetDailyMins,
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
        const { raw_curriculum, milestone_index } = req.body;

        const challenge = await Challenge.findOne({
            where: { id, user_id: req.user.id },
            include: [{ model: Milestone, as: 'milestones' }],
            order: [
                [{ model: Milestone, as: 'milestones' }, 'start_date', 'ASC']
            ]
        });

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        let parsedDays = parseRawCurriculum(raw_curriculum);
        if (parsedDays.length === 0) {
            return res.status(400).json({ message: 'No valid day data detected in text' });
        }

        let milestones = challenge.milestones || [];

        // Apply offset if importing to a specific milestone but the text starts from Day 1
        const offsetDays = (milestone_index !== undefined ? milestone_index : 0) * 10;
        const isPastedFromDay1 = parsedDays.some(pd => pd.dayNum <= 10);
        if (milestone_index !== undefined && isPastedFromDay1 && offsetDays > 0) {
            parsedDays = parsedDays.map(pd => ({
                ...pd,
                dayNum: pd.dayNum + offsetDays
            }));
        }

        // Determine how many milestones we need based on the max dayNum
        const maxDayNum = Math.max(...parsedDays.map(pd => pd.dayNum));
        const requiredMilestoneCount = Math.max(milestones.length, Math.ceil(maxDayNum / 10));

        // Create any missing milestones automatically
        if (requiredMilestoneCount > milestones.length) {
            const startDate = new Date(challenge.start_date || new Date());
            const newMilestones = [];
            for (let i = milestones.length; i < requiredMilestoneCount; i++) {
                const mStart = addDays(startDate, i * 10);
                const mEnd = addDays(startDate, (i * 10) + 9);
                newMilestones.push({
                    challenge_id: challenge.id,
                    title: `Milestone ${i + 1}`,
                    start_date: mStart,
                    deadline: mEnd,
                    status: i === 0 ? 'unlocked' : 'locked'
                });
            }
            if (newMilestones.length > 0) {
                const createdMilestones = await Milestone.bulkCreate(newMilestones);
                milestones = [...milestones, ...createdMilestones];
            }
        }

        let targetMilestone = null;
        if (milestone_index !== undefined && milestones[milestone_index]) {
            targetMilestone = milestones[milestone_index];
            await MilestoneTask.destroy({ where: { milestone_id: targetMilestone.id } });
        } else {
            const milestoneIds = milestones.map(m => m.id);
            if (milestoneIds.length > 0) {
                await MilestoneTask.destroy({ where: { milestone_id: milestoneIds } });
            }
        }

        const startDate = new Date(challenge.start_date || new Date());
        const allTasks = [];

        // Universal parsing: just iterate over parsed days, find their milestone, and add them
        parsedDays.forEach(dayData => {
            const targetMilestoneIdx = Math.floor((dayData.dayNum - 1) / 10);
            const targetMs = milestones[targetMilestoneIdx];
            
            if (targetMs && dayData.tasks.length > 0) {
                const dayOffsetIndex = dayData.dayNum - 1;
<<<<<<< HEAD
                let taskDate = addDays(startDate, dayOffsetIndex);
                
                // Override with explicit date if provided and valid
                if (dayData.explicitDateStr) {
                    const parsedExplicitDate = new Date(`${dayData.explicitDateStr} ${startDate.getFullYear()}`);
                    if (!isNaN(parsedExplicitDate.getTime())) {
                        taskDate = parsedExplicitDate;
                    } else {
                        // Fallback parsing just the raw string
                        const rawParsed = new Date(dayData.explicitDateStr);
                        if (!isNaN(rawParsed.getTime())) {
                            taskDate = rawParsed;
                        }
                    }
                }
=======
                const taskDate = (dayData && dayData.explicitDate) ? new Date(dayData.explicitDate) : addDays(startDate, dayOffsetIndex);
>>>>>>> 893eff0 (Support parsing and assigning explicit dates from raw curriculum)

                dayData.tasks.forEach((t, tIdx) => {
                    allTasks.push({
                        milestone_id: targetMs.id,
                        title: t.title,
                        priority: tIdx < 3 ? 'P1' : 'P2',
                        date: taskDate
                    });
                });
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
