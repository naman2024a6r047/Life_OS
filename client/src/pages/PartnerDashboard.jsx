import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import dayjs from 'dayjs';
import { 
    FiArrowLeft, FiTarget, FiCheckCircle, FiXCircle, FiAlertTriangle, 
    FiMessageCircle, FiZap, FiTrendingUp, FiCalendar, FiClock,
    FiSend, FiUser, FiAward, FiActivity, FiAlertOctagon, FiChevronDown, FiChevronUp,
    FiRefreshCw, FiMessageSquare, FiCheckSquare, FiCircle
} from 'react-icons/fi';
import BackButton from '../components/ui/BackButton';
import ChatSystem from '../components/chat/ChatSystem';

export default function PartnerDashboard() {
    const { friendId } = useParams();
    const location = useLocation();
    const { user } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');
    const [timeRange, setTimeRange] = useState('all'); // 'daily', 'weekly', 'monthly', 'yearly', 'all'
    const [expandedOverviewChallenges, setExpandedOverviewChallenges] = useState({});

    // Intervention modal state
    const [showInterventionModal, setShowInterventionModal] = useState(false);
    const [interventionForm, setInterventionForm] = useState({
        type: 'inquiry',
        item_type: 'task',
        item_title: '',
        message: '',
        punishment: ''
    });

    // Expandable challenge cards
    const [expandedChallenges, setExpandedChallenges] = useState({});

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchTelemetry = async () => {
        try {
            const res = await axios.get(`/api/friends/telemetry/${friendId}`, { headers: getAuthHeader() });
            setData(res.data);
        } catch (err) {
            console.error('Error fetching partner telemetry:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTelemetry(); }, [friendId]);

    const toggleChallenge = (id) => {
        setExpandedChallenges(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleOverviewChallenge = (title) => {
        setExpandedOverviewChallenges(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const openInterventionFor = (itemType, itemTitle) => {
        setInterventionForm({
            type: 'inquiry',
            item_type: itemType,
            item_title: itemTitle,
            message: '',
            punishment: ''
        });
        setShowInterventionModal(true);
    };

    const sendIntervention = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/friends/intervention', {
                receiver_id: friendId,
                ...interventionForm
            }, { headers: getAuthHeader() });
            alert(res.data?.message || (interventionForm.type === 'inquiry' ? 'Inquiry sent! Your partner will be notified.' : 'Punishment assigned! Your partner must complete it.'));
            setShowInterventionModal(false);
            fetchTelemetry();
        } catch (err) {
            alert(err.response?.data?.message || 'Error sending intervention');
        }
    };

    const handleDirectResetMilestone = async (milestoneId, milestoneTitle) => {
        if (!confirm(`Are you sure you want to restart "${milestoneTitle}" back to Task 1 starting today?`)) return;
        try {
            const res = await axios.post('/api/friends/milestone/reset-day-one', {
                milestoneId,
                milestoneTitle,
                targetUserId: friendId
            }, { headers: getAuthHeader() });
            alert(res.data.message || 'Milestone restarted to Day 1!');
            fetchTelemetry();
        } catch (err) {
            alert(err.response?.data?.message || 'Error resetting milestone');
        }
    };

    const handleResetMilestoneFromIntervention = async (interventionId) => {
        if (!confirm('Are you sure you want to restart this milestone back to Task 1 starting today?')) return;
        try {
            const res = await axios.post(`/api/friends/intervention/${interventionId}/reset-milestone`, {}, { headers: getAuthHeader() });
            alert(res.data?.message || 'Milestone restarted to Day 1!');
            fetchTelemetry();
        } catch (err) {
            alert(err.response?.data?.message || 'Error resetting milestone');
        }
    };

    // Filter tasks by time range
    const filterByTime = (dateStr) => {
        if (!dateStr || timeRange === 'all') return true;
        const d = dayjs(dateStr);
        const now = dayjs();
        switch (timeRange) {
            case 'daily': return d.isSame(now, 'day');
            case 'weekly': return d.isSame(now, 'week');
            case 'monthly': return d.isSame(now, 'month');
            case 'yearly': return d.isSame(now, 'year');
            default: return true;
        }
    };

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center min-h-[60vh] text-text-primary">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-text-muted text-sm">Loading partner telemetry...</p>
                </div>
            </div>
        );
    }

    if (!data || !data.user) {
        return (
            <div className="w-full p-8 text-text-primary">
                <BackButton fallbackPath="/friends" />
                <div className="text-center py-20 text-text-muted">Partner not found.</div>
            </div>
        );
    }

    const { user: partner, stats, challenges, skippedTasks, skippedMilestones, activityLogs, interventions } = data;

    const allFilteredTasks = [];
    if (challenges) {
        challenges.forEach(c => {
            c.milestones?.forEach(m => {
                m.tasks?.forEach(t => {
                    if (filterByTime(t.date)) {
                        allFilteredTasks.push({ ...t, challengeTitle: c.title, milestoneTitle: m.title });
                    }
                });
            });
        });
    }
    
    // Sort tasks: uncompleted first, then by date
    allFilteredTasks.sort((a, b) => {
        if (a.completed === b.completed) {
            return new Date(a.date) - new Date(b.date);
        }
        return a.completed ? 1 : -1;
    });    const completionRate = stats.totalTasks > 0 ? ((stats.completedTasksCount / stats.totalTasks) * 100).toFixed(0) : 0;

    // Filter skipped tasks by time range
    const filteredSkippedTasks = skippedTasks.filter(t => filterByTime(t.date));

    const TABS = [
        { key: 'overview', label: 'Overview', icon: <FiTrendingUp /> },
        { key: 'goals', label: 'Goals & Tasks', icon: <FiTarget /> },
        { key: 'skipped', label: `Skipped (${skippedTasks.length})`, icon: <FiAlertTriangle /> },
        { key: 'interventions', label: 'Interventions', icon: <FiMessageCircle /> },
        { key: 'chat', label: 'Chat', icon: <FiMessageSquare /> }
    ];

    return (
        <div className="w-full p-4 md:p-8 relative overflow-hidden text-text-primary">
            <div className="absolute rounded-full blur-[120px] pointer-events-none top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-600/10"></div>
            <div className="absolute rounded-full blur-[120px] pointer-events-none bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10"></div>

            <div className="max-w-6xl mx-auto space-y-6 relative z-10">
                <BackButton fallbackPath="/friends" />

                {/* Partner Profile Header */}
                <div className="card rounded-2xl border border-primary/20 p-6 md:p-8 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20/30 to-cyan-500/30 border-2 border-primary/40 flex items-center justify-center text-3xl font-black text-primary uppercase shadow-xl shadow-primary/30">
                                {partner.username ? partner.username[0] : 'U'}
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">{partner.username}'s Telemetry</h1>
                                <div className="flex items-center gap-3 mt-1 text-xs font-mono text-text-muted flex-wrap">
                                    <span className="text-primary font-bold">Level {partner.level || 1}</span>
                                    <span>•</span>
                                    <span>{partner.xp || 0} XP</span>
                                    <span>•</span>
                                    <span className="text-amber-400 font-bold">🔥 {partner.current_streak || 0} Day Streak</span>
                                    <span>•</span>
                                    <span className="text-cyan-400 font-bold">🎯 Discipline: {partner.discipline_score || 50}/100</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <button 
                                onClick={() => {
                                    setInterventionForm({
                                        type: 'inquiry',
                                        item_type: 'general',
                                        item_title: 'Motivation Nudge',
                                        message: '🔥 Keep grinding! You got this!',
                                        punishment: ''
                                    });
                                    setShowInterventionModal(true);
                                }}
                                className="px-3 py-2 bg-primary/20 hover:bg-primary text-primary hover:text-background border border-primary/30 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
                            >
                                🔥 Send Motivation
                            </button>

                            <button 
                                onClick={() => {
                                    setInterventionForm({
                                        type: 'inquiry',
                                        item_type: 'general',
                                        item_title: 'Congratulations',
                                        message: '👏 Great job completing your milestone!',
                                        punishment: ''
                                    });
                                    setShowInterventionModal(true);
                                }}
                                className="px-3 py-2 bg-success/20 hover:bg-success text-emerald-300 hover:text-text-primary border border-emerald-500/30 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
                            >
                                👏 Congratulate
                            </button>

                            <button 
                                onClick={() => openInterventionFor('general', 'General Accountability')}
                                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-text-primary font-bold rounded-xl text-xs transition-all shadow-lg shadow-rose-600/20 flex items-center gap-2"
                            >
                                <FiAlertOctagon /> Send Inquiry / Punishment
                            </button>
                        </div>
                    </div>

                    {/* Exam Mode Overlay Banner if Active */}
                    {data.is_in_exam_mode && (
                        <div className="p-4 bg-cyan-950/30 border border-cyan-500/40 rounded-2xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 font-bold text-lg">
                                    📚
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-sm text-text-primary">{partner.username} is in Exam Mode</h4>
                                    <p className="text-text-muted text-xs font-mono">
                                        Focusing on {data.exam_info?.reason || 'Exams'}. Telemetry and goals are locked to prevent distractions.
                                    </p>
                                </div>
                            </div>

                            <button 
                                onClick={() => {
                                    setInterventionForm({
                                        type: 'inquiry',
                                        item_type: 'general',
                                        item_title: 'Exam Mode Support',
                                        message: '📚 Best of luck with your exams! Stay focused!',
                                        punishment: ''
                                    });
                                    setShowInterventionModal(true);
                                }}
                                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-text-muted font-bold rounded-xl text-xs transition shrink-0 flex items-center gap-1.5"
                            >
                                📚 Send Support
                            </button>
                        </div>
                    )}

                    {/* Rich Telemetry Grid - Only show if NOT in exam mode */}
                    {!data.is_in_exam_mode && (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-4 border-t border-border-subtle">
                        {/* Task Completion Rate */}
                        <div className="p-3 bg-background/90 rounded-xl border border-border-subtle">
                            <div className="text-[10px] font-mono uppercase text-text-muted mb-1">Completion Rate</div>
                            <div className="text-lg font-black text-success">{stats.completionRate || 0}%</div>
                            <div className="w-full bg-surface-elevated h-1.5 rounded-full mt-1.5 overflow-hidden">
                                <div className="bg-emerald-400 h-full rounded-full transition-all" style={{ width: `${stats.completionRate || 0}%` }}></div>
                            </div>
                        </div>

                        {/* Completed Today / Week */}
                        <div className="p-3 bg-background/90 rounded-xl border border-border-subtle">
                            <div className="text-[10px] font-mono uppercase text-text-muted mb-1">Today / This Week</div>
                            <div className="text-lg font-black text-cyan-400">
                                {stats.completedTodayCount || 0} <span className="text-xs font-normal text-text-muted">today</span> / {stats.completedWeekCount || 0} <span className="text-xs font-normal text-text-muted">wk</span>
                            </div>
                        </div>

                        {/* Total Completed */}
                        <div className="p-3 bg-background/90 rounded-xl border border-border-subtle">
                            <div className="text-[10px] font-mono uppercase text-text-muted mb-1">Total Tasks Done</div>
                            <div className="text-lg font-black text-text-primary">
                                {stats.completedTasksCount || 0} <span className="text-xs font-normal text-text-muted">/ {stats.totalTasks || 0}</span>
                            </div>
                        </div>

                        {/* Skipped Tasks */}
                        <div className="p-3 bg-background/90 rounded-xl border border-border-subtle">
                            <div className="text-[10px] font-mono uppercase text-text-muted mb-1">Skipped Tasks</div>
                            <div className={`text-lg font-black ${stats.skippedTasksCount > 0 ? 'text-rose-400' : 'text-text-muted'}`}>
                                {stats.skippedTasksCount || 0}
                            </div>
                        </div>

                        {/* Overdue Milestones */}
                        <div className="p-3 bg-background/90 rounded-xl border border-border-subtle">
                            <div className="text-[10px] font-mono uppercase text-text-muted mb-1">Overdue Milestones</div>
                            <div className={`text-lg font-black ${stats.skippedMilestonesCount > 0 ? 'text-amber-400' : 'text-text-muted'}`}>
                                {stats.skippedMilestonesCount || 0}
                            </div>
                        </div>

                        {/* Focus Hours */}
                        <div className="p-3 bg-background/90 rounded-xl border border-border-subtle">
                            <div className="text-[10px] font-mono uppercase text-text-muted mb-1">Focus Study Time</div>
                            <div className="text-lg font-black text-primary">{stats.totalStudyHours || '0.0'} hrs</div>
                        </div>
                    </div>
                    )}
                </div>

                {!data.is_in_exam_mode && (
                    <>
                        {/* Time Range Filter + Tab Navigation */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Tabs */}
                    <div className="flex gap-1.5 bg-surface/5 p-1 rounded-xl border border-white/10 flex-wrap">
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === tab.key ? 'bg-primary text-background shadow' : 'text-text-muted hover:text-text-primary'}`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Time Range Filter */}
                    <div className="flex gap-1 bg-surface/5 p-1 rounded-xl border border-white/10 flex-wrap">
                        {['daily', 'weekly', 'monthly', 'yearly', 'all'].map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${timeRange === range ? 'bg-cyan-600 text-text-primary shadow' : 'text-text-muted hover:text-text-primary'}`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* TAB: OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Skipped Warning Banner */}
                        {stats.skippedTasksCount > 0 && (
                            <div className="card p-5 rounded-2xl border border-rose-500/30 bg-rose-950/20">
                                <div className="flex items-center gap-3 mb-3">
                                    <FiAlertTriangle className="text-rose-400 text-xl" />
                                    <h3 className="text-lg font-bold text-rose-400">Accountability Alert</h3>
                                </div>
                                <p className="text-text-primary text-sm mb-4">
                                    {partner.username} has <span className="text-rose-400 font-bold">{stats.skippedTasksCount} skipped tasks</span> and <span className="text-rose-400 font-bold">{stats.skippedMilestonesCount} overdue milestones</span> that need attention.
                                </p>
                                <button 
                                    onClick={() => setActiveTab('skipped')}
                                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-text-primary text-xs font-bold rounded-lg transition"
                                >
                                    View Skipped Items →
                                </button>
                            </div>
                        )}

                        {/* Detailed Tasks List */}
                        <div className="card p-6 rounded-2xl border border-border-subtle">
                            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                                <FiCheckSquare className="text-success" /> Filtered Tasks ({allFilteredTasks.length})
                            </h3>
                            {allFilteredTasks.length > 0 ? (
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {Object.entries(
                                        allFilteredTasks.reduce((acc, task) => {
                                            if (!acc[task.challengeTitle]) acc[task.challengeTitle] = [];
                                            acc[task.challengeTitle].push(task);
                                            return acc;
                                        }, {})
                                    ).map(([challengeTitle, tasks]) => {
                                        const isExpanded = expandedOverviewChallenges[challengeTitle];
                                        return (
                                            <div key={challengeTitle} className="border border-border-subtle rounded-xl overflow-hidden bg-background/30">
                                                <button 
                                                    onClick={() => toggleOverviewChallenge(challengeTitle)}
                                                    className="w-full bg-surface-elevated/40 hover:bg-surface-elevated/80 transition p-3 flex justify-between items-center border-b border-border-subtle/50"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-text-primary">{challengeTitle}</span>
                                                        <span className="bg-surface-elevated text-xs text-text-muted px-2 py-0.5 rounded-full">{tasks.length} tasks</span>
                                                    </div>
                                                    {isExpanded ? <FiChevronUp className="text-text-muted" /> : <FiChevronDown className="text-text-muted" />}
                                                </button>
                                                
                                                {isExpanded && (
                                                    <div className="p-3 space-y-2">
                                                        {tasks.map((task, i) => (
                                                            <div key={i} className={`p-3 rounded-xl border flex items-start gap-3 ${task.completed ? 'border-emerald-500/20 bg-emerald-950/10' : 'border-border-subtle/80 bg-background/50'}`}>
                                                                <div className="mt-0.5">
                                                                    {task.completed ? (
                                                                        <FiCheckCircle className="text-success" size={16} />
                                                                    ) : (
                                                                        <FiCircle className="text-text-muted" size={16} />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between items-start gap-2">
                                                                        <h4 className={`text-sm font-bold ${task.completed ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                                                                            {task.title}
                                                                        </h4>
                                                                        <span className="text-[10px] text-text-muted font-mono whitespace-nowrap">
                                                                            {dayjs(task.date).format('MMM DD')}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-[10px] text-text-muted mt-1 flex items-center gap-2 flex-wrap">
                                                                        <span className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">{task.milestoneTitle}</span>
                                                                        {task.estimated_minutes > 0 && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <span>{task.estimated_minutes} min</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-text-muted text-sm">No tasks scheduled for this period.</div>
                            )}
                        </div>

                        {/* Activity Log (last 30 days) */}
                        <div className="card p-6 rounded-2xl border border-border-subtle">
                            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                                <FiActivity className="text-cyan-400" /> Recent Activity Log
                            </h3>
                            {activityLogs && activityLogs.length > 0 ? (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                    {activityLogs.filter(a => filterByTime(a.createdAt || a.date)).map((log, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-background/80 rounded-xl border border-border-subtle text-xs">
                                            <div className="flex items-center gap-3">
                                                <span className="text-text-muted font-mono w-20">{dayjs(log.createdAt || log.date).format('MMM DD')}</span>
                                                <span className="text-text-primary">{log.action_type || log.action || log.type || 'Activity'}</span>
                                            </div>
                                            <span className={`font-bold ${(log.xp_awarded || log.xp_earned || 0) > 0 ? 'text-success' : 'text-text-muted'}`}>
                                                {(log.xp_awarded || log.xp_earned || 0) > 0 ? `+${(log.xp_awarded || log.xp_earned)} XP` : '—'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-text-muted text-sm">No recent activity recorded.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: GOALS & TASKS */}
                {activeTab === 'goals' && (
                    <div className="space-y-4">
                        {challenges && challenges.length > 0 ? challenges.map(challenge => {
                            const isExpanded = expandedChallenges[challenge.id];
                            const allTasks = [];
                            const completedCount = { total: 0, done: 0 };

                            challenge.milestones?.forEach(m => {
                                m.tasks?.forEach(t => {
                                    if (filterByTime(t.date)) {
                                        allTasks.push({ ...t, milestoneTitle: m.title });
                                        completedCount.total++;
                                        if (t.completed) completedCount.done++;
                                    }
                                });
                            });

                            const pct = completedCount.total > 0 ? ((completedCount.done / completedCount.total) * 100).toFixed(0) : 0;

                            return (
                                <div key={challenge.id} className="card rounded-2xl border border-border-subtle overflow-hidden">
                                    <button 
                                        onClick={() => toggleChallenge(challenge.id)}
                                        className="w-full p-5 flex justify-between items-center text-left hover:bg-surface/5 transition"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold" style={{ backgroundColor: `${challenge.color || '#4F46E5'}20`, color: challenge.color || '#818CF8' }}>
                                                <FiTarget size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-text-primary">{challenge.title}</h3>
                                                <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                                                    <span>{challenge.milestones?.length || 0} milestones</span>
                                                    <span>•</span>
                                                    <span>{completedCount.done}/{completedCount.total} tasks done</span>
                                                    <span>•</span>
                                                    <span className={pct >= 80 ? 'text-success' : pct >= 50 ? 'text-amber-400' : 'text-rose-400'}>
                                                        {pct}% complete
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {isExpanded ? <FiChevronUp className="text-text-muted" /> : <FiChevronDown className="text-text-muted" />}
                                    </button>

                                    {isExpanded && (
                                        <div className="border-t border-border-subtle p-5 space-y-4">
                                            {challenge.milestones?.map(milestone => {
                                                const filteredTasks = milestone.tasks?.filter(t => filterByTime(t.date)) || [];
                                                if (filteredTasks.length === 0 && timeRange !== 'all') return null;

                                                const isOverdue = milestone.status !== 'completed' && milestone.deadline && new Date(milestone.deadline) < new Date();

                                                return (
                                                    <div key={milestone.id} className={`p-4 rounded-xl border ${isOverdue ? 'border-rose-500/40 bg-rose-950/20' : 'border-border-subtle bg-background/50'}`}>
                                                        <div className="flex justify-between items-center mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-bold text-sm text-text-primary">{milestone.title}</h4>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                                                                    milestone.status === 'completed' ? 'bg-success/20 text-success' :
                                                                    isOverdue ? 'bg-rose-500/20 text-rose-400' :
                                                                    milestone.status === 'unlocked' ? 'bg-cyan-500/20 text-cyan-400' :
                                                                    'bg-surface text-text-muted'
                                                                }`}>
                                                                    {isOverdue ? 'OVERDUE' : milestone.status}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button 
                                                                    onClick={() => handleDirectResetMilestone(milestone.id, milestone.title)}
                                                                    className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-lg border border-amber-500/30 flex items-center gap-1 transition shadow-sm"
                                                                    title="Reset this milestone's tasks to Day 1 starting today"
                                                                >
                                                                    <FiRefreshCw size={10} /> Start Over Task 1
                                                                </button>
                                                                {isOverdue && (
                                                                    <button 
                                                                        onClick={() => openInterventionFor('milestone', milestone.title)}
                                                                        className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded-lg border border-rose-500/30 flex items-center gap-1 transition"
                                                                    >
                                                                        <FiAlertOctagon size={10} /> Ask Why
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Deep Analytics for Milestone */}
                                                        {(() => {
                                                            const milestoneTasks = milestone.tasks || [];
                                                            const totalMTasks = milestoneTasks.length;
                                                            if (totalMTasks === 0) return null;
                                                            const completedMTasks = milestoneTasks.filter(t => t.completed).length;
                                                            const missedMTasks = milestoneTasks.filter(t => !t.completed && t.date && dayjs(t.date).isBefore(dayjs(), 'day')).length;
                                                            
                                                            // Find penalties related to this milestone by checking if penalty description contains any of the skipped task dates
                                                            const milestonePenalties = (data.penalties || []).filter(p => {
                                                                if (p.challenge_id !== challenge.id) return false;
                                                                return milestoneTasks.some(t => !t.completed && t.date && dayjs(t.date).isBefore(dayjs(), 'day') && p.description?.includes(t.date));
                                                            });

                                                            return (
                                                                <div className="bg-surface0/50 p-3 rounded-lg border border-border-subtle/80 mb-4 mt-2">
                                                                    <div className="text-[10px] uppercase font-bold text-text-muted mb-2 tracking-wider flex items-center gap-1.5"><FiActivity /> Deep Analytics</div>
                                                                    <div className="grid grid-cols-4 gap-2">
                                                                        <div className="bg-background/80 rounded p-2 text-center border border-border-subtle">
                                                                            <div className="text-lg font-black text-text-primary">{totalMTasks}</div>
                                                                            <div className="text-[9px] text-text-muted uppercase font-bold">Total</div>
                                                                        </div>
                                                                        <div className="bg-emerald-950/20 rounded p-2 text-center border border-emerald-900/30">
                                                                            <div className="text-lg font-black text-success">{completedMTasks}</div>
                                                                            <div className="text-[9px] text-emerald-500/70 uppercase font-bold">Done</div>
                                                                        </div>
                                                                        <div className="bg-rose-950/20 rounded p-2 text-center border border-rose-900/30">
                                                                            <div className="text-lg font-black text-rose-400">{missedMTasks}</div>
                                                                            <div className="text-[9px] text-rose-500/70 uppercase font-bold">Missed</div>
                                                                        </div>
                                                                        <div className="bg-amber-950/20 rounded p-2 text-center border border-amber-900/30">
                                                                            <div className="text-lg font-black text-amber-400">{milestonePenalties.length}</div>
                                                                            <div className="text-[9px] text-amber-500/70 uppercase font-bold">Penalties</div>
                                                                        </div>
                                                                    </div>
                                                                    {milestonePenalties.length > 0 && (
                                                                        <div className="mt-2 space-y-1">
                                                                            {milestonePenalties.map(p => (
                                                                                <div key={p.id} className="text-[10px] text-rose-400/80 flex justify-between bg-rose-500/5 px-2 py-1 rounded">
                                                                                    <span>⚠️ {p.penalty_type}</span>
                                                                                    <span className="font-mono">-{p.xp_deducted} XP</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}

                                                        <div className="space-y-1.5">
                                                            {(filteredTasks.length > 0 ? filteredTasks : milestone.tasks || []).map(task => {
                                                                const isPast = task.date && dayjs(task.date).isBefore(dayjs(), 'day');
                                                                const isSkipped = !task.completed && isPast;

                                                                return (
                                                                    <div key={task.id} className={`flex items-center justify-between py-2 px-3 rounded-lg text-xs ${isSkipped ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-surface/5'}`}>
                                                                        <div className="flex items-center gap-2.5">
                                                                            {task.completed ? (
                                                                                <FiCheckCircle className="text-success shrink-0" />
                                                                            ) : isSkipped ? (
                                                                                <FiXCircle className="text-rose-400 shrink-0" />
                                                                            ) : (
                                                                                <div className="w-3.5 h-3.5 rounded border border-border-subtle shrink-0" />
                                                                            )}
                                                                            <span className={task.completed ? 'text-text-muted line-through' : isSkipped ? 'text-rose-300' : 'text-white'}>
                                                                                {task.title}
                                                                            </span>
                                                                            {task.date && (
                                                                                <span className="text-text-muted font-mono">{dayjs(task.date).format('MMM DD')}</span>
                                                                            )}
                                                                        </div>

                                                                        {isSkipped && (
                                                                            <button 
                                                                                onClick={() => openInterventionFor('task', task.title)}
                                                                                className="px-2 py-0.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded text-[10px] font-bold transition flex items-center gap-1"
                                                                            >
                                                                                <FiMessageCircle size={10} /> Why?
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }) : (
                            <div className="text-center py-12 text-text-muted card rounded-2xl border border-border-subtle">
                                <FiTarget className="w-10 h-10 mx-auto mb-3 text-text-muted" />
                                <p>{partner.username} has no active goals.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: SKIPPED ITEMS */}
                {activeTab === 'skipped' && (
                    <div className="space-y-6">
                        {/* Skipped Tasks */}
                        <div className="card p-6 rounded-2xl border border-rose-500/20">
                            <h3 className="text-lg font-bold text-rose-400 mb-4 flex items-center gap-2">
                                <FiXCircle /> Skipped Daily Tasks ({filteredSkippedTasks.length})
                            </h3>
                            {filteredSkippedTasks.length > 0 ? (
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                                    {filteredSkippedTasks.map((task, i) => (
                                        <div key={i} className="flex justify-between items-center p-3.5 bg-background border border-rose-500/20 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <FiXCircle className="text-rose-400 shrink-0" />
                                                <div>
                                                    <div className="text-sm font-semibold text-text-primary">{task.title}</div>
                                                    <div className="text-xs text-text-muted mt-0.5">
                                                        <span className="text-rose-400/80">{task.challengeTitle}</span> → {task.milestoneTitle} • {dayjs(task.date).format('MMM DD, YYYY')}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => openInterventionFor('task', task.title)}
                                                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-lg border border-amber-500/30 flex items-center gap-1 transition"
                                                >
                                                    <FiMessageCircle size={12} /> Ask Why
                                                </button>
                                                <button 
                                                    onClick={() => { setInterventionForm({ type: 'punishment', item_type: 'task', item_title: task.title, message: '', punishment: '' }); setShowInterventionModal(true); }}
                                                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-lg border border-rose-500/30 flex items-center gap-1 transition"
                                                >
                                                    <FiZap size={12} /> Punish
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-text-muted text-sm">No skipped tasks in this time range. {partner.username} is on track! 🎯</div>
                            )}
                        </div>

                        {/* Overdue Milestones */}
                        <div className="card p-6 rounded-2xl border border-amber-500/20">
                            <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                                <FiAlertTriangle /> Overdue Milestones ({skippedMilestones.length})
                            </h3>
                            {skippedMilestones.length > 0 ? (
                                <div className="space-y-2">
                                    {skippedMilestones.map((m, i) => (
                                        <div key={i} className="flex justify-between items-center p-3.5 bg-background border border-amber-500/20 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <FiAlertTriangle className="text-amber-400 shrink-0" />
                                                <div>
                                                    <div className="text-sm font-semibold text-text-primary">{m.title}</div>
                                                    <div className="text-xs text-text-muted">{m.challengeTitle} • Deadline: {dayjs(m.deadline).format('MMM DD, YYYY')}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => openInterventionFor('milestone', m.title)}
                                                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-lg border border-amber-500/30 flex items-center gap-1 transition"
                                                >
                                                    <FiMessageCircle size={12} /> Ask Why
                                                </button>
                                                <button 
                                                    onClick={() => { setInterventionForm({ type: 'punishment', item_type: 'milestone', item_title: m.title, message: '', punishment: '' }); setShowInterventionModal(true); }}
                                                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-lg border border-rose-500/30 flex items-center gap-1 transition"
                                                >
                                                    <FiZap size={12} /> Punish
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-text-muted text-sm">No overdue milestones. {partner.username} is meeting deadlines! ✅</div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: INTERVENTIONS HISTORY */}
                {activeTab === 'interventions' && (
                    <div className="card p-6 rounded-2xl border border-border-subtle">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                <FiMessageCircle className="text-primary" /> Intervention History
                            </h3>
                            <button 
                                onClick={() => openInterventionFor('general', 'General Accountability')}
                                className="px-3.5 py-1.5 bg-primary hover:bg-primary text-background text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                            >
                                <FiSend size={12} /> New Intervention
                            </button>
                        </div>

                        {interventions && interventions.length > 0 ? (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                                {interventions.map(iv => {
                                    const isSender = iv.sender?.id === user?.id;
                                    return (
                                        <div key={iv.id} className={`p-4 rounded-xl border ${iv.type === 'punishment' ? 'border-rose-500/30 bg-rose-950/10' : 'border-amber-500/30 bg-amber-950/10'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${iv.type === 'punishment' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                        {iv.type === 'punishment' ? '⚡ Punishment' : '❓ Inquiry'}
                                                    </span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                                                        iv.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                                        iv.status === 'explained' ? 'bg-cyan-500/20 text-cyan-400' :
                                                        iv.status === 'completed' ? 'bg-success/20 text-success' :
                                                        'bg-surface text-text-muted'
                                                    }`}>
                                                        {iv.status}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-text-muted font-mono">{dayjs(iv.createdAt).format('MMM DD, HH:mm')}</span>
                                            </div>

                                            <div className="text-xs text-text-muted mb-1">
                                                <span className="font-bold text-text-primary">{isSender ? 'You' : iv.sender?.username}</span> → <span className="font-bold text-text-primary">{isSender ? iv.receiver?.username : 'You'}</span>
                                                {iv.item_title && <span> about <span className="text-cyan-400 font-semibold">{iv.item_title}</span></span>}
                                            </div>

                                            {iv.message && <p className="text-sm text-text-primary mt-2 p-2 bg-surface/5 rounded-lg">"{iv.message}"</p>}
                                            {iv.punishment && <p className="text-sm text-rose-300 mt-2 p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">⚡ Punishment: {iv.punishment}</p>}
                                            {iv.user_response && <p className="text-sm text-emerald-300 mt-2 p-2 bg-success/10 rounded-lg border border-emerald-500/20">💬 Response: {iv.user_response}</p>}

                                            {iv.status === 'pending' && (
                                                <div className="mt-3 pt-2 border-t border-border-subtle/80 flex gap-2">
                                                    <button 
                                                        onClick={() => handleResetMilestoneFromIntervention(iv.id)}
                                                        className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-text-primary font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-sm shadow-rose-600/20"
                                                    >
                                                        <FiRefreshCw size={12} /> Start Over Task 1 (Reset Milestone to Day 1)
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-text-muted text-sm">No interventions yet between you and {partner.username}.</div>
                        )}
                    </div>
                )}

                {/* TAB: CHAT */}
                {activeTab === 'chat' && (
                    <div className="space-y-4">
                        <ChatSystem partnerId={friendId} />
                    </div>
                )}
                    </>
                )}
            </div>

            {/* Intervention Modal */}
            {showInterventionModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="card max-w-lg w-full p-6 rounded-3xl border border-border-subtle shadow-2xl relative">
                        <button onClick={() => setShowInterventionModal(false)} className="absolute top-5 right-5 text-text-muted hover:text-text-primary text-xl"><FiXCircle /></button>

                        <h3 className="text-xl font-bold mb-1 text-text-primary flex items-center gap-2">
                            <FiAlertOctagon className="text-rose-400" /> Partner Accountability Action
                        </h3>
                        <p className="text-xs text-text-muted mb-6">Send an inquiry or assign a punishment to {partner.username}.</p>

                        <form onSubmit={sendIntervention} className="space-y-4">
                            {/* Type Toggle */}
                            <div className="flex gap-2">
                                <button 
                                    type="button"
                                    onClick={() => setInterventionForm({ ...interventionForm, type: 'inquiry' })}
                                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border ${interventionForm.type === 'inquiry' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-surface/5 text-text-muted border-border-subtle'}`}
                                >
                                    <FiMessageCircle /> Ask Why They Skipped
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setInterventionForm({ ...interventionForm, type: 'punishment' })}
                                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border ${interventionForm.type === 'punishment' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-surface/5 text-text-muted border-border-subtle'}`}
                                >
                                    <FiZap /> Assign Punishment
                                </button>
                            </div>

                            {/* Regarding */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Regarding</label>
                                <input 
                                    type="text" 
                                    value={interventionForm.item_title}
                                    onChange={e => setInterventionForm({ ...interventionForm, item_title: e.target.value })}
                                    className="w-full bg-background border border-border-subtle rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary text-sm"
                                    placeholder="e.g. Daily Task - Day 3"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                                    {interventionForm.type === 'inquiry' ? 'Your Question / Message' : 'Why are you punishing them?'}
                                </label>
                                <textarea 
                                    rows={3}
                                    value={interventionForm.message}
                                    onChange={e => setInterventionForm({ ...interventionForm, message: e.target.value })}
                                    className="w-full bg-background border border-border-subtle rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary text-sm resize-none"
                                    placeholder={interventionForm.type === 'inquiry' ? 'Why did you skip this task?' : 'You missed your deadline...'}
                                />
                            </div>

                            {/* Punishment field */}
                            {interventionForm.type === 'punishment' && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-rose-400">⚡ Punishment Assignment</label>
                                        <button 
                                            type="button"
                                            onClick={() => setInterventionForm({
                                                ...interventionForm,
                                                punishment: 'Start over from Task 1 (Milestone reset to Day 1)',
                                                message: `Milestone "${interventionForm.item_title || 'Current'}" failed/skipped. You must restart this milestone from Task 1 today.`
                                            })}
                                            className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                                        >
                                            <FiRefreshCw size={10} /> Preset: Start Over Task 1
                                        </button>
                                    </div>
                                    <textarea 
                                        rows={2}
                                        value={interventionForm.punishment}
                                        onChange={e => setInterventionForm({ ...interventionForm, punishment: e.target.value })}
                                        className="w-full bg-rose-950/30 border border-rose-500/30 rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-rose-500 text-sm resize-none"
                                        placeholder="e.g. Start over from Task 1, 50 pushups before tomorrow..."
                                    />
                                </div>
                            )}

                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowInterventionModal(false)} className="px-4 py-2.5 rounded-xl border border-border-subtle hover:bg-surface-elevated text-text-primary text-xs font-semibold transition">
                                    Cancel
                                </button>
                                <button type="submit" className={`px-5 py-2.5 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-lg ${interventionForm.type === 'punishment' ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-text-primary shadow-rose-600/20' : 'bg-gradient-to-r from-amber-600 to-primary/5 hover:from-amber-500 hover:to-primary/5 text-white shadow-amber-600/20'}`}>
                                    <FiSend /> {interventionForm.type === 'inquiry' ? 'Send Inquiry' : 'Assign Punishment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
