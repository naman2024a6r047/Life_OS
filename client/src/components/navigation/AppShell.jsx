import React, { useState, useEffect, useContext } from 'react';
import Sidebar from './Sidebar';
import { AuthContext } from '../../context/AuthContext';

export default function AppShell({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isExamMode } = useContext(AuthContext);

  useEffect(() => {
    const handleToggle = () => setIsMobileMenuOpen(prev => !prev);
    window.addEventListener('toggle-mobile-menu', handleToggle);
    return () => window.removeEventListener('toggle-mobile-menu', handleToggle);
  }, []);

  return (
    <div className="flex min-h-screen bg-background relative overflow-x-hidden">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <main className="flex-1 min-h-screen flex flex-col overflow-y-auto w-full md:ml-[240px] transition-all duration-300">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border-subtle bg-surface/50 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isExamMode ? 'bg-gradient-to-tr from-info to-primary' : 'bg-gradient-to-tr from-primary to-purple'}`}>
              <span className="text-white text-sm font-bold">L</span>
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

        <div className="flex-1 pb-24 md:pb-0">
          {children}
        </div>
      </main>
    </div>
  );
}
