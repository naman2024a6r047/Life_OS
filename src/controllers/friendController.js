const { Friend, User } = require('../models');
const { Op } = require('sequelize');
const { seedDemoPartnerForUser } = require('../utils/partnerSeeder');

exports.sendRequest = async (req, res) => {
    try {
        if (req.user.is_in_exam_mode) {
            return res.status(403).json({ message: "Exam Shield is active. Cannot send friend requests during Exam Mode." });
        }

        const { friend_id } = req.body;
        if (req.user.id === friend_id) return res.status(400).json({ message: "Cannot add yourself" });
        
        let request = await Friend.findOne({
            where: {
                [Op.or]: [
                    { user_id: req.user.id, friend_id },
                    { user_id: friend_id, friend_id: req.user.id }
                ]
            }
        });

        if (request) {
            request.status = 'accepted';
            await request.save();
        } else {
            request = await Friend.create({
                user_id: req.user.id,
                friend_id,
                status: 'accepted'
            });
        }

        res.status(201).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending request' });
    }
};

exports.connectDemoPartner = async (req, res) => {
    try {
        let demoPartner = await User.findOne({ where: { username: 'alex_partner' } });
        if (!demoPartner) {
            demoPartner = await User.create({
                username: 'alex_partner',
                email: 'alex_partner@lifeos.dev',
                password: 'demopartnerpassword123',
                level: 4,
                xp: 1850,
                current_streak: 12,
                discipline_score: 92
            });
        }

        if (demoPartner.id === req.user.id) {
            return res.status(400).json({ message: "Demo partner cannot be yourself" });
        }

        const existing = await Friend.findOne({
            where: {
                [Op.or]: [
                    { user_id: req.user.id, friend_id: demoPartner.id },
                    { user_id: demoPartner.id, friend_id: req.user.id }
                ]
            }
        });

        if (existing) {
            existing.status = 'accepted';
            await existing.save();
        } else {
            await Friend.create({
                user_id: req.user.id,
                friend_id: demoPartner.id,
                status: 'accepted'
            });
        }

        res.status(200).json({ message: 'Demo partner @alex_partner connected successfully!' });
    } catch (error) {
        console.error('Error connecting demo partner:', error);
        res.status(500).json({ message: 'Error connecting demo partner' });
    }
};

exports.acceptRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await Friend.findOne({ where: { id, friend_id: req.user.id } });
        
        if (!request) return res.status(404).json({ message: "Request not found" });

        request.status = 'accepted';
        await request.save();

        res.status(200).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error accepting request' });
    }
};

exports.getFriends = async (req, res) => {
    try {
        const users = await User.findAll({
            where: {
                id: { [Op.ne]: req.user.id },
                email: { [Op.notLike]: '%@lifeos.dev' }
            },
            attributes: ['id', 'username', 'avatar_url', 'level', 'xp', 'current_streak', 'discipline_score', 'email']
        });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching friends' });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        const whereClause = {
            id: { [Op.ne]: req.user.id },
            email: { [Op.notLike]: '%@lifeos.dev' }
        };

        if (q && q.trim()) {
            whereClause.username = { [Op.iLike || Op.like]: `%${q.trim()}%` };
        }

        const users = await User.findAll({
            where: whereClause,
            attributes: ['id', 'username', 'avatar_url', 'level', 'xp'],
            limit: 50,
            order: [['level', 'DESC'], ['username', 'ASC']]
        });

        // Fetch user's existing friend records to mark relationshipStatus
        const friendRecords = await Friend.findAll({
            where: {
                [Op.or]: [
                    { user_id: req.user.id },
                    { friend_id: req.user.id }
                ]
            }
        });

        const statusMap = {};
        friendRecords.forEach(f => {
            const partnerId = f.user_id === req.user.id ? f.friend_id : f.user_id;
            statusMap[partnerId] = f.status; // 'pending' or 'accepted'
        });

        const formattedUsers = users.map(u => {
            const uJson = u.toJSON();
            uJson.relationshipStatus = statusMap[u.id] || 'none';
            return uJson;
        });

        res.status(200).json(formattedUsers);
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'Error searching users' });
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        const requests = await Friend.findAll({
            where: {
                friend_id: req.user.id,
                status: 'pending'
            },
            include: [
                { 
                    model: User, 
                    as: 'requester', 
                    attributes: ['id', 'username', 'avatar_url', 'level', 'xp', 'email'],
                    where: { email: { [Op.notLike]: '%@lifeos.dev' } }
                }
            ]
        });
        res.status(200).json(requests);
    } catch (error) {
        console.error('Get pending requests error:', error);
        res.status(500).json({ message: 'Error fetching pending requests' });
    }
};

