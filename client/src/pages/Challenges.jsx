import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTarget, FiPlus, FiEdit2, FiTrash2, FiCheckCircle,
  FiClock, FiZap, FiGrid, FiList, FiChevronRight, FiMoreVertical
} from 'react-icons/fi';
import axios from 'axios';

function MilestoneTimeline({ milestones, activeMilestoneIndex }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {milestones.map((m, i) => {
        const isCompleted = m.status === 'completed';
        const isActive = i === activeMilestoneIndex;
        const isLocked = m.status === 'locked';
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
  
  // Determine tag from title
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
        {isCompleted ? new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
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
        const res = await axios.get('/api/challenges');
        let data = res.data || [];
        
        if (data.length === 0) {
          const todayStr = new Date().toISOString().split('T')[0];
          const start90 = new Date(Date.now() - 31 * 86400000).toISOString().split('T')[0];
          const end90 = new Date(Date.now() + 59 * 86400000).toISOString().split('T')[0];

          data = [
            {
              id: 'g1',
              title: 'Master Full Stack Development',
              description: 'Become a full stack developer by learning and building real world projects.',
              category: 'Development',
              start_date: start90,
              end_date: end90,
              status: 'active',
              milestones: Array.from({ length: 9 }, (_, i) => ({
                id: `m_${i+1}`,
                title: `Milestone ${i+1}: Days ${i*10+1}-${(i+1)*10}`,
                status: i < 3 ? 'completed' : i === 3 ? 'unlocked' : 'locked',
                tasks: i === 3 ? [
                  { id: 't31', title: 'Learn React 19 – Components, Props, State', is_completed: true, priority: 'P1' },
                  { id: 't32', title: 'React – useEffect, Events and Forms', is_completed: false, priority: 'P1' },
                  { id: 't33', title: 'React Router DOM – Navigation & Routing', is_completed: false, priority: 'P2' },
                  { id: 't34', title: 'Node.js – Express.js Basics', is_completed: false, priority: 'P1' },
                  { id: 't35', title: 'REST API – CRUD Operations', is_completed: false, priority: 'P1' },
                  { id: 't36', title: 'Connect React Frontend with Express API', is_completed: false, priority: 'P1' },
                  { id: 't37', title: 'Authentication – JWT Basics', is_completed: false, priority: 'P2' },
                  { id: 't38', title: 'Deploy Full Stack App on Render', is_completed: false, priority: 'P3' },
                  { id: 't39', title: 'Add Protected Routes & Logout', is_completed: false, priority: 'P2' },
                  { id: 't40', title: 'Build a Mini Project – Task Manager', is_completed: false, priority: 'P1' },
                ] : [
                  { id: `t_${i}_1`, title: `Sprint task for milestone ${i+1}`, is_completed: i < 3 }
                ]
              }))
            },
            {
              id: 'g2',
              title: 'Crack Semester Exams',
              description: 'Prepare thoroughly for all university end-semester examinations.',
              category: 'Academics',
              start_date: new Date(Date.now() - 17 * 86400000).toISOString().split('T')[0],
              end_date: new Date(Date.now() + 43 * 86400000).toISOString().split('T')[0],
              status: 'active',
              milestones: [
                { id: 'm2_1', title: 'Milestone 1: Days 1-10', status: 'completed', tasks: [{ id: 't2_1', title: 'Cover Unit 1 & 2', is_completed: true }] }
              ]
            },
            {
              id: 'g3',
              title: 'Fitness Transformation',
              description: 'Consistently hit the gym and achieve peak physical condition.',
              category: 'Fitness',
              start_date: new Date(Date.now() - 44 * 86400000).toISOString().split('T')[0],
              end_date: new Date(Date.now() + 76 * 86400000).toISOString().split('T')[0],
              status: 'active',
              milestones: [
                { id: 'm3_1', title: 'Milestone 1: Days 1-10', status: 'completed', tasks: [{ id: 't3_1', title: 'Bench press baseline', is_completed: true }] }
              ]
            },
            {
              id: 'g4',
              title: 'Build 5 Projects',
              description: 'Construct 5 production-ready full stack portfolio applications.',
              category: 'Projects',
              start_date: new Date(Date.now() - 24 * 86400000).toISOString().split('T')[0],
              end_date: new Date(Date.now() + 76 * 86400000).toISOString().split('T')[0],
              status: 'active',
              milestones: [
                { id: 'm4_1', title: 'Milestone 1: Days 1-10', status: 'completed', tasks: [{ id: 't4_1', title: 'Build Project 1', is_completed: true }] }
              ]
            },
            {
              id: 'g5',
              title: 'Daily Learning Habit',
              description: 'Read and learn for at least 1 hour every single day without fail.',
              category: 'Habit',
              start_date: new Date(Date.now() - 40 * 86400000).toISOString().split('T')[0],
              end_date: new Date(Date.now() + 113 * 86400000).toISOString().split('T')[0],
              status: 'active',
              milestones: [
                { id: 'm5_1', title: 'Milestone 1: Days 1-10', status: 'completed', tasks: [{ id: 't5_1', title: 'Read 10 pages', is_completed: true }] }
              ]
            }
          ];
        }

        setChallenges(data);
        if (data.length > 0) setSelectedId(data[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  const selectedChallenge = challenges.find(c => c.id === selectedId) || challenges[0];
  const milestones = selectedChallenge?.milestones || selectedChallenge?.Milestones || [];
  const activeMilestoneIndex = milestones.findIndex(m => m.status === 'unlocked' || m.status === 'active');
  const activeMilestone = milestones[activeMilestoneIndex >= 0 ? activeMilestoneIndex : 0];
  const tasks = activeMilestone?.tasks || activeMilestone?.MilestoneTasks || [];
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const totalTasks = tasks.length;

  const totalDays = selectedChallenge ? Math.max(1, Math.ceil((new Date(selectedChallenge.end_date) - new Date(selectedChallenge.start_date)) / 86400000)) : 100;
  const currentDay = selectedChallenge ? Math.max(1, Math.ceil((Date.now() - new Date(selectedChallenge.start_date)) / 86400000)) : 1;
  const overallProgress = Math.min(100, Math.round((currentDay / totalDays) * 100));

  const streak = user?.current_streak || 0;
  const totalXP = (user?.xp || 0) + ((user?.level || 1) - 1) * 100;

  const handleToggleTask = async (task) => {
    try {
      await axios.put(`/api/tasks/${task.id}/toggle`);
      const res = await axios.get('/api/challenges');
      setChallenges(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await axios.delete(`/api/challenges/${id}`);
      setChallenges(prev => prev.filter(c => c.id !== id));
      if (selectedId === id) setSelectedId(challenges[0]?.id);
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'my', label: 'My Goals' },
    { id: 'active', label: 'Active Challenges' },
    { id: 'completed', label: 'Completed' },
    { id: 'templates', label: 'Templates' },
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
              <p className="text-[9px] text-text-muted">Pro Builder</p>
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
          <span className="text-xs text-text-muted">All Categories ▾</span>
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
          ) : (
            <>
              {challenges.map(ch => {
                const isSelected = ch.id === selectedId;
                const chMilestones = ch.milestones || ch.Milestones || [];
                const chTasks = chMilestones.flatMap(m => m.tasks || m.MilestoneTasks || []);
                const chCompleted = chTasks.filter(t => t.is_completed).length;
                const chTotal = chTasks.length;
                const chDays = Math.max(1, Math.ceil((new Date(ch.end_date) - new Date(ch.start_date)) / 86400000));
                const chCurrentDay = Math.max(1, Math.min(chDays, Math.ceil((Date.now() - new Date(ch.start_date)) / 86400000)));
                const chProgress = Math.min(100, Math.round((chCurrentDay / chDays) * 100));

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
                      <FiTerminal size={22} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-text-primary">{selectedChallenge.title}</h2>
                      <p className="text-xs text-text-muted mt-0.5">{selectedChallenge.description || 'Become the best version of yourself.'}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="badge-primary text-[9px]">📅 {totalDays} Days</span>
                        <span className="badge-warning text-[9px]">⭐ +5000 XP</span>
                        <span className="badge-success text-[9px]">✅ Daily Task</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn-ghost text-xs flex items-center gap-1"><FiEdit2 size={12} /> Edit</button>
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
                <h3 className="text-xs font-bold text-text-primary mb-3">Milestones <span className="text-text-muted font-normal">(Auto-generated 10-day milestones)</span></h3>
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
                      <p className="text-[10px] text-text-muted">Complete one task per day.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-muted">{completedTasks} task{completedTasks !== 1 ? 's' : ''} completed</span>
                      <button className="btn-primary text-xs">View Milestone Details</button>
                    </div>
                  </div>
                  {/* Table Header */}
                  <div className="flex items-center gap-4 px-4 py-2 bg-surface-elevated text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    <span className="w-8">Day</span>
                    <span className="flex-1">Task</span>
                    <span className="w-16 text-center">Tag</span>
                    <span className="w-20 text-center">Status</span>
                    <span className="w-20 text-center">Completed On</span>
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
            <div className="card p-12 text-center">
              <FiTarget size={48} className="text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-bold text-text-primary">No Goals Yet</h3>
              <p className="text-sm text-text-muted mt-1">Create your first goal to start your journey.</p>
              <Link to="/challenges/new" className="btn-primary inline-flex items-center gap-2 mt-4">
                <FiPlus size={16} /> Create New Goal
              </Link>
            </div>
          )}
        </div>

        {/* Right — Goal Overview Sidebar */}
        <div className="col-span-3 space-y-4">
          {selectedChallenge && (
            <>
              {/* Goal Overview */}
              <div className="card p-4">
                <h3 className="section-title mb-3">Goal Overview</h3>
                <div className="space-y-3">
                  {[
                    { icon: '📅', label: 'Started On', value: new Date(selectedChallenge.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
                    { icon: '🏁', label: 'Ends On', value: new Date(selectedChallenge.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
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
                <Link to={`/challenges/${selectedChallenge.id}`} className="block mt-4 text-center text-xs font-semibold text-primary-light hover:text-primary transition-colors">
                  📊 View Analytics
                </Link>
              </div>

              {/* Accountability Partners */}
              <div className="card p-4">
                <h3 className="section-title mb-3">Accountability Partners (2)</h3>
                {[
                  { name: 'Arjun Verma', status: 'Online' },
                  { name: 'Rohit Singh', status: 'Last seen 2h ago' },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/60 to-purple/60 flex items-center justify-center text-white text-[10px] font-bold">
                        {p.name[0]}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-text-primary">{p.name}</p>
                        <p className="text-[9px] text-text-muted flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-success' : 'bg-text-muted'}`} />{p.status}
                        </p>
                      </div>
                    </div>
                    <Link to="/friends" className="text-[10px] font-semibold text-primary-light">Inspect</Link>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="card p-4">
                <h3 className="section-title mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { icon: '📝', label: 'Add Note', color: 'text-info' },
                    { icon: '📎', label: 'Attach Resource', color: 'text-purple' },
                    { icon: '🤝', label: 'Share Goal', color: 'text-success' },
                    { icon: '🗑️', label: 'Abandon Goal', color: 'text-danger' },
                  ].map((action, i) => (
                    <button key={i} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-surface-elevated transition-colors text-left ${action.color}`}>
                      <span>{action.icon}</span>
                      <span className="text-xs font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
