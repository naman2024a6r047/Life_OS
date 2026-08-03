import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiShield, FiUpload } from 'react-icons/fi';
import dayjs from 'dayjs';
import { AuthContext } from '../../context/AuthContext';

export default function ExamSetup({ onComplete }) {
    const [form, setForm] = useState({
        reason: '',
        exam_type: 'Semester',
        start_date: dayjs().format('YYYY-MM-DD'),
        end_date: dayjs().add(14, 'day').format('YYYY-MM-DD')
    });
    const [submitting, setSubmitting] = useState(false);
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.reason.trim()) {
            alert('Please enter an exam name.');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/exams/activate', form, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            
            setUser({ ...user, is_in_exam_mode: true });
            navigate('/exams');
        } catch (error) {
            console.error('Error starting exam mode:', error);
            alert('Failed to start exam mode.');
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="ambient-glow top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/10"></div>
            <div className="ambient-glow bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10"></div>

            <div className="card max-w-2xl w-full p-8 md:p-12 rounded-3xl border border-border-subtle shadow-2xl relative z-10">
                <div className="flex items-center gap-3 text-cyan-400 font-bold mb-4">
                    <FiShield className="w-8 h-8" /> 
                    <span className="text-lg tracking-widest uppercase">Exam Mode</span>
                </div>
                <h1 className="text-4xl font-extrabold mb-4 text-text-primary">Enable Exam Mode</h1>
                <p className="text-text-muted mb-8">
                    Entering Exam Mode will safely pause all your LifeOS goals, workouts, and penalties. 
                    Your entire dashboard will transform into a focused study environment.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                            Exam Name
                        </label>
                        <input 
                            type="text" 
                            placeholder="e.g., Final Semester, GRE Prep" 
                            className="w-full bg-background/50 border border-border-subtle rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-cyan-500 transition-colors"
                            value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                                Exam Type
                            </label>
                            <select 
                                className="w-full bg-background/50 border border-border-subtle rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-cyan-500 transition-colors"
                                value={form.exam_type}
                                onChange={(e) => setForm({ ...form, exam_type: e.target.value })}
                            >
                                <option value="Semester">Semester Exams</option>
                                <option value="Competitive">Competitive Exam</option>
                                <option value="Midterm">Midterm / Unit Test</option>
                                <option value="Certifications">Certification & Boards</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                                Date Sheet (Optional)
                            </label>
                            <button type="button" className="w-full bg-background/50 hover:bg-surface-elevated border border-border-subtle rounded-xl px-4 py-3 text-cyan-400 flex items-center justify-center gap-2 transition-colors">
                                <FiUpload /> Upload PDF/Image
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                                Start Date
                            </label>
                            <input 
                                type="date" 
                                className="w-full bg-background/50 border border-border-subtle rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-cyan-500"
                                value={form.start_date}
                                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                                End Date
                            </label>
                            <input 
                                type="date" 
                                className="w-full bg-background/50 border border-border-subtle rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-cyan-500"
                                value={form.end_date}
                                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border-subtle flex justify-end gap-4">
                        <button 
                            type="button" 
                            onClick={() => window.location.href = '/'}
                            className="px-6 py-3 rounded-xl border border-border-subtle hover:bg-surface-elevated text-text-primary font-semibold transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-text-primary font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-cyan-600/20 disabled:opacity-50"
                        >
                            {submitting ? 'Preparing Exam Mode...' : 'Enter Exam Mode'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