exports.rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await Friend.findOne({ where: { id, friend_id: req.user.id } });
        if (!request) return res.status(404).json({ message: "Request not found" });
        await request.destroy();
        res.status(200).json({ message: 'Request rejected' });
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({ message: 'Error rejecting request' });
    }
};

// Full Partner Telemetry & Inspection Endpoint (Accurate & Comprehensive)
exports.getPartnerTelemetry = async (req, res) => {
    try {
        const { friendId } = req.params;

        const partnerUser = await User.findByPk(friendId, {
            attributes: ['id', 'username', 'avatar_url', 'level', 'xp', 'current_streak', 'discipline_score', 'bio', 'createdAt', 'privacy_settings', 'is_in_exam_mode']
        });

        if (!partnerUser) {
            return res.status(404).json({ message: 'Partner account not found' });
        }

        const { 
            Challenge, Milestone, MilestoneTask, StudyLog, 
            ActivityLog, PartnerIntervention, WorkoutPlan, Skill, Penalty 
        } = require('../models');

        // Fetch partner's challenges with milestones & tasks
        const challenges = await Challenge.findAll({
            where: { user_id: friendId },
            include: [
                {
                    model: Milestone,
                    as: 'milestones',
                    include: [{ model: MilestoneTask, as: 'tasks' }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Extract all tasks and identify skipped/overdue items with accurate date/completion checking
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        // Calculate week & month boundaries
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

        const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

        const allTasks = [];
        const skippedTasks = [];
        const skippedMilestones = [];
        
        let completedTodayCount = 0;
        let completedWeekCount = 0;
        let completedMonthCount = 0;

        challenges.forEach(c => {
            if (c.milestones) {
                c.milestones.forEach(m => {
                    // Check overdue milestones
                    if (m.status !== 'completed' && m.deadline && new Date(m.deadline) < now) {
                        skippedMilestones.push({
                            id: m.id,
                            title: m.title,
                            challengeTitle: c.title,
                            deadline: m.deadline,
                            status: m.status
                        });
                    }

                    if (m.tasks) {
                        m.tasks.forEach(t => {
                            const isCompleted = t.is_completed !== undefined ? Boolean(t.is_completed) : Boolean(t.completed);
                            const taskDateStr = t.date ? new Date(t.date).toISOString().split('T')[0] : null;
                            const isPast = taskDateStr && taskDateStr < todayStr;

                            const taskItem = {
                                id: t.id,
                                title: t.title,
                                completed: isCompleted,
                                is_completed: isCompleted,
                                date: t.date,
                                priority: t.priority || 'P1',
                                challengeTitle: c.title,
                                milestoneTitle: m.title,
                                milestoneId: m.id
                            };

                            allTasks.push(taskItem);

                            if (isCompleted) {
                                if (taskDateStr === todayStr) completedTodayCount++;
                                if (taskDateStr && taskDateStr >= startOfWeekStr) completedWeekCount++;
                                if (taskDateStr && taskDateStr >= startOfMonthStr) completedMonthCount++;
                            }

                            if (!isCompleted && isPast) {
                                skippedTasks.push({
                                    id: t.id,
                                    title: t.title,
                                    date: t.date,
                                    challengeTitle: c.title,
                                    milestoneTitle: m.title,
                                    milestoneId: m.id
                                });
                            }
                        });
                    }
                });
            }
        });

        // Fetch study logs for focus analytics
        let totalStudyHours = '0.0';
        let studyLogCount = 0;
        try {
            const studyLogs = await StudyLog.findAll({
                where: {},
                order: [['createdAt', 'DESC']],
                limit: 50
            });
            studyLogCount = studyLogs.length;
            const totalStudyMinutes = studyLogs.reduce((acc, log) => acc + (log.duration_minutes || 0), 0);
            totalStudyHours = (totalStudyMinutes / 60).toFixed(1);
        } catch (e) { /* table fallback */ }

        // Fetch workout plans
        let workoutPlanCount = 0;
        try {
            workoutPlanCount = await WorkoutPlan.count({ where: { user_id: friendId } });
        } catch (e) { /* table fallback */ }

        // Fetch skills RPG tree
        let skillCount = 0;
        try {
            skillCount = await Skill.count({ where: { user_id: friendId } });
        } catch (e) { /* table fallback */ }

        // Fetch activity logs
        let activityLogs = [];
        try {
            activityLogs = await ActivityLog.findAll({
                where: { user_id: friendId },
                order: [['createdAt', 'DESC']],
                limit: 40
            });
        } catch (e) { /* table fallback */ }

        // Fetch penalties
        let penalties = [];
        try {
            penalties = await Penalty.findAll({
                where: { user_id: friendId },
                order: [['createdAt', 'DESC']]
            });
        } catch (e) { /* table fallback */ }

        // Fetch interventions between these two users
        let interventions = [];
        try {
            interventions = await PartnerIntervention.findAll({
                where: {
                    [Op.or]: [
                        { sender_id: req.user.id, receiver_id: friendId },
                        { sender_id: friendId, receiver_id: req.user.id }
                    ]
                },
                include: [
                    { model: User, as: 'sender', attributes: ['id', 'username', 'avatar_url'] },
                    { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar_url'] }
                ],
                order: [['createdAt', 'DESC']]
            });
        } catch (e) { /* table fallback */ }

        const privacy = partnerUser.privacy_settings || { show_goals: true, show_tasks: true, show_workouts: true, show_analytics: true, show_achievements: true };

        // Calculate metrics
        const totalCompleted = allTasks.filter(t => t.completed).length;
        const completionRate = allTasks.length > 0 ? Math.round((totalCompleted / allTasks.length) * 100) : 0;
        const activeChallengesCount = challenges.filter(c => c.status === 'active' || c.status === 'unlocked').length;

        if (partnerUser.is_in_exam_mode) {
            let exam_info = null;
            try {
                const { ExamSession } = require('../models');
                const session = await ExamSession.findOne({ where: { user_id: friendId, is_active: true } });
                if (session) exam_info = session;
            } catch (e) { console.error('Error fetching partner exam session', e); }

            return res.status(200).json({
                user: partnerUser,
                is_in_exam_mode: true,
                exam_info,
                interventions,
                stats: {},
                challenges: [],
                skippedTasks: [],
                skippedMilestones: [],
                activityLogs: [],
                penalties: []
            });
        }

        res.status(200).json({
            user: partnerUser,
            stats: {
                totalChallenges: privacy.show_goals ? challenges.length : 0,
                activeChallengesCount: privacy.show_goals ? activeChallengesCount : 0,
                totalTasks: privacy.show_tasks ? allTasks.length : 0,
                completedTasksCount: privacy.show_tasks ? totalCompleted : 0,
                completedTodayCount: privacy.show_tasks ? completedTodayCount : 0,
                completedWeekCount: privacy.show_tasks ? completedWeekCount : 0,
                completedMonthCount: privacy.show_tasks ? completedMonthCount : 0,
                skippedTasksCount: privacy.show_tasks ? skippedTasks.length : 0,
                skippedMilestonesCount: privacy.show_goals ? skippedMilestones.length : 0,
                completionRate: privacy.show_tasks ? completionRate : 0,
                totalStudyHours: privacy.show_analytics ? totalStudyHours : '0.0',
                studyLogCount: privacy.show_analytics ? studyLogCount : 0,
                workoutPlanCount: privacy.show_workouts ? workoutPlanCount : 0,
                skillCount: privacy.show_achievements ? skillCount : 0,
                totalPenalties: privacy.show_analytics ? penalties.length : 0
            },
            challenges: privacy.show_goals ? challenges : [],
            skippedTasks: privacy.show_tasks ? skippedTasks : [],
            skippedMilestones: privacy.show_goals ? skippedMilestones : [],
            activityLogs: privacy.show_analytics ? activityLogs : [],
            penalties: privacy.show_analytics ? penalties : [],
            interventions
        });
    } catch (error) {
        console.error('Get partner telemetry error:', error);
        res.status(500).json({ message: 'Error fetching partner telemetry' });
    }
};

// Helper to resolve the correct Milestone for a specific user by title, task title, or fallback
const resolveUserMilestone = async (targetUserId, itemTitle, milestoneId) => {
    const { Milestone, MilestoneTask, Challenge } = require('../models');

    if (milestoneId) {
        const m = await Milestone.findByPk(milestoneId);
        if (m) return m;
    }

    const challenges = await Challenge.findAll({
        where: { user_id: targetUserId },
        include: [{
            model: Milestone,
            as: 'milestones',
            include: [{ model: MilestoneTask, as: 'tasks' }]
        }]
    });

    if (!challenges || challenges.length === 0) return null;

    if (itemTitle) {
        const titleLower = itemTitle.trim().toLowerCase();
        for (const c of challenges) {
            if (c.milestones) {
                for (const m of c.milestones) {
                    if (m.title && m.title.trim().toLowerCase() === titleLower) {
                        return m;
                    }
                    if (m.tasks) {
                        for (const t of m.tasks) {
                            if (t.title && t.title.trim().toLowerCase() === titleLower) {
                                return m;
                            }
                        }
                    }
                }
            }
        }
    }

    for (const c of challenges) {
        if (c.milestones && c.milestones.length > 0) {
            return c.milestones[0];
        }
    }

    return null;
};

// Send Inquiry or Punishment to Partner (Auto-executes Milestone Reset if punishment)
exports.sendIntervention = async (req, res) => {
    try {
        const { receiver_id, item_type, item_title, type, message, punishment, auto_reset } = req.body;

        if (!receiver_id) {
            return res.status(400).json({ message: 'Receiver ID is required' });
        }

        const { PartnerIntervention, MilestoneTask } = require('../models');

        // Detect if this is a "Start Over Task 1 / Reset Milestone" punishment
        const isResetPunishment = auto_reset || 
            (type === 'punishment' && punishment && (
                punishment.toLowerCase().includes('start over') || 
                punishment.toLowerCase().includes('reset milestone') ||
                punishment.toLowerCase().includes('task 1')
            ));

        let resetExecuted = false;
        let resetMilestoneTitle = '';

        if (isResetPunishment) {
            const milestone = await resolveUserMilestone(receiver_id, item_title);

            if (milestone) {
                // Instantly reset all tasks for this milestone (uncheck progress)
                const tasks = await MilestoneTask.findAll({
                    where: { milestone_id: milestone.id },
                    order: [['createdAt', 'ASC']]
                });

                for (let i = 0; i < tasks.length; i++) {
                    tasks[i].is_completed = false;
                    await tasks[i].save();
                }

                milestone.status = 'unlocked';
                await milestone.save();

                resetExecuted = true;
                resetMilestoneTitle = milestone.title;
            }
        }

        const intervention = await PartnerIntervention.create({
            sender_id: req.user.id,
            receiver_id,
            item_type: item_type || 'task',
            item_title: item_title || 'Unspecified Task',
            type: type || 'inquiry',
            message: message || null,
            punishment: punishment || null,
            status: resetExecuted ? 'completed' : 'pending',
            user_response: resetExecuted ? `⚡ Instant Enforcement: Your partner restarted milestone "${resetMilestoneTitle}" to Day 1 starting today!` : null,
            sender_read: false
        });

        res.status(201).json({
            intervention,
            resetExecuted,
            message: resetExecuted 
                ? `Punishment Enforced! Milestone "${resetMilestoneTitle}" has been automatically reset to Day 1 starting today.`
                : (type === 'inquiry' ? 'Inquiry sent to partner.' : 'Punishment assigned to partner.')
        });
    } catch (error) {
        console.error('Send intervention error:', error);
        res.status(500).json({ message: error.message || 'Error sending partner intervention' });
    }
};

// Get User's All Alerts — incoming interventions + replies to sent ones
exports.getInterventions = async (req, res) => {
    try {
        const { PartnerIntervention } = require('../models');

        // Incoming: interventions sent TO this user
        const incoming = await PartnerIntervention.findAll({
            where: { receiver_id: req.user.id },
            include: [
                { model: User, as: 'sender', attributes: ['id', 'username', 'avatar_url', 'level'] },
                { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar_url'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Replies: interventions sent BY this user that have a response
        const repliedSent = await PartnerIntervention.findAll({
            where: { 
                sender_id: req.user.id,
                user_response: { [Op.ne]: null }
            },
            include: [
                { model: User, as: 'sender', attributes: ['id', 'username', 'avatar_url'] },
                { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar_url', 'level'] }
            ],
            order: [['updatedAt', 'DESC']]
        });

        // Tag each with direction for the frontend
        const incomingTagged = incoming.map(i => ({ ...i.toJSON(), direction: 'incoming' }));
        const repliedTagged = repliedSent.map(i => ({ ...i.toJSON(), direction: 'reply' }));

        // Merge and sort by most recent activity
        const all = [...incomingTagged, ...repliedTagged].sort((a, b) => 
            new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );

        res.status(200).json(all);
    } catch (error) {
        console.error('Get interventions error:', error);
        res.status(500).json({ message: 'Error fetching interventions' });
    }
};

// Get unread/pending count for badge
exports.getUnreadCount = async (req, res) => {
    try {
        const { PartnerIntervention } = require('../models');

        // Count pending incoming
        const pendingIncoming = await PartnerIntervention.count({
            where: { receiver_id: req.user.id, status: 'pending' }
        });

        // Count unread replies to sent interventions
        const unreadReplies = await PartnerIntervention.count({
            where: { 
                sender_id: req.user.id, 
                user_response: { [Op.ne]: null },
                sender_read: false
            }
        });

        res.status(200).json({ count: pendingIncoming + unreadReplies });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(200).json({ count: 0 });
    }
};

// Respond to an Inquiry or Mark Punishment Completed
exports.respondIntervention = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, user_response } = req.body;

        const { PartnerIntervention } = require('../models');

        const intervention = await PartnerIntervention.findOne({
            where: { id, receiver_id: req.user.id }
        });

        if (!intervention) {
            return res.status(404).json({ message: 'Intervention not found' });
        }

        if (status) intervention.status = status;
        if (user_response) intervention.user_response = user_response;
        // Reset sender_read so the sender gets notified of the reply
        intervention.sender_read = false;

        await intervention.save();

        res.status(200).json(intervention);
    } catch (error) {
        console.error('Respond intervention error:', error);
        res.status(500).json({ message: 'Error responding to intervention' });
    }
};

// Reset Milestone Tasks to Day 1 (Start over Task 1)
exports.resetMilestoneToDayOne = async (req, res) => {
    try {
        const { milestoneId, milestoneTitle, targetUserId } = req.body;
        const { MilestoneTask } = require('../models');

        const userIdToUse = targetUserId || req.user.id;
        const milestone = await resolveUserMilestone(userIdToUse, milestoneTitle, milestoneId);

        if (!milestone) {
            return res.status(404).json({ message: 'Milestone not found to reset' });
        }

        const tasks = await MilestoneTask.findAll({
            where: { milestone_id: milestone.id },
            order: [['createdAt', 'ASC']]
        });

        for (let i = 0; i < tasks.length; i++) {
            tasks[i].is_completed = false;
            await tasks[i].save();
        }

        milestone.status = 'unlocked';
        await milestone.save();

        res.status(200).json({ 
            message: `Milestone "${milestone.title}" restarted to Task 1! Tasks progress reset.`,
            milestone,
            taskCount: tasks.length
        });
    } catch (error) {
        console.error('Reset milestone error:', error);
        res.status(500).json({ message: 'Error resetting milestone to Day 1' });
    }
};

// Reset Milestone via Punishment/Intervention ID
exports.resetMilestoneFromIntervention = async (req, res) => {
    try {
        const { id } = req.params;
        const { PartnerIntervention, MilestoneTask } = require('../models');

        const intervention = await PartnerIntervention.findByPk(id);
        if (!intervention) {
            return res.status(404).json({ message: 'Intervention not found' });
        }

        const milestone = await resolveUserMilestone(intervention.receiver_id, intervention.item_title);

        if (!milestone) {
            return res.status(404).json({ message: 'No milestone found associated with this intervention' });
        }

        const tasks = await MilestoneTask.findAll({
            where: { milestone_id: milestone.id },
            order: [['createdAt', 'ASC']]
        });

        const today = new Date();
        for (let i = 0; i < tasks.length; i++) {
            tasks[i].is_completed = false;
            await tasks[i].save();
        }

        milestone.status = 'unlocked';
        await milestone.save();

        intervention.status = 'completed';
        intervention.user_response = `⚡ Punishment executed: Milestone "${milestone.title}" restarted to Task 1.`;
        intervention.sender_read = false;
        await intervention.save();

        res.status(200).json({ 
            message: `Punishment Executed: Milestone "${milestone.title}" restarted to Task 1!`,
            intervention,
            milestone
        });
    } catch (error) {
        console.error('Intervention milestone reset error:', error);
        res.status(500).json({ message: 'Error resetting milestone for intervention' });
    }
};

// Mark sent intervention replies as read
exports.markSentRead = async (req, res) => {
    try {
        const { PartnerIntervention } = require('../models');

        await PartnerIntervention.update(
            { sender_read: true },
            { where: { sender_id: req.user.id, sender_read: false, user_response: { [Op.ne]: null } } }
        );

        res.status(200).json({ message: 'Marked as read' });
    } catch (error) {
        console.error('Mark sent read error:', error);
        res.status(200).json({ message: 'ok' });
    }
};

exports.getFriendsFeed = async (req, res) => {
    try {
        const { ActivityLog } = require('../models');
        
        const friends = await Friend.findAll({
            where: {
                status: 'accepted',
                [Op.or]: [
                    { user_id: req.user.id },
                    { friend_id: req.user.id }
                ]
            }
        });

        const friendIds = friends.map(f => f.user_id === req.user.id ? f.friend_id : f.user_id);
        
        if (friendIds.length === 0) {
            return res.status(200).json([]);
        }

        const users = await User.findAll({
            where: { 
                id: { [Op.in]: friendIds },
                email: { [Op.notLike]: '%@lifeos.dev' }
            },
            attributes: ['id', 'username', 'avatar_url', 'level', 'privacy_settings']
        });
        
        // Filter out users who hide their feed/analytics
        const visibleUserIds = users.filter(u => {
            const p = u.privacy_settings || { show_analytics: true, show_achievements: true };
            return p.show_analytics !== false || p.show_achievements !== false;
        }).map(u => u.id);
        
        if (visibleUserIds.length === 0) {
            return res.status(200).json([]);
        }

        const feed = await ActivityLog.findAll({
            where: { user_id: { [Op.in]: visibleUserIds } },
            include: [{ model: User, attributes: ['id', 'username', 'avatar_url', 'level'] }],
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.status(200).json(feed);
    } catch (error) {
        console.error('Error fetching friends feed:', error);
        res.status(500).json({ message: 'Error fetching feed' });
    }
};

exports.updatePrivacySettings = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const currentSettings = user.privacy_settings || { 
            show_goals: true, show_tasks: true, show_workouts: true, 
            show_analytics: true, show_achievements: true 
        };
        
        user.privacy_settings = { ...currentSettings, ...req.body };
        await user.save();
        
        res.status(200).json({ message: 'Privacy settings updated', privacy_settings: user.privacy_settings });
    } catch (error) {
        console.error('Error updating privacy:', error);
        res.status(500).json({ message: 'Error updating privacy' });
    }
};
