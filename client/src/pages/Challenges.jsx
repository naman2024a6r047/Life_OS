import React, { useContext, useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTarget, FiPlus, FiEdit2, FiTrash2, FiCheckCircle,
  FiClock, FiZap, FiGrid, FiList, FiChevronRight, FiMoreVertical,
  FiSearch, FiFilter, FiPause, FiPlay, FiArchive, FiX, FiAward,
  FiCalendar, FiArrowUpRight, FiPaperclip, FiFileText, FiBell,
  FiChevronLeft, FiAlertTriangle, FiLock, FiEye, FiCheck, FiInfo, FiUpload, FiSend
} from 'react-icons/fi';
import axios from 'axios';

// --- Sample Day 1-10 Syllabus ---
const SAMPLE_10_DAY_SYLLABUS = `📅 Day 1
MERN Stack
☐ React Lecture 1
Python
☐ Angela Yu Bootcamp – Day 1
☐ Python Notes Revision (Pages 1–12)
HackerRank
☐ Problem 1
☐ Problem 2
DSA
☐ Introduction to DSA
FastAPI
☐ Web & HTTP Fundamentals
Data Science
☐ Python Programming Foundations
English
☐ Learn 1 New Word
☐ Speak English (10–15 min)
Fitness
☐ Workout Completed
Newspaper
☐ Read Today's News
Book Reading
☐ Read 10–15 Pages

📅 Day 2
MERN Stack
☐ React Lecture 2
Python
☐ Angela Yu Bootcamp – Day 2
☐ Python Notes Revision (Pages 13–24)
HackerRank
☐ Problem 3
☐ Problem 4
DSA
☐ Why Learn DSA
FastAPI
☐ APIs & JSON
Data Science
☐ Python Programming Foundations
English
☐ Learn 1 New Word
☐ Speak English
Fitness
☐ Workout Completed
Newspaper
☐ Read Today's News
Book Reading
☐ Read 10–15 Pages

📅 Day 3
MERN Stack
☐ React Lecture 3
Python
☐ Angela Yu Bootcamp – Day 3
☐ Python Notes Revision (Pages 25–36)
HackerRank
☐ Problem 5
☐ Problem 6
DSA
☐ Data Structures vs Algorithms
FastAPI
☐ Virtual Environment & pip
Data Science
☐ Python Programming Foundations
English
☐ Learn 1 New Word
☐ Speak English
Fitness
☐ Workout Completed
Newspaper
☐ Read Today's News
Book Reading
☐ Read 10–15 Pages

📅 Day 4
MERN Stack
☐ React Lecture 4
Python
☐ Angela Yu Bootcamp – Day 4
☐ Python Notes Revision (Pages 37–48)
HackerRank
☐ Problem 7
☐ Problem 8
DSA
☐ Real World Applications
FastAPI
☐ FastAPI Setup
Data Science
☐ Python Programming Foundations
English
☐ Learn 1 New Word
☐ Speak English
Fitness
☐ Workout Completed
Newspaper
☐ Read Today's News
Book Reading
☐ Read 10–15 Pages

📅 Day 5
MERN Stack
☐ React Lecture 5
Python
☐ Angela Yu Bootcamp – Day 5
☐ Python Notes Revision (Pages 49–57)
HackerRank
☐ Problem 9
☐ Problem 10
DSA
☐ Choosing Right Data Structure
FastAPI
☐ Path Parameters
Data Science
☐ Python Programming Foundations
English
☐ Learn 1 New Word
☐ Speak English
Fitness
☐ Workout Completed
Newspaper
☐ Read Today's News
Book Reading
☐ Read 10–15 Pages

📅 Day 6
MERN Stack
☐ React Practice
☐ Mini Project Progress
Python
☐ Revise Angela Yu Days 1–5
☐ Practice Python
HackerRank
☐ Problem 11
☐ Problem 12
DSA
☐ Time Complexity
FastAPI
☐ Query Parameters
Data Science
☐ Python Programming Foundations
English
☐ Learn 1 New Word
☐ Speak English
Fitness
☐ Workout Completed
Newspaper
☐ Read Today's News
Book Reading
☐ Read 10–15 Pages

📅 Day 7
MERN Stack
☐ React Practice
Python
☐ Python Revision
HackerRank
☐ Problem 13
☐ Problem 14
DSA
☐ Space Complexity
FastAPI
☐ Request Body
Data Science
☐ Python Programming Foundations
English
☐ Learn 1 New Word
☐ Speak English
Fitness
☐ Workout Completed
Newspaper
☐ Read Today's News
Book Reading
☐ Read 10–15 Pages

📅 Day 8
MERN Stack
☐ React Practice
Python
☐ Build Small Python Program
HackerRank
☐ Problem 15
☐ Problem 16
DSA
☐ Big-O Notation
FastAPI
☐ Pydantic Models
Data Science
☐ Python Programming Foundations
English
☐ Learn 1 New Word
☐ Speak English
Fitness
☐ Workout Completed
Newspaper
☐ Read Today's News
Book Reading
☐ Read 10–15 Pages

📅 Day 9
MERN Stack
☐ React Components Practice
Python
☐ Complete Pending Python Tasks
HackerRank
☐ Problem 17
☐ Problem 18
DSA
☐ Big Theta & Big Omega
FastAPI
☐ Data Validation
Data Science
☐ Python Programming Foundations
English
☐ Learn 1 New Word
☐ Speak English
Fitness
☐ Workout Completed
Newspaper
☐ Read Today's News
Book Reading
☐ Read 10–15 Pages

📅 Day 10
MERN Stack
☐ React Mini Project
Python
☐ Sprint 1 Revision
HackerRank
☐ Problem 19
☐ Problem 20
DSA
☐ Sprint Revision
FastAPI
☐ Response Models
Data Science
☐ Revise Module 1
English
☐ Learn 1 New Word
☐ Speak English
Fitness
☐ Workout Completed
Newspaper
☐ Read Today's News
Book Reading
☐ Read 10–15 Pages`;

