import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  FiMoon, FiSun, FiPlus, FiChevronLeft, FiChevronRight,
  FiTrendingUp, FiTarget, FiClock, FiStar, FiEdit2,
  FiTrash2, FiX, FiCheck, FiAlertCircle, FiZap, FiCalendar
} from 'react-icons/fi';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine
} from 'recharts';

// ════════════════════════════════════════════════════════════════════════
//  STAT CARD
// ════════════════════════════════════════════════════════════════════════

function StatCard({ icon, label, value, sub, color = 'primary', glow = false }) {
  const colorMap = {
    primary: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    danger: 'text-danger bg-danger/10',
    info: 'text-info bg-info/10',
    purple: 'text-purple bg-purple/10',
    indigo: 'text-[#818CF8] bg-[#818CF8]/10',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`stat-card relative overflow-hidden ${glow ? 'shadow-glow-primary' : ''}`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-text-muted font-medium">{label}</p>
        <p className="text-lg font-bold font-mono text-text-primary">{value}</p>
        {sub && <p className="text-[10px] text-text-muted">{sub}</p>}
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  SLEEP SCORE RING
// ════════════════════════════════════════════════════════════════════════

function SleepScoreRing({ score, size = 140, label = 'Sleep Score' }) {
  const radius = (size / 2) - 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444';
  const bgTrack = 'rgba(255,255,255,0.06)';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} stroke={bgTrack} strokeWidth="8" fill="none" />
        <circle
          cx={size/2} cy={size/2} r={radius}
          stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold font-mono text-text-primary">{score}</span>
        <span className="text-[10px] text-text-muted font-medium mt-0.5">{label}</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  STAR RATING
// ════════════════════════════════════════════════════════════════════════

function StarRating({ value, onChange, readonly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`transition-all duration-150 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <FiStar
            size={readonly ? 14 : 22}
            className={`transition-colors ${
              (hover || value) >= star
                ? 'text-warning fill-warning'
                : 'text-text-muted/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  LOG SLEEP MODAL
// ════════════════════════════════════════════════════════════════════════

function LogSleepModal({ isOpen, onClose, onSaved, editEntry }) {
  const [date, setDate] = useState('');
  const [bedTime, setBedTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editEntry) {
      setDate(editEntry.date);
      setBedTime(new Date(editEntry.bed_time).toTimeString().slice(0, 5));
      setWakeTime(new Date(editEntry.wake_time).toTimeString().slice(0, 5));
      setQuality(editEntry.sleep_quality || 3);
      setNotes(editEntry.notes || '');
    } else {
      const today = new Date();
      setDate(today.toISOString().slice(0, 10));
      setBedTime('23:00');
      setWakeTime('07:00');
      setQuality(3);
      setNotes('');
    }
    setError('');
  }, [editEntry, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Build full ISO timestamps from date + time
      const bedDate = new Date(`${date}T${bedTime}:00`);
      let wakeDate = new Date(`${date}T${wakeTime}:00`);
      // If wake is before bed, it's next day
      if (wakeDate <= bedDate) {
        wakeDate.setDate(wakeDate.getDate() + 1);
      }

      const payload = {
        date,
        bed_time: bedDate.toISOString(),
        wake_time: wakeDate.toISOString(),
        sleep_quality: quality,
        notes: notes.trim() || null
      };

      if (editEntry) {
        await axios.put(`/api/sleep/${editEntry.id}`, payload);
      } else {
        await axios.post('/api/sleep', payload);
      }

      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="card p-6 w-full max-w-md"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-purple/10 flex items-center justify-center">
                <FiMoon className="text-purple" size={18} />
              </div>
              <h2 className="text-lg font-bold text-text-primary">
                {editEntry ? 'Edit Sleep Log' : 'Log Sleep'}
              </h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-elevated text-text-muted">
              <FiX size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] text-text-muted font-medium block mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-purple transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-text-muted font-medium block mb-1.5">
                  <FiMoon size={12} className="inline mr-1 text-purple" />Bed Time
                </label>
                <input
                  type="time"
                  value={bedTime}
                  onChange={e => setBedTime(e.target.value)}
                  className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-purple transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-text-muted font-medium block mb-1.5">
                  <FiSun size={12} className="inline mr-1 text-warning" />Wake Up
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={e => setWakeTime(e.target.value)}
                  className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-purple transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-text-muted font-medium block mb-1.5">Sleep Quality</label>
              <StarRating value={quality} onChange={setQuality} />
            </div>

            <div>
              <label className="text-[11px] text-text-muted font-medium block mb-1.5">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="How did you sleep?"
                rows={2}
                className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-purple transition-colors resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-danger text-xs bg-danger/10 rounded-lg px-3 py-2">
                <FiAlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-purple to-primary hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiCheck size={16} />
                  {editEntry ? 'Update Entry' : 'Save Sleep Log'}
                </>
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  SLEEP CALENDAR
// ════════════════════════════════════════════════════════════════════════

function SleepCalendar({ onDayClick }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [calendarData, setCalendarData] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await axios.get(`/api/sleep/calendar/${year}/${month}`);
        setCalendarData(res.data);
      } catch (err) {
        console.error('Failed to load calendar', err);
      }
    };
    fetchCalendar();
  }, [year, month]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const handleDayClick = (day) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const data = calendarData[dateStr];
    setSelectedDay(data ? { ...data, date: dateStr } : { date: dateStr, empty: true });
    onDayClick?.(dateStr);
  };

  const statusColors = {
    good: 'bg-success/80 text-white',
    average: 'bg-warning/80 text-white',
    poor: 'bg-danger/80 text-white'
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <FiCalendar size={14} className="text-purple" />
          Sleep Calendar
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-surface-elevated text-text-muted"><FiChevronLeft size={16} /></button>
          <span className="text-sm font-semibold text-text-primary min-w-[120px] text-center">{monthName} {year}</span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-surface-elevated text-text-muted"><FiChevronRight size={16} /></button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayLabels.map(d => (
          <div key={d} className="text-[10px] text-text-muted font-medium text-center py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const data = calendarData[dateStr];
          const isToday = dateStr === new Date().toISOString().slice(0, 10);
          const isSelected = selectedDay?.date === dateStr;

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-150 relative
                ${data ? statusColors[data.status] : 'bg-surface-elevated/50 text-text-muted hover:bg-surface-elevated'}
                ${isToday ? 'ring-2 ring-purple ring-offset-1 ring-offset-background' : ''}
                ${isSelected ? 'ring-2 ring-white/50' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 justify-center">
        {[
          { color: 'bg-success/80', label: '≥80' },
          { color: 'bg-warning/80', label: '60-79' },
          { color: 'bg-danger/80', label: '<60' },
          { color: 'bg-surface-elevated/50', label: 'No data' }
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-text-muted">
            <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Selected day detail */}
      <AnimatePresence>
        {selectedDay && !selectedDay.empty && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 rounded-lg bg-surface-elevated border border-border-subtle"
          >
            <p className="text-xs font-semibold text-text-primary mb-2">
              {new Date(selectedDay.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-text-muted">Duration</span>
                <p className="font-mono font-bold text-text-primary">{Math.floor(selectedDay.duration_minutes / 60)}h {selectedDay.duration_minutes % 60}m</p>
              </div>
              <div>
                <span className="text-text-muted">Score</span>
                <p className="font-mono font-bold text-text-primary">{selectedDay.sleep_score}/100</p>
              </div>
              <div>
                <span className="text-text-muted">Quality</span>
                <StarRating value={selectedDay.sleep_quality} readonly />
              </div>
            </div>
            {selectedDay.notes && (
              <p className="text-[11px] text-text-muted mt-2 italic">"{selectedDay.notes}"</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  CHART TOOLTIP
// ════════════════════════════════════════════════════════════════════════

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#161A2E] border border-border-subtle rounded-lg px-3 py-2 shadow-card text-xs">
      <p className="text-text-muted mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-mono font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}{typeof p.value === 'number' && p.name.includes('Hour') ? 'h' : ''}
        </p>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  MAIN DASHBOARD
// ════════════════════════════════════════════════════════════════════════

export default function SleepDashboard() {
  const { user } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [history, setHistory] = useState({ entries: [], total: 0, page: 1, totalPages: 1 });
  const [goals, setGoals] = useState(null);
  const [report, setReport] = useState(null);

  const [showLogModal, setShowLogModal] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [showGoalsEditor, setShowGoalsEditor] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview | analytics | history
  const [loading, setLoading] = useState(true);

  // Goal editor state
  const [goalForm, setGoalForm] = useState({ daily_goal_minutes: 480, preferred_bed_time: '23:00', preferred_wake_time: '07:00' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dashRes, analyticsRes, insightsRes, historyRes, goalsRes, reportRes] = await Promise.allSettled([
        axios.get('/api/sleep/dashboard'),
        axios.get('/api/sleep/analytics'),
        axios.get('/api/sleep/insights'),
        axios.get('/api/sleep/history?page=1&limit=30'),
        axios.get('/api/sleep/goals'),
        axios.get('/api/sleep/report')
      ]);

      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value.data);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data);
      if (insightsRes.status === 'fulfilled') setInsights(insightsRes.value.data);
      if (historyRes.status === 'fulfilled') setHistory(historyRes.value.data);
      if (goalsRes.status === 'fulfilled') {
        setGoals(goalsRes.value.data);
        setGoalForm({
          daily_goal_minutes: goalsRes.value.data.daily_goal_minutes || 480,
          preferred_bed_time: goalsRes.value.data.preferred_bed_time || '23:00',
          preferred_wake_time: goalsRes.value.data.preferred_wake_time || '07:00'
        });
      }
      if (reportRes.status === 'fulfilled') setReport(reportRes.value.data);
    } catch (err) {
      console.error('Failed to load sleep data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSaveGoals = async () => {
    try {
      await axios.post('/api/sleep/goals', goalForm);
      setShowGoalsEditor(false);
      fetchAll();
    } catch (err) {
      console.error('Failed to save goals', err);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Delete this sleep entry?')) return;
    try {
      await axios.delete(`/api/sleep/${id}`);
      fetchAll();
    } catch (err) {
      console.error('Failed to delete entry', err);
    }
  };

  const loadMoreHistory = async (page) => {
    try {
      const res = await axios.get(`/api/sleep/history?page=${page}&limit=30`);
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to load history', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple/20 flex items-center justify-center animate-pulse">
            <FiMoon className="text-purple" size={24} />
          </div>
          <p className="text-text-muted text-sm">Loading sleep data...</p>
        </div>
      </div>
    );
  }

  const score = dashboard?.lastNight?.sleep_score || 0;
  const goalHours = (dashboard?.goalMinutes || 480) / 60;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 relative">
      {/* Ambient glow */}
      <div className="ambient-glow w-[300px] h-[300px] bg-purple/10 top-0 right-0" />
      <div className="ambient-glow w-[200px] h-[200px] bg-primary/8 bottom-[20%] left-[10%]" />

      {/* ── HEADER ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple to-primary flex items-center justify-center">
              <FiMoon className="text-text-primary" size={20} />
            </div>
            Sleep Tracker
          </h1>
          <p className="text-text-muted text-sm mt-1">Track, analyze, and optimize your sleep</p>
        </div>
        <button
          onClick={() => { setEditEntry(null); setShowLogModal(true); }}
          className="btn-primary flex items-center gap-2 bg-gradient-to-r from-purple to-primary hover:opacity-90"
        >
          <FiPlus size={16} /> Log Sleep
        </button>
      </div>

      {/* ── TABS ──────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-surface rounded-lg border border-border-subtle w-fit">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'history', label: 'History' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-purple text-text-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  OVERVIEW TAB                                        */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard
              icon={<FiMoon size={16} />}
              label="Last Night"
              value={dashboard?.lastNight?.duration_formatted || '—'}
              sub={dashboard?.lastNight?.goal_met ? '✅ Goal met' : dashboard?.lastNight ? '❌ Below goal' : 'No data'}
              color="purple"
              glow
            />
            <StatCard
              icon={<FiZap size={16} />}
              label="Sleep Score"
              value={score || '—'}
              sub="out of 100"
              color={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger'}
            />
            <StatCard
              icon={<FiTrendingUp size={16} />}
              label="Sleep Streak"
              value={`${dashboard?.streak || 0} days`}
              sub="consecutive goals met"
              color="success"
            />
            <StatCard
              icon={<FiClock size={16} />}
              label="Weekly Avg"
              value={dashboard?.weeklyAvgFormatted || '—'}
              color="info"
            />
            <StatCard
              icon={<FiCalendar size={16} />}
              label="Monthly Avg"
              value={dashboard?.monthlyAvgFormatted || '—'}
              color="primary"
            />
            <StatCard
              icon={<FiAlertCircle size={16} />}
              label="Sleep Debt"
              value={dashboard?.sleepDebtFormatted || '0h 0m'}
              sub="this week"
              color={dashboard?.sleepDebt > 120 ? 'danger' : dashboard?.sleepDebt > 60 ? 'warning' : 'success'}
            />
          </div>

          {/* Score Ring + Consistency + Goals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Score Ring */}
            <div className="card p-5 flex flex-col items-center justify-center">
              <SleepScoreRing score={score} size={160} />
              <div className="mt-4 text-center">
                <p className="text-xs text-text-muted">
                  {score >= 80 ? '🌟 Excellent sleep!' : score >= 60 ? '😊 Decent sleep' : score > 0 ? '😴 Needs improvement' : 'No data yet'}
                </p>
                {dashboard?.lastNight && (
                  <p className="text-[11px] text-text-muted mt-1">
                    Bed: {new Date(dashboard.lastNight.bed_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    {' → '}
                    Wake: {new Date(dashboard.lastNight.wake_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                )}
              </div>
            </div>

            {/* Consistency */}
            <div className="card p-5">
              <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                <FiTarget size={14} className="text-info" /> Sleep Consistency
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="text-text-muted">Bedtime Consistency</span>
                    <span className="font-mono font-bold text-text-primary">{dashboard?.bedConsistency || 0}%</span>
                  </div>
                  <div className="progress-bar h-2">
                    <div
                      className="progress-fill bg-gradient-to-r from-purple to-primary"
                      style={{ width: `${dashboard?.bedConsistency || 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="text-text-muted">Wake Time Consistency</span>
                    <span className="font-mono font-bold text-text-primary">{dashboard?.wakeConsistency || 0}%</span>
                  </div>
                  <div className="progress-bar h-2">
                    <div
                      className="progress-fill bg-gradient-to-r from-info to-success"
                      style={{ width: `${dashboard?.wakeConsistency || 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="text-text-muted">Goal Achievement</span>
                    <span className="font-mono font-bold text-text-primary">{dashboard?.goalAchievement || 0}%</span>
                  </div>
                  <div className="progress-bar h-2">
                    <div
                      className="progress-fill bg-gradient-to-r from-success to-[#34D399]"
                      style={{ width: `${dashboard?.goalAchievement || 0}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border-subtle">
                  <div className="text-center">
                    <p className="text-[10px] text-text-muted">Avg Bed Time</p>
                    <p className="text-sm font-bold font-mono text-text-primary">{dashboard?.avgBedTime || '—'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-text-muted">Avg Wake Time</p>
                    <p className="text-sm font-bold font-mono text-text-primary">{dashboard?.avgWakeTime || '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Goals */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <FiTarget size={14} className="text-success" /> Sleep Goals
                </h3>
                <button
                  onClick={() => setShowGoalsEditor(!showGoalsEditor)}
                  className="text-[10px] text-purple hover:text-primary-light transition-colors font-medium"
                >
                  {showGoalsEditor ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {showGoalsEditor ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-text-muted block mb-1">Daily Goal (hours)</label>
                    <input
                      type="number"
                      min={4} max={12} step={0.5}
                      value={goalForm.daily_goal_minutes / 60}
                      onChange={e => setGoalForm({ ...goalForm, daily_goal_minutes: Math.round(parseFloat(e.target.value) * 60) })}
                      className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-purple"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-text-muted block mb-1">Preferred Bed Time</label>
                    <input
                      type="time"
                      value={goalForm.preferred_bed_time}
                      onChange={e => setGoalForm({ ...goalForm, preferred_bed_time: e.target.value })}
                      className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-purple"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-text-muted block mb-1">Preferred Wake Time</label>
                    <input
                      type="time"
                      value={goalForm.preferred_wake_time}
                      onChange={e => setGoalForm({ ...goalForm, preferred_wake_time: e.target.value })}
                      className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-purple"
                    />
                  </div>
                  <button onClick={handleSaveGoals} className="w-full btn-primary py-2 text-sm">
                    Save Goals
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg">
                    <div className="flex items-center gap-2">
                      <FiClock size={14} className="text-purple" />
                      <span className="text-xs text-text-secondary">Daily Goal</span>
                    </div>
                    <span className="text-sm font-bold font-mono text-text-primary">{goalHours}h</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg">
                    <div className="flex items-center gap-2">
                      <FiMoon size={14} className="text-purple" />
                      <span className="text-xs text-text-secondary">Bed Time</span>
                    </div>
                    <span className="text-sm font-bold font-mono text-text-primary">{goals?.preferred_bed_time || '23:00'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg">
                    <div className="flex items-center gap-2">
                      <FiSun size={14} className="text-warning" />
                      <span className="text-xs text-text-secondary">Wake Time</span>
                    </div>
                    <span className="text-sm font-bold font-mono text-text-primary">{goals?.preferred_wake_time || '07:00'}</span>
                  </div>

                  {/* Report preview */}
                  {report?.weekly && (
                    <div className="mt-3 pt-3 border-t border-border-subtle">
                      <p className="text-[10px] text-text-muted font-medium mb-2">THIS WEEK</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-center p-2 bg-surface-elevated/50 rounded-lg">
                          <p className="text-[10px] text-text-muted">Total</p>
                          <p className="text-xs font-bold font-mono text-text-primary">{report.weekly.totalHours}h</p>
                        </div>
                        <div className="text-center p-2 bg-surface-elevated/50 rounded-lg">
                          <p className="text-[10px] text-text-muted">Goal %</p>
                          <p className="text-xs font-bold font-mono text-text-primary">{report.weekly.goalAchievement}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Calendar + Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SleepCalendar />

            {/* Insights */}
            <div className="card p-4">
              <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                <FiZap size={14} className="text-warning" /> Sleep Insights
              </h3>
              <div className="space-y-2">
                {insights.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-6">Start logging sleep to see insights</p>
                ) : (
                  insights.map((insight, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        insight.type === 'positive' ? 'bg-success/5 border border-success/10'
                        : insight.type === 'warning' ? 'bg-warning/5 border border-warning/10'
                        : 'bg-surface-elevated border border-border-subtle'
                      }`}
                    >
                      <span className="text-base flex-shrink-0 mt-0.5">{insight.icon}</span>
                      <p className="text-xs text-text-secondary leading-relaxed">{insight.text}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Daily Chart */}
          {analytics?.daily?.length > 0 && (
            <div className="card p-4">
              <h3 className="text-sm font-bold text-text-primary mb-4">Daily Sleep Hours (Last 14 Days)</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.daily} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => v.slice(-2)} />
                    <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} domain={[0, 'auto']} />
                    <Tooltip content={<ChartTooltip />} />
                    <ReferenceLine y={goalHours} stroke="#A855F7" strokeDasharray="5 5" strokeWidth={1.5} />
                    <Bar dataKey="hours" name="Hours" fill="#A855F7" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-text-muted mt-1 text-center">Dashed line = {goalHours}h goal</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/*  ANALYTICS TAB                                       */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          {/* Daily Sleep Bar Chart */}
          <div className="card p-4">
            <h3 className="text-sm font-bold text-text-primary mb-4">Daily Sleep Hours</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.daily || []} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => v.slice(-5)} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine y={goalHours} stroke="#A855F7" strokeDasharray="5 5" label={{ value: 'Goal', fill: '#A855F7', fontSize: 10 }} />
                  <Bar dataKey="hours" name="Hours" fill="#A855F7" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Average Line Chart */}
          <div className="card p-4">
            <h3 className="text-sm font-bold text-text-primary mb-4">Weekly Average (12 Weeks)</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.weekly || []} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSleepWeekly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="week" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine y={goalHours} stroke="#A855F7" strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="avgHours" name="Avg Hours" stroke="#06B6D4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSleepWeekly)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sleep Score Trend */}
          <div className="card p-4">
            <h3 className="text-sm font-bold text-text-primary mb-4">Sleep Score Trend</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.daily || []} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => v.slice(-5)} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine y={80} stroke="#22C55E" strokeDasharray="3 3" strokeOpacity={0.5} />
                  <ReferenceLine y={60} stroke="#F59E0B" strokeDasharray="3 3" strokeOpacity={0.5} />
                  <Line type="monotone" dataKey="score" name="Score" stroke="#22C55E" strokeWidth={2.5} dot={{ fill: '#22C55E', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Report cards */}
          {report && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['weekly', 'monthly'].map(period => {
                const r = report[period];
                if (!r) return null;
                return (
                  <div key={period} className="card p-4">
                    <h3 className="text-sm font-bold text-text-primary mb-3">{r.label} Report</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2.5 bg-surface-elevated rounded-lg">
                        <p className="text-[10px] text-text-muted">Total Hours</p>
                        <p className="text-sm font-bold font-mono text-text-primary">{r.totalHours}h</p>
                      </div>
                      <div className="p-2.5 bg-surface-elevated rounded-lg">
                        <p className="text-[10px] text-text-muted">Avg Sleep</p>
                        <p className="text-sm font-bold font-mono text-text-primary">{r.avgSleep}</p>
                      </div>
                      <div className="p-2.5 bg-surface-elevated rounded-lg">
                        <p className="text-[10px] text-text-muted">Avg Score</p>
                        <p className="text-sm font-bold font-mono text-text-primary">{r.avgScore}</p>
                      </div>
                      <div className="p-2.5 bg-surface-elevated rounded-lg">
                        <p className="text-[10px] text-text-muted">Goal %</p>
                        <p className="text-sm font-bold font-mono text-text-primary">{r.goalAchievement}%</p>
                      </div>
                      {r.bestDay && (
                        <div className="p-2.5 bg-success/5 border border-success/10 rounded-lg">
                          <p className="text-[10px] text-text-muted">Best Day</p>
                          <p className="text-xs font-bold text-success">{r.bestDay.duration}</p>
                          <p className="text-[10px] text-text-muted">{r.bestDay.date}</p>
                        </div>
                      )}
                      {r.worstDay && (
                        <div className="p-2.5 bg-danger/5 border border-danger/10 rounded-lg">
                          <p className="text-[10px] text-text-muted">Worst Day</p>
                          <p className="text-xs font-bold text-danger">{r.worstDay.duration}</p>
                          <p className="text-[10px] text-text-muted">{r.worstDay.date}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/*  HISTORY TAB                                         */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeTab === 'history' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-border-subtle">
            <h3 className="text-sm font-bold text-text-primary">Sleep History</h3>
            <p className="text-[11px] text-text-muted">{history.total} total entries</p>
          </div>

          {history.entries.length === 0 ? (
            <div className="p-8 text-center">
              <FiMoon size={32} className="text-text-muted/30 mx-auto mb-3" />
              <p className="text-sm text-text-muted">No sleep entries yet. Log your first night!</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface-elevated/50">
                      <th className="text-left px-4 py-3 text-[11px] text-text-muted font-medium">Date</th>
                      <th className="text-left px-4 py-3 text-[11px] text-text-muted font-medium">Bed Time</th>
                      <th className="text-left px-4 py-3 text-[11px] text-text-muted font-medium">Wake Time</th>
                      <th className="text-left px-4 py-3 text-[11px] text-text-muted font-medium">Duration</th>
                      <th className="text-left px-4 py-3 text-[11px] text-text-muted font-medium">Score</th>
                      <th className="text-left px-4 py-3 text-[11px] text-text-muted font-medium">Quality</th>
                      <th className="text-left px-4 py-3 text-[11px] text-text-muted font-medium">Notes</th>
                      <th className="text-right px-4 py-3 text-[11px] text-text-muted font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.entries.map((entry, i) => (
                      <tr key={entry.id} className="border-b border-border-subtle/50 hover:bg-surface-elevated/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-text-primary">
                          {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                        </td>
                        <td className="px-4 py-3 text-text-secondary font-mono text-xs">
                          {new Date(entry.bed_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </td>
                        <td className="px-4 py-3 text-text-secondary font-mono text-xs">
                          {new Date(entry.wake_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-text-primary">
                          {Math.floor(entry.duration_minutes / 60)}h {entry.duration_minutes % 60}m
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            entry.sleep_score >= 80 ? 'bg-success/20 text-success'
                            : entry.sleep_score >= 60 ? 'bg-warning/20 text-warning'
                            : 'bg-danger/20 text-danger'
                          }`}>
                            {entry.sleep_score}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StarRating value={entry.sleep_quality} readonly />
                        </td>
                        <td className="px-4 py-3 text-text-muted text-xs max-w-[150px] truncate">
                          {entry.notes || '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setEditEntry(entry); setShowLogModal(true); }}
                              className="p-1.5 rounded hover:bg-surface-elevated text-text-muted hover:text-primary transition-colors"
                            >
                              <FiEdit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="p-1.5 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-2 p-3">
                {history.entries.map(entry => (
                  <div key={entry.id} className="p-3 bg-surface-elevated rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-text-primary">
                        {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        entry.sleep_score >= 80 ? 'bg-success/20 text-success'
                        : entry.sleep_score >= 60 ? 'bg-warning/20 text-warning'
                        : 'bg-danger/20 text-danger'
                      }`}>{entry.sleep_score}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-text-secondary">
                      <span className="font-mono">{Math.floor(entry.duration_minutes / 60)}h {entry.duration_minutes % 60}m</span>
                      <span>•</span>
                      <StarRating value={entry.sleep_quality} readonly />
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-2">
                      <button onClick={() => { setEditEntry(entry); setShowLogModal(true); }} className="p-1.5 text-text-muted hover:text-primary">
                        <FiEdit2 size={12} />
                      </button>
                      <button onClick={() => handleDeleteEntry(entry.id)} className="p-1.5 text-text-muted hover:text-danger">
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {history.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-border-subtle">
                  <button
                    disabled={history.page <= 1}
                    onClick={() => loadMoreHistory(history.page - 1)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-elevated text-text-secondary hover:text-text-primary disabled:opacity-30"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-text-muted font-mono">
                    {history.page} / {history.totalPages}
                  </span>
                  <button
                    disabled={history.page >= history.totalPages}
                    onClick={() => loadMoreHistory(history.page + 1)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-elevated text-text-secondary hover:text-text-primary disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Log Sleep Modal */}
      <LogSleepModal
        isOpen={showLogModal}
        onClose={() => { setShowLogModal(false); setEditEntry(null); }}
        onSaved={fetchAll}
        editEntry={editEntry}
      />
    </div>
  );
}
