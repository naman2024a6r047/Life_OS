import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FiActivity, FiCheckCircle, FiClock, FiTrendingUp, FiAward,
  FiZap, FiCalendar, FiChevronRight, FiCheck, FiHeart
} from 'react-icons/fi';

export default function GymDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');

  const streak = user?.current_streak || 28;

  const workoutHistory = [
    { title: 'Upper Body Strength', date: '15 May 2026', duration: '75 min', volume: '7,800 kg', status: 'completed' },
    { title: 'Lower Body Power', date: '13 May 2026', duration: '70 min', volume: '6,900 kg', status: 'completed' },
    { title: 'Push Day', date: '11 May 2026', duration: '65 min', volume: '6,200 kg', status: 'completed' },
    { title: 'Pull Day', date: '9 May 2026', duration: '60 min', volume: '5,600 kg', status: 'completed' },
    { title: 'Leg Day', date: '7 May 2026', duration: '80 min', volume: '7,100 kg', status: 'completed' },
  ];

  const personalRecords = [
    { name: 'Bench Press', val: '80 kg', isNew: true },
    { name: 'Squat', val: '100 kg', isNew: true },
    { name: 'Deadlift', val: '120 kg', date: '2 weeks ago' },
    { name: 'Overhead Press', val: '40 kg', date: '3 weeks ago' },
    { name: 'Pull Ups', val: '15 reps', date: '2 weeks ago' },
  ];

  const volumeData = [
    { label: '9 May', height: 40 },
    { label: '15 May', height: 75, active: true },
    { label: '23 May', height: 50 },
    { label: '30 May', height: 65 },
    { label: '6 Jun', height: 55 },
    { label: '13 Jun', height: 85 },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center">
            <FiActivity size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Gym & Fitness</h1>
            <p className="text-xs text-text-muted">Train hard. Stay consistent. Be your best.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🔥</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">12</p>
              <p className="text-[9px] text-text-muted">Workouts This Month</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🏆</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">47.5 kg</p>
              <p className="text-[9px] text-text-muted">Total Volume (Weight Lifted)</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">⭐</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">18</p>
              <p className="text-[9px] text-text-muted">Personal Records</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">⚡</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">{streak}</p>
              <p className="text-[9px] text-text-muted">Active Streak Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'workouts', label: 'Workouts' },
          { id: 'progress', label: 'Progress' },
          { id: 'exercises', label: 'Exercises' },
          { id: 'nutrition', label: 'Nutrition' },
          { id: 'body-stats', label: 'Body Stats' },
          { id: 'settings', label: 'Settings' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id ? 'text-primary border-b-2 border-primary font-semibold' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Top Row Cards */}
      <div className="grid grid-cols-12 gap-4">
        {/* Today's Workout Card (5 cols) */}
        <div className="col-span-5 card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted">Today's Workout</span>
              <span className="badge-success text-[9px]">Completed</span>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-text-primary">Push Day</h2>
                <p className="text-xs text-text-muted mt-0.5">Chest • Shoulders • Triceps</p>
              </div>
              {/* Muscle Vector Graphic Illustration */}
              <div className="w-16 h-16 rounded-xl bg-purple/10 border border-purple/30 flex items-center justify-center text-purple text-2xl font-mono">
                🏋️‍♂️
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-4 text-center">
              <div className="p-2 rounded-lg bg-surface-elevated">
                <p className="text-[9px] text-text-muted">Exercises</p>
                <p className="text-sm font-bold font-mono text-text-primary">6</p>
              </div>
              <div className="p-2 rounded-lg bg-surface-elevated">
                <p className="text-[9px] text-text-muted">Duration</p>
                <p className="text-sm font-bold font-mono text-text-primary">75 min</p>
              </div>
              <div className="p-2 rounded-lg bg-surface-elevated">
                <p className="text-[9px] text-text-muted">Volume</p>
                <p className="text-sm font-bold font-mono text-text-primary">8,250 kg</p>
              </div>
              <div className="p-2 rounded-lg bg-surface-elevated">
                <p className="text-[9px] text-text-muted">Calories</p>
                <p className="text-sm font-bold font-mono text-text-primary">620 kcal</p>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 py-2 rounded-xl bg-purple/20 text-purple hover:bg-purple/30 text-xs font-semibold transition-all">
            View Workout Details
          </button>
        </div>

        {/* Weekly Activity Card (4 cols) */}
        <div className="col-span-4 card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-text-primary">Weekly Activity</h3>
              <span className="text-xs text-primary-light cursor-pointer hover:underline">View Calendar</span>
            </div>
            {/* Mon-Sun Dots */}
            <div className="flex justify-between mb-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className="text-[9px] text-text-muted">{day}</span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i < 5 ? 'bg-success text-white' : i === 5 ? 'bg-primary text-white' : 'bg-surface-elevated text-text-muted'
                  }`}>
                    {i < 5 ? '✓' : i === 5 ? '24' : '○'}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-border-subtle">
              <div>
                <p className="text-[9px] text-text-muted">Workouts</p>
                <p className="text-xs font-bold font-mono text-text-primary">5 / 6</p>
              </div>
              <div>
                <p className="text-[9px] text-text-muted">Hours</p>
                <p className="text-xs font-bold font-mono text-text-primary">6.4</p>
              </div>
              <div>
                <p className="text-[9px] text-text-muted">Calories</p>
                <p className="text-xs font-bold font-mono text-text-primary">2,850 kcal</p>
              </div>
              <div>
                <p className="text-[9px] text-text-muted">Avg. Volume</p>
                <p className="text-xs font-bold font-mono text-text-primary">7,200 kg</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Streak Card (3 cols) */}
        <div className="col-span-3 card p-5 flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-between w-full text-xs text-text-muted mb-2">
            <span className="font-bold text-text-primary">Current Streak</span>
          </div>
          <div className="relative w-28 h-28 my-1 flex items-center justify-center">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
              <circle cx="56" cy="56" r="48" stroke="#1C2039" strokeWidth="8" fill="none" />
              <circle cx="56" cy="56" r="48" stroke="#22C55E" strokeWidth="8" fill="none"
                strokeDasharray={`${2 * Math.PI * 48}`}
                strokeDashoffset={`${2 * Math.PI * 48 * (1 - 28/32)}`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold font-mono text-text-primary flex items-center gap-1">
                🔥 28
              </span>
              <span className="text-[9px] text-text-muted">Days</span>
            </div>
          </div>
          <p className="text-[10px] text-text-muted mt-2">Best Streak: <strong className="text-text-primary font-mono">32 days</strong></p>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Workout History (4 cols) */}
        <div className="col-span-4 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Workout History</h3>
            <span className="section-link">View All</span>
          </div>
          <div className="space-y-2">
            {workoutHistory.map((w, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated/40 hover:bg-surface-elevated transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple/10 text-purple flex items-center justify-center font-bold text-xs">
                    🏋️
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary leading-tight">{w.title}</p>
                    <p className="text-[9px] text-text-muted">{w.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-mono font-semibold text-text-primary">{w.volume}</p>
                  <span className="text-[9px] text-text-muted">{w.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Overview Bar Chart (5 cols) */}
        <div className="col-span-5 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Progress Overview</h3>
            <span className="text-xs text-text-muted font-medium">Volume (kg) ▾</span>
          </div>
          {/* Bar Chart Visualization */}
          <div className="h-40 flex items-end justify-between gap-2 px-2 pt-4 relative">
            {/* Tooltip on active bar */}
            <div className="absolute top-2 left-1/3 p-1.5 rounded-lg bg-surface border border-border-subtle text-[9px] text-text-primary font-mono shadow-xl z-10">
              16 May 2026 <br /> <span className="text-purple font-bold">Volume: 8,450 kg</span>
            </div>
            {volumeData.map((b, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div
                  className={`w-full rounded-t-md transition-all ${
                    b.active ? 'bg-purple shadow-glow-primary' : 'bg-primary/40 hover:bg-primary'
                  }`}
                  style={{ height: `${b.height}%` }}
                />
                <span className="text-[9px] text-text-muted font-mono">{b.label}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-border-subtle text-center">
            <div>
              <p className="text-[9px] text-text-muted">Total Workouts</p>
              <p className="text-xs font-bold font-mono text-text-primary">23</p>
            </div>
            <div>
              <p className="text-[9px] text-text-muted">Total Volume</p>
              <p className="text-xs font-bold font-mono text-text-primary">162,500 kg</p>
            </div>
            <div>
              <p className="text-[9px] text-text-muted">Total Time</p>
              <p className="text-xs font-bold font-mono text-text-primary">28.5 hrs</p>
            </div>
            <div>
              <p className="text-[9px] text-text-muted">Avg. Volume/Workout</p>
              <p className="text-xs font-bold font-mono text-text-primary">7,065 kg</p>
            </div>
          </div>
        </div>

        {/* Personal Records Panel (3 cols) */}
        <div className="col-span-3 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Personal Records</h3>
            <span className="section-link">View All</span>
          </div>
          <div className="space-y-2.5">
            {personalRecords.map((pr, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-border-subtle last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs">🏋️</span>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">{pr.name}</p>
                    {pr.date && <p className="text-[9px] text-text-muted">{pr.date}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-text-primary">{pr.val}</span>
                  {pr.isNew && (
                    <span className="badge-success text-[8px] block mt-0.5">New PR!</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Muscle Group Focus Donut (3 cols) */}
        <div className="col-span-3 card p-4 space-y-3">
          <h3 className="section-title">Muscle Group Focus</h3>
          <p className="text-[10px] text-text-muted">This Week</p>
          <div className="flex items-center justify-center my-2">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r="44" stroke="#6366F1" strokeWidth="12" strokeDasharray="60 216" fill="none" />
                <circle cx="56" cy="56" r="44" stroke="#06B6D4" strokeWidth="12" strokeDasharray="50 226" strokeDashoffset="-60" fill="none" />
                <circle cx="56" cy="56" r="44" stroke="#22C55E" strokeWidth="12" strokeDasharray="70 206" strokeDashoffset="-110" fill="none" />
                <circle cx="56" cy="56" r="44" stroke="#F59E0B" strokeWidth="12" strokeDasharray="40 236" strokeDashoffset="-180" fill="none" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-text-primary">Muscle Groups</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <span className="flex items-center gap-1.5 text-text-secondary"><span className="w-2 h-2 rounded-full bg-primary" /> Chest 20%</span>
            <span className="flex items-center gap-1.5 text-text-secondary"><span className="w-2 h-2 rounded-full bg-info" /> Back 20%</span>
            <span className="flex items-center gap-1.5 text-text-secondary"><span className="w-2 h-2 rounded-full bg-success" /> Legs 25%</span>
            <span className="flex items-center gap-1.5 text-text-secondary"><span className="w-2 h-2 rounded-full bg-warning" /> Shoulders 15%</span>
          </div>
        </div>

        {/* Nutrition Summary Donut (3 cols) */}
        <div className="col-span-3 card p-4 space-y-3">
          <h3 className="section-title">Nutrition Summary</h3>
          <p className="text-[10px] text-text-muted">Today</p>
          <div className="flex items-center justify-center my-2">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r="44" stroke="#22C55E" strokeWidth="12" strokeDasharray="90 186" fill="none" />
                <circle cx="56" cy="56" r="44" stroke="#6366F1" strokeWidth="12" strokeDasharray="120 156" strokeDashoffset="-90" fill="none" />
                <circle cx="56" cy="56" r="44" stroke="#F59E0B" strokeWidth="12" strokeDasharray="60 216" strokeDashoffset="-210" fill="none" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-bold font-mono text-text-primary">2,350</span>
                <span className="text-[9px] text-text-muted">kcal</span>
              </div>
            </div>
          </div>
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between"><span className="text-success font-medium">• Protein</span><span className="font-mono text-text-primary">120g (30%)</span></div>
            <div className="flex justify-between"><span className="text-primary font-medium">• Carbs</span><span className="font-mono text-text-primary">280g (47%)</span></div>
            <div className="flex justify-between"><span className="text-warning font-medium">• Fats</span><span className="font-mono text-text-primary">70g (23%)</span></div>
          </div>
        </div>

        {/* Daily Goals Progress (3 cols) */}
        <div className="col-span-3 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Daily Goals</h3>
            <span className="section-link">Edit Goals</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-text-primary font-semibold flex items-center gap-1">🏋️ Workouts</span>
                <span className="font-mono text-text-muted">1 / 1</span>
              </div>
              <div className="progress-bar h-1.5"><div className="progress-fill bg-success" style={{ width: '100%' }} /></div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-text-primary font-semibold flex items-center gap-1">🥗 Calories</span>
                <span className="font-mono text-text-muted">2,350 / 2,400 kcal</span>
              </div>
              <div className="progress-bar h-1.5"><div className="progress-fill bg-success" style={{ width: '97%' }} /></div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-text-primary font-semibold flex items-center gap-1">🥩 Protein</span>
                <span className="font-mono text-text-muted">120 / 120 g</span>
              </div>
              <div className="progress-bar h-1.5"><div className="progress-fill bg-success" style={{ width: '100%' }} /></div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-text-primary font-semibold flex items-center gap-1">💧 Water</span>
                <span className="font-mono text-text-muted">2.6 / 3 L</span>
              </div>
              <div className="progress-bar h-1.5"><div className="progress-fill bg-info" style={{ width: '86%' }} /></div>
            </div>
          </div>
        </div>

        {/* Body Stats Mini Panel (3 cols) */}
        <div className="col-span-3 card p-4 space-y-3">
          <div className="section-header">
            <h3 className="section-title">Body Stats</h3>
            <span className="section-link">View Progress</span>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Weight', val: '60.5 kg', diff: '-0.8 kg', isGood: true },
              { label: 'Body Fat', val: '14.2 %', diff: '-1.2 %', isGood: true },
              { label: 'Muscle Mass', val: '51.8 kg', diff: '+1.1 kg', isGood: true },
              { label: 'BMI', val: '20.9', diff: 'Normal', isGood: true },
            ].map((st, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border-subtle last:border-0">
                <span className="text-text-secondary">{st.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-text-primary">{st.val}</span>
                  <span className="text-[10px] text-success font-semibold">{st.diff}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-text-muted pt-1">Last Updated: 15 May 2026</p>
        </div>
      </div>
    </div>
  );
}
