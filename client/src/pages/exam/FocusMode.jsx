import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlay, FiPause, FiSquare, FiSave, FiClock } from 'react-icons/fi';

export default function FocusMode({ examId, subjects, onSessionComplete }) {
    const [isRunning, setIsRunning] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0); // in seconds
    const [manualDuration, setManualDuration] = useState(30); // default 30 mins
    const [selectedSubject, setSelectedSubject] = useState('');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let timer;
        if (isRunning) {
            timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
        } else if (!isRunning && timeElapsed !== 0) {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [isRunning, timeElapsed]);

    // Automatically sync stopwatch elapsed minutes to manual duration if timer has run > 0
    useEffect(() => {
        if (timeElapsed > 0) {
            const mins = Math.max(1, Math.round(timeElapsed / 60));
            setManualDuration(mins);
        }
    }, [timeElapsed]);

    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const handleSaveSession = async (e) => {
        if (e) e.preventDefault();
        
        if (!selectedSubject) {
            alert('Please select a subject.');
            return;
        }

        const duration = Number(manualDuration);
        if (!duration || duration <= 0) {
            alert('Please enter a valid study duration in minutes.');
            return;
        }

        const hour = new Date().getHours();
        let sessionTime = 'Afternoon';
        if (hour >= 5 && hour < 12) sessionTime = 'Morning';
        else if (hour >= 12 && hour < 17) sessionTime = 'Afternoon';
        else if (hour >= 17 && hour < 22) sessionTime = 'Evening';
        else sessionTime = 'Night';

        setSaving(true);
        try {
            await axios.post('/api/exams/study-logs', {
                exam_session_id: examId,
                subject_id: selectedSubject,
                session_time: sessionTime,
                duration_minutes: duration,
                chapters_covered: notes.trim() || 'General Study',
                notes: notes.trim()
            }, { headers: getAuthHeader() });

            alert('Study log saved successfully!');
            setTimeElapsed(0);
            setNotes('');
            setIsRunning(false);
            if (onSessionComplete) onSessionComplete();
        } catch (error) {
            console.error('Error saving session:', error);
            alert(error.response?.data?.message || 'Failed to save study log');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold mb-8">Deep Focus Mode & Study Logger</h2>

            {/* Stopwatch Timer Display */}
            <div className="card p-12 rounded-full border-[8px] border-border-subtle/50 w-80 h-80 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.15)] relative mb-12">
                {isRunning && (
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin opacity-50"></div>
                )}
                <span className="text-5xl font-mono font-bold text-text-primary tracking-widest z-10">{formatTime(timeElapsed)}</span>
                <span className="text-text-muted mt-2 z-10 uppercase tracking-widest text-xs font-bold">Stopwatch Elapsed</span>
            </div>

            <div className="flex gap-6 mb-12">
                <button 
                    onClick={() => setIsRunning(!isRunning)} 
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRunning ? 'bg-amber-500 hover:bg-amber-400 text-text-primary shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'}`}
                >
                    {isRunning ? <FiPause size={24} /> : <FiPlay size={24} className="ml-1" />}
                </button>
                <button 
                    onClick={() => { setIsRunning(false); setTimeElapsed(0); }} 
                    className="w-16 h-16 rounded-full flex items-center justify-center bg-surface-elevated hover:bg-surface text-text-primary transition-all"
                >
                    <FiSquare size={20} />
                </button>
            </div>

            {/* Log Form */}
            <form onSubmit={handleSaveSession} className="glass-card p-6 rounded-2xl w-full max-w-lg space-y-4 border border-border-subtle">
                <h3 className="font-bold text-lg mb-2 text-text-muted flex items-center gap-2">
                    <FiClock className="text-cyan-400" /> Log Study Session
                </h3>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                        Subject
                    </label>
                    <select 
                        value={selectedSubject} 
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-text-primary focus:border-cyan-500 focus:outline-none"
                        required
                    >
                        <option value="">Select Subject...</option>
                        {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                        Duration (Minutes)
                    </label>
                    <input 
                        type="number" 
                        min="1"
                        placeholder="e.g. 30" 
                        value={manualDuration}
                        onChange={(e) => setManualDuration(e.target.value)}
                        className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-text-primary focus:border-cyan-500 focus:outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                        Chapters / Notes / Topics Covered
                    </label>
                    <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Session notes, chapters covered (e.g. Basics of Process Scheduling)..."
                        className="w-full h-24 bg-background border border-border-subtle rounded-xl px-4 py-3 text-text-primary focus:border-cyan-500 focus:outline-none resize-none text-sm"
                    ></textarea>
                </div>

                <button 
                    type="submit"
                    disabled={saving || !selectedSubject}
                    className="w-full py-3.5 bg-gradient-to-r from-primary/20 to-cyan-600 hover:from-primary/20 hover:to-cyan-500 disabled:opacity-40 text-text-primary font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/30"
                >
                    <FiSave /> {saving ? 'Saving Log...' : 'Save Study Log'}
                </button>
            </form>
        </div>
    );
}
