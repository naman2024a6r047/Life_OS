import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiAlertTriangle, FiShield, FiClock, FiCalendar, FiBookOpen,
  FiInfo, FiCheckCircle, FiXCircle, FiZap, FiAlertCircle, FiArrowRight
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

export default function NotificationsDashboard() {
  const { user } = useContext(AuthContext);
  const [penalties, setPenalties] = useState([]);
  const [activePenalties, setActivePenalties] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const streak = user?.current_streak || 0;

  const fetchDashboardData = async () => {
    try {
      const [historyRes, activeRes, challengesRes] = await Promise.all([
        axios.get('/api/penalties/audit-log'),
        axios.get('/api/penalties/active'),
        axios.get('/api/challenges')
      ]);
      setPenalties(historyRes.data);
      setActivePenalties(activeRes.data);

      const todayStr = dayjs().format('YYYY-MM-DD');
      let tasksForToday = [];
      const challenges = challengesRes.data || [];
      
      challenges.forEach(challenge => {
          if (challenge.status !== 'active') return;
          const activeMilestone = challenge.milestones?.find(m => m.status === 'in_progress');
          if (!activeMilestone || !activeMilestone.tasks) return;
          
          activeMilestone.tasks.forEach(task => {
              if (task.date === todayStr) {
                  tasksForToday.push({ ...task, challengeTitle: challenge.title });
              }
          });
      });
      setTodayTasks(tasksForToday);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const acknowledgePenalty = async (id) => {
    try {
      await axios.post(`/api/penalties/${id}/acknowledge`);
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to acknowledge', error);
    }
  };

  const rules = [
    { rule: 'Medium Mode - Miss 2 Consecutive Days', cond: 'Fail to complete all tasks for 2 days in a row', cons: 'Restart current milestone from Day 1', sev: 'Medium' },
    { rule: 'Hard Mode - Miss 1 Day', cond: 'Fail to complete all tasks for 1 day', cons: 'Restart current milestone from Day 1. No mercy.', sev: 'High' }
  ];

  const totalPenalties = penalties.length;
  const activeCount = activePenalties.length;
  
  // Calculate total XP lost
  const totalXpLost = penalties.reduce((acc, p) => acc + (p.xp_deducted || 0), 0);

  // Warning System Computations
  const endOfDay = dayjs().endOf('day');
  const hoursLeft = endOfDay.diff(dayjs(), 'hour');
  const minutesLeft = endOfDay.diff(dayjs(), 'minute') % 60;
  const uncompletedTasks = todayTasks.filter(t => !t.is_completed && !t.completed);
  const isDanger = uncompletedTasks.length > 0 && hoursLeft < 6;
  const isWarning = uncompletedTasks.length > 0 && hoursLeft >= 6 && hoursLeft <= 12;
  const isSafe = uncompletedTasks.length === 0;

  if (loading) {
      return <div className="p-6 text-text-muted">Loading penalty system...</div>;
  }

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
          <button className="btn-outline text-xs flex items-center gap-1.5">
            <FiBookOpen size={13} /> View Full Rules
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
            <p className="text-xl font-bold font-mono text-text-primary">{totalPenalties}</p>
            <p className="text-[9px] text-danger font-semibold">Lifetime</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center flex-shrink-0 font-bold">
            <FiClock size={20} />
          </div>
          <div>
            <p className="text-[10px] text-text-muted">Active Penalties</p>
            <p className="text-xl font-bold font-mono text-text-primary">{activeCount}</p>
            <p className="text-[9px] text-warning font-semibold">Action Required</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center flex-shrink-0 font-bold">
            <FiZap size={20} />
          </div>
          <div>
            <p className="text-[10px] text-text-muted">XP Lost</p>
            <p className="text-xl font-bold font-mono text-text-primary">{totalXpLost}</p>
            <p className="text-[9px] text-danger font-semibold">Total deductions</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center flex-shrink-0 font-bold">
            <FiShield size={20} />
          </div>
          <div>
            <p className="text-[10px] text-text-muted">Current Streak</p>
            <p className="text-xl font-bold font-mono text-text-primary">{streak}</p>
            <p className="text-[9px] text-success font-semibold">Protected Days</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Column — Early Warning System (5 cols) */}
        <div className={`col-span-5 card p-4 space-y-3 ${isDanger ? 'border-danger/40 bg-danger/5 shadow-glow-warning' : isWarning ? 'border-warning/40 bg-warning/5' : ''}`}>
          <div className="flex items-center justify-between">
            <h3 className="section-title flex items-center gap-2">
                <FiClock className={isDanger ? 'text-danger' : isWarning ? 'text-warning' : 'text-purple'} /> 
                Today's Active Tasks
            </h3>
            {uncompletedTasks.length > 0 ? (
                <div className={`px-2 py-1 rounded text-[10px] font-bold ${isDanger ? 'bg-danger text-white animate-pulse' : isWarning ? 'bg-warning text-white' : 'bg-surface-elevated text-text-primary'}`}>
                    {hoursLeft}h {minutesLeft}m left
                </div>
            ) : (
                <div className="px-2 py-1 rounded text-[10px] font-bold bg-success text-white">Safe!</div>
            )}
          </div>
          
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '250px' }}>
            {todayTasks.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4">No active tasks scheduled for today.</p>
            ) : todayTasks.map(t => {
                const isDone = t.is_completed || t.completed;
                return (
                    <div key={t.id} className={`p-2.5 rounded-xl border flex items-center justify-between ${isDone ? 'bg-success/5 border-success/20 opacity-60' : 'bg-surface-elevated border-border-subtle'}`}>
                        <div className="flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isDone ? 'bg-success border-success text-white' : 'border-text-muted'}`}>
                                {isDone && <FiCheckCircle size={10} />}
                            </div>
                            <div>
                                <p className={`text-[11px] font-bold ${isDone ? 'line-through text-text-muted' : 'text-text-primary'}`}>{t.title}</p>
                                <p className="text-[9px] text-text-muted">{t.challengeTitle}</p>
                            </div>
                        </div>
                        {!isDone && (
                            <span className="badge-purple text-[8px]">{t.priority || 'P1'}</span>
                        )}
                    </div>
                );
            })}
          </div>

          <p className="text-[10px] text-text-muted flex items-center gap-1 pt-2 border-t border-border-subtle">
            <FiInfo size={12} className="text-purple" /> Background workers check your tasks every minute.
          </p>
        </div>

        {/* Center Column — Active Penalty (4 cols) */}
        <div className={`col-span-4 card p-5 space-y-4 ${activeCount > 0 ? 'bg-gradient-to-br from-danger/10 to-surface' : 'bg-surface'}`}>
          <div className="flex items-center justify-between">
            <h3 className={`section-title ${activeCount > 0 ? 'text-danger' : 'text-success'}`}>
                {activeCount > 0 ? 'Active Penalties' : 'No Active Penalties'}
            </h3>
          </div>

          <div className="text-center space-y-2">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold ${activeCount > 0 ? 'bg-danger/20 text-danger shadow-glow-warning' : 'bg-success/20 text-success'}`}>
              {activeCount > 0 ? '⚠️' : '✅'}
            </div>
            
            {activeCount > 0 ? (
                <>
                    <h2 className="text-base font-bold text-text-primary">Action Required</h2>
                    <p className="text-xs text-text-muted max-w-xs mx-auto">
                        You have unacknowledged penalties. Review and acknowledge them below.
                    </p>
                </>
            ) : (
                <>
                    <h2 className="text-base font-bold text-text-primary">All Clear</h2>
                    <p className="text-xs text-text-muted max-w-xs mx-auto">
                        You are maintaining your discipline perfectly. Keep it up!
                    </p>
                </>
            )}
          </div>

          <div className="space-y-3">
              {activePenalties.map(p => (
                <div key={p.id} className="p-3 rounded-xl bg-surface-elevated text-xs space-y-2 border border-danger/30">
                    <div className="flex justify-between text-[11px] font-bold text-danger">
                        <span>{p.title}</span>
                        <span>-{p.xp_deducted} XP</span>
                    </div>
                    <p className="text-[10px] text-text-muted">{p.description}</p>
                    <button 
                        onClick={() => acknowledgePenalty(p.id)}
                        className="w-full py-1.5 mt-2 rounded bg-danger/20 hover:bg-danger text-white text-[10px] transition-colors"
                    >
                        Acknowledge
                    </button>
                </div>
              ))}
          </div>

          <Link to="/challenges" className={`w-full py-2.5 rounded-xl text-white text-xs font-semibold text-center block transition-all ${activeCount > 0 ? 'bg-danger hover:bg-danger/90 shadow-glow-warning' : 'bg-success hover:bg-success/90'}`}>
            View Current Goals
          </Link>
        </div>

        {/* Right Column — History (3 cols) */}
        <div className="col-span-3 space-y-4">
          
          {/* Penalty History List */}
          <div className="card p-4 space-y-2.5 h-full overflow-y-auto" style={{ maxHeight: '400px' }}>
            <div className="section-header">
              <h3 className="section-title">Penalty History</h3>
            </div>

            <div className="space-y-2">
              {penalties.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-4">No penalties yet!</p>
              ) : penalties.map((item, i) => (
                <div key={item.id} className="flex items-start justify-between py-2 border-b border-border-subtle last:border-0 text-xs">
                  <div className="flex items-start gap-2">
                    <span className={item.severity === 'High' ? 'text-danger' : 'text-warning'}>⚠️</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-text-primary leading-tight">{item.title}</p>
                        <span className={item.severity === 'High' ? 'badge-danger text-[8px]' : 'badge-warning text-[8px]'}>
                          {item.severity}
                        </span>
                      </div>
                      <p className="text-[9px] text-text-muted mt-1">{item.description}</p>
                      <p className="text-[8px] text-text-muted mt-0.5">{dayjs(item.createdAt).format('MMM D, YYYY h:mm A')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
