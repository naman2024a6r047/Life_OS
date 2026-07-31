import React from 'react';
import { FiHome, FiTarget, FiBarChart2, FiUser } from 'react-icons/fi';

export default function GymBottomNav({ activeTab, setActiveTab, onAddClick }) {
  const tabs = [
    { id: 'overview', icon: FiHome, label: 'Dashboard' },
    { id: 'progress', icon: FiTarget, label: 'Goals' },
    { id: 'workouts', icon: null, label: 'Gym', isCenter: true },
    { id: 'body-stats', icon: FiBarChart2, label: 'Analytics' },
    { id: 'settings', icon: FiUser, label: 'Profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Frosted glass background */}
      <div className="bg-[#0e0f14]/95 backdrop-blur-xl border-t border-white/[0.06] flex items-center justify-around px-2 pb-safe pt-2 h-[72px]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center justify-center -mt-5 relative"
              >
                {/* Center gym button - glowing pill */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-purple to-purple-accent shadow-[0_0_20px_rgba(168,85,247,0.6)]'
                    : 'bg-gradient-to-br from-purple/80 to-purple-accent/80 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                }`}>
                  {/* Dumbbell icon using ASCII since GiDumbbell may not be imported */}
                  <span className="text-2xl">🏋️</span>
                </div>
                <span className={`text-[10px] font-bold mt-1.5 ${isActive ? 'text-purple' : 'text-white/60'}`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all duration-200 ${
                isActive ? 'text-purple' : 'text-white/40'
              }`}
            >
              <div className={`relative transition-all duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                <Icon size={20} />
                {isActive && (
                  <div className="absolute -inset-1.5 rounded-full bg-purple/15 blur-sm -z-10" />
                )}
              </div>
              <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'text-purple' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
