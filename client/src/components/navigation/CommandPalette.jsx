import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    FiSearch, FiTarget, FiActivity, FiTerminal, FiBookOpen, 
    FiUsers, FiBarChart2, FiSettings, FiPlus, FiX 
} from 'react-icons/fi';

export default function CommandPalette({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) onClose();
                else setQuery('');
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const commands = [
        { id: 'new-goal', title: 'Create New 10-Day Sprint Goal', category: 'Actions', icon: <FiPlus className="text-primary" />, action: () => { navigate('/challenges/new'); onClose(); } },
        { id: 'calendar', title: 'Open Time Blocking Calendar & Focus Timer', category: 'Execution', icon: <FiTarget className="text-primary" />, action: () => { navigate('/calendar'); onClose(); } },
        { id: 'second-brain', title: 'Open Second Brain Knowledge Vault', category: 'Knowledge', icon: <FiBookOpen className="text-info" />, action: () => { navigate('/knowledge'); onClose(); } },
        { id: 'ai-coach', title: 'Open AI Growth Intelligence Coach', category: 'Intelligence', icon: <FiTerminal className="text-cyan-400" />, action: () => { navigate('/ai-coach'); onClose(); } },
        { id: 'notifications', title: 'Open Smart Notification Center', category: 'System', icon: <FiBarChart2 className="text-rose-400" />, action: () => { navigate('/notifications'); onClose(); } },
        { id: 'dev-terminal', title: 'Open SYS.DEV Coding Terminal', category: 'Modules', icon: <FiTerminal className="text-success" />, action: () => { navigate('/dev'); onClose(); } },
        { id: 'iron-forge', title: 'Open Iron Forge Gym Protocol', category: 'Modules', icon: <FiActivity className="text-rose-400" />, action: () => { navigate('/gym'); onClose(); } },
        { id: 'exam-mode', title: 'Enter Exam Focus Haven', category: 'Modules', icon: <FiBookOpen className="text-cyan-400" />, action: () => { navigate('/exams'); onClose(); } },
        { id: 'analytics', title: 'View 90-Day Analytics & Leaderboard', category: 'Modules', icon: <FiBarChart2 className="text-purple-400" />, action: () => { navigate('/analytics'); onClose(); } },
        { id: 'friends', title: 'Accountability Partners & Friends', category: 'Social', icon: <FiUsers className="text-amber-400" />, action: () => { navigate('/friends'); onClose(); } },
        { id: 'reviews', title: 'Pending Peer Reviews', category: 'Social', icon: <FiTarget className="text-rose-400" />, action: () => { navigate('/reviews'); onClose(); } },
        { id: 'settings', title: 'Account & Security Settings', category: 'System', icon: <FiSettings className="text-text-muted" />, action: () => { navigate('/settings'); onClose(); } },
    ];

    const filtered = commands.filter(c => 
        c.title.toLowerCase().includes(query.toLowerCase()) || 
        c.category.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className="w-full max-w-2xl card rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                >
                    {/* Search Bar Input */}
                    <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
                        <FiSearch className="text-text-muted text-lg" />
                        <input 
                            type="text"
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Type a command or search (e.g. 'Gym', 'Goal', 'Terminal')..."
                            className="w-full bg-transparent text-text-primary placeholder-text-muted focus:outline-none text-sm font-medium"
                        />
                        <span className="text-[10px] font-mono font-bold bg-surface/10 text-text-muted px-2 py-0.5 rounded border border-white/10">ESC</span>
                        <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1">
                            <FiX size={18} />
                        </button>
                    </div>

                    {/* Command Results List */}
                    <div className="max-h-96 overflow-y-auto p-2 space-y-1">
                        {filtered.length === 0 ? (
                            <div className="py-8 text-center text-text-muted text-sm font-mono">
                                No matching commands found.
                            </div>
                        ) : (
                            filtered.map((cmd) => (
                                <button
                                    key={cmd.id}
                                    onClick={cmd.action}
                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface/5 transition-all group text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-surface/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                                            {cmd.icon}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-text-primary group-hover:text-text-primary">{cmd.title}</div>
                                            <div className="text-[10px] text-text-muted font-mono uppercase">{cmd.category}</div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity font-semibold">Jump →</span>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 bg-surface-elevated/80 border-t border-border-subtle flex justify-between items-center text-[11px] text-text-muted font-mono">
                        <span>Navigation Shortcut</span>
                        <span>Press <kbd className="px-1.5 py-0.5 bg-surface/10 rounded text-text-primary">Ctrl + K</kbd> anytime</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
