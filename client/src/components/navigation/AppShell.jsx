import React from 'react';
import Sidebar from './Sidebar';

export default function AppShell({ children }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-[240px] min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
