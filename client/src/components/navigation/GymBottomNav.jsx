import React from 'react';
import { FiHome, FiActivity, FiBarChart2, FiUser, FiPlus, FiTrendingUp } from 'react-icons/fi';

export default function GymBottomNav({ activeTab, setActiveTab, onAddClick }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-[84px] bg-surface-elevated/90 backdrop-blur-md border-t border-border-subtle z-40 flex items-center justify-between px-6 pb-4 pt-2">
      <button 
        onClick={() => setActiveTab('overview')}
        className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'overview' ? 'text-purple' : 'text-text-muted hover:text-text-primary'}`}
      >
        <FiHome size={22} className={activeTab === 'overview' ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : ''} />
        <span className="text-[10px] font-bold">Overview</span>
      </button>

      <button 
        onClick={() => setActiveTab('workouts')}
        className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'workouts' ? 'text-purple' : 'text-text-muted hover:text-text-primary'}`}
      >
        <FiActivity size={22} className={activeTab === 'workouts' ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : ''} />
        <span className="text-[10px] font-bold">Workouts</span>
      </button>

      <button 
        onClick={() => setActiveTab('body-stats')}
        className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'body-stats' ? 'text-purple' : 'text-text-muted hover:text-text-primary'}`}
      >
        <FiTrendingUp size={22} className={activeTab === 'body-stats' ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : ''} />
        <span className="text-[10px] font-bold">Body Stats</span>
      </button>

      <button 
        onClick={() => setActiveTab('progress')}
        className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'progress' ? 'text-purple' : 'text-text-muted hover:text-text-primary'}`}
      >
        <FiBarChart2 size={22} className={activeTab === 'progress' ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : ''} />
        <span className="text-[10px] font-bold">Progress</span>
      </button>

      <button 
        onClick={() => setActiveTab('settings')}
        className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'settings' ? 'text-purple' : 'text-text-muted hover:text-text-primary'}`}
      >
        <FiUser size={22} className={activeTab === 'settings' ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : ''} />
        <span className="text-[10px] font-bold">Profile</span>
      </button>
    </div>
  );
}
