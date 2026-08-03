import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiTarget, FiUsers, FiMoon, FiClock, FiUser, FiArrowRight, FiX } from 'react-icons/fi';

export default function OnboardingModal({ isOpen, onClose }) {
    const [step, setStep] = useState(1);
    const [selectedGoals, setSelectedGoals] = useState(['Coding', 'Gym']);
    const [theme, setTheme] = useState('dark');
    const [reminderTime, setReminderTime] = useState('08:00');
    const [partner, setPartner] = useState('');

    if (!isOpen) return null;

    const goalOptions = [
        { id: 'Coding', label: 'Python & Web Dev', icon: '💻' },
        { id: 'Gym', label: 'Iron Forge Fitness', icon: '🏋️' },
        { id: 'Study', label: 'Finals & Academic Prep', icon: '📚' },
        { id: 'Reading', label: 'Deep Reading & Books', icon: '📖' },
        { id: 'Career', label: 'System Design & Career', icon: '🚀' },
    ];

    const toggleGoal = (id) => {
        if (selectedGoals.includes(id)) {
            setSelectedGoals(selectedGoals.filter(g => g !== id));
        } else {
            setSelectedGoals([...selectedGoals, id]);
        }
    };

    const handleNext = () => {
        if (step < 5) setStep(step + 1);
        else onClose();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-xl card p-8 rounded-3xl border border-primary/30 relative overflow-hidden"
                >
                    {/* Header Indicator */}
                    <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                        <div>
                            <span className="text-xs font-bold text-primary font-mono">ONBOARDING PROTOCOL • STEP {step} OF 5</span>
                            <h2 className="text-2xl font-extrabold text-text-primary mt-1">
                                {step === 1 && "Choose Your Initial Growth Tracks"}
                                {step === 2 && "Connect Accountability Partner"}
                                {step === 3 && "Select Interface Theme"}
                                {step === 4 && "Configure Daily Reminder"}
                                {step === 5 && "Profile Setup Complete"}
                            </h2>
                        </div>
                        <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1">
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Step 1: Goals */}
                    {step === 1 && (
                        <div className="space-y-3 mb-8">
                            <p className="text-xs text-text-muted">Select the discipline areas you are committing to improve:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {goalOptions.map((g) => {
                                    const selected = selectedGoals.includes(g.id);
                                    return (
                                        <button
                                            key={g.id}
                                            onClick={() => toggleGoal(g.id)}
                                            className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${selected ? 'bg-primary/20 border-primary text-background' : 'bg-surface/5 border-white/10 text-text-muted hover:border-white/20'}`}
                                        >
                                            <span className="text-sm font-semibold flex items-center gap-2">
                                                <span>{g.icon}</span> {g.label}
                                            </span>
                                            {selected && <FiCheck className="text-primary" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Partner */}
                    {step === 2 && (
                        <div className="space-y-4 mb-8">
                            <p className="text-xs text-text-muted">Search for a trusted friend to review your 10-day milestone proofs:</p>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-text-primary">Partner Username</label>
                                <input 
                                    type="text" 
                                    value={partner}
                                    onChange={(e) => setPartner(e.target.value)}
                                    placeholder="Enter @username (or leave blank to skip)..."
                                    className="w-full px-4 py-3 bg-background border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-primary text-sm"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Theme */}
                    {step === 3 && (
                        <div className="space-y-3 mb-8">
                            <p className="text-xs text-text-muted">LifeOS is engineered for high-contrast dark-mode focus:</p>
                            <div className="grid grid-cols-3 gap-3">
                                {['dark', 'light', 'system'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTheme(t)}
                                        className={`p-4 rounded-xl border text-center capitalize text-sm font-semibold transition-all ${theme === t ? 'bg-primary/20 border-primary text-background' : 'bg-surface/5 border-white/10 text-text-muted'}`}
                                    >
                                        <FiMoon className="mx-auto mb-2" />
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Reminder */}
                    {step === 4 && (
                        <div className="space-y-4 mb-8">
                            <p className="text-xs text-text-muted">Select when you want your daily discipline check-in alert:</p>
                            <input 
                                type="time"
                                value={reminderTime}
                                onChange={(e) => setReminderTime(e.target.value)}
                                className="w-full px-4 py-3 bg-background border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-primary text-lg font-mono text-center"
                            />
                        </div>
                    )}

                    {/* Step 5: Complete */}
                    {step === 5 && (
                        <div className="text-center py-6 space-y-3 mb-6">
                            <div className="w-16 h-16 rounded-full bg-success/20 text-success border border-emerald-500/30 flex items-center justify-center mx-auto text-2xl">
                                ✓
                            </div>
                            <h3 className="text-xl font-bold text-text-primary">System Ready for Launch</h3>
                            <p className="text-xs text-text-muted max-w-sm mx-auto">Your growth tracks, partner preferences, and discipline schedules have been configured.</p>
                        </div>
                    )}

                    {/* Footer Controls */}
                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                        <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-surface/10'}`}></div>
                            ))}
                        </div>
                        <button
                            onClick={handleNext}
                            className="bg-primary hover:bg-primary text-background font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-lg shadow-primary/30 transition-all"
                        >
                            {step === 5 ? "Launch Dashboard" : "Next Step"} <FiArrowRight />
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
