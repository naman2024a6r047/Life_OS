import React, { useContext, useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUsers, FiPlus, FiSearch, FiStar, FiTarget, FiCheckCircle,
  FiZap, FiHeart, FiArrowRight, FiMessageSquare, FiEye, FiAlertTriangle,
  FiActivity, FiShield
} from 'react-icons/fi';
import axios from 'axios';

function PartnerCard({ partner, isSelected, onClick }) {
  return (
    <div onClick={onClick}
      className={`card-hover p-3 cursor-pointer ${isSelected ? 'border-primary bg-primary/5' : ''}`}>
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/60 to-purple/60 flex items-center justify-center text-white text-xs font-bold">
            {(partner.username || 'P')[0].toUpperCase()}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface ${
            partner.isOnline !== false ? 'bg-success' : 'bg-text-muted'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-bold text-text-primary truncate">{partner.username}</p>
            <span className="badge-primary text-[8px] px-1.5 py-0">⭐ Partner</span>
          </div>
          <p className="text-[10px] text-text-muted flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${partner.isOnline !== false ? 'bg-success' : 'bg-text-muted'}`} />
            {partner.isOnline !== false ? 'Online' : 'Away'}
          </p>
        </div>
      </div>
      <p className="text-[10px] text-text-muted mt-1.5">Life Score: {partner.discipline_score || 0}</p>
    </div>
  );
}

function ProgressBar({ label, current, total, color = 'primary' }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-text-primary font-medium">{label}</span>
      </div>
      <div className="progress-bar">
        <div className={`progress-fill bg-${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[9px] text-text-muted mt-0.5">Day {current} / {total}</p>
    </div>
  );
}

function ActivityCalendar({ telemetry }) {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const calendarWeeks = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const todayStr = now.toISOString().split('T')[0];
    
    const dateStatusMap = {};
    if (telemetry) {
        (telemetry.skippedTasks || []).forEach(t => {
            if (t.date) dateStatusMap[t.date.split('T')[0]] = 'missed';
        });
        (telemetry.activityLogs || []).forEach(log => {
            if (log.action_type === 'milestone_completed' || log.action_type === 'daily_task_completed' || log.action_type === 'level_up') {
                const dateStr = new Date(log.createdAt).toISOString().split('T')[0];
                if (!dateStatusMap[dateStr] || dateStatusMap[dateStr] === 'missed') {
                    dateStatusMap[dateStr] = 'completed'; 
                }
            }
        });
    }

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;
    
    const weeks = [];
    let currentWeek = [];
    
    for (let i = 0; i < startDayOfWeek; i++) {
        const prevMonthDay = new Date(year, month, -startDayOfWeek + i + 1);
        currentWeek.push({ num: prevMonthDay.getDate(), status: 'future', disabled: true });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        const dateStr = d.toISOString().split('T')[0];
        
        let status = 'future';
        if (dateStr === todayStr) {
            status = 'today';
        } else if (dateStr < todayStr) {
            status = dateStatusMap[dateStr] || 'pending';
        }
        
        currentWeek.push({ num: i, status, disabled: false });
        
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }
    
    if (currentWeek.length > 0) {
        let nextMonthDay = 1;
        while (currentWeek.length < 7) {
            currentWeek.push({ num: nextMonthDay++, status: 'future', disabled: true });
        }
        weeks.push(currentWeek);
    }
    
    while (weeks.length < 5) {
        let nextMonthDay = currentWeek.length > 0 ? currentWeek[currentWeek.length - 1].num + 1 : 1;
        if (weeks.length > 0 && weeks[weeks.length-1][6].disabled) nextMonthDay = weeks[weeks.length-1][6].num + 1;
        const extraWeek = [];
        for(let i=0; i<7; i++) {
            extraWeek.push({ num: nextMonthDay++, status: 'future', disabled: true });
        }
        weeks.push(extraWeek);
    }
    
    return weeks.slice(0, 5);
  }, [telemetry]);

  const statusColors = {
    completed: 'bg-success text-white',
    missed: 'bg-danger text-white',
    pending: 'bg-warning/20 text-warning',
    today: 'bg-primary text-white ring-2 ring-primary/30',
    future: 'bg-transparent text-text-muted',
  };

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(d => (
          <div key={d} className="text-center text-[9px] text-text-muted font-medium">{d}</div>
        ))}
      </div>
      {/* Grid */}
      {calendarWeeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
          {week.map((day, di) => (
            <div key={di} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-medium ${statusColors[day.status]} ${day.disabled ? 'opacity-30' : ''}`}>
              {day.num}
            </div>
          ))}
        </div>
      ))}
      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        {[
          { color: 'bg-success', label: 'Completed' },
          { color: 'bg-danger', label: 'Missed' },
          { color: 'bg-warning/40', label: 'Pending' },
        ].map((l, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
            <span className="text-[9px] text-text-muted">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddPartnerModal({ isOpen, onClose, friends }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) { setQuery(''); setResults([]); return; }
    handleSearch('');
  }, [isOpen]);

  const handleSearch = async (q) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/friends/search?q=${q}`);
      const existingIds = new Set(friends.map(f => f.id));
      setResults(res.data.filter(u => !existingIds.has(u.id)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (id) => {
    try {
      await axios.post('/api/friends/request', { friend_id: id });
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Error sending request');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md p-5 border border-border-subtle shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-text-primary">Add New Partner</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-xl">&times;</button>
        </div>
        <div className="relative mb-4">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
          <input type="text" placeholder="Search username..." value={query}
            onChange={e => { setQuery(e.target.value); handleSearch(e.target.value); }}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-elevated text-sm text-text-primary placeholder-text-muted border border-border-subtle focus:border-primary focus:outline-none" />
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {loading ? <p className="text-xs text-text-muted text-center py-4">Searching...</p> :
           results.length === 0 ? <p className="text-xs text-text-muted text-center py-4">No users found</p> :
           results.map(u => (
            <div key={u.id} className="flex items-center justify-between p-3 bg-surface-elevated rounded-xl border border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                  {(u.username || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">{u.username}</p>
                  <p className="text-[10px] text-text-muted">Level {u.level || 1}</p>
                </div>
              </div>
              <button 
                disabled={u.relationshipStatus === 'pending' || u.relationshipStatus === 'accepted'}
                onClick={() => sendRequest(u.id)} 
                className={`text-[10px] px-3 py-1.5 rounded-lg font-bold transition-all ${u.relationshipStatus === 'pending' || u.relationshipStatus === 'accepted' ? 'bg-surface border border-border-subtle text-text-muted' : 'btn-primary'}`}>
                {u.relationshipStatus === 'pending' ? 'Pending' : u.relationshipStatus === 'accepted' ? 'Added' : 'Add Partner'}
              </button>
            </div>
           ))}
        </div>
      </div>
    </div>
  );
}

export default function Friends() {
  const { user } = useContext(AuthContext);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [feed, setFeed] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [telemetry, setTelemetry] = useState(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const [friendsRes, unreadRes, feedRes, interventionsRes] = await Promise.allSettled([
          axios.get('/api/friends'),
          axios.get('/api/friends/interventions/unread-count'),
          axios.get('/api/friends/feed'),
          axios.get('/api/friends/interventions')
        ]);
        
        let friendsList = [];
        if (friendsRes.status === 'fulfilled') {
          friendsList = friendsRes.value.data || [];
        }
        
        setFriends(friendsList);
        if (friendsList.length > 0) setSelectedId(friendsList[0].id);
        
        if (unreadRes.status === 'fulfilled') setUnreadCount(unreadRes.value.data?.count || 0);
        if (feedRes.status === 'fulfilled') setFeed(feedRes.value.data || []);
        if (interventionsRes.status === 'fulfilled') setInterventions(interventionsRes.value.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const fetchTelemetry = async () => {
      try {
        const res = await axios.get(`/api/friends/telemetry/${selectedId}`);
        setTelemetry(res.data);
      } catch (err) {
        console.error(err);
        setTelemetry(null);
      }
    };
    fetchTelemetry();
  }, [selectedId]);

  const selectedPartner = friends.find(f => f.id === selectedId) || friends[0];
  const streak = user?.current_streak || 0;
  const totalXP = (user?.xp || 0) + ((user?.level || 1) - 1) * 100;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'partners', label: 'My Partners' },
    { id: 'inquiries', label: 'Inquiries', badge: unreadCount },
    { id: 'violations', label: 'Violations' },
    { id: 'shame', label: 'Wall of Shame' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FiUsers size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Accountability</h1>
            <p className="text-xs text-text-muted">Stay accountable. Stay consistent. Grow together.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🔥</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">{streak}</p>
              <p className="text-[9px] text-text-muted">Day Streak</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">⭐</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">{totalXP}</p>
              <p className="text-[9px] text-text-muted">Total XP</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🛡️</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">Level {user?.level || 1}</p>
              <p className="text-[9px] text-text-muted">Pro Builder</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">💚</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">3</p>
              <p className="text-[9px] text-text-muted">Grace Tokens</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border-subtle overflow-x-auto whitespace-nowrap scrollbar-hide min-w-0">
        {tabs.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-semibold transition-colors relative flex items-center gap-2 ${
              activeTab === tab.id ? 'text-primary' : 'text-text-muted hover:text-text-primary'
            }`}>
            {tab.label}
            {tab.badge > 0 && (
              <span className="w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">{tab.badge}</span>
            )}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
          </button>
        ))}
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left — Partner List */}
        <div className="lg:col-span-3 space-y-3">
          <div className="card p-4">
            <h3 className="text-xs font-bold text-text-primary mb-3">My Partners ({friends.length})</h3>
            <div className="relative mb-3">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
              <input type="text" placeholder="Search partners..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-elevated text-sm text-text-primary placeholder-text-muted border border-border-subtle focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div className="space-y-2">
              {friends.filter(f => !searchQuery || (f.username || '').toLowerCase().includes(searchQuery.toLowerCase())).map(partner => (
                <PartnerCard key={partner.id} partner={partner} isSelected={partner.id === selectedId}
                  onClick={() => setSelectedId(partner.id)} />
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="card p-4">
            <h3 className="text-xs font-bold text-text-primary mb-2">How it works?</h3>
            <div className="space-y-1.5">
              {[
                'Find a partner in the network',
                "Monitor each other's progress",
                'Ask inquiries for skipped tasks',
                'Impose reset as punishment',
                'Grow with discipline & trust',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-text-secondary">
                  <span className="text-text-muted font-mono w-4">{i + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <button className="text-xs text-primary-light hover:text-primary font-semibold mt-3 flex items-center gap-1 transition-colors">
              Learn more <FiArrowRight size={12} />
            </button>
          </div>

          {/* Life Score */}
          <div className="card p-4">
            <p className="text-[10px] text-text-muted mb-1">Life Score</p>
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" stroke="#1C2039" strokeWidth="5" fill="none" />
                  <circle cx="32" cy="32" r="26" stroke="#6366F1" strokeWidth="5" fill="none"
                    strokeDasharray={`${2 * Math.PI * 26}`} 
                    strokeDashoffset={`${2 * Math.PI * 26 * (1 - 0.78)}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-extrabold font-mono text-text-primary">78</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-text-muted">/100</p>
                <p className="text-[10px] text-success font-medium">Keep improving!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Center — Selected Partner Detail */}
        <div className="lg:col-span-5 space-y-4">
          {selectedPartner ? (
            <>
              {/* Partner Profile Card */}
              <div className="card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple flex items-center justify-center text-white text-xl font-bold">
                        {(selectedPartner.username || 'P')[0].toUpperCase()}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-surface bg-success" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-text-primary">{selectedPartner.username}</h2>
                      <p className="text-[11px] text-success flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-success" /> Online
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5">Accountability Partner since {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p className="text-[10px] text-primary-light italic mt-1">"Discipline is the bridge between goals and achievements."</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/friends/${selectedPartner.id}`} className="btn-outline text-xs inline-flex items-center justify-center">View Profile</Link>
                    <Link to={`/friends/${selectedPartner.id}`} state={{ tab: 'chat' }} className="btn-primary text-xs flex items-center gap-1">
                      <FiMessageSquare size={12} /> Message
                    </Link>
                  </div>
                </div>

                {/* Partner Stats Row */}
                <div className="grid grid-cols-5 gap-3 mt-5">
                  {[
                    { icon: <FiStar size={14} />, label: 'Life Score', value: selectedPartner.discipline_score || 0, sub: '/100', color: 'warning' },
                    { icon: <FiTarget size={14} />, label: 'Active Goals', value: telemetry?.stats?.activeChallengesCount || 0, sub: 'Right Now', color: 'primary' },
                    { icon: <FiCheckCircle size={14} />, label: 'Tasks Completed', value: telemetry?.stats?.completedTasksCount || 0, sub: 'Total', color: 'success' },
                    { icon: <FiZap size={14} />, label: 'Current Streak', value: selectedPartner.current_streak || 0, sub: 'Days', color: 'warning' },
                    { icon: <FiHeart size={14} />, label: 'Skipped Tasks', value: telemetry?.stats?.skippedTasksCount || 0, sub: 'Total', color: 'danger' },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className={`w-8 h-8 rounded-lg bg-${stat.color}/10 text-${stat.color} flex items-center justify-center mx-auto mb-1`}>
                        {stat.icon}
                      </div>
                      <p className="text-[10px] text-text-muted">{stat.label}</p>
                      <p className="text-lg font-bold font-mono text-text-primary">{stat.value}</p>
                      <p className="text-[9px] text-text-muted">{stat.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deep Analytics & Progress Overview */}
              <div className="card p-4">
                <div className="section-header">
                  <h3 className="section-title">Deep Analytics & Progress Overview</h3>
                </div>
                <p className="text-[10px] text-text-muted mb-4">Detailed milestone tracking & penalty analytics</p>
                <div className="space-y-4">
                  {(telemetry?.challenges || []).filter(c => c.status === 'active' || c.status === 'unlocked').map((c) => {
                    return (
                        <div key={c.id} className="p-3 bg-surface-elevated/40 rounded-xl border border-border-subtle">
                            <h4 className="text-xs font-bold text-text-primary mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary" /> {c.title}
                            </h4>
                            <div className="space-y-3">
                                {c.milestones?.filter(m => m.status === 'unlocked' || m.status === 'rejected' || m.status === 'pending_review' || m.status === 'completed').map(milestone => {
                                    const milestoneTasks = milestone.tasks || [];
                                    const totalMTasks = milestoneTasks.length;
                                    const completedMTasks = milestoneTasks.filter(t => t.completed || t.is_completed).length;
                                    const pendingMTasks = totalMTasks - completedMTasks;
                                    
                                    // Tasks that are missed (past date and not completed)
                                    const missedMTasks = milestoneTasks.filter(t => {
                                        const isCompleted = t.completed || t.is_completed;
                                        return !isCompleted && t.date && new Date(t.date).toISOString().split('T')[0] < new Date().toISOString().split('T')[0];
                                    }).length;
                                    
                                    // Deep Penalty Mapping
                                    const milestonePenalties = (telemetry?.penalties || []).filter(p => {
                                        if (p.challenge_id !== c.id) return false;
                                        return milestoneTasks.some(t => {
                                            const isCompleted = t.completed || t.is_completed;
                                            return !isCompleted && t.date && new Date(t.date).toISOString().split('T')[0] < new Date().toISOString().split('T')[0] && p.description?.includes(t.date);
                                        });
                                    });

                                    return (
                                        <div key={milestone.id} className="bg-surface p-3 rounded-lg border border-border-subtle">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[11px] font-bold text-text-secondary">{milestone.title}</span>
                                                <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                                                    milestone.status === 'completed' ? 'bg-success/20 text-success' :
                                                    milestone.status === 'rejected' ? 'bg-danger/20 text-danger' :
                                                    milestone.status === 'pending_review' ? 'bg-warning/20 text-warning' :
                                                    'bg-primary/20 text-primary-light'
                                                }`}>
                                                    {milestone.status}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-4 gap-2 mb-2">
                                                <div className="bg-surface-elevated rounded p-2 text-center">
                                                    <div className="text-sm font-black text-white">{pendingMTasks}</div>
                                                    <div className="text-[8px] text-text-muted uppercase font-bold">Pending</div>
                                                </div>
                                                <div className="bg-success/10 rounded p-2 text-center">
                                                    <div className="text-sm font-black text-success">{completedMTasks}</div>
                                                    <div className="text-[8px] text-success uppercase font-bold">Done</div>
                                                </div>
                                                <div className="bg-danger/10 rounded p-2 text-center">
                                                    <div className="text-sm font-black text-danger">{missedMTasks}</div>
                                                    <div className="text-[8px] text-danger uppercase font-bold">Missed</div>
                                                </div>
                                                <div className="bg-warning/10 rounded p-2 text-center">
                                                    <div className="text-sm font-black text-warning">{milestonePenalties.length}</div>
                                                    <div className="text-[8px] text-warning uppercase font-bold">Penalties</div>
                                                </div>
                                            </div>
                                            
                                            {milestonePenalties.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-border-subtle space-y-1">
                                                    <div className="text-[9px] font-bold text-text-muted mb-1">PENALTY DETAILS:</div>
                                                    {milestonePenalties.map(p => (
                                                        <div key={p.id} className="text-[10px] text-danger flex justify-between bg-danger/5 px-2 py-1 rounded">
                                                            <span>⚠️ {p.penalty_type}</span>
                                                            <span className="font-mono">-{p.xp_deducted} XP</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                  })}
                  {(!telemetry?.challenges || telemetry.challenges.length === 0) && (
                    <p className="text-[10px] text-text-muted">No active challenges.</p>
                  )}
                </div>
              </div>

              {/* Activity Calendar */}
              <div className="card p-4">
                <div className="section-header">
                  <h3 className="section-title">Activity Calendar</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-7">
                    <ActivityCalendar telemetry={telemetry} />
                  </div>
                  <div className="lg:col-span-5 space-y-3">
                    <h4 className="text-xs font-bold text-text-primary">This Week Summary</h4>
                    <div className="space-y-2">
                      {[
                        { icon: '🟢', label: 'Tasks Completed', value: telemetry?.stats?.completedWeekCount || 0 },
                        { icon: '🔴', label: 'Tasks Missed', value: telemetry?.stats?.skippedTasksCount || 0 },
                        { icon: '🟡', label: 'Pending', value: telemetry?.stats?.activeChallengesCount || 0 },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{item.icon}</span>
                            <span className="text-[11px] text-text-secondary">{item.label}</span>
                          </div>
                          <span className="text-xs font-bold font-mono text-text-primary">{item.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-border-subtle">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-text-secondary">Completion Rate</span>
                        <span className="text-xs font-bold font-mono text-primary">{telemetry?.stats?.completionRate || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card p-12 text-center">
              <FiUsers size={48} className="text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-bold text-text-primary">No Partners Yet</h3>
              <p className="text-sm text-text-muted mt-1">Add an accountability partner to get started.</p>
            </div>
          )}
        </div>

        {/* Right — Inquiries & Activity */}
        <div className="lg:col-span-4 space-y-4">
          {/* Pending Inquiries */}
          <div className="card p-4">
            <div className="section-header">
              <div className="flex items-center gap-2">
                <h3 className="section-title">Pending Inquiries</h3>
                {interventions.filter(i => i.type === 'inquiry' && i.status === 'pending' && i.direction === 'received').length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
                      {interventions.filter(i => i.type === 'inquiry' && i.status === 'pending' && i.direction === 'received').length}
                    </span>
                )}
              </div>
              <span className="section-link">View All</span>
            </div>
            {interventions.filter(i => i.type === 'inquiry' && i.status === 'pending' && i.direction === 'received').length === 0 && (
                <p className="text-[10px] text-text-muted py-2">No pending inquiries.</p>
            )}
            {interventions.filter(i => i.type === 'inquiry' && i.status === 'pending' && i.direction === 'received').map((inq, i) => (
              <div key={inq.id} className="py-3 border-b border-border-subtle last:border-0">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/60 to-purple/60 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {(inq.sender?.username || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] text-text-secondary">
                      <span className="font-semibold text-text-primary">{inq.sender?.username || 'User'}</span> asked you
                    </p>
                    <p className="text-[11px] text-warning mt-0.5">
                      {inq.message || `Why did you skip your task on "${inq.item_title}"?`}
                    </p>
                    <p className="text-[9px] text-text-muted mt-1">{new Date(inq.createdAt).toLocaleDateString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button className="btn-primary text-[10px] px-3 py-1">Respond</button>
                      <button className="btn-outline text-[10px] px-3 py-1">View</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Punishments */}
          <div className="card p-4">
            <div className="section-header">
              <h3 className="section-title">Recent Punishments</h3>
              <span className="section-link">View All</span>
            </div>
            {interventions.filter(i => i.type === 'punishment').length === 0 && (
                <p className="text-[10px] text-text-muted py-2">No recent punishments.</p>
            )}
            {interventions.filter(i => i.type === 'punishment').map((pun, i) => (
              <div key={pun.id} className="flex items-start gap-2.5 py-2.5 border-b border-border-subtle last:border-0">
                <span className="text-sm flex-shrink-0">⚡</span>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[11px] font-semibold text-text-primary">Milestone Reset</p>
                    {pun.sender && <span className="text-[9px] text-danger">Forced by {pun.sender.username}</span>}
                  </div>
                  <p className="text-[10px] text-text-muted">Goal: {pun.item_title}</p>
                  <p className="text-[10px] text-text-muted">Reason: {pun.punishment || pun.message}</p>
                  <p className="text-[9px] text-text-muted">{new Date(pun.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="card p-4">
            <div className="section-header">
              <h3 className="section-title">Recent Activity</h3>
              <span className="section-link">View All</span>
            </div>
            {feed.length === 0 && (
                <p className="text-[10px] text-text-muted py-2">No recent activity.</p>
            )}
            {feed.map((act, i) => (
              <div key={act.id} className="flex items-start gap-2.5 py-2 border-b border-border-subtle last:border-0">
                <span className="text-xs flex-shrink-0 mt-0.5">🟢</span>
                <div className="flex-1">
                  <p className="text-[11px] text-text-secondary">{act.User?.username || 'A partner'} {act.action || act.type || 'completed an activity'}</p>
                  <p className="text-[9px] text-text-muted">{new Date(act.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AddPartnerModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} friends={friends} />
    </div>
  );
}
