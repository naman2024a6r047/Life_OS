import React, { useContext, useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FiTarget, FiZap, FiAward, FiUsers, FiTerminal, FiActivity,
  FiBookOpen, FiBarChart2, FiCheckSquare, FiArrowRight, FiShield,
  FiTrendingUp, FiClock, FiHeart, FiEye
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axios from 'axios';

// --- Sub Components ---

function StatCard({ icon, label, value, sub, color = 'primary' }) {
  const colorMap = {
    primary: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    danger: 'text-danger bg-danger/10',
    info: 'text-info bg-info/10',
    purple: 'text-purple bg-purple/10',
  };
  return (
    <div className="stat-card">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-text-muted font-medium">{label}</p>
        <p className="text-lg font-bold font-mono text-text-primary">{value}</p>
        {sub && <p className="text-[10px] text-text-muted">{sub}</p>}
      </div>
    </div>
  );
}

function LifeScoreCircle({ score }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} stroke="#1C2039" strokeWidth="6" fill="none" />
        <circle cx="48" cy="48" r={radius} stroke={color} strokeWidth="6" fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold font-mono text-text-primary">{score}</span>
        <span className="text-[9px] text-text-muted font-medium">/100</span>
      </div>
    </div>
  );
}

function ActivityHeatmap() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const days = ['Mon', '', 'Wed', '', 'Fri', '', ''];
  
  const cells = useMemo(() => {
    const result = [];
    for (let week = 0; week < 32; week++) {
      for (let day = 0; day < 7; day++) {
        const intensity = Math.random();
        let color = 'bg-surface-elevated';
        if (intensity > 0.8) color = 'bg-primary';
        else if (intensity > 0.6) color = 'bg-primary/70';
        else if (intensity > 0.4) color = 'bg-primary/40';
        else if (intensity > 0.2) color = 'bg-primary/20';
        result.push({ week, day, color });
      }
    }
    return result;
  }, []);

  return (
    <div className="card p-4">
      <div className="section-header">
        <h3 className="section-title">Activity Heatmap</h3>
      </div>
      <div className="flex gap-3">
        <div className="flex flex-col gap-[3px] pt-5">
          {days.map((d, i) => (
            <div key={i} className="h-[12px] text-[9px] text-text-muted font-mono flex items-center">{d}</div>
          ))}
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-[3px] mb-1">
            {months.map((m, i) => (
              <div key={i} className="text-[9px] text-text-muted font-mono" style={{ width: `${100/8}%` }}>{m}</div>
            ))}
          </div>
          <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
            {cells.map((cell, i) => (
              <div key={i} className={`w-[12px] h-[12px] rounded-[2px] ${cell.color}`} />
            ))}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-text-muted mt-3 italic">"Consistency is the key to mastery."</p>
    </div>
  );
}

