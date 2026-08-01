import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  FiBarChart2, FiClock, FiCheckCircle, FiTarget, FiZap,
  FiFilter, FiCalendar, FiTrendingUp, FiRefreshCw
} from 'react-icons/fi';
import axios from 'axios';
import { motion } from 'framer-motion';

const COLORS = ['#A855F7', '#06B6D4', '#22C55E', '#F59E0B', '#6366F1', '#EC4899', '#14B8A6', '#F97316'];
function fmtMins(mins) {
  const m = Math.round(Number(mins) || 0);
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}m`;
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`;
}

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
  const maxMins = Math.max(...dailyData.map(d => d.minutes), 1);
  const maxActivities = Math.max(...dailyData.map(d => d.activities), 1);
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

  const productivityPct = data?.productivityTrend || [];
  const maxProd = Math.max(...productivityPct.map(d => d.pct), 1);

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
        {/* Study Time Bar Chart */}
        <div className="lg:col-span-5 card p-5 space-y-4 border border-border-subtle bg-surface-elevated/20 shadow-sm flex flex-col">
          <div className="section-header mb-0">
            <h3 className="section-title">Study Time Overview</h3>
            <span className="text-[10px] font-mono text-text-muted capitalize bg-surface px-2 py-0.5 rounded border border-border-subtle">{period}</span>
          </div>
          {dailyData.length === 0 || stats.totalMins === 0 ? (
            <div className="flex-1 flex items-center justify-center text-text-muted text-xs">No study data for this period</div>
          ) : (
            <div className="flex-1 flex flex-col justify-end">
              <div className="h-44 flex items-end justify-between gap-3 px-2 pt-6 pb-2 border-b border-border-subtle/50 relative">
                {dailyData.slice(-7).map((bar, i) => {
                  const barHeight = Math.max(4, (bar.minutes / maxMins) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative cursor-crosshair">
                      <div className="absolute bottom-[calc(100%+10px)] hidden group-hover:flex flex-col items-center bg-surface border border-border-subtle rounded-lg p-2 text-[10px] font-mono text-text-primary z-20 shadow-xl min-w-[70px] text-center">
                        <span className="text-text-muted mb-1">{bar.day}</span>
                        <span className="text-purple font-bold text-xs">{fmtMins(bar.minutes)}</span>
                        <div className="absolute -bottom-1 w-2 h-2 bg-surface border-b border-r border-border-subtle rotate-45"></div>
                      </div>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${barHeight}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                        className={`w-full rounded-t-lg transition-colors duration-300 ${bar.minutes > 0 ? 'bg-gradient-to-t from-purple/80 to-purple group-hover:from-purple group-hover:to-purple-light shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-surface-elevated'}`}
                      />
                      <span className="text-[9px] text-text-muted font-mono mt-1">{bar.day.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] text-text-muted mt-3 px-2">
                {subjectDist.slice(0, 4).map((s, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shadow-sm" style={{ background: COLORS[i] }} />
                    <span className="truncate max-w-[60px]">{s.name.split(' ')[0]}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Time Distribution Donut */}
        <div className="lg:col-span-4 card p-5 space-y-4 border border-border-subtle bg-surface-elevated/20 shadow-sm flex flex-col">
          <div className="section-header mb-0">
            <h3 className="section-title">Time Distribution</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center my-2">
            <div className="flex items-center justify-center">
              <div className="relative w-36 h-36 drop-shadow-xl">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 128 128">
                  {subjectDist.length === 0 ? (
                    <circle cx="64" cy="64" r="52" stroke="#1e1e2e" strokeWidth="16" fill="none" />
                  ) : (() => {
                    const total = subjectDist.reduce((s, d) => s + d.minutes, 0);
                    const circumference = 2 * Math.PI * 52;
                    let offset = 0;
                    return subjectDist.slice(0, 5).map((s, i) => {
                      const pct = s.minutes / total;
                      const dash = pct * circumference;
                      const currentOffset = offset;
                      offset += dash;
                      return (
                        <motion.circle 
                          key={i} cx="64" cy="64" r="52"
                          stroke={COLORS[i]} strokeWidth="16"
                          strokeLinecap={dash > 0 ? "round" : "butt"}
                          initial={{ strokeDasharray: `0 ${circumference}`, strokeDashoffset: -currentOffset }}
                          animate={{ strokeDasharray: `${dash} ${circumference - dash}` }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                          strokeDashoffset={-currentOffset} fill="none" 
                          className="hover:opacity-80 transition-opacity cursor-pointer drop-shadow-md"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black font-mono text-text-primary drop-shadow-sm">{fmtMins(stats.totalMins)}</span>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Total</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-1.5 text-[10px] max-h-[100px] overflow-y-auto custom-scrollbar pr-1">
            {subjectDist.length === 0 ? (
              <p className="text-center text-text-muted text-xs">No data</p>
            ) : subjectDist.slice(0, 5).map((s, i) => (
              <motion.div key={i} whileHover={{ x: 2 }} className="flex justify-between items-center bg-surface-elevated/30 p-1.5 rounded">
                <span className="font-medium flex items-center gap-1.5 text-text-primary">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="truncate max-w-[120px]">{s.name}</span>
                </span>
                <span className="font-mono text-text-primary font-bold">{fmtMins(s.minutes)} <span className="text-text-muted font-normal">({s.pct}%)</span></span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Activity Heatmap */}
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
                  <motion.div key={i} title={`${d.label}: ${d.count} activities`}
                    whileHover={{ scale: 1.3, zIndex: 10 }}
                    className={`h-4 rounded-[3px] cursor-crosshair transition-colors duration-300 shadow-sm ${
                      d.count >= 5 ? 'bg-success shadow-glow-success' : 
                      d.count >= 3 ? 'bg-success/80' : 
                      d.count >= 1 ? 'bg-success/40' : 'bg-surface-elevated hover:bg-surface-elevated/80'
                    }`} 
                  />
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
        {/* Subject Performance */}
        <div className="lg:col-span-4 card p-5 space-y-4 border border-border-subtle bg-surface-elevated/20 shadow-sm flex flex-col">
          <div className="section-header mb-0">
            <h3 className="section-title">Subject Performance</h3>
          </div>
          <div className="space-y-4 flex-1 flex flex-col justify-center mt-2">
            {subjectDist.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-6">No subject data yet</p>
            ) : subjectDist.map((sb, i) => (
              <div key={i} className="space-y-1.5 group">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-primary flex items-center gap-2 group-hover:text-white transition-colors">
                    <span className="w-2 h-2 rounded-full shadow-sm" style={{ background: COLORS[i] }} />
                    {sb.name}
                  </span>
                  <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span className="text-text-muted">{fmtMins(sb.minutes)}</span>
                    <span className="font-bold text-text-primary px-1.5 py-0.5 rounded bg-surface-elevated border border-border-subtle">{sb.pct}%</span>
                  </div>
                </div>
                <div className="progress-bar h-2 rounded-full bg-surface-elevated overflow-hidden border border-border-subtle/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${sb.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                    className="h-full rounded-full relative" 
                    style={{ background: COLORS[i] }} 
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Focus vs Break */}
        <div className="lg:col-span-3 card p-5 space-y-4 border border-border-subtle bg-surface-elevated/20 shadow-sm flex flex-col">
          <div className="section-header mb-0">
            <h3 className="section-title">Focus Score</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center my-2">
            <div className="relative w-32 h-32 drop-shadow-xl">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                {(() => {
                  const circumference = 2 * Math.PI * 52;
                  const focusDash = (stats.focusScore / 100) * circumference;
                  return (
                    <>
                      <circle cx="64" cy="64" r="52" stroke="#1e1e2e" strokeWidth="14" fill="none" />
                      <motion.circle 
                        cx="64" cy="64" r="52" stroke="#A855F7" strokeWidth="14"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: `0 ${circumference}` }}
                        animate={{ strokeDasharray: `${focusDash} ${circumference}` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        fill="none" 
                        className="drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                      />
                    </>
                  );
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black font-mono text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">{stats.focusScore ?? 0}%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1.5 text-[10px] bg-surface-elevated/30 p-2 rounded-lg border border-border-subtle/50 w-full mt-2">
            <div className="flex justify-between items-center"><span className="text-primary font-medium flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Peak Sessions</span><span className="font-mono text-text-primary font-bold">{stats.focusScore ?? 0}%</span></div>
            <div className="flex justify-between items-center"><span className="text-text-muted font-medium flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-text-muted" /> Off-Peak Sessions</span><span className="font-mono text-text-primary font-bold">{100 - (stats.focusScore ?? 0)}%</span></div>
          </div>
        </div>

        {/* Productivity Trend + Top Sessions + Insights */}
        <div className="lg:col-span-5 space-y-5">
          {/* Productivity Trend */}
          <div className="card p-5 space-y-3 border border-border-subtle bg-surface-elevated/20 shadow-sm">
            <div className="section-header mb-0">
              <h3 className="section-title">Activity Trend</h3>
            </div>
            <div className="relative h-28 pt-2">
              {dailyData.length > 0 && maxActivities > 0 ? (
                <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="w-full h-full overflow-visible drop-shadow-md">
                  <motion.polyline
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    points={dailyData.slice(-7).map((d, i) =>
                      `${(i / (Math.min(dailyData.length, 7) - 1)) * 100},${60 - (d.activities / maxActivities) * 50}`
                    ).join(' ')}
                    fill="none" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className="drop-shadow-[0_4px_6px_rgba(168,85,247,0.4)]"
                  />
                  {/* Glowing data points */}
                  {dailyData.slice(-7).map((d, i) => (
                    <circle
                      key={i}
                      cx={(i / (Math.min(dailyData.length, 7) - 1)) * 100}
                      cy={60 - (d.activities / maxActivities) * 50}
                      r="2"
                      fill="#fff"
                      stroke="#A855F7"
                      strokeWidth="1.5"
                    />
                  ))}
                </svg>
              ) : (
                <div className="flex items-center justify-center h-full text-text-muted text-xs">No activity data</div>
              )}
            </div>
            <div className="flex justify-between text-[9px] text-text-muted font-mono px-1">
              {dailyData.slice(-7).map((d, i) => <span key={i}>{d.day.split(' ')[0]}</span>)}
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
                <motion.div key={i} whileHover={{ x: 3 }} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated border border-border-subtle/50 transition-colors hover:border-primary/30">
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
                </motion.div>
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

      {/* Weekly Summary */}
      <div className="card p-6 space-y-4 border border-border-subtle bg-surface-elevated/20 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="section-title text-lg">Summary Overview</h3>
          <div className="flex items-center gap-5 text-[10px] font-mono bg-surface p-2 rounded-lg border border-border-subtle">
            <span className="text-purple flex items-center gap-1.5"><span className="w-3 h-1 rounded-full bg-purple inline-block shadow-glow-primary" /> Study Time</span>
            <span className="text-success flex items-center gap-1.5"><span className="w-3 h-1 rounded-full bg-success inline-block shadow-glow-success" /> Activities</span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-3 py-2 flex flex-col justify-center">
            {[
              { icon: <FiClock className="text-purple" />, val: fmtMins(stats.totalMins || 0), sub: 'Total Study Time' },
              { icon: <FiCheckCircle className="text-success" />, val: summary.completedTasks ?? 0, sub: 'Tasks Done' },
              { icon: <FiTarget className="text-primary" />, val: `${stats.focusScore ?? 0}%`, sub: 'Focus Score' },
              { icon: <FiZap className="text-warning" />, val: `${stats.streak || 0} Days`, sub: 'Current Streak' },
            ].map((item, i) => (
              <motion.div key={i} whileHover={{ x: 4 }} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-elevated/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-surface border border-border-subtle flex items-center justify-center shadow-sm">
                  {item.icon}
                </div>
                <div>
                  <p className="text-base font-bold font-mono text-text-primary">{item.val}</p>
                  <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider mt-0.5">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="lg:col-span-9 h-48 relative pt-4 pl-4 border-l border-border-subtle/50">
            {dailyData.length > 1 ? (
              <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="w-full h-full overflow-visible drop-shadow-lg">
                {/* Background grid lines */}
                <line x1="0" y1="15" x2="100" y2="15" stroke="#2D2D3D" strokeWidth="0.5" strokeDasharray="2 2" />
                <line x1="0" y1="35" x2="100" y2="35" stroke="#2D2D3D" strokeWidth="0.5" strokeDasharray="2 2" />
                <line x1="0" y1="55" x2="100" y2="55" stroke="#2D2D3D" strokeWidth="0.5" strokeDasharray="2 2" />
                
                <motion.polyline
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  points={dailyData.slice(-7).map((d, i) =>
                    `${(i / (Math.min(dailyData.length, 7) - 1)) * 100},${60 - (d.minutes / maxMins) * 50}`
                  ).join(' ')}
                  fill="none" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className="drop-shadow-[0_4px_8px_rgba(168,85,247,0.5)]"
                />
                <motion.polyline
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                  points={dailyData.slice(-7).map((d, i) =>
                    `${(i / (Math.min(dailyData.length, 7) - 1)) * 100},${60 - (d.activities / maxActivities) * 50}`
                  ).join(' ')}
                  fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className="drop-shadow-[0_4px_8px_rgba(34,197,94,0.5)]"
                />
                {/* Data points */}
                {dailyData.slice(-7).map((d, i) => (
                  <g key={i}>
                    <circle cx={(i / (Math.min(dailyData.length, 7) - 1)) * 100} cy={60 - (d.minutes / maxMins) * 50} r="1.5" fill="#fff" stroke="#A855F7" strokeWidth="1" />
                    <circle cx={(i / (Math.min(dailyData.length, 7) - 1)) * 100} cy={60 - (d.activities / maxActivities) * 50} r="1.5" fill="#fff" stroke="#22C55E" strokeWidth="1" />
                  </g>
                ))}
              </svg>
            ) : <div className="flex items-center justify-center h-full text-text-muted text-xs">Log more sessions to see trend</div>}
            <div className="flex justify-between text-[10px] text-text-muted font-mono mt-3 px-1">
              {dailyData.slice(-7).map((d, i) => <span key={i}>{d.day}</span>)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
