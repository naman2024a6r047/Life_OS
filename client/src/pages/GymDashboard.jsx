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
  const [settingsSubTab, setSettingsSubTab] = useState('profile');

  // Check if logged in account is Demo Account
  const isDemoAccount = !user || user.id === 'demo_user_id' || user.email === 'demo@lifeos.dev' || user.email === 'user@lifeos.dev' || localStorage.getItem('lifeos_is_demo') === 'true';

  // Storage Keys for User Specific Persistence
  const workoutStorageKey = user?.id ? `lifeos_user_${user.id}_gym_workouts` : 'lifeos_demo_gym_workouts';
  const profileStorageKey = user?.id ? `lifeos_user_${user.id}_gym_profile` : 'lifeos_demo_gym_profile';

  // Demo Default Workouts
  const demoWorkouts = [
    { id: 1, title: 'Push Day', time: 'Today, 7:00 AM', focus: 'Chest, Shoulders, Triceps', duration: '75 min', volume: '8,250 kg', calories: '620 kcal', notes: '—', status: 'Completed' },
    { id: 2, title: 'Pull Day', time: 'Yesterday, 6:30 PM', focus: 'Back, Biceps, Rear Delts', duration: '70 min', volume: '6,200 kg', calories: '560 kcal', notes: 'Felt strong 💪', status: 'Completed' },
    { id: 3, title: 'Leg Day', time: '16 May 2026', focus: 'Quads, Hamstrings, Calves', duration: '80 min', volume: '7,100 kg', calories: '720 kcal', notes: '—', status: 'Completed' },
    { id: 4, title: 'Push Day', time: '14 May 2026', focus: 'Chest, Shoulders, Triceps', duration: '65 min', volume: '6,000 kg', calories: '480 kcal', notes: 'Added reps', status: 'Completed' },
    { id: 5, title: 'Pull Day', time: '12 May 2026', focus: 'Back, Biceps, Rear Delts', duration: '60 min', volume: '5,600 kg', calories: '450 kcal', notes: '—', status: 'Completed' },
    { id: 6, title: 'Leg Day', time: '10 May 2026', focus: 'Quads, Hamstrings, Calves', duration: '75 min', volume: '6,550 kg', calories: '610 kcal', notes: 'PR on Squat 🏋️', status: 'Completed' },
    { id: 7, title: 'Rest Day', time: '9 May 2026', focus: '—', duration: '—', volume: '—', calories: '—', notes: 'Active recovery', status: 'Rest Day' },
    { id: 8, title: 'Upper Body Strength', time: '7 May 2026', focus: 'Chest, Back, Shoulders, Arms', duration: '70 min', volume: '6,000 kg', calories: '530 kcal', notes: 'Good pump', status: 'Completed' },
  ];

  // Workouts List State (Demo gets demo data, Real User gets their own isolated array)
  const [workoutsList, setWorkoutsList] = useState(() => {
    if (isDemoAccount) return demoWorkouts;
    const saved = localStorage.getItem(workoutStorageKey);
    return saved ? JSON.parse(saved) : [];
  });

  // User Profile State
  const [userProfile, setUserProfile] = useState(() => {
    if (isDemoAccount) {
      return {
        fullName: 'Naman',
        username: 'naman_fitness',
        email: 'naman@example.com',
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
      };
    }
    const savedProf = localStorage.getItem(profileStorageKey);
    if (savedProf) return JSON.parse(savedProf);
    return {
      fullName: user?.username || user?.email?.split('@')[0] || 'Member',
      username: user?.username || user?.email?.split('@')[0] || 'member',
      email: user?.email || 'user@lifeos.dev',
      height: '175 cm',
      weight: '65.0 kg',
      age: 24,
      gender: 'Male',
      primaryGoal: 'Build Muscle',
      targetWeight: '70',
      targetDate: '2026-12-31',
      weeklyGoal: 4,
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
    };
  });

  // Persist for Real Users
  useEffect(() => {
    if (!isDemoAccount && user?.id) {
      localStorage.setItem(workoutStorageKey, JSON.stringify(workoutsList));
    }
  }, [workoutsList, isDemoAccount, user?.id, workoutStorageKey]);

  useEffect(() => {
    if (!isDemoAccount && user?.id) {
      localStorage.setItem(profileStorageKey, JSON.stringify(userProfile));
    }
  }, [userProfile, isDemoAccount, user?.id, profileStorageKey]);

  // Interactive Muscle & Exercise Filter State
  const streak = isDemoAccount ? 28 : (user?.current_streak || (workoutsList.length > 0 ? 1 : 0));
  const [selectedMuscleCategory, setSelectedMuscleCategory] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState('Barbell Bench Press');
  const [searchExercise, setSearchExercise] = useState('');

  // Active Workout Mode State
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [loggedSets, setLoggedSets] = useState([
    { setNum: 1, weight: '80', reps: '10', done: true },
    { setNum: 2, weight: '80', reps: '10', done: false },
    { setNum: 3, weight: '85', reps: '8', done: false },
  ]);

  const [prNotification, setPrNotification] = useState(null);
  const [showNewWorkoutModal, setShowNewWorkoutModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [showEditGoalsModal, setShowEditGoalsModal] = useState(false);

  const [newWorkout, setNewWorkout] = useState({ title: 'Push Day', focus: 'Chest • Shoulders • Triceps', duration: '60', volume: '7500', calories: '550', notes: '' });

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
    const createdSession = {
      id: Date.now(),
      title: 'Live Session Workout',
      time: 'Just now',
      focus: 'Chest • Triceps',
      duration: `${Math.max(1, Math.floor(workoutTimer / 60))} min`,
      volume: `${maxWeight * 10} kg`,
      calories: '450 kcal',
      notes: maxWeight >= 85 ? 'New PR Hit! 🏆' : 'Great session!',
      status: 'Completed'
    };
    setWorkoutsList([createdSession, ...workoutsList]);
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

  // Header Metrics Calculations
  const workoutsCountMonth = isDemoAccount ? 12 : workoutsList.filter(w => w.status === 'Completed').length;
  const totalVolumeLiftedStr = isDemoAccount ? '47.5 kg' : `${workoutsList.reduce((sum, w) => sum + (parseFloat(String(w.volume).replace(/[^0-9.]/g, '')) || 0), 0).toLocaleString()} kg`;
  const totalPRCount = isDemoAccount ? 18 : workoutsList.filter(w => w.notes && w.notes.includes('PR')).length;

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

        {/* Top 4 Metrics Summary Bar */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-elevated border border-border-subtle">
            <span className="text-base">🔥</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">{workoutsCountMonth}</p>
              <p className="text-[9px] text-text-muted">Workouts This Month</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-elevated border border-border-subtle">
            <span className="text-base">🏆</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">{totalVolumeLiftedStr}</p>
              <p className="text-[9px] text-text-muted">Total Volume (Lifted)</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-elevated border border-border-subtle">
            <span className="text-base">⭐</span>
            <div>
              <p className="text-sm font-bold font-mono text-text-primary">{totalPRCount}</p>
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
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${workoutsList.length > 0 ? 'bg-success/20 text-success' : 'bg-purple/20 text-purple'}`}>
                  {workoutsList.length > 0 ? 'Active Session' : 'Ready'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple/10 text-purple flex items-center justify-center">
                      <FiActivity size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text-primary">
                        {workoutsList.length > 0 ? workoutsList[0].title : 'Push Day Session'}
                      </h3>
                      <p className="text-[10px] text-text-muted">
                        {workoutsList.length > 0 ? workoutsList[0].focus : 'Chest • Shoulders • Triceps'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-3 text-center">
                    <div className="p-1.5 rounded-lg bg-background/50">
                      <p className="text-[8px] text-text-muted">Exercises</p>
                      <p className="text-xs font-bold font-mono text-text-primary">{workoutsList.length > 0 ? '6' : '0'}</p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-background/50">
                      <p className="text-[8px] text-text-muted">Duration</p>
                      <p className="text-xs font-bold font-mono text-text-primary">{workoutsList.length > 0 ? workoutsList[0].duration : '0 min'}</p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-background/50">
                      <p className="text-[8px] text-text-muted">Volume</p>
                      <p className="text-xs font-bold font-mono text-text-primary">{workoutsList.length > 0 ? workoutsList[0].volume : '0 kg'}</p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-background/50">
                      <p className="text-[8px] text-text-muted">Calories</p>
                      <p className="text-xs font-bold font-mono text-text-primary">{workoutsList.length > 0 ? workoutsList[0].calories : '0 kcal'}</p>
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
                      isDemoAccount ? (i < 5 ? 'bg-success text-white' : i === 5 ? 'bg-purple text-white' : 'bg-surface-elevated text-text-muted') :
                      (i < workoutsList.length ? 'bg-success text-white' : 'bg-surface-elevated text-text-muted')
                    }`}>
                      {(isDemoAccount && i <= 5) || (!isDemoAccount && i < workoutsList.length) ? '✓' : '•'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-1 pt-2 border-t border-border-subtle text-center">
                <div><p className="text-[8px] text-text-muted">Workouts</p><p className="text-xs font-bold font-mono text-text-primary">{workoutsList.length} / 6</p></div>
                <div><p className="text-[8px] text-text-muted">Hours</p><p className="text-xs font-bold font-mono text-text-primary">{isDemoAccount ? '6.4' : (workoutsList.length * 1.1).toFixed(1)}</p></div>
                <div><p className="text-[8px] text-text-muted">Calories</p><p className="text-xs font-bold font-mono text-text-primary">{isDemoAccount ? '2,850 kcal' : `${workoutsList.length * 450} kcal`}</p></div>
                <div><p className="text-[8px] text-text-muted">Avg. Volume</p><p className="text-xs font-bold font-mono text-text-primary">{isDemoAccount ? '7,200 kg' : (workoutsList.length > 0 ? '6,500 kg' : '0 kg')}</p></div>
              </div>
            </div>

            {/* Current Streak Dial Card */}
            <div className="col-span-3 card p-4 flex flex-col items-center justify-center text-center space-y-2">
              <h3 className="section-title text-xs">Current Streak</h3>
              <div className="relative w-28 h-28 my-1">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                  <circle cx="56" cy="56" r="44" stroke="#161A2E" strokeWidth="10" fill="none" />
                  <circle cx="56" cy="56" r="44" stroke="#22C55E" strokeWidth="10" strokeDasharray={`${(streak / 30) * 276} 276`} fill="none" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold font-mono text-text-primary">{streak}</span>
                  <span className="text-[9px] text-text-muted">Days</span>
                </div>
              </div>
              <p className="text-[10px] text-text-muted">Best Streak: <strong className="text-text-primary">{isDemoAccount ? '32 days' : `${Math.max(streak, 7)} days`}</strong></p>
            </div>
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4 card p-4 space-y-3">
              <div className="section-header">
                <h3 className="section-title">Workout History</h3>
                <span onClick={() => setActiveTab('workouts')} className="section-link">View All</span>
              </div>
              {workoutsList.length > 0 ? (
                <div className="space-y-2">
                  {workoutsList.slice(0, 5).map((w, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated/40 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple/10 text-purple flex items-center justify-center">
                          <FiActivity size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-text-primary leading-tight">{w.title}</p>
                          <p className="text-[9px] text-text-muted">{w.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="text-text-muted">{w.duration}</span>
                        <span className="font-bold text-text-primary">{w.volume}</span>
                        <FiCheckCircle className="text-success" size={12} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-text-muted space-y-2">
                  <p>No workouts recorded yet.</p>
                  <button onClick={() => startLiveWorkout()} className="btn-primary text-xs px-3 py-1.5 bg-purple">
                    Start Your First Workout
                  </button>
                </div>
              )}
            </div>

            <div className="col-span-5 card p-4 space-y-3">
              <div className="section-header">
                <h3 className="section-title">Progress Overview</h3>
                <span className="text-xs text-text-muted">Volume (kg) ▾</span>
              </div>
              <div className="h-36 flex items-end justify-between gap-1.5 px-1 pt-4 pb-2 border-b border-border-subtle relative">
                {[40, 75, 50, 65, 55, 85, 45, 60, 90, 70, 80].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div className={`w-full rounded-t-md ${i === 5 ? 'bg-purple shadow-glow-primary' : 'bg-primary/40'}`} style={{ height: `${workoutsList.length > 0 ? h : 10}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[8px] text-text-muted font-mono">
                <span>9 May</span><span>15 May</span><span>23 May</span><span>30 May</span><span>6 Jun</span><span>13 Jun</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center pt-1">
                <div className="p-1.5 rounded-lg bg-surface-elevated"><p className="text-[8px] text-text-muted">Total Workouts</p><p className="text-xs font-bold font-mono text-text-primary">{workoutsList.length}</p></div>
                <div className="p-1.5 rounded-lg bg-surface-elevated"><p className="text-[8px] text-text-muted">Total Volume</p><p className="text-xs font-bold font-mono text-text-primary">{totalVolumeLiftedStr}</p></div>
                <div className="p-1.5 rounded-lg bg-surface-elevated"><p className="text-[8px] text-text-muted">Total Time</p><p className="text-xs font-bold font-mono text-text-primary">{isDemoAccount ? '28.5 hrs' : `${(workoutsList.length * 1.1).toFixed(1)} hrs`}</p></div>
                <div className="p-1.5 rounded-lg bg-surface-elevated"><p className="text-[8px] text-text-muted">Avg. Volume/Workout</p><p className="text-xs font-bold font-mono text-text-primary">{isDemoAccount ? '7,065 kg' : (workoutsList.length > 0 ? '6,200 kg' : '0 kg')}</p></div>
              </div>
            </div>

            <div className="col-span-3 card p-4 space-y-3">
              <div className="section-header">
                <h3 className="section-title">Personal Records</h3>
                <span onClick={() => setActiveTab('progress')} className="section-link">View All</span>
              </div>
              {isDemoAccount ? (
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
              ) : (
                <div className="text-center py-6 text-xs text-text-muted">
                  <p>No Personal Records logged yet.</p>
                  <p className="text-[10px] mt-1 text-text-muted">Hit new PRs in your live workouts!</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB TAB 2: WORKOUTS */}
      {activeTab === 'workouts' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
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
              <button onClick={() => setShowNewWorkoutModal(true)} className="btn-primary text-xs px-4 py-2 bg-purple hover:bg-purple/80 flex items-center gap-1.5 shadow-glow-primary">
                <FiPlus size={16} /> New Workout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple/10 text-purple flex items-center justify-center text-xl">🏋️</div>
              <div><p className="text-[10px] text-text-muted">Workouts This Week</p><h3 className="text-2xl font-bold font-mono text-text-primary">{workoutsList.length}</h3></div>
            </div>
            <div className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center text-xl">⏱️</div>
              <div><p className="text-[10px] text-text-muted">Total Duration This Week</p><h3 className="text-2xl font-bold font-mono text-text-primary">{isDemoAccount ? '6h 40m' : `${(workoutsList.length * 1.1).toFixed(1)}h`}</h3></div>
            </div>
            <div className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center text-xl">🏆</div>
              <div><p className="text-[10px] text-text-muted">Total Volume This Week</p><h3 className="text-2xl font-bold font-mono text-text-primary">{totalVolumeLiftedStr}</h3></div>
            </div>
            <div className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center text-xl">🔥</div>
              <div><p className="text-[10px] text-text-muted">Calories Burned This Week</p><h3 className="text-2xl font-bold font-mono text-text-primary">{isDemoAccount ? '4,250 kcal' : `${workoutsList.length * 450} kcal`}</h3></div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 space-y-4">
              <div className="card p-4 space-y-3">
                {workoutsList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border-subtle text-[10px] text-text-muted uppercase tracking-wider">
                          <th className="pb-3 font-semibold">WORKOUT</th>
                          <th className="pb-3 font-semibold">FOCUS AREA</th>
                          <th className="pb-3 font-semibold">DURATION</th>
                          <th className="pb-3 font-semibold">VOLUME</th>
                          <th className="pb-3 font-semibold">CALORIES</th>
                          <th className="pb-3 font-semibold">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle/50">
                        {workoutsList.map(w => (
                          <tr key={w.id} className="hover:bg-surface-elevated/40 transition-colors">
                            <td className="py-3 pr-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-purple/10 text-purple flex items-center justify-center font-bold">🏋️</div>
                                <div><p className="font-bold text-text-primary">{w.title}</p><p className="text-[9px] text-text-muted">{w.time}</p></div>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-text-muted">{w.focus}</td>
                            <td className="py-3 px-2 font-mono text-text-primary">{w.duration}</td>
                            <td className="py-3 px-2 font-mono font-bold text-text-primary">{w.volume}</td>
                            <td className="py-3 px-2 font-mono text-text-primary">{w.calories}</td>
                            <td className="py-3 px-2"><span className="badge-success text-[9px]">{w.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 text-xs text-text-muted space-y-3">
                    <p className="font-bold text-text-primary">No Workouts Logged Yet</p>
                    <p>Start recording your daily workouts to see your stats here.</p>
                    <button onClick={() => setShowNewWorkoutModal(true)} className="btn-primary text-xs px-4 py-2 bg-purple">
                      + Log Your First Workout
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-4 space-y-4">
              <div className="card p-4 space-y-3">
                <h3 className="section-title text-xs">Muscle Focus</h3>
                <div className="w-full h-48 flex items-center justify-center">
                  <MuscleDiagram selectedExercise="bench press" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB TAB 3: PROGRESS */}
      {activeTab === 'progress' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Progress Overview</h2>
              <p className="text-xs text-text-muted">Track your fitness journey and see how far you've come.</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            <div className="card p-3 space-y-1"><span className="text-xs font-bold text-text-muted">Total Workouts</span><h3 className="text-2xl font-bold font-mono text-text-primary">{isDemoAccount ? 128 : workoutsList.length}</h3></div>
            <div className="card p-3 space-y-1"><span className="text-xs font-bold text-text-muted">Total Volume</span><h3 className="text-2xl font-bold font-mono text-text-primary">{totalVolumeLiftedStr}</h3></div>
            <div className="card p-3 space-y-1"><span className="text-xs font-bold text-text-muted">Calories Burned</span><h3 className="text-2xl font-bold font-mono text-text-primary">{isDemoAccount ? '18,450 kcal' : `${workoutsList.length * 450} kcal`}</h3></div>
            <div className="card p-3 space-y-1"><span className="text-xs font-bold text-text-muted">Total Duration</span><h3 className="text-2xl font-bold font-mono text-text-primary">{isDemoAccount ? '68h 35m' : `${(workoutsList.length * 1.1).toFixed(1)}h`}</h3></div>
            <div className="card p-3 space-y-1"><span className="text-xs font-bold text-text-muted">Avg. / Week</span><h3 className="text-2xl font-bold font-mono text-text-primary">{isDemoAccount ? '5.1' : (workoutsList.length > 0 ? '3.0' : '0')}</h3></div>
          </div>
        </motion.div>
      )}

      {/* SUB TAB 4: EXERCISES */}
      {activeTab === 'exercises' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Exercises</h2>
              <p className="text-xs text-text-muted">Browse and manage your exercise library.</p>
            </div>
            <button onClick={() => setShowAddExerciseModal(true)} className="btn-primary text-xs px-4 py-2 bg-purple hover:bg-purple/80 flex items-center gap-1.5">
              <FiPlus size={16} /> Add Exercise
            </button>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 card p-2 space-y-1">
              {exerciseCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedMuscleCategory(cat.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium ${
                    selectedMuscleCategory === cat.id ? 'bg-purple text-white font-bold' : 'text-text-muted hover:bg-surface-elevated'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="font-mono text-[10px]">{cat.count}</span>
                </button>
              ))}
            </div>

            <div className="col-span-5 card p-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border-subtle text-[10px] text-text-muted">
                    <th className="pb-2">EXERCISE</th>
                    <th className="pb-2">GROUP</th>
                    <th className="pb-2">DIFFICULTY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50">
                  {exercisesData.map(ex => (
                    <tr key={ex.name} onClick={() => setSelectedExercise(ex.name)} className="cursor-pointer hover:bg-surface-elevated/40">
                      <td className="py-2.5 text-text-primary font-bold">{ex.name}</td>
                      <td className="py-2.5 text-text-muted">{ex.group}</td>
                      <td className="py-2.5"><span className="badge-warning text-[9px]">{ex.difficulty}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="col-span-4 card p-4 space-y-3">
              <h3 className="text-sm font-bold text-text-primary">{activeExerciseObj.name}</h3>
              <div className="w-full h-36 rounded-xl bg-slate-900 flex items-center justify-center border border-border-subtle">
                <FiPlay size={24} className="text-purple" />
              </div>
              <p className="text-xs text-text-muted">Primary: <strong className="text-purple">{activeExerciseObj.primary}</strong></p>
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB TAB 6: BODY STATS */}
      {activeTab === 'body-stats' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Body Status</h2>
              <p className="text-xs text-text-muted">Track your body composition and measurements.</p>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-3">
            <div className="card p-3 space-y-1"><span className="text-[10px] text-text-muted">Weight</span><h3 className="text-xl font-bold font-mono text-text-primary">{userProfile.weight}</h3></div>
            <div className="card p-3 space-y-1"><span className="text-[10px] text-text-muted">Body Fat</span><h3 className="text-xl font-bold font-mono text-text-primary">{isDemoAccount ? '16.2 %' : '--'}</h3></div>
            <div className="card p-3 space-y-1"><span className="text-[10px] text-text-muted">Muscle Mass</span><h3 className="text-xl font-bold font-mono text-text-primary">{isDemoAccount ? '55.4 kg' : '--'}</h3></div>
            <div className="card p-3 space-y-1"><span className="text-[10px] text-text-muted">BMI</span><h3 className="text-xl font-bold font-mono text-text-primary">{isDemoAccount ? '22.1' : '--'}</h3></div>
            <div className="card p-3 space-y-1"><span className="text-[10px] text-text-muted">Body Water</span><h3 className="text-xl font-bold font-mono text-text-primary">{isDemoAccount ? '57.3 %' : '--'}</h3></div>
            <div className="card p-3 space-y-1"><span className="text-[10px] text-text-muted">Visceral Fat</span><h3 className="text-xl font-bold font-mono text-text-primary">{isDemoAccount ? '6' : '--'}</h3></div>
          </div>
        </motion.div>
      )}

      {/* SUB TAB 5: NUTRITION */}
      {activeTab === 'nutrition' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Nutrition Tracker</h2>
              <p className="text-xs text-text-muted">Track your daily calories, macros, and nutrition goals.</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="card p-4 space-y-1"><span className="text-[10px] text-text-muted">Calories Goal</span><h3 className="text-2xl font-bold font-mono text-text-primary">2,350 / 2,400 kcal</h3></div>
            <div className="card p-4 space-y-1"><span className="text-[10px] text-text-muted">Protein Target</span><h3 className="text-2xl font-bold font-mono text-text-primary">120 / 120 g</h3></div>
            <div className="card p-4 space-y-1"><span className="text-[10px] text-text-muted">Carbs Target</span><h3 className="text-2xl font-bold font-mono text-text-primary">280 / 300 g</h3></div>
            <div className="card p-4 space-y-1"><span className="text-[10px] text-text-muted">Fats Target</span><h3 className="text-2xl font-bold font-mono text-text-primary">70 / 75 g</h3></div>
          </div>
        </motion.div>
      )}

      {/* SUB TAB 7: SETTINGS */}
      {activeTab === 'settings' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Settings</h2>
              <p className="text-xs text-text-muted">Manage your preferences, account settings and app customization.</p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 space-y-4">
              <div className="card p-5 space-y-4">
                <h3 className="section-title text-sm">Profile Information</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                  <div><span className="text-text-muted">Full Name</span><p className="font-bold text-text-primary">{userProfile.fullName}</p></div>
                  <div><span className="text-text-muted">Height</span><p className="font-bold text-text-primary">{userProfile.height}</p></div>
                  <div><span className="text-text-muted">Username</span><p className="font-bold text-text-primary">{userProfile.username}</p></div>
                  <div><span className="text-text-muted">Weight</span><p className="font-bold text-text-primary">{userProfile.weight}</p></div>
                  <div><span className="text-text-muted">Email</span><p className="font-bold text-text-primary">{userProfile.email}</p></div>
                  <div><span className="text-text-muted">Age / Gender</span><p className="font-bold text-text-primary">{userProfile.age} • {userProfile.gender}</p></div>
                </div>
              </div>
            </div>

            <div className="col-span-4 space-y-4">
              <div className="card p-4 space-y-2 text-center bg-gradient-to-br from-purple/10 to-surface border-purple/30">
                <h4 className="text-xs font-bold text-text-primary">Need Help?</h4>
                <p className="text-[10px] text-text-muted">Contact support for any queries or issues.</p>
                <button className="btn-primary text-xs w-full py-2 bg-purple">Contact Support</button>
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
