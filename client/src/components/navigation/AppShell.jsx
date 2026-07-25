import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

export default function AppShell({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsMobileMenuOpen(prev => !prev);
    window.addEventListener('toggle-mobile-menu', handleToggle);
    return () => window.removeEventListener('toggle-mobile-menu', handleToggle);
  }, []);

  return (
    <div className="flex min-h-screen bg-background relative overflow-x-hidden">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <main className="flex-1 min-h-screen overflow-y-auto w-full md:ml-[240px] pb-24 md:pb-0 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
