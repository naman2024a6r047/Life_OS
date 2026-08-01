import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  FiBarChart2, FiClock, FiCheckCircle, FiTarget, FiZap,
  FiCalendar, FiTrendingUp, FiRefreshCw
} from 'react-icons/fi';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Bar, LineChart, Line, BarChart, RadialBarChart, RadialBar
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#A855F7', '#06B6D4', '#22C55E', '#F59E0B', '#6366F1', '#EC4899', '#14B8A6', '#F97316'];
function fmtMins(mins) {
  const m = Math.round(Number(mins) || 0);
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}m`;
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`;
}

// Custom Recharts Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border-subtle p-3 rounded-xl shadow-xl z-50">
        <p className="text-xs font-bold text-text-primary mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-[11px]">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-text-muted">{entry.name}:</span>
            <span className="font-mono font-bold text-text-primary">
              {entry.name.toLowerCase().includes('time') || entry.name.toLowerCase().includes('minutes') || entry.name.toLowerCase().includes('value') ? fmtMins(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Subject Tooltip
const SubjectTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-surface border border-border-subtle p-3 rounded-xl shadow-xl z-50">
        <p className="text-xs font-bold text-text-primary flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.fill }} />
          {data.name}
        </p>
        <div className="flex gap-4 text-[11px]">
          <div><span className="text-text-muted">Time:</span> <span className="font-mono font-bold">{fmtMins(data.minutes)}</span></div>
          <div><span className="text-text-muted">Pct:</span> <span className="font-mono font-bold">{data.pct}%</span></div>
        </div>
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboard() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  const fetchAnalytics = async (p = period) => {
    setLoading(true);
    try {
      const [analyticsRes, summaryRes] = await Promise.all([
        axios.get(`/api/study/analytics?period=${p}`),
        axios.get('/api/analytics/summary')
      ]);
      setData({ ...analyticsRes.data, summary: summaryRes.data });
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const handlePeriodChange = (p) => {
    setPeriod(p);
    fetchAnalytics(p);
  };

  if (loading) return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-3">
        <FiRefreshCw className="animate-spin text-purple mx-auto" size={28} />
        <p className="text-xs text-text-muted">Loading analytics...</p>
      </div>
    </div>
  );

  const stats = data?.stats || {};
  const summary = data?.summary || {};
  const subjectDist = data?.subjectDistribution || [];
  const dailyData = data?.dailyBreakdown || [];
  const topSessions = data?.topSessions || [];
  const insights = data?.insights || [];
  const heatmap = data?.heatmap || {};

  // Build heatmap last 35 days
  const heatmapDays = Array.from({ length: 35 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (34 - i));
    const key = d.toISOString().split('T')[0];
    return { 
      key, 
      count: heatmap[key] || 0,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  });

  const focusScore = stats.focusScore ?? 0;
  const focusData = [
    { name: 'Off-Peak', value: 100, fill: '#1e1e2e' },
    { name: 'Focus', value: focusScore, fill: '#A855F7' }
  ];

  const pieData = subjectDist.map((s, i) => ({
    name: s.name,
    value: s.minutes,
    color: COLORS[i % COLORS.length]
  }));

  const subjectBarData = subjectDist.map((s, i) => ({
    name: s.name,
    minutes: s.minutes,
    pct: s.pct,
    fill: COLORS[i % COLORS.length]
  }));

  // Ensure dailyData has short day names for XAxis
  const formattedDailyData = dailyData.map(d => ({
    ...d,
    shortDay: d.day.split(' ')[0]
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center shadow-glow-primary">
            <FiBarChart2 size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Analytics</h1>
            <p className="text-xs text-text-muted">Insights to help you improve and grow every day.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono shadow-sm">
            <FiCalendar size={13} className="text-text-muted" />
            <span>{data?.dateRange?.start} – {data?.dateRange?.end}</span>
          </div>
          <div className="flex rounded-xl border border-border-subtle overflow-hidden shadow-sm">
            {[['week', 'Week'], ['month', 'Month']].map(([val, label]) => (
              <button key={val} onClick={() => handlePeriodChange(val)}
                className={`px-3 py-1.5 text-xs font-semibold transition-all ${period === val ? 'bg-purple text-white shadow-glow-primary' : 'text-text-muted hover:bg-surface-elevated'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: <FiClock size={16} />, label: 'Study Time', val: stats.totalMins > 0 ? fmtMins(stats.totalMins) : '0h', sub: stats.timeChange !== 0 ? `${stats.timeChange > 0 ? '↑' : '↓'} ${Math.abs(stats.timeChange)}% vs last ${period}` : 'No prev. data', color: 'info', subColor: stats.timeChange > 0 ? 'text-green-400' : stats.timeChange < 0 ? 'text-red-400' : 'text-text-muted' },
          { icon: <FiCheckCircle size={16} />, label: 'Tasks Completed', val: summary.completedTasks ?? stats.tasksCompleted ?? 0, sub: `${summary.totalTasks || 0} total tasks`, color: 'success', subColor: 'text-text-muted' },
          { icon: <FiTarget size={16} />, label: 'Focus Score', val: `${stats.focusScore ?? 0}%`, sub: stats.focusScore >= 70 ? 'Excellent' : stats.focusScore >= 50 ? 'Good' : 'Needs work', color: 'primary', subColor: stats.focusScore >= 70 ? 'text-green-400' : 'text-yellow-400' },
          { icon: <FiZap size={16} />, label: 'Goals Active', val: summary.activeGoals ?? 0, sub: `${summary.completedGoals ?? 0} completed`, color: 'warning', subColor: 'text-text-muted' },
          { icon: <FiTrendingUp size={16} />, label: 'Streak', val: `${stats.streak || user?.current_streak || 0} Days`, sub: 'Current streak', color: 'danger', subColor: 'text-orange-400' },
        ].map((stat, i) => (
          <motion.div key={i} whileHover={{ y: -3, scale: 1.02 }} className="card p-3.5 flex items-center gap-3 border border-border-subtle bg-surface-elevated/40 shadow-sm transition-colors hover:border-primary/30">
            <div className={`w-9 h-9 rounded-xl bg-${stat.color}/10 text-${stat.color} flex items-center justify-center flex-shrink-0 shadow-inner`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-text-muted font-medium truncate uppercase tracking-wider">{stat.label}</p>
              <p className="text-lg font-bold font-mono text-text-primary leading-tight">{stat.val}</p>
              <p className={`text-[9px] font-semibold mt-0.5 ${stat.subColor}`}>{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Study Time Overview (Interactive Bar Chart) */}
        <div className="lg:col-span-5 card p-5 space-y-4 border border-border-subtle bg-surface-elevated/20 shadow-sm flex flex-col">
          <div className="section-header mb-0">
            <h3 className="section-title">Study Time Overview</h3>
            <span className="text-[10px] font-mono text-text-muted capitalize bg-surface px-2 py-0.5 rounded border border-border-subtle">{period}</span>
          </div>
          {dailyData.length === 0 || stats.totalMins === 0 ? (
            <div className="flex-1 flex items-center justify-center text-text-muted text-xs">No study data for this period</div>
          ) : (
            <div className="flex-1 flex flex-col justify-end min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedDailyData.slice(-7)} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D2D3D" vertical={false} />
                  <XAxis dataKey="shortDay" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B8B9E' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B8B9E' }} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff0a' }} />
                  <Bar dataKey="minutes" name="Study Time" fill="#A855F7" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Time Distribution (Interactive Donut Chart) */}
        <div className="lg:col-span-4 card p-5 space-y-4 border border-border-subtle bg-surface-elevated/20 shadow-sm flex flex-col">
          <div className="section-header mb-0">
            <h3 className="section-title">Time Distribution</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center min-h-[180px] relative">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={75}
                  paddingAngle={5} dataKey="value" stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-xl font-black font-mono text-text-primary drop-shadow-sm">{fmtMins(stats.totalMins)}</span>
              <span className="text-[9px] text-text-muted uppercase tracking-wider font-semibold">Total</span>
            </div>
          </div>
          <div className="space-y-1.5 text-[10px] max-h-[100px] overflow-y-auto custom-scrollbar pr-1 mt-2">
            {subjectDist.length === 0 ? (
              <p className="text-center text-text-muted text-xs">No data</p>
            ) : subjectDist.slice(0, 5).map((s, i) => (
              <div key={i} className="flex justify-between items-center bg-surface-elevated/30 p-1.5 rounded">
                <span className="font-medium flex items-center gap-1.5 text-text-primary">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="truncate max-w-[120px]">{s.name}</span>
                </span>
                <span className="font-mono text-text-primary font-bold">{fmtMins(s.minutes)} <span className="text-text-muted font-normal">({s.pct}%)</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Heatmap (Interactive Framer Grid) */}
        <div className="lg:col-span-3 card p-5 space-y-4 border border-border-subtle bg-surface-elevated/20 shadow-sm flex flex-col">
          <div className="section-header mb-0">
            <h3 className="section-title">Activity Heatmap</h3>
            <span className="text-[10px] text-text-muted">Last 35 Days</span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] text-text-muted font-mono px-1">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {heatmapDays.map((d, i) => (
                  <motion.div key={i} 
                    whileHover={{ scale: 1.3, zIndex: 10 }}
                    className="relative group cursor-crosshair"
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-surface border border-border-subtle rounded p-1.5 text-[10px] font-mono text-text-primary z-20 whitespace-nowrap shadow-xl">
                      {d.label}<br /><span className="text-success font-bold">{d.count} activities</span>
                    </div>
                    <div className={`w-full aspect-square rounded-[3px] transition-colors duration-300 shadow-sm ${
                      d.count >= 5 ? 'bg-success shadow-glow-success' : 
                      d.count >= 3 ? 'bg-success/80' : 
                      d.count >= 1 ? 'bg-success/40' : 'bg-surface-elevated hover:bg-surface-elevated/80'
                    }`} />
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between text-[9px] text-text-muted pt-4 border-t border-border-subtle/50 mt-4">
              <span>Less</span>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[2px] bg-surface-elevated" />
                <span className="w-2.5 h-2.5 rounded-[2px] bg-success/40" />
                <span className="w-2.5 h-2.5 rounded-[2px] bg-success/80" />
                <span className="w-2.5 h-2.5 rounded-[2px] bg-success shadow-glow-success" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Subject Performance (Interactive Horizontal Bar Chart) */}
        <div className="lg:col-span-4 card p-5 space-y-4 border border-border-subtle bg-surface-elevated/20 shadow-sm flex flex-col">
          <div className="section-header mb-0">
            <h3 className="section-title">Subject Performance</h3>
          </div>
          <div className="flex-1 min-h-[200px] mt-2">
            {subjectDist.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-6">No subject data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectBarData} layout="vertical" margin={{ top: 0, right: 30, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D2D3D" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B8B9E' }} width={80} />
                  <RechartsTooltip content={<SubjectTooltip />} cursor={{ fill: '#ffffff0a' }} />
                  <Bar dataKey="minutes" radius={[0, 4, 4, 0]} barSize={12}>
                    {subjectBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Focus Score (Interactive RadialBar) */}
        <div className="lg:col-span-3 card p-5 space-y-4 border border-border-subtle bg-surface-elevated/20 shadow-sm flex flex-col">
          <div className="section-header mb-0">
            <h3 className="section-title">Focus Score</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center relative min-h-[160px]">
            <ResponsiveContainer width="100%" height={160}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={14} data={focusData} startAngle={90} endAngle={-270}>
                <RadialBar minAngle={15} background={{ fill: 'transparent' }} clockWise dataKey="value" cornerRadius={10} />
                <RechartsTooltip content={<CustomTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
              <span className="text-2xl font-black font-mono text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">{stats.focusScore ?? 0}%</span>
            </div>
          </div>
          <div className="space-y-1.5 text-[10px] bg-surface-elevated/30 p-2 rounded-lg border border-border-subtle/50 w-full mt-2">
            <div className="flex justify-between items-center"><span className="text-primary font-medium flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Peak Sessions</span><span className="font-mono text-text-primary font-bold">{stats.focusScore ?? 0}%</span></div>
            <div className="flex justify-between items-center"><span className="text-text-muted font-medium flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-text-muted" /> Off-Peak Sessions</span><span className="font-mono text-text-primary font-bold">{100 - (stats.focusScore ?? 0)}%</span></div>
          </div>
        </div>

        {/* Activity Trend + Top Sessions + Insights */}
        <div className="lg:col-span-5 space-y-5">
          {/* Activity Trend (Interactive Line Chart) */}
          <div className="card p-5 space-y-3 border border-border-subtle bg-surface-elevated/20 shadow-sm">
            <div className="section-header mb-0">
              <h3 className="section-title">Activity Trend</h3>
            </div>
            <div className="relative h-28 pt-2">
              {dailyData.length > 0 && maxActivities > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedDailyData.slice(-7)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="shortDay" hide />
                    <YAxis hide />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="activities" name="Activities" stroke="#A855F7" strokeWidth={3} dot={{ r: 3, fill: '#A855F7', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, fill: '#fff', stroke: '#A855F7' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-text-muted text-xs">No activity data</div>
              )}
            </div>
            <div className="flex justify-between text-[9px] text-text-muted font-mono px-2">
              {formattedDailyData.slice(-7).map((d, i) => <span key={i}>{d.shortDay}</span>)}
            </div>
          </div>

          {/* Top Sessions */}
          <div className="card p-5 space-y-3 border border-border-subtle bg-surface-elevated/20 shadow-sm">
            <div className="section-header mb-0">
              <h3 className="section-title">Top Study Sessions</h3>
            </div>
            <div className="space-y-2 mt-2">
              {topSessions.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4">No sessions logged yet</p>
              ) : topSessions.map((ts, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated border border-border-subtle/50 transition-colors hover:border-primary/30">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shadow-inner" style={{ background: COLORS[i] + '22', color: COLORS[i] }}>📚</div>
                    <div>
                      <p className="text-xs font-bold text-text-primary leading-tight truncate max-w-[140px]">{ts.title}</p>
                      <p className="text-[9px] text-text-muted font-mono mt-0.5">{ts.date} · {ts.session_time}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-success flex items-center gap-1.5 bg-success/10 px-2 py-1 rounded-md border border-success/20">
                    {ts.duration} <FiCheckCircle size={12} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="card p-4 space-y-2 border border-border-subtle bg-primary/5 shadow-sm">
            <div className="section-header mb-0">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5"><FiZap /> Smart Insights</h3>
            </div>
            <div className="space-y-2.5 mt-2">
              {insights.length === 0 ? (
                <p className="text-[10px] text-text-muted">Log study sessions to get personalized insights.</p>
              ) : insights.map((ins, i) => (
                <div key={i} className="flex items-start gap-2.5 text-[11px] text-text-primary leading-relaxed">
                  <span className="text-primary mt-0.5">{ins.icon}</span>
                  <span>{ins.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Summary (Interactive ComposedChart) */}
      <div className="card p-6 space-y-4 border border-border-subtle bg-surface-elevated/20 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="section-title text-lg">Summary Overview</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-3 py-2 flex flex-col justify-center">
            {[
              { icon: <FiClock className="text-purple" />, val: fmtMins(stats.totalMins || 0), sub: 'Total Study Time' },
              { icon: <FiCheckCircle className="text-success" />, val: summary.completedTasks ?? 0, sub: 'Tasks Done' },
              { icon: <FiTarget className="text-primary" />, val: `${stats.focusScore ?? 0}%`, sub: 'Focus Score' },
              { icon: <FiZap className="text-warning" />, val: `${stats.streak || 0} Days`, sub: 'Current Streak' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-surface-elevated/30">
                <div className="w-8 h-8 rounded-full bg-surface border border-border-subtle flex items-center justify-center shadow-sm">
                  {item.icon}
                </div>
                <div>
                  <p className="text-base font-bold font-mono text-text-primary">{item.val}</p>
                  <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-9 h-52 relative pt-2">
            {dailyData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={formattedDailyData.slice(-7)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D2D3D" vertical={false} />
                  <XAxis dataKey="shortDay" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B8B9E' }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B8B9E' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line yAxisId="left" type="monotone" dataKey="minutes" name="Study Time (m)" stroke="#A855F7" strokeWidth={3} dot={{ r: 4, fill: '#A855F7', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#fff', stroke: '#A855F7' }} />
                  <Line yAxisId="left" type="monotone" dataKey="activities" name="Activities" stroke="#22C55E" strokeWidth={3} dot={{ r: 4, fill: '#22C55E', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#fff', stroke: '#22C55E' }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-text-muted text-xs">Log more sessions to see trend</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
