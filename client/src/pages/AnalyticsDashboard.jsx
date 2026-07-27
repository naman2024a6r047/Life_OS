import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FiBarChart2, FiClock, FiCheckCircle, FiTarget, FiZap,
  FiFilter, FiCalendar, FiTrendingUp, FiInfo, FiGrid
} from 'react-icons/fi';

export default function AnalyticsDashboard() {
  const { user } = useContext(AuthContext);

  const streak = user?.current_streak ?? 0;

  const subjectPerformance = [
    { name: 'Data Structures', time: '16h 20m', done: '22/25', pct: 88, color: 'bg-purple', icon: '</>' },
    { name: 'DBMS', time: '10h 15m', done: '18/22', pct: 82, color: 'bg-info', icon: '🛢️' },
    { name: 'Operating Systems', time: '8h 40m', done: '15/20', pct: 75, color: 'bg-success', icon: '💻' },
    { name: 'Web Development', time: '7h 10m', done: '12/15', pct: 80, color: 'bg-warning', icon: '🌐' },
    { name: 'Mathematics', time: '4h 30m', done: '10/14', pct: 70, color: 'bg-primary', icon: '∑' },
    { name: 'Others', time: '2h 10m', done: '6/10', pct: 60, color: 'bg-text-muted', icon: '📁' },
  ];

  const topSessions = [
    { title: 'Data Structures – Trees & Graphs', duration: '2h 45m', date: 'May 16, 10:00 AM', icon: '</>', color: 'purple' },
    { title: 'DBMS – Normalization', duration: '2h 30m', date: 'May 15, 2:00 PM', icon: '🛢️', color: 'info' },
    { title: 'Operating Systems – Processes', duration: '2h 10m', date: 'May 14, 11:30 AM', icon: '💻', color: 'success' },
    { title: 'Web Dev – React Components', duration: '1h 50m', date: 'May 13, 4:00 PM', icon: '🌐', color: 'warning' },
    { title: 'Mathematics – Discrete Math', duration: '1h 30m', date: 'May 12, 6:00 PM', icon: '∑', color: 'primary' },
  ];

  const insights = [
    { icon: '🟢', text: 'Great job! Your focus score is improved by 8% this week.' },
    { icon: '🔵', text: 'You spent the most time on Data Structures.' },
    { icon: '🟡', text: 'Try to take short breaks. Your break time is 22% of total time.' },
    { icon: '⚡', text: 'You are most productive on Thursday.' },
  ];

  const days = ['Mon 12', 'Tue 13', 'Wed 14', 'Thu 15', 'Fri 16', 'Sat 17', 'Sun 18'];

  return (
    <div className="p-6 space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center">
            <FiBarChart2 size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Analytics</h1>
            <p className="text-xs text-text-muted">Insights to help you improve and grow every day.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono cursor-pointer">
            <FiCalendar size={13} className="text-text-muted" />
            <span>May 12 – May 18, 2026 ▾</span>
          </div>
          <button className="btn-outline text-xs flex items-center gap-1.5">
            <FiFilter size={13} /> Filters
          </button>
        </div>
      </div>

      {/* Top Stats Cards Row (5 cols) */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { icon: <FiClock size={16} />, label: 'Total Time Tracked', val: '48h 35m', sub: '↑ 18% vs last week', color: 'info' },
          { icon: <FiCheckCircle size={16} />, label: 'Tasks Completed', val: '62', sub: '↑ 22% vs last week', color: 'success' },
          { icon: <FiTarget size={16} />, label: 'Focus Score (Avg.)', val: '85%', sub: '↑ 8% vs last week', color: 'primary' },
          { icon: <FiZap size={16} />, label: 'Productivity', val: '92%', sub: '↑ 12% vs last week', color: 'warning' },
          { icon: <FiTrendingUp size={16} />, label: 'Consistency', val: `${streak} Days`, sub: 'Current streak', color: 'danger' },
        ].map((stat, i) => (
          <div key={i} className="card p-3.5 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-${stat.color}/10 text-${stat.color} flex items-center justify-center flex-shrink-0`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-text-muted font-medium truncate">{stat.label}</p>
              <p className="text-lg font-bold font-mono text-text-primary leading-tight">{stat.val}</p>
              <p className="text-[9px] text-success font-semibold">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Study Time Overview Stacked Bar Chart (5 cols) */}
        <div className="lg:col-span-5 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Study Time Overview</h3>
            <span className="text-xs text-text-muted font-medium">This Week ▾</span>
          </div>

          {/* Stacked Bars */}
          <div className="h-44 flex items-end justify-between gap-2 px-1 pt-4 pb-2 border-b border-border-subtle">
            {[
              { day: 'Mon 12', segments: [{ h: 20, c: 'bg-purple' }, { h: 15, c: 'bg-info' }, { h: 10, c: 'bg-success' }] },
              { day: 'Tue 13', segments: [{ h: 25, c: 'bg-purple' }, { h: 10, c: 'bg-info' }, { h: 20, c: 'bg-warning' }] },
              { day: 'Wed 14', segments: [{ h: 30, c: 'bg-purple' }, { h: 20, c: 'bg-success' }, { h: 10, c: 'bg-primary' }] },
              { day: 'Thu 15', segments: [{ h: 40, c: 'bg-purple' }, { h: 15, c: 'bg-info' }, { h: 20, c: 'bg-warning' }] },
              { day: 'Fri 16', segments: [{ h: 15, c: 'bg-purple' }, { h: 25, c: 'bg-info' }, { h: 15, c: 'bg-success' }] },
              { day: 'Sat 17', segments: [{ h: 35, c: 'bg-purple' }, { h: 20, c: 'bg-warning' }, { h: 15, c: 'bg-info' }] },
              { day: 'Sun 18', segments: [{ h: 20, c: 'bg-purple' }, { h: 15, c: 'bg-success' }, { h: 10, c: 'bg-primary' }] },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full rounded-t-md overflow-hidden flex flex-col justify-end gap-[1px]">
                  {bar.segments.map((seg, si) => (
                    <div key={si} className={`w-full ${seg.c}`} style={{ height: `${seg.h}px` }} />
                  ))}
                </div>
                <span className="text-[8px] text-text-muted font-mono">{bar.day}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[9px] text-text-muted">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple" /> Data Structures</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-info" /> DBMS</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-success" /> Operating Systems</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-warning" /> Web Development</span>
          </div>
        </div>

        {/* Time Distribution Donut Chart (4 cols) */}
        <div className="lg:col-span-4 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Time Distribution</h3>
          </div>

          <div className="flex items-center justify-center my-1">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="52" stroke="#A855F7" strokeWidth="14" strokeDasharray="100 226" fill="none" />
                <circle cx="64" cy="64" r="52" stroke="#06B6D4" strokeWidth="14" strokeDasharray="65 261" strokeDashoffset="-100" fill="none" />
                <circle cx="64" cy="64" r="52" stroke="#22C55E" strokeWidth="14" strokeDasharray="55 271" strokeDashoffset="-165" fill="none" />
                <circle cx="64" cy="64" r="52" stroke="#F59E0B" strokeWidth="14" strokeDasharray="45 281" strokeDashoffset="-220" fill="none" />
                <circle cx="64" cy="64" r="52" stroke="#64748B" strokeWidth="14" strokeDasharray="40 286" strokeDashoffset="-265" fill="none" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-bold font-mono text-text-primary">48h 35m</span>
                <span className="text-[9px] text-text-muted">Total</span>
              </div>
            </div>
          </div>

          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between"><span className="text-purple font-medium">• Data Structures</span><span className="font-mono text-text-primary">16h 20m (33%)</span></div>
            <div className="flex justify-between"><span className="text-info font-medium">• DBMS</span><span className="font-mono text-text-primary">10h 15m (21%)</span></div>
            <div className="flex justify-between"><span className="text-success font-medium">• Operating Systems</span><span className="font-mono text-text-primary">8h 40m (18%)</span></div>
            <div className="flex justify-between"><span className="text-warning font-medium">• Web Development</span><span className="font-mono text-text-primary">7h 10m (15%)</span></div>
            <div className="flex justify-between"><span className="text-text-muted font-medium">• Others</span><span className="font-mono text-text-primary">6h 10m (13%)</span></div>
          </div>
        </div>

        {/* Activity Heatmap Grid (3 cols) */}
        <div className="lg:col-span-3 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Activity Heatmap</h3>
            <span className="text-xs text-text-muted">This Month ▾</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[8px] text-text-muted font-mono px-1">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 28 }, (_, i) => (
                <div key={i} className={`h-4 rounded-[3px] ${i % 3 === 0 ? 'bg-success' : i % 5 === 0 ? 'bg-success/50' : 'bg-surface-elevated'}`} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] text-text-muted pt-2 border-t border-border-subtle">
            <span>Less</span>
            <div className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-surface-elevated" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-success/30" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-success/60" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-success" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Subject Performance List (4 cols) */}
        <div className="lg:col-span-4 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Subject Performance</h3>
            <span className="text-xs text-text-muted">This Week ▾</span>
          </div>

          <div className="space-y-2.5">
            {subjectPerformance.map(sb => (
              <div key={sb.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-primary flex items-center gap-1.5">
                    <span className="text-xs">{sb.icon}</span> {sb.name}
                  </span>
                  <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span className="text-text-muted">{sb.time}</span>
                    <span className="text-text-secondary">{sb.done}</span>
                    <span className="font-bold text-text-primary">{sb.pct}%</span>
                  </div>
                </div>
                <div className="progress-bar h-1.5">
                  <div className={`progress-fill ${sb.color}`} style={{ width: `${sb.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Focus Time vs Break Time Donut (3 cols) */}
        <div className="lg:col-span-3 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Focus Time vs Break Time</h3>
            <span className="text-xs text-text-muted">This Week ▾</span>
          </div>

          <div className="flex items-center justify-center my-2">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r="44" stroke="#A855F7" strokeWidth="12" strokeDasharray="210 66" fill="none" />
                <circle cx="56" cy="56" r="44" stroke="#22C55E" strokeWidth="12" strokeDasharray="66 210" strokeDashoffset="-210" fill="none" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold font-mono text-text-primary">78%</span>
              </div>
            </div>
          </div>

          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between"><span className="text-purple font-medium">• Focus Time</span><span className="font-mono text-text-primary">38h 10m (78%)</span></div>
            <div className="flex justify-between"><span className="text-success font-medium">• Break Time</span><span className="font-mono text-text-primary">10h 25m (22%)</span></div>
          </div>
        </div>

        {/* Productivity Trend & Top Sessions & Insights (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Productivity Trend Line Chart */}
          <div className="card p-4 space-y-2">
            <div className="section-header">
              <h3 className="section-title">Productivity Trend</h3>
              <span className="text-xs text-text-muted font-medium">Daily ▾</span>
            </div>
            <div className="relative h-28">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                <path d="M 0 60 L 16 75 L 32 55 L 48 20 L 64 45 L 80 15 L 100 35" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
                <circle cx="48" cy="20" r="3" fill="#A855F7" stroke="#0B0D18" strokeWidth="1.5" />
              </svg>
              <div className="absolute top-1 left-[43%] p-1 rounded bg-surface border border-border-subtle text-[8px] font-mono text-text-primary">
                May 15 <br /><strong className="text-purple">92%</strong>
              </div>
            </div>
            <div className="flex justify-between text-[8px] text-text-muted font-mono">
              {days.map(d => <span key={d}>{d}</span>)}
            </div>
          </div>

          {/* Top Study Sessions */}
          <div className="card p-4 space-y-2.5">
            <div className="section-header">
              <h3 className="section-title">Top Study Sessions</h3>
              <span className="section-link">View All</span>
            </div>
            <div className="space-y-2">
              {topSessions.map((ts, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated/40">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded bg-${ts.color}/10 text-${ts.color} flex items-center justify-center font-bold text-xs`}>
                      {ts.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-primary leading-tight">{ts.title}</p>
                      <p className="text-[8px] text-text-muted">{ts.date}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-text-primary flex items-center gap-1">
                    {ts.duration} <FiCheckCircle className="text-success" size={12} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Insights List */}
          <div className="card p-4 space-y-2">
            <div className="section-header">
              <h3 className="section-title">Insights</h3>
              <span className="section-link">View All</span>
            </div>
            <div className="space-y-1.5">
              {insights.map((ins, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-text-secondary">
                  <span className="text-xs flex-shrink-0 mt-0.5">{ins.icon}</span>
                  <span>{ins.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Area Line Chart — Weekly Summary */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="section-title">Weekly Summary</h3>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-purple flex items-center gap-1"><span className="w-2 h-0.5 bg-purple inline-block" /> Study Time (h)</span>
            <span className="text-info flex items-center gap-1"><span className="w-2 h-0.5 bg-info inline-block" /> Tasks Completed</span>
            <span className="text-success flex items-center gap-1"><span className="w-2 h-0.5 bg-success inline-block" /> Focus Score (%)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-3 space-y-3 py-2 border-b lg:border-b-0 lg:border-r border-border-subtle pb-4 lg:pb-2">
            <div className="flex items-center gap-2">
              <FiClock className="text-purple" />
              <div>
                <p className="text-lg font-bold font-mono text-text-primary">48h 35m</p>
                <p className="text-[10px] text-text-muted">Total Time <span className="text-success">↑ 18%</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-info" />
              <div>
                <p className="text-lg font-bold font-mono text-text-primary">62</p>
                <p className="text-[10px] text-text-muted">Tasks Done <span className="text-success">↑ 22%</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FiTarget className="text-success" />
              <div>
                <p className="text-lg font-bold font-mono text-text-primary">85%</p>
                <p className="text-[10px] text-text-muted">Avg. Focus Score <span className="text-success">↑ 8%</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FiZap className="text-warning" />
              <div>
                <p className="text-lg font-bold font-mono text-text-primary">18 Days</p>
                <p className="text-[10px] text-text-muted">Longest Streak</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-9 h-40 relative pt-2">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              {/* Line 1: Study Time */}
              <path d="M 0 70 L 16 80 L 32 60 L 48 30 L 64 50 L 80 20 L 100 40" fill="none" stroke="#A855F7" strokeWidth="2" />
              {/* Line 2: Tasks Done */}
              <path d="M 0 85 L 16 80 L 32 75 L 48 55 L 64 65 L 80 45 L 100 60" fill="none" stroke="#06B6D4" strokeWidth="2" />
              {/* Line 3: Focus Score */}
              <path d="M 0 40 L 16 30 L 32 45 L 48 20 L 64 35 L 80 15 L 100 25" fill="none" stroke="#22C55E" strokeWidth="2" />
            </svg>
            <div className="flex justify-between text-[9px] text-text-muted font-mono mt-2">
              {days.map(d => <span key={d}>{d}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
