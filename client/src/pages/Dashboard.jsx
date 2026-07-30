import React, { useContext, useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FiTarget, FiZap, FiAward, FiUsers, FiTerminal, FiActivity,
  FiBookOpen, FiBarChart2, FiCheckSquare, FiArrowRight, FiShield,
  FiTrendingUp, FiClock, FiHeart, FiEye, FiBell
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

function ActivityHeatmap({ heatmapData = [] }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const days = ['', 'Mon', '', 'Wed', '', 'Fri', '']; // Sunday-aligned
  
  const cells = useMemo(() => {
    const result = [];
    const countMap = {};
    if (Array.isArray(heatmapData)) {
      heatmapData.forEach(d => {
        countMap[d.date] = d.count || 0;
      });
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    // Find the Sunday of the current week
    const currentDayOfWeek = today.getDay(); // 0 is Sunday
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - currentDayOfWeek)); // Next Saturday

    const startDate = new Date(endOfWeek);
    startDate.setDate(endOfWeek.getDate() - (32 * 7) + 1); // 32 weeks ago, starting on a Sunday

    for (let week = 0; week < 32; week++) {
      for (let day = 0; day < 7; day++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + (week * 7) + day);
        // Ensure local YYYY-MM-DD instead of UTC offset shifting
        const dateStr = [
          cellDate.getFullYear(),
          String(cellDate.getMonth() + 1).padStart(2, '0'),
          String(cellDate.getDate()).padStart(2, '0')
        ].join('-');
        
        const intensity = countMap[dateStr] || 0;
        let color = 'bg-surface-elevated';
        if (intensity >= 4) color = 'bg-primary';
        else if (intensity >= 3) color = 'bg-indigo-400';
        else if (intensity >= 2) color = 'bg-indigo-600';
        else if (intensity === 1) color = 'bg-indigo-800';
        
        const title = intensity === 0 ? `No activity on ${dateStr}` : `${intensity} activities on ${dateStr}`;
        result.push({ week, day, color, title });
      }
    }
    return result;
  }, [heatmapData]);

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
              <div key={i} title={cell.title} className={`w-[12px] h-[12px] rounded-[2px] transition-all cursor-pointer hover:ring-1 hover:ring-white/40 ${cell.color}`} />
            ))}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-text-muted mt-3 italic">"Consistency is the key to mastery."</p>
    </div>
  );
}

