import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FiCalendar, FiPlus, FiFilter, FiChevronLeft, FiChevronRight,
  FiClock, FiCheckCircle, FiTarget, FiZap, FiBookOpen, FiActivity, FiInfo
} from 'react-icons/fi';

export default function CalendarDashboard() {
  const { user } = useContext(AuthContext);
  const [viewMode, setViewMode] = useState('Month');
  const [selectedDay, setSelectedDay] = useState(12);

  const streak = user?.current_streak || 18;

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calendar dates matrix for May 2026 (Sun 26 Apr to Sat 6 Jun)
  const monthDays = [
    { day: 26, isOtherMonth: true }, { day: 27, isOtherMonth: true }, { day: 28, isOtherMonth: true }, { day: 29, isOtherMonth: true }, { day: 30, isOtherMonth: true },
    { day: 1, isOtherMonth: false }, { day: 2, isOtherMonth: false },
    { day: 3, events: [{ title: 'DBMS (2h)', c: 'purple' }, { title: 'DSA (1h)', c: 'purple' }] },
    { day: 4, events: [{ title: 'OS (2h)', c: 'purple' }, { title: 'Maths (1h)', c: 'purple' }] },
    { day: 5, events: [{ title: 'Web Dev (2h)', c: 'purple' }, { title: 'Reading (30m)', c: 'gray' }] },
    { day: 6, events: [{ title: 'DSA (2h)', c: 'purple' }, { title: 'Project (1h)', c: 'orange' }] },
    { day: 7, events: [{ title: 'DBMS (2h)', c: 'purple' }, { title: 'OS (1h)', c: 'purple' }, { title: '+1 more', c: 'gray' }] },
    { day: 8, events: [{ title: 'Web Dev (2h)', c: 'purple' }, { title: 'Gym (1h)', c: 'green' }] },
    { day: 9, events: [{ title: 'Maths (2h)', c: 'purple' }, { title: 'DSA (1h)', c: 'purple' }] },
    { day: 10, events: [{ title: 'OS (2h)', c: 'purple' }, { title: 'Reading (30m)', c: 'gray' }] },
    { day: 11, events: [{ title: 'DBMS (2h)', c: 'purple' }, { title: 'Project (1h)', c: 'orange' }] },
    { day: 12, isToday: true, events: [{ title: 'Web Dev (2h)', c: 'purple' }, { title: 'DSA (2h)', c: 'purple' }, { title: '+2 more', c: 'gray' }] },
    { day: 13, events: [{ title: 'OS (2h)', c: 'purple' }, { title: 'Gym (1h)', c: 'green' }] },
    { day: 14, events: [{ title: 'Maths (2h)', c: 'purple' }, { title: 'DBMS (1h)', c: 'purple' }] },
    { day: 15, events: [{ title: 'Project (2h)', c: 'orange' }, { title: 'Reading (30m)', c: 'gray' }] },
    { day: 16, events: [{ title: 'Weekly Review', c: 'cyan', badge: true }, { title: 'Plan Next Week', c: 'cyan' }] },
    { day: 17, events: [{ title: 'Mock Test', c: 'blue', badge: true }, { title: 'DSA (2h)', c: 'purple' }] },
    { day: 18, events: [{ title: 'OS (2h)', c: 'purple' }, { title: 'Maths (1h)', c: 'purple' }] },
    { day: 19, events: [{ title: 'Web Dev (2h)', c: 'purple' }, { title: 'Project (1h)', c: 'orange' }] },
    { day: 20, events: [{ title: 'DBMS (2h)', c: 'purple' }, { title: 'Gym (1h)', c: 'green' }] },
    { day: 21, events: [{ title: 'OS (2h)', c: 'purple' }, { title: 'Reading (30m)', c: 'gray' }] },
    { day: 22, events: [{ title: 'DSA (2h)', c: 'purple' }, { title: 'Maths (1h)', c: 'purple' }] },
    { day: 23, events: [{ title: 'Web Dev (2h)', c: 'purple' }, { title: 'Project (1h)', c: 'orange' }] },
    { day: 24, events: [{ title: 'OS (2h)', c: 'purple' }, { title: 'Reading (30m)', c: 'gray' }] },
    { day: 25, events: [{ title: 'Exam Prep', c: 'blue', badge: true }, { title: 'DBMS (2h)', c: 'purple' }] },
    { day: 26, events: [{ title: 'Maths (2h)', c: 'purple' }, { title: 'DSA (1h)', c: 'purple' }] },
    { day: 27, events: [{ title: 'Web Dev (2h)', c: 'purple' }, { title: 'Gym (1h)', c: 'green' }] },
    { day: 28, events: [{ title: 'OS (2h)', c: 'purple' }, { title: 'Project (1h)', c: 'orange' }] },
    { day: 29, events: [{ title: 'DBMS (2h)', c: 'purple' }, { title: 'Reading (30m)', c: 'gray' }] },
    { day: 30, events: [{ title: 'Mock Test', c: 'blue', badge: true }, { title: 'Plan Next Week', c: 'cyan' }] },
    { day: 31, events: [{ title: 'Rest Day', c: 'pink' }] },
    { day: 1, isOtherMonth: true }, { day: 2, isOtherMonth: true }, { day: 3, isOtherMonth: true }, { day: 4, isOtherMonth: true }, { day: 5, isOtherMonth: true }, { day: 6, isOtherMonth: true },
  ];

  const upcomingEvents = [
    { title: 'DBMS Study Session', time: 'Today, 10:00 AM – 12:00 PM', icon: '📖', color: 'purple' },
    { title: 'Project Work', time: 'Today, 2:00 PM – 4:00 PM', icon: '💻', color: 'orange' },
    { title: 'Gym & Fitness', time: 'Today, 6:00 PM – 7:00 PM', icon: '🏋️', color: 'green' },
    { title: 'Mock Test (DSA)', time: 'May 17, 2026, 9:00 AM – 11:00 AM', icon: '📝', color: 'blue' },
  ];

  const legend = [
    { label: 'Study', color: 'bg-purple' },
    { label: 'Tasks', color: 'bg-warning' },
    { label: 'Exam / Test', color: 'bg-info' },
    { label: 'Review', color: 'bg-cyan-400' },
    { label: 'Health', color: 'bg-success' },
    { label: 'Other', color: 'bg-text-muted' },
    { label: 'Important', color: 'bg-danger' },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center">
            <FiCalendar size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Calendar</h1>
            <p className="text-xs text-text-muted">Plan your schedule. Stay consistent. Achieve your goals.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-primary text-xs bg-purple hover:bg-purple/80 flex items-center gap-1.5">
            <FiPlus size={16} /> Add Event
          </button>
          <button className="btn-outline text-xs flex items-center gap-1.5">
            <FiFilter size={13} /> Filters
          </button>
        </div>
      </div>

      {/* Navigation Controls Bar */}
      <div className="card p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="btn-outline text-xs py-1 px-3">Today</button>
          <div className="flex items-center border border-border-subtle rounded-lg overflow-hidden">
            <button className="px-2 py-1 hover:bg-surface-elevated text-text-muted hover:text-text-primary"><FiChevronLeft size={14} /></button>
            <button className="px-2 py-1 hover:bg-surface-elevated text-text-muted hover:text-text-primary"><FiChevronRight size={14} /></button>
          </div>
          <h2 className="text-base font-bold text-text-primary font-mono ml-2">May 2026 ▾</h2>
        </div>

        <div className="flex items-center border border-border-subtle rounded-lg p-0.5 bg-surface-elevated">
          {['Month', 'Week', 'List'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === mode ? 'bg-purple text-white shadow-glow-primary' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Main Calendar Month Grid (9 cols) */}
        <div className="col-span-9 space-y-4">
          <div className="card overflow-hidden">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-border-subtle bg-surface-elevated/50 text-center py-2 text-xs font-bold text-text-muted uppercase">
              {daysOfWeek.map(d => <span key={d}>{d}</span>)}
            </div>

            {/* Month Grid Cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-border-subtle">
              {monthDays.map((d, i) => {
                const isSelected = d.day === selectedDay && !d.isOtherMonth;
                return (
                  <div
                    key={i}
                    onClick={() => !d.isOtherMonth && setSelectedDay(d.day)}
                    className={`min-h-[85px] p-1.5 flex flex-col justify-between transition-colors cursor-pointer ${
                      d.isOtherMonth ? 'bg-background/40 opacity-30' : 
                      isSelected ? 'bg-purple/10 border-primary' : 'bg-surface hover:bg-surface-elevated/40'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-mono font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                        d.isToday ? 'bg-purple text-white ring-2 ring-purple-light' : 
                        isSelected ? 'bg-purple/30 text-purple' : 'text-text-primary'
                      }`}>
                        {d.day}
                      </span>
                    </div>

                    <div className="space-y-1 mt-1">
                      {d.events?.map((ev, ei) => (
                        <div
                          key={ei}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-medium truncate ${
                            ev.c === 'purple' ? 'bg-purple/20 text-purple-light' :
                            ev.c === 'orange' ? 'bg-warning/20 text-warning' :
                            ev.c === 'green' ? 'bg-success/20 text-success' :
                            ev.c === 'blue' ? 'bg-info/20 text-info font-bold' :
                            ev.c === 'cyan' ? 'bg-cyan-400/20 text-cyan-300 font-bold' :
                            ev.c === 'pink' ? 'bg-danger/20 text-danger' :
                            'bg-surface-elevated text-text-muted'
                          }`}
                        >
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Summary Bar */}
          <div className="card p-4 flex items-center justify-between bg-gradient-to-r from-surface to-surface-elevated">
            <div>
              <h4 className="text-xs font-bold text-text-primary">Daily Summary — May {selectedDay}, 2026</h4>
            </div>

            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple/10 text-purple flex items-center justify-center font-bold">
                  <FiClock size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted">Total Study Time</p>
                  <p className="font-bold font-mono text-text-primary">6h 30m <span className="text-[9px] text-text-muted font-normal">Planned: 7h 00m</span></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-info/10 text-info flex items-center justify-center font-bold">
                  <FiCheckCircle size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted">Tasks</p>
                  <p className="font-bold font-mono text-text-primary">4 / 6 <span className="text-[9px] text-text-muted font-normal">Completed</span></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center font-bold">
                  <FiTarget size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted">Focus Score</p>
                  <p className="font-bold font-mono text-text-primary">85% <span className="text-[9px] text-success font-normal">Good</span></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center font-bold">
                  <FiZap size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted">Streak</p>
                  <p className="font-bold font-mono text-text-primary">18 Days <span className="text-[9px] text-warning font-normal">Keep it up! 🔥</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Mini Calendar, Upcoming & Legend (3 cols) */}
        <div className="col-span-3 space-y-4">
          {/* Mini Calendar Widget */}
          <div className="card p-4 space-y-2 text-center">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-text-primary">Mini Calendar</span>
              <span className="text-xs font-mono text-text-muted">&lt; May 2026 &gt;</span>
            </div>

            <div className="grid grid-cols-7 text-[9px] font-mono text-text-muted gap-1 mb-1">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-xs font-mono">
              {Array.from({ length: 31 }, (_, i) => {
                const dayNum = i + 1;
                const isSelected = dayNum === selectedDay;
                return (
                  <button
                    key={dayNum}
                    onClick={() => setSelectedDay(dayNum)}
                    className={`h-6 rounded-md flex items-center justify-center text-[11px] transition-all ${
                      isSelected ? 'bg-purple text-white font-bold shadow-glow-primary' : 'hover:bg-surface-elevated text-text-secondary'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="card p-4 space-y-3">
            <div className="section-header">
              <h3 className="section-title">Upcoming Events</h3>
              <span className="section-link">View All</span>
            </div>

            <div className="space-y-2.5">
              {upcomingEvents.map((ev, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2 rounded-xl bg-surface-elevated/40">
                  <span className="text-sm mt-0.5">{ev.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-text-primary leading-tight">{ev.title}</p>
                    <p className="text-[9px] text-text-muted mt-0.5">{ev.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Legend */}
          <div className="card p-4 space-y-2">
            <h3 className="section-title">Calendar Legend</h3>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              {legend.map((l, i) => (
                <div key={i} className="flex items-center gap-1.5 text-text-secondary">
                  <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                  <span>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tip of the Day Card */}
          <div className="card p-4 bg-purple/10 border-purple/30 space-y-1">
            <div className="flex items-center gap-2">
              <FiInfo className="text-purple text-base" />
              <h4 className="text-xs font-bold text-text-primary">Tip of the Day</h4>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Consistency is what transforms average into excellence. Keep showing up!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
