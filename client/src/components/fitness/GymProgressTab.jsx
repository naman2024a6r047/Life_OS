import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FiCalendar, FiChevronDown, FiActivity, FiClock, FiTrendingUp,
  FiAward, FiShield, FiTarget, FiZap, FiCheckCircle, FiMoreVertical,
  FiInfo, FiUser, FiPlus, FiUploadCloud
} from 'react-icons/fi';
import ProgressPhotos from './ProgressPhotos';

export default function GymProgressTab({ workoutsList = [], googleAccessToken, googleDriveFolderLink }) {
  const hasData = workoutsList.length > 0;
  
  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Progress Overview</h2>
          <p className="text-xs text-text-muted">Track your fitness journey and see how far you've come.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-border-subtle rounded-xl text-xs font-bold text-text-primary hover:border-purple/50 transition-colors">
            <FiCalendar className="text-purple" />
            <span>May 12 - May 18, 2026</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-border-subtle rounded-xl text-xs font-bold text-text-primary hover:border-purple/50 transition-colors">
            <span>All Time</span>
            <FiChevronDown />
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Workouts */}
            <div className="card p-5 bg-gradient-to-br from-surface to-surface-elevated border border-border-subtle space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center">
                  <FiActivity size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Total Workouts</p>
                  <h3 className="text-2xl font-black text-text-primary">{workoutsList.length}</h3>
                </div>
              </div>
              <p className="text-xs font-bold text-success flex items-center gap-1">
                <FiTrendingUp size={14} /> +18% <span className="text-text-muted font-normal">vs last 30 days</span>
              </p>
            </div>

            {/* Total Duration */}
            <div className="card p-5 bg-gradient-to-br from-surface to-surface-elevated border border-border-subtle space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center">
                  <FiClock size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Total Duration</p>
                  <h3 className="text-2xl font-black text-text-primary">{`${(workoutsList.length * 1.1).toFixed(1)}h`}</h3>
                </div>
              </div>
              <p className="text-xs font-bold text-success flex items-center gap-1">
                <FiTrendingUp size={14} /> +14% <span className="text-text-muted font-normal">vs last 30 days</span>
              </p>
            </div>

            {/* Avg Workout / Week */}
            <div className="card p-5 bg-gradient-to-br from-surface to-surface-elevated border border-border-subtle space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
                  <FiTarget size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Avg. Workout / Week</p>
                  <h3 className="text-2xl font-black text-text-primary">{workoutsList.length > 0 ? '3.0' : '0'}</h3>
                </div>
              </div>
              <p className="text-xs font-bold text-success flex items-center gap-1">
                <FiTrendingUp size={14} /> +12% <span className="text-text-muted font-normal">vs last 30 days</span>
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Workout Frequency */}
            <div className="card p-5 border border-border-subtle bg-surface">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                    Workout Frequency <FiInfo size={14} className="text-text-muted" />
                  </h3>
                  <p className="text-[10px] text-text-muted">Number of workouts per week</p>
                </div>
                <button className="text-xs flex items-center gap-1 text-text-muted hover:text-text-primary">
                  Weekly <FiChevronDown />
                </button>
              </div>
              
              {/* Custom SVG Line Chart */}
              <div className="w-full h-40 relative">
                {/* Y Axis Labels */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-text-muted font-mono h-[calc(100%-24px)]">
                  <span>10</span>
                  <span>8</span>
                  <span>6</span>
                  <span>4</span>
                  <span>2</span>
                  <span>0</span>
                </div>
                
                {/* Grid Lines & Chart Area */}
                <div className="absolute left-5 right-0 top-2 bottom-6">
                  {/* Grid lines */}
                  <div className="w-full h-full flex flex-col justify-between border-l border-border-subtle relative z-0">
                    {[0, 1, 2, 3, 4, 5].map((_, i) => (
                      <div key={i} className="w-full border-b border-border-subtle/30" style={{ height: '0px' }}></div>
                    ))}
                    
                    {/* SVG Line (Purple Gradient) */}
                    <svg className="absolute inset-0 w-full h-full z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="freqGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(168, 85, 247, 0.4)" />
                          <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
                        </linearGradient>
                      </defs>
                      {(() => {
                        if (!hasData) {
                          return (
                            <>
                              <path d="M 0 100 L 20 100 L 40 100 L 60 100 L 80 100 L 100 100 L 100 100 L 0 100 Z" fill="url(#freqGrad)" />
                              <polyline points="0,100 20,100 40,100 60,100 80,100 100,100" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </>
                          );
                        }

                        // Aggregate by week for the last 6 weeks
                        const weeks = [0,0,0,0,0,0];
                        const now = Date.now();
                        workoutsList.forEach(w => {
                          const wDate = new Date(w.id || w.date).getTime();
                          const diffTime = Math.abs(now - wDate);
                          const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
                          if (diffWeeks < 6) {
                            weeks[5 - diffWeeks]++; // weeks[5] is current week, weeks[0] is 5 weeks ago
                          }
                        });

                        const pts = weeks.map((count, i) => {
                          const x = (i / 5) * 100;
                          const y = 100 - (Math.min(count, 10) / 10) * 100;
                          return { x, y, v: count };
                        });
                        
                        const pathD = `M 0 ${pts[0].y} ` + pts.map(p => `L ${p.x} ${p.y}`).join(' ') + ` L 100 ${pts[5].y} L 100 100 L 0 100 Z`;
                        const polylinePts = pts.map(p => `${p.x},${p.y}`).join(' ');

                        return (
                          <>
                            <path d={pathD} fill="url(#freqGrad)" />
                            <polyline points={polylinePts} fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            {pts.map((pt, i) => (
                              <g key={i}>
                                <circle cx={pt.x} cy={pt.y} r="3" fill="#a855f7" stroke="#13111a" strokeWidth="1.5" />
                                <text x={pt.x} y={pt.y - 8} fill="#fff" fontSize="5" textAnchor="middle" fontWeight="bold">{pt.v}</text>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>
                
                {/* X Axis Labels */}
                <div className="absolute left-5 right-0 bottom-0 flex justify-between text-[9px] text-text-muted">
                  <span>-5W</span>
                  <span>-4W</span>
                  <span>-3W</span>
                  <span>-2W</span>
                  <span>-1W</span>
                  <span>This Wk</span>
                </div>
              </div>
            </div>

            {/* Training Consistency / Active Minutes */}
            <div className="card p-5 border border-border-subtle bg-surface">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                    Active Minutes <FiInfo size={14} className="text-text-muted" />
                  </h3>
                  <p className="text-[10px] text-text-muted">Total training time (mins)</p>
                </div>
                <button className="text-xs flex items-center gap-1 text-text-muted hover:text-text-primary">
                  Weekly <FiChevronDown />
                </button>
              </div>
              
              {/* Custom SVG Line Chart */}
              <div className="w-full h-40 relative">
                {/* Y Axis Labels */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-text-muted font-mono h-[calc(100%-24px)]">
                  <span>300</span>
                  <span>240</span>
                  <span>180</span>
                  <span>120</span>
                  <span>60</span>
                  <span>0</span>
                </div>
                
                {/* Grid Lines & Chart Area */}
                <div className="absolute left-5 right-0 top-2 bottom-6">
                  {/* Grid lines */}
                  <div className="w-full h-full flex flex-col justify-between border-l border-border-subtle relative z-0">
                    {[0, 1, 2, 3, 4, 5].map((_, i) => (
                      <div key={i} className="w-full border-b border-border-subtle/30" style={{ height: '0px' }}></div>
                    ))}
                    
                    {/* SVG Line (Success Green Gradient) */}
                    <svg className="absolute inset-0 w-full h-full z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(34, 197, 94, 0.4)" />
                          <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
                        </linearGradient>
                      </defs>
                      {(() => {
                        if (!hasData) {
                          return (
                            <>
                              <path d="M 0 100 L 20 100 L 40 100 L 60 100 L 80 100 L 100 100 L 100 100 L 0 100 Z" fill="url(#volGrad)" />
                              <polyline points="0,100 20,100 40,100 60,100 80,100 100,100" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </>
                          );
                        }

                        // Aggregate active minutes by week for the last 6 weeks
                        const weeksMins = [0,0,0,0,0,0];
                        const now = Date.now();
                        workoutsList.forEach(w => {
                          const wDate = new Date(w.id || w.date).getTime();
                          const diffTime = Math.abs(now - wDate);
                          const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
                          if (diffWeeks < 6) {
                            const durationMatch = String(w.duration).match(/(\d+)/);
                            const duration = durationMatch ? parseInt(durationMatch[1], 10) : 0;
                            weeksMins[5 - diffWeeks] += duration;
                          }
                        });

                        const pts = weeksMins.map((mins, i) => {
                          const x = (i / 5) * 100;
                          const y = 100 - (Math.min(mins, 300) / 300) * 100; // max 300 mins
                          return { x, y, v: `${mins}m` };
                        });
                        
                        const pathD = `M 0 ${pts[0].y} ` + pts.map(p => `L ${p.x} ${p.y}`).join(' ') + ` L 100 ${pts[5].y} L 100 100 L 0 100 Z`;
                        const polylinePts = pts.map(p => `${p.x},${p.y}`).join(' ');

                        return (
                          <>
                            <path d={pathD} fill="url(#volGrad)" />
                            <polyline points={polylinePts} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            {pts.map((pt, i) => (
                              <g key={i}>
                                <circle cx={pt.x} cy={pt.y} r="3" fill="#22c55e" stroke="#13111a" strokeWidth="1.5" />
                                <text x={pt.x} y={pt.y - 8} fill="#fff" fontSize="5" textAnchor="middle" fontWeight="bold">{pt.v}</text>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>
                
                {/* X Axis Labels */}
                <div className="absolute left-5 right-0 bottom-0 flex justify-between text-[9px] text-text-muted">
                  <span>-5W</span>
                  <span>-4W</span>
                  <span>-3W</span>
                  <span>-2W</span>
                  <span>-1W</span>
                  <span>This Wk</span>
                </div>
              </div>
            </div>

          </div>

          {/* Muscle Group & Strength Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Muscle Group Progress */}
            <div className="card p-5 border border-border-subtle bg-surface">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                    Muscle Group Progress <FiInfo size={14} className="text-text-muted" />
                  </h3>
                  <p className="text-[10px] text-text-muted">Active sets comparison by muscle group</p>
                </div>
                <button className="text-xs flex items-center gap-1 text-text-muted hover:text-text-primary">
                  This Month <FiChevronDown />
                </button>
              </div>

              <div className="space-y-4">
                {/* Header */}
                <div className="flex text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                  <div className="w-20"></div>
                  <div className="flex-1 flex justify-end gap-4 text-right">
                    <span className="w-10">Curr</span>
                    <span className="w-10">Last</span>
                    <span className="w-10">Change</span>
                  </div>
                </div>
                
                {/* Rows */}
                {(hasData ? [
                  { name: 'Chest', icon: 'M', color: 'bg-purple', val1: '45', val2: '38', diff: '+18%' },
                  { name: 'Back', icon: 'H', color: 'bg-info', val1: '52', val2: '42', diff: '+24%' },
                  { name: 'Legs', icon: 'L', color: 'bg-success', val1: '60', val2: '48', diff: '+22%' },
                  { name: 'Shoulders', icon: 'S', color: 'bg-warning', val1: '32', val2: '28', diff: '+15%' },
                  { name: 'Arms', icon: 'A', color: 'bg-pink-500', val1: '28', val2: '25', diff: '+10%' },
                  { name: 'Core', icon: 'C', color: 'bg-primary', val1: '20', val2: '18', diff: '+8%' },
                ] : [
                  { name: 'Chest', icon: 'M', color: 'bg-surface-elevated', val1: '0', val2: '0', diff: '0%' },
                  { name: 'Back', icon: 'H', color: 'bg-surface-elevated', val1: '0', val2: '0', diff: '0%' },
                  { name: 'Legs', icon: 'L', color: 'bg-surface-elevated', val1: '0', val2: '0', diff: '0%' },
                  { name: 'Shoulders', icon: 'S', color: 'bg-surface-elevated', val1: '0', val2: '0', diff: '0%' },
                  { name: 'Arms', icon: 'A', color: 'bg-surface-elevated', val1: '0', val2: '0', diff: '0%' },
                  { name: 'Core', icon: 'C', color: 'bg-surface-elevated', val1: '0', val2: '0', diff: '0%' },
                ]).map((row, i) => (
                  <div key={i} className="flex items-center text-xs">
                    <div className="w-20 flex items-center gap-2 text-text-muted">
                      <span className="font-bold text-text-primary">{row.name}</span>
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="w-full bg-surface-elevated h-1.5 rounded-full overflow-hidden mr-2">
                        <div className={`h-full rounded-full ${row.color}`} style={{ width: `${(parseInt(row.val1) / 70) * 100}%` }}></div>
                      </div>
                      <div className="flex justify-end gap-4 text-right font-mono text-[10px]">
                        <span className="w-10 text-text-primary font-bold">{row.val1}</span>
                        <span className="w-10 text-text-muted">{row.val2}</span>
                        <span className="w-10 text-success font-bold">{row.diff}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strength Progress (Top Lifts) */}
            <div className="card p-5 border border-border-subtle bg-surface">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                    Strength Progress <FiInfo size={14} className="text-text-muted" />
                  </h3>
                  <p className="text-[10px] text-text-muted">Top Lifts comparison</p>
                </div>
                <button className="text-xs flex items-center gap-1 text-text-muted hover:text-text-primary">
                  All Time <FiChevronDown />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border-subtle text-[10px] text-text-muted uppercase tracking-wider">
                      <th className="pb-2 font-bold">Exercise</th>
                      <th className="pb-2 font-bold text-right">Start</th>
                      <th className="pb-2 font-bold text-right">Current</th>
                      <th className="pb-2 font-bold text-right">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/50">
                    {(hasData ? [
                      { name: 'Bench Press', start: '60 kg', current: '100 kg', diff: '+ 66.7%' },
                      { name: 'Squat', start: '80 kg', current: '140 kg', diff: '+ 75%' },
                      { name: 'Deadlift', start: '100 kg', current: '150 kg', diff: '+ 50%' },
                      { name: 'Overhead Press', start: '40 kg', current: '70 kg', diff: '+ 75%' },
                      { name: 'Pull Ups', start: '5 reps', current: '15 reps', diff: '+ 100%' },
                    ] : [
                      { name: 'Bench Press', start: '0 kg', current: '0 kg', diff: '0%' },
                      { name: 'Squat', start: '0 kg', current: '0 kg', diff: '0%' },
                      { name: 'Deadlift', start: '0 kg', current: '0 kg', diff: '0%' },
                      { name: 'Overhead Press', start: '0 kg', current: '0 kg', diff: '0%' },
                      { name: 'Pull Ups', start: '0 reps', current: '0 reps', diff: '0%' },
                    ]).map((row, i) => (
                      <tr key={i}>
                        <td className="py-2 font-bold text-text-primary">{row.name}</td>
                        <td className="py-2 text-right font-mono text-text-muted">{row.start}</td>
                        <td className="py-2 text-right font-mono text-text-primary font-bold">{row.current}</td>
                        <td className="py-2 text-right font-mono text-success font-bold">↑ {row.diff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Recent Personal Records (Bottom Row Cards) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary">Recent Personal Records</h3>
              <button className="text-[10px] text-purple hover:underline font-bold">View All</button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {!hasData && <p className="text-xs text-text-muted italic col-span-4 py-4">No recent personal records found.</p>}
              {(hasData ? [
                { name: 'Bench Press', weight: '100 kg', date: 'May 14, 2026', color: '#a855f7' },
                { name: 'Squat', weight: '140 kg', date: 'May 12, 2026', color: '#a855f7' },
                { name: 'Deadlift', weight: '150 kg', date: 'May 10, 2026', color: '#a855f7' },
                { name: 'Overhead Press', weight: '70 kg', date: 'May 8, 2026', color: '#a855f7' },
              ] : []).map((pr, i) => (
                <div key={i} className="card p-4 border border-border-subtle bg-gradient-to-br from-surface to-surface-elevated space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1.5 whitespace-nowrap"><FiAward size={12} className="text-purple shrink-0"/> {pr.name}</span>
                    <span className="text-[8px] bg-success/20 text-success px-1.5 py-0.5 rounded font-bold uppercase shrink-0">New PR</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-text-primary">{pr.weight}</h4>
                    <p className="text-[9px] text-text-muted">{pr.date}</p>
                  </div>
                  
                  {/* Mini Sparkline Chart */}
                  <div className="w-full h-8 pt-2">
                    <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      <path d="M 0 25 L 20 28 L 40 20 L 60 15 L 80 5 L 100 0" fill="none" stroke={pr.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="100" cy="0" r="2.5" fill={pr.color} />
                      <circle cx="80" cy="5" r="2" fill={pr.color} />
                      <circle cx="60" cy="15" r="2" fill={pr.color} />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Progress Summary Donut Chart */}
          <div className="card p-5 border border-border-subtle bg-surface">
            <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-1.5">
              Progress Summary <FiInfo size={14} className="text-text-muted" />
            </h3>
            
            <div className="flex flex-col items-center">
              {/* CSS Donut Chart (Complex gradient using conic-gradient) */}
              <div className="relative w-40 h-40 rounded-full flex items-center justify-center mb-6" style={{
                background: hasData ? `conic-gradient(
                  #a855f7 0% 35%, 
                  #22c55e 35% 65%, 
                  #f59e0b 65% 85%, 
                  #0ea5e9 85% 100%
                )` : `conic-gradient(#27272a 0% 100%)`
              }}>
                <div className="absolute inset-3 rounded-full bg-surface flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-text-primary">{hasData ? '78%' : '0%'}</span>
                  <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Overall Progress</span>
                </div>
              </div>
              
              {/* Legend */}
              <div className="w-full space-y-4">
                {(hasData ? [
                  { name: 'Strength', desc: 'Building raw strength', pct: '82%', color: 'bg-purple' },
                  { name: 'Endurance', desc: 'Improving stamina', pct: '74%', color: 'bg-success' },
                  { name: 'Consistency', desc: 'Staying consistent', pct: '80%', color: 'bg-warning' },
                  { name: 'Recovery', desc: 'Getting better rest', pct: '76%', color: 'bg-info' },
                ] : [
                  { name: 'Strength', desc: 'Building raw strength', pct: '0%', color: 'bg-surface-elevated' },
                  { name: 'Endurance', desc: 'Improving stamina', pct: '0%', color: 'bg-surface-elevated' },
                  { name: 'Consistency', desc: 'Staying consistent', pct: '0%', color: 'bg-surface-elevated' },
                  { name: 'Recovery', desc: 'Getting better rest', pct: '0%', color: 'bg-surface-elevated' },
                ]).map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-2 h-2 rounded-full mt-1 ${item.color}`}></div>
                      <div>
                        <p className="text-xs font-bold text-text-primary">{item.name}</p>
                        <p className="text-[10px] text-text-muted">{item.desc}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-text-primary">{item.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="card p-5 border border-border-subtle bg-surface">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-text-primary">Achievements</h3>
              <button className="text-[10px] text-purple hover:underline font-bold">View All</button>
            </div>
            
            <div className="space-y-4">
              {!hasData && <p className="text-xs text-text-muted italic py-2">Complete workouts to earn achievements.</p>}
              {(hasData ? [
                { title: 'First 10 Workouts', desc: 'Completed 10 workouts', date: 'Apr 15, 2026', icon: <FiCheckCircle size={16}/>, color: 'text-warning bg-warning/10 border-warning/20' },
                { title: 'Consistency King', desc: '7 day workout streak', date: 'May 10, 2026', icon: <FiZap size={16}/>, color: 'text-purple bg-purple/10 border-purple/20' },
                { title: 'Strength Milestone', desc: 'Increased bench press by 20 kg', date: 'May 14, 2026', icon: <FiShield size={16}/>, color: 'text-pink-500 bg-pink-500/10 border-pink-500/20' },
              ] : []).map((ach, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${ach.color}`}>
                    {ach.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-text-primary truncate">{ach.title}</h4>
                    <p className="text-[10px] text-text-muted truncate">{ach.desc}</p>
                  </div>
                  <span className="text-[9px] text-text-muted font-mono shrink-0">{ach.date}</span>
                </div>
              ))}
            </div>
          </div>


          {/* Body Progress */}
          <div className="card p-5 border border-border-subtle bg-surface">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-text-primary">Body Progress</h3>
              <button className="text-[10px] text-purple hover:underline font-bold">View All</button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="text-center">
                <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Weight</p>
                <p className="text-sm font-black text-text-primary">{hasData ? '68.5 kg' : '0 kg'}</p>
                <p className="text-[9px] text-success font-bold flex items-center justify-center mt-1">{hasData ? '↓ 1.5 kg' : ' '}</p>
              </div>
              <div className="text-center border-l border-r border-border-subtle">
                <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Body Fat</p>
                <p className="text-sm font-black text-text-primary">{hasData ? '16.2 %' : '0 %'}</p>
                <p className="text-[9px] text-success font-bold flex items-center justify-center mt-1">{hasData ? '↓ 2.1 %' : ' '}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Muscle Mass</p>
                <p className="text-sm font-black text-text-primary">{hasData ? '55.4 kg' : '0 kg'}</p>
                <p className="text-[9px] text-success font-bold flex items-center justify-center mt-1">{hasData ? '↑ 1.8 kg' : ' '}</p>
              </div>
            </div>

            {/* Small Line Chart for Weight */}
            <div className="w-full h-24 relative mt-2 border-t border-border-subtle pt-4">
              <div className="absolute right-0 top-2">
                <button className="text-[9px] bg-surface-elevated px-2 py-1 rounded text-text-muted border border-border-subtle flex items-center gap-1">
                  Weight <FiChevronDown size={10}/>
                </button>
              </div>
              
              <div className="absolute left-0 top-4 bottom-4 flex flex-col justify-between text-[9px] text-text-muted font-mono h-[calc(100%-16px)]">
                <span>72</span>
                <span>68</span>
                <span>64</span>
              </div>
              
              <div className="absolute left-4 right-0 top-4 bottom-4">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <polyline points={hasData ? "0,20 10,25 20,20 30,30 40,35 50,25 60,30 70,35 80,45 90,40 100,50" : "0,100 100,100"} fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  {(hasData ? [
                    {x: 0, y: 20}, {x: 10, y: 25}, {x: 20, y: 20}, {x: 30, y: 30}, {x: 40, y: 35}, 
                    {x: 50, y: 25}, {x: 60, y: 30}, {x: 70, y: 35}, {x: 80, y: 45}, {x: 90, y: 40}, {x: 100, y: 50}
                  ] : [
                    {x: 0, y: 100}, {x: 25, y: 100}, {x: 50, y: 100}, {x: 75, y: 100}, {x: 100, y: 100}
                  ]).map((pt, i) => (
                    <circle key={i} cx={pt.x} cy={pt.y} r="2.5" fill="#a855f7" stroke="#13111a" strokeWidth="1" />
                  ))}
                </svg>
              </div>
              
              <div className="absolute left-4 right-0 bottom-[-10px] flex justify-between text-[8px] text-text-muted">
                <span>Apr 12</span>
                <span>Apr 26</span>
                <span>May 10</span>
                <span>May 18</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      <ProgressPhotos googleAccessToken={googleAccessToken} googleDriveFolderLink={googleDriveFolderLink} />
    </motion.div>
  );
}
