import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTarget, FiPlus, FiEdit2, FiTrash2, FiCheckCircle,
  FiClock, FiZap, FiGrid, FiList, FiChevronRight, FiMoreVertical
} from 'react-icons/fi';
import axios from 'axios';

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

function MilestoneTimeline({ milestones = [], activeMilestoneIndex = 0 }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {milestones.map((m, i) => {
        const isCompleted = m.status === 'completed';
        const isActive = i === activeMilestoneIndex;
        return (
          <div key={m.id || i} className="flex flex-col items-center gap-1 min-w-[60px]">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
              ${isCompleted ? 'bg-success text-white border-success' : 
                isActive ? 'bg-primary text-white border-primary shadow-glow-primary' : 
                'bg-surface-elevated text-text-muted border-border-subtle'}`}>
              {isCompleted ? '✓' : `M${i + 1}`}
            </div>
            <span className="text-[9px] text-text-muted text-center leading-tight">
              Days {i * 10 + 1}-{(i + 1) * 10}
            </span>
            {isActive && <span className="text-[8px] text-primary font-bold">Current</span>}
          </div>
        );
      })}
    </div>
  );
}

function TaskRow({ task, index, onToggle, dayOffset = 0 }) {
  const dayNum = dayOffset + index + 1;
  const isCompleted = task.is_completed;
  
  const getTag = (title) => {
    const lower = (title || '').toLowerCase();
    if (lower.includes('react') || lower.includes('frontend') || lower.includes('css') || lower.includes('html')) return { label: 'Frontend', color: 'info' };
    if (lower.includes('express') || lower.includes('api') || lower.includes('backend') || lower.includes('node') || lower.includes('jwt') || lower.includes('auth')) return { label: 'Backend', color: 'warning' };
    if (lower.includes('full stack') || lower.includes('connect') || lower.includes('deploy')) return { label: 'Full Stack', color: 'purple' };
    if (lower.includes('devops') || lower.includes('deploy') || lower.includes('docker')) return { label: 'DevOps', color: 'success' };
    if (lower.includes('project') || lower.includes('build') || lower.includes('mini')) return { label: 'Project', color: 'danger' };
    return { label: 'General', color: 'primary' };
  };
  const tag = getTag(task.title);

  return (
    <div className={`flex items-center gap-4 px-4 py-3 border-b border-border-subtle hover:bg-surface-elevated/50 transition-colors ${isCompleted ? 'opacity-60' : ''}`}>
      <span className="text-sm font-mono text-text-muted w-8">{dayNum}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isCompleted ? 'line-through text-text-muted' : 'text-text-primary'}`}>
          {task.title}
        </p>
      </div>
      <span className={`badge-${tag.color} text-[9px]`}>{tag.label}</span>
      <div className="w-20 text-center">
        {isCompleted ? (
          <span className="flex items-center gap-1 text-success text-xs font-medium justify-center">
            <FiCheckCircle size={12} /> Completed
          </span>
        ) : (
          <button onClick={() => onToggle(task)} className="text-text-muted text-xs hover:text-primary transition-colors flex items-center gap-1">
            <div className="w-4 h-4 rounded-full border border-text-muted" /> Pending
          </button>
        )}
      </div>
      <span className="text-[10px] text-text-muted w-20 text-center">
        {isCompleted ? formatDate(task.updatedAt || new Date()) : '—'}
      </span>
      <button className="text-text-muted hover:text-text-primary transition-colors">
        <FiMoreVertical size={14} />
      </button>
    </div>
  );
}

export default function Challenges() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('my');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/challenges');
        const data = Array.isArray(res.data) ? res.data : [];
        setChallenges(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load challenges:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  const selectedChallenge = challenges.find(c => c.id === selectedId) || (challenges.length > 0 ? challenges[0] : null);
  const milestones = selectedChallenge?.milestones || selectedChallenge?.Milestones || [];
  const activeMilestoneIndex = milestones.findIndex(m => m.status === 'unlocked' || m.status === 'active');
  const activeMilestone = milestones[activeMilestoneIndex >= 0 ? activeMilestoneIndex : 0];
  const tasks = activeMilestone?.tasks || activeMilestone?.MilestoneTasks || [];
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const totalTasks = tasks.length;

  const totalDays = selectedChallenge ? calcTotalDays(selectedChallenge.start_date, selectedChallenge.end_date) : 30;
  const currentDay = selectedChallenge ? calcCurrentDay(selectedChallenge.start_date, selectedChallenge.end_date) : 1;
  const overallProgress = Math.min(100, Math.round((currentDay / totalDays) * 100)) || 0;

  const streak = user?.current_streak || 0;
  const totalXP = (user?.xp || 0) + ((user?.level || 1) - 1) * 100;

  const handleToggleTask = async (task) => {
    try {
      await axios.put(`/api/tasks/${task.id}/toggle`);
      const res = await axios.get('/api/challenges');
      const updated = Array.isArray(res.data) ? res.data : [];
      setChallenges(updated);
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await axios.delete(`/api/challenges/${id}`);
      const updated = challenges.filter(c => c.id !== id);
      setChallenges(updated);
      if (selectedId === id) setSelectedId(updated[0]?.id || null);
    } catch (err) {
      console.error('Failed to delete challenge:', err);
    }
  };

  const tabs = [
    { id: 'my', label: 'My Goals' },
    { id: 'active', label: 'Active Challenges' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FiTarget size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Goals & Challenges</h1>
            <p className="text-xs text-text-muted">Build, track and conquer your goals. One task a day, every day.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">⭐</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">{totalXP}</p>
              <p className="text-[9px] text-text-muted">Total XP</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🏆</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">Level {user?.level || 1}</p>
              <p className="text-[9px] text-text-muted">{user?.email || 'User'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🔥</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">{streak}</p>
              <p className="text-[9px] text-text-muted">Day Streak</p>
            </div>
          </div>
          <Link to="/challenges/new" className="btn-primary flex items-center gap-2">
            <FiPlus size={16} /> Create New Goal
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {tabs.map(tab => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text-primary'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border-subtle rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 text-xs ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'}`}>
              <FiGrid size={14} />
            </button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-xs ${viewMode === 'list' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'}`}>
              <FiList size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left — Goal List */}
        <div className="col-span-3 space-y-2">
          <h3 className="text-xs font-bold text-text-primary mb-2">All Goals ({challenges.length})</h3>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="card p-4 h-24 animate-pulse bg-surface-elevated" />)}
            </div>
          ) : challenges.length > 0 ? (
            <>
              {challenges.map(ch => {
                const isSelected = ch.id === selectedId;
                const chDays = calcTotalDays(ch.start_date, ch.end_date);
                const chCurrentDay = calcCurrentDay(ch.start_date, ch.end_date);
                const chProgress = Math.min(100, Math.round((chCurrentDay / chDays) * 100)) || 0;

                return (
                  <div key={ch.id}
                    onClick={() => setSelectedId(ch.id)}
                    className={`card-hover p-3 cursor-pointer ${isSelected ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-start gap-2.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-primary/20 text-primary' : 'bg-surface-elevated text-text-muted'}`}>
                        <FiTarget size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-text-primary truncate">{ch.title}</p>
                        <p className="text-[10px] text-text-muted">{chDays} Days Challenge</p>
                      </div>
                    </div>
                    <div className="mt-2.5">
                      <div className="flex justify-between text-[10px] text-text-muted mb-1">
                        <span>Day {chCurrentDay} / {chDays}</span>
                        <span>{chProgress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill bg-primary" style={{ width: `${chProgress}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
              <Link to="/challenges/new" className="card-hover p-3 flex items-center justify-center gap-2 text-primary-light text-xs font-semibold hover:text-primary">
                <FiPlus size={14} /> Create New Goal
              </Link>
            </>
          ) : (
            <div className="card p-6 text-center space-y-2">
              <p className="text-xs text-text-muted">No goals created yet.</p>
              <Link to="/challenges/new" className="btn-primary text-xs inline-flex items-center gap-1 py-1.5 px-3">
                <FiPlus size={12} /> Create Goal
              </Link>
            </div>
          )}
        </div>

        {/* Center — Selected Goal Detail */}
        <div className="col-span-6 space-y-4">
          {selectedChallenge ? (
            <>
              {/* Goal Header Card */}
              <div className="card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <FiTarget size={22} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-text-primary">{selectedChallenge.title}</h2>
                      <p className="text-xs text-text-muted mt-0.5">{selectedChallenge.description || 'Build consistency every day.'}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="badge-primary text-[9px]">📅 {totalDays} Days</span>
                        <span className="badge-warning text-[9px]">⭐ +500 XP</span>
                        <span className="badge-success text-[9px]">✅ Daily Task</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDelete(selectedChallenge.id)} className="btn-ghost text-xs text-danger flex items-center gap-1"><FiTrash2 size={12} /></button>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] text-text-muted mb-1">
                    <span>Day {currentDay} / {totalDays}</span>
                    <span>{overallProgress}%</span>
                  </div>
                  <div className="progress-bar h-2">
                    <div className="progress-fill bg-gradient-to-r from-primary to-success" style={{ width: `${overallProgress}%` }} />
                  </div>
                </div>
              </div>

              {/* Milestones Timeline */}
              <div className="card p-4">
                <h3 className="text-xs font-bold text-text-primary mb-3">Milestones</h3>
                {milestones.length > 0 ? (
                  <MilestoneTimeline milestones={milestones} activeMilestoneIndex={activeMilestoneIndex >= 0 ? activeMilestoneIndex : 0} />
                ) : (
                  <p className="text-xs text-text-muted">No milestones generated yet.</p>
                )}
              </div>

              {/* Active Milestone Tasks Table */}
              {activeMilestone && (
                <div className="card overflow-hidden">
                  <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-text-primary">{activeMilestone.title || `Milestone ${(activeMilestoneIndex >= 0 ? activeMilestoneIndex : 0) + 1}`}</h3>
                      <p className="text-[10px] text-text-muted">Complete daily sprint tasks.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-muted">{completedTasks} task{completedTasks !== 1 ? 's' : ''} completed</span>
                    </div>
                  </div>
                  {/* Table Header */}
                  <div className="flex items-center gap-4 px-4 py-2 bg-surface-elevated text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    <span className="w-8">Day</span>
                    <span className="flex-1">Task</span>
                    <span className="w-16 text-center">Tag</span>
                    <span className="w-20 text-center">Status</span>
                    <span className="w-20 text-center">Date</span>
                    <span className="w-6"></span>
                  </div>
                  {/* Task Rows */}
                  {tasks.length > 0 ? (
                    tasks.map((task, i) => (
                      <TaskRow key={task.id || i} task={task} index={i} onToggle={handleToggleTask}
                        dayOffset={activeMilestoneIndex >= 0 ? activeMilestoneIndex * 10 : 0} />
                    ))
                  ) : (
                    <div className="p-6 text-center text-text-muted text-sm">No tasks in this milestone.</div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="card p-12 text-center space-y-3">
              <FiTarget size={48} className="text-text-muted mx-auto" />
              <h3 className="text-lg font-bold text-text-primary">No Goals Set</h3>
              <p className="text-sm text-text-muted">Create a goal to start building your accountability milestones.</p>
              <Link to="/challenges/new" className="btn-primary inline-flex items-center gap-2 py-2 px-4">
                <FiPlus size={16} /> Create Goal
              </Link>
            </div>
          )}
        </div>

        {/* Right — Goal Overview Sidebar */}
        <div className="col-span-3 space-y-4">
          {selectedChallenge ? (
            <div className="card p-4">
              <h3 className="section-title mb-3">Goal Overview</h3>
              <div className="space-y-3">
                {[
                  { icon: '📅', label: 'Started On', value: formatDate(selectedChallenge.start_date) },
                  { icon: '🏁', label: 'Ends On', value: formatDate(selectedChallenge.end_date) },
                  { icon: '⭐', label: 'Total XP', value: `${totalDays * 50} XP` },
                  { icon: '🔥', label: 'Current Streak', value: `${streak} Days` },
                  { icon: '✅', label: 'Tasks Completed', value: `${completedTasks} / ${totalTasks || totalDays}` },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="text-sm">{item.icon}</span>
                    <div className="flex-1">
                      <p className="text-[10px] text-text-muted">{item.label}</p>
                      <p className="text-xs font-semibold text-text-primary">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-4 text-center">
              <p className="text-xs text-text-muted">Select or create a goal to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
