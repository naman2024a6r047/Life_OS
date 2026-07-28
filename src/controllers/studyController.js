const {
    StudyLog, ExamSession, ExamSubject, ExamTopic,
    ActivityLog, User
} = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// ─── Helper: minutes → "Xh Ym" ───────────────────────────────────────────────
function fmtMins(mins) {
    const m = Math.round(Number(mins) || 0);
    const h = Math.floor(m / 60);
    const rem = m % 60;
    if (h === 0) return `${rem}m`;
    return rem === 0 ? `${h}h` : `${h}h ${rem}m`;
}

// ─── GET /api/study/dashboard ─────────────────────────────────────────────────
// Returns: stats, recentSessions, subjects, weeklyTrend, streakDays, weekStudied[]
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get active exam session
        const activeSession = await ExamSession.findOne({
            where: { user_id: userId, is_active: true },
            include: [{ model: ExamSubject, as: 'subjects', include: [{ model: ExamTopic, as: 'topics' }] }]
        });

        // 2. Date ranges
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 6);
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // 3. Study logs for this month & week
        const monthLogs = activeSession ? await StudyLog.findAll({
            where: {
                exam_session_id: activeSession.id,
                createdAt: { [Op.gte]: startOfMonth }
            },
            include: [{ model: ExamSubject, as: 'Subject', attributes: ['id', 'subject_name'] }],
            order: [['createdAt', 'DESC']]
        }) : [];

        const weekLogs = monthLogs.filter(l => new Date(l.createdAt) >= startOfWeek);

        // 4. Compute stats
        const totalMonthMins = monthLogs.reduce((s, l) => s + (l.duration_minutes || 0), 0);
        const totalMonthSessions = monthLogs.length;
        const totalWeekMins = weekLogs.reduce((s, l) => s + (l.duration_minutes || 0), 0);
        const totalWeekSessions = weekLogs.length;

        // 5. Recent sessions (last 5)
        const recentSessions = monthLogs.slice(0, 5).map(l => ({
            id: l.id,
            title: l.chapters_covered || l.Subject?.subject_name || 'Study Session',
            sub: l.Subject?.subject_name || '',
            duration: fmtMins(l.duration_minutes),
            time: formatRelativeTime(l.createdAt),
            notes: l.notes || '',
            session_time: l.session_time
        }));

        // 6. Subjects with time
        const subjects = (activeSession?.subjects || []).map(sb => {
            const subjectLogs = monthLogs.filter(l => l.subject_id === sb.id);
            const totalMins = subjectLogs.reduce((s, l) => s + (l.duration_minutes || 0), 0);
            const topics = sb.topics || [];
            const doneCnt = topics.filter(t => t.is_completed).length;
            return {
                id: sb.id,
                name: sb.subject_name,
                time: fmtMins(totalMins),
                totalMins,
                pct: topics.length > 0 ? Math.round((doneCnt / topics.length) * 100) : sb.progress_percentage || 0,
                topicsDone: doneCnt,
                topicsTotal: topics.length,
                is_completed: sb.is_completed
            };
        }).sort((a, b) => b.totalMins - a.totalMins);

        // 7. Weekly trend (last 7 days)
        const weeklyTrend = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            d.setHours(0, 0, 0, 0);
            const dEnd = new Date(d);
            dEnd.setHours(23, 59, 59, 999);
            const dayLogs = monthLogs.filter(l => {
                const ld = new Date(l.createdAt);
                return ld >= d && ld <= dEnd;
            });
            const dayMins = dayLogs.reduce((s, l) => s + (l.duration_minutes || 0), 0);
            weeklyTrend.push({
                day: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
                date: d.toISOString().split('T')[0],
                minutes: dayMins,
                isToday: i === 0
            });
        }

        // 8. Streak — check ActivityLog for consecutive study days
        const user = await User.findByPk(userId, { attributes: ['current_streak'] });
        const streak = user?.current_streak || 0;

        // 9. Weekly studied days (which days this week had study)
        const weekStudied = weeklyTrend.map(d => d.minutes > 0);

        // 10. Focus distribution by subject for this week
        const focusBySubject = subjects.map(sb => {
            const subLogs = weekLogs.filter(l => l.subject_id === sb.id);
            const mins = subLogs.reduce((s, l) => s + (l.duration_minutes || 0), 0);
            return { name: sb.name, minutes: mins };
        }).filter(s => s.minutes > 0);

        // 11. Session time distribution (Morning/Afternoon/Evening/Night)
        const timeSlots = ['Morning', 'Afternoon', 'Evening', 'Night'];
        const sessionByTime = timeSlots.map(slot => ({
            slot,
            count: weekLogs.filter(l => l.session_time === slot).length
        }));
        const mostProductiveTime = sessionByTime.reduce((a, b) => b.count > a.count ? b : a, { slot: 'Morning', count: 0 });

        // 12. Average session length
        const avgSessionMins = totalWeekSessions > 0 ? Math.round(totalWeekMins / totalWeekSessions) : 0;

        // 13. Best day of week
        const bestDay = weeklyTrend.reduce((a, b) => b.minutes > a.minutes ? b : a, weeklyTrend[0]);

        // 14. Goal: from ExamSession weekly_goal_hours if available, else default 20h
        const weeklyGoalMins = ((activeSession?.weekly_goal_hours || 20) * 60);
        const weeklyPct = Math.min(100, Math.round((totalWeekMins / weeklyGoalMins) * 100));

        res.json({
            stats: {
                totalMonthMins,
                totalMonthSessions,
                totalWeekMins,
                totalWeekSessions,
                streak,
                weeklyGoalMins,
                weeklyPct,
                avgSessionMins,
                bestDay: bestDay?.day || '-',
                bestDayMins: bestDay?.minutes || 0,
                mostProductiveTime: mostProductiveTime.slot
            },
            recentSessions,
            subjects,
            weeklyTrend,
            weekStudied,
            focusBySubject,
            hasExamSession: !!activeSession,
            examSession: activeSession ? {
                id: activeSession.id,
                reason: activeSession.reason,
                exam_type: activeSession.exam_type,
                end_date: activeSession.end_date
            } : null
        });
    } catch (err) {
        console.error('Study dashboard error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── GET /api/study/analytics ─────────────────────────────────────────────────
// Returns analytics data for the Analytics Dashboard
exports.getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = 'week' } = req.query;

        const now = new Date();
        let startDate, prevStartDate;

        if (period === 'week') {
            startDate = new Date(now); startDate.setDate(now.getDate() - 6); startDate.setHours(0, 0, 0, 0);
            prevStartDate = new Date(startDate); prevStartDate.setDate(startDate.getDate() - 7);
        } else if (period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        } else {
            startDate = new Date(now.getFullYear(), 0, 1);
            prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
        }

        const activeSession = await ExamSession.findOne({
            where: { user_id: userId, is_active: true }
        });

        // Get all study logs in period
        const whereClause = { createdAt: { [Op.gte]: startDate } };
        if (activeSession) whereClause.exam_session_id = activeSession.id;

        const prevWhereClause = {
            createdAt: { [Op.gte]: prevStartDate, [Op.lt]: startDate }
        };
        if (activeSession) prevWhereClause.exam_session_id = activeSession.id;

        const [logs, prevLogs, activityLogs, user] = await Promise.all([
            activeSession ? StudyLog.findAll({
                where: whereClause,
                include: [{ model: ExamSubject, as: 'Subject', attributes: ['id', 'subject_name'] }],
                order: [['createdAt', 'DESC']]
            }) : Promise.resolve([]),
            activeSession ? StudyLog.findAll({ where: prevWhereClause }) : Promise.resolve([]),
            ActivityLog.findAll({
                where: { user_id: userId, createdAt: { [Op.gte]: startDate } },
                order: [['createdAt', 'DESC']]
            }),
            User.findByPk(userId, { attributes: ['current_streak', 'xp'] })
        ]);

        // Totals
        const totalMins = logs.reduce((s, l) => s + (l.duration_minutes || 0), 0);
        const prevTotalMins = prevLogs.reduce((s, l) => s + (l.duration_minutes || 0), 0);
        const timeChange = prevTotalMins > 0 ? Math.round(((totalMins - prevTotalMins) / prevTotalMins) * 100) : 0;

        const tasksCompleted = activityLogs.filter(l =>
            l.action_type === 'daily_task_completed' ||
            l.action_type === 'exam_subject_completed' ||
            l.action_type === 'study_session_logged'
        ).length;

        // Focus score (% of sessions in Morning/Afternoon = peak hours)
        const peakSessions = logs.filter(l => l.session_time === 'Morning' || l.session_time === 'Afternoon').length;
        const focusScore = logs.length > 0 ? Math.round((peakSessions / logs.length) * 100) : 0;

        // By subject distribution
        const subjectMap = {};
        logs.forEach(l => {
            const name = l.Subject?.subject_name || 'Other';
            subjectMap[name] = (subjectMap[name] || 0) + (l.duration_minutes || 0);
        });
        const subjectDistribution = Object.entries(subjectMap)
            .map(([name, minutes]) => ({ name, minutes, pct: totalMins > 0 ? Math.round((minutes / totalMins) * 100) : 0 }))
            .sort((a, b) => b.minutes - a.minutes);

        // Daily breakdown for chart (last 7 days)
        const dailyBreakdown = [];
        const days = period === 'week' ? 7 : 30;
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            d.setHours(0, 0, 0, 0);
            const dEnd = new Date(d);
            dEnd.setHours(23, 59, 59, 999);
            const dayLogs = logs.filter(l => {
                const ld = new Date(l.createdAt);
                return ld >= d && ld <= dEnd;
            });
            const dayMins = dayLogs.reduce((s, l) => s + (l.duration_minutes || 0), 0);
            const dayActs = activityLogs.filter(l => {
                const ld = new Date(l.createdAt);
                return ld >= d && ld <= dEnd;
            }).length;
            dailyBreakdown.push({
                day: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
                date: d.toISOString().split('T')[0],
                minutes: dayMins,
                activities: dayActs
            });
        }

        // Activity heatmap (last 30 days)
        const heatmapLogs = await ActivityLog.findAll({
            where: { user_id: userId, createdAt: { [Op.gte]: new Date(Date.now() - 30 * 86400000) } },
            attributes: ['createdAt'],
            raw: true
        });
        const heatmap = {};
        heatmapLogs.forEach(l => {
            const key = new Date(l.createdAt).toISOString().split('T')[0];
            heatmap[key] = (heatmap[key] || 0) + 1;
        });

        // Top sessions
        const topSessions = logs.slice(0, 5).map(l => ({
            title: (l.chapters_covered ? l.chapters_covered : l.Subject?.subject_name) || 'Study Session',
            subject: l.Subject?.subject_name || '',
            duration: fmtMins(l.duration_minutes),
            date: new Date(l.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            session_time: l.session_time
        }));

        // Productivity trend (% of activity each day)
        const maxActivity = Math.max(...dailyBreakdown.map(d => d.activities), 1);
        const productivityTrend = dailyBreakdown.map(d => ({
            ...d,
            pct: Math.round((d.activities / maxActivity) * 100)
        }));

        // Focus vs break (estimate: logged time = focus, rest of waking day = break)
        const avgWakingMins = (period === 'week' ? 7 : days) * 16 * 60;
        const focusPct = Math.min(100, Math.round((totalMins / avgWakingMins) * 100));

        // Insights (dynamically generated)
        const insights = [];
        if (subjectDistribution[0]) insights.push({ icon: '🔵', text: `You spent the most time on ${subjectDistribution[0].name} (${fmtMins(subjectDistribution[0].minutes)}).` });
        if (focusScore >= 70) insights.push({ icon: '🟢', text: `Great focus! ${focusScore}% of your sessions were during peak hours.` });
        else if (focusScore > 0) insights.push({ icon: '🟡', text: `Try studying more in Morning/Afternoon for better focus. Currently at ${focusScore}%.` });
        if (user?.current_streak > 0) insights.push({ icon: '⚡', text: `You're on a ${user.current_streak}-day streak! Keep going!` });
        if (logs.length === 0) insights.push({ icon: '📚', text: 'No study sessions logged yet. Start a session from Exam Mode!' });

        res.json({
            period,
            dateRange: {
                start: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                end: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            },
            stats: {
                totalMins,
                tasksCompleted,
                focusScore,
                streak: user?.current_streak || 0,
                timeChange,
                focusPct
            },
            subjectDistribution,
            dailyBreakdown,
            productivityTrend,
            topSessions,
            heatmap,
            insights,
            hasData: logs.length > 0
        });
    } catch (err) {
        console.error('Study analytics error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── POST /api/study/log ──────────────────────────────────────────────────────
exports.logSession = async (req, res) => {
    try {
        const userId = req.user.id;
        let { subject_id, session_time, duration_minutes, chapters_covered, notes } = req.body;

        const validTimes = ['Morning', 'Afternoon', 'Evening', 'Night'];
        if (!validTimes.includes(session_time)) {
            const h = new Date().getHours();
            session_time = h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : h < 21 ? 'Evening' : 'Night';
        }

        const activeSession = await ExamSession.findOne({ where: { user_id: userId, is_active: true } });
        if (!activeSession) return res.status(400).json({ message: 'No active exam session. Please activate Exam Mode first.' });

        const log = await StudyLog.create({
            exam_session_id: activeSession.id,
            subject_id,
            session_time,
            duration_minutes: Number(duration_minutes) || 0,
            chapters_covered,
            notes
        });

        // Update total hours on session
        const addedHours = (Number(duration_minutes) || 0) / 60;
        activeSession.total_study_hours = Number(((activeSession.total_study_hours || 0) + addedHours).toFixed(2));
        await activeSession.save();

        // Award XP
        await ActivityLog.create({ user_id: userId, action_type: 'study_session_logged', xp_awarded: 10 });
        await User.increment({ xp: 10 }, { where: { id: userId } });

        res.status(201).json(log);
    } catch (err) {
        console.error('Log session error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatRelativeTime(date) {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `Today, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDays === 1) return `Yesterday, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
