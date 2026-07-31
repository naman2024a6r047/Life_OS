import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  FiCalendar, FiPlus, FiFilter, FiChevronLeft, FiChevronRight,
  FiClock, FiCheckCircle, FiTarget, FiZap, FiBookOpen, FiActivity, FiInfo, FiX
} from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CalendarDashboard() {
  const { user, token } = useContext(AuthContext);
  const [viewMode, setViewMode] = useState('Month');
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const streak = user?.current_streak || 0;

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    fetchEvents();
  }, [token, currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/calendar/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(res.data);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newEvent = {
      title: formData.get('title'),
      block_type: formData.get('block_type'),
      category: formData.get('category'),
      date: formData.get('date'),
      time: formData.get('time'),
    };
    try {
      await axios.post(`${API_URL}/calendar/events`, newEvent, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents();
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Failed to create event', err);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(1);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(1);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(today.getDate());
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const generateMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    const prevMonthDays = getDaysInMonth(year, month - 1);
    
    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isOtherMonth: true });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      
      const dayEvents = events
      .filter(e => activeFilter === 'All' || e.block_type === activeFilter)
      .filter(e => {
        if (!e.date) return false;
        return e.date.startsWith(dateStr);
      }).map(e => {
        let c = 'gray';
        if(e.isTask || e.block_type === 'task') c = 'orange';
        else if(e.category === 'Coding' || e.category === 'Exam Prep') c = 'purple';
        else if(e.category === 'Fitness') c = 'green';
        else if(e.category === 'Knowledge' || e.category === 'Reading') c = 'blue';
        else if(e.block_type === 'workout') c = 'green';
        else if(e.block_type === 'study') c = 'blue';
        else if(e.block_type === 'deep_work') c = 'purple';
        else if(e.block_type === 'recovery') c = 'pink';
        
        return { ...e, c };
      });

      days.push({
        day: i,
        isOtherMonth: false,
        isToday: i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear(),
        events: dayEvents
      });
    }

    // Next month padding to complete 42 cells (6 weeks)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isOtherMonth: true });
    }

    return days;
  };

  const monthDays = generateMonthDays();

  const selectedDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const selectedDayEvents = events
    .filter(e => {
       if (!e.date) return false;
       return e.date.startsWith(selectedDateStr);
    })
    .sort((a,b) => new Date(a.date) - new Date(b.date))
    .map(e => {
       let icon = '📖';
       let color = 'purple';
       if(e.category === 'Fitness' || e.block_type === 'workout') { icon = '🏋️'; color = 'green'; }
       else if(e.block_type === 'deep_work') { icon = '💻'; color = 'orange'; }
       else if(e.block_type === 'study' || e.category === 'Exam Prep') { icon = '📝'; color = 'blue'; }
       else if(e.isTask || e.block_type === 'task') { icon = '🎯'; color = 'orange'; }

       return {
         title: e.title,
         time: e.time ? e.time : 'All Day',
         icon,
         color
       };
    });

  const legend = [
    { label: 'Study', color: 'bg-purple' },
    { label: 'Tasks', color: 'bg-warning' },
    { label: 'Exam / Test', color: 'bg-info' },
    { label: 'Review', color: 'bg-cyan-400' },
    { label: 'Health', color: 'bg-success' },
    { label: 'Other', color: 'bg-text-muted' },
    { label: 'Important', color: 'bg-danger' },
  ];

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const yearName = currentDate.getFullYear();

  return (
    <div className="p-6 space-y-5">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
          <button onClick={() => setIsAddModalOpen(true)} className="btn-primary text-xs bg-purple hover:bg-purple/80 flex items-center gap-1.5">
            <FiPlus size={16} /> Add Event
          </button>
          <div className="relative">
            <button onClick={() => setFilterOpen(!filterOpen)} className="btn-outline text-xs flex items-center gap-1.5">
              <FiFilter size={13} /> Filters {activeFilter !== 'All' && <span className="w-2 h-2 rounded-full bg-purple ml-1"></span>}
            </button>
            {filterOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-surface-elevated border border-border-subtle rounded-lg shadow-xl p-2 z-10">
                <p className="text-xs text-text-muted px-2 py-1 mb-1">Filter by type</p>
                {['All', 'deep_work', 'study', 'workout', 'reading', 'recovery', 'task'].map(t => (
                  <button 
                    key={t} 
                    onClick={() => { setActiveFilter(t); setFilterOpen(false); }} 
                    className={`block w-full text-left px-2 py-1.5 text-xs rounded hover:bg-surface capitalize ${activeFilter === t ? 'text-purple font-bold' : 'text-text-secondary hover:text-white'}`}
                  >
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls Bar */}
      <div className="card p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <button onClick={goToToday} className="btn-outline text-xs py-1 px-3">Today</button>
          <div className="flex items-center border border-border-subtle rounded-lg overflow-hidden">
            <button onClick={prevMonth} className="px-2 py-1 hover:bg-surface-elevated text-text-muted hover:text-text-primary"><FiChevronLeft size={14} /></button>
            <button onClick={nextMonth} className="px-2 py-1 hover:bg-surface-elevated text-text-muted hover:text-text-primary"><FiChevronRight size={14} /></button>
          </div>
          <h2 className="text-base font-bold text-text-primary font-mono ml-2">{monthName} {yearName} ▾</h2>
        </div>

        <div className="flex items-center border border-border-subtle rounded-lg p-0.5 bg-surface-elevated w-full md:w-auto justify-center">
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
      <div className="flex flex-col xl:grid xl:grid-cols-12 gap-4">
        {/* Main Calendar Month Grid (9 cols) */}
        <div className="xl:col-span-9 space-y-4 overflow-hidden">
          
          {viewMode === 'Month' && (
            <div className="card overflow-x-auto">
              <div className="min-w-[700px]">
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
                        {d.events?.slice(0, 3).map((ev, ei) => (
                          <div
                            key={ei}
                            title={ev.title}
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
                            {ev.time ? `${ev.time.split(' ')[0]} ` : ''}{ev.title}
                          </div>
                        ))}
                        {d.events?.length > 3 && (
                          <div className="text-[10px] text-text-muted text-center font-medium hover:text-white pt-1">
                            +{d.events.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              </div>
            </div>
          )}

          {viewMode === 'List' && (
            <div className="card p-4 space-y-4">
              <h3 className="font-bold text-text-primary">Events this Month</h3>
              <div className="space-y-2">
                {events.filter(e => e.date.startsWith(`${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}`)).length === 0 && (
                  <p className="text-text-muted text-sm py-4 text-center">No events scheduled this month.</p>
                )}
                {events
                  .filter(e => e.date.startsWith(`${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}`))
                  .filter(e => activeFilter === 'All' || e.block_type === activeFilter)
                  .sort((a,b) => new Date(a.date) - new Date(b.date))
                  .map(e => (
                  <div key={e.id} className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg hover:bg-surface-elevated/80 transition-colors">
                    <div>
                      <p className="font-bold text-sm text-white">{e.title}</p>
                      <p className="text-xs text-text-muted">{new Date(e.date).toLocaleDateString()} • {e.time}</p>
                    </div>
                    <span className="text-[10px] px-2 py-1 bg-purple/20 text-purple-light rounded font-bold uppercase tracking-wider">{e.block_type.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'Week' && (
            <div className="card p-12 text-center text-text-muted flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center mb-4">
                <FiCalendar size={32} className="text-purple opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Weekly View Coming Soon</h3>
              <p className="text-sm max-w-sm mx-auto leading-relaxed">We are still polishing the weekly calendar layout. Please switch back to Month or List view for now.</p>
              <button onClick={() => setViewMode('Month')} className="mt-6 btn-outline text-xs">Go to Month View</button>
            </div>
          )}

          {/* Daily Summary Bar */}
          <div className="card p-4 flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-surface to-surface-elevated gap-4">
            <div>
              <h4 className="text-xs font-bold text-text-primary">Daily Summary — {monthName} {selectedDay}, {yearName}</h4>
            </div>

            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs w-full md:w-auto">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple/10 text-purple flex items-center justify-center font-bold">
                  <FiClock size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted">Total Study Time</p>
                  <p className="font-bold font-mono text-text-primary">0h 0m <span className="text-[9px] text-text-muted font-normal">Planned</span></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-info/10 text-info flex items-center justify-center font-bold">
                  <FiCheckCircle size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted">Tasks</p>
                  <p className="font-bold font-mono text-text-primary">0 / 0 <span className="text-[9px] text-text-muted font-normal">Completed</span></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center font-bold">
                  <FiTarget size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted">Focus Score</p>
                  <p className="font-bold font-mono text-text-primary">0% <span className="text-[9px] text-success font-normal">N/A</span></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center font-bold">
                  <FiZap size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted">Streak</p>
                  <p className="font-bold font-mono text-text-primary">{streak} Days <span className="text-[9px] text-warning font-normal">{streak > 0 ? 'Keep it up! 🔥' : 'Start now!'}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Mini Calendar, Upcoming & Legend (3 cols) */}
        <div className="xl:col-span-3 space-y-4 w-full">
          {/* Mini Calendar Widget */}
          <div className="card p-4 space-y-2 text-center">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-text-primary">Mini Calendar</span>
              <span className="text-xs font-mono text-text-muted">&lt; {monthName} {yearName} &gt;</span>
            </div>

            <div className="grid grid-cols-7 text-[9px] font-mono text-text-muted gap-1 mb-1">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-xs font-mono">
              {Array.from({ length: getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }, (_, i) => {
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

          {/* Events for Selected Day */}
          <div className="card p-4 space-y-3">
            <div className="section-header">
              <h3 className="section-title">Events for {monthName} {selectedDay}</h3>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {selectedDayEvents.length === 0 ? (
                <div className="text-xs text-text-muted text-center py-2">No events scheduled for this day</div>
              ) : selectedDayEvents.map((ev, i) => (
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

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-6 w-full max-w-md shadow-2xl border border-border-subtle"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><FiCalendar className="text-purple"/> Add New Event</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-text-muted hover:text-white transition-colors">
                <FiX size={20}/>
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Title</label>
                <input required type="text" name="title" className="input-field w-full" placeholder="e.g. Deep Work Session" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Type</label>
                  <select name="block_type" className="input-field w-full">
                    <option value="deep_work">Deep Work</option>
                    <option value="study">Study</option>
                    <option value="workout">Workout</option>
                    <option value="reading">Reading</option>
                    <option value="recovery">Recovery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Category</label>
                  <input name="category" type="text" className="input-field w-full" placeholder="e.g. Coding" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Date</label>
                  <input required type="date" name="date" className="input-field w-full" defaultValue={`${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Time</label>
                  <input type="text" name="time" className="input-field w-full" placeholder="e.g. 10:00 AM - 11:00 AM" />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" className="btn-primary w-full py-2.5 flex justify-center items-center font-bold">Save Event</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
