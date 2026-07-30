const { 
    ExamSession, ExamSubject, ExamTopic, StudyLog, MockTest, ActivityPauseState, 
    Challenge, Milestone, MilestoneTask, User, ActivityLog 
} = require('../models');

exports.activateExamMode = async (req, res) => {
    try {
        console.log(`[ExamMode] Activate requested by user: ${req.user.id}`);
        const { reason, exam_type, start_date, end_date } = req.body;
        const defaultReason = (reason && reason.trim()) ? reason : 'Exam Prep';

        console.log(`[ExamMode] Request payload:`, req.body);

        // Ensure user is not already in exam mode
        let session = await ExamSession.findOne({ 
            where: { user_id: req.user.id, is_active: true } 
        });

        console.log(`[ExamMode] Found existing session? ${!!session}`);

        if (!session) {
            console.log(`[ExamMode] Creating new session...`);
            session = await ExamSession.create({
                user_id: req.user.id,
                reason: defaultReason,
                exam_type: exam_type || 'Semester',
                start_date: start_date || new Date(),
                end_date: end_date || new Date(Date.now() + 14 * 86400000),
                is_active: true
            });
            console.log(`[ExamMode] New session created: ${session.id}`);
        }

        // Update User model flag
        console.log(`[ExamMode] Updating User flag...`);
        await User.update(
            { is_in_exam_mode: true },
            { where: { id: req.user.id } }
        );

        // 1. Freeze Challenges
        console.log(`[ExamMode] Fetching active challenges...`);
        const activeChallenges = await Challenge.findAll({
            where: { user_id: req.user.id, status: 'active' }
        });

        console.log(`[ExamMode] Found ${activeChallenges.length} active challenges to freeze.`);

        const pauseStates = activeChallenges.map(challenge => ({
            user_id: req.user.id,
            exam_session_id: session.id,
            activity_type: 'Challenge',
            activity_id: challenge.id,
            state_snapshot: challenge.toJSON()
        }));

        if (pauseStates.length > 0) {
            console.log(`[ExamMode] Creating pause states...`);
            await ActivityPauseState.bulkCreate(pauseStates);
            console.log(`[ExamMode] Updating challenge statuses to paused...`);
            await Challenge.update(
                { status: 'paused' },
                { where: { user_id: req.user.id, status: 'active' } }
            );
        }

        console.log(`[ExamMode] Activation completed successfully!`);
        res.status(201).json({ message: 'Exam mode activated. All activities paused under Exam Prep.', session });
    } catch (error) {
        console.error('Activate Exam Mode Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deactivateExamMode = async (req, res) => {
    try {
        console.log(`[ExamMode] Deactivating exam mode for user: ${req.user.id}`);
        // ALWAYS reset User flag first so user is never trapped
        await User.update(
            { is_in_exam_mode: false },
            { where: { id: req.user.id } }
        );
        console.log('[ExamMode] User flag reset.');

        const session = await ExamSession.findOne({
            where: { user_id: req.user.id, is_active: true }
        });
        console.log(`[ExamMode] Found active session: ${session ? session.id : 'None'}`);

        if (session) {
            // Calculate days spent in Exam Mode
            const sessionStart = new Date(session.createdAt || session.start_date);
            const now = new Date();
            const elapsedMs = Math.max(0, now - sessionStart);
            const elapsedDays = Math.max(1, Math.ceil(elapsedMs / (1000 * 60 * 60 * 24)));
            console.log(`[ExamMode] Elapsed days calculated: ${elapsedDays}`);

            session.is_active = false;
            await session.save();
            console.log('[ExamMode] Session marked inactive.');

            // 1. Unfreeze Challenges & Shift Dates Forward by elapsedDays
            const pausedChallenges = await ActivityPauseState.findAll({
                where: { user_id: req.user.id, exam_session_id: session.id, activity_type: 'Challenge' }
            });
            console.log(`[ExamMode] Found ${pausedChallenges.length} paused challenges.`);

            const challengeIds = pausedChallenges.map(p => p.activity_id);
            
            if (challengeIds.length > 0) {
                // Fetch the actual challenges to read their old dates before shifting
                const challengesToUpdate = await Challenge.findAll({ where: { id: challengeIds } });
                await Promise.all(challengesToUpdate.map(async (c) => {
                    const cStart = new Date(c.start_date);
                    cStart.setDate(cStart.getDate() + elapsedDays);

                    const cEnd = new Date(c.end_date);
                    cEnd.setDate(cEnd.getDate() + elapsedDays);

                    return c.update({
                        status: 'active',
                        start_date: cStart,
                        end_date: cEnd
                    });
                }));
                console.log('[ExamMode] Challenges set to active and dates shifted.');

                // Fetch Milestones and push their start_date and deadline forward by elapsedDays
                const milestones = await Milestone.findAll({
                    where: { challenge_id: challengeIds }
                });
                console.log(`[ExamMode] Found ${milestones.length} milestones to shift.`);

                // Update all milestones in parallel
                await Promise.all(milestones.map(async (m) => {
                    const newStart = new Date(m.start_date);
                    newStart.setDate(newStart.getDate() + elapsedDays);

                    const newDeadline = new Date(m.deadline);
                    newDeadline.setDate(newDeadline.getDate() + elapsedDays);

                    return m.update({
                        start_date: newStart,
                        deadline: newDeadline
                    });
                }));

                // Fetch all tasks for all milestones at once
                const milestoneIds = milestones.map(m => m.id);
                if (milestoneIds.length > 0) {
                    const tasks = await MilestoneTask.findAll({
                        where: { milestone_id: milestoneIds }
                    });
                    
                    console.log(`[ExamMode] Found ${tasks.length} tasks to shift.`);

                    // Update all tasks in chunks to avoid overwhelming the database connection pool
                    const chunkSize = 50;
                    for (let i = 0; i < tasks.length; i += chunkSize) {
                        const chunk = tasks.slice(i, i + chunkSize);
                        await Promise.all(chunk.map(async (t) => {
                            if (t.date) {
                                const taskDate = new Date(t.date);
                                taskDate.setDate(taskDate.getDate() + elapsedDays);
                                return t.update({
                                    date: taskDate.toISOString().split('T')[0]
                                });
                            }
                        }));
                    }
                }
                console.log('[ExamMode] Milestones and tasks shifted in chunks.');
            }
        }

        // Also unfreeze any remaining paused challenges for user safety
        await Challenge.update(
            { status: 'active' },
            { where: { user_id: req.user.id, status: 'paused' } }
        );
        console.log('[ExamMode] Fallback unfreeze completed.');

        res.status(200).json({ message: 'Exam mode deactivated. Dates pushed forward seamlessly.' });
    } catch (error) {
        console.error('Deactivate Exam Mode Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.startNewExamSession = async (req, res) => {
    try {
        const { reason, exam_type, start_date, end_date } = req.body;
        const examName = (reason && reason.trim()) ? reason : 'New Exam Prep';

        // Deactivate previous active sessions for user
        await ExamSession.update(
            { is_active: false },
            { where: { user_id: req.user.id, is_active: true } }
        );

        // Create fresh new active exam session
        const newSession = await ExamSession.create({
            user_id: req.user.id,
            reason: examName,
            exam_type: exam_type || 'Semester',
            start_date: start_date || new Date(),
            end_date: end_date || new Date(Date.now() + 14 * 86400000),
            is_active: true
        });

        await User.update(
            { is_in_exam_mode: true },
            { where: { id: req.user.id } }
        );

        res.status(201).json(newSession);
    } catch (error) {
        console.error('Start new exam error:', error);
        res.status(500).json({ message: 'Server error starting new exam' });
    }
};

exports.getDashboard = async (req, res) => {
    try {
        let session = await ExamSession.findOne({
            where: { user_id: req.user.id, is_active: true },
            include: [
                { 
                    model: ExamSubject, 
                    as: 'subjects', 
                    separate: true,
                    required: false,
                    include: [{ model: ExamTopic, as: 'topics', separate: true, required: false }]
                },
                { 
                    model: StudyLog, 
                    as: 'studyLogs', 
                    separate: true,
                    include: [{ model: ExamSubject, as: 'Subject', required: false }],
                    order: [['createdAt', 'DESC']], 
                    required: false 
                },
                { model: MockTest, as: 'mockTests', separate: true, required: false }
            ]
        });

        if (!session) {
            return res.status(200).json(null);
        }

        const sessionJson = session.toJSON();
        
        // Accurately compute total study hours from all logged study sessions
        const totalMinutes = (sessionJson.studyLogs || []).reduce((acc, log) => acc + (log.duration_minutes || 0), 0);
        sessionJson.total_study_hours = Number((totalMinutes / 60).toFixed(1));

        // Compute days remaining
        const now = new Date();
        const endDate = new Date(session.end_date);
        const diffMs = endDate - now;
        sessionJson.days_remaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

        // Compute topics progress
        let totalTopics = 0;
        let completedTopics = 0;
        if (sessionJson.subjects) {
            sessionJson.subjects.forEach(subject => {
                if (subject.topics) {
                    totalTopics += subject.topics.length;
                    completedTopics += subject.topics.filter(t => t.is_completed || t.study_status === 'completed' || t.study_status === 'revision').length;
                }
            });
        }
        sessionJson.total_topics = totalTopics;
        sessionJson.completed_topics = completedTopics;

        res.status(200).json(sessionJson);
    } catch (error) {
        console.error('Get Dashboard Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createSubject = async (req, res) => {
    try {
        let { exam_session_id, name, exam_date, priority } = req.body;

        if (!exam_session_id) {
            const activeSession = await ExamSession.findOne({ where: { user_id: req.user.id, is_active: true } });
            if (activeSession) exam_session_id = activeSession.id;
        }

        if (!exam_session_id) {
            return res.status(400).json({ message: 'No active exam session found.' });
        }

        const subject = await ExamSubject.create({ 
            exam_session_id, 
            name,
            exam_date: exam_date || null,
            priority: priority || 'Medium'
        });
        res.status(201).json(subject);
    } catch (error) {
        console.error('Create subject error:', error);
        res.status(500).json({ message: 'Error adding subject' });
    }
};

exports.createTopic = async (req, res) => {
    try {
        const { subject_id, name } = req.body;
        const topic = await ExamTopic.create({ subject_id, name });
        res.status(201).json(topic);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.toggleTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        const topic = await ExamTopic.findByPk(topicId);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }
        topic.is_completed = !topic.is_completed;
        await topic.save();

        // Recalculate subject progress percentage
        const allTopics = await ExamTopic.findAll({ where: { subject_id: topic.subject_id } });
        const completedCount = allTopics.filter(t => t.is_completed).length;
        const progress = allTopics.length > 0 ? Math.round((completedCount / allTopics.length) * 100) : 0;
        const isAllDone = allTopics.length > 0 && completedCount === allTopics.length;
        
        await ExamSubject.update(
            { progress_percentage: progress, is_completed: isAllDone },
            { where: { id: topic.subject_id } }
        );

        res.status(200).json(topic);
    } catch (error) {
        console.error('Toggle topic error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.completeSubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        console.log(`[completeSubject] Triggered for subjectId: ${subjectId}`);

        const subject = await ExamSubject.findByPk(subjectId);
        if (!subject) {
            console.warn(`[completeSubject] Subject ${subjectId} not found`);
            return res.status(404).json({ message: 'Subject not found' });
        }

        const nextState = !subject.is_completed;
        const nextProgress = nextState ? 100 : 0;

        await subject.update({
            is_completed: nextState,
            progress_percentage: nextProgress
        });

        // Safely update topics if any exist
        try {
            await ExamTopic.update(
                { is_completed: nextState },
                { where: { subject_id: subjectId } }
            );
        } catch (topicErr) {
            console.error('[completeSubject] Topic update warning:', topicErr.message);
        }

        // Safely award XP if user context exists
        if (nextState && req.user?.id) {
            try {
                await ActivityLog.create({
                    user_id: req.user.id,
                    action_type: 'exam_subject_completed',
                    xp_awarded: 50
                });
                await User.increment({ xp: 50 }, { where: { id: req.user.id } });
            } catch (xpErr) {
                console.error('[completeSubject] XP award warning:', xpErr.message);
            }
        }

        const updatedSubject = await ExamSubject.findByPk(subjectId, {
            include: [{ model: ExamTopic, as: 'topics', required: false }]
        });

        return res.status(200).json(updatedSubject);
    } catch (error) {
        console.error('[completeSubject] Error:', error);
        return res.status(500).json({ message: error.message || 'Server error' });
    }
};

exports.logStudySession = async (req, res) => {
    try {
        let { exam_session_id, subject_id, session_time, duration_minutes, chapters_covered, notes } = req.body;
        
        const validTimes = ['Morning', 'Afternoon', 'Evening', 'Night'];
        if (!validTimes.includes(session_time)) {
            session_time = 'Afternoon';
        }

        if (!exam_session_id) {
            const activeSession = await ExamSession.findOne({ where: { user_id: req.user.id, is_active: true } });
            if (activeSession) exam_session_id = activeSession.id;
        }

        const log = await StudyLog.create({
            exam_session_id, subject_id, session_time, duration_minutes, chapters_covered, notes
        });

        // Increment total study hours on session
        if (exam_session_id) {
            const session = await ExamSession.findByPk(exam_session_id);
            if (session) {
                const addedHours = (Number(duration_minutes) || 0) / 60;
                session.total_study_hours = Number(((session.total_study_hours || 0) + addedHours).toFixed(2));
                await session.save();
            }
        }

        // Award XP for logging a study session
        if (req.user?.id) {
            try {
                await ActivityLog.create({
                    user_id: req.user.id,
                    action_type: 'study_session_logged',
                    xp_awarded: 10
                });
                await User.increment({ xp: 10 }, { where: { id: req.user.id } });
            } catch (xpErr) {
                console.error('XP award warning:', xpErr.message);
            }
        }

        res.status(201).json(log);
    } catch (error) {
        console.error('Log study session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.logMockTest = async (req, res) => {
    try {
        const { exam_session_id, date, score, time_taken_minutes, weak_areas, incorrect_questions } = req.body;
        const mock = await MockTest.create({
            exam_session_id, date, score, time_taken_minutes, weak_areas, incorrect_questions
        });
        res.status(201).json(mock);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getExamCalendar = async (req, res) => {
    try {
        const session = await ExamSession.findOne({
            where: { user_id: req.user.id, is_active: true },
            include: [{ model: ExamSubject, as: 'subjects', separate: true }]
        });
        if (!session) return res.status(200).json([]);
        const subjects = session.subjects.filter(s => s.exam_date).sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));
        res.status(200).json(subjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteSubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const subject = await ExamSubject.findByPk(subjectId);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });
        await ExamTopic.destroy({ where: { subject_id: subjectId } });
        await subject.destroy();
        res.status(200).json({ message: 'Subject deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        const topic = await ExamTopic.findByPk(topicId);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });
        await topic.destroy();
        res.status(200).json({ message: 'Topic deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateStudyGoal = async (req, res) => {
    try {
        const { daily_study_target_hours } = req.body;
        const session = await ExamSession.findOne({ where: { user_id: req.user.id, is_active: true } });
        if (!session) return res.status(404).json({ message: 'Session not found' });
        session.daily_study_target_hours = daily_study_target_hours;
        await session.save();
        res.status(200).json(session);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
