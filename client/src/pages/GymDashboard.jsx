import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiActivity, FiCheckCircle, FiClock, FiTrendingUp, FiAward,
  FiZap, FiCalendar, FiChevronRight, FiCheck, FiHeart, FiPlus,
  FiFilter, FiSearch, FiMoreVertical, FiPlay, FiBookmark, FiEdit3,
  FiSliders, FiUser, FiInfo, FiArrowUpRight, FiArrowDownRight, FiX,
  FiLock, FiMail, FiTrash2, FiBell, FiGlobe, FiShield, FiDownload,
  FiRefreshCw, FiHelpCircle, FiCopy, FiCheckSquare, FiAlertCircle,
  FiCamera, FiShare2, FiStar, FiRotateCcw
} from 'react-icons/fi';
import MuscleDiagram from '../components/fitness/MuscleDiagram';

export default function GymDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');

  // Sub tab for settings: 'profile' | 'preferences' | 'notifications' | 'privacy' | 'data' | 'apps'
  const [settingsSubTab, setSettingsSubTab] = useState('profile');

  // Interactive Muscle & Exercise Filter State
  const streak = user?.current_streak || 28;
  const [selectedMuscleCategory, setSelectedMuscleCategory] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState('Barbell Bench Press');
  const [searchExercise, setSearchExercise] = useState('');

  // Active Workout Mode State (Timer & Set Logger)
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [loggedSets, setLoggedSets] = useState([
    { setNum: 1, weight: '80', reps: '10', done: true },
    { setNum: 2, weight: '80', reps: '10', done: false },
    { setNum: 3, weight: '85', reps: '8', done: false },
  ]);

  // Notifications Toast for PR
  const [prNotification, setPrNotification] = useState(null);

  // Modals state
  const [showNewWorkoutModal, setShowNewWorkoutModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [showEditGoalsModal, setShowEditGoalsModal] = useState(false);

  // Form states
  const [newWorkout, setNewWorkout] = useState({ title: 'Push Day', focus: 'Chest • Shoulders • Triceps', duration: '60', volume: '7500', calories: '550', notes: '' });

  // Settings State
  const [userProfile, setUserProfile] = useState({
    fullName: user?.username || 'Naman',
    username: 'naman_fitness',
    email: user?.email || 'naman@example.com',
    height: '175 cm',
    weight: '68.5 kg',
    age: 21,
    gender: 'Male',
    primaryGoal: 'Build Muscle',
    targetWeight: '75',
    targetDate: '2026-12-31',
    weeklyGoal: 5,
    experienceLevel: 'Intermediate',
    splitPreference: 'Push / Pull / Legs',
    equipment: 'Gym',
    preferredUnits: 'Metric (kg, cm)',
    theme: 'Dark',
    language: 'English',
    privacyMode: false,
    workoutReminders: true,
    progressUpdates: true,
    achievementAlerts: true,
    streakReminders: true,
    newsletter: false
  });

  // Active workout timer tick
  useEffect(() => {
    let timerInterval;
    if (isWorkoutActive) {
      timerInterval = setInterval(() => {
        setWorkoutTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [isWorkoutActive]);

  // Rest timer tick
  useEffect(() => {
    let restInterval;
    if (isResting && restTimer > 0) {
      restInterval = setInterval(() => {
        setRestTimer(prev => prev - 1);
      }, 1000);
    } else if (restTimer === 0) {
      setIsResting(false);
    }
    return () => clearInterval(restInterval);
  }, [isResting, restTimer]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const startLiveWorkout = () => {
    setIsWorkoutActive(true);
    setWorkoutTimer(0);
    setActiveTab('workouts');
  };

  const finishLiveWorkout = () => {
    setIsWorkoutActive(false);
    const maxWeight = Math.max(...loggedSets.map(s => Number(s.weight)));
    if (maxWeight >= 85) {
      setPrNotification(`🎉 New Personal Record! Bench Press ${maxWeight} kg achieved!`);
      setTimeout(() => setPrNotification(null), 5000);
    }
  };

  const handleLogSet = (index) => {
    const updated = [...loggedSets];
    updated[index].done = true;
    setLoggedSets(updated);
    setRestTimer(60);
    setIsResting(true);
  };

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
      sets: 12, reps: 12, best1rm: '2 min'
    }
  ];

  const activeExerciseObj = exercisesData.find(e => e.name === selectedExercise) || exercisesData[0];

  return (
    <div className="p-6 space-y-5">
      {/* PR Toast Alert */}
      <AnimatePresence>
        {prNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 p-4 rounded-xl bg-purple text-white shadow-glow-primary flex items-center gap-3"
          >
            <span className="text-xl">🏆</span>
            <div>
              <p className="font-extrabold text-sm">{prNotification}</p>
              <p className="text-[10px] opacity-80">Saved to your Personal Records!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center">
            <FiActivity size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Gym & Fitness</h1>
            <p className="text-xs text-text-muted">Train hard. Stay consistent. Be your best.</p>
          </div>
        </div>

        {/* Top 4 Metrics Summary Bar (Matching Header Spec) */}
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
          {/* Top Row Cards */}
          <div className="grid grid-cols-12 gap-4">
            {/* Today's Workout Card */}
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

                <div className="w-48 h-44 flex items-center justify-center">
                  <MuscleDiagram selectedExercise="bench press" side="front" />
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => startLiveWorkout()} className="btn-primary text-xs flex-1 py-2 bg-purple hover:bg-purple/80 flex items-center justify-center gap-1.5 shadow-glow-primary">
                  <FiPlay size={14} /> Start Live Workout
                </button>
                <button onClick={() => setActiveTab('workouts')} className="btn-outline text-xs flex-1 py-2">
                  View Workout Details
                </button>
              </div>
            </div>

            {/* Weekly Activity Card */}
            <div className="col-span-4 card p-4 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="section-title">Weekly Activity</h3>
                <span onClick={() => setActiveTab('workouts')} className="section-link">View Calendar</span>
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

            {/* Current Streak Dial Card */}
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

          {/* Middle Row */}
          <div className="grid grid-cols-12 gap-4">
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

            <div className="col-span-5 card p-4 space-y-3">
              <div className="section-header">
                <h3 className="section-title">Progress Overview</h3>
                <span className="text-xs text-text-muted">Volume (kg) ▾</span>
              </div>
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
                      {pr.isNew ? <span className="badge-success text-[8px] px-1 py-0">New PR!</span> : <span className="text-[8px] text-text-muted">{pr.date}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 card p-4 space-y-2">
              <h3 className="section-title text-xs">Muscle Group Focus</h3>
              <div className="flex items-center justify-center my-1">
                <div className="relative w-28 h-28">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                    <circle cx="56" cy="56" r="44" stroke="#A855F7" strokeWidth="12" strokeDasharray="55 221" fill="none" />
                    <circle cx="56" cy="56" r="44" stroke="#06B6D4" strokeWidth="12" strokeDasharray="55 221" strokeDashoffset="-55" fill="none" />
                    <circle cx="56" cy="56" r="44" stroke="#22C55E" strokeWidth="12" strokeDasharray="68 208" strokeDashoffset="-110" fill="none" />
                    <circle cx="56" cy="56" r="44" stroke="#F59E0B" strokeWidth="12" strokeDasharray="41 235" strokeDashoffset="-178" fill="none" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[9px] text-text-muted font-bold text-center">Muscle<br />Groups</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[9px]">
                <div className="flex justify-between"><span className="text-purple">• Chest</span><span className="font-mono text-text-primary">20%</span></div>
                <div className="flex justify-between"><span className="text-info">• Back</span><span className="font-mono text-text-primary">20%</span></div>
                <div className="flex justify-between"><span className="text-success">• Legs</span><span className="font-mono text-text-primary">25%</span></div>
                <div className="flex justify-between"><span className="text-warning">• Shoulders</span><span className="font-mono text-text-primary">15%</span></div>
              </div>
            </div>

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
            </div>

            <div className="col-span-3 card p-4 space-y-2.5">
              <div className="section-header">
                <h3 className="section-title text-xs">Daily Goals</h3>
                <span onClick={() => setShowEditGoalsModal(true)} className="section-link">Edit Goals</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[10px] mb-1"><span className="text-text-secondary">🏋️ Workouts</span><span className="font-mono font-bold text-text-primary">1 / 1</span></div>
                  <div className="progress-bar h-1.5"><div className="progress-fill bg-success" style={{ width: '100%' }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1"><span className="text-text-secondary">🔥 Calories</span><span className="font-mono font-bold text-text-primary">2,350 / 2,400 kcal</span></div>
                  <div className="progress-bar h-1.5"><div className="progress-fill bg-success" style={{ width: '97%' }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1"><span className="text-text-secondary">🥩 Protein</span><span className="font-mono font-bold text-text-primary">120 / 120 g</span></div>
                  <div className="progress-bar h-1.5"><div className="progress-fill bg-success" style={{ width: '100%' }} /></div>
                </div>
              </div>
            </div>

            <div className="col-span-3 card p-4 space-y-2">
              <div className="section-header">
                <h3 className="section-title text-xs">Body Stats</h3>
                <span onClick={() => setActiveTab('body-stats')} className="section-link">View Progress</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-surface-elevated/40">
                  <div><p className="text-[9px] text-text-muted">Weight</p><p className="font-bold font-mono text-text-primary">60.5 kg</p></div>
                  <span className="text-success text-[10px] font-mono font-bold">-0.8 kg</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-surface-elevated/40">
                  <div><p className="text-[9px] text-text-muted">Body Fat</p><p className="font-bold font-mono text-text-primary">14.2 %</p></div>
                  <span className="text-success text-[10px] font-mono font-bold">-1.2 %</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB TAB 2: WORKOUTS (Matching Image 4 Pixel Perfect) */}
      {activeTab === 'workouts' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Top Bar Controls */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Workouts</h2>
              <p className="text-xs text-text-muted">Track and manage all your workouts.</p>
            </div>
            <div className="flex items-center gap-3">
              <select className="px-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-medium">
                <option>All Workouts</option>
                <option>Push</option>
                <option>Pull</option>
                <option>Legs</option>
              </select>
              <div className="px-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-muted font-mono flex items-center gap-2">
                <FiCalendar size={14} /> May 12 – May 18, 2026
              </div>
              <button onClick={() => setShowNewWorkoutModal(true)} className="btn-primary text-xs px-4 py-2 bg-purple hover:bg-purple/80 flex items-center gap-1.5 shadow-glow-primary">
                <FiPlus size={16} /> New Workout
              </button>
            </div>
          </div>

          {/* Top 4 Cards Row */}
          <div className="grid grid-cols-4 gap-4">
            <div className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple/10 text-purple flex items-center justify-center text-xl">🏋️</div>
              <div>
                <p className="text-[10px] text-text-muted">Workouts This Week</p>
                <h3 className="text-2xl font-bold font-mono text-text-primary">6</h3>
              </div>
            </div>
            <div className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center text-xl">⏱️</div>
              <div>
                <p className="text-[10px] text-text-muted">Total Duration This Week</p>
                <h3 className="text-2xl font-bold font-mono text-text-primary">6h 40m</h3>
              </div>
            </div>
            <div className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center text-xl">🏆</div>
              <div>
                <p className="text-[10px] text-text-muted">Total Volume This Week</p>
                <h3 className="text-2xl font-bold font-mono text-text-primary">22,450 kg</h3>
              </div>
            </div>
            <div className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center text-xl">🔥</div>
              <div>
                <p className="text-[10px] text-text-muted">Calories Burned This Week</p>
                <h3 className="text-2xl font-bold font-mono text-text-primary">4,250 kcal</h3>
              </div>
            </div>
          </div>

          {/* Main Content Layout (Table on Left, Widgets on Right) */}
          <div className="grid grid-cols-12 gap-4">
            {/* Left Column Workouts Table & Recent PRs (8 Cols) */}
            <div className="col-span-8 space-y-4">
              <div className="card p-4 space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border-subtle text-[10px] text-text-muted uppercase tracking-wider">
                        <th className="pb-3 font-semibold">WORKOUT</th>
                        <th className="pb-3 font-semibold">FOCUS AREA</th>
                        <th className="pb-3 font-semibold">DURATION</th>
                        <th className="pb-3 font-semibold">VOLUME</th>
                        <th className="pb-3 font-semibold">CALORIES</th>
                        <th className="pb-3 font-semibold">NOTES</th>
                        <th className="pb-3 font-semibold">STATUS</th>
                        <th className="pb-3 font-semibold text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/50">
                      {workoutsList.map(w => (
                        <tr key={w.id} className="hover:bg-surface-elevated/40 transition-colors">
                          <td className="py-3 pr-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-purple/10 text-purple flex items-center justify-center font-bold">🏋️</div>
                              <div>
                                <p className="font-bold text-text-primary">{w.title}</p>
                                <p className="text-[9px] text-text-muted">{w.time}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-text-muted">{w.focus}</td>
                          <td className="py-3 px-2 font-mono text-text-primary">{w.duration}</td>
                          <td className="py-3 px-2 font-mono font-bold text-text-primary">{w.volume}</td>
                          <td className="py-3 px-2 font-mono text-text-primary">{w.calories}</td>
                          <td className="py-3 px-2 text-text-muted">{w.notes}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              w.status === 'Completed' ? 'bg-success/10 text-success' : 'bg-info/10 text-info'
                            }`}>
                              {w.status}
                            </span>
                          </td>
                          <td className="py-3 pl-2 text-right">
                            <button className="text-text-muted hover:text-text-primary p-1"><FiMoreVertical size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-center pt-2">
                  <button className="text-xs font-bold text-purple hover:underline flex items-center justify-center gap-1 mx-auto">
                    Load More ▾
                  </button>
                </div>
              </div>

              {/* Recent PRs Row at Bottom */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="section-title text-xs">Recent PRs</h3>
                  <span onClick={() => setActiveTab('progress')} className="section-link">View All</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="card p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-success/20 text-success flex items-center justify-center font-bold">🏆</div>
                    <div>
                      <p className="text-[10px] text-text-muted">Squat</p>
                      <p className="text-sm font-bold font-mono text-text-primary">120 kg <span className="text-[9px] text-success font-bold">+5 kg</span></p>
                    </div>
                  </div>
                  <div className="card p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-info/20 text-info flex items-center justify-center font-bold">🏆</div>
                    <div>
                      <p className="text-[10px] text-text-muted">Bench Press</p>
                      <p className="text-sm font-bold font-mono text-text-primary">100 kg <span className="text-[9px] text-info font-bold">+2.5 kg</span></p>
                    </div>
                  </div>
                  <div className="card p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple/20 text-purple flex items-center justify-center font-bold">🏆</div>
                    <div>
                      <p className="text-[10px] text-text-muted">Deadlift</p>
                      <p className="text-sm font-bold font-mono text-text-primary">150 kg <span className="text-[9px] text-purple font-bold">+5 kg</span></p>
                    </div>
                  </div>
                  <div className="card p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-warning/20 text-warning flex items-center justify-center font-bold">🏆</div>
                    <div>
                      <p className="text-[10px] text-text-muted">Pull Ups (BW)</p>
                      <p className="text-sm font-bold font-mono text-text-primary">15 reps <span className="text-[9px] text-warning font-bold">+2 reps</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Widgets (4 Cols) */}
            <div className="col-span-4 space-y-4">
              {/* Muscle Focus Dual Anatomical Graphic */}
              <div className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="section-title text-xs">Muscle Focus</h3>
                  <span className="text-[10px] text-text-muted">Front & Back View</span>
                </div>
                <div className="w-full h-48 flex items-center justify-center">
                  <MuscleDiagram selectedExercise="bench press" />
                </div>
              </div>

              {/* Workout History 4-Week Matrix */}
              <div className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="section-title text-xs">Workout History</h3>
                  <span className="section-link">View All</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] text-text-muted font-mono px-6">
                    <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                  </div>
                  {['18–24 May', '11–17 May', '4–10 May', '27 Apr–3 May'].map((wk, idx) => (
                    <div key={wk} className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-text-muted w-14">{wk}</span>
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: 7 }, (_, i) => (
                          <div key={i} className={`w-3.5 h-3.5 rounded-full ${
                            i === 6 ? 'border border-border-subtle bg-transparent' : (i + idx) % 2 === 0 ? 'bg-success' : 'bg-purple'
                          }`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-text-muted pt-2 border-t border-border-subtle">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success inline-block" /> Workout</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple inline-block" /> Rest Day</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full border border-border-subtle inline-block" /> No Workout</span>
                </div>
              </div>

              {/* Top Exercises Widget */}
              <div className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="section-title text-xs">Top Exercises</h3>
                  <span className="text-xs text-text-muted">This Month ▾</span>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    { name: 'Bench Press', sets: 24, vol: '5,200 kg' },
                    { name: 'Squat', sets: 20, vol: '4,800 kg' },
                    { name: 'Deadlift', sets: 18, vol: '4,500 kg' },
                    { name: 'Overhead Press', sets: 16, vol: '2,800 kg' },
                    { name: 'Pull Ups', sets: 15, vol: '1,600 kg' },
                  ].map((ex, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-surface-elevated">
                      <span className="font-bold text-text-primary flex items-center gap-2"><span>🏋️</span> {ex.name}</span>
                      <div className="font-mono text-[10px] space-x-3">
                        <span className="text-text-muted">{ex.sets} Sets</span>
                        <span className="font-bold text-text-primary">{ex.vol}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-border-subtle text-center">
                  <button onClick={() => setActiveTab('exercises')} className="text-xs font-bold text-purple hover:underline">
                    View All Exercises →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB TAB 3: PROGRESS (Matching Image 3 Pixel Perfect) */}
      {activeTab === 'progress' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Progress Overview</h2>
              <p className="text-xs text-text-muted">Track your fitness journey and see how far you've come.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-muted font-mono flex items-center gap-2">
                <FiCalendar size={14} /> May 12 – May 18, 2026
              </div>
              <select className="px-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-medium">
                <option>All Time</option>
                <option>This Month</option>
                <option>This Year</option>
              </select>
            </div>
          </div>

          {/* Top 5 Metric Cards */}
          <div className="grid grid-cols-5 gap-3">
            <div className="card p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-muted">Total Workouts</span>
                <span className="text-success text-[9px] font-mono font-bold">↑ 18% vs last 30 days</span>
              </div>
              <h3 className="text-2xl font-bold font-mono text-text-primary">128</h3>
            </div>
            <div className="card p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-muted">Total Volume</span>
                <span className="text-success text-[9px] font-mono font-bold">↑ 24% vs last 30 days</span>
              </div>
              <h3 className="text-2xl font-bold font-mono text-text-primary">2,450 kg</h3>
            </div>
            <div className="card p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-muted">Total Calories Burned</span>
                <span className="text-success text-[9px] font-mono font-bold">↑ 16% vs last 30 days</span>
              </div>
              <h3 className="text-2xl font-bold font-mono text-text-primary">18,450 kcal</h3>
            </div>
            <div className="card p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-muted">Total Duration</span>
                <span className="text-success text-[9px] font-mono font-bold">↑ 14% vs last 30 days</span>
              </div>
              <h3 className="text-2xl font-bold font-mono text-text-primary">68h 35m</h3>
            </div>
            <div className="card p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-muted">Avg. Workout / Week</span>
                <span className="text-success text-[9px] font-mono font-bold">↑ 12% vs last 30 days</span>
              </div>
              <h3 className="text-2xl font-bold font-mono text-text-primary">5.1</h3>
            </div>
          </div>

          {/* Middle Layout (Charts Left, Summary Right) */}
          <div className="grid grid-cols-12 gap-4">
            {/* Left 8 Cols Charts */}
            <div className="col-span-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="section-title text-xs">Workout Frequency</h4>
                    <span className="text-[10px] text-text-muted">Weekly ▾</span>
                  </div>
                  <div className="h-28 flex items-end justify-between px-2 pt-2 border-b border-border-subtle">
                    {[30, 45, 60, 85, 70].map((v, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 flex-1">
                        <div className="w-2 rounded-full bg-purple" style={{ height: `${v}%` }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="section-title text-xs">Training Volume</h4>
                    <span className="text-[10px] text-text-muted">Weekly ▾</span>
                  </div>
                  <div className="h-28 flex items-end justify-between px-2 pt-2 border-b border-border-subtle">
                    {[40, 55, 75, 90, 85].map((v, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 flex-1">
                        <div className="w-full rounded-t bg-success/40" style={{ height: `${v}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Tables */}
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="section-title text-xs">Muscle Group Progress</h4>
                    <span className="text-[10px] text-text-muted">This Month ▾</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {[
                      { name: 'Chest', vol: '520 kg', pct: '+18%', color: 'bg-purple' },
                      { name: 'Back', vol: '680 kg', pct: '+24%', color: 'bg-info' },
                      { name: 'Legs', vol: '750 kg', pct: '+22%', color: 'bg-success' },
                      { name: 'Shoulders', vol: '320 kg', pct: '+15%', color: 'bg-warning' },
                      { name: 'Arms', vol: '180 kg', pct: '+10%', color: 'bg-danger' },
                      { name: 'Core', vol: '120 kg', pct: '+8%', color: 'bg-purple' },
                    ].map(m => (
                      <div key={m.name} className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-text-primary font-bold">{m.name}</span>
                          <span className="font-mono text-text-muted">{m.vol} <strong className="text-success">{m.pct}</strong></span>
                        </div>
                        <div className="progress-bar h-1.5"><div className={`progress-fill ${m.color}`} style={{ width: m.pct.replace('+', '') }} /></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="section-title text-xs">Strength Progress (Top Lifts)</h4>
                    <span className="text-[10px] text-text-muted">All Time ▾</span>
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border-subtle text-[9px] text-text-muted">
                        <th className="pb-2">EXERCISE</th>
                        <th className="pb-2">START</th>
                        <th className="pb-2">CURRENT</th>
                        <th className="pb-2 text-right">PROGRESS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/50 text-[11px] font-mono">
                      <tr><td className="py-2 text-text-primary font-sans font-bold">Bench Press</td><td>60 kg</td><td className="font-bold">100 kg</td><td className="text-right text-success font-bold">↑ 66.7%</td></tr>
                      <tr><td className="py-2 text-text-primary font-sans font-bold">Squat</td><td>80 kg</td><td className="font-bold">140 kg</td><td className="text-right text-success font-bold">↑ 75%</td></tr>
                      <tr><td className="py-2 text-text-primary font-sans font-bold">Deadlift</td><td>100 kg</td><td className="font-bold">150 kg</td><td className="text-right text-success font-bold">↑ 50%</td></tr>
                      <tr><td className="py-2 text-text-primary font-sans font-bold">Overhead Press</td><td>40 kg</td><td className="font-bold">70 kg</td><td className="text-right text-success font-bold">↑ 75%</td></tr>
                      <tr><td className="py-2 text-text-primary font-sans font-bold">Pull Ups (BW)</td><td>5 reps</td><td className="font-bold">15 reps</td><td className="text-right text-success font-bold">↑ 100%</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right 4 Cols Progress Summary */}
            <div className="col-span-4 space-y-4">
              <div className="card p-4 space-y-3 text-center">
                <h4 className="section-title text-xs">Progress Summary</h4>
                <div className="relative w-32 h-32 mx-auto my-2">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r="50" stroke="#161A2E" strokeWidth="12" fill="none" />
                    <circle cx="64" cy="64" r="50" stroke="#A855F7" strokeWidth="12" strokeDasharray="245 314" fill="none" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold font-mono text-text-primary">78%</span>
                    <span className="text-[9px] text-text-muted">Overall Progress</span>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-left">
                  <div className="flex justify-between"><span className="text-text-muted">• Strength</span><span className="font-bold text-text-primary">82%</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">• Endurance</span><span className="font-bold text-text-primary">74%</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">• Consistency</span><span className="font-bold text-text-primary">80%</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">• Recovery</span><span className="font-bold text-text-primary">76%</span></div>
                </div>
              </div>

              <div className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="section-title text-xs">Achievements</h4>
                  <span className="section-link">View All</span>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    { title: 'First 10 Workouts', desc: 'Completed 10 workouts', date: 'Apr 15, 2026', icon: '🏆' },
                    { title: 'Volume Beast', desc: 'Lifted 1000 kg total', date: 'May 2, 2026', icon: '⚡' },
                    { title: 'Consistency King', desc: '7 day workout streak', date: 'May 10, 2026', icon: '👑' },
                    { title: 'Strength Milestone', desc: 'Increased bench press by 20 kg', date: 'May 14, 2026', icon: '🏅' },
                  ].map(a => (
                    <div key={a.title} className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated/40">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{a.icon}</span>
                        <div><p className="font-bold text-text-primary">{a.title}</p><p className="text-[9px] text-text-muted">{a.desc}</p></div>
                      </div>
                      <span className="text-[9px] font-mono text-text-muted">{a.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB TAB 4: EXERCISES (Matching Image 2 Pixel Perfect) */}
      {activeTab === 'exercises' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Top Bar Controls */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Exercises</h2>
              <p className="text-xs text-text-muted">Browse and manage your exercise library. Learn proper form and track your performance.</p>
            </div>
            <button onClick={() => setShowAddExerciseModal(true)} className="btn-primary text-xs px-4 py-2 bg-purple hover:bg-purple/80 flex items-center gap-1.5 shadow-glow-primary">
              <FiPlus size={16} /> Add Exercise
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-3 text-text-muted" size={16} />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchExercise}
                onChange={e => setSearchExercise(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-purple"
              />
            </div>
            <select
              value={selectedMuscleCategory}
              onChange={e => setSelectedMuscleCategory(e.target.value)}
              className="px-4 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary"
            >
              <option value="all">All Muscle Groups</option>
              <option value="chest">Chest</option>
              <option value="back">Back</option>
              <option value="legs">Legs</option>
              <option value="shoulders">Shoulders</option>
              <option value="arms">Arms</option>
              <option value="core">Core</option>
            </select>
            <select className="px-4 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary">
              <option>Equipment</option>
              <option>Barbell</option>
              <option>Dumbbell</option>
              <option>Bodyweight</option>
              <option>Cable</option>
            </select>
          </div>

          {/* Main Layout (Categories Left, Table Center, Detail Right) */}
          <div className="grid grid-cols-12 gap-4">
            {/* Left Sidebar Categories (3 Cols) */}
            <div className="col-span-3 card p-2 space-y-1">
              {exerciseCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedMuscleCategory(cat.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
                    selectedMuscleCategory === cat.id ? 'bg-purple text-white font-bold shadow-glow-primary' : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="font-mono text-[10px] opacity-80">{cat.count}</span>
                </button>
              ))}
            </div>

            {/* Center Table (5 Cols) */}
            <div className="col-span-5 card p-4 space-y-3 flex flex-col justify-between">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border-subtle text-[10px] text-text-muted uppercase">
                      <th className="pb-3">EXERCISE</th>
                      <th className="pb-3">MUSCLE GROUP</th>
                      <th className="pb-3">EQUIPMENT</th>
                      <th className="pb-3">DIFFICULTY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/50">
                    {exercisesData
                      .filter(ex => selectedMuscleCategory === 'all' || ex.group.toLowerCase().includes(selectedMuscleCategory))
                      .filter(ex => ex.name.toLowerCase().includes(searchExercise.toLowerCase()))
                      .map(ex => (
                        <tr
                          key={ex.name}
                          onClick={() => setSelectedExercise(ex.name)}
                          className={`cursor-pointer hover:bg-surface-elevated/40 transition-colors ${
                            selectedExercise === ex.name ? 'bg-purple/10 border-l-2 border-purple font-bold' : ''
                          }`}
                        >
                          <td className="py-3 pr-2 flex items-center gap-2">
                            <span className="text-base">🏋️</span>
                            <span className="text-text-primary">{ex.name}</span>
                          </td>
                          <td className="py-3 px-2 text-text-muted">{ex.group}</td>
                          <td className="py-3 px-2 text-text-muted">{ex.equipment}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              ex.difficulty === 'Beginner' ? 'bg-success/10 text-success' : ex.difficulty === 'Intermediate' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                            }`}>
                              {ex.difficulty}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 pt-2 border-t border-border-subtle text-xs font-mono">
                <button className="px-2 py-1 rounded bg-surface-elevated text-text-muted">‹</button>
                <button className="px-2 py-1 rounded bg-purple text-white font-bold">1</button>
                <button className="px-2 py-1 rounded bg-surface-elevated text-text-muted">2</button>
                <button className="px-2 py-1 rounded bg-surface-elevated text-text-muted">3</button>
                <span className="text-text-muted">...</span>
                <button className="px-2 py-1 rounded bg-surface-elevated text-text-muted">20</button>
                <button className="px-2 py-1 rounded bg-surface-elevated text-text-muted">›</button>
              </div>
            </div>

            {/* Right Exercise Detail Panel (4 Cols) */}
            <div className="col-span-4 card p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <h3 className="text-sm font-bold text-text-primary">{activeExerciseObj.name}</h3>
                <button className="btn-outline text-[10px] py-1 px-2 flex items-center gap-1"><FiEdit3 /> Edit Exercise</button>
              </div>

              {/* Video / Photo Frame with Play Button */}
              <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-900 border border-border-subtle flex items-center justify-center group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
                <div className="w-10 h-10 rounded-full bg-purple/90 text-white flex items-center justify-center shadow-glow-primary group-hover:scale-110 transition-transform">
                  <FiPlay size={20} className="ml-0.5" />
                </div>
                <div className="absolute bottom-2 left-2 text-[9px] font-mono text-white/80">
                  Primary Target: <strong className="text-purple">{activeExerciseObj.primary}</strong>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-text-primary text-[11px]">Instructions</h4>
                <ol className="space-y-1 text-text-muted text-[10px] list-decimal pl-3">
                  {activeExerciseObj.instructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Tips Checklist */}
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-text-primary text-[11px]">Tips</h4>
                <div className="space-y-1 text-[10px] text-text-muted">
                  {activeExerciseObj.tips.map((tip, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-success">
                      <FiCheckCircle size={12} /> <span className="text-text-muted">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* History Stats */}
              <div className="p-2.5 rounded-xl bg-surface-elevated/40 space-y-1 text-xs border border-border-subtle">
                <h4 className="font-bold text-text-primary text-[10px]">History (This Month)</h4>
                <div className="grid grid-cols-3 gap-2 text-center font-mono text-[10px]">
                  <div><p className="text-text-muted text-[8px]">Total Sets</p><p className="font-bold text-text-primary">{activeExerciseObj.sets}</p></div>
                  <div><p className="text-text-muted text-[8px]">Total Reps</p><p className="font-bold text-text-primary">{activeExerciseObj.reps}</p></div>
                  <div><p className="text-text-muted text-[8px]">Best 1RM</p><p className="font-bold text-purple">{activeExerciseObj.best1rm}</p></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB TAB 6: BODY STATS (Matching Image 1 Pixel Perfect) */}
      {activeTab === 'body-stats' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Body Status</h2>
              <p className="text-xs text-text-muted">Track your body composition, measurements and overall fitness status.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-muted font-mono flex items-center gap-2">
                <FiCalendar size={14} /> May 12 – May 18, 2026
              </div>
              <select className="px-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-medium">
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </div>
          </div>

          {/* Top 6 Metrics Row */}
          <div className="grid grid-cols-6 gap-3">
            <div className="card p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-muted">Weight</span>
                <span className="text-success text-[9px] font-mono font-bold">↓ 0.8 kg vs last week</span>
              </div>
              <h3 className="text-xl font-bold font-mono text-text-primary">68.5 kg</h3>
            </div>
            <div className="card p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-muted">Body Fat</span>
                <span className="text-success text-[9px] font-mono font-bold">↓ 0.4% vs last week</span>
              </div>
              <h3 className="text-xl font-bold font-mono text-text-primary">16.2 %</h3>
            </div>
            <div className="card p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-muted">Muscle Mass</span>
                <span className="text-success text-[9px] font-mono font-bold">↑ 0.6 kg vs last week</span>
              </div>
              <h3 className="text-xl font-bold font-mono text-text-primary">55.4 kg</h3>
            </div>
            <div className="card p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-muted">BMI</span>
                <span className="badge-success text-[8px]">Normal</span>
              </div>
              <h3 className="text-xl font-bold font-mono text-text-primary">22.1</h3>
            </div>
            <div className="card p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-muted">Body Water</span>
                <span className="text-success text-[9px] font-mono font-bold">↑ 1.2% vs last week</span>
              </div>
              <h3 className="text-xl font-bold font-mono text-text-primary">57.3 %</h3>
            </div>
            <div className="card p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-muted">Visceral Fat</span>
                <span className="badge-success text-[8px]">Healthy</span>
              </div>
              <h3 className="text-xl font-bold font-mono text-text-primary">6</h3>
            </div>
          </div>

          {/* Middle Layout (Composition Trend, Composition Donut, Segmental Analysis) */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5 card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="section-title text-xs">Body Composition Trend</h4>
                <span className="text-[10px] text-text-muted">6 Weeks ▾</span>
              </div>
              <div className="h-36 flex items-end justify-between px-2 pt-2 border-b border-border-subtle relative">
                {[68, 68.2, 68.1, 68.5, 68.3, 68.5].map((w, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-2 h-2 rounded-full bg-purple" />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[8px] text-text-muted font-mono">
                <span>Apr 13</span><span>Apr 20</span><span>Apr 27</span><span>May 4</span><span>May 11</span><span>May 18</span>
              </div>
            </div>

            <div className="col-span-3 card p-4 space-y-3 text-center">
              <h4 className="section-title text-xs">Body Composition</h4>
              <div className="relative w-28 h-28 mx-auto my-2">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                  <circle cx="56" cy="56" r="44" stroke="#22C55E" strokeWidth="12" strokeDasharray="220 56" fill="none" />
                  <circle cx="56" cy="56" r="44" stroke="#F97316" strokeWidth="12" strokeDasharray="45 231" strokeDashoffset="-220" fill="none" />
                  <circle cx="56" cy="56" r="44" stroke="#38BDF8" strokeWidth="12" strokeDasharray="11 265" strokeDashoffset="-265" fill="none" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold font-mono text-text-primary">68.5 kg</span>
                  <span className="text-[8px] text-text-muted">Total Weight</span>
                </div>
              </div>
              <div className="space-y-1 text-[9px] text-left">
                <div className="flex justify-between"><span className="text-success">• Muscle Mass</span><span className="font-mono text-text-primary">55.4 kg (80.9%)</span></div>
                <div className="flex justify-between"><span className="text-warning">• Fat Mass</span><span className="font-mono text-text-primary">11.1 kg (16.2%)</span></div>
                <div className="flex justify-between"><span className="text-info">• Bone Mass</span><span className="font-mono text-text-primary">2.7 kg (3.9%)</span></div>
              </div>
            </div>

            <div className="col-span-4 card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="section-title text-xs">Segmental Analysis</h4>
                <div className="flex gap-1 text-[9px]">
                  <button className="px-2 py-0.5 rounded bg-purple text-white font-bold">Muscle Mass</button>
                  <button className="px-2 py-0.5 rounded bg-surface-elevated text-text-muted">Fat %</button>
                </div>
              </div>
              <div className="w-full h-36 flex items-center justify-center">
                <MuscleDiagram selectedExercise="bench press" />
              </div>
            </div>
          </div>

          {/* Bottom Layout (Measurements Left, Photos Center, Indicators & Summary Right) */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4 card p-4 space-y-3">
              <h4 className="section-title text-xs">Body Measurements</h4>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border-subtle text-[9px] text-text-muted">
                    <th className="pb-2">MEASUREMENT</th>
                    <th className="pb-2">CURRENT</th>
                    <th className="pb-2">LAST WEEK</th>
                    <th className="pb-2 text-right">CHANGE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50 text-[10px] font-mono">
                  <tr><td className="py-1.5 text-text-primary font-sans font-bold">Neck</td><td>37.5 cm</td><td>37.8 cm</td><td className="text-right text-success font-bold">↓ 0.3 cm</td></tr>
                  <tr><td className="py-1.5 text-text-primary font-sans font-bold">Chest</td><td>98.2 cm</td><td>98.0 cm</td><td className="text-right text-success font-bold">↑ 0.2 cm</td></tr>
                  <tr><td className="py-1.5 text-text-primary font-sans font-bold">Waist</td><td>78.6 cm</td><td>79.4 cm</td><td className="text-right text-success font-bold">↓ 0.8 cm</td></tr>
                  <tr><td className="py-1.5 text-text-primary font-sans font-bold">Hips</td><td>95.0 cm</td><td>95.1 cm</td><td className="text-right text-success font-bold">↓ 0.1 cm</td></tr>
                  <tr><td className="py-1.5 text-text-primary font-sans font-bold">Right Arm</td><td>32.1 cm</td><td>31.8 cm</td><td className="text-right text-success font-bold">↑ 0.3 cm</td></tr>
                  <tr><td className="py-1.5 text-text-primary font-sans font-bold">Left Arm</td><td>31.9 cm</td><td>31.6 cm</td><td className="text-right text-success font-bold">↑ 0.3 cm</td></tr>
                  <tr><td className="py-1.5 text-text-primary font-sans font-bold">Right Thigh</td><td>56.2 cm</td><td>55.8 cm</td><td className="text-right text-success font-bold">↑ 0.4 cm</td></tr>
                  <tr><td className="py-1.5 text-text-primary font-sans font-bold">Left Thigh</td><td>55.9 cm</td><td>55.4 cm</td><td className="text-right text-success font-bold">↑ 0.5 cm</td></tr>
                </tbody>
              </table>
            </div>

            <div className="col-span-4 card p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="section-title text-xs">Progress Photos</h4>
                  <span className="section-link">View All</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-1">
                    <div className="w-full h-28 rounded-xl bg-slate-900 border border-border-subtle flex items-center justify-center text-text-muted text-xs">
                      <FiUser size={24} />
                    </div>
                    <p className="text-[9px] font-bold text-text-primary">Front</p>
                    <p className="text-[8px] text-text-muted">May 4, 2026</p>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-28 rounded-xl bg-slate-900 border border-border-subtle flex items-center justify-center text-text-muted text-xs">
                      <FiUser size={24} />
                    </div>
                    <p className="text-[9px] font-bold text-text-primary">Side</p>
                    <p className="text-[8px] text-text-muted">May 4, 2026</p>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-28 rounded-xl bg-slate-900 border border-border-subtle flex items-center justify-center text-text-muted text-xs">
                      <FiUser size={24} />
                    </div>
                    <p className="text-[9px] font-bold text-text-primary">Back</p>
                    <p className="text-[8px] text-text-muted">May 4, 2026</p>
                  </div>
                </div>
              </div>

              <button onClick={() => setShowAddPhotoModal(true)} className="btn-primary text-xs w-full py-2 bg-purple hover:bg-purple/80 flex items-center justify-center gap-1.5 shadow-glow-primary">
                <FiCamera size={14} /> Add New Photos
              </button>
            </div>

            <div className="col-span-4 space-y-4">
              <div className="card p-4 space-y-2 text-xs">
                <h4 className="section-title text-xs">Health Indicators</h4>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between items-center"><span className="text-text-muted">Resting Heart Rate</span><span className="font-bold font-mono text-text-primary">62 bpm <span className="badge-success text-[8px]">Good</span></span></div>
                  <div className="flex justify-between items-center"><span className="text-text-muted">Blood Pressure</span><span className="font-bold font-mono text-text-primary">118 / 76 mmHg <span className="badge-success text-[8px]">Normal</span></span></div>
                  <div className="flex justify-between items-center"><span className="text-text-muted">Sleep (Avg)</span><span className="font-bold font-mono text-text-primary">7h 15m <span className="badge-success text-[8px]">Good</span></span></div>
                  <div className="flex justify-between items-center"><span className="text-text-muted">Stress Level (Avg)</span><span className="font-bold font-mono text-text-primary">Low <span className="badge-success text-[8px]">Good</span></span></div>
                  <div className="flex justify-between items-center"><span className="text-text-muted">Recovery Score (Avg)</span><span className="font-bold font-mono text-text-primary">78 / 100 <span className="badge-success text-[8px]">Good</span></span></div>
                </div>
              </div>

              <div className="card p-4 space-y-3 bg-gradient-to-br from-purple/10 to-surface border-purple/30">
                <h4 className="section-title text-xs">Body Status Summary</h4>
                <p className="text-[10px] text-text-muted">You are in good shape! Your muscle mass is improving and body fat is decreasing. Keep maintaining your workout consistency and focus on nutrition for better results.</p>
                <div className="flex items-center justify-between pt-1">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" stroke="#161A2E" strokeWidth="6" fill="none" />
                      <circle cx="32" cy="32" r="26" stroke="#22C55E" strokeWidth="6" strokeDasharray="136 163" fill="none" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-mono text-text-primary">84</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted">Overall Body Status</p>
                    <p className="text-sm font-bold text-success">Good</p>
                  </div>
                </div>
                <button className="btn-primary text-xs w-full py-1.5 bg-purple hover:bg-purple/80">View Recommendations</button>
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
              <p className="text-xs text-text-muted">Track your daily calories, macros, fiber, and hydration.</p>
            </div>
            <button className="btn-primary text-xs px-4 py-2 bg-purple hover:bg-purple/80 flex items-center gap-1.5 shadow-glow-primary">
              <FiPlus size={16} /> Log Meal
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="card p-4 space-y-1"><span className="text-[10px] text-text-muted">Calories Goal</span><h3 className="text-2xl font-bold font-mono text-text-primary">2,350 / 2,400 kcal</h3><div className="progress-bar h-1.5 mt-2"><div className="progress-fill bg-purple" style={{ width: '97%' }} /></div></div>
            <div className="card p-4 space-y-1"><span className="text-[10px] text-text-muted">Protein Target</span><h3 className="text-2xl font-bold font-mono text-text-primary">120 / 120 g</h3><div className="progress-bar h-1.5 mt-2"><div className="progress-fill bg-success" style={{ width: '100%' }} /></div></div>
            <div className="card p-4 space-y-1"><span className="text-[10px] text-text-muted">Carbs Target</span><h3 className="text-2xl font-bold font-mono text-text-primary">280 / 300 g</h3><div className="progress-bar h-1.5 mt-2"><div className="progress-fill bg-info" style={{ width: '93%' }} /></div></div>
            <div className="card p-4 space-y-1"><span className="text-[10px] text-text-muted">Fats Target</span><h3 className="text-2xl font-bold font-mono text-text-primary">70 / 75 g</h3><div className="progress-bar h-1.5 mt-2"><div className="progress-fill bg-warning" style={{ width: '93%' }} /></div></div>
          </div>
        </motion.div>
      )}

      {/* SUB TAB 7: SETTINGS (Matching Image 1) */}
      {activeTab === 'settings' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Settings</h2>
              <p className="text-xs text-text-muted">Manage your preferences, account settings and app customization.</p>
            </div>
          </div>

          {/* Sub Navigation Bar for Settings */}
          <div className="flex items-center gap-2 border-b border-border-subtle pb-1 text-xs">
            {[
              { id: 'profile', label: 'Profile', icon: FiUser },
              { id: 'preferences', label: 'Preferences', icon: FiSliders },
              { id: 'notifications', label: 'Notifications', icon: FiBell },
              { id: 'privacy', label: 'Privacy', icon: FiShield },
              { id: 'data', label: 'Data & Export', icon: FiDownload },
              { id: 'apps', label: 'Connected Apps', icon: FiGlobe },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setSettingsSubTab(item.id)}
                  className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all ${
                    settingsSubTab === item.id ? 'bg-purple/20 text-purple border border-purple/30 font-bold' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  <Icon size={14} /> {item.label}
                </button>
              );
            })}
          </div>

          {/* Settings Grid Layout */}
          <div className="grid grid-cols-12 gap-4">
            {/* Left Main Settings Column (8 cols) */}
            <div className="col-span-8 space-y-4">
              {/* Profile Information Card */}
              <div className="card p-5 space-y-4">
                <h3 className="section-title text-sm">Profile Information</h3>
                <div className="flex items-center gap-6">
                  {/* Avatar with Edit Pencil */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple flex items-center justify-center text-white font-bold text-xl border-2 border-purple">
                      {(userProfile.fullName || 'U')[0].toUpperCase()}
                    </div>
                    <button className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-purple text-white flex items-center justify-center text-[10px] shadow-md">
                      <FiEdit3 size={11} />
                    </button>
                  </div>

                  {/* Info Table Grid */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs flex-1">
                    <div><span className="text-text-muted">Full Name</span><p className="font-bold text-text-primary">{userProfile.fullName}</p></div>
                    <div><span className="text-text-muted">Height</span><p className="font-bold text-text-primary">{userProfile.height}</p></div>
                    <div><span className="text-text-muted">Username</span><p className="font-bold text-text-primary">{userProfile.username}</p></div>
                    <div><span className="text-text-muted">Weight</span><p className="font-bold text-text-primary">{userProfile.weight}</p></div>
                    <div><span className="text-text-muted">Email</span><p className="font-bold text-text-primary">{userProfile.email}</p></div>
                    <div><span className="text-text-muted">Age / Gender</span><p className="font-bold text-text-primary">{userProfile.age} • {userProfile.gender}</p></div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-border-subtle">
                  <button className="btn-primary text-xs bg-purple hover:bg-purple/80 px-4 py-1.5">
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Fitness Goals & About You Box (2 cols) */}
              <div className="grid grid-cols-2 gap-4">
                {/* Fitness Goals Card */}
                <div className="card p-4 space-y-3">
                  <h3 className="section-title text-xs">Fitness Goals</h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-text-muted mb-1 text-[10px]">Primary Goal</label>
                      <select
                        value={userProfile.primaryGoal}
                        onChange={e => setUserProfile({ ...userProfile, primaryGoal: e.target.value })}
                        className="w-full p-2 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle text-xs"
                      >
                        <option value="Build Muscle">Build Muscle</option>
                        <option value="Fat Loss">Fat Loss</option>
                        <option value="Endurance">Endurance</option>
                        <option value="Strength">Strength</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-text-muted mb-1 text-[10px]">Target Weight (kg)</label>
                      <input
                        type="number"
                        value={userProfile.targetWeight}
                        onChange={e => setUserProfile({ ...userProfile, targetWeight: e.target.value })}
                        className="w-full p-2 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-text-muted mb-1 text-[10px]">Target Date</label>
                      <input
                        type="date"
                        value={userProfile.targetDate}
                        onChange={e => setUserProfile({ ...userProfile, targetDate: e.target.value })}
                        className="w-full p-2 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-text-muted mb-1 text-[10px]">Weekly Workout Goal</label>
                      <div className="flex items-center justify-between p-1.5 rounded-xl bg-surface-elevated border border-border-subtle">
                        <button onClick={() => setUserProfile({ ...userProfile, weeklyGoal: Math.max(1, userProfile.weeklyGoal - 1) })} className="w-6 h-6 rounded bg-surface text-text-primary font-bold">-</button>
                        <span className="font-mono font-bold text-text-primary">{userProfile.weeklyGoal} workouts per week</span>
                        <button onClick={() => setUserProfile({ ...userProfile, weeklyGoal: userProfile.weeklyGoal + 1 })} className="w-6 h-6 rounded bg-surface text-text-primary font-bold">+</button>
                      </div>
                    </div>
                  </div>

                  <button className="btn-primary text-xs w-full py-2 bg-purple hover:bg-purple/80">Save Changes</button>
                </div>

                {/* About You Card */}
                <div className="card p-4 space-y-3">
                  <h3 className="section-title text-xs">About You</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-text-muted">Experience Level</span><span className="font-bold text-text-primary">{userProfile.experienceLevel}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Workout Split Preference</span><span className="font-bold text-text-primary">{userProfile.splitPreference}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Equipment Availability</span><span className="font-bold text-text-primary">{userProfile.equipment}</span></div>
                    <div>
                      <span className="text-text-muted text-[10px] block mb-1">Training Days</span>
                      <div className="flex justify-between text-[8px] font-mono">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                          <span key={d} className={`px-1.5 py-0.5 rounded ${i < 5 ? 'bg-purple text-white font-bold' : 'bg-surface-elevated text-text-muted'}`}>{d}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between"><span className="text-text-muted">Preferred Units</span><span className="font-bold text-text-primary">{userProfile.preferredUnits}</span></div>
                  </div>

                  <button className="btn-primary text-xs w-full py-2 bg-purple hover:bg-purple/80">Save Changes</button>
                </div>
              </div>

              {/* App Preferences Card */}
              <div className="card p-4 space-y-3">
                <h3 className="section-title text-xs">App Preferences</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-text-muted mb-1 text-[10px]">Theme</label>
                    <div className="flex items-center border border-border-subtle rounded-xl p-0.5 bg-surface-elevated">
                      {['Light', 'Dark', 'System'].map(t => (
                        <button
                          key={t}
                          onClick={() => setUserProfile({ ...userProfile, theme: t })}
                          className={`flex-1 py-1 text-center rounded-lg transition-all ${userProfile.theme === t ? 'bg-purple text-white font-bold' : 'text-text-muted'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-muted mb-1 text-[10px]">Data Units</label>
                    <div className="flex items-center border border-border-subtle rounded-xl p-0.5 bg-surface-elevated">
                      {['Metric', 'Imperial'].map(u => (
                        <button
                          key={u}
                          onClick={() => setUserProfile({ ...userProfile, preferredUnits: u })}
                          className={`flex-1 py-1 text-center rounded-lg transition-all ${userProfile.preferredUnits.includes(u) ? 'bg-purple text-white font-bold' : 'text-text-muted'}`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-border-subtle">
                  <button className="btn-primary text-xs bg-purple hover:bg-purple/80 px-4 py-1.5">Save Changes</button>
                </div>
              </div>
            </div>

            {/* Right Column Settings Cards (4 cols) */}
            <div className="col-span-4 space-y-4">
              {/* Account Settings List */}
              <div className="card p-4 space-y-2.5">
                <h3 className="section-title text-xs">Account Settings</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated/40 hover:bg-surface-elevated cursor-pointer">
                    <span className="flex items-center gap-2 text-text-primary"><FiLock className="text-purple" /> Change Password</span>
                    <FiChevronRight className="text-text-muted" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated/40 hover:bg-surface-elevated cursor-pointer">
                    <span className="flex items-center gap-2 text-text-primary"><FiMail className="text-info" /> Update Email</span>
                    <FiChevronRight className="text-text-muted" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-danger/10 hover:bg-danger/20 text-danger cursor-pointer">
                    <span className="flex items-center gap-2"><FiTrash2 /> Delete Account</span>
                    <FiChevronRight />
                  </div>
                </div>
              </div>

              {/* Notification Settings List */}
              <div className="card p-4 space-y-2.5">
                <h3 className="section-title text-xs">Notification Settings</h3>
                <div className="space-y-2 text-xs">
                  {[
                    { label: 'Workout Reminders', key: 'workoutReminders' },
                    { label: 'Progress Updates', key: 'progressUpdates' },
                    { label: 'Achievement Alerts', key: 'achievementAlerts' },
                    { label: 'Streak Reminders', key: 'streakReminders' },
                    { label: 'Newsletter', key: 'newsletter' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-1.5">
                      <span className="text-text-secondary">{item.label}</span>
                      <button
                        onClick={() => setUserProfile({ ...userProfile, [item.key]: !userProfile[item.key] })}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${userProfile[item.key] ? 'bg-purple' : 'bg-surface-elevated border border-border-subtle'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${userProfile[item.key] ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data & Privacy List */}
              <div className="card p-4 space-y-2.5">
                <h3 className="section-title text-xs">Data & Privacy</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated/40 hover:bg-surface-elevated cursor-pointer">
                    <span className="flex items-center gap-2 text-text-primary"><FiDownload className="text-success" /> Download My Data</span>
                    <FiDownload size={14} className="text-text-muted" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated/40 hover:bg-surface-elevated cursor-pointer">
                    <span className="flex items-center gap-2 text-text-primary"><FiRefreshCw className="text-warning" /> Clear Cache</span>
                    <span className="text-[10px] font-mono text-text-muted">45.2 MB</span>
                  </div>
                </div>
              </div>

              {/* Need Help? Box */}
              <div className="card p-4 space-y-2 text-center bg-gradient-to-br from-purple/10 to-surface border-purple/30">
                <h4 className="text-xs font-bold text-text-primary">Need Help?</h4>
                <p className="text-[10px] text-text-muted">Contact support for any queries or issues.</p>
                <button className="btn-primary text-xs w-full py-2 bg-purple hover:bg-purple/80 shadow-glow-primary">
                  Contact Support
                </button>
              </div>
            </div>
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

      {/* LIVE WORKOUT TIMER MODAL */}
      <AnimatePresence>
        {isWorkoutActive && (
          <div className="fixed bottom-6 right-6 z-50 p-5 rounded-2xl bg-surface border border-purple shadow-glow-primary text-white space-y-3 w-80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-danger animate-ping" /> Live Workout Session
              </span>
              <span className="text-base font-bold font-mono">{formatTimer(workoutTimer)}</span>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold text-text-primary">Barbell Bench Press</p>
              <p className="text-[10px] text-text-muted">Set 1: 80 kg × 10 reps (Done)</p>
              <p className="text-[10px] text-text-muted">Set 2: 80 kg × 10 reps</p>
              <p className="text-[10px] text-text-muted">Set 3: 85 kg × 8 reps</p>
            </div>

            {isResting && (
              <div className="p-2 rounded-xl bg-purple/20 text-center text-xs font-mono">
                Rest Timer: <strong className="text-purple">{formatTimer(restTimer)}</strong>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => handleLogSet(1)} className="btn-primary text-xs flex-1 bg-success hover:bg-success/80 py-1.5">
                Log Set 2
              </button>
              <button onClick={() => finishLiveWorkout()} className="btn-primary text-xs flex-1 bg-danger hover:bg-danger/80 py-1.5">
                Finish
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
