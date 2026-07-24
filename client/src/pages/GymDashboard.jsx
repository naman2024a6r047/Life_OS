import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiActivity, FiCheckCircle, FiClock, FiTrendingUp, FiAward,
  FiZap, FiCalendar, FiChevronRight, FiCheck, FiHeart, FiPlus,
  FiFilter, FiSearch, FiMoreVertical, FiPlay, FiBookmark, FiEdit3,
  FiSliders, FiUser, FiInfo, FiArrowUpRight, FiArrowDownRight, FiX
} from 'react-icons/fi';

export default function GymDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');

  // Interactive State
  const streak = user?.current_streak || 28;
  const [selectedMuscleCategory, setSelectedMuscleCategory] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState('Barbell Bench Press');
  const [segmentalView, setSegmentalView] = useState('muscle'); // 'muscle' | 'fat'
  const [muscleFocusSide, setMuscleFocusSide] = useState('front'); // 'front' | 'back'
  const [searchExercise, setSearchExercise] = useState('');

  // Modals state
  const [showNewWorkoutModal, setShowNewWorkoutModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [showEditGoalsModal, setShowEditGoalsModal] = useState(false);

  // New workout form state
  const [newWorkout, setNewWorkout] = useState({ title: 'Push Day', focus: 'Chest • Shoulders • Triceps', duration: '60', volume: '7500', calories: '550', notes: '' });

  // Custom Workouts Data
  const [workoutsList, setWorkoutsList] = useState([
    { id: 1, title: 'Push Day', time: 'Today, 7:00 AM', focus: 'Chest, Shoulders, Triceps', duration: '75 min', volume: '8,250 kg', calories: '620 kcal', notes: '—', status: 'Completed' },
    { id: 2, title: 'Pull Day', time: 'Yesterday, 6:30 PM', focus: 'Back, Biceps, Rear Delts', duration: '70 min', volume: '6,200 kg', calories: '560 kcal', notes: 'Felt strong 💪', status: 'Completed' },
    { id: 3, title: 'Leg Day', time: '16 May 2026', focus: 'Quads, Hamstrings, Calves', duration: '80 min', volume: '7,100 kg', calories: '720 kcal', notes: '—', status: 'Completed' },
    { id: 4, title: 'Push Day', time: '14 May 2026', focus: 'Chest, Shoulders, Triceps', duration: '65 min', volume: '6,000 kg', calories: '480 kcal', notes: 'Added reps', status: 'Completed' },
    { id: 5, title: 'Pull Day', time: '12 May 2026', focus: 'Back, Biceps, Rear Delts', duration: '60 min', volume: '5,600 kg', calories: '450 kcal', notes: '—', status: 'Completed' },
    { id: 6, title: 'Leg Day', time: '10 May 2026', focus: 'Quads, Hamstrings, Calves', duration: '75 min', volume: '6,550 kg', calories: '610 kcal', notes: 'PR on Squat 🏋️', status: 'Completed' },
    { id: 7, title: 'Rest Day', time: '9 May 2026', focus: '—', duration: '—', volume: '—', calories: '—', notes: 'Active recovery', status: 'Rest Day' },
    { id: 8, title: 'Upper Body Strength', time: '7 May 2026', focus: 'Chest, Back, Shoulders, Arms', duration: '70 min', volume: '6,000 kg', calories: '530 kcal', notes: 'Good pump', status: 'Completed' },
  ]);

  const handleAddWorkout = (e) => {
    e.preventDefault();
    const created = {
      id: Date.now(),
      title: newWorkout.title,
      time: 'Just now',
      focus: newWorkout.focus,
      duration: `${newWorkout.duration} min`,
      volume: `${Number(newWorkout.volume).toLocaleString()} kg`,
      calories: `${newWorkout.calories} kcal`,
      notes: newWorkout.notes || 'Good session 👍',
      status: 'Completed'
    };
    setWorkoutsList([created, ...workoutsList]);
    setShowNewWorkoutModal(false);
  };

  // Exercises Library Data
  const exerciseCategories = [
    { id: 'all', label: 'All Exercises', count: 156 },
    { id: 'chest', label: 'Chest', count: 12 },
    { id: 'back', label: 'Back', count: 15 },
    { id: 'legs', label: 'Legs', count: 20 },
    { id: 'shoulders', label: 'Shoulders', count: 10 },
    { id: 'arms', label: 'Arms', count: 18 },
    { id: 'core', label: 'Core', count: 12 },
    { id: 'cardio', label: 'Cardio', count: 8 },
    { id: 'fullbody', label: 'Full Body', count: 6 },
  ];

  const exercisesData = [
    {
      name: 'Barbell Bench Press',
      group: 'Chest',
      equipment: 'Barbell, Bench',
      difficulty: 'Intermediate',
      primary: 'Chest',
      secondary: 'Triceps, Shoulders',
      instructions: [
        'Lie on the bench with your feet flat on the floor.',
        'Grip the barbell slightly wider than shoulder width.',
        'Lower the bar slowly to the middle of your chest.',
        'Press the bar back up until your arms are fully extended.',
        'Repeat for the desired number of reps.'
      ],
      tips: [
        'Keep your back flat and shoulder blades retracted.',
        'Control the movement and avoid bouncing the bar.',
        'Focus on chest contraction during the press.'
      ],
      activation: { chest: 90, triceps: 60, shoulders: 40 },
      sets: 28, reps: 245, best1rm: '80 kg'
    },
    {
      name: 'Barbell Back Squat',
      group: 'Legs',
      equipment: 'Barbell',
      difficulty: 'Advanced',
      primary: 'Quads, Glutes',
      secondary: 'Hamstrings, Core',
      instructions: [
        'Place the bar across your upper back muscles.',
        'Stand with feet shoulder-width apart.',
        'Hinge at hips and bend knees to lower your body.',
        'Squat until thighs are parallel to the floor.',
        'Drive through your heels to stand back up.'
      ],
      tips: [
        'Keep chest up and knees tracking over toes.',
        'Breathe deep into your core before squatting.'
      ],
      activation: { chest: 0, triceps: 0, shoulders: 0, legs: 95 },
      sets: 20, reps: 180, best1rm: '100 kg'
    },
    {
      name: 'Pull Up',
      group: 'Back',
      equipment: 'Bodyweight',
      difficulty: 'Intermediate',
      primary: 'Lats, Upper Back',
      secondary: 'Biceps, Core',
      instructions: [
        'Grip the pull-up bar with palms facing away.',
        'Hang with arms fully extended.',
        'Pull your chest up toward the bar by driving elbows down.',
        'Lower with control back to dead hang.'
      ],
      tips: ['Engage your core and avoid swinging.'],
      activation: { back: 92, biceps: 70 },
      sets: 18, reps: 140, best1rm: 'BW + 15 kg'
    },
    {
      name: 'Dumbbell Shoulder Press',
      group: 'Shoulders',
      equipment: 'Dumbbell, Bench',
      difficulty: 'Intermediate',
      primary: 'Deltoids',
      secondary: 'Triceps',
      instructions: [
        'Sit on an upright bench holding dumbbells at shoulder height.',
        'Press weights overhead until arms are extended.',
        'Lower weights back down under control.'
      ],
      tips: ['Don’t arch your back excessively.'],
      activation: { shoulders: 88, triceps: 50 },
      sets: 16, reps: 160, best1rm: '40 kg'
    },
    {
      name: 'Deadlift',
      group: 'Back, Legs',
      equipment: 'Barbell',
      difficulty: 'Advanced',
      primary: 'Hamstrings, Glutes, Lower Back',
      secondary: 'Traps, Forearms',
      instructions: [
        'Stand with feet hip-width apart under the bar.',
        'Hinge hips and grip the bar.',
        'Keep spine neutral and lift bar by extending hips and knees.'
      ],
      tips: ['Keep bar close to your shins throughout.'],
      activation: { back: 85, legs: 90 },
      sets: 15, reps: 110, best1rm: '120 kg'
    },
    {
      name: 'Dumbbell Bicep Curl',
      group: 'Arms',
      equipment: 'Dumbbell',
      difficulty: 'Beginner',
      primary: 'Biceps',
      secondary: 'Forearms',
      instructions: ['Stand straight holding dumbbells.', 'Curl weights up toward shoulders.', 'Lower with control.'],
      tips: ['Keep elbows tucked to your sides.'],
      activation: { biceps: 95 },
      sets: 22, reps: 220, best1rm: '18 kg'
    },
    {
      name: 'Cable Tricep Pushdown',
      group: 'Arms',
      equipment: 'Cable Machine',
      difficulty: 'Beginner',
      primary: 'Triceps',
      secondary: 'Forearms',
      instructions: ['Attach rope or bar to high pulley.', 'Push handle down until arms are locked out.', 'Return under control.'],
      tips: ['Keep upper arms stationary.'],
      activation: { triceps: 92 },
      sets: 24, reps: 260, best1rm: '35 kg'
    },
    {
      name: 'Plank',
      group: 'Core',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      primary: 'Abs, Obliques',
      secondary: 'Shoulders',
      instructions: ['Place forearms on floor with elbows under shoulders.', 'Keep body in straight line from head to heels.', 'Hold for target duration.'],
      tips: ['Squeeze glutes and brace core.'],
      activation: { core: 95 },
      sets: 12, reps: 12, best1rm: '2 min'
    }
  ];

  const activeExerciseObj = exercisesData.find(e => e.name === selectedExercise) || exercisesData[0];

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

        {/* Top 4 Metrics Summary Bar */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-elevated border border-border-subtle">
            <span className="text-base">🔥</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">12</p>
              <p className="text-[9px] text-text-muted">Workouts This Month</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-elevated border border-border-subtle">
            <span className="text-base">🏆</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">47.5 kg</p>
              <p className="text-[9px] text-text-muted">Total Volume (Lifted)</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-elevated border border-border-subtle">
            <span className="text-base">⭐</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">18</p>
              <p className="text-[9px] text-text-muted">Personal Records</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-elevated border border-border-subtle">
            <span className="text-base">⚡</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">{streak}</p>
              <p className="text-[9px] text-text-muted">Active Streak Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-1 overflow-x-auto sidebar-scroll">
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
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-purple text-white shadow-glow-primary'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Top Row Cards (3 cols) */}
          <div className="grid grid-cols-12 gap-4">
            {/* Today's Workout Card (5 cols) */}
            <div className="col-span-5 card p-4 space-y-3 bg-gradient-to-br from-surface to-surface-elevated relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary">Today's Workout</span>
                <span className="badge-success text-[9px]">Completed</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple/10 text-purple flex items-center justify-center">
                      <FiActivity size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text-primary">Push Day</h3>
                      <p className="text-[10px] text-text-muted">Chest • Shoulders • Triceps</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-3 text-center">
                    <div className="p-1.5 rounded-lg bg-background/50">
                      <p className="text-[8px] text-text-muted">Exercises</p>
                      <p className="text-xs font-bold font-mono text-text-primary">6</p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-background/50">
                      <p className="text-[8px] text-text-muted">Duration</p>
                      <p className="text-xs font-bold font-mono text-text-primary">75 min</p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-background/50">
                      <p className="text-[8px] text-text-muted">Volume</p>
                      <p className="text-xs font-bold font-mono text-text-primary">8,250 kg</p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-background/50">
                      <p className="text-[8px] text-text-muted">Calories</p>
                      <p className="text-xs font-bold font-mono text-text-primary">620 kcal</p>
                    </div>
                  </div>
                </div>

                {/* Muscle Vector Graphic Overlay */}
                <div className="w-24 h-24 relative flex items-center justify-center opacity-80">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-purple fill-current">
                    <circle cx="50" cy="20" r="10" opacity="0.3" />
                    <path d="M 35 35 Q 50 30 65 35 L 75 60 L 65 60 L 60 42 L 50 85 L 40 42 L 35 60 L 25 60 Z" opacity="0.6" />
                  </svg>
                </div>
              </div>

              <button onClick={() => setActiveTab('workouts')} className="btn-outline text-xs w-full py-2">
                View Workout Details
              </button>
            </div>

            {/* Weekly Activity Card (4 cols) */}
            <div className="col-span-4 card p-4 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="section-title">Weekly Activity</h3>
                <span onClick={() => setActiveTab('calendar')} className="section-link">View Calendar</span>
              </div>

              <div className="flex justify-between items-center px-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <span className="text-[9px] text-text-muted font-mono">{day}</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      i < 5 ? 'bg-success text-white' : i === 5 ? 'bg-purple text-white' : 'bg-surface-elevated text-text-muted'
                    }`}>
                      {i < 5 ? '✓' : i === 5 ? '✓' : '•'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-1 pt-2 border-t border-border-subtle text-center">
                <div><p className="text-[8px] text-text-muted">Workouts</p><p className="text-xs font-bold font-mono text-text-primary">5 / 6</p></div>
                <div><p className="text-[8px] text-text-muted">Hours</p><p className="text-xs font-bold font-mono text-text-primary">6.4</p></div>
                <div><p className="text-[8px] text-text-muted">Calories</p><p className="text-xs font-bold font-mono text-text-primary">2,850 kcal</p></div>
                <div><p className="text-[8px] text-text-muted">Avg. Volume</p><p className="text-xs font-bold font-mono text-text-primary">7,200 kg</p></div>
              </div>
            </div>

            {/* Current Streak Dial Card (3 cols) */}
            <div className="col-span-3 card p-4 flex flex-col items-center justify-center text-center space-y-2">
              <h3 className="section-title text-xs">Current Streak</h3>
              <div className="relative w-28 h-28 my-1">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                  <circle cx="56" cy="56" r="44" stroke="#161A2E" strokeWidth="10" fill="none" />
                  <circle cx="56" cy="56" r="44" stroke="#22C55E" strokeWidth="10" strokeDasharray="240 276" fill="none" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold font-mono text-text-primary">28</span>
                  <span className="text-[9px] text-text-muted">Days</span>
                </div>
              </div>
              <p className="text-[10px] text-text-muted">Best Streak: <strong className="text-text-primary">32 days</strong></p>
            </div>
          </div>

          {/* Middle Row (Workout History + Progress Overview + Personal Records) */}
          <div className="grid grid-cols-12 gap-4">
            {/* Workout History (4 cols) */}
            <div className="col-span-4 card p-4 space-y-3">
              <div className="section-header">
                <h3 className="section-title">Workout History</h3>
                <span onClick={() => setActiveTab('workouts')} className="section-link">View All</span>
              </div>
              <div className="space-y-2">
                {[
                  { title: 'Upper Body Strength', date: '15 May 2026', dur: '75 min', vol: '7,800 kg' },
                  { title: 'Lower Body Power', date: '13 May 2026', dur: '70 min', vol: '6,900 kg' },
                  { title: 'Push Day', date: '11 May 2026', dur: '65 min', vol: '6,200 kg' },
                  { title: 'Pull Day', date: '9 May 2026', dur: '60 min', vol: '5,600 kg' },
                  { title: 'Leg Day', date: '7 May 2026', dur: '80 min', vol: '7,100 kg' },
                ].map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated/40 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple/10 text-purple flex items-center justify-center">
                        <FiActivity size={14} />
                      </div>
                      <div>
                        <p className="font-bold text-text-primary leading-tight">{w.title}</p>
                        <p className="text-[9px] text-text-muted">{w.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="text-text-muted">{w.dur}</span>
                      <span className="font-bold text-text-primary">{w.vol}</span>
                      <FiCheckCircle className="text-success" size={12} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Overview Volume Bar Chart (5 cols) */}
            <div className="col-span-5 card p-4 space-y-3">
              <div className="section-header">
                <h3 className="section-title">Progress Overview</h3>
                <span className="text-xs text-text-muted">Volume (kg) ▾</span>
              </div>

              {/* Volume Bars */}
              <div className="h-36 flex items-end justify-between gap-1.5 px-1 pt-4 pb-2 border-b border-border-subtle relative">
                <div className="absolute top-2 left-1/3 p-1 rounded bg-surface border border-border-subtle text-[8px] font-mono text-text-primary z-10">
                  16 May 2026<br /><strong className="text-purple">Volume: 8,450 kg</strong>
                </div>
                {[40, 75, 50, 65, 55, 85, 45, 60, 90, 70, 80].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div className={`w-full rounded-t-md ${i === 5 ? 'bg-purple shadow-glow-primary' : 'bg-primary/40'}`} style={{ height: `${h}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[8px] text-text-muted font-mono">
                <span>9 May</span><span>15 May</span><span>23 May</span><span>30 May</span><span>6 Jun</span><span>13 Jun</span>
              </div>

              <div className="grid grid-cols-4 gap-1 text-center pt-1">
                <div className="p-1.5 rounded-lg bg-surface-elevated"><p className="text-[8px] text-text-muted">Total Workouts</p><p className="text-xs font-bold font-mono text-text-primary">23</p></div>
                <div className="p-1.5 rounded-lg bg-surface-elevated"><p className="text-[8px] text-text-muted">Total Volume</p><p className="text-xs font-bold font-mono text-text-primary">162,500 kg</p></div>
                <div className="p-1.5 rounded-lg bg-surface-elevated"><p className="text-[8px] text-text-muted">Total Time</p><p className="text-xs font-bold font-mono text-text-primary">28.5 hrs</p></div>
                <div className="p-1.5 rounded-lg bg-surface-elevated"><p className="text-[8px] text-text-muted">Avg. Volume/Workout</p><p className="text-xs font-bold font-mono text-text-primary">7,065 kg</p></div>
              </div>
            </div>

            {/* Personal Records List (3 cols) */}
            <div className="col-span-3 card p-4 space-y-3">
              <div className="section-header">
                <h3 className="section-title">Personal Records</h3>
                <span onClick={() => setActiveTab('progress')} className="section-link">View All</span>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { name: 'Bench Press', val: '80 kg', isNew: true },
                  { name: 'Squat', val: '100 kg', isNew: true },
                  { name: 'Deadlift', val: '120 kg', date: '2 weeks ago' },
                  { name: 'Overhead Press', val: '40 kg', date: '3 weeks ago' },
                  { name: 'Pull Ups', val: '15 reps', date: '2 weeks ago' },
                ].map((pr, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated/40">
                    <span className="font-bold text-text-primary flex items-center gap-1.5">
                      <span>🏋️</span> {pr.name}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="font-bold text-text-primary">{pr.val}</span>
                      {pr.isNew ? (
                        <span className="badge-success text-[8px] px-1 py-0">New PR!</span>
                      ) : (
                        <span className="text-[8px] text-text-muted">{pr.date}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row Cards (Muscle Group Focus + Nutrition Summary + Daily Goals + Body Stats) */}
          <div className="grid grid-cols-12 gap-4">
            {/* Muscle Group Focus Donut (3 cols) */}
            <div className="col-span-3 card p-4 space-y-2">
              <h3 className="section-title text-xs">Muscle Group Focus</h3>
              <div className="flex items-center justify-center my-1">
                <div className="relative w-28 h-28">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                    <circle cx="56" cy="56" r="44" stroke="#A855F7" strokeWidth="12" strokeDasharray="55 221" fill="none" />
                    <circle cx="56" cy="56" r="44" stroke="#06B6D4" strokeWidth="12" strokeDasharray="55 221" strokeDashoffset="-55" fill="none" />
                    <circle cx="56" cy="56" r="44" stroke="#22C55E" strokeWidth="12" strokeDasharray="68 208" strokeDashoffset="-110" fill="none" />
                    <circle cx="56" cy="56" r="44" stroke="#F59E0B" strokeWidth="12" strokeDasharray="41 235" strokeDashoffset="-178" fill="none" />
                    <circle cx="56" cy="56" r="44" stroke="#F43F5E" strokeWidth="12" strokeDasharray="27 249" strokeDashoffset="-219" fill="none" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[9px] text-text-muted text-center leading-tight">Muscle<br />Groups</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[9px]">
                <div className="flex justify-between"><span className="text-purple">• Chest</span><span className="font-mono text-text-primary">20%</span></div>
                <div className="flex justify-between"><span className="text-info">• Back</span><span className="font-mono text-text-primary">20%</span></div>
                <div className="flex justify-between"><span className="text-success">• Legs</span><span className="font-mono text-text-primary">25%</span></div>
                <div className="flex justify-between"><span className="text-warning">• Shoulders</span><span className="font-mono text-text-primary">15%</span></div>
                <div className="flex justify-between"><span className="text-danger">• Arms</span><span className="font-mono text-text-primary">10%</span></div>
                <div className="flex justify-between"><span className="text-text-muted">• Other</span><span className="font-mono text-text-primary">10%</span></div>
              </div>
            </div>

            {/* Nutrition Summary Donut (3 cols) */}
            <div className="col-span-3 card p-4 space-y-2">
              <h3 className="section-title text-xs">Nutrition Summary</h3>
              <div className="flex items-center justify-center my-1">
                <div className="relative w-28 h-28">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                    <circle cx="56" cy="56" r="44" stroke="#A855F7" strokeWidth="12" strokeDasharray="80 196" fill="none" />
                    <circle cx="56" cy="56" r="44" stroke="#22C55E" strokeWidth="12" strokeDasharray="130 146" strokeDashoffset="-80" fill="none" />
                    <circle cx="56" cy="56" r="44" stroke="#F59E0B" strokeWidth="12" strokeDasharray="60 216" strokeDashoffset="-210" fill="none" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold font-mono text-text-primary">2,350</span>
                    <span className="text-[8px] text-text-muted">kcal</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-[9px]">
                <div className="flex justify-between"><span className="text-purple">• Protein</span><span className="font-mono text-text-primary">120g (30%)</span></div>
                <div className="flex justify-between"><span className="text-success">• Carbs</span><span className="font-mono text-text-primary">280g (47%)</span></div>
                <div className="flex justify-between"><span className="text-warning">• Fats</span><span className="font-mono text-text-primary">70g (23%)</span></div>
              </div>
              <p className="text-[8px] text-text-muted text-center pt-1 border-t border-border-subtle">
                Goal: 2,400 kcal • Potassium 2.1g • Water 2.6L
              </p>
            </div>

            {/* Daily Goals Progress Bars (3 cols) */}
            <div className="col-span-3 card p-4 space-y-2.5">
              <div className="section-header">
                <h3 className="section-title text-xs">Daily Goals</h3>
                <span onClick={() => setShowEditGoalsModal(true)} className="section-link">Edit Goals</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-text-secondary flex items-center gap-1">🏋️ Workouts</span>
                    <span className="font-mono font-bold text-text-primary">1 / 1</span>
                  </div>
                  <div className="progress-bar h-1.5"><div className="progress-fill bg-success" style={{ width: '100%' }} /></div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-text-secondary flex items-center gap-1">🔥 Calories</span>
                    <span className="font-mono font-bold text-text-primary">2,350 / 2,400 kcal</span>
                  </div>
                  <div className="progress-bar h-1.5"><div className="progress-fill bg-success" style={{ width: '97%' }} /></div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-text-secondary flex items-center gap-1">🥩 Protein</span>
                    <span className="font-mono font-bold text-text-primary">120 / 120 g</span>
                  </div>
                  <div className="progress-bar h-1.5"><div className="progress-fill bg-success" style={{ width: '100%' }} /></div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-text-secondary flex items-center gap-1">💧 Water</span>
                    <span className="font-mono font-bold text-text-primary">2.6 / 3 L</span>
                  </div>
                  <div className="progress-bar h-1.5"><div className="progress-fill bg-info" style={{ width: '86%' }} /></div>
                </div>
              </div>
            </div>

            {/* Body Stats Card (3 cols) */}
            <div className="col-span-3 card p-4 space-y-2">
              <div className="section-header">
                <h3 className="section-title text-xs">Body Stats</h3>
                <span onClick={() => setActiveTab('body-stats')} className="section-link">View Progress</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-surface-elevated/40">
                  <div>
                    <p className="text-[9px] text-text-muted">Weight</p>
                    <p className="font-bold font-mono text-text-primary">60.5 kg</p>
                  </div>
                  <span className="text-success text-[10px] font-mono font-bold">-0.8 kg</span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded-lg bg-surface-elevated/40">
                  <div>
                    <p className="text-[9px] text-text-muted">Body Fat</p>
                    <p className="font-bold font-mono text-text-primary">14.2 %</p>
                  </div>
                  <span className="text-success text-[10px] font-mono font-bold">-1.2 %</span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded-lg bg-surface-elevated/40">
                  <div>
                    <p className="text-[9px] text-text-muted">Muscle Mass</p>
                    <p className="font-bold font-mono text-text-primary">51.8 kg</p>
                  </div>
                  <span className="text-success text-[10px] font-mono font-bold">+1.1 kg</span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded-lg bg-surface-elevated/40">
                  <div>
                    <p className="text-[9px] text-text-muted">BMI</p>
                    <p className="font-bold font-mono text-text-primary">20.9</p>
                  </div>
                  <span className="badge-success text-[8px]">Normal</span>
                </div>
              </div>

              <p className="text-[8px] text-text-muted text-center pt-1 border-t border-border-subtle">
                Last Updated: 15 May 2026
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB TAB 2: WORKOUTS */}
      {activeTab === 'workouts' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Top Bar Filters & New Workout Button */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Workouts</h2>
              <p className="text-xs text-text-muted">Track and manage all your workouts.</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-text-muted bg-surface-elevated px-3 py-1.5 rounded-xl border border-border-subtle cursor-pointer">All Workouts ▾</span>
              <span className="text-xs text-text-muted bg-surface-elevated px-3 py-1.5 rounded-xl border border-border-subtle cursor-pointer">May 12 – May 18, 2026 ▾</span>
              <button onClick={() => setShowNewWorkoutModal(true)} className="btn-primary text-xs bg-purple hover:bg-purple/80 flex items-center gap-1.5">
                <FiPlus size={16} /> New Workout
              </button>
            </div>
          </div>

          {/* 4 Weekly Metric Stat Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="card p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center font-bold text-lg">🏋️</div>
              <div><p className="text-[10px] text-text-muted">Workouts This Week</p><p className="text-lg font-bold font-mono text-text-primary">6</p></div>
            </div>
            <div className="card p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center font-bold text-lg">⏱️</div>
              <div><p className="text-[10px] text-text-muted">Total Duration This Week</p><p className="text-lg font-bold font-mono text-text-primary">6h 40m</p></div>
            </div>
            <div className="card p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center font-bold text-lg">🏆</div>
              <div><p className="text-[10px] text-text-muted">Total Volume This Week</p><p className="text-lg font-bold font-mono text-text-primary">22,450 kg</p></div>
            </div>
            <div className="card p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center font-bold text-lg">🔥</div>
              <div><p className="text-[10px] text-text-muted">Calories Burned This Week</p><p className="text-lg font-bold font-mono text-text-primary">4,250 kcal</p></div>
            </div>
          </div>

          {/* Main Grid: Workouts Table (8 cols) + Right Widgets (4 cols) */}
          <div className="grid grid-cols-12 gap-4">
            {/* Left Workouts Table (8 cols) */}
            <div className="col-span-8 card overflow-hidden space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface-elevated/50 text-[10px] text-text-muted uppercase">
                      <th className="py-2.5 px-3">Workout</th>
                      <th className="py-2.5 px-3">Focus Area</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Volume</th>
                      <th className="py-2.5 px-3">Calories</th>
                      <th className="py-2.5 px-3">Notes</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {workoutsList.map(w => (
                      <tr key={w.id} className="hover:bg-surface-elevated/40">
                        <td className="py-3 px-3 font-bold text-text-primary flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-purple/10 text-purple flex items-center justify-center text-xs">🏋️</div>
                          <div>
                            <p className="leading-tight">{w.title}</p>
                            <p className="text-[9px] text-text-muted font-normal">{w.time}</p>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-text-secondary text-[11px]">{w.focus}</td>
                        <td className="py-3 px-3 font-mono text-text-muted text-[11px]">{w.duration}</td>
                        <td className="py-3 px-3 font-mono font-bold text-text-primary text-[11px]">{w.volume}</td>
                        <td className="py-3 px-3 font-mono text-text-muted text-[11px]">{w.calories}</td>
                        <td className="py-3 px-3 text-text-muted text-[10px]">{w.notes}</td>
                        <td className="py-3 px-3">
                          <span className={w.status === 'Completed' ? 'badge-success text-[8px]' : 'badge-info text-[8px]'}>{w.status}</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <FiMoreVertical size={14} className="text-text-muted hover:text-text-primary cursor-pointer inline-block" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="text-xs font-semibold text-purple hover:underline w-full text-center py-2 border-t border-border-subtle">
                Load More ▾
              </button>
            </div>

            {/* Right Column Widgets (4 cols) */}
            <div className="col-span-4 space-y-4">
              {/* Muscle Focus Vector Diagram Card */}
              <div className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="section-title text-xs">Muscle Focus</h3>
                  <div className="flex items-center gap-1 border border-border-subtle rounded-lg p-0.5 bg-surface-elevated text-[10px]">
                    <button onClick={() => setMuscleFocusSide('front')} className={`px-2 py-0.5 rounded ${muscleFocusSide === 'front' ? 'bg-purple text-white' : 'text-text-muted'}`}>Front</button>
                    <button onClick={() => setMuscleFocusSide('back')} className={`px-2 py-0.5 rounded ${muscleFocusSide === 'back' ? 'bg-purple text-white' : 'text-text-muted'}`}>Back</button>
                  </div>
                </div>

                <div className="flex justify-center my-2 gap-4">
                  {/* Front/Back Body Graphics */}
                  <div className="w-20 h-40 relative flex flex-col items-center justify-center bg-surface-elevated/40 rounded-xl p-2">
                    <span className="text-xs font-mono text-text-muted mb-1">{muscleFocusSide.toUpperCase()}</span>
                    <svg viewBox="0 0 100 200" className="w-full h-full text-purple fill-current">
                      <circle cx="50" cy="20" r="12" fill="#3B82F6" opacity="0.3" />
                      <path d="M 30 45 Q 50 38 70 45 L 82 85 L 70 85 L 65 60 L 55 180 L 45 180 L 35 60 L 30 85 L 18 85 Z" fill="#A855F7" opacity="0.7" />
                    </svg>
                  </div>
                </div>

                <div className="flex justify-between text-[9px] text-text-muted border-t border-border-subtle pt-2">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple inline-block" /> Primary</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-light inline-block" /> Secondary</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-surface-elevated border border-border-subtle inline-block" /> Not Trained</span>
                </div>
              </div>

              {/* Workout History Grid */}
              <div className="card p-4 space-y-2">
                <div className="section-header">
                  <h3 className="section-title text-xs">Workout History</h3>
                  <span className="section-link">View All</span>
                </div>

                <div className="space-y-1 text-[9px] font-mono">
                  <div className="flex justify-between text-text-muted"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
                  {[
                    [1, 1, 1, 1, 1, 0, 0],
                    [1, 1, 1, 1, 1, 1, 0],
                    [1, 1, 1, 1, 1, 0, 0],
                    [1, 0, 1, 1, 1, 0, 0]
                  ].map((row, r) => (
                    <div key={r} className="grid grid-cols-7 gap-1">
                      {row.map((val, c) => (
                        <div key={c} className={`h-3 rounded-full ${val === 1 ? 'bg-success' : c % 2 === 0 ? 'border border-purple text-purple' : 'bg-surface-elevated'}`} />
                      ))}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-[8px] text-text-muted pt-1 border-t border-border-subtle">
                  <span>🟢 Workout</span><span>🟣 Rest Day</span><span>⚪ No Workout</span>
                </div>
              </div>

              {/* Top Exercises List */}
              <div className="card p-4 space-y-2">
                <div className="section-header">
                  <h3 className="section-title text-xs">Top Exercises</h3>
                  <span className="text-xs text-text-muted">This Month ▾</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {[
                    { name: 'Bench Press', sets: 24, vol: '5,200 kg' },
                    { name: 'Squat', sets: 20, vol: '4,800 kg' },
                    { name: 'Deadlift', sets: 18, vol: '4,500 kg' },
                    { name: 'Overhead Press', sets: 16, vol: '2,800 kg' },
                    { name: 'Pull Ups', sets: 15, vol: '1,600 kg' },
                  ].map((ex, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-surface-elevated/40">
                      <span className="font-bold text-text-primary flex items-center gap-1">🏋️ {ex.name}</span>
                      <div className="flex items-center gap-3 font-mono text-[10px]">
                        <span className="text-text-muted">{ex.sets} Sets</span>
                        <span className="font-bold text-text-primary">{ex.vol}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={() => setActiveTab('exercises')} className="text-xs font-semibold text-purple hover:underline w-full text-center pt-1 block">
                  View All Exercises →
                </button>
              </div>
            </div>
          </div>

          {/* Recent PRs Card Row (4 items) */}
          <div className="space-y-2">
            <h3 className="section-title text-xs">Recent PRs</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { name: 'Squat', weight: '120 kg', diff: '+5 kg', date: '16 May 2026', color: 'success' },
                { name: 'Bench Press', weight: '100 kg', diff: '+2.5 kg', date: '14 May 2026', color: 'info' },
                { name: 'Deadlift', weight: '150 kg', diff: '+5 kg', date: '10 May 2026', color: 'purple' },
                { name: 'Pull Ups (BW)', weight: '15 reps', diff: '+2 reps', date: '12 May 2026', color: 'warning' },
              ].map((pr, i) => (
                <div key={i} className="card p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl bg-${pr.color}/10 text-${pr.color} flex items-center justify-center font-bold text-base`}>🏆</div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">{pr.name}</p>
                      <p className="text-[9px] text-text-muted">{pr.date}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-sm font-bold text-text-primary">{pr.weight}</p>
                    <span className="text-[9px] font-bold text-success">{pr.diff}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB TAB 3: PROGRESS */}
      {activeTab === 'progress' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Top Section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Progress Overview</h2>
              <p className="text-xs text-text-muted">Track your fitness journey and see how far you've come.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-muted bg-surface-elevated px-3 py-1.5 rounded-xl border border-border-subtle cursor-pointer">May 12 – May 18, 2026 ▾</span>
              <span className="text-xs text-text-muted bg-surface-elevated px-3 py-1.5 rounded-xl border border-border-subtle cursor-pointer">All Time ▾</span>
            </div>
          </div>

          {/* 5 Stat Cards Row */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Total Workouts', val: '128', sub: '↑ 18% vs last 30 days', icon: '🏋️', color: 'info' },
              { label: 'Total Volume', val: '2,450 kg', sub: '↑ 24% vs last 30 days', icon: '🏆', color: 'success' },
              { label: 'Total Calories Burned', val: '18,450 kcal', sub: '↑ 16% vs last 30 days', icon: '🔥', color: 'warning' },
              { label: 'Total Duration', val: '68h 35m', sub: '↑ 14% vs last 30 days', icon: '⏱️', color: 'purple' },
              { label: 'Avg. Workout / Week', val: '5.1', sub: '↑ 12% vs last 30 days', icon: '⚡', color: 'danger' },
            ].map((stat, i) => (
              <div key={i} className="card p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-lg">{stat.icon}</span>
                  <span className="text-[9px] text-success font-semibold">{stat.sub}</span>
                </div>
                <p className="text-[10px] text-text-muted font-medium">{stat.label}</p>
                <p className="text-lg font-bold font-mono text-text-primary">{stat.val}</p>
              </div>
            ))}
          </div>

          {/* Main Grid: Left Area (8 cols) + Right Area (4 cols) */}
          <div className="grid grid-cols-12 gap-4">
            {/* Left Area (8 cols) */}
            <div className="col-span-8 space-y-4">
              {/* Charts Row (Workout Frequency + Training Volume) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-4 space-y-2">
                  <div className="section-header">
                    <h3 className="section-title text-xs">Workout Frequency</h3>
                    <span className="text-[9px] text-text-muted">Weekly ▾</span>
                  </div>
                  <div className="h-28 relative">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                      <path d="M 0 70 L 20 60 L 40 50 L 60 30 L 80 20 L 100 30" fill="none" stroke="#A855F7" strokeWidth="3" />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[8px] text-text-muted font-mono">
                    <span>Apr 13-19</span><span>Apr 20-26</span><span>Apr 27-May 3</span><span>May 4-10</span><span>May 11-17</span><span>May 18-24</span>
                  </div>
                </div>

                <div className="card p-4 space-y-2">
                  <div className="section-header">
                    <h3 className="section-title text-xs">Training Volume</h3>
                    <span className="text-[9px] text-text-muted">Weekly ▾</span>
                  </div>
                  <div className="h-28 relative">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                      <path d="M 0 80 L 20 65 L 40 55 L 60 40 L 80 25 L 100 20 L 100 100 L 0 100 Z" fill="rgba(34, 197, 94, 0.15)" />
                      <path d="M 0 80 L 20 65 L 40 55 L 60 40 L 80 25 L 100 20" fill="none" stroke="#22C55E" strokeWidth="3" />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[8px] text-text-muted font-mono">
                    <span>Apr 13-19</span><span>Apr 20-26</span><span>Apr 27-May 3</span><span>May 4-10</span><span>May 11-17</span><span>May 18-24</span>
                  </div>
                </div>
              </div>

              {/* Muscle Group Progress Bars + Strength Progress Table */}
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-4 space-y-2.5">
                  <div className="section-header">
                    <h3 className="section-title text-xs">Muscle Group Progress</h3>
                    <span className="text-[9px] text-text-muted">This Month ▾</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {[
                      { name: 'Chest', val: '520 kg', pct: '+18%', color: 'bg-purple' },
                      { name: 'Back', val: '680 kg', pct: '+24%', color: 'bg-info' },
                      { name: 'Legs', val: '750 kg', pct: '+22%', color: 'bg-success' },
                      { name: 'Shoulders', val: '320 kg', pct: '+15%', color: 'bg-warning' },
                      { name: 'Arms', val: '180 kg', pct: '+10%', color: 'bg-danger' },
                      { name: 'Core', val: '120 kg', pct: '+8%', color: 'bg-purple-light' },
                    ].map((m, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="font-bold text-text-primary">{m.name}</span>
                          <span className="font-mono text-text-muted">{m.val} <strong className="text-success">{m.pct}</strong></span>
                        </div>
                        <div className="progress-bar h-1.5"><div className={`progress-fill ${m.color}`} style={{ width: `${60 + i * 5}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-4 space-y-2.5">
                  <div className="section-header">
                    <h3 className="section-title text-xs">Strength Progress (Top Lifts)</h3>
                    <span className="text-[9px] text-text-muted">All Time ▾</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border-subtle text-[9px] text-text-muted uppercase">
                          <th className="py-1.5">Exercise</th>
                          <th className="py-1.5">Start</th>
                          <th className="py-1.5">Current</th>
                          <th className="py-1.5 text-right">Progress</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle font-mono text-[10px]">
                        {[
                          { name: 'Bench Press', start: '60 kg', curr: '100 kg', pct: '↑ 66.7%' },
                          { name: 'Squat', start: '80 kg', curr: '140 kg', pct: '↑ 75%' },
                          { name: 'Deadlift', start: '100 kg', curr: '150 kg', pct: '↑ 50%' },
                          { name: 'Overhead Press', start: '40 kg', curr: '70 kg', pct: '↑ 75%' },
                          { name: 'Pull Ups (BW)', start: '5 reps', curr: '15 reps', pct: '↑ 100%' },
                        ].map((row, i) => (
                          <tr key={i}>
                            <td className="py-2 font-bold text-text-primary font-sans">{row.name}</td>
                            <td className="py-2 text-text-muted">{row.start}</td>
                            <td className="py-2 font-bold text-text-primary">{row.curr}</td>
                            <td className="py-2 text-right text-success font-bold">{row.pct}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Recent PR Sparkline Cards Row */}
              <div className="grid grid-cols-5 gap-3">
                {[
                  { name: 'Bench Press', val: '100 kg', date: 'May 14, 2026' },
                  { name: 'Squat', val: '140 kg', date: 'May 12, 2026' },
                  { name: 'Deadlift', val: '150 kg', date: 'May 10, 2026' },
                  { name: 'Overhead Press', val: '70 kg', date: 'May 8, 2026' },
                  { name: 'Pull Ups', val: '15 reps', date: 'May 6, 2026' },
                ].map((pr, i) => (
                  <div key={i} className="card p-2.5 space-y-1 text-center">
                    <p className="text-[9px] text-text-muted">{pr.name}</p>
                    <p className="text-xs font-bold font-mono text-text-primary">{pr.val}</p>
                    <p className="text-[7px] text-text-muted">{pr.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Area (4 cols) */}
            <div className="col-span-4 space-y-4">
              {/* Progress Summary Gauge Card */}
              <div className="card p-4 space-y-3 text-center">
                <h3 className="section-title text-xs">Progress Summary</h3>

                <div className="relative w-32 h-32 mx-auto my-2">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r="52" stroke="#161A2E" strokeWidth="12" fill="none" />
                    <circle cx="64" cy="64" r="52" stroke="#A855F7" strokeWidth="12" strokeDasharray="250 326" fill="none" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold font-mono text-text-primary">78%</span>
                    <span className="text-[8px] text-text-muted">Overall Progress</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-left">
                  <div className="flex justify-between"><span className="text-text-muted">• Strength</span><span className="font-mono text-text-primary">82%</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">• Endurance</span><span className="font-mono text-text-primary">74%</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">• Consistency</span><span className="font-mono text-text-primary">80%</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">• Recovery</span><span className="font-mono text-text-primary">76%</span></div>
                </div>
              </div>

              {/* Achievements Badge List */}
              <div className="card p-4 space-y-3">
                <div className="section-header">
                  <h3 className="section-title text-xs">Achievements</h3>
                  <span className="section-link">View All</span>
                </div>

                <div className="space-y-2">
                  {[
                    { title: 'First 10 Workouts', desc: 'Completed 10 workouts', date: 'Apr 15, 2026', icon: '🏆' },
                    { title: 'Volume Beast', desc: 'Lifted 1000 kg total', date: 'May 2, 2026', icon: '⚡' },
                    { title: 'Consistency King', desc: '7 day workout streak', date: 'May 10, 2026', icon: '👑' },
                    { title: 'Strength Milestone', desc: 'Increased bench press by 20 kg', date: 'May 14, 2026', icon: '🥇' },
                  ].map((ach, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated/40 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{ach.icon}</span>
                        <div>
                          <p className="font-bold text-text-primary leading-tight">{ach.title}</p>
                          <p className="text-[9px] text-text-muted">{ach.desc}</p>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono text-text-muted">{ach.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body Progress Widget */}
              <div className="card p-4 space-y-2">
                <div className="section-header">
                  <h3 className="section-title text-xs">Body Progress</h3>
                  <span onClick={() => setActiveTab('body-stats')} className="section-link">View All</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-surface-elevated">
                    <p className="text-[8px] text-text-muted">Weight</p>
                    <p className="font-bold font-mono text-text-primary">68.5 kg</p>
                    <span className="text-[7px] text-success">↓ 1.5 kg</span>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-elevated">
                    <p className="text-[8px] text-text-muted">Body Fat</p>
                    <p className="font-bold font-mono text-text-primary">16.2 %</p>
                    <span className="text-[7px] text-success">↓ 2.1 %</span>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-elevated">
                    <p className="text-[8px] text-text-muted">Muscle Mass</p>
                    <p className="font-bold font-mono text-text-primary">55.4 kg</p>
                    <span className="text-[7px] text-success">↑ 1.8 kg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB TAB 4: EXERCISES */}
      {activeTab === 'exercises' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Top Bar Header & Search */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Exercises Library</h2>
              <p className="text-xs text-text-muted">Browse and manage your exercise library. Learn proper form and track your performance.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchExercise}
                  onChange={e => setSearchExercise(e.target.value)}
                  className="pl-9 pr-4 py-1.5 rounded-xl bg-surface-elevated text-xs text-text-primary border border-border-subtle focus:border-purple focus:outline-none w-56"
                />
              </div>
              <span className="text-xs text-text-muted bg-surface-elevated px-3 py-1.5 rounded-xl border border-border-subtle cursor-pointer">All Muscle Groups ▾</span>
              <span className="text-xs text-text-muted bg-surface-elevated px-3 py-1.5 rounded-xl border border-border-subtle cursor-pointer">Equipment ▾</span>
              <button onClick={() => setShowAddExerciseModal(true)} className="btn-primary text-xs bg-purple hover:bg-purple/80 flex items-center gap-1.5">
                <FiPlus size={16} /> Add Exercise
              </button>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-12 gap-4">
            {/* Left Categories List (2.5 cols) */}
            <div className="col-span-3 card p-3 space-y-1">
              {exerciseCategories.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedMuscleCategory(cat.id)}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                    selectedMuscleCategory === cat.id ? 'bg-purple text-white font-bold' : 'hover:bg-surface-elevated text-text-secondary'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="font-mono text-[10px] opacity-70">{cat.count}</span>
                </div>
              ))}
            </div>

            {/* Center Exercises Table (5.5 cols) */}
            <div className="col-span-5 card overflow-hidden flex flex-col justify-between">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface-elevated/50 text-[10px] text-text-muted uppercase">
                      <th className="py-2.5 px-3">Exercise</th>
                      <th className="py-2.5 px-3">Muscle Group</th>
                      <th className="py-2.5 px-3">Equipment</th>
                      <th className="py-2.5 px-3">Difficulty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {exercisesData
                      .filter(ex => searchExercise === '' || ex.name.toLowerCase().includes(searchExercise.toLowerCase()))
                      .map(ex => (
                        <tr
                          key={ex.name}
                          onClick={() => setSelectedExercise(ex.name)}
                          className={`cursor-pointer transition-colors ${selectedExercise === ex.name ? 'bg-purple/15 font-bold' : 'hover:bg-surface-elevated/40'}`}
                        >
                          <td className="py-3 px-3 font-bold text-text-primary flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-surface-elevated flex items-center justify-center text-xs">🏋️</div>
                            {ex.name}
                          </td>
                          <td className="py-3 px-3 text-text-muted text-[11px]">{ex.group}</td>
                          <td className="py-3 px-3 text-text-muted text-[11px]">{ex.equipment}</td>
                          <td className="py-3 px-3">
                            <span className={ex.difficulty === 'Advanced' ? 'badge-danger text-[8px]' : ex.difficulty === 'Intermediate' ? 'badge-warning text-[8px]' : 'badge-success text-[8px]'}>
                              {ex.difficulty}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-3 border-t border-border-subtle flex items-center justify-center gap-2 text-xs font-mono">
                <button className="px-2 py-1 rounded bg-surface-elevated text-text-muted">&lt;</button>
                <button className="px-2 py-1 rounded bg-purple text-white font-bold">1</button>
                <button className="px-2 py-1 rounded bg-surface-elevated text-text-muted">2</button>
                <button className="px-2 py-1 rounded bg-surface-elevated text-text-muted">3</button>
                <span className="text-text-muted">... 20</span>
                <button className="px-2 py-1 rounded bg-surface-elevated text-text-muted">&gt;</button>
              </div>
            </div>

            {/* Right Exercise Detail Panel (4 cols) */}
            <div className="col-span-4 card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary">{activeExerciseObj.name}</h3>
                <button className="btn-outline text-[10px] py-1 px-2.5 flex items-center gap-1">
                  <FiEdit3 size={12} /> Edit Exercise
                </button>
              </div>

              {/* Video / Photo Frame & Muscle Diagram Overlay */}
              <div className="relative h-44 rounded-xl overflow-hidden bg-slate-900 border border-border-subtle flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                <div className="w-12 h-12 rounded-full bg-purple/80 text-white flex items-center justify-center text-xl shadow-glow-primary z-10 cursor-pointer hover:scale-110 transition-transform">
                  <FiPlay size={20} className="ml-1" />
                </div>
                <div className="absolute bottom-2 left-2 text-[9px] font-mono text-white bg-black/60 px-2 py-0.5 rounded">
                  Primary: {activeExerciseObj.primary}
                </div>
              </div>

              {/* Info Tags */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-surface-elevated">
                  <p className="text-[8px] text-text-muted">Muscle Group</p>
                  <p className="font-bold text-text-primary text-[10px]">{activeExerciseObj.group}</p>
                </div>
                <div className="p-2 rounded-xl bg-surface-elevated">
                  <p className="text-[8px] text-text-muted">Equipment</p>
                  <p className="font-bold text-text-primary text-[10px]">{activeExerciseObj.equipment}</p>
                </div>
                <div className="p-2 rounded-xl bg-surface-elevated">
                  <p className="text-[8px] text-text-muted">Difficulty</p>
                  <p className="font-bold text-warning text-[10px]">{activeExerciseObj.difficulty}</p>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-text-primary">Instructions</h4>
                <ol className="list-decimal list-inside space-y-1 text-text-secondary text-[11px]">
                  {activeExerciseObj.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Tips */}
              <div className="space-y-1.5 text-xs pt-2 border-t border-border-subtle">
                <h4 className="font-bold text-text-primary">Tips</h4>
                <div className="space-y-1 text-[11px] text-text-secondary">
                  {activeExerciseObj.tips.map((tip, i) => (
                    <p key={i} className="flex items-center gap-1.5 text-success">
                      <span>✓</span> {tip}
                    </p>
                  ))}
                </div>
              </div>

              {/* Muscle Activation */}
              <div className="space-y-2 pt-2 border-t border-border-subtle text-xs">
                <h4 className="font-bold text-text-primary">Muscle Activation</h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]"><span className="text-text-muted">Chest</span><span className="font-mono text-purple font-bold">90%</span></div>
                  <div className="progress-bar h-1.5"><div className="progress-fill bg-purple" style={{ width: '90%' }} /></div>
                  <div className="flex justify-between text-[10px]"><span className="text-text-muted">Triceps</span><span className="font-mono text-info font-bold">60%</span></div>
                  <div className="progress-bar h-1.5"><div className="progress-fill bg-info" style={{ width: '60%' }} /></div>
                </div>
              </div>

              {/* History Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-border-subtle">
                <div><p className="text-[8px] text-text-muted">Total Sets</p><p className="font-bold font-mono text-text-primary">{activeExerciseObj.sets}</p></div>
                <div><p className="text-[8px] text-text-muted">Total Reps</p><p className="font-bold font-mono text-text-primary">{activeExerciseObj.reps}</p></div>
                <div><p className="text-[8px] text-text-muted">Best 1RM</p><p className="font-bold font-mono text-text-primary">{activeExerciseObj.best1rm}</p></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB TAB 5: NUTRITION */}
      {activeTab === 'nutrition' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Nutrition Tracker</h2>
              <p className="text-xs text-text-muted">Track your daily calories, macronutrients, and meal logs.</p>
            </div>
            <button onClick={() => setShowEditGoalsModal(true)} className="btn-primary text-xs bg-purple hover:bg-purple/80">
              Edit Nutrition Goals
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="card p-4 text-center space-y-1">
              <p className="text-xs text-text-muted">Daily Calorie Goal</p>
              <p className="text-2xl font-bold font-mono text-text-primary">2,400 <span className="text-xs font-normal">kcal</span></p>
              <p className="text-[10px] text-success">Consumed: 2,350 kcal</p>
            </div>
            <div className="card p-4 text-center space-y-1">
              <p className="text-xs text-text-muted">Protein</p>
              <p className="text-2xl font-bold font-mono text-purple">120 / 140 g</p>
              <p className="text-[10px] text-text-muted">30% Total Calories</p>
            </div>
            <div className="card p-4 text-center space-y-1">
              <p className="text-xs text-text-muted">Carbohydrates</p>
              <p className="text-2xl font-bold font-mono text-success">280 / 300 g</p>
              <p className="text-[10px] text-text-muted">47% Total Calories</p>
            </div>
            <div className="card p-4 text-center space-y-1">
              <p className="text-xs text-text-muted">Fats</p>
              <p className="text-2xl font-bold font-mono text-warning">70 / 80 g</p>
              <p className="text-[10px] text-text-muted">23% Total Calories</p>
            </div>
          </div>

          {/* Daily Meals Log */}
          <div className="card p-4 space-y-3">
            <h3 className="section-title">Today's Meal Log</h3>
            <div className="space-y-2">
              {[
                { meal: 'Breakfast', food: 'Oatmeal & Whey Protein Shake', cal: '520 kcal', prot: '35g', carbs: '65g', fats: '10g' },
                { meal: 'Lunch', food: 'Grilled Chicken Breast & Basmati Rice', cal: '680 kcal', prot: '50g', carbs: '80g', fats: '15g' },
                { meal: 'Snack', food: 'Greek Yogurt & Almonds', cal: '320 kcal', prot: '20g', carbs: '25g', fats: '18g' },
                { meal: 'Dinner', food: 'Salmon Fillet & Sweet Potato', cal: '830 kcal', prot: '45g', carbs: '70g', fats: '22g' },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/40 text-xs">
                  <div>
                    <p className="font-bold text-text-primary">{m.meal} — <span className="font-normal text-text-muted">{m.food}</span></p>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-[11px]">
                    <span className="text-purple font-bold">{m.cal}</span>
                    <span className="text-text-muted">P: {m.prot}</span>
                    <span className="text-text-muted">C: {m.carbs}</span>
                    <span className="text-text-muted">F: {m.fats}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB TAB 6: BODY STATS */}
      {activeTab === 'body-stats' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Body Status</h2>
              <p className="text-xs text-text-muted">Track your body composition, measurements and overall fitness status.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-muted bg-surface-elevated px-3 py-1.5 rounded-xl border border-border-subtle cursor-pointer">May 12 – May 18, 2026 ▾</span>
              <span className="text-xs text-text-muted bg-surface-elevated px-3 py-1.5 rounded-xl border border-border-subtle cursor-pointer">This Week ▾</span>
            </div>
          </div>

          {/* Top 6 Metric Cards Row */}
          <div className="grid grid-cols-6 gap-3">
            {[
              { label: 'Weight', val: '68.5 kg', sub: '↓ 0.8 kg vs last week', icon: '⚖️', color: 'info' },
              { label: 'Body Fat', val: '16.2 %', sub: '↓ 0.4% vs last week', icon: '%', color: 'danger' },
              { label: 'Muscle Mass', val: '55.4 kg', sub: '↑ 0.6 kg vs last week', icon: '💪', color: 'warning' },
              { label: 'BMI', val: '22.1', sub: 'Normal', icon: '📊', color: 'purple' },
              { label: 'Body Water', val: '57.3 %', sub: '↑ 1.2% vs last week', icon: '💧', color: 'info' },
              { label: 'Visceral Fat', val: '6', sub: 'Healthy', icon: '🫀', color: 'success' },
            ].map((card, i) => (
              <div key={i} className="card p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-base">{card.icon}</span>
                  <span className="text-[8px] text-success font-semibold">{card.sub}</span>
                </div>
                <p className="text-[9px] text-text-muted">{card.label}</p>
                <p className="text-base font-bold font-mono text-text-primary">{card.val}</p>
              </div>
            ))}
          </div>

          {/* Middle Section (Body Composition Trend + Donut + Segmental Analysis) */}
          <div className="grid grid-cols-12 gap-4">
            {/* Body Composition Trend Line Chart (5 cols) */}
            <div className="col-span-5 card p-4 space-y-3">
              <div className="section-header">
                <h3 className="section-title text-xs">Body Composition Trend</h3>
                <span className="text-xs text-text-muted">6 Weeks ▾</span>
              </div>

              <div className="h-40 relative">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                  {/* Weight Line */}
                  <path d="M 0 30 L 20 30 L 40 28 L 60 30 L 80 29 L 100 32" fill="none" stroke="#A855F7" strokeWidth="2.5" />
                  {/* Muscle Mass Line */}
                  <path d="M 0 50 L 20 48 L 40 47 L 60 46 L 80 45 L 100 44" fill="none" stroke="#22C55E" strokeWidth="2.5" />
                  {/* Fat Line */}
                  <path d="M 0 80 L 20 80 L 40 81 L 60 82 L 80 82 L 100 83" fill="none" stroke="#F59E0B" strokeWidth="2.5" />
                </svg>
              </div>
              <div className="flex justify-between text-[8px] text-text-muted font-mono">
                <span>Apr 13</span><span>Apr 20</span><span>Apr 27</span><span>May 4</span><span>May 11</span><span>May 18</span>
              </div>
            </div>

            {/* Body Composition Donut Chart (3.5 cols) */}
            <div className="col-span-3 card p-4 space-y-3 text-center">
              <h3 className="section-title text-xs">Body Composition</h3>

              <div className="relative w-28 h-28 mx-auto my-1">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                  <circle cx="56" cy="56" r="44" stroke="#22C55E" strokeWidth="12" strokeDasharray="220 56" fill="none" />
                  <circle cx="56" cy="56" r="44" stroke="#F59E0B" strokeWidth="12" strokeDasharray="45 231" strokeDashoffset="-220" fill="none" />
                  <circle cx="56" cy="56" r="44" stroke="#06B6D4" strokeWidth="12" strokeDasharray="11 265" strokeDashoffset="-265" fill="none" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-base font-bold font-mono text-text-primary">68.5 kg</span>
                  <span className="text-[8px] text-text-muted">Total Weight</span>
                </div>
              </div>

              <div className="space-y-1 text-[9px] text-left">
                <div className="flex justify-between"><span className="text-success font-medium">• Muscle Mass</span><span className="font-mono text-text-primary">55.4 kg (80.9%)</span></div>
                <div className="flex justify-between"><span className="text-warning font-medium">• Fat Mass</span><span className="font-mono text-text-primary">11.1 kg (16.2%)</span></div>
                <div className="flex justify-between"><span className="text-info font-medium">• Bone Mass</span><span className="font-mono text-text-primary">2.7 kg (3.9%)</span></div>
              </div>
            </div>

            {/* Segmental Analysis Widget (3.5 cols) */}
            <div className="col-span-4 card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="section-title text-xs">Segmental Analysis</h3>
                <div className="flex items-center gap-1 border border-border-subtle rounded-lg p-0.5 bg-surface-elevated text-[9px]">
                  <button onClick={() => setSegmentalView('muscle')} className={`px-2 py-0.5 rounded ${segmentalView === 'muscle' ? 'bg-purple text-white' : 'text-text-muted'}`}>Muscle Mass</button>
                  <button onClick={() => setSegmentalView('fat')} className={`px-2 py-0.5 rounded ${segmentalView === 'fat' ? 'bg-purple text-white' : 'text-text-muted'}`}>Fat %</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <p className="text-[10px] text-text-muted">Arms: <strong className="text-text-primary font-mono">3.2 kg | 3.3 kg</strong> <span className="badge-success text-[7px]">Good</span></p>
                  <p className="text-[10px] text-text-muted">Chest: <strong className="text-text-primary font-mono">28.6 kg</strong> <span className="badge-success text-[7px]">Excellent</span></p>
                  <p className="text-[10px] text-text-muted">Legs: <strong className="text-text-primary font-mono">12.5 kg | 12.6 kg</strong> <span className="badge-success text-[7px]">Good</span></p>
                  <p className="text-[10px] text-text-muted">Core: <strong className="text-text-primary font-mono">6.8 kg</strong> <span className="badge-success text-[7px]">Good</span></p>
                </div>

                <div className="w-full h-28 relative flex items-center justify-center bg-surface-elevated/40 rounded-xl">
                  <svg viewBox="0 0 100 200" className="w-full h-full text-purple fill-current">
                    <circle cx="50" cy="20" r="12" fill="#22C55E" opacity="0.4" />
                    <path d="M 30 45 Q 50 38 70 45 L 82 85 L 70 85 L 65 60 L 55 180 L 45 180 L 35 60 L 30 85 L 18 85 Z" fill="#A855F7" opacity="0.8" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section (Measurements Table + Progress Photos + Health & Summary Score) */}
          <div className="grid grid-cols-12 gap-4">
            {/* Body Measurements Table (3.5 cols) */}
            <div className="col-span-4 card p-4 space-y-2">
              <h3 className="section-title text-xs">Body Measurements</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-border-subtle text-[9px] text-text-muted uppercase font-sans">
                      <th className="py-1">Measurement</th>
                      <th className="py-1">Current</th>
                      <th className="py-1">Last Week</th>
                      <th className="py-1 text-right">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-[10px]">
                    {[
                      { name: 'Neck', curr: '37.5 cm', last: '37.8 cm', diff: '↓ 0.3 cm', c: 'text-success' },
                      { name: 'Chest', curr: '98.2 cm', last: '98.0 cm', diff: '↑ 0.2 cm', c: 'text-success' },
                      { name: 'Waist', curr: '78.6 cm', last: '79.4 cm', diff: '↓ 0.8 cm', c: 'text-success' },
                      { name: 'Hips', curr: '95.0 cm', last: '95.1 cm', diff: '↓ 0.1 cm', c: 'text-success' },
                      { name: 'Right Arm', curr: '32.1 cm', last: '31.8 cm', diff: '↑ 0.3 cm', c: 'text-success' },
                      { name: 'Left Arm', curr: '31.9 cm', last: '31.6 cm', diff: '↑ 0.3 cm', c: 'text-success' },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td className="py-1.5 font-bold font-sans text-text-primary">{row.name}</td>
                        <td className="py-1.5 text-text-primary">{row.curr}</td>
                        <td className="py-1.5 text-text-muted">{row.last}</td>
                        <td className={`py-1.5 text-right font-bold ${row.c}`}>{row.diff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Progress Photos (3.5 cols) */}
            <div className="col-span-4 card p-4 space-y-3">
              <div className="section-header">
                <h3 className="section-title text-xs">Progress Photos</h3>
                <span className="section-link">View All</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { pose: 'Front', date: 'May 4, 2026' },
                  { pose: 'Side', date: 'May 4, 2026' },
                  { pose: 'Back', date: 'May 4, 2026' },
                ].map((photo, i) => (
                  <div key={i} className="h-28 rounded-xl bg-slate-900 border border-border-subtle p-2 flex flex-col justify-end text-center relative overflow-hidden">
                    <span className="text-xl mb-3">👤</span>
                    <p className="text-[9px] font-bold text-white leading-tight">{photo.pose}</p>
                    <p className="text-[7px] text-text-muted">{photo.date}</p>
                  </div>
                ))}
              </div>

              <button onClick={() => setShowAddPhotoModal(true)} className="btn-primary text-xs w-full py-2 bg-purple hover:bg-purple/80 flex items-center justify-center gap-1.5">
                <FiPlus size={14} /> Add New Photos
              </button>
            </div>

            {/* Health Indicators & Body Status Summary (4 cols) */}
            <div className="col-span-4 space-y-4">
              <div className="card p-4 space-y-2 text-xs">
                <h3 className="section-title text-xs">Health Indicators</h3>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center"><span className="text-text-muted">Resting Heart Rate</span><span className="font-mono font-bold text-text-primary">62 bpm <span className="badge-success text-[7px]">Good</span></span></div>
                  <div className="flex justify-between items-center"><span className="text-text-muted">Blood Pressure</span><span className="font-mono font-bold text-text-primary">118 / 76 mmHg <span className="badge-success text-[7px]">Normal</span></span></div>
                  <div className="flex justify-between items-center"><span className="text-text-muted">Sleep (Avg)</span><span className="font-mono font-bold text-text-primary">7h 15m <span className="badge-success text-[7px]">Good</span></span></div>
                  <div className="flex justify-between items-center"><span className="text-text-muted">Stress Level (Avg)</span><span className="font-mono font-bold text-text-primary">Low <span className="badge-success text-[7px]">Good</span></span></div>
                </div>
              </div>

              {/* Body Status Summary Card */}
              <div className="card p-4 space-y-3 bg-gradient-to-br from-purple/10 to-surface border-purple/30">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" stroke="#161A2E" strokeWidth="6" fill="none" />
                      <circle cx="32" cy="32" r="26" stroke="#22C55E" strokeWidth="6" strokeDasharray="137 163" fill="none" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold font-mono text-text-primary">84</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Body Status Summary</h4>
                    <span className="badge-success text-[8px]">Overall Status: Good</span>
                  </div>
                </div>

                <p className="text-[10px] text-text-secondary leading-relaxed">
                  You are in good shape! Your muscle mass is improving and body fat is decreasing. Keep maintaining your workout consistency and focus on nutrition.
                </p>

                <button className="btn-outline text-xs w-full py-1.5">
                  View Recommendations
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB TAB 7: SETTINGS */}
      {activeTab === 'settings' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="card p-6 max-w-2xl space-y-4">
          <h2 className="text-base font-bold text-text-primary">Fitness Preferences & Settings</h2>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-text-muted mb-1">Target Weight (kg)</label>
              <input type="number" defaultValue={65} className="w-full p-2 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle" />
            </div>
            <div>
              <label className="block text-text-muted mb-1">Weekly Workout Goal</label>
              <input type="number" defaultValue={5} className="w-full p-2 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle" />
            </div>
            <div>
              <label className="block text-text-muted mb-1">Daily Calorie Goal (kcal)</label>
              <input type="number" defaultValue={2400} className="w-full p-2 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle" />
            </div>
            <button className="btn-primary text-xs bg-purple hover:bg-purple/80">Save Preferences</button>
          </div>
        </motion.div>
      )}

      {/* MODAL 1: NEW WORKOUT FORM MODAL */}
      <AnimatePresence>
        {showNewWorkoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card p-6 max-w-md w-full space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-text-primary">Log New Workout</h3>
                <button onClick={() => setShowNewWorkoutModal(false)} className="text-text-muted hover:text-text-primary"><FiX size={18} /></button>
              </div>

              <form onSubmit={handleAddWorkout} className="space-y-3 text-xs">
                <div>
                  <label className="block text-text-muted mb-1">Workout Title</label>
                  <input
                    type="text"
                    required
                    value={newWorkout.title}
                    onChange={e => setNewWorkout({ ...newWorkout, title: e.target.value })}
                    placeholder="e.g. Push Day / Leg Day"
                    className="w-full p-2.5 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle focus:border-purple focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-text-muted mb-1">Focus Area</label>
                  <input
                    type="text"
                    required
                    value={newWorkout.focus}
                    onChange={e => setNewWorkout({ ...newWorkout, focus: e.target.value })}
                    placeholder="e.g. Chest • Shoulders • Triceps"
                    className="w-full p-2.5 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle focus:border-purple focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-text-muted mb-1">Duration (min)</label>
                    <input
                      type="number"
                      required
                      value={newWorkout.duration}
                      onChange={e => setNewWorkout({ ...newWorkout, duration: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle focus:border-purple focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1">Volume (kg)</label>
                    <input
                      type="number"
                      required
                      value={newWorkout.volume}
                      onChange={e => setNewWorkout({ ...newWorkout, volume: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle focus:border-purple focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1">Calories (kcal)</label>
                    <input
                      type="number"
                      required
                      value={newWorkout.calories}
                      onChange={e => setNewWorkout({ ...newWorkout, calories: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle focus:border-purple focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-text-muted mb-1">Notes / Highlights</label>
                  <textarea
                    rows={2}
                    value={newWorkout.notes}
                    onChange={e => setNewWorkout({ ...newWorkout, notes: e.target.value })}
                    placeholder="e.g. Felt strong, hit PR on bench!"
                    className="w-full p-2.5 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle focus:border-purple focus:outline-none"
                  />
                </div>

                <button type="submit" className="w-full py-2.5 rounded-xl bg-purple hover:bg-purple/80 text-white font-bold transition-all shadow-glow-primary">
                  Save Workout Session
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: EDIT GOALS MODAL */}
      <AnimatePresence>
        {showEditGoalsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card p-6 max-w-md w-full space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-text-primary">Edit Daily Fitness Goals</h3>
                <button onClick={() => setShowEditGoalsModal(false)} className="text-text-muted hover:text-text-primary"><FiX size={18} /></button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-text-muted mb-1">Daily Workouts Goal</label>
                  <input type="number" defaultValue={1} className="w-full p-2 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle" />
                </div>
                <div>
                  <label className="block text-text-muted mb-1">Daily Calorie Target (kcal)</label>
                  <input type="number" defaultValue={2400} className="w-full p-2 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle" />
                </div>
                <div>
                  <label className="block text-text-muted mb-1">Daily Protein Target (g)</label>
                  <input type="number" defaultValue={120} className="w-full p-2 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle" />
                </div>
                <div>
                  <label className="block text-text-muted mb-1">Daily Water Target (Lters)</label>
                  <input type="number" defaultValue={3} className="w-full p-2 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle" />
                </div>
                <button onClick={() => setShowEditGoalsModal(false)} className="w-full py-2.5 rounded-xl bg-purple hover:bg-purple/80 text-white font-bold">
                  Update Daily Goals
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
