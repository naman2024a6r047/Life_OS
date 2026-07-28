import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBookOpen, FiClock, FiTarget, FiPlus, FiX, FiCheck,
  FiInfo, FiRefreshCw, FiAlertCircle
} from 'react-icons/fi';
import axios from 'axios';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SUBJECT_COLORS = ['#A855F7', '#06B6D4', '#22C55E', '#F59E0B', '#6366F1', '#EC4899', '#14B8A6', '#F97316'];

function getSubjectColor(idx) { return SUBJECT_COLORS[idx % SUBJECT_COLORS.length]; }

function LogSessionModal({ isOpen, onClose, subjects, onSave }) {
  const [subjectId, setSubjectId] = useState('');
  const [duration, setDuration] = useState('');
  const [chapters, setChapters] = useState('');
  const [notes, setNotes] = useState('');
  const [sessionTime, setSessionTime] = useState(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : h < 21 ? 'Evening' : 'Night';
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) { setSubjectId(''); setDuration(''); setChapters(''); setNotes(''); }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!subjectId || !duration) return;
    setLoading(true);
    try {
      await onSave({ subject_id: subjectId, duration_minutes: Number(duration), session_time: sessionTime, chapters_covered: chapters, notes });
      onClose();
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="card p-6 w-full max-w-sm shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-primary"><FiX size={18} /></button>
        <h2 className="text-base font-bold text-text-primary mb-4">Log Study Session</h2>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1 block">Subject *</label>
            <select value={subjectId} onChange={e => setSubjectId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-purple">
              <option value="">Select subject...</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1 block">Duration (minutes) *</label>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 90"
              className="w-full px-3 py-2 text-xs bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-purple" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1 block">Session Time</label>
            <div className="flex gap-1">
              {['Morning', 'Afternoon', 'Evening', 'Night'].map(t => (
                <button key={t} onClick={() => setSessionTime(t)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${sessionTime === t ? 'bg-purple text-white' : 'bg-surface-elevated text-text-muted hover:bg-surface'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1 block">Topics / Chapters Covered</label>
            <input value={chapters} onChange={e => setChapters(e.target.value)} placeholder="e.g. Arrays, Linked Lists..."
              className="w-full px-3 py-2 text-xs bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-purple" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1 block">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional notes..."
              className="w-full px-3 py-2 text-xs bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-purple resize-none" />
          </div>
          <button onClick={handleSubmit} disabled={loading || !subjectId || !duration}
            className="w-full py-2.5 rounded-xl bg-purple text-white font-bold text-xs hover:bg-purple/80 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><FiRefreshCw className="animate-spin" size={13} /> Saving...</> : 'Log Session'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function KnowledgeDashboard() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logModal, setLogModal] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/study/dashboard');
      setData(res.data);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || 'Failed to load data');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const handleLogSession = async (payload) => {
    await axios.post('/api/study/log', payload);
    await fetchDashboard();
  };

  if (loading) return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-3">
        <FiRefreshCw className="animate-spin text-purple mx-auto" size={28} />
        <p className="text-xs text-text-muted">Loading study data...</p>
      </div>
    </div>
  );

  const stats = data?.stats || {};
  const maxWeekMins = Math.max(...(data?.weeklyTrend || []).map(d => d.minutes), 1);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center">
            <FiBookOpen size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Study Tracker</h1>
            <p className="text-xs text-text-muted">Track your study time. Improve consistency. Achieve your goals.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {[
            { icon: '⏱️', val: stats.totalMonthMins > 0 ? fmtMins(stats.totalMonthMins) : '0h', label: 'Total Study Time (Month)' },
            { icon: '📅', val: stats.totalMonthSessions || 0, label: 'Sessions (Month)' },
            { icon: '🎯', val: stats.focusPct !== undefined ? `${stats.focusPct}%` : '—', label: 'Focus Score' },
            { icon: '🔥', val: stats.streak || 0, label: 'Day Streak' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-sm">{s.icon}</span>
              <div>
                <p className="text-sm font-bold font-mono text-text-primary">{s.val}</p>
                <p className="text-[9px] text-text-muted">{s.label}</p>
              </div>
            </div>
          ))}
          <button onClick={() => setLogModal(true)}
            className="btn-primary text-xs bg-purple hover:bg-purple/80 flex items-center gap-1.5">
            <FiPlus size={16} /> Log Study Session
          </button>
        </div>
      </div>

      {/* No exam session banner */}
      {!data?.hasExamSession && (
        <div className="card p-4 flex items-center gap-3 border-l-4 border-l-warning">
          <FiAlertCircle className="text-warning flex-shrink-0" size={20} />
          <div>
            <p className="text-sm font-bold text-text-primary">No Active Exam Session</p>
            <p className="text-xs text-text-muted">Go to <strong>Exam Mode</strong> and activate a session to start logging study time and tracking your progress here.</p>
          </div>
        </div>
      )}

      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Study Overview Donut */}
        <div className="lg:col-span-4 card p-5 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Study Overview</h3>
            <span className="text-xs text-text-muted">This Week</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                {(data?.focusBySubject || []).length === 0 ? (
                  <circle cx="56" cy="56" r="44" stroke="#1e1e2e" strokeWidth="12" fill="none" />
                ) : (() => {
                  const total = (data?.focusBySubject || []).reduce((s, f) => s + f.minutes, 0);
                  const circumference = 2 * Math.PI * 44;
                  let offset = 0;
                  return (data?.focusBySubject || []).map((f, i) => {
                    const pct = f.minutes / total;
                    const dash = pct * circumference;
                    const el = (
                      <circle key={i} cx="56" cy="56" r="44"
                        stroke={getSubjectColor(i)} strokeWidth="12"
                        strokeDasharray={`${dash} ${circumference - dash}`}
                        strokeDashoffset={-offset} fill="none" />
                    );
                    offset += dash;
                    return el;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold font-mono text-text-primary">
                  {stats.totalWeekMins > 0 ? fmtMins(stats.totalWeekMins) : '0h'}
                </span>
                <span className="text-[8px] text-text-muted">This Week</span>
              </div>
            </div>
            <div className="space-y-1 text-[10px] flex-1">
              {(data?.focusBySubject || []).length === 0 ? (
                <p className="text-text-muted">No sessions logged this week</p>
              ) : (data?.focusBySubject || []).map((f, i) => (
                <div key={i} className="flex justify-between gap-2">
                  <span style={{ color: getSubjectColor(i) }} className="font-medium truncate">• {f.name}</span>
                  <span className="font-mono text-text-primary whitespace-nowrap">
                    {fmtMins(f.minutes)} ({data.stats.totalWeekMins > 0 ? Math.round((f.minutes / data.stats.totalWeekMins) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Study Time Trend */}
        <div className="lg:col-span-5 card p-5 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Study Time Trend</h3>
            <span className="text-xs text-text-muted">Last 7 Days</span>
          </div>
          <div className="h-36 flex items-end justify-between gap-2 px-2 pt-4 relative">
            {(data?.weeklyTrend || []).map((b, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div
                  className={`w-full rounded-t-md transition-all ${b.isToday ? 'bg-purple shadow-glow-primary' : b.minutes > 0 ? 'bg-purple/60 hover:bg-purple' : 'bg-surface-elevated'}`}
                  style={{ height: `${maxWeekMins > 0 ? Math.max(4, (b.minutes / maxWeekMins) * 100) : 4}%` }}
                  title={`${b.day}: ${fmtMins(b.minutes)}`}
                />
                <span className="text-[9px] text-text-muted font-mono">{b.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Streak Card */}
        <div className="lg:col-span-3 card p-5 flex flex-col items-center justify-between text-center">
          <div className="w-full flex items-center justify-between text-xs">
            <span className="font-bold text-text-primary">Study Streak</span>
            <span className="text-xs font-mono text-text-muted font-bold">Last 7 Days</span>
          </div>
          <div className="my-2">
            <p className="text-3xl font-extrabold font-mono text-text-primary flex items-center justify-center gap-1">
              {stats.streak || 0} <span className="text-2xl">🔥</span>
            </p>
            <p className="text-xs font-bold text-warning mt-0.5">Days</p>
            <p className="text-[10px] text-text-muted">{stats.streak > 0 ? 'Keep it up! 🔥' : 'Start your streak!'}</p>
          </div>
          <div className="flex justify-between w-full pt-2 border-t border-border-subtle">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-text-muted">{d}</span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  data?.weekStudied?.[i] ? 'bg-green-500 text-white font-bold' : 'bg-surface-elevated text-text-muted'
                }`}>
                  {data?.weekStudied?.[i] ? '✓' : '○'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recent Sessions */}
        <div className="lg:col-span-4 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Recent Study Sessions</h3>
            <span className="text-xs font-mono text-text-muted">{data?.stats?.totalMonthSessions || 0} total</span>
          </div>
          <div className="space-y-2">
            {(data?.recentSessions || []).length === 0 ? (
              <div className="py-8 text-center text-text-muted text-xs">No sessions yet. Log your first one!</div>
            ) : (data?.recentSessions || []).map((s, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated/40 hover:bg-surface-elevated transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                    style={{ background: getSubjectColor(i) + '22', color: getSubjectColor(i) }}>
                    📚
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary leading-tight truncate max-w-[140px]">{s.title}</p>
                    <p className="text-[9px] text-text-muted">{s.sub} · {s.session_time}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-mono font-bold text-text-primary">{s.duration}</p>
                  <p className="text-[8px] text-text-muted">{s.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Focus Insights */}
        <div className="lg:col-span-5 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Focus Insights</h3>
            <span className="text-xs text-text-muted">This Week</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-surface-elevated border border-border-subtle">
              <p className="text-[10px] text-text-muted">Best Study Day</p>
              <p className="font-bold text-text-primary text-sm mt-0.5">{stats.bestDay || '—'}</p>
              <p className="text-[10px] font-mono text-purple font-semibold">{stats.bestDayMins > 0 ? fmtMins(stats.bestDayMins) : 'No data'}</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-elevated border border-border-subtle">
              <p className="text-[10px] text-text-muted">Most Productive Time</p>
              <p className="font-bold text-text-primary text-sm mt-0.5">{stats.mostProductiveTime || '—'}</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-elevated border border-border-subtle">
              <p className="text-[10px] text-text-muted">Avg. Session Length</p>
              <p className="font-bold text-text-primary text-sm mt-0.5">{stats.avgSessionMins > 0 ? fmtMins(stats.avgSessionMins) : '—'}</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-elevated border border-border-subtle">
              <p className="text-[10px] text-text-muted">Weekly Sessions</p>
              <p className="font-bold text-text-primary text-sm mt-0.5">{stats.totalWeekSessions || 0}</p>
              <span className={`text-[9px] font-semibold ${stats.totalWeekSessions >= 5 ? 'text-green-400' : 'text-text-muted'}`}>
                {stats.totalWeekSessions >= 5 ? 'Excellent' : stats.totalWeekSessions >= 3 ? 'Good' : 'Keep going!'}
              </span>
            </div>
          </div>
          {stats.mostProductiveTime && (
            <div className="p-3 rounded-xl bg-warning/10 border border-warning/30 flex items-start gap-2.5">
              <FiInfo className="text-warning text-lg flex-shrink-0 mt-0.5" />
              <p className="text-xs text-text-primary leading-relaxed">
                <strong>Tip:</strong> You are most productive in the <strong>{stats.mostProductiveTime}</strong>. Schedule your hardest topics during this time!
              </p>
            </div>
          )}
        </div>

        {/* Weekly Goal & Subjects */}
        <div className="lg:col-span-3 card p-4 space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold text-text-primary">Weekly Goal</span>
              <span className="text-purple text-[10px]">{stats.weeklyGoalMins ? `${Math.round(stats.weeklyGoalMins / 60)}h goal` : 'Set in Exam Mode'}</span>
            </div>
            <p className="text-[10px] text-text-muted mb-2">
              {stats.weeklyGoalMins ? `Study for ${Math.round(stats.weeklyGoalMins / 60)} hours this week` : 'Activate exam mode to set a goal'}
            </p>
            <div className="flex justify-between text-xs mb-1 font-mono">
              <span className="font-bold text-text-primary">
                {fmtMins(stats.totalWeekMins || 0)} <span className="text-text-muted font-normal">/ {Math.round((stats.weeklyGoalMins || 1200) / 60)}h</span>
              </span>
              <span className={`font-bold ${stats.weeklyPct >= 80 ? 'text-green-400' : 'text-purple'}`}>{stats.weeklyPct || 0}%</span>
            </div>
            <div className="progress-bar h-2">
              <div className="progress-fill bg-purple" style={{ width: `${stats.weeklyPct || 0}%` }} />
            </div>
            <p className="text-[9px] text-text-muted mt-1">
              {stats.weeklyPct < 100 && stats.weeklyGoalMins
                ? `${fmtMins((stats.weeklyGoalMins || 0) - (stats.totalWeekMins || 0))} left to complete`
                : stats.weeklyPct >= 100 ? '✅ Weekly goal achieved!' : 'Log sessions to track progress'}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-border-subtle">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-text-primary">Subjects</span>
              <span className="text-[10px] text-text-muted">{data?.subjects?.length || 0} tracked</span>
            </div>
            <div className="space-y-2">
              {(data?.subjects || []).length === 0 ? (
                <p className="text-[10px] text-text-muted">No subjects yet. Add them in Exam Mode.</p>
              ) : (data?.subjects || []).slice(0, 5).map((sb, i) => (
                <div key={sb.id} className="flex items-center justify-between text-xs py-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: getSubjectColor(i) }} />
                    <span className="font-medium text-text-primary truncate max-w-[90px]">{sb.name}</span>
                  </div>
                  <span className="font-mono text-text-muted text-[11px]">{sb.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Log Session Modal */}
      <AnimatePresence>
        {logModal && (
          <LogSessionModal isOpen={logModal} onClose={() => setLogModal(false)}
            subjects={data?.subjects || []} onSave={handleLogSession} />
        )}
      </AnimatePresence>
    </div>
  );
}

function fmtMins(mins) {
  const m = Math.round(Number(mins) || 0);
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}m`;
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`;
}
