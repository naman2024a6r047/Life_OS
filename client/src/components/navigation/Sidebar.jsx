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
  { path: '/friends', label: 'Accountability', icon: FiUsers },
  { path: '/reviews', label: 'Peer Review', icon: FiCheckSquare },
  { path: '/exams', label: 'Exam Mode', icon: FiShield },
  { path: '/gym', label: 'Gym & Fitness', icon: FiActivity },
  { path: '/sleep', label: 'Sleep Tracker', icon: FiMoon },
  { path: '/dev', label: 'Developer Profile', icon: FiTerminal },
  { path: '/knowledge', label: 'Study Tracker', icon: FiBookOpen },
  { path: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { path: '/penalties', label: 'Penalty System', icon: FiAlertTriangle },
  { path: '/notifications', label: 'Notifications', icon: FiBell },
  { path: '/calendar', label: 'Calendar', icon: FiCalendar },
  { path: '/ai-coach', label: 'Resources', icon: FiDatabase },
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
      
      <aside className={`w-[240px] min-w-[240px] h-screen bg-surface border-r border-border-subtle flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      {/* Branding */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isExamMode ? 'bg-gradient-to-tr from-info to-primary' : 'bg-gradient-to-tr from-primary to-purple'}`}>
            <FiZap className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-text-primary tracking-tight">LifeOS</h1>
            <p className="text-[10px] text-text-muted font-medium">{isExamMode ? 'Exam Mode Active' : 'Your Life. Your System.'}</p>
          </div>
        </div>
      </div>

      {/* User Card */}
      <div className="px-4 py-3 mx-3 mb-2 rounded-lg bg-surface-elevated">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${isExamMode ? 'bg-gradient-to-br from-info to-primary' : 'bg-gradient-to-br from-primary to-purple'}`}>
            {(user?.username || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{user?.username || 'User'}</p>
            <div className="flex items-center gap-1">
              <span className={`text-[9px] px-1.5 py-0 ${isExamMode ? 'badge-info' : 'badge-primary'}`}>Lv. {user?.level || 1}</span>
              <span className="text-[10px] text-text-muted">• {isExamMode ? 'Scholar' : 'Pro Builder'}</span>
            </div>
          </div>
        </div>
        {/* XP Bar */}
        <div className="mt-2">
          <div className="progress-bar h-1">
            <div className={`progress-fill ${isExamMode ? 'bg-info' : 'bg-primary'}`} style={{ width: `${xpProgress}%` }} />
          </div>
          <p className="text-[10px] text-text-muted mt-1 font-mono">{xpCurrent} / {xpForLevel} XP</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-1 space-y-0.5">
        {currentNavItems.map((item) => {
          const isActive = item.exact 
            ? location.pathname === item.path
            : (location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)));
          const Icon = item.icon;
          
          return (
            <Link key={item.path} to={item.path} onClick={onClose}>
              <div className={`sidebar-item ${isActive ? (isExamMode ? 'bg-info text-white font-semibold' : 'active') : ''}`}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.path === '/notifications' && unreadCount > 0 && (
                    <span className="bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
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
      <div className="px-4 py-4 border-t border-border-subtle">
        {isExamMode ? (
          <button 
            onClick={handleExitExamMode}
            disabled={isExiting}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 font-bold transition-all disabled:opacity-50"
          >
            <FiXCircle size={18} />
            {isExiting ? 'Exiting...' : 'Exit Exam Mode'}
          </button>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Settings + Logout */}
      <div className="px-3 pb-3 space-y-0.5 pt-2">
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
