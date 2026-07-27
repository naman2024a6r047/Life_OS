import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { FiBook, FiClock, FiShield, FiTarget, FiXCircle, FiCalendar, FiPlay, FiBarChart2, FiPlus } from 'react-icons/fi';
import dayjs from 'dayjs';
import ExamPlanner from './ExamPlanner';
import FocusMode from './FocusMode';
import ExamAnalytics from './ExamAnalytics';

export default function ExamDashboard() {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [examData, setExamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'planner', 'focus', 'analytics'
    
    // New Exam Modal state
    const [showNewExamModal, setShowNewExamModal] = useState(false);
    const [newExamForm, setNewExamForm] = useState({
        reason: '',
        exam_type: 'Semester',
        start_date: dayjs().format('YYYY-MM-DD'),
        end_date: dayjs().add(14, 'day').format('YYYY-MM-DD')
    });
    const [submittingNewExam, setSubmittingNewExam] = useState(false);

    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/exams/dashboard', {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setExamData(res.data);
        } catch (error) {
            console.error('Error fetching exam dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleDeactivate = async () => {
        if (window.confirm("Are you sure you want to exit Exam Mode? All previous challenges and streaks will resume.")) {
            try {
                const token = localStorage.getItem('token');
                await axios.post('/api/exams/deactivate', {}, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                
                setUser({ ...user, is_in_exam_mode: false });
                navigate('/');
            } catch (error) {
                console.error(error);
                alert("Failed to deactivate Exam Mode.");
            }
        }
    };

    const handleCreateNewExam = async (e) => {
        e.preventDefault();
        if (!newExamForm.reason.trim()) {
            alert('Please enter an exam name or focus reason.');
            return;
        }

        setSubmittingNewExam(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/exams/new-session', newExamForm, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            setShowNewExamModal(false);
            setNewExamForm({
                reason: '',
                exam_type: 'Semester',
                start_date: dayjs().format('YYYY-MM-DD'),
                end_date: dayjs().add(14, 'day').format('YYYY-MM-DD')
            });

            await fetchDashboard();
            setActiveTab('planner');
        } catch (error) {
            console.error('Error creating new exam session:', error);
            alert('Failed to start new exam session.');
        } finally {
            setSubmittingNewExam(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#090A0F] text-white flex items-center justify-center">Loading Exam Shield...</div>;

    if (!examData) {
        return (
            <div className="min-h-screen bg-[#090A0F] text-white flex flex-col items-center justify-center p-8">
                <FiShield className="w-24 h-24 text-accent mb-6" />
                <h1 className="text-4xl font-bold mb-4">Exam Mode Error</h1>
                <p className="text-textSecondary mb-8 text-center max-w-md">
                    You are in Exam Mode, but we couldn't load your active session data. 
                </p>
                <button onClick={handleDeactivate} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors font-medium flex items-center gap-2">
                    <FiXCircle /> Force Exit Exam Mode
                </button>
            </div>
        );
    }

    const daysRemaining = dayjs(examData.end_date).diff(dayjs(), 'day');

    return (
        <div className="min-h-screen bg-[#090A0F] text-white font-sans relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="ambient-glow top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/10"></div>
            <div className="ambient-glow bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10"></div>

            {/* Top Navigation Bar specific to Exam Mode */}
            <nav className="border-b border-white/10 bg-[#090A0F]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-cyan-400 font-bold text-xl cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                        <FiShield className="w-6 h-6" /> Exam Shield
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
                        >
                            Dashboard
                        </button>
                        <button 
                            onClick={() => setActiveTab('planner')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'planner' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
                        >
                            Planner
                        </button>
                        <button 
                            onClick={() => setActiveTab('focus')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'focus' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
                        >
                            Focus Mode
                        </button>
                        <button 
                            onClick={() => setActiveTab('analytics')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === 'analytics' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
                        >
                            <FiBarChart2 /> Analytics
                        </button>
                        
                        <button 
                            onClick={() => setShowNewExamModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-sm transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-1.5 ml-2"
                        >
                            <FiPlus /> New Exam
                        </button>

                        <button onClick={handleDeactivate} className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                            <FiXCircle /> Exit
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
                {activeTab === 'dashboard' && (
                    <>
                        {/* Header & Countdown */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                            <div>
                                <h1 className="text-4xl font-bold mb-2 text-slate-100 flex items-center gap-3">
                                    Focus on {examData.reason}
                                    <button 
                                        onClick={() => setShowNewExamModal(true)} 
                                        className="text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full transition font-semibold flex items-center gap-1"
                                    >
                                        <FiPlus /> New Exam
                                    </button>
                                </h1>
                                <p className="text-slate-400 text-lg">All your LifeOS goals and streaks are safely frozen.</p>
                            </div>
                            <div className="glass-panel px-8 py-6 rounded-2xl flex flex-col items-center border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                                <span className="text-cyan-400/80 text-sm font-bold uppercase tracking-widest mb-1">Days Remaining</span>
                                <div className="text-6xl font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">{daysRemaining}</div>
                            </div>
                        </div>

                        {/* Dashboard Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                            <div className="glass-card p-6 rounded-2xl">
                                <div className="flex items-center gap-3 mb-4 text-slate-400">
                                    <FiClock className="w-5 h-5 text-indigo-400" />
                                    <h3 className="font-semibold uppercase tracking-wider text-xs">Total Study Hours</h3>
                                </div>
                                <p className="text-3xl font-extrabold">{examData.total_study_hours?.toFixed(1) || '0.0'} <span className="text-sm font-medium text-slate-500">hrs</span></p>
                            </div>
                            <div className="glass-card p-6 rounded-2xl">
                                <div className="flex items-center gap-3 mb-4 text-slate-400">
                                    <FiTarget className="w-5 h-5 text-emerald-400" />
                                    <h3 className="font-semibold uppercase tracking-wider text-xs">Topics Mastered</h3>
                                </div>
                                <p className="text-3xl font-extrabold">{examData.completed_topics || 0} <span className="text-sm font-medium text-slate-500">/ {examData.total_topics || 0}</span></p>
                            </div>
                            <div className="glass-card p-6 rounded-2xl">
                                <div className="flex items-center gap-3 mb-4 text-slate-400">
                                    <FiBook className="w-5 h-5 text-rose-400" />
                                    <h3 className="font-semibold uppercase tracking-wider text-xs">Subjects</h3>
                                </div>
                                <p className="text-3xl font-extrabold">{examData.subjects?.length || 0} <span className="text-sm font-medium text-slate-500">tracked</span></p>
                            </div>
                            <div className="glass-card p-6 rounded-2xl">
                                <div className="flex items-center gap-3 mb-4 text-slate-400">
                                    <FiCalendar className="w-5 h-5 text-cyan-400" />
                                    <h3 className="font-semibold uppercase tracking-wider text-xs">Overall Progress</h3>
                                </div>
                                <p className="text-3xl font-extrabold text-slate-100">{examData.completion_percentage || 0}<span className="text-lg text-slate-500">%</span></p>
                            </div>
                        </div>

                        {/* Subjects Grid */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Subject Progress</h2>
                            <button onClick={() => setActiveTab('planner')} className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                                Open Planner &rarr;
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {examData.subjects?.length > 0 ? examData.subjects.map(subject => (
                                <div key={subject.id} className="glass-card p-6 rounded-2xl group hover:border-cyan-500/30 transition-all cursor-pointer" onClick={() => setActiveTab('planner')}>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold text-slate-100">{subject.name}</h3>
                                        <span className="text-cyan-400 font-bold bg-cyan-500/10 px-2 py-1 rounded-md text-sm">{subject.progress_percentage}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-6">
                                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000" style={{ width: `${subject.progress_percentage}%` }}></div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-2 text-center py-16 glass-card rounded-2xl border-dashed border-slate-700 text-slate-400">
                                    <FiBook className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                                    <p className="mb-4">No subjects added yet.</p>
                                    <button onClick={() => setActiveTab('planner')} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors">
                                        Set Up Date Sheet
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'planner' && <ExamPlanner examId={examData.id} initialSubjects={examData.subjects} onUpdate={fetchDashboard} />}
                
                {activeTab === 'focus' && <FocusMode examId={examData.id} subjects={examData.subjects} onSessionComplete={fetchDashboard} />}
                
                {activeTab === 'analytics' && <ExamAnalytics examData={examData} />}
            </main>

            {/* New Exam Session Modal */}
            {showNewExamModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="glass-panel max-w-lg w-full p-8 rounded-3xl border border-slate-700 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setShowNewExamModal(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-white text-xl"
                        >
                            <FiXCircle />
                        </button>

                        <div className="flex items-center gap-3 text-cyan-400 font-bold mb-2">
                            <FiShield className="w-6 h-6" /> Start New Exam Prep
                        </div>
                        <h2 className="text-2xl font-bold mb-6 text-white">Configure Your New Exam</h2>

                        <form onSubmit={handleCreateNewExam} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Exam Name / Goal Reason
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g., Semester Finals 2026, GATE / GRE Prep" 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                                    value={newExamForm.reason}
                                    onChange={(e) => setNewExamForm({ ...newExamForm, reason: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Exam Category
                                </label>
                                <select 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                                    value={newExamForm.exam_type}
                                    onChange={(e) => setNewExamForm({ ...newExamForm, exam_type: e.target.value })}
                                >
                                    <option value="Semester">Semester Exams</option>
                                    <option value="Competitive">Competitive Exam</option>
                                    <option value="Midterm">Midterm / Unit Test</option>
                                    <option value="Certifications">Certification & Boards</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                        Start Date
                                    </label>
                                    <input 
                                        type="date" 
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                                        value={newExamForm.start_date}
                                        onChange={(e) => setNewExamForm({ ...newExamForm, start_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                        End Date
                                    </label>
                                    <input 
                                        type="date" 
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                                        value={newExamForm.end_date}
                                        onChange={(e) => setNewExamForm({ ...newExamForm, end_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setShowNewExamModal(false)}
                                    className="px-5 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submittingNewExam}
                                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition flex items-center gap-2 shadow-lg shadow-cyan-600/20 disabled:opacity-50"
                                >
                                    <FiPlus /> {submittingNewExam ? 'Starting...' : 'Start New Exam'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