// --- Safe Date Helpers ---
const safeDate = (dStr) => {
  if (!dStr) return null;
  const d = new Date(dStr);
  return isNaN(d.getTime()) ? null : d;
};

const formatDate = (dStr) => {
  const d = safeDate(dStr);
  if (!d) return 'N/A';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const calcTotalDays = (startDate, endDate) => {
  const s = safeDate(startDate);
  const e = safeDate(endDate);
  if (!s || !e) return 30;
  return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86400000));
};

const calcCurrentDay = (startDate, endDate) => {
  const s = safeDate(startDate);
  if (!s) return 1;
  const total = calcTotalDays(startDate, endDate);
  const diff = Math.ceil((Date.now() - s.getTime()) / 86400000);
  return Math.max(1, Math.min(total, diff));
};

// --- Toast Manager ---
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border text-xs font-semibold ${
              toast.type === 'success' ? 'bg-success/15 border-success/40 text-success' :
              toast.type === 'warning' ? 'bg-warning/15 border-warning/40 text-warning' :
              toast.type === 'info' ? 'bg-info/15 border-info/40 text-info' :
              'bg-primary/15 border-primary/40 text-primary-light'
            }`}
          >
            <span className="text-base">{toast.icon || '✨'}</span>
            <span>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="ml-2 hover:opacity-70">
              <FiX size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// --- Import Curriculum Modal ---
function ImportCurriculumModal({ isOpen, onClose, challengeId, milestoneIndex, onImportSuccess }) {
  const [curriculumText, setCurriculumText] = useState('');
  const [importing, setImporting] = useState(false);

  if (!isOpen) return null;

  const handlePreFillSample = () => {
    setCurriculumText(SAMPLE_10_DAY_SYLLABUS);
  };

  const handleImport = async () => {
    if (!curriculumText.trim()) {
      alert('Please paste or auto-fill a curriculum text block first.');
      return;
    }
    setImporting(true);
    try {
      const res = await axios.post(`/api/challenges/${challengeId}/import-curriculum`, {
        raw_curriculum: curriculumText,
        milestone_index: milestoneIndex
      });
      onImportSuccess(res.data.taskCount || 0);
      onClose();
    } catch (err) {
      console.error('Import error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Error processing curriculum text';
      alert(`Failed to import curriculum: ${errMsg}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card max-w-2xl w-full p-6 space-y-4 border border-border-subtle shadow-2xl relative bg-surface"
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-text-muted hover:text-text-primary">
          <FiX size={18} />
        </button>

        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div>
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <FiFileText className="text-primary" /> Import Day-by-Day Curriculum
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">
              Paste your raw syllabus or click auto-fill to generate checkboxes for all milestone phases.
            </p>
          </div>
          <button
            onClick={handlePreFillSample}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <FiZap size={12} /> Auto-Fill Day 1–10 Syllabus
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Raw Curriculum Text Box (Day 1 to Day 10+)
          </label>
          <textarea
            value={curriculumText}
            onChange={(e) => setCurriculumText(e.target.value)}
            placeholder="Paste syllabus here (e.g. 📅 Day 1 \n MERN Stack \n ☐ React Lecture 1 \n Python \n ☐ Angela Yu Bootcamp...)"
            className="w-full h-64 p-3.5 rounded-xl bg-slate-900 border border-border-subtle text-xs text-text-primary font-mono focus:outline-none focus:border-primary resize-y leading-relaxed scrollbar-thin"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border-subtle">
          <button onClick={onClose} className="btn-ghost text-xs px-4 py-2">Cancel</button>
          <button
            onClick={handleImport}
            disabled={importing}
            className="btn-primary text-xs px-5 py-2 disabled:opacity-50 flex items-center gap-2"
          >
            {importing ? 'Parsing & Generating Checkboxes...' : 'Generate Milestone Checkboxes'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Review Request Modal ---
function ReviewRequestModal({ isOpen, onClose, milestoneId, onSubmitSuccess }) {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState('');
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      axios.get('/api/friends/search').then(res => {
        setFriends(res.data || []);
        if (res.data?.length > 0) setSelectedFriend(res.data[0].id);
      }).catch(err => console.error("Failed to fetch users", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedFriend) return alert("Please select an accountability partner.");
    try {
      setLoading(true);
      await axios.post('/api/reviews/submit', {
        milestone_id: milestoneId,
        reviewer_id: selectedFriend,
        reflection
      });
      onSubmitSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to send for review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card max-w-md w-full p-6 space-y-5 border border-border-subtle shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-text-muted hover:text-text-primary">
          <FiX size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <FiSend className="text-primary" /> Request Peer Approval
          </h2>
          <p className="text-xs text-text-muted mt-1">
            You've completed all tasks! Send this milestone to your accountability partner to unlock the next phase.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-text-muted mb-1 block">Select Partner</label>
            <select
              value={selectedFriend}
              onChange={(e) => setSelectedFriend(e.target.value)}
              className="w-full bg-surface-elevated border border-border-subtle text-text-primary text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary"
            >
              <option value="" disabled>Choose a friend...</option>
              {friends.map(f => (
                <option key={f.id} value={f.id}>{f.username || f.email || 'Unknown User'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-text-muted mb-1 block">Quick Reflection (Optional)</label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What did you learn in this milestone? Any struggles?"
              className="w-full h-24 bg-surface-elevated border border-border-subtle text-text-primary text-sm rounded-xl p-3 focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border-subtle">
          <button onClick={onClose} className="btn-ghost text-xs px-4 py-2">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedFriend}
            className="btn-primary text-xs px-5 py-2 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send for Approval'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Task Detail Modal / Side Drawer ---
function TaskDetailModal({ task, isOpen, onClose, onSaveNotes }) {
  const [notes, setNotes] = useState(task?.notes || '');
  const [reminder, setReminder] = useState(task?.reminder || '09:00 AM');

  useEffect(() => {
    setNotes(task?.notes || '');
  }, [task]);

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card max-w-lg w-full p-6 space-y-5 border border-border-subtle shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-text-muted hover:text-text-primary">
          <FiX size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${task.is_completed ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}`}>
            {task.is_completed ? <FiCheckCircle size={18} /> : <FiClock size={18} />}
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">{task.title}</h3>
            <p className="text-[10px] text-text-muted">Day Task • Priority: {task.priority || 'P1'}</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
            <FiFileText size={14} /> Notes & Learning Log
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add key insights, code snippets, or notes from today's session..."
            className="w-full h-28 p-3 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-surface-elevated rounded-xl space-y-1">
            <span className="text-[10px] text-text-muted flex items-center gap-1"><FiBell size={12} /> Daily Reminder</span>
            <input
              type="text"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-text-primary focus:outline-none w-full"
            />
          </div>
          <div className="p-3 bg-surface-elevated rounded-xl space-y-1">
            <span className="text-[10px] text-text-muted flex items-center gap-1"><FiPaperclip size={12} /> Resource Link</span>
            <span className="text-xs font-mono font-semibold text-primary truncate block">Documentation & Guide</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
          <button onClick={onClose} className="btn-ghost text-xs px-4 py-2">Close</button>
          <button
            onClick={() => {
              onSaveNotes(task.id, notes);
              onClose();
            }}
            className="btn-primary text-xs px-4 py-2"
          >
            Save Notes
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Milestone Timeline Component ---
function MilestoneTimeline({ milestones = [], activeMilestoneIndex = 0, onSelectMilestone }) {
  return (
    <div className="relative py-4">
      <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-none px-2">
        {milestones.map((m, i) => {
          const isCompleted = m.status === 'completed';
          const isActive = i === activeMilestoneIndex;
          const isLocked = m.status === 'locked';
          const isApproval = m.status === 'waiting_approval';
          const isFailed = m.status === 'failed';

          let nodeStyle = 'bg-surface-elevated text-text-muted border-border-subtle';

          if (isCompleted) {
            nodeStyle = 'bg-success text-white border-success shadow-glow-success';
          } else if (isActive) {
            nodeStyle = 'bg-primary text-white border-primary shadow-glow-primary scale-110 ring-4 ring-primary/20';
          } else if (isApproval) {
            nodeStyle = 'bg-warning text-white border-warning shadow-glow-warning';
          } else if (isFailed) {
            nodeStyle = 'bg-danger text-white border-danger shadow-glow-danger';
          } else if (isLocked) {
            nodeStyle = 'bg-surface-elevated text-text-muted/40 border-border-subtle opacity-60';
          }

          return (
            <div key={m.id || i} className="flex items-center flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectMilestone(i)}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-all ${nodeStyle}`}>
                  {isCompleted ? <FiCheck size={16} /> :
                   isLocked ? <FiLock size={14} /> :
                   isApproval ? '⏳' :
                   isFailed ? <FiX size={16} /> :
                   `M${i + 1}`}
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-bold text-text-primary block group-hover:text-primary transition-colors">
                    {m.title || `Milestone ${i + 1}`}
                  </span>
                  <span className="text-[9px] text-text-muted font-mono block">
                    Days {i * 10 + 1}-{(i + 1) * 10}
                  </span>
                </div>
                {isActive && (
                  <span className="badge-primary text-[8px] py-0.5 px-2 font-bold animate-pulse">
                    CURRENT
                  </span>
                )}
              </motion.button>

              {i < milestones.length - 1 && (
                <div className={`w-12 h-1 rounded-full mx-2 transition-colors ${i < activeMilestoneIndex ? 'bg-success' : 'bg-border-subtle'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Task Row ---
function TaskRow({ task, onToggle, onOpenDetail, onUpdateActualHours, isLocked }) {
  const isCompleted = isLocked || task.is_completed;

  // Extract clean title (remove "Day X • ")
  const match = task.title?.match(/Day[\s\-]*\d+\s*[•\-\:]\s*(.*)/i);
  const displayTitle = match ? match[1] : task.title;

  const getTag = (title) => {
    const lower = (title || '').toLowerCase();
    if (lower.includes('react') || lower.includes('frontend') || lower.includes('css') || lower.includes('html')) return { label: 'Frontend', color: 'info' };
    if (lower.includes('express') || lower.includes('api') || lower.includes('backend') || lower.includes('node') || lower.includes('jwt') || lower.includes('auth')) return { label: 'Backend', color: 'warning' };
    if (lower.includes('full stack') || lower.includes('connect') || lower.includes('deploy')) return { label: 'Full Stack', color: 'purple' };
    if (lower.includes('devops') || lower.includes('deploy') || lower.includes('docker')) return { label: 'DevOps', color: 'success' };
    if (lower.includes('project') || lower.includes('build') || lower.includes('mini')) return { label: 'Project', color: 'danger' };
    return { label: 'General', color: 'primary' };
  };
  const tag = getTag(displayTitle);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex items-center gap-3 px-4 py-3 hover:bg-surface-elevated/60 transition-all border-b border-border-subtle/30 last:border-0 ${isCompleted ? 'opacity-60' : ''}`}
    >
      <button
        title={isLocked ? "Historical milestones are locked" : "Toggle task"}
        onClick={() => !isLocked && onToggle(task)}
        className={`w-5 h-5 rounded-[4px] border-2 flex flex-shrink-0 items-center justify-center transition-all ${isLocked ? 'cursor-default opacity-90' : 'cursor-pointer'} ${
          isCompleted 
            ? 'bg-primary border-primary text-white' 
            : 'bg-transparent border-border-subtle hover:border-primary/50'
        }`}
      >
        {isCompleted && <FiCheck size={14} strokeWidth={4} />}
      </button>

      <div className="flex-1 min-w-0 flex items-center gap-2 justify-between mr-2">
        <p className={`text-[13px] font-medium tracking-wide ${isCompleted ? 'line-through text-text-muted' : 'text-text-primary'}`}>
          {displayTitle}
        </p>

        {!isLocked && (
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-text-muted font-bold uppercase">Studied:</span>
            <input 
              type="number"
              min="0"
              max="24"
              step="0.5"
              placeholder="Hrs"
              value={task.actual_hours || ''}
              onChange={(e) => onUpdateActualHours && onUpdateActualHours(task.id, Number(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              className="w-12 bg-surface border border-border-subtle rounded text-[11px] px-1 py-0.5 text-center text-text-primary focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetail(task);
        }}
        className="p-1.5 text-text-muted hover:text-primary transition-colors flex-shrink-0 rounded-lg hover:bg-primary/10"
        title="View Task Details & Notes"
      >
        <FiEye size={14} />
      </button>
    </motion.div>
  );
}

// ==========================================
// MAIN GOALS & CHALLENGES DASHBOARD
// ==========================================
export default function Challenges() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('my');
  const [viewMode, setViewMode] = useState('grid');
  
  // Search, Filter & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Active milestone index per challenge
  const [activeMilestoneIdx, setActiveMilestoneIdx] = useState(0);

  // Task Drawer & Import Modal state
  const [detailTask, setDetailTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', icon = '✨') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, icon }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch Challenges
  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/challenges');
      const data = Array.isArray(res.data) ? res.data : [];
      setChallenges(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  // Filtered & Sorted Challenges
  const filteredChallenges = useMemo(() => {
    return challenges.filter(c => {
      if (activeTab === 'active' && c.status !== 'active') return false;
      if (activeTab === 'completed' && c.status !== 'completed') return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (c.title || '').toLowerCase().includes(q);
        const descMatch = (c.description || '').toLowerCase().includes(q);
        const catMatch = (c.category || '').toLowerCase().includes(q);
        return titleMatch || descMatch || catMatch;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === 'progress') {
        const pA = calcCurrentDay(a.start_date, a.end_date);
        const pB = calcCurrentDay(b.start_date, b.end_date);
        return pB - pA;
      }
      return 0;
    });
  }, [challenges, activeTab, statusFilter, searchQuery, sortBy]);

  const selectedChallenge = challenges.find(c => c.id === selectedId) || (filteredChallenges.length > 0 ? filteredChallenges[0] : null);

  const milestones = selectedChallenge?.milestones || selectedChallenge?.Milestones || [];
  const currentMilestoneIndex = milestones.findIndex(m => m.status === 'unlocked' || m.status === 'active');
  const activeMilestone = milestones[activeMilestoneIdx] || milestones[currentMilestoneIndex >= 0 ? currentMilestoneIndex : 0];
  const tasks = activeMilestone?.tasks || activeMilestone?.MilestoneTasks || [];
  
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const totalTasks = tasks.length;
  const dayOffset = activeMilestoneIdx * 10;
  
  const isMilestoneLocked = activeMilestone?.status === 'completed' || (currentMilestoneIndex >= 0 && activeMilestoneIdx < currentMilestoneIndex);

  const groupedTasks = useMemo(() => {
    const groups = {};
    if (!tasks || tasks.length === 0) return groups;

    let challengeStart = selectedChallenge?.start_date ? new Date(selectedChallenge.start_date) : null;
    if (challengeStart) challengeStart.setHours(0, 0, 0, 0);

    tasks.forEach((task) => {
      let dayNum = dayOffset + 1; // Default fallback

      if (task.date && challengeStart) {
        const tDate = new Date(task.date);
        tDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round((tDate - challengeStart) / (1000 * 60 * 60 * 24));
        dayNum = diffDays + 1;
      }

      if (!groups[dayNum]) groups[dayNum] = [];
      groups[dayNum].push(task);
    });
    return groups;
  }, [tasks, dayOffset, selectedChallenge?.start_date]);

  const totalDays = selectedChallenge ? calcTotalDays(selectedChallenge.start_date, selectedChallenge.end_date) : 30;
  const currentDay = selectedChallenge ? calcCurrentDay(selectedChallenge.start_date, selectedChallenge.end_date) : 1;
  const overallProgress = Math.min(100, Math.round((currentDay / totalDays) * 100)) || 0;

  // Stats Counters
  const totalCompletedGoals = challenges.filter(c => c.status === 'completed').length;
  const totalActiveGoals = challenges.filter(c => c.status === 'active').length;
  const streak = user?.current_streak || 0;
  const userXP = user?.xp || 0;

  // Task Toggle Action
  const handleToggleTask = async (task) => {
    if (isMilestoneLocked) return;
    try {
      const newStatus = !task.is_completed;
      setChallenges(prev => prev.map(c => {
        if (c.id !== selectedChallenge?.id) return c;
        const updatedMilestones = (c.milestones || c.Milestones || []).map(m => {
          if (m.id !== activeMilestone?.id) return m;
          const updatedTasks = (m.tasks || m.MilestoneTasks || []).map(t => {
            if (t.id === task.id) return { ...t, is_completed: newStatus, updatedAt: new Date().toISOString() };
            return t;
          });
          return { ...m, tasks: updatedTasks, MilestoneTasks: updatedTasks };
        });
        return { ...c, milestones: updatedMilestones, Milestones: updatedMilestones };
      }));

      await axios.put(`/api/tasks/${task.id}/toggle`);

      if (newStatus) {
        addToast(`Task Completed! +25 XP Earned 🎉`, 'success', '⚡');
      } else {
        addToast('Task set back to pending', 'info', 'ℹ️');
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
      fetchChallenges();
    }
  };

  const handleUpdateActualHours = async (taskId, actual_hours) => {
    try {
      setChallenges(prev => prev.map(c => {
        if (c.id !== selectedChallenge?.id) return c;
        const updatedMilestones = (c.milestones || c.Milestones || []).map(m => {
          if (m.id !== activeMilestone?.id) return m;
          const updatedTasks = (m.tasks || m.MilestoneTasks || []).map(t => {
            if (t.id === taskId) return { ...t, actual_hours };
            return t;
          });
          return { ...m, tasks: updatedTasks, MilestoneTasks: updatedTasks };
        });
        return { ...c, milestones: updatedMilestones, Milestones: updatedMilestones };
      }));

      await axios.put(`/api/tasks/${taskId}`, { actual_hours });
    } catch (err) {
      console.error('Failed to update actual hours:', err);
      addToast('Failed to save hours', 'warning', '❌');
      fetchChallenges();
    }
  };

  const handleToggleDay = async (dayTasks, isAllDone) => {
    if (isMilestoneLocked) return;
    try {
      const newStatus = !isAllDone;
      const tasksToUpdate = dayTasks.filter(t => (!!t.is_completed) !== newStatus);
      if (tasksToUpdate.length === 0) return;

      setChallenges(prev => prev.map(c => {
        if (c.id !== selectedChallenge?.id) return c;
        const updatedMilestones = (c.milestones || c.Milestones || []).map(m => {
          if (m.id !== activeMilestone?.id) return m;
          const updatedTasks = (m.tasks || m.MilestoneTasks || []).map(t => {
            if (tasksToUpdate.some(tu => tu.id === t.id)) {
              return { ...t, is_completed: newStatus, updatedAt: new Date().toISOString() };
            }
            return t;
          });
          return { ...m, tasks: updatedTasks, MilestoneTasks: updatedTasks };
        });
        return { ...c, milestones: updatedMilestones, Milestones: updatedMilestones };
      }));

      await Promise.all(tasksToUpdate.map(t => axios.put(`/api/tasks/${t.id}/toggle`)));

      if (newStatus) {
        addToast(`Day Completed! +${25 * tasksToUpdate.length} XP Earned 🎉`, 'success', '⚡');
      } else {
        addToast('Day tasks set back to pending', 'info', 'ℹ️');
      }
    } catch (err) {
      console.error('Failed to toggle day tasks:', err);
      fetchChallenges();
    }
  };

  const handlePauseGoal = async () => {
    if (!selectedChallenge) return;
    const newStatus = selectedChallenge.status === 'paused' ? 'active' : 'paused';
    try {
      await axios.put(`/api/challenges/${selectedChallenge.id}`, { status: newStatus });
      setChallenges(prev => prev.map(c => c.id === selectedChallenge.id ? { ...c, status: newStatus } : c));
      addToast(`Goal is now ${newStatus.toUpperCase()}`, 'warning', '⏸️');
    } catch (err) {
      console.error('Failed to pause goal:', err);
    }
  };

  const handleDeleteGoal = async () => {
    if (!selectedChallenge) return;
    if (!window.confirm(`Are you sure you want to delete "${selectedChallenge.title}"?`)) return;
    try {
      await axios.delete(`/api/challenges/${selectedChallenge.id}`);
      const updated = challenges.filter(c => c.id !== selectedChallenge.id);
      setChallenges(updated);
      setSelectedId(updated[0]?.id || null);
      addToast('Goal deleted successfully', 'info', '🗑️');
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const handleSaveNotes = (taskId, notes) => {
    addToast('Task notes updated!', 'success', '📝');
  };

  const handleImportSuccess = (count) => {
    addToast(`Curriculum imported! ${count} checklist tasks generated. 🎉`, 'success', '📋');
    fetchChallenges();
  };

  const handleAutoFillSampleDirect = async () => {
    if (!selectedChallenge) return;
    try {
      addToast('Generating 10-day syllabus checklist...', 'info', '⚡');
      await axios.post(`/api/challenges/${selectedChallenge.id}/import-curriculum`, {
        raw_curriculum: SAMPLE_10_DAY_SYLLABUS,
        milestone_index: activeMilestoneIdx
      });
      addToast('10-Day Syllabus imported successfully!', 'success', '🎉');
      fetchChallenges();
    } catch (err) {
      console.error('Direct import error:', err);
      addToast('Failed to import syllabus', 'warning', '❌');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <TaskDetailModal
        task={detailTask}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSaveNotes={handleSaveNotes}
      />
      <ImportCurriculumModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        challengeId={selectedChallenge?.id}
        milestoneIndex={activeMilestoneIdx}
        onImportSuccess={handleImportSuccess}
      />
      <ReviewRequestModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        milestoneId={activeMilestone?.id}
        onSubmitSuccess={() => {
          setIsReviewModalOpen(false);
          addToast('Sent to partner for approval! 🚀', 'success', '✨');
          fetchChallenges();
        }}
      />

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border-subtle pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-purple/20 border border-primary/30 text-primary flex items-center justify-center shadow-glow-primary">
            <FiTarget size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
              Goals & Challenges
            </h1>
            <p className="text-xs text-text-muted">Master consistency. Achieve long-term excellence one milestone at a time.</p>
          </div>
        </div>

        {/* Global User Stats & Create CTA */}
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-elevated border border-border-subtle">
            <span className="text-base">⭐</span>
            <div>
              <p className="text-xs font-bold font-mono text-text-primary">{userXP} XP</p>
              <p className="text-[9px] text-text-muted">Total Earned</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-elevated border border-border-subtle">
            <span className="text-base">🏆</span>
            <div>
              <p className="text-xs font-bold text-text-primary">Level {user?.level || 1}</p>
              <p className="text-[9px] text-text-muted">Pro Builder</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-elevated border border-border-subtle">
            <span className="text-base animate-pulse">🔥</span>
            <div>
              <p className="text-xs font-bold font-mono text-text-primary">{streak} Days</p>
              <p className="text-[9px] text-text-muted">Active Streak</p>
            </div>
          </div>
          <Link to="/challenges/new" className="btn-primary flex items-center gap-2 px-4 py-2.5 shadow-lg shadow-primary/25">
            <FiPlus size={16} /> Create Goal
          </Link>
        </div>
      </div>

      {/* --- QUICK STATISTICS CARDS --- */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Active Goals', value: totalActiveGoals, color: 'text-primary', icon: '🎯' },
          { label: 'Completed Goals', value: totalCompletedGoals, color: 'text-success', icon: '🏆' },
          { label: 'Total XP', value: `${userXP} XP`, color: 'text-warning', icon: '⭐' },
          { label: 'Longest Streak', value: `${streak} Days`, color: 'text-rose-400', icon: '🔥' },
          { label: 'Active Milestone', value: activeMilestone?.title || `M${activeMilestoneIdx + 1}`, color: 'text-cyan-400', icon: '🏁' },
          { label: 'Completion Rate', value: `${overallProgress}%`, color: 'text-purple-400', icon: '📊' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -2 }}
            className="card p-3.5 flex items-center justify-between border-border-subtle"
          >
            <div>
              <p className="text-[10px] text-text-muted font-medium">{stat.label}</p>
              <p className={`text-sm font-bold font-mono ${stat.color} mt-0.5`}>{stat.value}</p>
            </div>
            <span className="text-lg opacity-80">{stat.icon}</span>
          </motion.div>
        ))}
      </div>

      {/* --- SEARCH, FILTER & TAB CONTROLS --- */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-surface/50 p-3 rounded-2xl border border-border-subtle">
        <div className="flex items-center gap-1 bg-surface-elevated p-1 rounded-xl border border-border-subtle">
          {[
            { id: 'my', label: 'All Goals' },
            { id: 'active', label: 'Active Challenges' },
            { id: 'completed', label: 'Completed' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-glow-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <input
              type="text"
              placeholder="Search goals or tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-muted focus:outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-muted focus:outline-none focus:border-primary"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="progress">Sort: Highest Progress</option>
          </select>
        </div>
      </div>

      {/* --- MAIN 3-COLUMN LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* LEFT COLUMN: GOAL LIST SIDEBAR */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Goals ({filteredChallenges.length})</h3>
            <span className="text-[10px] text-text-muted font-mono">{activeTab.toUpperCase()}</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-4 h-24 animate-pulse bg-surface-elevated" />
              ))}
            </div>
          ) : filteredChallenges.length > 0 ? (
            <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              {filteredChallenges.map(ch => {
                const isSelected = ch.id === selectedChallenge?.id;
                const chDays = calcTotalDays(ch.start_date, ch.end_date);
                const chCurrentDay = calcCurrentDay(ch.start_date, ch.end_date);
                const chProgress = Math.min(100, Math.round((chCurrentDay / chDays) * 100)) || 0;

                return (
                  <motion.div
                    key={ch.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => {
                      setSelectedId(ch.id);
                      setActiveMilestoneIdx(0);
                    }}
                    className={`card p-3.5 cursor-pointer transition-all border ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-glow-primary'
                        : 'border-border-subtle hover:border-border-strong bg-surface'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${
                        isSelected ? 'bg-primary text-white' : 'bg-surface-elevated text-text-muted'
                      }`}>
                        🎯
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-text-primary truncate">{ch.title}</p>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              ch.difficulty === 'hard' || ch.difficulty === 'iron' ? 'bg-danger/20 text-danger' :
                              ch.difficulty === 'medium' ? 'bg-warning/20 text-warning' :
                              'bg-success/20 text-success'
                            }`}>
                              {ch.difficulty || 'medium'}
                            </span>
                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              ch.status === 'completed' ? 'bg-success/20 text-success' :
                              ch.status === 'paused' ? 'bg-warning/20 text-warning' :
                              'bg-primary/20 text-primary-light'
                            }`}>
                              {ch.status || 'active'}
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] text-text-muted truncate mt-0.5">{ch.category || 'Goal'} • {chDays} Days</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-text-muted">
                        <span>Day {chCurrentDay} / {chDays}</span>
                        <span>{chProgress}%</span>
                      </div>
                      <div className="progress-bar h-1.5">
                        <div
                          className="progress-fill bg-gradient-to-r from-primary to-success"
                          style={{ width: `${chProgress}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="card p-6 text-center space-y-3 border-dashed border-border-subtle">
              <FiTarget size={32} className="text-text-muted mx-auto" />
              <p className="text-xs text-text-muted">No goals match your search/filter.</p>
              <Link to="/challenges/new" className="btn-primary text-xs inline-flex items-center gap-1.5 px-3 py-2">
                <FiPlus size={14} /> Create Goal
              </Link>
            </div>
          )}

          <Link
            to="/challenges/new"
            className="w-full py-3 rounded-xl border border-dashed border-primary/40 text-primary-light hover:bg-primary/10 text-xs font-bold flex items-center justify-center gap-2 transition-all block text-center"
          >
            <FiPlus size={16} /> Add New Goal
          </Link>
        </div>

        {/* CENTER COLUMN: SELECTED GOAL DETAIL & MILESTONE TASK TABLE */}
        <div className="lg:col-span-6 space-y-5">
          {selectedChallenge ? (
            <>
              {/* --- HERO GOAL CARD --- */}
              <motion.div
                layout
                className="card p-5 relative overflow-hidden border-primary/30 bg-gradient-to-br from-surface to-primary/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-xl shadow-glow-primary">
                      🎯
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-text-primary tracking-tight">{selectedChallenge.title}</h2>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        {selectedChallenge.description || 'Master this goal through structured daily execution.'}
                      </p>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="badge-primary text-[9px]">📅 {totalDays} Days Goal</span>
                        <span className="badge-warning text-[9px]">⭐ +5000 XP Potential</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          selectedChallenge.status === 'paused' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                        }`}>
                          {selectedChallenge.status === 'paused' ? '⏸️ PAUSED' : '⚡ ACTIVE'}
                        </span>
                        <span className="badge-purple text-[9px]">🔥 {selectedChallenge.difficulty || 'Medium'} Mode</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePauseGoal}
                      className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5 cursor-pointer"
                      title="Pause or Resume Goal"
                    >
                      {selectedChallenge.status === 'paused' ? <><FiPlay size={12} /> Resume</> : <><FiPause size={12} /> Pause</>}
                    </button>
                    <button
                      onClick={handleDeleteGoal}
                      className="btn-ghost text-xs px-2.5 py-1.5 text-danger hover:bg-danger/10 cursor-pointer"
                      title="Delete Goal"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono font-bold text-text-muted">
                    <span>Day {currentDay} of {totalDays}</span>
                    <span className="text-primary">{overallProgress}% Completed</span>
                  </div>
                  <div className="progress-bar h-2.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${overallProgress}%` }}
                      transition={{ duration: 0.8 }}
                      className="progress-fill bg-gradient-to-r from-primary via-purple to-success shadow-glow-primary"
                    />
                  </div>
                </div>
              </motion.div>

              {/* --- MILESTONE HORIZONTAL TIMELINE --- */}
              <div className="card p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                  <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Milestones Timeline <span className="text-text-muted text-[10px] font-normal">({milestones.length} Phases)</span>
                  </h3>
                  <span className="text-[10px] text-text-muted">Click node to inspect tasks</span>
                </div>

                {milestones.length > 0 ? (
                  <MilestoneTimeline
                    milestones={milestones}
                    activeMilestoneIndex={activeMilestoneIdx}
                    onSelectMilestone={(idx) => setActiveMilestoneIdx(idx)}
                  />
                ) : (
                  <div className="p-4 text-center text-text-muted text-xs">No milestones generated yet.</div>
                )}
              </div>

              {/* --- ACTIVE MILESTONE TASK TABLE --- */}
              {activeMilestone ? (
                activeMilestone.status === 'locked' ? (
                  <div className="card p-12 text-center border border-border-subtle bg-surface-elevated/20 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center mx-auto text-text-muted border border-border-subtle shadow-inner">
                      <FiLock size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text-primary">Phase Locked</h3>
                      <p className="text-xs text-text-muted max-w-sm mx-auto mt-1">
                        Complete the previous milestone and get it approved by your accountability partner to unlock this phase.
                      </p>
                    </div>
                  </div>
                ) : (
                <div className="card overflow-hidden border border-border-subtle">
                  <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-elevated/40">
                    <div>
                      <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                        {activeMilestone.title || `Milestone ${activeMilestoneIdx + 1}`}
                        <span className="badge-primary text-[9px]">Days {activeMilestoneIdx * 10 + 1}-{(activeMilestoneIdx + 1) * 10}</span>
                      </h3>
                      <p className="text-[10px] text-text-muted mt-0.5">Complete daily tasks to unlock next milestone.</p>
                    </div>
                    
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-text-muted mr-1">
                        {completedTasks} / {totalTasks} Completed
                      </span>
                      {activeMilestone.status === 'rejected' && (
                        <span className="badge-danger text-xs px-3 py-1.5 flex items-center gap-1.5 mr-2">
                          ⚠️ Rejected: Improve & Resubmit
                        </span>
                      )}
                      {(activeMilestone.status === 'unlocked' || activeMilestone.status === 'rejected') && totalTasks > 0 && completedTasks === totalTasks ? (
                        <button
                          onClick={() => setIsReviewModalOpen(true)}
                          className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 cursor-pointer shadow-glow-primary bg-gradient-to-r from-success to-primary"
                        >
                          <FiSend size={13} /> {activeMilestone.status === 'rejected' ? 'Resubmit Peer Approval' : 'Request Peer Approval'}
                        </button>
                      ) : activeMilestone.status === 'pending_review' ? (
                        <span className="badge-warning text-xs px-3 py-1.5 flex items-center gap-1.5 animate-pulse">
                           ⏳ Pending Partner Approval
                        </span>
                      ) : activeMilestone.status === 'approved' || activeMilestone.status === 'completed' ? (
                        <span className="badge-success text-xs px-3 py-1.5 flex items-center gap-1.5">
                           <FiCheckCircle size={13} /> Approved
                        </span>
                      ) : (
                        <button
                          onClick={() => setIsImportModalOpen(true)}
                          className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 cursor-pointer shadow-glow-primary"
                        >
                          <FiFileText size={13} /> Import Syllabus / Tasks
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Task Rows Grouped by Day */}
                  {tasks.length > 0 ? (
                    <div className="p-4 space-y-4 bg-surface-elevated/20">
                      {Object.keys(groupedTasks).sort((a,b)=>a-b).map((dayKey) => {
                        const dayTasks = groupedTasks[dayKey];
                        const dayCompleted = isMilestoneLocked ? dayTasks.length : dayTasks.filter(t => t.is_completed).length;
                        const isAllDone = dayCompleted === dayTasks.length;
                        return (
                          <div key={dayKey} className={`border rounded-xl overflow-hidden shadow-lg transition-all ${isAllDone ? 'border-success/30 bg-success/5' : 'border-border-subtle bg-surface'}`}>
                            <div className={`px-4 py-3 flex items-center justify-between border-b ${isAllDone ? 'bg-success/10 border-success/20' : 'bg-surface-elevated border-border-subtle'}`}>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      if (!isMilestoneLocked) handleToggleDay(dayTasks, isAllDone);
                                  }}
                                  className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${isMilestoneLocked ? 'cursor-default opacity-90' : 'cursor-pointer'} ${isAllDone ? 'bg-success border-success text-white' : 'border-border-subtle hover:border-primary text-transparent'}`}
                                  title={isMilestoneLocked ? "Historical milestones are locked" : "Check/Uncheck all tasks for this day"}
                                >
                                  <FiCheck size={12} strokeWidth={3} />
                                </button>
                                <h4 className={`font-bold text-sm ${isAllDone ? 'text-success' : 'text-text-primary'}`}>
                                  Day {dayKey} Checklist
                                  <span className="text-text-muted text-[10px] font-normal uppercase tracking-wider ml-2">({dayTasks.length} Tasks)</span>
                                </h4>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-text-muted">
                                {dayCompleted} / {dayTasks.length} Done
                              </span>
                            </div>
                            <div className="divide-y divide-border-subtle">
                              {dayTasks.map((task, i) => (
                                <TaskRow
                                  key={task.id || i}
                                  task={task}
                                  onToggle={handleToggleTask}
                                  onUpdateActualHours={handleUpdateActualHours}
                                  onOpenDetail={(t) => {
                                    setDetailTask(t);
                                    setIsTaskModalOpen(true);
                                  }}
                                  isLocked={isMilestoneLocked}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* EMPTY STATE WITH 1-CLICK AUTO-FILL AND TEXT BOX IMPORT */
                    <div className="p-10 text-center text-text-muted text-xs space-y-4 bg-surface-elevated/20">
                      <FiClock size={36} className="mx-auto text-text-muted opacity-40 animate-pulse" />
                      <div>
                        <h4 className="text-sm font-bold text-text-primary">No tasks configured for this milestone phase.</h4>
                        <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
                          Import your raw Day 1 to Day 10 curriculum text box or auto-fill a sample 10-day syllabus to generate checkboxes instantly.
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                        <button
                          onClick={handleAutoFillSampleDirect}
                          className="btn-primary text-xs px-4 py-2.5 flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
                        >
                          <FiZap size={14} /> ⚡ 1-Click Auto-Fill Day 1–10 Syllabus
                        </button>
                        <button
                          onClick={() => setIsImportModalOpen(true)}
                          className="px-4 py-2.5 rounded-xl border border-primary/40 text-primary-light hover:bg-primary/10 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <FiUpload size={14} /> 📋 Paste Custom Day-by-Day Syllabus
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                )
              ) : (
                <div className="card p-8 text-center text-text-muted text-xs">
                  Select a milestone above to view tasks.
                </div>
              )}
            </>
          ) : (
            <div className="card p-12 text-center space-y-4">
              <FiTarget size={52} className="text-text-muted mx-auto opacity-50" />
              <h3 className="text-lg font-bold text-text-primary">No Goal Selected</h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Create or select a goal from the left menu to start executing daily milestones.
              </p>
              <Link to="/challenges/new" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs shadow-lg shadow-primary/25">
                <FiPlus size={16} /> Create Goal Now
              </Link>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: GOAL OVERVIEW PANEL */}
        <div className="lg:col-span-3 space-y-4">
          {selectedChallenge ? (
            <>
             
              {selectedChallenge?.penalty_warning && (
                <div className="card p-4 space-y-2 border-warning/30 bg-warning/5 mb-4">
                  <h3 className="text-sm font-bold text-warning flex items-center gap-2">
                    <FiAlertTriangle /> Penalty Risk!
                  </h3>
                  <p className="text-xs text-text-muted">You missed your tasks recently. If you miss today's tasks, your current milestone will be completely reset to Day 1!</p>
                </div>
              )}

 {/* Detailed Goal Overview */}
              <div className="card p-4 space-y-4 border-border-subtle">
                <h3 className="section-title text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2">
                  Goal Overview
                </h3>

                <div className="space-y-3">
                  {[
                    { icon: '📅', label: 'Started On', value: formatDate(selectedChallenge.start_date) },
                    { icon: '🏁', label: 'Ends On', value: formatDate(selectedChallenge.end_date) },
                    { icon: '⭐', label: 'Reward Pool', value: `${totalDays * 50} XP` },
                    { icon: '🔥', label: 'Active Streak', value: `${streak} Days` },
                    { icon: '✅', label: 'Milestone Progress', value: `${completedTasks} / ${totalTasks || totalDays} Tasks` },
                    { icon: '🛡️', label: 'Penalty Mode', value: selectedChallenge.penalty_mode === 'hard' ? 'Hard (1 Skip Restart)' : selectedChallenge.penalty_mode === 'medium' ? 'Medium (2 Skips Restart)' : 'Easy (No Restart)' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-1">
                      <span className="text-base">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-text-muted">{item.label}</p>
                        <p className="text-xs font-bold text-text-primary truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to={`/goals/workspace/${selectedChallenge.id}`}
                  className="w-full py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary-light hover:bg-primary/20 text-xs font-bold flex items-center justify-center gap-2 transition-all block text-center mt-3"
                >
                  📊 Open Deep Goal Analytics
                </Link>
              </div>

              {/* Accountability Quick Actions */}
              <div className="card p-4 space-y-3 border-border-subtle">
                <h3 className="section-title text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={handleAutoFillSampleDirect}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-xs font-bold text-primary-light border border-primary/30 transition-colors text-left cursor-pointer"
                  >
                    <span>⚡</span> 1-Click Import Day 1–10 Syllabus
                  </button>
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface-elevated text-xs font-medium text-text-muted hover:text-text-primary transition-colors text-left cursor-pointer"
                  >
                    <span>📋</span> Paste Custom Curriculum Box
                  </button>
                  <button
                    onClick={() => addToast('Goal link copied to clipboard!', 'success', '🤝')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface-elevated text-xs font-medium text-text-muted hover:text-text-primary transition-colors text-left cursor-pointer"
                  >
                    <span>🤝</span> Share Goal with Partner
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="card p-5 text-center text-text-muted text-xs">
              Select a goal to view overview & quick actions.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
