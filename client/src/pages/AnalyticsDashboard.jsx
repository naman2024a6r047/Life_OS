import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  FiBarChart2, FiClock, FiCheckCircle, FiTarget, FiZap,
  FiFilter, FiCalendar, FiTrendingUp, FiRefreshCw
} from 'react-icons/fi';
import axios from 'axios';

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
    return { key, count: heatmap[key] || 0 };
  });

  const productivityPct = data?.productivityTrend || [];
  const maxProd = Math.max(...productivityPct.map(d => d.pct), 1);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono">
            <FiCalendar size={13} className="text-text-muted" />
            <span>{data?.dateRange?.start} – {data?.dateRange?.end}</span>
          </div>
          <div className="flex rounded-xl border border-border-subtle overflow-hidden">
            {[['week', 'Week'], ['month', 'Month']].map(([val, label]) => (
              <button key={val} onClick={() => handlePeriodChange(val)}
                className={`px-3 py-1.5 text-xs font-semibold transition-all ${period === val ? 'bg-purple text-white' : 'text-text-muted hover:bg-surface-elevated'}`}>
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
          <div key={i} className="card p-3.5 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-${stat.color}/10 text-${stat.color} flex items-center justify-center flex-shrink-0`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-text-muted font-medium truncate">{stat.label}</p>
              <p className="text-lg font-bold font-mono text-text-primary leading-tight">{stat.val}</p>
              <p className={`text-[9px] font-semibold ${stat.subColor}`}>{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Study Time Bar Chart */}
        <div className="lg:col-span-5 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Study Time Overview</h3>
            <span className="text-xs text-text-muted capitalize">{period}</span>
          </div>
          {dailyData.length === 0 || stats.totalMins === 0 ? (
            <div className="h-44 flex items-center justify-center text-text-muted text-xs">No study data for this period</div>
          ) : (
            <>
              <div className="h-44 flex items-end justify-between gap-2 px-1 pt-4 pb-2 border-b border-border-subtle">
                {dailyData.slice(-7).map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                    <div className="absolute bottom-8 hidden group-hover:block bg-surface border border-border-subtle rounded-lg p-1.5 text-[9px] font-mono text-text-primary z-10 whitespace-nowrap shadow-lg">
                      {bar.day}<br /><span className="text-purple font-bold">{fmtMins(bar.minutes)}</span>
                    </div>
                    <div
                      className={`w-full rounded-t-md transition-all ${bar.minutes > 0 ? 'bg-purple hover:bg-purple/80' : 'bg-surface-elevated'}`}
                      style={{ height: `${Math.max(4, (bar.minutes / maxMins) * 100)}%` }}
                    />
                    <span className="text-[8px] text-text-muted font-mono">{bar.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-text-muted">
                {subjectDist.slice(0, 4).map((s, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded" style={{ background: COLORS[i] }} />
                    {s.name.split(' ')[0]}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Time Distribution Donut */}
        <div className="lg:col-span-4 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Time Distribution</h3>
          </div>
          <div className="flex items-center justify-center my-1">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                {subjectDist.length === 0 ? (
                  <circle cx="64" cy="64" r="52" stroke="#1e1e2e" strokeWidth="14" fill="none" />
                ) : (() => {
                  const total = subjectDist.reduce((s, d) => s + d.minutes, 0);
                  const circumference = 2 * Math.PI * 52;
                  let offset = 0;
                  return subjectDist.slice(0, 5).map((s, i) => {
                    const pct = s.minutes / total;
                    const dash = pct * circumference;
                    const el = (
                      <circle key={i} cx="64" cy="64" r="52"
                        stroke={COLORS[i]} strokeWidth="14"
                        strokeDasharray={`${dash} ${circumference - dash}`}
                        strokeDashoffset={-offset} fill="none" />
                    );
                    offset += dash;
                    return el;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-bold font-mono text-text-primary">{fmtMins(stats.totalMins)}</span>
                <span className="text-[9px] text-text-muted">Total</span>
              </div>
            </div>
          </div>
          <div className="space-y-1 text-[10px]">
            {subjectDist.length === 0 ? (
              <p className="text-center text-text-muted">No data</p>
            ) : subjectDist.slice(0, 5).map((s, i) => (
              <div key={i} className="flex justify-between">
                <span style={{ color: COLORS[i] }} className="font-medium">• {s.name}</span>
                <span className="font-mono text-text-primary">{fmtMins(s.minutes)} ({s.pct}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="lg:col-span-3 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Activity Heatmap</h3>
            <span className="text-xs text-text-muted">Last 35 Days</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[8px] text-text-muted font-mono px-1">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {heatmapDays.map((d, i) => (
                <div key={i} title={`${d.key}: ${d.count} activities`}
                  className={`h-4 rounded-[3px] ${d.count >= 5 ? 'bg-green-400' : d.count >= 3 ? 'bg-green-400/70' : d.count >= 1 ? 'bg-green-400/40' : 'bg-surface-elevated'}`} />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between text-[9px] text-text-muted pt-2 border-t border-border-subtle">
            <span>Less</span>
            <div className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-surface-elevated" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-green-400/30" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-green-400/60" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-green-400" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Subject Performance */}
        <div className="lg:col-span-4 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Subject Performance</h3>
          </div>
          <div className="space-y-2.5">
            {subjectDist.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-6">No subject data yet</p>
            ) : subjectDist.map((sb, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-primary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                    {sb.name}
                  </span>
                  <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span className="text-text-muted">{fmtMins(sb.minutes)}</span>
                    <span className="font-bold text-text-primary">{sb.pct}%</span>
                  </div>
                </div>
                <div className="progress-bar h-1.5">
                  <div className="progress-fill" style={{ width: `${sb.pct}%`, background: COLORS[i] }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Focus vs Break */}
        <div className="lg:col-span-3 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Focus Score</h3>
          </div>
          <div className="flex items-center justify-center my-2">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                {(() => {
                  const circumference = 2 * Math.PI * 44;
                  const focusDash = (stats.focusScore / 100) * circumference;
                  return (
                    <>
                      <circle cx="56" cy="56" r="44" stroke="#1e1e2e" strokeWidth="12" fill="none" />
                      <circle cx="56" cy="56" r="44" stroke="#A855F7" strokeWidth="12"
                        strokeDasharray={`${focusDash} ${circumference}`} fill="none" />
                    </>
                  );
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold font-mono text-text-primary">{stats.focusScore ?? 0}%</span>
              </div>
            </div>
          </div>
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between"><span className="text-purple font-medium">• Peak Hours Sessions</span><span className="font-mono text-text-primary">{stats.focusScore ?? 0}%</span></div>
            <div className="flex justify-between"><span className="text-text-muted font-medium">• Off-Peak Sessions</span><span className="font-mono text-text-primary">{100 - (stats.focusScore ?? 0)}%</span></div>
          </div>
        </div>

        {/* Productivity Trend + Top Sessions + Insights */}
        <div className="lg:col-span-5 space-y-4">
          {/* Productivity Trend */}
          <div className="card p-4 space-y-2">
            <div className="section-header">
              <h3 className="section-title">Activity Trend</h3>
            </div>
            <div className="relative h-28">
              {dailyData.length > 0 && maxActivities > 0 ? (
                <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="w-full h-full">
                  <polyline
                    points={dailyData.slice(-7).map((d, i) =>
                      `${(i / (Math.min(dailyData.length, 7) - 1)) * 100},${60 - (d.activities / maxActivities) * 50}`
                    ).join(' ')}
                    fill="none" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <div className="flex items-center justify-center h-full text-text-muted text-xs">No activity data</div>
              )}
            </div>
            <div className="flex justify-between text-[8px] text-text-muted font-mono">
              {dailyData.slice(-7).map((d, i) => <span key={i}>{d.day.split(' ')[0]}</span>)}
            </div>
          </div>

          {/* Top Sessions */}
          <div className="card p-4 space-y-2.5">
            <div className="section-header">
              <h3 className="section-title">Top Study Sessions</h3>
            </div>
            <div className="space-y-2">
              {topSessions.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4">No sessions logged yet</p>
              ) : topSessions.map((ts, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated/40">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center text-xs" style={{ background: COLORS[i] + '22', color: COLORS[i] }}>📚</div>
                    <div>
                      <p className="text-xs font-semibold text-text-primary leading-tight truncate max-w-[140px]">{ts.title}</p>
                      <p className="text-[8px] text-text-muted">{ts.date} · {ts.session_time}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-text-primary flex items-center gap-1">
                    {ts.duration} <FiCheckCircle className="text-green-400" size={12} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="card p-4 space-y-2">
            <div className="section-header">
              <h3 className="section-title">Insights</h3>
            </div>
            <div className="space-y-1.5">
              {insights.length === 0 ? (
                <p className="text-xs text-text-muted">Log study sessions to get personalized insights.</p>
              ) : insights.map((ins, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-text-secondary">
                  <span className="text-xs flex-shrink-0 mt-0.5">{ins.icon}</span>
                  <span>{ins.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="section-title">Summary</h3>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-purple flex items-center gap-1"><span className="w-2 h-0.5 bg-purple inline-block" /> Study (h)</span>
            <span className="text-green-400 flex items-center gap-1"><span className="w-2 h-0.5 bg-green-400 inline-block" /> Activities</span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-3 space-y-3 py-2">
            {[
              { icon: <FiClock className="text-purple" />, val: fmtMins(stats.totalMins || 0), sub: 'Total Study Time' },
              { icon: <FiCheckCircle className="text-green-400" />, val: summary.completedTasks ?? 0, sub: 'Tasks Done' },
              { icon: <FiTarget className="text-green-400" />, val: `${stats.focusScore ?? 0}%`, sub: 'Focus Score' },
              { icon: <FiZap className="text-warning" />, val: `${stats.streak || 0} Days`, sub: 'Current Streak' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                {item.icon}
                <div>
                  <p className="text-base font-bold font-mono text-text-primary">{item.val}</p>
                  <p className="text-[10px] text-text-muted">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-9 h-40 relative pt-2">
            {dailyData.length > 1 ? (
              <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="w-full h-full">
                <polyline
                  points={dailyData.slice(-7).map((d, i) =>
                    `${(i / (Math.min(dailyData.length, 7) - 1)) * 100},${60 - (d.minutes / maxMins) * 50}`
                  ).join(' ')}
                  fill="none" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round"
                />
                <polyline
                  points={dailyData.slice(-7).map((d, i) =>
                    `${(i / (Math.min(dailyData.length, 7) - 1)) * 100},${60 - (d.activities / maxActivities) * 50}`
                  ).join(' ')}
                  fill="none" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round"
                />
              </svg>
            ) : <div className="flex items-center justify-center h-full text-text-muted text-xs">Log more sessions to see trend</div>}
            <div className="flex justify-between text-[9px] text-text-muted font-mono mt-1">
              {dailyData.slice(-7).map((d, i) => <span key={i}>{d.day}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