function LifeScoreTrend() {
  const data = [
    { label: '1 May', value: 45 }, { label: '8 May', value: 52 }, { label: '15 May', value: 55 },
    { label: '22 May', value: 60 }, { label: '29 May', value: 78 }
  ];
  const maxVal = 100;
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - (d.value / maxVal) * 100
  }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = pathD + ` L 100 100 L 0 100 Z`;

  return (
    <div className="card p-4">
      <div className="section-header">
        <h3 className="section-title">Life Score Trend</h3>
        <span className="text-[10px] text-text-muted font-medium">This Month ▾</span>
      </div>
      <div className="relative h-36">
        {/* Y axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[9px] text-text-muted font-mono pr-2">
          <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
        </div>
        <div className="ml-7 h-full relative">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(v => (
              <line key={v} x1="0" y1={v} x2="100" y2={v} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
            ))}
            {/* Area fill */}
            <path d={areaD} fill="url(#trendGradient)" />
            {/* Line */}
            <path d={pathD} fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
            {/* Dots */}
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#6366F1" stroke="#0B0D18" strokeWidth="1.5" />
            ))}
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      <div className="flex justify-between ml-7 mt-1">
        {data.map((d, i) => (
          <span key={i} className="text-[9px] text-text-muted font-mono">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

function XPBreakdown({ xp }) {
  const segments = [
    { label: 'Challenges', pct: 35, color: '#6366F1' },
    { label: 'Study', pct: 25, color: '#06B6D4' },
    { label: 'Fitness', pct: 20, color: '#22C55E' },
    { label: 'Coding', pct: 15, color: '#F59E0B' },
    { label: 'Other', pct: 5, color: '#64748B' },
  ];
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let accum = 0;

  return (
    <div className="card p-4">
      <div className="section-header">
        <h3 className="section-title">XP Breakdown</h3>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            {segments.map((seg, i) => {
              const dashLen = (seg.pct / 100) * circumference;
              const dashOffset = -(accum / 100) * circumference;
              accum += seg.pct;
              return (
                <circle key={i} cx="48" cy="48" r={radius} stroke={seg.color} strokeWidth="8" fill="none"
                  strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                  strokeDashoffset={dashOffset} />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-extrabold font-mono text-text-primary">{xp}</span>
            <span className="text-[8px] text-text-muted">Total XP</span>
          </div>
        </div>
        <div className="space-y-1.5">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="text-text-secondary">{seg.label}</span>
              <span className="text-text-muted font-mono ml-auto">{seg.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Main Dashboard ---

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [challenges, setChallenges] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [challRes, analyticsRes, unreadRes] = await Promise.allSettled([
          axios.get('/api/challenges'),
          axios.get('/api/analytics/summary'),
          axios.get('/api/friends/interventions/unread-count'),
        ]);
        let fetched = [];
        if (challRes.status === 'fulfilled') fetched = challRes.value.data || [];
        if (fetched.length === 0) {
          fetched = [{
            id: 'ch_demo',
            title: '100 Days of Code',
            status: 'active',
            start_date: new Date(Date.now() - 13 * 86400000).toISOString().split('T')[0],
            end_date: new Date(Date.now() + 86 * 86400000).toISOString().split('T')[0],
            milestones: [{
              id: 'ms_demo_2',
              title: 'Day 20 (10-Day Milestone)',
              status: 'unlocked',
              tasks: [
                { id: 'td1', title: 'Build a To-Do App with React', description: 'Create a fully functional To-Do app with add, delete, toggle', is_completed: false, priority: 'P1' },
                { id: 'td2', title: 'State management with React Context', description: 'Implement global application state', is_completed: true, priority: 'P1' },
              ]
            }]
          }];
        }
        setChallenges(fetched);
        if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data);
        if (unreadRes.status === 'fulfilled') setUnreadCount(unreadRes.value.data?.count || 0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const activeChallenge = challenges.find(c => c.status === 'active') || challenges[0];
  const activeMilestone = activeChallenge?.milestones?.[0] || activeChallenge?.Milestones?.[0];
  const tasks = activeMilestone?.tasks || activeMilestone?.MilestoneTasks || [];
  const todayTask = tasks.find(t => !t.is_completed) || tasks[0];
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const totalTasks = tasks.length;
  const milestoneProgress = 60;

  const lifeScore = analytics?.lifeScore || 78;
  const totalXP = user?.xp || analytics?.xp || 0;
  const currentLevel = user?.level || analytics?.level || 1;
  const streak = user?.current_streak || analytics?.streak || 0;
  const xpForLevel = currentLevel * 100;
  const xpProgress = Math.min(100, Math.round((totalXP / xpForLevel) * 100));

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayDayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div className="p-6 space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            {greeting}, {user?.username || 'Warrior'}! 👋
          </h1>
          <p className="text-xs text-text-muted mt-0.5">"Discipline today, freedom tomorrow."</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">🔥</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">{streak}</p>
              <p className="text-[9px] text-text-muted">Day Streak</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg">⭐</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">{totalXP + (currentLevel - 1) * 100}</p>
              <p className="text-[9px] text-text-muted">Total XP</p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-2 card px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple flex items-center justify-center">
              <span className="text-white text-xs font-bold">{(user?.username || 'U')[0].toUpperCase()}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary">Level {currentLevel}</p>
              <p className="text-[9px] text-text-muted">Pro Builder</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-5 gap-3">
        <div className="stat-card">
          <LifeScoreCircle score={lifeScore} />
          <div>
            <p className="text-[11px] text-text-muted">Life Score</p>
            <p className="text-xs text-success font-medium">Keep going!</p>
          </div>
        </div>
        <StatCard icon={<FiTarget size={18} />} label="Active Challenges" value={challenges.filter(c => c.status === 'active').length || challenges.length} sub="Keep it up!" color="primary" />
        <StatCard icon={<FiCheckSquare size={18} />} label="Tasks Completed" value={`${completedTasks} / ${totalTasks || 50}`} sub="This Week" color="success" />
        <StatCard icon={<FiClock size={18} />} label="Focus Hours" value={analytics?.totalStudyHours || '18.6'} sub="This Week" color="info" />
        <StatCard icon={<FiHeart size={18} />} label="Grace Tokens" value="2" sub="Available" color="warning" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left 8 columns */}
        <div className="col-span-8 space-y-4">
          {/* Today's Challenge + Today's Progress */}
          <div className="grid grid-cols-2 gap-4">
            {/* Today's Challenge */}
            <div className="card p-4">
              <div className="section-header">
                <h3 className="section-title">Today's Challenge</h3>
                <Link to="/challenges" className="section-link">View All</Link>
              </div>
              {activeChallenge ? (
                <>
                  <p className="text-sm font-bold text-warning mb-1">{activeChallenge.title}</p>
                  <p className="text-[11px] text-text-muted mb-3">
                    Day {completedTasks + 1} / {activeChallenge.end_date ? Math.ceil((new Date(activeChallenge.end_date) - new Date(activeChallenge.start_date)) / 86400000) : 100}
                  </p>
                  {todayTask && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-elevated">
                      <div className="w-5 h-5 rounded-full border-2 border-text-muted flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-text-primary">{todayTask.title}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">{todayTask.description || 'Complete this task to earn XP'}</p>
                      </div>
                      <span className="badge-warning text-[10px] flex-shrink-0">50 XP</span>
                    </div>
                  )}
                  <p className="text-[10px] text-text-muted mt-3 flex items-center gap-1">
                    <FiCheckSquare size={10} /> You can complete only ONE task per day. Choose wisely!
                  </p>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-text-muted text-sm">No active challenges</p>
                  <Link to="/challenges/new" className="btn-primary text-xs mt-3 inline-block">Create One</Link>
                </div>
              )}
            </div>

            {/* Today's Progress */}
            <div className="card p-4">
              <div className="section-header">
                <h3 className="section-title">Today's Progress</h3>
                <Link to="/challenges" className="section-link">View Plan</Link>
              </div>
              {/* Weekly Calendar Dots */}
              <div className="flex justify-between mb-4">
                {weekDays.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-[9px] text-text-muted font-medium">{day}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                      ${i < todayDayIndex ? 'bg-success/20 text-success' : 
                        i === todayDayIndex ? 'bg-primary text-white' : 
                        'bg-surface-elevated text-text-muted'}`}>
                      {i < todayDayIndex ? '✓' : i === todayDayIndex ? new Date().getDate() : '○'}
                    </div>
                  </div>
                ))}
              </div>
              {/* Next Milestone */}
              {activeMilestone && (
                <div className="p-3 rounded-lg bg-surface-elevated">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <FiTarget size={12} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-primary">Next Milestone</p>
                      <p className="text-[10px] text-text-muted">{activeMilestone.title || '10-Day Milestone'}</p>
                    </div>
                    <span className="ml-auto text-sm font-bold font-mono text-primary">{milestoneProgress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill bg-primary" style={{ width: `${milestoneProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Module Quick Access Cards */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { title: 'Exam Mode', sub: 'Focus Mode for Exams', value: '0', valueSub: 'Active Exams', icon: <FiShield size={24} />, color: 'primary', btn: 'Enter Exam Mode', link: '/exams' },
              { title: 'Gym & Fitness', sub: 'This Week', value: '4 / 6', valueSub: 'Workouts', icon: <FiActivity size={24} />, color: 'danger', btn: 'View Workout Plan', link: '/gym' },
              { title: 'Developer Profile', sub: 'Coding Hours', value: '14.2', valueSub: 'This Week', icon: <FiTerminal size={24} />, color: 'success', btn: 'View Profile', link: '/dev' },
              { title: 'Study Tracker', sub: 'Study Hours', value: '22.5', valueSub: 'This Week', icon: <FiBookOpen size={24} />, color: 'info', btn: 'Start Studying', link: '/knowledge' },
            ].map((mod, i) => (
              <div key={i} className="card p-4 flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-xl bg-${mod.color}/10 text-${mod.color} flex items-center justify-center mb-2`}>
                  {mod.icon}
                </div>
                <h4 className="text-xs font-bold text-text-primary">{mod.title}</h4>
                <p className="text-[10px] text-text-muted">{mod.sub}</p>
                <p className="text-xl font-extrabold font-mono text-text-primary mt-2">{mod.value}</p>
                <p className="text-[10px] text-text-muted mb-3">{mod.valueSub}</p>
                <Link to={mod.link} className={`w-full py-2 rounded-lg text-xs font-semibold text-center transition-all
                  bg-${mod.color}/20 text-${mod.color} hover:bg-${mod.color}/30`}>
                  {mod.btn}
                </Link>
              </div>
            ))}
          </div>

          {/* Heatmap + Life Score Trend */}
          <div className="grid grid-cols-2 gap-4">
            <ActivityHeatmap />
            <LifeScoreTrend />
          </div>
        </div>

        {/* Right 4 columns — Sidebar widgets */}
        <div className="col-span-4 space-y-4">
          {/* Accountability Partners */}
          <div className="card p-4">
            <div className="section-header">
              <h3 className="section-title">Accountability Partners</h3>
              <Link to="/friends" className="section-link">View All</Link>
            </div>
            {[
              { name: 'Arjun Verma', status: 'Online', color: 'success' },
              { name: 'Rohit Singh', status: 'Last seen 1h ago', color: 'text-muted' },
              { name: 'Priya Sharma', status: 'Online', color: 'success' },
            ].map((partner, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-purple/60 flex items-center justify-center text-white text-xs font-bold">
                    {partner.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">{partner.name}</p>
                    <div className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full bg-${partner.color}`} />
                      <p className="text-[10px] text-text-muted">{partner.status}</p>
                    </div>
                  </div>
                </div>
                <Link to="/friends" className="btn-outline text-[10px] px-3 py-1">Inspect</Link>
              </div>
            ))}
          </div>

          {/* Pending Inquiries */}
          <div className="card p-4">
            <div className="section-header">
              <div className="flex items-center gap-2">
                <h3 className="section-title">Pending Inquiries</h3>
                {unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">{unreadCount}</span>
                )}
              </div>
            </div>
            {[
              { name: 'Arjun', task: 'Day 12 (Skipped)', time: '2h ago' },
              { name: 'Priya', task: 'Day 8 (Skipped)', time: '5h ago' },
            ].map((inq, i) => (
              <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-border-subtle last:border-0">
                <div className="w-6 h-6 rounded-full bg-danger/20 text-danger flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FiEye size={10} />
                </div>
                <div>
                  <p className="text-[11px] text-text-secondary">
                    <span className="font-semibold text-text-primary">{inq.name}</span> asked about your <span className="text-danger font-semibold">{inq.task}</span>
                  </p>
                  <p className="text-[9px] text-text-muted">{inq.time}</p>
                </div>
              </div>
            ))}
            <Link to="/notifications" className="block mt-3 text-center text-xs font-semibold text-primary-light hover:text-primary transition-colors py-2 rounded-lg bg-surface-elevated">
              View All Inquiries
            </Link>
          </div>

          {/* XP Breakdown */}
          <XPBreakdown xp={totalXP + (currentLevel - 1) * 100} />

          {/* Recent Achievements */}
          <div className="card p-4">
            <div className="section-header">
              <h3 className="section-title">Recent Achievements</h3>
              <span className="section-link">View All</span>
            </div>
            {[
              { icon: '🏆', title: '10-Day Consistency', sub: 'Complete tasks for 10 days', xp: '+200 XP' },
              { icon: '🌅', title: 'Early Bird', sub: 'Complete a task before 8 AM', xp: '+100 XP' },
            ].map((ach, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{ach.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">{ach.title}</p>
                    <p className="text-[10px] text-text-muted">{ach.sub}</p>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-warning">{ach.xp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom XP Progress Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="card p-3 flex items-center gap-4"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🏆</span>
          <div>
            <p className="text-xs font-bold text-warning">You are on fire! 🔥</p>
            <p className="text-[10px] text-text-muted">Keep your streak alive and level up your life!</p>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-3">
          <span className="text-xs font-semibold text-text-primary whitespace-nowrap">Level {currentLevel + 1} Progress</span>
          <div className="flex-1 progress-bar h-2">
            <div className="progress-fill bg-gradient-to-r from-primary to-success" style={{ width: `${xpProgress}%` }} />
          </div>
          <span className="text-xs font-mono text-text-muted whitespace-nowrap">{totalXP} / {xpForLevel} XP</span>
        </div>
      </motion.div>
    </div>
  );
}
