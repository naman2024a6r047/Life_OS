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
  FiCamera, FiShare2, FiStar, FiRotateCcw, FiList, FiVideo, FiImage, FiExternalLink
} from 'react-icons/fi';
import MuscleDiagram from '../components/fitness/MuscleDiagram';
import GymProgressTab from '../components/fitness/GymProgressTab';
import GymBodyStatsTab from '../components/fitness/GymBodyStatsTab';

export default function GymDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [settingsSubTab, setSettingsSubTab] = useState('profile');

  // Check if logged in account is Demo Account
  const isDemoAccount = !user || user.id === 'demo_user_id' || user.email === 'demo@lifeos.dev' || user.email === 'user@lifeos.dev' || localStorage.getItem('lifeos_is_demo') === 'true';

  // Storage Keys for User Specific Persistence
  const workoutStorageKey = user?.id ? `lifeos_user_${user.id}_gym_workouts` : 'lifeos_demo_gym_workouts';
  const profileStorageKey = user?.id ? `lifeos_user_${user.id}_gym_profile` : 'lifeos_demo_gym_profile';
  const planStorageKey = user?.id ? `lifeos_user_${user.id}_gym_weekly_plan` : 'lifeos_demo_gym_weekly_plan';
  const prStorageKey = user?.id ? `lifeos_user_${user.id}_gym_prs` : 'lifeos_demo_gym_prs';
  const exerciseLibraryStorageKey = user?.id ? `lifeos_user_${user.id}_gym_exercise_library` : 'lifeos_demo_gym_exercise_library';

  // Default Exercises Library
  const defaultExercises = [
    {
      id: 'ex_1',
      name: 'Barbell Bench Press',
      group: 'Chest',
      equipment: 'Barbell, Bench',
      difficulty: 'Intermediate',
      primary: 'Chest',
      secondary: 'Triceps, Shoulders',
      image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=60',
      video_url: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
      instructions: 'Lie on bench flat, grip barbell slightly wider than shoulders, lower to chest and press up.',
      tips: 'Keep back flat, retract shoulder blades, drive feet into floor.'
    },
    {
      id: 'ex_2',
      name: 'Barbell Back Squat',
      group: 'Legs',
      equipment: 'Barbell',
      difficulty: 'Advanced',
      primary: 'Quads',
      secondary: 'Glutes, Hamstrings, Core',
      image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=60',
      video_url: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
      instructions: 'Place barbell across upper traps, hinge at hips, squat parallel and drive up.',
      tips: 'Keep chest high and brace core tightly.'
    },
    {
      id: 'ex_3',
      name: 'Pull Up',
      group: 'Back',
      equipment: 'Bodyweight',
      difficulty: 'Intermediate',
      primary: 'Back',
      secondary: 'Biceps, Core',
      image_url: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=60',
      video_url: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
      instructions: 'Grip bar shoulder width apart, pull chest to bar by driving elbows down.',
      tips: 'Avoid swinging legs, engage core.'
    },
    {
      id: 'ex_4',
      name: 'Dumbbell Shoulder Press',
      group: 'Shoulders',
      equipment: 'Dumbbell, Bench',
      difficulty: 'Intermediate',
      primary: 'Shoulders',
      secondary: 'Triceps',
      image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=60',
      video_url: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
      instructions: 'Seated on bench, press dumbbells overhead until fully extended.',
      tips: 'Do not overarch lower back.'
    },
    {
      id: 'ex_5',
      name: 'Deadlift',
      group: 'Back',
      equipment: 'Barbell',
      difficulty: 'Advanced',
      primary: 'Back',
      secondary: 'Hamstrings, Glutes, Forearms',
      image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=60',
      video_url: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
      instructions: 'Stand under bar, hinge hips, grip bar firmly and extend hips to lift.',
      tips: 'Keep bar close to body throughout.'
    }
  ];

  // Exercises Library State
  const [exercisesList, setExercisesList] = useState(() => {
    const saved = localStorage.getItem(exerciseLibraryStorageKey);
    return saved ? JSON.parse(saved) : defaultExercises;
  });

  // Default Weekly Plan Template
  const defaultWeeklyPlan = {
    Monday: { title: 'Push Day', focus: 'Chest • Shoulders • Triceps', exercises: [
      { id: 'ex_1', name: 'Barbell Bench Press', sets: 4, reps: 10, targetWeight: '80', completed: true },
      { id: 'ex_2', name: 'Dumbbell Shoulder Press', sets: 3, reps: 12, targetWeight: '24', completed: true },
    ]},
    Tuesday: { title: 'Pull Day', focus: 'Back • Biceps • Rear Delts', exercises: [
      { id: 'ex_3', name: 'Pull Up', sets: 4, reps: 10, targetWeight: 'BW', completed: false },
      { id: 'ex_5', name: 'Deadlift', sets: 3, reps: 8, targetWeight: '120', completed: false },
    ]},
    Wednesday: { title: 'Leg Day', focus: 'Quads • Hamstrings • Calves', exercises: [
      { id: 'ex_2', name: 'Barbell Back Squat', sets: 4, reps: 10, targetWeight: '100', completed: false },
    ]},
    Thursday: { title: 'Rest Day', focus: 'Active Recovery & Mobility', exercises: [] },
    Friday: { title: 'Upper Body Strength', focus: 'Chest • Back • Arms', exercises: [
      { id: 'ex_1', name: 'Barbell Bench Press', sets: 4, reps: 8, targetWeight: '85', completed: false },
    ]},
    Saturday: { title: 'Lower Body & Core', focus: 'Legs • Abs', exercises: [] },
    Sunday: { title: 'Rest Day', focus: 'Recovery', exercises: [] },
  };

  // Demo Default Workouts
  const demoWorkouts = [
    { id: 1, title: 'Push Day', time: 'Today, 7:00 AM', focus: 'Chest, Shoulders, Triceps', duration: '75 min', volume: '8,250 kg', calories: '620 kcal', notes: '—', status: 'Completed' },
    { id: 2, title: 'Pull Day', time: 'Yesterday, 6:30 PM', focus: 'Back, Biceps, Rear Delts', duration: '70 min', volume: '6,200 kg', calories: '560 kcal', notes: 'Felt strong 💪', status: 'Completed' },
  ];

  // Default PRs
  const defaultPRs = {
    'Barbell Bench Press': { weight: 80, date: '14 May 2026' },
    'Barbell Back Squat': { weight: 100, date: '12 May 2026' },
    'Deadlift': { weight: 120, date: '10 May 2026' }
  };

  // State Declarations
  const [weeklyPlan, setWeeklyPlan] = useState(() => {
    const saved = localStorage.getItem(planStorageKey);
    return saved ? JSON.parse(saved) : defaultWeeklyPlan;
  });

  const [personalRecords, setPersonalRecords] = useState(() => {
    const saved = localStorage.getItem(prStorageKey);
    return saved ? JSON.parse(saved) : {};
  });

  const [workoutsList, setWorkoutsList] = useState(() => {
    const saved = localStorage.getItem(workoutStorageKey);
    return saved ? JSON.parse(saved) : [];
  });

  const [userProfile, setUserProfile] = useState(() => {
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

  // Get current weekday for highlighting and default selection
  const currentWeekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  // Active Selected Day for Weekly Plan Preview / Editing
  const [selectedPlanDay, setSelectedPlanDay] = useState(currentWeekday);
  const [editingDayTitle, setEditingDayTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [showWeeklyPlanModal, setShowWeeklyPlanModal] = useState(false);
  const [newPlanExercise, setNewPlanExercise] = useState({ name: exercisesList[0]?.name || 'Barbell Bench Press', sets: 3, reps: 10, targetWeight: '80' });

  // Exercise CRUD Modal States
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [exerciseForm, setExerciseForm] = useState({
    name: '',
    group: 'Chest',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    primary: 'Chest',
    secondary: 'Triceps',
    image_url: '',
    video_url: '',
    instructions: '',
    tips: ''
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(exerciseLibraryStorageKey, JSON.stringify(exercisesList));
  }, [exercisesList, exerciseLibraryStorageKey]);

  useEffect(() => {
    localStorage.setItem(planStorageKey, JSON.stringify(weeklyPlan));
  }, [weeklyPlan, planStorageKey]);

  useEffect(() => {
    if (!isDemoAccount && user?.id) {
      localStorage.setItem(prStorageKey, JSON.stringify(personalRecords));
    }
  }, [personalRecords, isDemoAccount, user?.id, prStorageKey]);

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

  // Open Create Exercise Modal
  const openCreateExerciseModal = () => {
    setEditingExerciseId(null);
    setExerciseForm({
      name: '',
      group: 'Chest',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      primary: 'Chest',
      secondary: 'Triceps',
      image_url: '',
      video_url: '',
      instructions: '',
      tips: ''
    });
    setShowExerciseModal(true);
  };

  // Open Edit Exercise Modal
  const openEditExerciseModal = (ex) => {
    setEditingExerciseId(ex.id);
    setExerciseForm({
      name: ex.name,
      group: ex.group || 'Chest',
      equipment: ex.equipment || 'Barbell',
      difficulty: ex.difficulty || 'Intermediate',
      primary: ex.primary || 'Chest',
      secondary: ex.secondary || 'Triceps',
      image_url: ex.image_url || '',
      video_url: ex.video_url || '',
      instructions: ex.instructions || '',
      tips: ex.tips || ''
    });
    setShowExerciseModal(true);
  };

  // Save / Update Exercise Handler
  const handleSaveExercise = (e) => {
    e.preventDefault();
    if (!exerciseForm.name.trim()) return;

    if (editingExerciseId) {
      setExercisesList(prev => prev.map(ex => ex.id === editingExerciseId ? { ...ex, ...exerciseForm } : ex));
    } else {
      const newEx = {
        id: `ex_${Date.now()}`,
        ...exerciseForm
      };
      setExercisesList(prev => [newEx, ...prev]);
      setSelectedExercise(newEx.name);
      setNewPlanExercise(prev => ({ ...prev, name: newEx.name }));
    }
    setShowExerciseModal(false);
  };

  // Delete Exercise Handler
  const handleDeleteExercise = (id) => {
    setExercisesList(prev => prev.filter(ex => ex.id !== id));
    setShowExerciseModal(false);
  };

  // One-Click Checkbox Logging Function & PR Carryover Logic
  const handleToggleExerciseCheckbox = (day, exerciseId) => {
    const updatedPlan = { ...weeklyPlan };
    const dayExList = updatedPlan[day].exercises;
    const targetEx = dayExList.find(e => e.id === exerciseId);

    if (targetEx) {
      targetEx.completed = !targetEx.completed;
      setWeeklyPlan(updatedPlan);

      if (targetEx.completed) {
        const weightNum = parseFloat(targetEx.loggedWeight || targetEx.targetWeight) || 0;
        const exName = targetEx.name;
        const oldPR = personalRecords[exName];

        if (!oldPR || weightNum > oldPR.weight) {
          const newPRRecord = { weight: weightNum, date: 'Today' };
          setPersonalRecords(prev => ({ ...prev, [exName]: newPRRecord }));
          setPrNotification(`🎉 New Personal Record! ${exName} ${weightNum} kg achieved!`);
          setTimeout(() => setPrNotification(null), 5000);
        }
      }
    }
  };

  // Add Exercise to Weekly Plan
  const handleAddExerciseToPlan = (e) => {
    e.preventDefault();
    const selectedEx = exercisesList.find(ex => ex.name === newPlanExercise.name);
    if (!selectedEx) return;

    const updatedPlan = { ...weeklyPlan };
    const exObj = {
      id: `ex_${Date.now()}`,
      name: selectedEx.name,
      sets: Number(newPlanExercise.sets),
      reps: Number(newPlanExercise.reps),
      targetWeight: String(newPlanExercise.targetWeight),
      completed: false
    };
    updatedPlan[selectedPlanDay].exercises.push(exObj);
    setWeeklyPlan(updatedPlan);
    setShowWeeklyPlanModal(false);
  };

  // Interactive Muscle & Exercise Filter State
  const streak = user?.current_streak || (workoutsList.length > 0 ? 1 : 0);
  const [selectedMuscleCategory, setSelectedMuscleCategory] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState('Barbell Bench Press');
  const [searchExercise, setSearchExercise] = useState('');

  // Modals state
  const [prNotification, setPrNotification] = useState(null);
  const [showNewWorkoutModal, setShowNewWorkoutModal] = useState(false);

  const [newWorkout, setNewWorkout] = useState({ title: 'Push Day', focus: 'Chest • Shoulders • Triceps', duration: '60', volume: '7500', calories: '550', notes: '' });

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
  const workoutsCountMonth = workoutsList.filter(w => w.status === 'Completed').length;
  const totalVolumeLiftedStr = `${workoutsList.reduce((sum, w) => sum + (parseFloat(String(w.volume).replace(/[^0-9.]/g, '')) || 0), 0).toLocaleString()} kg`;
  const totalPRCount = Object.keys(personalRecords).length;

  // Exercise Categories
  const exerciseCategories = [
    { id: 'all', label: 'All Exercises', count: exercisesList.length },
    { id: 'chest', label: 'Chest', count: exercisesList.filter(e => e.group?.toLowerCase() === 'chest').length },
    { id: 'back', label: 'Back', count: exercisesList.filter(e => e.group?.toLowerCase() === 'back').length },
    { id: 'legs', label: 'Legs', count: exercisesList.filter(e => e.group?.toLowerCase() === 'legs').length },
    { id: 'shoulders', label: 'Shoulders', count: exercisesList.filter(e => e.group?.toLowerCase() === 'shoulders').length },
    { id: 'arms', label: 'Arms', count: exercisesList.filter(e => e.group?.toLowerCase() === 'arms').length },
    { id: 'core', label: 'Core', count: exercisesList.filter(e => e.group?.toLowerCase() === 'core').length },
  ];

  const activeExerciseObj = exercisesList.find(e => e.name === selectedExercise) || exercisesList[0] || defaultExercises[0];

  const todayTitle = (weeklyPlan[currentWeekday]?.title || 'Rest Day').toLowerCase();
  const todayExercises = weeklyPlan[currentWeekday]?.exercises?.map(e => {
    const fullEx = exercisesList.find(x => x.name === e.name);
    return fullEx ? { name: e.name, primary: fullEx.primary, secondary: fullEx.secondary } : e.name;
  }) || [];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1700px] mx-auto">
      {/* PR Toast Alert */}
      <AnimatePresence>
        {prNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-purple to-purple-accent text-white shadow-glow-primary flex items-center gap-3 border border-purple-light/40"
          >
            <span className="text-2xl">🏆</span>
            <div>
              <p className="font-extrabold text-sm tracking-wide">{prNotification}</p>
              <p className="text-[10px] opacity-90">Saved to your Personal Records!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DENSE PRODUCTION PAGE HEADER (32px Title) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple/20 to-purple-accent/10 border border-purple/30 text-purple flex items-center justify-center shadow-glow-primary">
            <FiActivity size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight font-sans">Gym & Fitness</h1>
            <p className="text-sm text-text-muted">High-performance athletic tracking, muscle heatmap & workout OS.</p>
          </div>
        </div>

        {/* 4 TOP METRICS CARDS BAR (ENLARGED HIIRARCHY & HOVER ANIMATION) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <motion.div whileHover={{ y: -2 }} className="p-3.5 rounded-2xl bg-surface border border-border-subtle hover:border-purple/40 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center text-lg font-bold">🔥</div>
            <div>
              <h4 className="text-2xl font-black font-mono text-text-primary leading-none">{workoutsCountMonth}</h4>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Workouts / Mo</p>
              <span className="text-[9px] text-success font-bold font-mono">↑ 18% vs last mo</span>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="p-3.5 rounded-2xl bg-surface border border-border-subtle hover:border-purple/40 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center text-lg font-bold">🏆</div>
            <div>
              <h4 className="text-2xl font-black font-mono text-purple leading-none">{totalVolumeLiftedStr}</h4>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Volume Lifted</p>
              <span className="text-[9px] text-success font-bold font-mono">↑ 24% vs last mo</span>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="p-3.5 rounded-2xl bg-surface border border-border-subtle hover:border-info/40 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center text-lg font-bold">⭐</div>
            <div>
              <h4 className="text-2xl font-black font-mono text-info leading-none">{totalPRCount}</h4>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Personal Records</p>
              <span className="text-[9px] text-info font-bold font-mono">3 Active PRs</span>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="p-3.5 rounded-2xl bg-surface border border-border-subtle hover:border-success/40 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center text-lg font-bold">⚡</div>
            <div>
              <h4 className="text-2xl font-black font-mono text-success leading-none">{streak} Days</h4>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Active Streak</p>
              <span className="text-[9px] text-text-muted font-mono">Best: 32 Days</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* GLOWING NAVIGATION TABS BAR (SMOOTH UNDERLINE) */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-1 overflow-x-auto sidebar-scroll">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'workouts', label: 'Workouts' },
          { id: 'progress', label: 'Progress' },
          { id: 'exercises', label: 'Exercises' },
          { id: 'body-stats', label: 'Body Stats' },
          { id: 'settings', label: 'Settings' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-purple/20 text-white border border-purple/40 shadow-glow-primary'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Top Row Cards (Unified Heights, Balanced Densified Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* CARD 1: TODAY'S SCHEDULED WORKOUT (PROMINENT FULL-HEIGHT SVG & COLOR CHIPS) */}
            <div className="lg:col-span-5 card p-5 space-y-4 bg-gradient-to-br from-surface to-surface-elevated relative overflow-visible flex flex-col justify-between border border-purple/30">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <span className="text-xs font-bold text-text-primary tracking-wide">Today's Scheduled Workout</span>
                <span className="badge-success text-[10px] px-2.5 py-0.5 font-bold">Push Day • Active Split</span>
              </div>

              {/* Title & Workout Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center font-bold text-lg">
                    🏋️
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-text-primary">
                      {weeklyPlan[currentWeekday]?.title || 'Rest Day'}
                    </h3>
                    <p className="text-xs font-semibold text-purple">
                      {weeklyPlan[currentWeekday]?.focus || 'Rest & Recovery'}
                    </p>
                  </div>
                </div>

                {/* Sleek Colored Metric Chips */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  <div className="p-2 rounded-xl bg-purple/10 border border-purple/20 text-center">
                    <p className="text-[9px] text-text-muted uppercase">Duration</p>
                    <p className="text-xs font-bold font-mono text-purple">60 min</p>
                  </div>
                  <div className="p-2 rounded-xl bg-info/10 border border-info/20 text-center">
                    <p className="text-[9px] text-text-muted uppercase">Exercises</p>
                    <p className="text-xs font-bold font-mono text-info">{weeklyPlan[currentWeekday]?.exercises?.length || 0}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-warning/10 border border-warning/20 text-center">
                    <p className="text-[9px] text-text-muted uppercase">Calories</p>
                    <p className="text-xs font-bold font-mono text-warning">550 kcal</p>
                  </div>
                  <div className="p-2 rounded-xl bg-success/10 border border-success/20 text-center">
                    <p className="text-[9px] text-text-muted uppercase">Target Vol</p>
                    <p className="text-xs font-bold font-mono text-success">7.5k kg</p>
                  </div>
                </div>
              </div>

              {/* ENLARGED PROMINENT ANATOMICAL SVG (320px Height, Zero Cropping) */}
              <div className="w-full h-[320px] flex items-center justify-center bg-surface-elevated/30 rounded-2xl border border-border-subtle/50 p-2 my-1 overflow-visible">
                <MuscleDiagram activeExercises={todayExercises} className="w-full h-full" />
              </div>

              {/* View Weekly Plan Action */}
              <div className="pt-1">
                <button onClick={() => setActiveTab('workouts')} className="btn-primary text-xs w-full py-3 bg-gradient-to-r from-purple to-purple-accent text-white font-bold flex items-center justify-center gap-1.5 shadow-glow-primary rounded-xl">
                  View Weekly Plan & Schedule <FiChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* CARD 2: REDESIGNED COMPACT WEEKLY ACTIVITY CARD */}
            <div className="lg:col-span-4 card p-5 space-y-4 flex flex-col justify-between bg-gradient-to-br from-surface to-surface-elevated border border-border-subtle">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div>
                  <h3 className="section-title text-base font-bold">Weekly Activity</h3>
                  <p className="text-[10px] text-text-muted">83% Weekly Plan Completion</p>
                </div>
                <span onClick={() => setActiveTab('workouts')} className="section-link text-xs">View Calendar</span>
              </div>

              {/* Weekday Row */}
              <div className="flex justify-between items-center px-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                  <div key={day} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-text-muted font-mono uppercase">{day}</span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                      i <= 4 ? 'bg-success text-white shadow-glow-success' : i === 5 ? 'bg-purple text-white shadow-glow-primary' : 'bg-surface-elevated text-text-muted border border-border-subtle'
                    }`}>
                      {i <= 5 ? '✓' : '•'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mini Completion Progress Bar */}
              <div className="space-y-1.5 bg-surface-elevated/40 p-3 rounded-xl border border-border-subtle">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted font-medium">Weekly Target Progress</span>
                  <span className="font-mono font-bold text-success">5 of 6 Sessions (83%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-background overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-success to-purple w-[83%]" />
                </div>
              </div>

              {/* Stats Summary Bar */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-subtle text-center">
                <div className="p-2.5 rounded-xl bg-surface-elevated/40">
                  <p className="text-[9px] text-text-muted">Workouts</p>
                  <p className="text-sm font-extrabold font-mono text-text-primary">5 / 6</p>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-elevated/40">
                  <p className="text-[9px] text-text-muted">Total Time</p>
                  <p className="text-sm font-extrabold font-mono text-purple">6.4 hrs</p>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-elevated/40">
                  <p className="text-[9px] text-text-muted">Calories</p>
                  <p className="text-sm font-extrabold font-mono text-warning">2.85k kcal</p>
                </div>
              </div>
            </div>

            {/* CARD 3: REDESIGNED ENLARGED CURRENT STREAK CARD */}
            <div className="lg:col-span-3 card p-5 flex flex-col items-center justify-between text-center space-y-3 bg-gradient-to-br from-surface to-surface-elevated border border-border-subtle">
              <div className="w-full border-b border-border-subtle pb-3">
                <h3 className="section-title text-base font-bold">Current Streak</h3>
                <p className="text-[10px] text-text-muted">Consistency & Streak Metrics</p>
              </div>

              {/* ENLARGED CIRCULAR PROGRESS RING (+35% Diameter) */}
              <div className="relative w-40 h-40 my-1 flex items-center justify-center">
                <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="48" stroke="#161A2E" strokeWidth="12" fill="none" />
                  <circle cx="60" cy="60" r="48" stroke="#22C55E" strokeWidth="12" strokeDasharray="260 300" strokeLinecap="round" fill="none" className="filter drop-shadow-[0_0_10px_rgba(34,197,94,0.85)]" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black font-mono text-text-primary">{streak}</span>
                  <span className="text-[10px] font-extrabold text-success uppercase tracking-wider mt-0.5">Days Streak</span>
                </div>
              </div>

              {/* Best Streak Directly Below Ring */}
              <div className="w-full p-2.5 rounded-xl bg-surface-elevated/50 border border-border-subtle text-xs text-text-muted flex justify-between items-center">
                <span>Best Streak Record</span>
                <strong className="text-text-primary font-mono text-sm font-bold">32 Days</strong>
              </div>

              {/* Statistics Chips */}
              <div className="grid grid-cols-2 gap-2 w-full text-[10px]">
                <div className="p-2 rounded-xl bg-surface-elevated/40 text-center">
                  <span className="text-text-muted">Longest Month</span>
                  <p className="font-bold text-text-primary font-mono text-xs">30 Days</p>
                </div>
                <div className="p-2 rounded-xl bg-surface-elevated/40 text-center">
                  <span className="text-text-muted">Consistency Rate</span>
                  <p className="font-bold text-success font-mono text-xs">93%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row (Workout History & PRs with Production-Level Empty/Active States) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* WORKOUT HISTORY CARD */}
            <div className="lg:col-span-4 card p-5 space-y-4 border border-border-subtle">
              <div className="section-header">
                <h3 className="section-title text-base font-bold">Workout History</h3>
                <span onClick={() => setActiveTab('workouts')} className="section-link text-xs">View All</span>
              </div>

              {workoutsList.length > 0 ? (
                <div className="space-y-2.5">
                  {workoutsList.slice(0, 5).map((w, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/40 text-xs border border-border-subtle/50 hover:border-purple/30 transition-all">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple/10 text-purple flex items-center justify-center font-bold">
                          🏋️
                        </div>
                        <div>
                          <p className="font-bold text-text-primary leading-tight">{w.title}</p>
                          <p className="text-[9px] text-text-muted">{w.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-text-muted">{w.duration}</span>
                        <span className="font-bold text-text-primary">{w.volume}</span>
                        <FiCheckCircle className="text-success" size={14} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* PRODUCTION ONBOARDING EMPTY STATE */
                <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-border-subtle bg-surface-elevated/20 text-xs text-text-muted space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple/10 text-purple flex items-center justify-center mx-auto text-xl font-bold">
                    🏋️
                  </div>
                  <div>
                    <p className="font-bold text-text-primary text-sm">No Workouts Recorded Yet</p>
                    <p className="text-xs text-text-muted mt-1">Complete your first training session to start building your workout history.</p>
                  </div>
                  <button onClick={() => setActiveTab('workouts')} className="btn-primary text-xs px-4 py-2 bg-purple text-white font-bold rounded-xl shadow-glow-primary">
                    + Log First Workout
                  </button>
                </div>
              )}
            </div>

            {/* PROGRESS VOLUME CHART */}
            <div className="lg:col-span-5 card p-5 space-y-4 border border-border-subtle">
              <div className="section-header">
                <h3 className="section-title text-base font-bold">Progress Volume Trend</h3>
                <span className="text-xs text-text-muted">Volume (kg) ▾</span>
              </div>
              <div className="h-44 flex items-end justify-between gap-2 px-1 pt-4 pb-2 border-b border-border-subtle relative">
                {[40, 75, 50, 65, 55, 85, 45, 60, 90, 70, 80].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div className={`w-full rounded-t-md transition-all ${i === 5 ? 'bg-gradient-to-t from-purple to-purple-accent shadow-glow-primary' : 'bg-primary/40'}`} style={{ height: `${workoutsList.length > 0 ? h : 15}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-text-muted font-mono">
                <span>9 May</span><span>15 May</span><span>23 May</span><span>30 May</span><span>6 Jun</span><span>13 Jun</span>
              </div>
            </div>

            {/* PERSONAL RECORDS CARD */}
            <div className="lg:col-span-3 card p-5 space-y-4 border border-border-subtle">
              <div className="section-header">
                <h3 className="section-title text-base font-bold">Personal Records</h3>
                <span onClick={() => setActiveTab('progress')} className="section-link text-xs">View All</span>
              </div>

              {Object.keys(personalRecords).length > 0 ? (
                <div className="space-y-2.5 text-xs">
                  {Object.entries(personalRecords).map(([exName, record]) => (
                    <div key={exName} className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/40 border border-border-subtle/50 hover:border-purple/30 transition-all">
                      <span className="font-bold text-text-primary flex items-center gap-1.5 text-xs">
                        <span>🏆</span> {exName}
                      </span>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-purple">{record.weight} {record.unit || 'kg'}</span>
                        <span className="text-[9px] text-text-muted">{record.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* PRODUCTION ONBOARDING EMPTY STATE */
                <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-border-subtle bg-surface-elevated/20 text-xs text-text-muted space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-info/10 text-info flex items-center justify-center mx-auto text-xl font-bold">
                    🏆
                  </div>
                  <div>
                    <p className="font-bold text-text-primary text-sm">No Personal Records Yet</p>
                    <p className="text-xs text-text-muted mt-1">Set personal bests during workouts to automatically log your records here.</p>
                  </div>
                  <button onClick={() => setActiveTab('exercises')} className="btn-outline text-xs px-4 py-2 border-purple text-purple font-bold rounded-xl">
                    View Exercises
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB TAB 2: WORKOUTS */}
      {activeTab === 'workouts' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Workouts & Weekly Schedule</h2>
              <p className="text-xs text-text-muted">Manage your saved exercises and assign them to your weekly routine.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowWeeklyPlanModal(true)} className="btn-outline text-xs px-4 py-2.5 border-purple text-purple hover:bg-purple/10 flex items-center gap-1.5 font-bold rounded-xl">
                <FiList size={16} /> Edit Weekly Plan
              </button>
              <button onClick={() => openCreateExerciseModal()} className="btn-primary text-xs px-4 py-2.5 bg-gradient-to-r from-purple to-purple-accent text-white font-bold flex items-center gap-1.5 shadow-glow-primary rounded-xl">
                <FiPlus size={16} /> Create New Exercise
              </button>
            </div>
          </div>

          <div className="card p-4 space-y-4 bg-gradient-to-br from-surface to-surface-elevated border border-border-subtle">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-xs font-bold text-text-primary flex items-center gap-2">
                <FiCalendar className="text-purple" /> Weekly Plan Split
              </h3>
              <span className="text-[10px] text-text-muted">Select day to view or edit exercises</span>
            </div>

            <div className="grid grid-cols-7 gap-2.5">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedPlanDay(day)}
                  className={`relative p-3 rounded-2xl text-center transition-all border ${
                    selectedPlanDay === day 
                      ? 'bg-gradient-to-r from-purple to-purple-accent text-white border-purple font-bold shadow-glow-primary' 
                      : day === currentWeekday 
                        ? 'bg-surface-elevated border-success/60 text-text-primary'
                        : 'bg-surface-elevated/40 border-border-subtle text-text-muted hover:text-text-primary'
                  }`}
                >
                  {day === currentWeekday && <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-surface animate-pulse" title="Today" />}
                  <p className="text-[9px] uppercase tracking-wider">{day.slice(0, 3)}</p>
                  <p className="text-xs font-extrabold truncate mt-0.5">{weeklyPlan[day]?.title || 'Rest Day'}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6 space-y-4 border border-purple/30 bg-surface-elevated/20">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple">{selectedPlanDay}'s Routine</span>
                <div className="flex items-center gap-2">
                  {editingDayTitle ? (
                    <input 
                      type="text" 
                      value={editedTitle} 
                      onChange={(e) => setEditedTitle(e.target.value)} 
                      onBlur={() => {
                        setWeeklyPlan(prev => ({...prev, [selectedPlanDay]: {...prev[selectedPlanDay], title: editedTitle}}));
                        setEditingDayTitle(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setWeeklyPlan(prev => ({...prev, [selectedPlanDay]: {...prev[selectedPlanDay], title: editedTitle}}));
                          setEditingDayTitle(false);
                        }
                      }}
                      autoFocus
                      className="bg-background border border-purple text-text-primary text-lg font-extrabold rounded px-2 py-1 outline-none w-48" 
                    />
                  ) : (
                    <>
                      <h3 className="text-lg font-extrabold text-text-primary">{weeklyPlan[selectedPlanDay]?.title || 'Rest Day'}</h3>
                      <button onClick={() => { setEditedTitle(weeklyPlan[selectedPlanDay]?.title || ''); setEditingDayTitle(true); }} className="text-text-muted hover:text-purple transition-colors">
                        <FiEdit3 size={14} />
                      </button>
                    </>
                  )}
                </div>
                <p className="text-xs text-text-muted">{weeklyPlan[selectedPlanDay]?.focus}</p>
              </div>

              <button onClick={() => setShowWeeklyPlanModal(true)} className="btn-outline text-xs px-3.5 py-2 border-purple/50 text-purple flex items-center gap-1.5 font-bold rounded-xl">
                <FiPlus size={14} /> Add Saved Exercise
              </button>
            </div>

            {weeklyPlan[selectedPlanDay]?.exercises?.length > 0 ? (
              <div className="space-y-2.5">
                {weeklyPlan[selectedPlanDay].exercises.map((ex) => (
                  <div key={ex.id} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    ex.completed ? 'bg-success/10 border-success/30' : 'bg-surface-elevated border-border-subtle hover:border-purple/40'
                  }`}>
                    <div className="flex items-center gap-3.5">
                      <button
                        onClick={() => handleToggleExerciseCheckbox(selectedPlanDay, ex.id)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                          ex.completed ? 'bg-success text-white shadow-glow-success' : 'border-2 border-border-subtle bg-surface hover:border-purple'
                        }`}
                      >
                        {ex.completed && <FiCheck size={16} className="stroke-[3]" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${ex.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                          {ex.name}
                        </p>
                        <div className="text-xs text-text-muted font-mono flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span>{ex.sets} Sets × {ex.reps} Reps</span>
                          <span className="text-border-subtle">•</span>
                          <span>Target: <strong className="text-purple">{ex.targetWeight} kg</strong></span>
                          <span className="text-border-subtle hidden sm:inline">•</span>
                          <div className="flex items-center gap-1.5 bg-background border border-border-subtle rounded px-1.5 py-0.5">
                            <span className="text-[9px] uppercase tracking-wider font-bold">Lifted:</span>
                            <input 
                              type="number" 
                              className="bg-transparent text-text-primary w-10 text-center outline-none font-bold placeholder-text-muted disabled:opacity-50"
                              placeholder={ex.targetWeight}
                              value={ex.loggedWeight || ''}
                              disabled={ex.completed}
                              onChange={(e) => {
                                const val = e.target.value;
                                setWeeklyPlan(prev => ({
                                  ...prev,
                                  [selectedPlanDay]: {
                                    ...prev[selectedPlanDay],
                                    exercises: prev[selectedPlanDay].exercises.map(e => e.id === ex.id ? { ...e, loggedWeight: val } : e)
                                  }
                                }));
                              }}
                            />
                            <span className="text-[9px]">kg</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      <div className="text-right">
                        <p className="text-[9px] text-text-muted">Best PR</p>
                        <p className="font-bold text-purple">{personalRecords[ex.name]?.weight || ex.targetWeight} kg</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-text-muted space-y-2">
                <p className="font-bold text-text-primary text-sm">No Exercises Assigned Yet</p>
                <p>Click 'Add Saved Exercise' to assign exercises from your saved exercise library to {selectedPlanDay}.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}


      {/* SUB TAB 4: EXERCISES */}
      {activeTab === 'exercises' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Exercise Library Management (CRUD)</h2>
              <p className="text-xs text-text-muted">Create, edit, and manage your personal exercise library with custom video links and images.</p>
            </div>
            <button onClick={() => openCreateExerciseModal()} className="btn-primary text-xs px-4 py-2.5 bg-gradient-to-r from-purple to-purple-accent text-white font-bold flex items-center gap-1.5 shadow-glow-primary rounded-xl">
              <FiPlus size={16} /> + Create New Exercise
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-3 text-text-muted" size={16} />
              <input
                type="text"
                placeholder="Search exercise library..."
                value={searchExercise}
                onChange={e => setSearchExercise(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-purple"
              />
            </div>
            <select
              value={selectedMuscleCategory}
              onChange={e => setSelectedMuscleCategory(e.target.value)}
              className="px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border-subtle text-xs text-text-primary"
            >
              <option value="all">All Muscle Groups</option>
              <option value="chest">Chest</option>
              <option value="back">Back</option>
              <option value="legs">Legs</option>
              <option value="shoulders">Shoulders</option>
              <option value="arms">Arms</option>
              <option value="core">Core</option>
            </select>
          </div>

          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-3 card p-3 space-y-1.5">
              {exerciseCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedMuscleCategory(cat.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                    selectedMuscleCategory === cat.id ? 'bg-gradient-to-r from-purple to-purple-accent text-white shadow-glow-primary' : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="font-mono text-xs">{cat.count}</span>
                </button>
              ))}
            </div>

            <div className="col-span-5 card p-5 space-y-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border-subtle text-[10px] text-text-muted uppercase tracking-wider">
                    <th className="pb-3">EXERCISE</th>
                    <th className="pb-3">GROUP</th>
                    <th className="pb-3">DIFFICULTY</th>
                    <th className="pb-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50">
                  {exercisesList
                    .filter(ex => selectedMuscleCategory === 'all' || ex.group.toLowerCase() === selectedMuscleCategory)
                    .filter(ex => ex.name.toLowerCase().includes(searchExercise.toLowerCase()))
                    .map(ex => (
                      <tr
                        key={ex.id || ex.name}
                        onClick={() => setSelectedExercise(ex.name)}
                        className={`cursor-pointer hover:bg-surface-elevated/40 transition-colors ${
                          selectedExercise === ex.name ? 'bg-purple/10 border-l-4 border-purple font-bold' : ''
                        }`}
                      >
                        <td className="py-3 pr-2 flex items-center gap-2">
                          <span className="text-base">🏋️</span>
                          <span className="text-text-primary font-bold">{ex.name}</span>
                        </td>
                        <td className="py-3 px-2 text-text-muted">{ex.group}</td>
                        <td className="py-3 px-2">
                          <span className="badge-warning text-[9px] px-2 py-0.5">{ex.difficulty}</span>
                        </td>
                        <td className="py-3 pl-2 text-right">
                          <button onClick={(e) => { e.stopPropagation(); openEditExerciseModal(ex); }} className="text-purple hover:underline p-1 text-xs font-bold">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="col-span-4 card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <h3 className="text-base font-bold text-text-primary">{activeExerciseObj.name}</h3>
                <button onClick={() => openEditExerciseModal(activeExerciseObj)} className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1 font-bold rounded-xl">
                  <FiEdit3 /> Edit Exercise
                </button>
              </div>

              <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-slate-900 border border-border-subtle flex items-center justify-center group">
                {activeExerciseObj.image_url ? (
                  <img src={activeExerciseObj.image_url} alt={activeExerciseObj.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-text-muted space-y-1">
                    <FiImage size={36} className="mx-auto text-purple/60" />
                    <p className="text-xs">No Exercise Image URL</p>
                  </div>
                )}

                {activeExerciseObj.video_url && (
                  <a
                    href={activeExerciseObj.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-purple/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow-primary hover:bg-purple"
                  >
                    <FiVideo size={14} /> Watch Video <FiExternalLink size={12} />
                  </a>
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <p className="text-text-muted">Primary Target: <strong className="text-purple font-bold">{activeExerciseObj.primary}</strong></p>
                <p className="text-text-muted">Equipment: <strong className="text-text-primary font-bold">{activeExerciseObj.equipment}</strong></p>
                <p className="text-text-muted">Difficulty: <strong className="text-text-primary font-bold">{activeExerciseObj.difficulty}</strong></p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB TAB 3: PROGRESS */}
      {activeTab === 'progress' && (
        <GymProgressTab workoutsList={workoutsList} />
      )}

      {/* SUB TAB 6: BODY STATS */}
      {activeTab === 'body-stats' && (
        <GymBodyStatsTab />
      )}



      {/* SUB TAB 7: SETTINGS */}
      {activeTab === 'settings' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Settings</h2>
              <p className="text-xs text-text-muted">Manage your preferences and profile.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-6">
              
              {/* Profile Card */}
              <div className="card p-6 border border-border-subtle bg-surface">
                <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2"><FiUser className="text-purple"/> User Profile</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted">Height</label>
                    <input 
                      type="text"
                      className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:border-purple outline-none"
                      value={userProfile.height}
                      onChange={(e) => setUserProfile({...userProfile, height: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted">Target Weight</label>
                    <input 
                      type="text"
                      className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:border-purple outline-none"
                      value={userProfile.targetWeight}
                      onChange={(e) => setUserProfile({...userProfile, targetWeight: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted">Fitness Goal</label>
                    <select 
                      className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:border-purple outline-none"
                      value={userProfile.primaryGoal}
                      onChange={(e) => setUserProfile({...userProfile, primaryGoal: e.target.value})}
                    >
                      <option>Build Muscle</option>
                      <option>Lose Weight</option>
                      <option>Maintain Weight</option>
                      <option>Endurance</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Preferences Card */}
              <div className="card p-6 border border-border-subtle bg-surface">
                <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2"><FiSliders className="text-purple"/> Preferences</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted">Units System</label>
                    <select 
                      className="w-full bg-surface-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:border-purple outline-none"
                      value={userProfile.preferredUnits}
                      onChange={(e) => setUserProfile({...userProfile, preferredUnits: e.target.value})}
                    >
                      <option>Metric (kg, cm)</option>
                      <option>Imperial (lbs, in)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => localStorage.removeItem(profileStorageKey)}
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-danger/10 text-danger border border-danger/30 hover:bg-danger hover:text-white transition-colors"
                >
                  Reset Profile
                </button>
              </div>
            </div>
            
            <div className="md:col-span-4 space-y-6">
              <div className="card p-6 border border-border-subtle bg-surface">
                <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2"><FiTrash2 className="text-danger"/> Data Management</h3>
                <p className="text-xs text-text-muted mb-4">You can clear all your gym data if you want to start fresh.</p>
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete all Gym data? This cannot be undone.")) {
                      localStorage.removeItem(workoutStorageKey);
                      localStorage.removeItem('lifeos_user_body_stats');
                      localStorage.removeItem(prStorageKey);
                      window.location.reload();
                    }
                  }}
                  className="w-full px-4 py-2 bg-danger/10 text-danger border border-danger/30 rounded-lg text-xs font-bold hover:bg-danger hover:text-white transition-colors text-center block"
                >
                  Clear All Gym Data
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* MODAL: CREATE / EDIT EXERCISE MODAL */}
      <AnimatePresence>
        {showExerciseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card p-6 max-w-lg w-full space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <h3 className="text-base font-extrabold text-text-primary">
                  {editingExerciseId ? 'Edit Exercise' : 'Create New Exercise'}
                </h3>
                <button onClick={() => setShowExerciseModal(false)} className="text-text-muted hover:text-text-primary"><FiX size={18} /></button>
              </div>

              <form onSubmit={handleSaveExercise} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-text-muted mb-1 font-bold">Exercise Name *</label>
                  <input
                    type="text"
                    required
                    value={exerciseForm.name}
                    onChange={e => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                    placeholder="e.g. Incline Dumbbell Bench Press"
                    className="w-full p-3 rounded-2xl bg-surface-elevated text-text-primary border border-border-subtle focus:border-purple focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-text-muted mb-1 font-bold">Muscle Group</label>
                    <select
                      value={exerciseForm.group}
                      onChange={e => setExerciseForm({ ...exerciseForm, group: e.target.value })}
                      className="w-full p-2.5 rounded-2xl bg-surface-elevated text-text-primary border border-border-subtle"
                    >
                      <option value="Chest">Chest</option>
                      <option value="Back">Back</option>
                      <option value="Legs">Legs</option>
                      <option value="Shoulders">Shoulders</option>
                      <option value="Arms">Arms</option>
                      <option value="Core">Core</option>
                      <option value="Cardio">Cardio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-text-muted mb-1 font-bold">Equipment</label>
                    <select
                      value={exerciseForm.equipment}
                      onChange={e => setExerciseForm({ ...exerciseForm, equipment: e.target.value })}
                      className="w-full p-2.5 rounded-2xl bg-surface-elevated text-text-primary border border-border-subtle"
                    >
                      <option value="Barbell">Barbell</option>
                      <option value="Dumbbell">Dumbbell</option>
                      <option value="Bodyweight">Bodyweight</option>
                      <option value="Cable Machine">Cable Machine</option>
                      <option value="Machine">Machine</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-text-muted mb-1 font-bold">Difficulty</label>
                    <select
                      value={exerciseForm.difficulty}
                      onChange={e => setExerciseForm({ ...exerciseForm, difficulty: e.target.value })}
                      className="w-full p-2.5 rounded-2xl bg-surface-elevated text-text-primary border border-border-subtle"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-text-muted mb-1 font-bold">Primary Target (Heatmap)</label>
                    <select
                      value={exerciseForm.primary}
                      onChange={e => setExerciseForm({ ...exerciseForm, primary: e.target.value })}
                      className="w-full p-2.5 rounded-2xl bg-surface-elevated text-text-primary border border-border-subtle"
                    >
                      <option value="chest">Chest</option>
                      <option value="deltoids_front">Front Deltoids</option>
                      <option value="deltoids_side">Side Deltoids</option>
                      <option value="deltoids_rear">Rear Deltoids</option>
                      <option value="biceps">Biceps</option>
                      <option value="triceps">Triceps</option>
                      <option value="forearms">Forearms</option>
                      <option value="core">Core / Abs</option>
                      <option value="obliques">Obliques</option>
                      <option value="quads">Quads</option>
                      <option value="calves">Calves</option>
                      <option value="traps">Traps</option>
                      <option value="lats">Lats</option>
                      <option value="lower_back">Lower Back</option>
                      <option value="glutes">Glutes</option>
                      <option value="hamstrings">Hamstrings</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-text-muted mb-1 font-bold">Secondary Target (Optional)</label>
                    <select
                      value={exerciseForm.secondary}
                      onChange={e => setExerciseForm({ ...exerciseForm, secondary: e.target.value })}
                      className="w-full p-2.5 rounded-2xl bg-surface-elevated text-text-primary border border-border-subtle"
                    >
                      <option value="">None</option>
                      <option value="chest">Chest</option>
                      <option value="deltoids_front">Front Deltoids</option>
                      <option value="deltoids_side">Side Deltoids</option>
                      <option value="deltoids_rear">Rear Deltoids</option>
                      <option value="biceps">Biceps</option>
                      <option value="triceps">Triceps</option>
                      <option value="forearms">Forearms</option>
                      <option value="core">Core / Abs</option>
                      <option value="obliques">Obliques</option>
                      <option value="quads">Quads</option>
                      <option value="calves">Calves</option>
                      <option value="traps">Traps</option>
                      <option value="lats">Lats</option>
                      <option value="lower_back">Lower Back</option>
                      <option value="glutes">Glutes</option>
                      <option value="hamstrings">Hamstrings</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-text-muted mb-1 flex items-center gap-1 font-bold">
                      <FiImage size={12} /> Image URL / Link
                    </label>
                    <input
                      type="url"
                      value={exerciseForm.image_url}
                      onChange={e => setExerciseForm({ ...exerciseForm, image_url: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2.5 rounded-2xl bg-surface-elevated text-text-primary border border-border-subtle"
                    />
                  </div>

                  <div>
                    <label className="block text-text-muted mb-1 flex items-center gap-1 font-bold">
                      <FiVideo size={12} /> Video URL / Link
                    </label>
                    <input
                      type="url"
                      value={exerciseForm.video_url}
                      onChange={e => setExerciseForm({ ...exerciseForm, video_url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full p-2.5 rounded-2xl bg-surface-elevated text-text-primary border border-border-subtle"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple to-purple-accent hover:bg-purple/80 text-white font-extrabold transition-all shadow-glow-primary">
                  {editingExerciseId ? 'Save Changes' : 'Create Exercise'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: WEEKLY PLAN BUILDER MODAL */}
      <AnimatePresence>
        {showWeeklyPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card p-6 max-w-lg w-full space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <h3 className="text-base font-extrabold text-text-primary">Add Exercise to {selectedPlanDay}'s Plan</h3>
                <button onClick={() => setShowWeeklyPlanModal(false)} className="text-text-muted hover:text-text-primary"><FiX size={18} /></button>
              </div>

              <form onSubmit={handleAddExerciseToPlan} className="space-y-3.5 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-text-muted font-bold">Select Saved Exercise *</label>
                    <button
                      type="button"
                      onClick={() => { setShowWeeklyPlanModal(false); openCreateExerciseModal(); }}
                      className="text-[10px] font-extrabold text-purple hover:underline flex items-center gap-1"
                    >
                      <FiPlus size={12} /> Create New Exercise First
                    </button>
                  </div>
                  <select
                    value={newPlanExercise.name}
                    onChange={e => setNewPlanExercise({ ...newPlanExercise, name: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-surface-elevated text-text-primary border border-border-subtle"
                  >
                    {exercisesList.map(e => (
                      <option key={e.id || e.name} value={e.name}>
                        {e.name} ({e.group})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-text-muted mb-1 font-bold">Target Sets</label>
                    <input
                      type="number"
                      required
                      value={newPlanExercise.sets}
                      onChange={e => setNewPlanExercise({ ...newPlanExercise, sets: e.target.value })}
                      className="w-full p-2.5 rounded-2xl bg-surface-elevated text-text-primary border border-border-subtle"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1 font-bold">Target Reps</label>
                    <input
                      type="number"
                      required
                      value={newPlanExercise.reps}
                      onChange={e => setNewPlanExercise({ ...newPlanExercise, reps: e.target.value })}
                      className="w-full p-2.5 rounded-2xl bg-surface-elevated text-text-primary border border-border-subtle"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1 font-bold">Target Weight (kg)</label>
                    <input
                      type="text"
                      required
                      value={newPlanExercise.targetWeight}
                      onChange={e => setNewPlanExercise({ ...newPlanExercise, targetWeight: e.target.value })}
                      className="w-full p-2.5 rounded-2xl bg-surface-elevated text-text-primary border border-border-subtle"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple to-purple-accent text-white font-extrabold shadow-glow-primary">
                  + Add Saved Exercise to {selectedPlanDay}'s Plan
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
