import React, { useState, useEffect, useContext } from 'react';
import Sidebar from './Sidebar';
import { AuthContext } from '../../context/AuthContext';
import { FiSearch, FiBell, FiChevronDown } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';

export default function AppShell({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isExamMode, user } = useContext(AuthContext);

  useEffect(() => {
    const handleToggle = () => setIsMobileMenuOpen(prev => !prev);
    window.addEventListener('toggle-mobile-menu', handleToggle);
    return () => window.removeEventListener('toggle-mobile-menu', handleToggle);
  }, []);

  return (
    <div className="flex min-h-[100dvh] bg-background relative overflow-x-hidden text-text-primary">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <main className="flex-1 min-h-[100dvh] flex flex-col w-full md:ml-[260px] transition-all duration-300">
        
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between h-16 px-6 border-b border-border-subtle bg-background/80 backdrop-blur-md sticky top-0 z-40">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-text-secondary group-focus-within:text-primary transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full pl-10 pr-12 py-2 bg-surface border border-border-subtle rounded-md text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-text-muted text-text-primary"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-[10px] font-mono text-text-muted px-1.5 py-0.5 border border-border-subtle rounded bg-background">Ctrl + K</span>
              </div>
            </div>
          </div>

          {/* Right Stats & Profile */}
          <div className="flex items-center gap-4">
            
            {/* Stats Group */}
            <div className="flex items-center gap-2 bg-surface border border-border-subtle rounded-md p-1 h-10">
              {/* Streak */}
              <div className="flex items-center gap-2 px-3 hover:bg-surface-elevated rounded transition-colors h-full cursor-pointer">
                <span className="text-orange-500 text-lg">🔥</span>
                <div className="flex flex-col justify-center leading-none">
                  <span className="text-xs font-bold font-mono">{user?.current_streak || 7}</span>
                  <span className="text-[9px] text-text-muted font-medium uppercase tracking-wider">Day Streak</span>
                </div>
              </div>
              
              <div className="w-[1px] h-4 bg-border-subtle"></div>
              
              {/* XP */}
              <div className="flex items-center gap-2 px-3 hover:bg-surface-elevated rounded transition-colors h-full cursor-pointer">
                <span className="text-yellow-400 text-lg">⭐</span>
                <div className="flex flex-col justify-center leading-none">
                  <span className="text-xs font-bold font-mono">{(user?.xp || 1250).toLocaleString()}</span>
                  <span className="text-[9px] text-text-muted font-medium uppercase tracking-wider">Total XP</span>
                </div>
              </div>

              <div className="w-[1px] h-4 bg-border-subtle"></div>
              
              {/* Grace Tokens */}
              <div className="flex items-center gap-2 px-3 hover:bg-surface-elevated rounded transition-colors h-full cursor-pointer">
                <span className="text-success text-lg">🛡️</span>
                <div className="flex flex-col justify-center leading-none">
                  <span className="text-xs font-bold font-mono">{user?.grace_tokens || 2}</span>
                  <span className="text-[9px] text-text-muted font-medium uppercase tracking-wider">Grace Tokens</span>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors">
              <FiBell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background"></span>
            </button>

            {/* User Profile -> Settings */}
            <Link to="/settings" className="flex items-center gap-2 hover:bg-surface-elevated p-1 rounded-md transition-colors border border-transparent hover:border-border-subtle">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-elevated border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                {user?.avatar_url 
                  ? <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                  : null
                }
                <span className={`w-full h-full flex items-center justify-center text-sm font-bold text-primary ${user?.avatar_url ? 'hidden' : ''}`}>
                  {(user?.username || 'U')[0].toUpperCase()}
                </span>
              </div>
              <FiChevronDown className="text-text-secondary" />
            </Link>

          </div>
        </header>

        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border-subtle bg-surface/50 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="LifeOS Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-text-primary">{isExamMode ? 'Exam Mode' : 'LifeOS'}</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-text-secondary hover:bg-surface-elevated rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>

        <div className="flex-1 pb-24 overflow-y-auto">
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-lg border-t border-border-subtle pb-safe pt-2 px-6 z-40">
          <div className="flex justify-between items-center h-16 relative">
            <a href="/" className="flex flex-col items-center gap-1 text-primary w-12">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[10px] font-semibold">Home</span>
            </a>
            
            <a href="/challenges" className="flex flex-col items-center gap-1 text-text-muted hover:text-primary transition-colors w-12">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-[10px] font-semibold">Goals</span>
            </a>

            {/* Huge Floating Action Button */}
            <div className="relative -top-6 w-14">
              <a href="/challenges/new" className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-14 h-14 bg-primary rounded-full shadow-glow-primary text-background border-4 border-background hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </a>
            </div>

            <a href="/challenges" className="flex flex-col items-center gap-1 text-text-muted hover:text-primary transition-colors w-12">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="text-[10px] font-semibold">Tasks</span>
            </a>

            <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center gap-1 text-text-muted hover:text-primary transition-colors w-12">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[10px] font-semibold">Profile</span>
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
