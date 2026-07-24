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
      <p className="text-[10px] text-text-muted mt-1.5">Life Score: {partner.lifeScore || 82}</p>
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

function ActivityCalendar() {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const calendarWeeks = useMemo(() => {
    const weeks = [];
    for (let w = 0; w < 5; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const dayNum = w * 7 + d + 1;
        if (dayNum > 31) {
          days.push({ num: dayNum - 31, status: 'future' });
        } else {
          const rand = Math.random();
          let status = 'future';
          if (dayNum < new Date().getDate()) {
            if (rand > 0.7) status = 'completed';
            else if (rand > 0.5) status = 'missed';
            else status = 'pending';
          } else if (dayNum === new Date().getDate()) {
            status = 'today';
          }
          days.push({ num: dayNum, status });
        }
      }
      weeks.push(days);
    }
    return weeks;
  }, []);

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
            <div key={di} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-medium ${statusColors[day.status]}`}>
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

export default function Friends() {
  const { user } = useContext(AuthContext);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(2);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const [friendsRes, unreadRes] = await Promise.allSettled([
          axios.get('/api/friends'),
          axios.get('/api/friends/interventions/unread-count'),
        ]);
        
        let friendsList = [];
        if (friendsRes.status === 'fulfilled') {
          friendsList = friendsRes.value.data || [];
        }
        
        // Ensure we always have demo partners to display
        if (friendsList.length === 0) {
          friendsList = [
            { id: 'p1', username: 'Arjun Verma', level: 5, xp: 2400, current_streak: 28, isOnline: true, lifeScore: 82 },
            { id: 'p2', username: 'Priya Sharma', level: 4, xp: 1850, current_streak: 14, isOnline: true, lifeScore: 75 },
            { id: 'p3', username: 'Rohit Singh', level: 3, xp: 1200, current_streak: 7, isOnline: false, lifeScore: 68 },
            { id: 'p4', username: 'Ananya Patel', level: 3, xp: 1100, current_streak: 5, isOnline: false, lifeScore: 71 },
          ];
        }
        
        setFriends(friendsList);
        if (friendsList.length > 0) setSelectedId(friendsList[0].id);
        if (unreadRes.status === 'fulfilled') setUnreadCount(unreadRes.value.data?.count || 2);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, []);

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FiUsers size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Accountability</h1>
            <p className="text-xs text-text-muted">Stay accountable. Stay consistent. Grow together.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
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
          <button className="btn-primary flex items-center gap-2">
            <FiPlus size={16} /> Add Accountability Partner
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1">
        {tabs.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text-primary'
            }`}>
            {tab.label}
            {tab.badge > 0 && (
              <span className="w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left — Partner List */}
        <div className="col-span-3 space-y-3">
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
            <button className="w-full mt-3 py-2.5 rounded-lg border border-dashed border-border-hover text-text-muted hover:text-primary-light hover:border-primary/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all">
              <FiPlus size={14} /> Add New Partner
            </button>
          </div>

          {/* How it works */}
          <div className="card p-4">
            <h3 className="text-xs font-bold text-text-primary mb-2">How it works?</h3>
            <div className="space-y-1.5">
              {[
                'Add someone you trust',
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
        <div className="col-span-5 space-y-4">
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
                    <button className="btn-outline text-xs">View Profile</button>
                    <button className="btn-primary text-xs flex items-center gap-1">
                      <FiMessageSquare size={12} /> Message
                    </button>
                  </div>
                </div>

                {/* Partner Stats Row */}
                <div className="grid grid-cols-5 gap-3 mt-5">
                  {[
                    { icon: <FiStar size={14} />, label: 'Life Score', value: selectedPartner.lifeScore || 82, sub: '/100', color: 'warning' },
                    { icon: <FiTarget size={14} />, label: 'Goals Completed', value: 12, sub: 'This Month', color: 'primary' },
                    { icon: <FiCheckCircle size={14} />, label: 'Tasks Completed', value: 75, sub: 'This Month', color: 'success' },
                    { icon: <FiZap size={14} />, label: 'Current Streak', value: selectedPartner.current_streak || 28, sub: 'Days', color: 'warning' },
                    { icon: <FiHeart size={14} />, label: 'Grace Tokens', value: 2, sub: 'Available', color: 'success' },
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

              {/* Progress Overview */}
              <div className="card p-4">
                <div className="section-header">
                  <h3 className="section-title">Progress Overview</h3>
                  <button className="section-link">View All Milestones</button>
                </div>
                <p className="text-[10px] text-text-muted mb-3">Milestone Progress (This Week)</p>
                <div className="grid grid-cols-4 gap-3">
                  <ProgressBar label="Full Stack Dev" current={6} total={10} color="primary" />
                  <ProgressBar label="Gym Consistency" current={7} total={10} color="success" />
                  <ProgressBar label="DSA Practice" current={5} total={10} color="info" />
                  <ProgressBar label="Study 6 Hrs Daily" current={8} total={10} color="warning" />
                </div>
              </div>

              {/* Activity Calendar */}
              <div className="card p-4">
                <div className="section-header">
                  <h3 className="section-title">Activity Calendar</h3>
                </div>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-7">
                    <ActivityCalendar />
                  </div>
                  <div className="col-span-5 space-y-3">
                    <h4 className="text-xs font-bold text-text-primary">This Week Summary</h4>
                    <div className="space-y-2">
                      {[
                        { icon: '🟢', label: 'Tasks Completed', value: '6 / 10' },
                        { icon: '🔴', label: 'Tasks Missed', value: '1' },
                        { icon: '🟡', label: 'Pending', value: '3' },
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
                        <span className="text-xs font-bold font-mono text-primary">60%</span>
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
        <div className="col-span-4 space-y-4">
          {/* Pending Inquiries */}
          <div className="card p-4">
            <div className="section-header">
              <div className="flex items-center gap-2">
                <h3 className="section-title">Pending Inquiries</h3>
                <span className="w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">2</span>
              </div>
              <span className="section-link">View All</span>
            </div>
            {[
              { name: 'Priya Sharma', task: 'Day 7', milestone: 'DSA Practice', time: '2h ago' },
              { name: 'Rohit Singh', task: 'Day 5', milestone: 'Gym Consistency', time: '1d ago' },
            ].map((inq, i) => (
              <div key={i} className="py-3 border-b border-border-subtle last:border-0">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/60 to-purple/60 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {inq.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] text-text-secondary">
                      <span className="font-semibold text-text-primary">{inq.name}</span> asked you
                    </p>
                    <p className="text-[11px] text-warning mt-0.5">
                      Why did you skip your task on <span className="font-bold">{inq.task}</span> of "{inq.milestone}"?
                    </p>
                    <p className="text-[9px] text-text-muted mt-1">{inq.time}</p>
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
            {[
              { type: 'Milestone Reset', by: 'Arjun', goal: '100 Days of Code', reason: 'Inactivity for 3 consecutive days', time: '2 days ago', icon: '⚡' },
              { type: 'XP Deduction', by: null, amount: '-100 XP', reason: 'Missed inquiry response', time: '5 days ago', icon: '💀' },
            ].map((pun, i) => (
              <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-border-subtle last:border-0">
                <span className="text-sm flex-shrink-0">{pun.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[11px] font-semibold text-text-primary">{pun.type}</p>
                    {pun.by && <span className="text-[9px] text-danger">Forced by {pun.by}</span>}
                  </div>
                  {pun.goal && <p className="text-[10px] text-text-muted">Goal: {pun.goal}</p>}
                  <p className="text-[10px] text-text-muted">Reason: {pun.reason}</p>
                  <p className="text-[9px] text-text-muted">{pun.time}</p>
                </div>
                {pun.amount && <span className="text-xs font-bold font-mono text-danger">{pun.amount}</span>}
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="card p-4">
            <div className="section-header">
              <h3 className="section-title">Recent Activity</h3>
              <span className="section-link">View All</span>
            </div>
            {[
              { icon: '🟢', text: 'Arjun completed Day 8 of "Full Stack Dev"', time: '3h ago' },
              { icon: '🔴', text: 'Arjun missed Day 6 of "Study 6 Hrs Daily"', time: '1d ago' },
              { icon: '🟡', text: 'You inquired Priya about skipped task', time: '2d ago' },
              { icon: '⚡', text: 'Rohit reset your milestone "DSA Practice"', time: '3d ago' },
            ].map((act, i) => (
              <div key={i} className="flex items-start gap-2.5 py-2 border-b border-border-subtle last:border-0">
                <span className="text-xs flex-shrink-0 mt-0.5">{act.icon}</span>
                <div className="flex-1">
                  <p className="text-[11px] text-text-secondary">{act.text}</p>
                  <p className="text-[9px] text-text-muted">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