function ActivityTrend({ trendData = [] }) {
  const data = trendData.length > 0 ? trendData.slice(-7) : [
    { date: 'Start', xp: 0 }, { date: 'Now', xp: 0 }
  ];
  
  return (
    <div className="card p-4">
      <div className="section-header">
        <h3 className="section-title">Activity XP Trend</h3>
        <span className="text-[10px] font-medium text-text-muted bg-surface-elevated px-2 py-1 rounded">Daily</span>
      </div>
      <div className="h-36 mt-4 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(-2)} />
            <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#161A2E', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px', color: '#F1F5F9' }}
              itemStyle={{ color: '#818CF8' }}
              labelStyle={{ color: '#64748B', marginBottom: '4px' }}
            />
            <Area type="monotone" dataKey="xp" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function XPBreakdown({ xp, breakdown = [] }) {
  const defaultSegments = [
    { label: 'Challenges', pct: 0, color: '#6366F1' },
    { label: 'Study', pct: 0, color: '#06B6D4' },
    { label: 'Fitness', pct: 0, color: '#22C55E' },
    { label: 'Coding', pct: 0, color: '#F59E0B' },
    { label: 'Other', pct: 100, color: '#64748B' },
  ];
  const segments = breakdown.length > 0 ? breakdown : defaultSegments;
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
  const { user, refreshUser } = useContext(AuthContext);
  const [challenges, setChallenges] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [partners, setPartners] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [dashStats, setDashStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [challRes, analyticsRes, unreadRes, partnersRes, inqRes, achRes, heatmapRes, trendRes, statsRes] = await Promise.allSettled([
          axios.get('/api/challenges'),
          axios.get('/api/analytics/summary'),
          axios.get('/api/friends/interventions/unread-count'),
          axios.get('/api/dashboard/partners'),
          axios.get('/api/dashboard/inquiries'),
          axios.get('/api/dashboard/achievements'),
          axios.get('/api/analytics/heatmap'),
          axios.get('/api/analytics/timeseries?horizon=daily'),
          axios.get('/api/dashboard/stats')
        ]);
        let fetched = [];
        if (challRes.status === 'fulfilled') fetched = challRes.value.data || [];
        setChallenges(fetched);
        if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data);
        if (unreadRes.status === 'fulfilled') setUnreadCount(unreadRes.value.data?.count || 0);
        if (partnersRes.status === 'fulfilled') setPartners(partnersRes.value.data);
        if (inqRes.status === 'fulfilled') setInquiries(inqRes.value.data);
        if (achRes.status === 'fulfilled') setAchievements(achRes.value.data);
        if (heatmapRes.status === 'fulfilled') setHeatmapData(heatmapRes.value.data);
        if (trendRes.status === 'fulfilled') setTrendData(trendRes.value.data);
        if (statsRes.status === 'fulfilled') setDashStats(statsRes.value.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
    // Refresh user profile so header shows latest level/xp/streak from DB
    refreshUser();
  }, []);

  const activeChallenge = challenges.find(c => c.status === 'active') || challenges[0];
  const activeMilestone = activeChallenge?.milestones?.[0] || activeChallenge?.Milestones?.[0];
  const tasks = activeMilestone?.tasks || activeMilestone?.MilestoneTasks || [];
  const todayTask = tasks.find(t => !t.is_completed) || tasks[0];
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const totalTasks = tasks.length;
  const milestoneProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const lifeScore = analytics?.lifeScore || 0;
  const totalXP = user?.xp || analytics?.xp || 0;
  const currentLevel = user?.level || analytics?.level || 1;
  const streak = user?.current_streak ?? analytics?.streak ?? 0;
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
    <div className="p-4 md:p-6 space-y-5 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            {greeting}, {user?.username || 'Warrior'}! 👋
          </h1>
          <p className="text-xs text-text-muted mt-0.5">"Discipline today, freedom tomorrow."</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
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
          <Link to="/notifications" className="relative p-2 rounded-xl bg-surface hover:bg-surface-elevated border border-border-subtle text-text-muted hover:text-primary transition-colors ml-2">
            <FiBell size={18} />
            {analytics?.pendingReviews > 0 && (
              <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-danger"></span>
            )}
          </Link>
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="stat-card">
          <LifeScoreCircle score={analytics?.lifeScore || 0} />
          <div>
            <p className="text-[11px] text-text-muted">Life Score</p>
            <p className="text-xs text-success font-medium">Keep going!</p>
          </div>
        </div>
        <StatCard icon={<FiTarget size={18} />} label="Active Challenges" value={analytics?.activeGoals || 0} sub="Keep it up!" color="primary" />
        <StatCard icon={<FiCheckSquare size={18} />} label="Tasks Completed" value={`${analytics?.completedTasks || 0} / ${analytics?.totalTasks || 0}`} sub="All Time" color="success" />
        <StatCard icon={<FiClock size={18} />} label="Focus Hours" value={dashStats?.focusHours || '0'} sub="Recorded" color="info" />
        <StatCard icon={<FiHeart size={18} />} label="Grace Tokens" value={analytics?.graceTokens || 0} sub="Available" color="warning" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 8 columns */}
        <div className="lg:col-span-8 space-y-4">
          {/* Today's Challenge + Today's Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { title: 'Exam Mode', sub: 'Focus Mode', value: 'Active', valueSub: 'Study Sessions', icon: <FiShield size={24} />, color: 'primary', btn: 'Enter Exam Mode', link: '/exams' },
              { title: 'Gym & Fitness', sub: 'Workouts', value: dashStats?.workouts || 0, valueSub: 'Total', icon: <FiActivity size={24} />, color: 'danger', btn: 'View Workout Plan', link: '/gym' },
              { title: 'Developer Profile', sub: 'Coding Hours', value: dashStats?.codingHours || '0', valueSub: 'Total', icon: <FiTerminal size={24} />, color: 'success', btn: 'View Profile', link: '/dev' },
              { title: 'Study Tracker', sub: 'Study Hours', value: dashStats?.studyHours || '0', valueSub: 'Total', icon: <FiBookOpen size={24} />, color: 'info', btn: 'Start Studying', link: '/knowledge' },
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActivityHeatmap heatmapData={heatmapData} />
            <ActivityTrend trendData={trendData} />
          </div>
        </div>

        {/* Right 4 columns — Sidebar widgets */}
        <div className="lg:col-span-4 space-y-4">
          {/* Accountability Partners */}
          <div className="card p-4">
            <div className="section-header">
              <h3 className="section-title">Accountability Partners</h3>
              <Link to="/friends" className="section-link">View All</Link>
            </div>
            {partners.length > 0 ? partners.map((partner, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-purple/60 flex items-center justify-center text-white text-xs font-bold">
                    {partner.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">{partner.name}</p>
                    <div className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${partner.status === 'Online' ? 'bg-success' : 'bg-text-muted'}`} />
                      <p className="text-[10px] text-text-muted">{partner.status === 'Online' ? 'Online' : partner.lastSeen ? `Last seen ${new Date(partner.lastSeen).toLocaleDateString()}` : 'Offline'}</p>
                    </div>
                  </div>
                </div>
                <Link to="/friends" className="btn-outline border-border-subtle text-text-muted text-[10px] px-3 py-1">Inspect</Link>
              </div>
            )) : (
              <p className="text-xs text-text-muted text-center py-4">No partners assigned yet.</p>
            )}
          </div>

          {/* Pending Inquiries */}
          <div className="card p-4 border-danger/30">
            <div className="section-header">
              <div className="flex items-center gap-2">
                <h3 className="section-title text-red-500">Pending Inquiries</h3>
                {inquiries.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{inquiries.length}</span>
                )}
              </div>
            </div>
            {inquiries.length > 0 ? inquiries.map((inq, i) => (
              <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-slate-700 last:border-0 bg-red-500/5 px-2 rounded-lg mt-2">
                <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FiEye size={10} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-300">
                    <span className="font-semibold text-white">{inq.partner?.name || 'Partner'}</span> {inq.message}
                  </p>
                  <p className="text-[9px] text-slate-500">{new Date(inq.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-slate-500 text-center py-4">No pending inquiries.</p>
            )}
            <Link to="/notifications" className="block mt-3 text-center text-xs font-semibold text-primary-light hover:text-primary transition-colors py-2 rounded-lg bg-surface-elevated">
              View All Inquiries
            </Link>
          </div>

          {/* XP Breakdown */}
          <XPBreakdown xp={analytics?.xp || 0} breakdown={dashStats?.xpBreakdown} />

          {/* Recent Achievements */}
          <div className="card p-4">
            <div className="section-header">
              <h3 className="section-title">Recent Achievements</h3>
              <span className="section-link">View All</span>
            </div>
            {achievements.length > 0 ? achievements.map((ach, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{ach.icon || '🏆'}</span>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">{ach.title}</p>
                    <p className="text-[10px] text-text-muted">{ach.description}</p>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-warning">+{ach.xpAwarded} XP</span>
              </div>
            )) : (
              <p className="text-xs text-text-muted text-center py-4">No recent achievements.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom XP Progress Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="card p-4 flex flex-col md:flex-row items-start md:items-center gap-4"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🏆</span>
          <div>
            <p className="text-xs font-bold text-warning">You are on fire! 🔥</p>
            <p className="text-[10px] text-text-muted">Keep your streak alive and level up your life!</p>
          </div>
        </div>
        <div className="w-full md:w-auto flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-xs font-semibold text-text-primary whitespace-nowrap">Level {currentLevel + 1} Progress</span>
          <div className="w-full sm:flex-1 progress-bar h-2">
            <div className="progress-fill bg-gradient-to-r from-primary to-success" style={{ width: `${xpProgress}%` }} />
          </div>
          <span className="text-xs font-mono text-text-muted whitespace-nowrap self-end sm:self-auto">{totalXP} / {xpForLevel} XP</span>
        </div>
      </motion.div>
    </div>
  );
}
