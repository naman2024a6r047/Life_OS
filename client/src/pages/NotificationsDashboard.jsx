import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FiAlertTriangle, FiShield, FiClock, FiCalendar, FiBookOpen,
  FiInfo, FiCheckCircle, FiXCircle, FiZap, FiAlertCircle, FiArrowRight
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function NotificationsDashboard() {
  const { user } = useContext(AuthContext);

  const streak = user?.current_streak || 12;

  const rules = [
    { rule: 'Miss 2 Consecutive Days', cond: 'No study sessions for 2 consecutive days', cons: 'Restart current goal set from Day 1', sev: 'High' },
    { rule: 'Skip Daily Goal', cond: 'Daily study time < 50% of target', cons: 'Lose 1 Clean Day', sev: 'Medium' },
    { rule: 'No Session Logged', cond: 'No study session logged in a day', cons: 'Lose 5 XP', sev: 'Low' },
    { rule: 'Ignore Reminders (3x)', cond: 'Dismiss 3 reminders in a single day', cons: 'Lose 10 XP', sev: 'Low' },
  ];

  const penaltyHistory = [
    { title: 'Goal Set Restart', sev: 'High', desc: 'Missed 2 consecutive days', date: 'May 14, 2026 2:30 PM' },
    { title: 'Daily Goal Skipped', sev: 'Medium', desc: 'Study time was less than 50%', date: 'May 06, 2026 9:15 PM' },
    { title: 'No Session Logged', sev: 'Low', desc: 'No study session for the day', date: 'May 03, 2026 11:45 PM' },
    { title: 'Daily Goal Skipped', sev: 'Medium', desc: 'Study time was less than 50%', date: 'Apr 28, 2026 8:30 PM' },
    { title: 'No Session Logged', sev: 'Low', desc: 'No study session for the day', date: 'Apr 21, 2026 10:00 PM' },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center">
            <FiAlertTriangle size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Penalty System</h1>
            <p className="text-xs text-text-muted">Stay consistent. Avoid penalties. Build discipline.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono cursor-pointer">
            <FiCalendar size={13} className="text-text-muted" />
            <span>May 12 – May 18, 2026 ▾</span>
          </div>
          <button className="btn-outline text-xs flex items-center gap-1.5">
            <FiBookOpen size={13} /> Rules
          </button>
        </div>
      </div>

      {/* Top Metric Cards (4 cols) */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center flex-shrink-0 font-bold">
            <FiAlertCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] text-text-muted">Total Penalties</p>
            <p className="text-xl font-bold font-mono text-text-primary">3 <span className="text-xs font-normal text-text-muted">This Month</span></p>
            <p className="text-[9px] text-danger font-semibold">↑ 2 vs last month</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center flex-shrink-0 font-bold">
            <FiClock size={20} />
          </div>
          <div>
            <p className="text-[10px] text-text-muted">Active Penalties</p>
            <p className="text-xl font-bold font-mono text-text-primary">1</p>
            <p className="text-[9px] text-warning font-semibold">Currently Active</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center flex-shrink-0 font-bold">
            <FiCalendar size={20} />
          </div>
          <div>
            <p className="text-[10px] text-text-muted">Days Lost</p>
            <p className="text-xl font-bold font-mono text-text-primary">2 <span className="text-xs font-normal text-text-muted">This Month</span></p>
            <p className="text-[9px] text-danger font-semibold">↑ 2 vs last month</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center flex-shrink-0 font-bold">
            <FiShield size={20} />
          </div>
          <div>
            <p className="text-[10px] text-text-muted">Clean Days</p>
            <p className="text-xl font-bold font-mono text-text-primary">12</p>
            <p className="text-[9px] text-success font-semibold">Best: 21 Days</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Column — Rules (5 cols) */}
        <div className="col-span-5 card p-4 space-y-3">
          <h3 className="section-title">Penalty Rules</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-[10px] text-text-muted uppercase">
                  <th className="py-2">Rule</th>
                  <th className="py-2">Condition</th>
                  <th className="py-2">Consequence</th>
                  <th className="py-2 text-right">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {rules.map((r, i) => (
                  <tr key={i} className="hover:bg-surface-elevated/40">
                    <td className="py-2.5 font-bold text-text-primary flex items-center gap-1.5">
                      <span>{i === 0 ? '📅' : i === 1 ? '🎯' : i === 2 ? '⏱️' : '🔔'}</span>
                      {r.rule}
                    </td>
                    <td className="py-2.5 text-text-muted text-[11px]">{r.cond}</td>
                    <td className="py-2.5 text-text-secondary text-[11px] font-medium">{r.cons}</td>
                    <td className="py-2.5 text-right">
                      <span className={
                        r.sev === 'High' ? 'badge-danger text-[8px]' : r.sev === 'Medium' ? 'badge-warning text-[8px]' : 'badge-info text-[8px]'
                      }>{r.sev}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[10px] text-text-muted flex items-center gap-1 pt-2 border-t border-border-subtle">
            <FiInfo size={12} className="text-purple" /> Penalties help build discipline. Stay consistent and avoid breaking your streak!
          </p>
        </div>

        {/* Center Column — Active Penalty (4 cols) */}
        <div className="col-span-4 card p-5 space-y-4 bg-gradient-to-br from-danger/10 to-surface">
          <div className="flex items-center justify-between">
            <h3 className="section-title text-danger">Active Penalty</h3>
          </div>

          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-danger/20 text-danger flex items-center justify-center mx-auto text-2xl font-bold shadow-glow-warning">
              ⚠️
            </div>
            <h2 className="text-base font-bold text-text-primary">Goal Set Restart</h2>
            <p className="text-xs text-text-muted max-w-xs mx-auto">
              You missed 2 consecutive days. Your current goal set has been restarted.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-elevated text-xs space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-text-muted flex items-center gap-1">📅 Restarted On</span>
              <span className="font-mono font-semibold text-text-primary">May 14, 2026 (2:30 PM)</span>
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-text-muted">New Progress</span>
                <span className="font-mono font-bold text-danger">Day 1 of 10 (10%)</span>
              </div>
              <div className="progress-bar h-1.5">
                <div className="progress-fill bg-danger" style={{ width: '10%' }} />
              </div>
            </div>
          </div>

          <Link to="/challenges" className="w-full py-2.5 rounded-xl bg-danger hover:bg-danger/90 text-white text-xs font-semibold text-center block transition-all shadow-glow-warning">
            View Current Goals
          </Link>
        </div>

        {/* Right Column — Streak & Strikes & History (3 cols) */}
        <div className="col-span-3 space-y-4">
          {/* Streak & Strikes Widget */}
          <div className="card p-4 space-y-3">
            <h3 className="section-title">Streak & Strikes</h3>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-surface-elevated">
                <p className="text-[9px] text-text-muted">Current Streak</p>
                <p className="text-base font-bold font-mono text-text-primary flex items-center justify-center gap-1 mt-0.5">
                  🔥 {streak} <span className="text-[10px] text-text-muted font-normal">Days</span>
                </p>
                <span className="text-[8px] text-success">Keep it up! 🔥</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-elevated">
                <p className="text-[9px] text-text-muted">Longest Streak</p>
                <p className="text-base font-bold font-mono text-text-primary flex items-center justify-center gap-1 mt-0.5">
                  🏆 21 <span className="text-[10px] text-text-muted font-normal">Days</span>
                </p>
                <span className="text-[8px] text-text-muted">Apr 20 – May 10</span>
              </div>
            </div>

            {/* Strikes (This Month) */}
            <div className="pt-2 border-t border-border-subtle space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-text-primary">Strikes (This Month)</span>
                <span className="font-mono font-bold text-danger">2 / 3</span>
              </div>
              <p className="text-[9px] text-text-muted">1 more strike will trigger goal restart</p>
              {/* 3 Strike Bars */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <div className="h-2 rounded bg-danger shadow-glow-warning" />
                <div className="h-2 rounded bg-danger shadow-glow-warning" />
                <div className="h-2 rounded bg-surface-elevated border border-border-subtle" />
              </div>
            </div>
          </div>

          {/* Penalty History List */}
          <div className="card p-4 space-y-2.5">
            <div className="section-header">
              <h3 className="section-title">Penalty History</h3>
              <span className="section-link">View All</span>
            </div>

            <div className="space-y-2">
              {penaltyHistory.map((item, i) => (
                <div key={i} className="flex items-start justify-between py-1 border-b border-border-subtle last:border-0 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-danger mt-0.5">⚠️</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-text-primary leading-tight">{item.title}</p>
                        <span className={item.sev === 'High' ? 'badge-danger text-[8px]' : 'badge-warning text-[8px]'}>
                          {item.sev}
                        </span>
                      </div>
                      <p className="text-[9px] text-text-muted">{item.desc}</p>
                      <p className="text-[8px] text-text-muted mt-0.5">{item.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-2 py-2 rounded-xl bg-surface-elevated hover:bg-surface-hover text-text-primary text-xs font-semibold transition-all">
              View Full History
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Area — Warning Levels Cards */}
      <div className="space-y-3">
        <h3 className="section-title">Warning Levels</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { lvl: 'Level 0 – Safe', strikes: '0 Strikes', msg: "You're on track! No penalties. Keep going!", color: 'success', border: 'border-success/40', btn: 'bg-success' },
            { lvl: 'Level 1 – Warning', strikes: '1 Strike', msg: 'Be careful! 1 more strike to Level 2.', color: 'warning', border: 'border-warning/40', btn: 'bg-warning' },
            { lvl: 'Level 2 – At Risk', strikes: '2 Strikes', msg: 'At risk! Next strike will restart your goal set.', color: 'warning', border: 'border-warning/60', btn: 'bg-warning' },
            { lvl: 'Level 3 – Penalty', strikes: '3 Strikes', msg: "Goal Restarted! You've reached max strikes. Goal set has been restarted.", color: 'danger', border: 'border-danger/60', btn: 'bg-danger' },
          ].map((w, i) => (
            <div key={i} className={`card p-4 space-y-2.5 border ${w.border}`}>
              <div className="flex items-center justify-between text-xs">
                <span className={`font-bold text-${w.color}`}>{w.lvl}</span>
                <span className="text-[10px] text-text-muted font-mono">{w.strikes}</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{w.msg}</p>
              <div className="progress-bar h-1.5">
                <div className={`progress-fill ${w.btn}`} style={{ width: i === 0 ? '0%' : i === 1 ? '33%' : i === 2 ? '66%' : '100%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tip Banner */}
      <div className="p-3.5 rounded-xl bg-purple/10 border border-purple/30 flex items-center gap-2.5">
        <span className="text-purple text-lg">💡</span>
        <p className="text-xs text-text-primary">
          <strong>Tip:</strong> Consistency is the key to success. Plan your time, stay focused, and avoid penalties!
        </p>
      </div>
    </div>
  );
}
