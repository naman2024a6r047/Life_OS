import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import {
  FiHome, FiTarget, FiUsers, FiCheckSquare, FiShield,
  FiActivity, FiTerminal, FiBookOpen, FiBarChart2,
  FiCalendar, FiDatabase, FiAlertTriangle, FiSettings, FiLogOut, FiZap, FiXCircle, FiBell, FiMoon
} from 'react-icons/fi';

const navItems = [
  { path: '/', label: 'Dashboard', icon: FiHome },
  { path: '/challenges', label: 'Goals & Challenges', icon: FiTarget },
  { path: '/tasks', label: 'Tasks', icon: FiCheckSquare },
  { path: '/focus', label: 'Focus Mode', icon: FiZap },
  { path: '/friends', label: 'Accountability', icon: FiUsers },
  { path: '/reviews', label: 'Peer Review', icon: FiCheckSquare },
  { path: '/knowledge', label: 'Study Tracker', icon: FiBookOpen },
  { path: '/gym', label: 'Gym & Fitness', icon: FiActivity },
  { path: '/sleep', label: 'Sleep Tracker', icon: FiMoon },
  { path: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { path: '/dev', label: 'Developer Mode', icon: FiTerminal },
  { path: '/settings', label: 'Settings', icon: FiSettings },
];

const examNavItems = [
  { path: '/exams', label: 'Study Dashboard', icon: FiActivity, exact: true },
  { path: '/exams/planner', label: 'Study Planner', icon: FiBookOpen },
  { path: '/exams/focus', label: 'Focus Timer', icon: FiTarget },
  { path: '/exams/analytics', label: 'Exam Analytics', icon: FiBarChart2 },
  { path: '/friends', label: 'Friends', icon: FiUsers },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser, logout, isExamMode } = useContext(AuthContext);
  const [isExiting, setIsExiting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count whenever sidebar mounts or user navigates
  React.useEffect(() => {
    const fetchUnread = async () => {
      try {
        const clearedAt = localStorage.getItem('notificationsClearedAt') || '';
        const res = await axios.get(`/api/notifications/unread-count?clearedAt=${clearedAt}`);
        setUnreadCount(res.data.count);
      } catch (err) {
        console.error('Failed to fetch unread count', err);
      }
    };
    if (user) {
      fetchUnread();
    }
  }, [location.pathname, user]);

  const xpForLevel = (user?.level || 1) * 100;
  const xpCurrent = user?.xp || 0;
  const xpProgress = Math.min(100, Math.round((xpCurrent / xpForLevel) * 100));

  const handleExitExamMode = async () => {
    if (!window.confirm("Are you sure you want to exit Exam Mode? All LifeOS features will resume.")) return;
    setIsExiting(true);
    try {
        await axios.post('/api/exams/deactivate');
        setUser({ ...user, is_in_exam_mode: false });
        navigate('/');
    } catch (err) {
        console.error('Error exiting exam mode', err);
        alert('Failed to exit Exam Mode');
    } finally {
        setIsExiting(false);
    }
  };

  const currentNavItems = isExamMode ? examNavItems : navItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      
      <aside className={`w-[240px] min-w-[240px] h-[100dvh] bg-surface border-r border-border-subtle flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      {/* Branding */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="LifeOS Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-text-primary tracking-tight">LIFE<span className="text-primary">OS</span> <span className="text-[10px] text-primary/70 font-mono font-normal">v1.0</span></h1>
          </div>
        </div>
      </div>

      {/* User Card */}
      <div className="px-4 py-3 mx-3 mb-4 rounded-lg bg-surface border border-border-subtle relative overflow-hidden">
        {/* Hexagon Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative">
            <div className="absolute inset-0 bg-primary/20" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
            <div className="absolute inset-[1px] bg-background flex items-center justify-center text-primary text-sm font-bold" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              {(user?.username || 'N')[0].toUpperCase()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{user?.username || 'Naman'}</p>
            <p className="text-[10px] text-text-secondary truncate">Systems Builder</p>
          </div>
        </div>
        
        {/* XP Bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="text-[10px] text-primary font-mono whitespace-nowrap">
            {xpCurrent.toLocaleString()} / {xpForLevel.toLocaleString()} XP
          </div>
          <div className="flex-1 h-1 bg-surface-elevated rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${xpProgress}%` }} />
          </div>
          <div className="w-4 h-4 text-text-muted flex items-center justify-center">
            <FiShield size={12} />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-1 pb-6 space-y-0.5">
        {currentNavItems.map((item) => {
          const isActive = item.exact 
            ? location.pathname === item.path
            : (location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)));
          const Icon = item.icon;
          
          return (
            <Link key={item.path} to={item.path} onClick={onClose}>
              <div className={`sidebar-item ${isActive ? (isExamMode ? 'bg-info text-text-primary font-semibold' : 'active') : ''}`}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.path === '/notifications' && unreadCount > 0 && (
                    <span className="bg-danger text-text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pb-4 pt-2 space-y-2 mt-auto">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md border border-primary/30 text-primary hover:bg-primary/10 transition-colors text-sm font-semibold">
          <span className="text-lg">+</span> New Goal
        </button>
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md border border-danger/20 text-danger hover:bg-danger/10 hover:border-danger/40 transition-colors text-sm font-medium">
          <FiLogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
}
