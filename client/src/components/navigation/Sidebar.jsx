import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  FiHome, FiTarget, FiUsers, FiCheckSquare, FiShield,
  FiActivity, FiTerminal, FiBookOpen, FiBarChart2,
  FiCalendar, FiDatabase, FiAlertTriangle, FiSettings, FiLogOut, FiZap
} from 'react-icons/fi';

const navItems = [
  { path: '/', label: 'Dashboard', icon: FiHome },
  { path: '/challenges', label: 'Goals & Challenges', icon: FiTarget },
  { path: '/friends', label: 'Accountability', icon: FiUsers },
  { path: '/reviews', label: 'Peer Review', icon: FiCheckSquare },
  { path: '/exams', label: 'Exam Mode', icon: FiShield },
  { path: '/gym', label: 'Gym & Fitness', icon: FiActivity },
  { path: '/dev', label: 'Developer Profile', icon: FiTerminal },
  { path: '/knowledge', label: 'Study Tracker', icon: FiBookOpen },
  { path: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { path: '/notifications', label: 'Penalty System', icon: FiAlertTriangle },
  { path: '/calendar', label: 'Calendar', icon: FiCalendar },
  { path: '/ai-coach', label: 'Resources', icon: FiDatabase },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const xpForLevel = (user?.level || 1) * 100;
  const xpCurrent = user?.xp || 0;
  const xpProgress = Math.min(100, Math.round((xpCurrent / xpForLevel) * 100));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      
      <aside className={`w-[240px] min-w-[240px] h-screen bg-surface border-r border-border-subtle flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      {/* Branding */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-purple flex items-center justify-center">
            <FiZap className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-text-primary tracking-tight">LifeOS</h1>
            <p className="text-[10px] text-text-muted font-medium">Your Life. Your System.</p>
          </div>
        </div>
      </div>

      {/* User Card */}
      <div className="px-4 py-3 mx-3 mb-2 rounded-lg bg-surface-elevated">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple flex items-center justify-center text-white text-xs font-bold">
            {(user?.username || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{user?.username || 'User'}</p>
            <div className="flex items-center gap-1">
              <span className="badge-primary text-[9px] px-1.5 py-0">Lv. {user?.level || 1}</span>
              <span className="text-[10px] text-text-muted">• Pro Builder</span>
            </div>
          </div>
        </div>
        {/* XP Bar */}
        <div className="mt-2">
          <div className="progress-bar h-1">
            <div className="progress-fill bg-primary" style={{ width: `${xpProgress}%` }} />
          </div>
          <p className="text-[10px] text-text-muted mt-1 font-mono">{xpCurrent} / {xpForLevel} XP</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-1 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path}>
              <div className={`sidebar-item ${isActive ? 'active' : ''}`}>
                <Icon size={16} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section — Streak / Life Score */}
      <div className="px-4 py-4 border-t border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning/20 to-warning/5 flex items-center justify-center">
            <span className="text-lg">🔥</span>
          </div>
          <div>
            <p className="text-xl font-bold font-mono text-text-primary">{user?.current_streak || 0}</p>
            <p className="text-[10px] text-text-muted font-medium">Day Streak</p>
          </div>
        </div>
        <p className="text-[10px] text-text-muted mt-2">Keep the fire alive! 🔥</p>
      </div>

      {/* Settings + Logout */}
      <div className="px-3 pb-3 space-y-0.5">
        <Link to="/settings">
          <div className="sidebar-item">
            <FiSettings size={16} />
            <span>Settings</span>
          </div>
        </Link>
        <button onClick={logout} className="sidebar-item w-full text-danger hover:text-danger hover:bg-danger/10">
          <FiLogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
}
