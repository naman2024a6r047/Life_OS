import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiArrowLeft, FiCheckCircle, FiLock, FiClock, FiUserCheck, 
    FiUserPlus, FiTrash2, FiPlus, FiTarget, FiZap, FiCalendar, 
    FiCheckSquare, FiAlertCircle, FiX, FiEdit2
} from 'react-icons/fi';
import dayjs from 'dayjs';
import BackButton from '../components/ui/BackButton';

export default function ChallengeDetail() {
    const { id } = useParams();
    const [challenge, setChallenge] = useState(null);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [manualIdMode, setManualIdMode] = useState(false);

    // Add Task for specific Day state
    const [addTaskTarget, setAddTaskTarget] = useState(null); // { milestoneId, dayNum, date }
    const [newTaskForm, setNewTaskForm] = useState({
        title: '',
        priority: 'P1',
        energy_level: 'high',
        estimated_minutes: 30,
        hours: 1,
    });

    // Edit Task state
    const [editTaskModal, setEditTaskModal] = useState(null);
    const [editTaskForm, setEditTaskForm] = useState({
        title: '',
        priority: 'P1',
        energy_level: 'high',
        estimated_minutes: 30,
        hours: 1,
        date: ''
    });

    const fetchChallengeData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [challengeRes, friendsRes] = await Promise.all([
                axios.get(`/api/challenges/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/friends', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
            ]);
            let data = challengeRes.data;

            // Ensure milestones exist with Day 1..Day 10 schedule
            if (data) {
                const milestonesList = data.milestones || data.Milestones || [];
                if (milestonesList.length === 0) {
                    const today = dayjs();
                    data.milestones = [
                        {
                            id: `ms_${id}_1`,
                            title: 'Milestone 1: 10-Day Sprint (Day 1 - Day 10)',
                            start_date: today.format('YYYY-MM-DD'),
                            deadline: today.add(9, 'day').format('YYYY-MM-DD'),
                            status: 'unlocked',
                            tasks: [
                                { id: `t_${id}_1`, title: 'Day 1: Setup & Initial Problem Solving', priority: 'P1', energy_level: 'high', estimated_minutes: 45, is_completed: false, date: today.format('YYYY-MM-DD') },
                                { id: `t_${id}_2`, title: 'Day 2: Data Structures & Core Logic', priority: 'P1', energy_level: 'high', estimated_minutes: 60, is_completed: false, date: today.add(1, 'day').format('YYYY-MM-DD') },
                                { id: `t_${id}_3`, title: 'Day 3: Advanced Concepts & Practice', priority: 'P2', energy_level: 'medium', estimated_minutes: 60, is_completed: false, date: today.add(2, 'day').format('YYYY-MM-DD') }
                            ]
                        }
                    ];
                } else {
                    data.milestones = milestonesList.map(ms => ({
                        ...ms,
                        tasks: ms.tasks || ms.MilestoneTasks || []
                    }));
                }
            }

            setChallenge(data);
            setFriends(friendsRes.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChallengeData();
    }, [id]);

    const getAuthHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const handleToggleTask = async (taskId) => {
        try {
            await axios.put(`/api/tasks/${taskId}/toggle`, {}, getAuthHeaders());
            fetchChallengeData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error toggling task');
        }
    };

    const openAddTaskForDay = (milestoneId, dayNum, targetDateStr) => {
        setAddTaskTarget({ milestoneId, dayNum, date: targetDateStr });
        setNewTaskForm({
            title: '',
            priority: 'P1',
            energy_level: 'high',
            estimated_minutes: 30,
            hours: 1
        });
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskForm.title.trim() || !addTaskTarget) return;

        try {
            await axios.post('/api/tasks', {
                milestone_id: addTaskTarget.milestoneId,
                title: newTaskForm.title,
                priority: newTaskForm.priority,
                energy_level: newTaskForm.energy_level,
                estimated_minutes: newTaskForm.estimated_minutes,
                hours: newTaskForm.hours,
                date: addTaskTarget.date
            }, getAuthHeaders());
            setAddTaskTarget(null);
            fetchChallengeData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating task');
        }
    };

    const openEditTaskModal = (task, e) => {
        e.stopPropagation();
        setEditTaskModal(task);
        setEditTaskForm({
            title: task.title || '',
            priority: task.priority || 'P1',
            energy_level: task.energy_level || 'high',
            estimated_minutes: task.estimated_minutes || 30,
            hours: task.hours || 0,
            date: task.date ? dayjs(task.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
        });
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        if (!editTaskModal) return;

        try {
            await axios.put(`/api/tasks/${editTaskModal.id}`, editTaskForm, getAuthHeaders());
            setEditTaskModal(null);
            fetchChallengeData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating task');
        }
    };

    const handleDeleteTask = async (taskId, taskTitle, e) => {
        e.stopPropagation();
        if (!confirm(`Are you sure you want to delete task "${taskTitle}"?`)) return;

        try {
            await axios.delete(`/api/tasks/${taskId}`, getAuthHeaders());
            fetchChallengeData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting task');
        }
    };

    const handleDeleteGoal = async () => {
        if (window.confirm(`Are you sure you want to delete the goal "${challenge.title}"? This action cannot be undone.`)) {
            try {
                await axios.delete(`/api/challenges/${id}`, getAuthHeaders());
                alert('Goal deleted successfully!');
                window.location.href = '/challenges';
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete goal');
            }
        }
    };

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center min-h-[60vh] text-text-primary">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-text-muted text-sm font-mono">Loading roadmap...</p>
                </div>
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className="w-full p-8 text-text-primary">
                <BackButton fallbackPath="/challenges" />
                <div className="text-center py-20 text-text-muted">Goal not found.</div>
            </div>
        );
    }

    // Calculate overall stats
    let totalTasksCount = 0;
    let completedTasksCount = 0;

    challenge.milestones?.forEach(m => {
        m.tasks?.forEach(t => {
            totalTasksCount++;
            if (t.is_completed || t.completed) completedTasksCount++;
        });
    });

    const overallProgress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    return (
        <div className="w-full p-4 md:p-8 relative overflow-hidden text-text-primary font-sans">
            <div className="ambient-glow top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/15"></div>
            <div className="ambient-glow bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10"></div>

            <div className="max-w-5xl mx-auto space-y-8 relative z-10">
                <BackButton fallbackPath="/challenges" />

                {/* Header Section */}
                <header className="card p-6 md:p-8 rounded-3xl border border-primary/20 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-full font-mono uppercase tracking-wider font-bold border border-primary/30">
                                {challenge.difficulty || 'LEGENDARY'} Mode
                            </span>
                            <span className={`text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold font-mono ${
                                challenge.status === 'active' ? 'bg-success/20 text-success border border-emerald-500/30' : 'bg-surface/10 text-text-muted'
                            }`}>
                                {challenge.status}
                            </span>
                            <span className="text-xs px-3 py-1 bg-surface/5 text-text-muted rounded-full font-mono uppercase tracking-wider">
                                {challenge.category || 'General'}
                            </span>
                        </div>

                        <button 
                            onClick={handleDeleteGoal}
                            className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                            title="Delete Goal"
                        >
                            <FiTrash2 /> Delete Goal
                        </button>
                    </div>

                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight mb-2">{challenge.title}</h1>
                        {challenge.description && (
                            <p className="text-text-muted text-sm max-w-3xl leading-relaxed">{challenge.description}</p>
                        )}
                    </div>

                    {/* Overall Progress Bar */}
                    <div className="pt-4 border-t border-border-subtle/80 space-y-2">
                        <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-text-muted uppercase font-bold flex items-center gap-2">
                                <FiTarget className="text-primary" /> Overall Goal Progress
                            </span>
                            <span className="text-success font-bold">{completedTasksCount} / {totalTasksCount} Tasks ({overallProgress}%)</span>
                        </div>
                        <div className="w-full bg-background h-2.5 rounded-full overflow-hidden border border-border-subtle">
                            <div 
                                className="bg-gradient-to-r from-primary/20 via-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                                style={{ width: `${overallProgress}%` }}
                            ></div>
                        </div>
                    </div>
                </header>

                {/* Journey Roadmap (Milestones & Daily Schedule) */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-extrabold text-text-primary tracking-tight flex items-center gap-2">
                            <FiCheckSquare className="text-cyan-400" /> Milestones & Daily Tasks
                        </h2>
                        <span className="text-xs text-text-muted font-mono">{challenge.milestones?.length || 0} Milestones</span>
                    </div>

                    <div className="space-y-8">
                        {challenge.milestones?.map((milestone, idx) => {
                            const tasks = milestone.tasks || milestone.MilestoneTasks || milestone.milestone_tasks || [];
                            const completedTasks = tasks.filter(t => t.is_completed || t.completed);
                            const pct = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
                            const isUnlocked = milestone.status === 'unlocked' || milestone.status === 'rejected' || !milestone.status;
                            const isCompleted = milestone.status === 'completed' || pct === 100;
                            const totalEstMinutes = tasks.reduce((sum, t) => sum + (t.estimated_minutes || 30), 0);
                            const totalHours = tasks.reduce((sum, t) => sum + (t.hours || 0), 0);

                            // Calculate Days range for this milestone (e.g. Day 1 to Day 10)
                            let mStart = milestone.start_date ? dayjs(milestone.start_date) : dayjs();
                            if (!mStart.isValid()) mStart = dayjs();
                            let mEnd = milestone.deadline ? dayjs(milestone.deadline) : mStart.add(9, 'day');
                            if (!mEnd.isValid()) mEnd = mStart.add(9, 'day');
                            
                            let dayCount = Math.max(1, mEnd.diff(mStart, 'day') + 1);
                            if (isNaN(dayCount) || dayCount <= 0) dayCount = 10;

                            // Build day schedule list (Day 1..Day N)
                            const daysList = [];
                            for (let d = 0; d < dayCount; d++) {
                                const targetDate = mStart.add(d, 'day');
                                const targetDateStr = targetDate.format('YYYY-MM-DD');

                                // Match tasks for this day safely across timezones
                                const dayTasks = tasks.filter(t => {
                                    if (t.date) {
                                        const tDateStr = typeof t.date === 'string' ? t.date.split('T')[0] : dayjs(t.date).format('YYYY-MM-DD');
                                        return tDateStr === targetDateStr;
                                    }
                                    return d === 0; // Fallback unassigned tasks to Day 1
                                });

                                daysList.push({
                                    dayNum: d + 1,
                                    dateObj: targetDate,
                                    dateStr: targetDateStr,
                                    tasks: dayTasks
                                });
                            }

                            return (
                                <div 
                                    key={milestone.id}
                                    className={`card p-6 md:p-8 rounded-3xl border transition-all ${
                                        isCompleted ? 'border-emerald-500/30 bg-emerald-950/10' :
                                        isUnlocked ? 'border-border-subtle bg-background/50' : 'border-border-subtle bg-surface0/30 opacity-80'
                                    }`}
                                >
                                    {/* Milestone Header (Strict structure: No delete milestone option) */}
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-border-subtle">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                                                isCompleted ? 'bg-success/20 text-success border border-emerald-500/30' : 'bg-primary/20 text-primary border border-primary/30'
                                            }`}>
                                                M{idx + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-extrabold text-xl text-text-primary">{milestone.title}</h3>
                                                <div className="flex items-center gap-3 text-xs text-text-muted font-mono mt-0.5">
                                                    <span>Day 1 – Day {dayCount} ({mStart.format('MMM D')} – {mEnd.format('MMM D')})</span>
                                                    <span>•</span>
                                                    <span>⏱ {Math.round(totalEstMinutes / 60 * 10) / 10} hrs total</span>
                                                    {totalHours > 0 && <><span>•</span><span>🕐 {totalHours}h assigned</span></>}
                                                </div>
                                            </div>
                                        </div>

                                        <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-md uppercase tracking-wider ${
                                            isCompleted ? 'bg-success/20 text-success' :
                                            isUnlocked ? 'bg-cyan-500/20 text-cyan-400' : 'bg-surface-elevated text-text-muted'
                                        }`}>
                                            {isCompleted ? 'COMPLETED' : milestone.status}
                                        </span>
                                    </div>

                                    {/* Milestone Progress Bar */}
                                    <div className="mb-6 space-y-1.5">
                                        <div className="flex justify-between text-xs font-mono">
                                            <span className="text-text-muted">Milestone Progress</span>
                                            <span className="text-text-primary font-bold">{completedTasks.length} / {tasks.length} tasks ({pct}%)</span>
                                        </div>
                                        <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-subtle">
                                            <div className="bg-gradient-to-r from-primary/20 to-emerald-400 h-full rounded-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
                                        </div>
                                    </div>

                                    {/* Days Breakdown (Day 1, Day 2, Day 3... Day N) */}
                                    <div className="space-y-4">
                                        {daysList.map(dayItem => {
                                            const isMilestoneLocked = isCompleted;
                                            const dayCompletedCount = isMilestoneLocked ? dayItem.tasks.length : dayItem.tasks.filter(t => t.is_completed || t.completed).length;
                                            const isAddingToThisDay = addTaskTarget?.milestoneId === milestone.id && addTaskTarget?.dayNum === dayItem.dayNum;
                                            const isToday = dayItem.dateStr === dayjs().format('YYYY-MM-DD');

                                            return (
                                                <div 
                                                    key={dayItem.dayNum}
                                                    className={`p-4 rounded-2xl border transition-all ${
                                                        isToday ? 'bg-primary/20 border-primary/40 shadow-lg shadow-primary/30' : 'bg-surface0/60 border-border-subtle/80'
                                                    }`}
                                                >
                                                    {/* Day Header with + Add Task for Day button */}
                                                    <div className="flex justify-between items-center pb-3 mb-3 border-b border-border-subtle/60">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`w-2.5 h-2.5 rounded-full ${isToday ? 'bg-primary animate-pulse' : 'bg-surface'}`}></span>
                                                            <h4 className="font-extrabold text-sm text-text-primary font-mono flex items-center gap-2">
                                                                Day {dayItem.dayNum} 
                                                                <span className="text-text-muted font-normal text-xs">({dayItem.dateObj.format('MMM DD, YYYY')})</span>
                                                                {isToday && <span className="text-[10px] bg-primary/20 text-primary font-bold px-2 py-0.5 rounded font-sans">TODAY</span>}
                                                            </h4>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[11px] font-mono text-text-muted">
                                                                {dayCompletedCount} / {dayItem.tasks.length} done
                                                            </span>

                                                            {/* Explicit Add Task for Day button */}
                                                            <button 
                                                                onClick={() => openAddTaskForDay(milestone.id, dayItem.dayNum, dayItem.dateStr)}
                                                                className="px-3 py-1.5 bg-primary hover:bg-primary text-background rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-primary/30"
                                                            >
                                                                <FiPlus size={13} /> Add Task to Day {dayItem.dayNum}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Inline Add Task Form for this Specific Day */}
                                                    <AnimatePresence>
                                                        {isAddingToThisDay && (
                                                            <motion.form 
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                onSubmit={handleCreateTask}
                                                                className="p-4 bg-background/90 rounded-2xl border border-primary/40 mb-3 space-y-3"
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                                                        <FiPlus /> New Task for Day {dayItem.dayNum} ({dayItem.dateObj.format('MMM DD')})
                                                                    </h5>
                                                                    <button type="button" onClick={() => setAddTaskTarget(null)} className="text-text-muted hover:text-text-primary">
                                                                        <FiX size={14} />
                                                                    </button>
                                                                </div>

                                                                <input 
                                                                    type="text" 
                                                                    required
                                                                    value={newTaskForm.title}
                                                                    onChange={e => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                                                                    placeholder="e.g. Go for a run, Do 5 LeetCode problems, Watch Tokio lecture..."
                                                                    className="w-full bg-surface border border-border-subtle rounded-xl px-3.5 py-2 text-text-primary text-xs focus:outline-none focus:border-primary"
                                                                />

                                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                                                                    <div>
                                                                        <label className="block text-[10px] text-text-muted mb-1">Priority</label>
                                                                        <select 
                                                                            value={newTaskForm.priority}
                                                                            onChange={e => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                                                                            className="w-full bg-surface border border-border-subtle rounded-lg px-2.5 py-1.5 text-text-primary"
                                                                        >
                                                                            <option value="P1">🔴 P1 (Critical - 30 XP)</option>
                                                                            <option value="P2">🟡 P2 (Medium - 20 XP)</option>
                                                                            <option value="P3">🟣 P3 (Low - 10 XP)</option>
                                                                        </select>
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-[10px] text-text-muted mb-1">Energy Required</label>
                                                                        <select 
                                                                            value={newTaskForm.energy_level}
                                                                            onChange={e => setNewTaskForm({ ...newTaskForm, energy_level: e.target.value })}
                                                                            className="w-full bg-surface border border-border-subtle rounded-lg px-2.5 py-1.5 text-text-primary"
                                                                        >
                                                                            <option value="high">⚡ High Focus</option>
                                                                            <option value="medium">💡 Medium Focus</option>
                                                                            <option value="low">☕ Low Focus</option>
                                                                        </select>
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-[10px] text-text-muted mb-1">Est. Minutes</label>
                                                                        <input 
                                                                            type="number"
                                                                            min="5"
                                                                            max="480"
                                                                            value={newTaskForm.estimated_minutes}
                                                                            onChange={e => setNewTaskForm({ ...newTaskForm, estimated_minutes: Number(e.target.value) })}
                                                                            className="w-full bg-surface border border-border-subtle rounded-lg px-2.5 py-1.5 text-text-primary"
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-[10px] text-text-muted mb-1">Hours</label>
                                                                        <input 
                                                                            type="number"
                                                                            min="0"
                                                                            max="24"
                                                                            step="0.5"
                                                                            value={newTaskForm.hours}
                                                                            onChange={e => setNewTaskForm({ ...newTaskForm, hours: Number(e.target.value) })}
                                                                            className="w-full bg-surface border border-border-subtle rounded-lg px-2.5 py-1.5 text-text-primary"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="flex justify-end gap-2 pt-1">
                                                                    <button type="button" onClick={() => setAddTaskTarget(null)} className="px-3 py-1.5 rounded-lg border border-border-subtle text-text-muted text-xs font-semibold hover:bg-surface-elevated">
                                                                        Cancel
                                                                    </button>
                                                                    <button type="submit" className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary text-background text-xs font-bold transition">
                                                                        Save Task to Day {dayItem.dayNum}
                                                                    </button>
                                                                </div>
                                                            </motion.form>
                                                        )}
                                                    </AnimatePresence>

                                                    {/* Day Tasks List */}
                                                    {dayItem.tasks.length === 0 ? (
                                                        <div className="text-center py-4 text-text-muted text-xs font-mono">
                                                            No tasks set for Day {dayItem.dayNum}. Click "+ Add Task to Day {dayItem.dayNum}" above to add items.
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {dayItem.tasks.map(task => {
                                                                const isLockedForEdits = milestone.status === 'completed' || milestone.status === 'pending_review';
                                                                const isDone = task.is_completed || task.completed;
                                                                return (
                                                                    <div 
                                                                        key={task.id}
                                                                        onClick={() => !isLockedForEdits && handleToggleTask(task.id)}
                                                                        className={`p-3 rounded-xl border transition-all flex items-center justify-between group ${
                                                                            isDone ? 'bg-emerald-950/20 border-emerald-500/20 opacity-70' : 'bg-background/90 border-border-subtle hover:border-primary/40'
                                                                        } ${isLockedForEdits ? 'cursor-default opacity-90' : 'cursor-pointer'}`}
                                                                        title={isLockedForEdits ? `Milestone is ${milestone.status.replace('_', ' ')}` : ""}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                                                                                isDone ? 'bg-success border-emerald-500 text-text-primary' : 'border-border-subtle group-hover:border-primary'
                                                                            }`}>
                                                                                {isDone && <FiCheckCircle size={14} />}
                                                                            </div>

                                                                            <div>
                                                                                <div className={`text-xs font-bold ${isDone ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                                                                                    {task.title}
                                                                                </div>
                                                                                <div className="flex items-center gap-2 mt-0.5 font-mono text-[10px] text-text-muted">
                                                                                    <span className={`px-1.5 py-0.2 rounded font-bold ${
                                                                                        task.priority === 'P1' ? 'bg-rose-500/20 text-rose-400' :
                                                                                        task.priority === 'P2' ? 'bg-amber-500/20 text-amber-400' : 'bg-primary/20 text-primary'
                                                                                    }`}>
                                                                                        {task.priority || 'P1'}
                                                                                    </span>

                                                                                    <span>
                                                                                        {task.energy_level === 'high' ? '⚡ High Focus' : task.energy_level === 'medium' ? '💡 Med Focus' : '☕ Low Focus'}
                                                                                    </span>

                                                                                    <span>•</span>
                                                                                    <span>⏱ {task.estimated_minutes || 30} mins</span>
                                                                                    {task.hours > 0 && <><span>•</span><span>🕐 {task.hours}h</span></>}
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Option to Edit & Delete Task */}
                                                                        {!isLockedForEdits && (
                                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                                                                <button 
                                                                                    onClick={(e) => openEditTaskModal(task, e)}
                                                                                    className="p-1.5 hover:bg-primary/20 text-primary rounded-lg transition"
                                                                                    title="Edit Task"
                                                                                >
                                                                                    <FiEdit2 size={13} />
                                                                                </button>

                                                                                <button 
                                                                                    onClick={(e) => handleDeleteTask(task.id, task.title, e)}
                                                                                    className="p-1.5 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                                                                                    title="Delete Task"
                                                                                >
                                                                                    <FiTrash2 size={13} />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Submit Milestone Proof for Peer Review */}
                                    {isUnlocked && tasks.length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-border-subtle">
                                            {milestone.status === 'pending_review' ? (
                                                <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl flex items-center justify-center gap-2 text-warning">
                                                    <span className="text-xl">⏳</span>
                                                    <div>
                                                        <h4 className="text-xs font-bold uppercase tracking-wider">Pending Peer Review</h4>
                                                        <p className="text-[10px] opacity-80">You have submitted this milestone. Waiting for your partner's approval.</p>
                                                    </div>
                                                </div>
                                            ) : milestone.status === 'completed' ? (
                                                <div className="p-4 bg-success/10 border border-success/30 rounded-xl flex items-center justify-center gap-2 text-success">
                                                    <span className="text-xl">✅</span>
                                                    <div>
                                                        <h4 className="text-xs font-bold uppercase tracking-wider">Peer Review Approved</h4>
                                                        <p className="text-[10px] opacity-80">Your partner has approved your work for this milestone.</p>
                                                    </div>
                                                </div>
                                            ) : !tasks.every(t => t.is_completed || t.completed) ? (
                                                <div className="p-3 bg-surface-elevated/50 rounded-xl text-center">
                                                    <p className="text-[11px] text-text-muted">Complete all tasks above to submit this milestone for peer review.</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {milestone.status === 'rejected' && (
                                                        <div className="p-4 mb-4 bg-danger/10 border border-danger/30 rounded-xl flex items-start gap-3 text-danger">
                                                            <span className="text-lg mt-0.5">⚠️</span>
                                                            <div>
                                                                <h4 className="text-xs font-bold uppercase tracking-wider">Peer Review Rejected</h4>
                                                                <p className="text-[10px] text-danger/80 mt-1">Your partner requested improvements. Please review their feedback, update your tasks if necessary, and resubmit below.</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                                            <FiUserCheck /> {milestone.status === 'rejected' ? 'Resubmit Milestone Proof' : 'Submit Milestone Proof to Partner'}
                                                        </h4>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setManualIdMode(!manualIdMode)} 
                                                            className="text-[11px] text-text-muted hover:text-text-primary underline font-mono"
                                                        >
                                                            {manualIdMode ? 'Select from Friends list' : 'Paste User ID manually'}
                                                        </button>
                                                    </div>

                                                    <form 
                                                        onSubmit={async (e) => {
                                                            e.preventDefault();
                                                            const formData = new FormData(e.target);
                                                            try {
                                                                const token = localStorage.getItem('token');
                                                                await axios.post('/api/reviews/submit', {
                                                                    milestone_id: milestone.id,
                                                                    reviewer_id: formData.get('reviewer_id'),
                                                                    evidence_url: formData.get('evidence_url'),
                                                                    reflection: formData.get('reflection')
                                                                }, { headers: { Authorization: `Bearer ${token}` } });
                                                                alert('Milestone submitted for peer review to your partner!');
                                                                fetchChallengeData();
                                                            } catch (err) {
                                                                alert(err.response?.data?.message || 'Error submitting for review');
                                                            }
                                                        }}
                                                        className="space-y-3"
                                                    >
                                                        {manualIdMode ? (
                                                            <input 
                                                                required 
                                                                name="reviewer_id" 
                                                                type="text" 
                                                                placeholder="Partner User ID (Paste here)" 
                                                                className="w-full px-3 py-2 bg-background border border-border-subtle rounded-xl text-xs text-text-primary focus:border-primary focus:outline-none" 
                                                            />
                                                        ) : (
                                                            <div>
                                                                <select 
                                                                    required 
                                                                    name="reviewer_id" 
                                                                    className="w-full px-3 py-2 bg-background border border-border-subtle rounded-xl text-xs text-text-primary focus:border-primary focus:outline-none cursor-pointer"
                                                                >
                                                                    <option value="">Select Accountability Partner / Friend...</option>
                                                                    {friends.map(friend => (
                                                                        <option key={friend.id} value={friend.id}>
                                                                            👤 {friend.username} (Level {friend.level || 1})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}

                                                        <input 
                                                            required 
                                                            name="evidence_url" 
                                                            type="url" 
                                                            placeholder="Proof / Evidence URL (GitHub commit, Notion link, screenshot)" 
                                                            className="w-full px-3 py-2 bg-background border border-border-subtle rounded-xl text-xs text-text-primary focus:border-primary focus:outline-none" 
                                                        />

                                                        <textarea 
                                                            required 
                                                            name="reflection" 
                                                            placeholder="Short reflection on what you learned or built during this milestone..." 
                                                            className="w-full px-3 py-2 bg-background border border-border-subtle rounded-xl text-xs h-16 resize-none text-text-primary focus:border-primary focus:outline-none" 
                                                        />

                                                        <button 
                                                            type="submit" 
                                                            className="w-full bg-primary/20 hover:bg-primary text-primary hover:text-background border border-primary/30 transition-all py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                                                        >
                                                            <FiUserCheck /> Send Proof to Partner for Review
                                                        </button>
                                                    </form>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Edit Task Modal */}
            {editTaskModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="card max-w-lg w-full p-6 rounded-3xl border border-border-subtle shadow-2xl relative">
                        <button onClick={() => setEditTaskModal(null)} className="absolute top-5 right-5 text-text-muted hover:text-text-primary text-xl">
                            <FiX />
                        </button>

                        <h3 className="text-xl font-bold mb-1 text-text-primary flex items-center gap-2">
                            <FiEdit2 className="text-primary" /> Edit Task
                        </h3>
                        <p className="text-xs text-text-muted mb-6">Modify task title, priority, energy, or target date.</p>

                        <form onSubmit={handleUpdateTask} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Task Title</label>
                                <input 
                                    type="text" 
                                    required
                                    value={editTaskForm.title}
                                    onChange={e => setEditTaskForm({ ...editTaskForm, title: e.target.value })}
                                    className="w-full bg-background border border-border-subtle rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Priority</label>
                                    <select 
                                        value={editTaskForm.priority}
                                        onChange={e => setEditTaskForm({ ...editTaskForm, priority: e.target.value })}
                                        className="w-full bg-background border border-border-subtle rounded-xl px-3 py-2 text-text-primary text-xs focus:border-primary focus:outline-none"
                                    >
                                        <option value="P1">🔴 P1 (Critical - 30 XP)</option>
                                        <option value="P2">🟡 P2 (Medium - 20 XP)</option>
                                        <option value="P3">🟣 P3 (Low - 10 XP)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Energy Level</label>
                                    <select 
                                        value={editTaskForm.energy_level}
                                        onChange={e => setEditTaskForm({ ...editTaskForm, energy_level: e.target.value })}
                                        className="w-full bg-background border border-border-subtle rounded-xl px-3 py-2 text-text-primary text-xs focus:border-primary focus:outline-none"
                                    >
                                        <option value="high">⚡ High Focus</option>
                                        <option value="medium">💡 Medium Focus</option>
                                        <option value="low">☕ Low Focus</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Est. Minutes</label>
                                    <input 
                                        type="number"
                                        min="5"
                                        max="480"
                                        value={editTaskForm.estimated_minutes}
                                        onChange={e => setEditTaskForm({ ...editTaskForm, estimated_minutes: Number(e.target.value) })}
                                        className="w-full bg-background border border-border-subtle rounded-xl px-3 py-2 text-text-primary text-xs focus:border-primary focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Hours</label>
                                    <input 
                                        type="number"
                                        min="0"
                                        max="24"
                                        step="0.5"
                                        value={editTaskForm.hours}
                                        onChange={e => setEditTaskForm({ ...editTaskForm, hours: Number(e.target.value) })}
                                        className="w-full bg-background border border-border-subtle rounded-xl px-3 py-2 text-text-primary text-xs focus:border-primary focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Target Date</label>
                                    <input 
                                        type="date"
                                        value={editTaskForm.date}
                                        onChange={e => setEditTaskForm({ ...editTaskForm, date: e.target.value })}
                                        className="w-full bg-background border border-border-subtle rounded-xl px-3 py-2 text-text-primary text-xs focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setEditTaskModal(null)} className="px-4 py-2 rounded-xl border border-border-subtle text-text-muted text-xs font-semibold hover:bg-surface-elevated">
                                    Cancel
                                </button>
                                <button type="submit" className="px-5 py-2.5 bg-primary hover:bg-primary text-background font-bold rounded-xl text-xs transition">
                                    Update Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
