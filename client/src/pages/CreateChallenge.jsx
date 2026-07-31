import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTarget, FiCalendar, FiShield, FiAlertTriangle, FiFileText } from 'react-icons/fi';
import dayjs from 'dayjs';
import BackButton from '../components/ui/BackButton';

export default function CreateChallenge() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Learning',
        duration_days: 30,
        difficulty: 'medium',
        penalty_mode: 'easy',
        raw_curriculum: '',
        daily_minutes: 45
    });
    const [submitting, setSubmitting] = useState(false);
    const [showCurriculum, setShowCurriculum] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const duration = Number(formData.duration_days) || 30;
        const start_date = dayjs().format('YYYY-MM-DD');
        const end_date = dayjs().add(duration, 'day').format('YYYY-MM-DD');

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/challenges', {
                ...formData,
                start_date,
                end_date,
                color: '#6366F1'
            }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            navigate('/challenges');
        } catch (err) {
            console.error('Error creating challenge:', err);
            alert('Failed to create challenge. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen p-8 flex flex-col justify-center items-center">
            <div className="w-full max-w-2xl">
                <BackButton to="/challenges" label="Back to Challenges" />
            </div>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-10 rounded-3xl w-full max-w-2xl"
            >
                <div className="mb-8 border-b border-white/10 pb-6">
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <FiTarget className="text-primary" /> Create Challenge
                    </h1>
                    <p className="text-textSecondary">Define your goals and set the rules. No backing down.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-textSecondary">Challenge Title</label>
                            <input 
                                type="text" required
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                placeholder="e.g. 100 Days of Python"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-textSecondary">Description (Optional)</label>
                            <textarea 
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                placeholder="What is the ultimate goal?"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white h-24 resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-textSecondary flex items-center gap-2"><FiCalendar /> Duration (Days)</label>
                            <input 
                                type="number" required min="1" max="365"
                                value={formData.duration_days}
                                onChange={e => setFormData({...formData, duration_days: e.target.value})}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-textSecondary flex items-center gap-2">⏱️ Daily Study Target (Minutes)</label>
                            <input 
                                type="number" required min="1" max="1440"
                                value={formData.daily_minutes}
                                onChange={e => setFormData({...formData, daily_minutes: e.target.value})}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-textSecondary flex items-center gap-2"><FiShield /> Difficulty</label>
                            <select 
                                value={formData.difficulty}
                                onChange={e => setFormData({...formData, difficulty: e.target.value})}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white appearance-none"
                            >
                                <option value="easy" className="bg-surface">Easy</option>
                                <option value="medium" className="bg-surface">Medium</option>
                                <option value="hard" className="bg-surface">Hard</option>
                                <option value="iron" className="bg-surface">Iron Mode (No Skips)</option>
                            </select>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-textSecondary flex items-center gap-2"><FiAlertTriangle /> Penalty Mode</label>
                            <select 
                                value={formData.penalty_mode}
                                onChange={e => setFormData({...formData, penalty_mode: e.target.value})}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white appearance-none"
                            >
                                <option value="easy" className="bg-surface">Easy (No Restart Penalty)</option>
                                <option value="medium" className="bg-surface">Medium (Restart Milestone on 2 Skips)</option>
                                <option value="hard" className="bg-surface">Hard (Restart Milestone on 1 Skip)</option>
                            </select>
                        </div>
                    </div>

                    {/* Optional Custom Curriculum Box toggle */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => setShowCurriculum(!showCurriculum)}
                            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 cursor-pointer"
                        >
                            <FiFileText size={14} /> {showCurriculum ? 'Hide Custom Syllabus Text Box' : '+ Add Custom Day-by-Day Syllabus (Optional)'}
                        </button>

                        {showCurriculum && (
                            <div className="mt-3 space-y-2">
                                <textarea
                                    value={formData.raw_curriculum}
                                    onChange={e => setFormData({...formData, raw_curriculum: e.target.value})}
                                    placeholder="Paste your raw Day 1, Day 2 syllabus here (Optional)..."
                                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white text-xs font-mono h-40 resize-y"
                                />
                            </div>
                        )}
                    </div>

                    <div className="mt-6 space-y-3">
                        <h4 className="text-sm font-bold text-textSecondary flex items-center gap-2"><FiAlertTriangle /> Penalty Rules</h4>
                        
                        <div className={`p-4 rounded-xl border transition-all ${formData.penalty_mode === 'easy' ? 'bg-success/10 border-success/30' : 'bg-surface border-white/5 opacity-50 cursor-pointer hover:opacity-100'}`} onClick={() => setFormData({...formData, penalty_mode: 'easy'})}>
                            <div className="flex items-center justify-between mb-1">
                                <h5 className={`font-bold text-sm ${formData.penalty_mode === 'easy' ? 'text-success' : 'text-white'}`}>Easy Mode</h5>
                                {formData.penalty_mode === 'easy' && <span className="badge-success text-[10px]">Selected</span>}
                            </div>
                            <p className="text-xs text-textSecondary">No restart penalties. Missed tasks are simply marked as overdue.</p>
                        </div>

                        <div className={`p-4 rounded-xl border transition-all ${formData.penalty_mode === 'medium' ? 'bg-warning/10 border-warning/30' : 'bg-surface border-white/5 opacity-50 cursor-pointer hover:opacity-100'}`} onClick={() => setFormData({...formData, penalty_mode: 'medium'})}>
                            <div className="flex items-center justify-between mb-1">
                                <h5 className={`font-bold text-sm ${formData.penalty_mode === 'medium' ? 'text-warning' : 'text-white'}`}>Medium Mode</h5>
                                {formData.penalty_mode === 'medium' && <span className="badge-warning text-[10px]">Selected</span>}
                            </div>
                            <p className="text-xs text-textSecondary">Missing 2 consecutive days will automatically restart the current milestone from Day 1 and deduct 50 XP.</p>
                        </div>

                        <div className={`p-4 rounded-xl border transition-all ${formData.penalty_mode === 'hard' ? 'bg-danger/10 border-danger/30' : 'bg-surface border-white/5 opacity-50 cursor-pointer hover:opacity-100'}`} onClick={() => setFormData({...formData, penalty_mode: 'hard'})}>
                            <div className="flex items-center justify-between mb-1">
                                <h5 className={`font-bold text-sm ${formData.penalty_mode === 'hard' ? 'text-danger' : 'text-white'}`}>Hard Mode</h5>
                                {formData.penalty_mode === 'hard' && <span className="badge-danger text-[10px]">Selected</span>}
                            </div>
                            <p className="text-xs text-textSecondary">Missing 1 day will automatically restart the current milestone from Day 1 and deduct 100 XP. No mercy.</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                        <button type="button" onClick={() => navigate('/challenges')} className="px-6 py-3 rounded-xl font-medium text-textSecondary hover:bg-white/5 transition-colors">
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="bg-primary hover:bg-indigo-400 disabled:opacity-50 px-8 py-3 rounded-xl font-medium shadow-lg shadow-primary/25 transition-colors text-white"
                        >
                            {submitting ? 'Creating...' : 'Commit & Start'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
