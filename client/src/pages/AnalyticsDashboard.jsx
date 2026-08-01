import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  FiBarChart2, FiClock, FiCheckCircle, FiTarget, FiZap,
  FiCalendar, FiTrendingUp, FiRefreshCw
} from 'react-icons/fi';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Bar, RadialBarChart, RadialBar, Legend
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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border-subtle p-3 rounded-xl shadow-xl">
        <p className="text-xs font-bold text-text-primary mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-[11px]">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-text-muted">{entry.name}:</span>
            <span className="font-mono font-bold text-text-primary">
              {entry.name.toLowerCase().includes('time') || entry.name.toLowerCase().includes('minutes') ? fmtMins(entry.value) : entry.value}
            </span>
          </div>
        ))}
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

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-6 space-y-5">
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-mono">
            <FiCalendar size={13} className="text-text-muted" />
            <span>{data?.dateRange?.start} – {data?.dateRange?.end}</span>
          </div>
          <div className="flex rounded-xl border border-border-subtle overflow-hidden">
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
          <div key={i} className="card p-4 flex items-center gap-3 transition-transform hover:-translate-y-1 hover:shadow-lg border-border-subtle bg-surface-elevated/30">
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}/10 text-${stat.color} flex items-center justify-center flex-shrink-0`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider truncate">{stat.label}</p>
              <p className="text-lg font-bold font-mono text-text-primary leading-tight">{stat.val}</p>
              <p className={`text-[9px] font-semibold mt-0.5 ${stat.subColor}`}>{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Weekly Summary Composed Chart */}
        <div className="lg:col-span-8 card p-5 flex flex-col border-border-subtle bg-surface-elevated/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title">Activity & Study Time</h3>
              <p className="text-[10px] text-text-muted">Correlation between tasks and study minutes.</p>
            </div>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D3D" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B8B9E' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B8B9E' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B8B9E' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#8B8B9E', paddingTop: '10px' }} />
                <Bar yAxisId="right" dataKey="activities" name="Activities" fill="#22C55E" radius={[4, 4, 0, 0]} barSize={20} />
                <Area yAxisId="left" type="monotone" dataKey="minutes" name="Study Time (m)" stroke="#A855F7" strokeWidth={3} fillOpacity={1} fill="url(#colorStudy)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time Distribution Donut */}
        <div className="lg:col-span-4 card p-5 flex flex-col border-border-subtle bg-surface-elevated/20">
          <div className="section-header mb-0">
            <h3 className="section-title">Time Distribution</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center min-h-[200px] relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-xl font-bold font-mono text-text-primary">{fmtMins(stats.totalMins)}</span>
              <span className="text-[10px] text-text-muted uppercase tracking-wider">Total Time</span>
            </div>
          </div>
          
          {/* Legend underneath */}
          <div className="w-full mt-3 space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
            {pieData.length === 0 ? (
              <p className="text-center text-text-muted text-xs">No data</p>
            ) : pieData.map((s, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-text-primary truncate max-w-[150px] font-medium">{s.name}</span>
                </div>
                <span className="font-mono font-bold text-text-muted">{fmtMins(s.value)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Activity Heatmap */}
        <div className="lg:col-span-4 card p-5 space-y-4 border-border-subtle bg-surface-elevated/20">
          <div className="section-header">
            <h3 className="section-title">Consistency Heatmap</h3>
            <span className="text-[10px] text-text-muted">Last 35 Days</span>
          </div>
          
          <div>
            <div className="flex justify-between text-[9px] text-text-muted font-mono px-1 mb-2">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 flex-1">
              {heatmapDays.map((d, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                  className="relative group cursor-pointer"
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-surface border border-border-subtle rounded p-1.5 text-[10px] font-mono text-text-primary z-20 whitespace-nowrap shadow-xl">
                    {d.label}<br /><span className="text-success font-bold">{d.count} activities</span>
                  </div>
                  <div className={`w-full aspect-square rounded-[3px] transition-colors duration-300 ${
                    d.count >= 5 ? 'bg-success shadow-glow-success' : 
                    d.count >= 3 ? 'bg-success/70' : 
                    d.count >= 1 ? 'bg-success/40' : 'bg-surface-elevated'
                  }`} />
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-1.5 text-[9px] text-text-muted pt-3 border-t border-border-subtle/50">
            <span>Less</span>
            <div className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-surface-elevated" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-success/40" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-success/70" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-success shadow-glow-success" />
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Focus Score Radial */}
        <div className="lg:col-span-4 card p-5 space-y-4 border-border-subtle bg-surface-elevated/20 flex flex-col">
          <div className="section-header mb-0">
            <h3 className="section-title">Focus Intensity</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center relative min-h-[180px]">
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart 
                cx="50%" cy="50%" 
                innerRadius="70%" outerRadius="100%" 
                barSize={14} data={focusData} 
                startAngle={90} endAngle={-270}
              >
                <RadialBar minAngle={15} background={{ fill: 'transparent' }} clockWise dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black font-mono text-primary drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">{focusScore}%</span>
              <span className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Peak Focus</span>
            </div>
          </div>
          <div className="space-y-2 text-xs w-full mt-2">
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-surface-elevated/50 border border-border-subtle/30">
              <span className="text-primary font-medium flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary shadow-glow-primary" /> Peak Sessions</span>
              <span className="font-mono text-text-primary font-bold">{focusScore}%</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-surface-elevated/50 border border-border-subtle/30">
              <span className="text-text-muted font-medium flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-surface-elevated border border-border-subtle" /> Off-Peak</span>
              <span className="font-mono text-text-primary font-bold">{100 - focusScore}%</span>
            </div>
          </div>
        </div>

        {/* Top Sessions & Insights */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="card p-5 border-border-subtle bg-surface-elevated/20 flex-1">
            <div className="section-header">
              <h3 className="section-title">Top Sessions</h3>
            </div>
            <div className="space-y-2 mt-2">
              {topSessions.length === 0 ? (
                <p className="text-[10px] text-text-muted text-center py-4">No sessions logged yet</p>
              ) : topSessions.slice(0,3).map((ts, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated border border-border-subtle/50 transition-colors hover:border-primary/30">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-inner" style={{ background: COLORS[i] + '15', color: COLORS[i] }}>📚</div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-text-primary truncate max-w-[140px]">{ts.title}</p>
                      <p className="text-[10px] text-text-muted font-mono mt-0.5">{ts.date}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-success flex items-center gap-1.5 bg-success/10 px-2.5 py-1 rounded-md border border-success/20">
                    {ts.duration} <FiCheckCircle size={12} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {insights.length > 0 && (
            <div className="card p-4 border-border-subtle bg-primary/5 border-primary/20">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5"><FiZap /> Smart Insights</h3>
              <div className="space-y-2.5">
                {insights.slice(0,2).map((ins, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[11px] text-text-primary leading-relaxed">
                    <span className="text-primary mt-0.5">{ins.icon}</span>
                    <span>{ins.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
