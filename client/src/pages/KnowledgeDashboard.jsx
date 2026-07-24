import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FiBookOpen, FiClock, FiTarget, FiZap, FiCalendar, FiPlus,
  FiTrendingUp, FiAward, FiCheckCircle, FiChevronRight, FiInfo, FiGrid
} from 'react-icons/fi';

export default function KnowledgeDashboard() {
  const { user } = useContext(AuthContext);

  const streak = user?.current_streak || 18;

  const recentSessions = [
    { title: 'Data Structures – Arrays', sub: 'C++ • LeetCode Problems', duration: '2h 15m', time: 'Today, 10:30 AM', icon: '</>', color: 'purple' },
    { title: 'Database Normalization', sub: 'DBMS Notes & Examples', duration: '1h 45m', time: 'Today, 8:15 AM', icon: '🛢️', color: 'info' },
    { title: 'Process Scheduling', sub: 'Operating Systems', duration: '1h 30m', time: 'Yesterday, 7:00 PM', icon: '💻', color: 'success' },
    { title: 'React Components', sub: 'Web Development', duration: '1h 20m', time: 'Yesterday, 4:30 PM', icon: '🌐', color: 'warning' },
    { title: 'Discrete Mathematics', sub: 'Set Theory', duration: '1h 10m', time: 'Yesterday, 2:00 PM', icon: '∑', color: 'primary' },
  ];

  const subjects = [
    { name: 'Data Structures', time: '18h 30m', pct: 85, color: 'bg-purple', icon: '</>' },
    { name: 'Database Systems', time: '12h 15m', pct: 65, color: 'bg-info', icon: '🛢️' },
    { name: 'Operating Systems', time: '9h 45m', pct: 50, color: 'bg-success', icon: '💻' },
    { name: 'Web Development', time: '8h 20m', pct: 45, color: 'bg-warning', icon: '🌐' },
    { name: 'Mathematics', time: '6h 10m', pct: 35, color: 'bg-primary', icon: '∑' },
  ];

  const dailyTrend = [
    { day: 'Mon 12', height: 40 },
    { day: 'Tue 13', height: 50 },
    { day: 'Wed 14', height: 35 },
    { day: 'Thu 15', height: 85, active: true },
    { day: 'Fri 16', height: 45 },
    { day: 'Sat 17', height: 75 },
    { day: 'Sun 18', height: 55 },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center">
            <FiBookOpen size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Study Tracker</h1>
            <p className="text-xs text-text-muted">Track your study time. Improve consistency. Achieve your goals.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">⏱️</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">48h 35m</p>
              <p className="text-[9px] text-text-muted">Total Study Time (This Month)</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">📅</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">24</p>
              <p className="text-[9px] text-text-muted">Sessions (This Month)</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🎯</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">85%</p>
              <p className="text-[9px] text-text-muted">Focus Score (Excellent)</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🔥</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">{streak}</p>
              <p className="text-[9px] text-text-muted">Days Studied (Current Streak)</p>
            </div>
          </div>
          <button className="btn-primary text-xs bg-purple hover:bg-purple/80 flex items-center gap-1.5">
            <FiPlus size={16} /> Log Study Session
          </button>
        </div>
      </div>

      {/* Main Top Row Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Study Overview Donut (4 cols) */}
        <div className="col-span-4 card p-5 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Study Overview</h3>
            <span className="text-xs text-text-muted">This Week ▾</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r="44" stroke="#A855F7" strokeWidth="12" strokeDasharray="90 186" fill="none" />
                <circle cx="56" cy="56" r="44" stroke="#06B6D4" strokeWidth="12" strokeDasharray="60 216" strokeDashoffset="-90" fill="none" />
                <circle cx="56" cy="56" r="44" stroke="#22C55E" strokeWidth="12" strokeDasharray="40 236" strokeDashoffset="-150" fill="none" />
                <circle cx="56" cy="56" r="44" stroke="#F59E0B" strokeWidth="12" strokeDasharray="35 241" strokeDashoffset="-190" fill="none" />
                <circle cx="56" cy="56" r="44" stroke="#6366F1" strokeWidth="12" strokeDasharray="25 251" strokeDashoffset="-225" fill="none" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold font-mono text-text-primary">16h 45m</span>
                <span className="text-[8px] text-success">↑ 12% vs last week</span>
              </div>
            </div>

            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between gap-2"><span className="text-purple font-medium">• Data Structures</span><span className="font-mono text-text-primary">5h 30m (33%)</span></div>
              <div className="flex justify-between gap-2"><span className="text-info font-medium">• Database Systems</span><span className="font-mono text-text-primary">3h 45m (22%)</span></div>
              <div className="flex justify-between gap-2"><span className="text-success font-medium">• Operating Systems</span><span className="font-mono text-text-primary">2h 30m (15%)</span></div>
              <div className="flex justify-between gap-2"><span className="text-warning font-medium">• Web Development</span><span className="font-mono text-text-primary">2h 15m (13%)</span></div>
              <div className="flex justify-between gap-2"><span className="text-primary font-medium">• Mathematics</span><span className="font-mono text-text-primary">1h 45m (10%)</span></div>
              <div className="flex justify-between gap-2"><span className="text-text-muted font-medium">• Other</span><span className="font-mono text-text-primary">1h 00m (7%)</span></div>
            </div>
          </div>
        </div>

        {/* Study Time Trend Bar Chart (5 cols) */}
        <div className="col-span-5 card p-5 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Study Time Trend</h3>
            <span className="text-xs text-text-muted">Daily ▾</span>
          </div>

          <div className="h-36 flex items-end justify-between gap-2 px-2 pt-4 relative">
            {/* Tooltip on active bar */}
            <div className="absolute top-1 left-[45%] p-1.5 rounded-lg bg-surface border border-border-subtle text-[9px] text-text-primary font-mono shadow-xl z-10">
              Thu, May 15 <br /> <span className="text-purple font-bold">6h 30m</span>
            </div>
            {dailyTrend.map((b, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div
                  className={`w-full rounded-t-md transition-all ${
                    b.active ? 'bg-purple shadow-glow-primary' : 'bg-purple/40 hover:bg-purple'
                  }`}
                  style={{ height: `${b.height}%` }}
                />
                <span className="text-[9px] text-text-muted font-mono">{b.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Study Streak Card (3 cols) */}
        <div className="col-span-3 card p-5 flex flex-col items-center justify-between text-center">
          <div className="w-full flex items-center justify-between text-xs">
            <span className="font-bold text-text-primary">Study Streak</span>
            <span className="text-xs font-mono text-text-muted font-bold">May 12 – May 18</span>
          </div>
          <div className="my-2">
            <p className="text-3xl font-extrabold font-mono text-text-primary flex items-center justify-center gap-1">
              18 <span className="text-2xl">🔥</span>
            </p>
            <p className="text-xs font-bold text-warning mt-0.5">Days</p>
            <p className="text-[10px] text-text-muted">Keep it up! 🔥</p>
          </div>
          {/* M T W T F S S Dots */}
          <div className="flex justify-between w-full pt-2 border-t border-border-subtle">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-text-muted">{d}</span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  i < 6 ? 'bg-success text-white font-bold' : 'bg-surface-elevated text-text-muted'
                }`}>
                  {i < 6 ? '✓' : '○'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Recent Study Sessions (4 cols) */}
        <div className="col-span-4 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Recent Study Sessions</h3>
            <span className="section-link">View All</span>
          </div>
          <div className="space-y-2">
            {recentSessions.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated/40 hover:bg-surface-elevated transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg bg-${s.color}/10 text-${s.color} flex items-center justify-center font-bold text-xs`}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary leading-tight">{s.title}</p>
                    <p className="text-[9px] text-text-muted">{s.sub}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-text-primary">{s.duration}</p>
                  <p className="text-[8px] text-text-muted">{s.time}</p>
                </div>
              </div>
            ))}
          </div>
          <a href="#sessions" className="block text-center text-xs font-semibold text-purple hover:underline pt-1">
            View All Sessions →
          </a>
        </div>

        {/* Focus Insights (5 cols) */}
        <div className="col-span-5 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Focus Insights</h3>
            <span className="text-xs text-text-muted">This Week</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-surface-elevated border border-border-subtle">
              <p className="text-[10px] text-text-muted">Most Productive Day</p>
              <p className="font-bold text-text-primary text-sm mt-0.5">Saturday</p>
              <p className="text-[10px] font-mono text-purple font-semibold">6h 05m</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-elevated border border-border-subtle">
              <p className="text-[10px] text-text-muted">Most Productive Time</p>
              <p className="font-bold text-text-primary text-sm mt-0.5">10:00 AM – 12:00 PM</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-elevated border border-border-subtle">
              <p className="text-[10px] text-text-muted">Average Session</p>
              <p className="font-bold text-text-primary text-sm mt-0.5">1h 23m</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-elevated border border-border-subtle">
              <p className="text-[10px] text-text-muted">Focus Score</p>
              <p className="font-bold text-text-primary text-sm mt-0.5">85%</p>
              <span className="text-[9px] text-success font-semibold">Excellent</span>
            </div>
          </div>

          {/* Tip Banner */}
          <div className="p-3 rounded-xl bg-warning/10 border border-warning/30 flex items-start gap-2.5">
            <FiInfo className="text-warning text-lg flex-shrink-0 mt-0.5" />
            <p className="text-xs text-text-primary leading-relaxed">
              <strong>Tip:</strong> You are more focused in the morning. Try to schedule difficult topics in your peak hours!
            </p>
          </div>
        </div>

        {/* Weekly Goal & Subjects (3 cols) */}
        <div className="col-span-3 card p-4 space-y-4">
          {/* Weekly Goal Progress */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold text-text-primary">Weekly Goal</span>
              <span className="text-purple cursor-pointer hover:underline text-[10px]">Edit Goal</span>
            </div>
            <p className="text-[10px] text-text-muted mb-2">Study for 20 hours this week</p>
            <div className="flex justify-between text-xs mb-1 font-mono">
              <span className="font-bold text-text-primary">16h 45m <span className="text-text-muted font-normal">/ 20h</span></span>
              <span className="text-success font-bold">84%</span>
            </div>
            <div className="progress-bar h-2">
              <div className="progress-fill bg-purple" style={{ width: '84%' }} />
            </div>
            <p className="text-[9px] text-text-muted mt-1">3h 15m left to complete</p>
          </div>

          {/* Subjects */}
          <div className="space-y-2 pt-2 border-t border-border-subtle">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-text-primary">Subjects</span>
              <span className="text-purple cursor-pointer hover:underline text-[10px]">Manage</span>
            </div>
            <div className="space-y-2">
              {subjects.map(sb => (
                <div key={sb.name} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{sb.icon}</span>
                    <span className="font-medium text-text-primary">{sb.name}</span>
                  </div>
                  <span className="font-mono text-text-muted text-[11px]">{sb.time}</span>
                </div>
              ))}
            </div>
            <button className="w-full py-1.5 rounded-lg border border-dashed border-border-hover text-purple hover:bg-purple/10 text-xs font-semibold flex items-center justify-center gap-1 transition-all">
              <FiPlus size={13} /> Add New Subject
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Area Chart: Monthly Progress */}
      <div className="card p-5 space-y-3">
        <div className="section-header">
          <div>
            <h3 className="section-title">Monthly Progress</h3>
            <p className="text-[10px] text-text-muted mt-0.5">Total Study Time: <strong className="text-text-primary font-mono text-xs">48h 35m</strong> <span className="text-success">↑ 18% vs last month</span></p>
          </div>
          <div className="text-right">
            <span className="text-xs text-text-muted">This Month ▾</span>
            <div className="text-xs font-mono font-bold text-text-primary mt-1">Monthly Goal: 60h <span className="text-purple">81%</span></div>
            <p className="text-[9px] text-text-muted">11h 25m left</p>
          </div>
        </div>

        {/* SVG Area Chart */}
        <div className="relative h-32">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <path d="M 0 80 L 15 70 L 30 65 L 45 40 L 60 50 L 75 30 L 90 35 L 100 20 L 100 100 L 0 100 Z" fill="url(#studyGradient)" />
            <path d="M 0 80 L 15 70 L 30 65 L 45 40 L 60 50 L 75 30 L 90 35 L 100 20" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
            <circle cx="45" cy="40" r="3" fill="#A855F7" stroke="#0B0D18" strokeWidth="1.5" />
            <defs>
              <linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A855F7" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute top-4 left-[43%] p-1.5 rounded-lg bg-surface border border-border-subtle text-[9px] text-text-primary font-mono shadow-xl">
            May 15 <br /> <span className="text-purple font-bold">48h 35m</span>
          </div>
        </div>
        <div className="flex justify-between text-[9px] text-text-muted font-mono px-2">
          <span>May 1</span><span>May 8</span><span>May 15</span><span>May 22</span><span>May 29</span>
        </div>
      </div>
    </div>
  );
}
