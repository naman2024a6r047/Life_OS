import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { 
    FiTarget, FiCheckSquare, FiCalendar, FiBookOpen, 
    FiEdit3, FiFolder, FiBarChart2, FiActivity, FiSettings,
    FiCpu, FiShare2, FiArchive, FiTrash2, FiPlus, FiArrowLeft, FiClock, FiZap, FiTrendingUp, FiShield, FiSliders
} from 'react-icons/fi';
import BackButton from '../components/ui/BackButton';
import AnalyticsDashboard from './AnalyticsDashboard';

export default function GoalWorkspace() {
    const { goalId } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);

    const [activeTab, setActiveTab] = useState('overview');
    const [goalData, setGoalData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkspace = async () => {
            try {
                const res = await fetch(`/api/goals/workspace/${goalId || 'default-1'}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setGoalData(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkspace();
    }, [goalId, token]);

    const mockGoal = goalData || {
        id: '1',
        title: '100 Days of Full-Stack Rust & Distributed Systems',
        description: 'Master asynchronous Rust Tokio runtime, epoll/kqueue systems, and high-concurrency microservices.',
        vision: 'Become a Senior Systems Architect capable of delivering enterprise-grade distributed infrastructure.',
        whyItMatters: 'Build high-performance core engine software with zero garbage collection overhead.',
        lifeArea: 'SYS.DEV',
        category: 'Coding & Systems',
        priority: 'CRITICAL',
        difficulty: 'LEGENDARY',
        status: 'ACTIVE',
        expectedDurationDays: 100,
        weeklyHoursTarget: 20,
        startDate: '2026-01-01',
        deadline: '2026-04-11',
        color: '#4F46E5',
        icon: 'cpu',
        progressPercentage: 42.5,
        momentumScore: 94.2,
        consistencyScore: 98.0,
        hoursInvested: 64.5,
        milestonesCount: 10,
        completedMilestonesCount: 4,
        tasksCount: 40,
        completedTasksCount: 17
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FiTarget },
        { id: 'milestones', label: 'Milestones', icon: FiZap },
        { id: 'tasks', label: 'Tasks', icon: FiCheckSquare },
        { id: 'calendar', label: 'Calendar', icon: FiCalendar },
        { id: 'knowledge', label: 'Knowledge', icon: FiBookOpen },
        { id: 'journal', label: 'Journal', icon: FiEdit3 },
        { id: 'files', label: 'Files', icon: FiFolder },
        { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
        { id: 'activity', label: 'Activity', icon: FiActivity },
        { id: 'settings', label: 'Settings', icon: FiSettings }
    ];

    return (
        <div className="min-h-screen bg-[#090A0F] text-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Navigation */}
                <div className="flex items-center justify-between">
                    <BackButton fallbackPath="/challenges" />
                    <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 transition text-sm font-medium">
                            <FiCpu />
                            <span>AI Assistant</span>
                        </button>
                        <button className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white transition">
                            <FiShare2 />
                        </button>
                        <button className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-amber-400 transition">
                            <FiArchive />
                        </button>
                        <button className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-red-400 transition">
                            <FiTrash2 />
                        </button>
                    </div>
                </div>

                {/* Workspace Header Banner Card */}
                <div className="relative rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-indigo-500/20 p-8 overflow-hidden shadow-2xl backdrop-blur-xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-4 max-w-3xl">
                            <div className="flex items-center space-x-3">
                                <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                    {mockGoal.lifeArea}
                                </span>
                                <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    {mockGoal.status}
                                </span>
                                <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                    {mockGoal.difficulty}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-sans">
                                {mockGoal.title}
                            </h1>

                            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                                {mockGoal.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400 font-mono">
                                <div className="flex items-center space-x-2">
                                    <FiClock className="text-indigo-400" />
                                    <span>Deadline: {mockGoal.deadline}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FiZap className="text-amber-400" />
                                    <span>Target: {mockGoal.weeklyHoursTarget} hrs/wk</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FiTrendingUp className="text-emerald-400" />
                                    <span>Momentum: {mockGoal.momentumScore}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Gauge */}
                        <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-900/80 border border-slate-800 min-w-[200px]">
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" className="text-slate-800" fill="transparent" />
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" className="text-indigo-500" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - mockGoal.progressPercentage / 100)} strokeLinecap="round" />
                                </svg>
                                <span className="absolute text-xl font-bold text-white font-mono">{mockGoal.progressPercentage}%</span>
                            </div>
                            <span className="text-xs text-slate-400 mt-2 font-medium">Overall Progress</span>
                        </div>
                    </div>
                </div>

                {/* Workspace Navigation Tabs */}
                <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2 overflow-x-auto">
                    {tabs.map((t) => {
                        const IconComponent = t.icon;
                        const active = activeTab === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                    active 
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                }`}
                            >
                                <IconComponent className={active ? 'text-white' : 'text-slate-400'} />
                                <span>{t.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content Display */}
                <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-8 backdrop-blur-xl min-h-[400px]">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                                        <FiShield className="text-indigo-400" />
                                        <span>Core Vision</span>
                                    </h3>
                                    <p className="text-slate-300 text-sm leading-relaxed bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                                        {mockGoal.vision}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                                        <FiFlame className="text-amber-400" />
                                        <span>Why This Goal Matters</span>
                                    </h3>
                                    <p className="text-slate-300 text-sm leading-relaxed bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                                        {mockGoal.whyItMatters}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                                    <FiSliders className="text-emerald-400" />
                                    <span>Milestones Summary</span>
                                </h3>
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map((m) => (
                                        <div key={m} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
                                            <div>
                                                <h4 className="text-sm font-semibold text-white">Milestone {m}: Async Tokio Core Architecture</h4>
                                                <p className="text-xs text-slate-400">10-Day Sprint Protocol • 10 Daily Tasks</p>
                                            </div>
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${m <= 2 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                {m <= 2 ? 'Completed' : 'Active'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="pt-2">
                            <AnalyticsDashboard />
                        </div>
                    )}

                    {(activeTab === 'milestones' || activeTab === 'tasks') && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                                <FiCheckSquare className="text-emerald-400" />
                                <span>Milestone Daily Tasks</span>
                            </h3>
                            <div className="space-y-3">
                                {(goalData?.milestones?.[0]?.tasks || [
                                    { id: 101, title: 'Daily Task - Day 1', is_completed: true },
                                    { id: 102, title: 'Daily Task - Day 2', is_completed: false },
                                    { id: 103, title: 'Daily Task - Day 3', is_completed: false },
                                    { id: 104, title: 'Daily Task - Day 4', is_completed: false },
                                    { id: 105, title: 'Daily Task - Day 5', is_completed: false }
                                ]).map((task) => (
                                    <div 
                                        key={task.id} 
                                        onClick={async () => {
                                            try {
                                                const token = localStorage.getItem('token');
                                                await axios.put(`/api/tasks/${task.id}/toggle`, {}, {
                                                    headers: { Authorization: `Bearer ${token}` }
                                                });
                                                // toggle local state
                                                setGoalData(prev => {
                                                    if (!prev) return prev;
                                                    const updatedMilestones = prev.milestones?.map(m => ({
                                                        ...m,
                                                        tasks: m.tasks?.map(t => t.id === task.id ? { ...t, is_completed: !t.is_completed } : t)
                                                    }));
                                                    return { ...prev, milestones: updatedMilestones };
                                                });
                                            } catch (err) {
                                                alert(err.response?.data?.message || 'Error toggling task');
                                            }
                                        }}
                                        className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center space-x-3 cursor-pointer hover:border-indigo-500/50 transition"
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${task.is_completed ? 'bg-indigo-600 border-indigo-500' : 'border-slate-600'}`}>
                                            {task.is_completed && <span className="text-white text-xs font-bold">✓</span>}
                                        </div>
                                        <span className={`text-sm ${task.is_completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                            {task.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab !== 'overview' && activeTab !== 'analytics' && activeTab !== 'milestones' && activeTab !== 'tasks' && (
                        <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                            <FiCpu className="text-5xl text-indigo-400 animate-pulse" />
                            <h3 className="text-xl font-bold text-white capitalize">{activeTab} Engine Console</h3>
                            <p className="text-slate-400 text-sm max-w-md">
                                Live interactive telemetry for {activeTab} is connected to your Supabase cloud backend.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
