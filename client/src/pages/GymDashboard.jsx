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
    },
    {
      id: 'ex_6',
      name: 'Dumbbell Bicep Curl',
      group: 'Arms',
      equipment: 'Dumbbell',
      difficulty: 'Beginner',
      primary: 'Biceps',
      secondary: 'Forearms',
      image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=60',
      video_url: '',
      instructions: 'Stand holding dumbbells, curl up towards shoulders with palms up.',
      tips: 'Keep upper arms stationary.'
    },
    {
      id: 'ex_7',
      name: 'Cable Tricep Pushdown',
      group: 'Arms',
      equipment: 'Cable Machine',
      difficulty: 'Beginner',
      primary: 'Triceps',
      secondary: 'Forearms',
      image_url: '',
      video_url: '',
      instructions: 'Push rope down until arms lock out, control return.',
      tips: 'Keep elbows pinned to torso.'
    },
    {
      id: 'ex_8',
      name: 'Plank',
      group: 'Core',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      primary: 'Core',
      secondary: 'Shoulders',
      image_url: '',
      video_url: '',
      instructions: 'Hold forearm plank position with straight body alignment.',
      tips: 'Squeeze glutes and brace abs.'
    }
  ];

  // Exercises Library State (Custom User Saved Exercises)
  const [exercisesList, setExercisesList] = useState(() => {
    const saved = localStorage.getItem(exerciseLibraryStorageKey);
    return saved ? JSON.parse(saved) : defaultExercises;
  });

  // Default Weekly Plan Template
  const defaultWeeklyPlan = {
    Monday: { title: 'Push Day', focus: 'Chest • Shoulders • Triceps', exercises: [
      { id: 'ex_1', name: 'Barbell Bench Press', sets: 4, reps: 10, targetWeight: '80', completed: true },
      { id: 'ex_2', name: 'Dumbbell Shoulder Press', sets: 3, reps: 12, targetWeight: '24', completed: true },
      { id: 'ex_7', name: 'Cable Tricep Pushdown', sets: 3, reps: 15, targetWeight: '35', completed: false },
    ]},
    Tuesday: { title: 'Pull Day', focus: 'Back • Biceps • Rear Delts', exercises: [
      { id: 'ex_3', name: 'Pull Up', sets: 4, reps: 10, targetWeight: 'BW', completed: false },
      { id: 'ex_5', name: 'Deadlift', sets: 3, reps: 8, targetWeight: '120', completed: false },
      { id: 'ex_6', name: 'Dumbbell Bicep Curl', sets: 3, reps: 12, targetWeight: '16', completed: false },
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
    { id: 3, title: 'Leg Day', time: '16 May 2026', focus: 'Quads, Hamstrings, Calves', duration: '80 min', volume: '7,100 kg', calories: '720 kcal', notes: '—', status: 'Completed' },
    { id: 4, title: 'Push Day', time: '14 May 2026', focus: 'Chest, Shoulders, Triceps', duration: '65 min', volume: '6,000 kg', calories: '480 kcal', notes: 'Added reps', status: 'Completed' },
  ];

  // Default PRs
  const defaultPRs = {
    'Barbell Bench Press': { weight: 80, date: '14 May 2026' },
    'Barbell Back Squat': { weight: 100, date: '12 May 2026' },
    'Deadlift': { weight: 120, date: '10 May 2026' },
    'Overhead Press': { weight: 40, date: '8 May 2026' },
    'Pull Up': { weight: 15, date: '6 May 2026' }
  };

  // State Declarations
  const [weeklyPlan, setWeeklyPlan] = useState(() => {
    const saved = localStorage.getItem(planStorageKey);
    return saved ? JSON.parse(saved) : defaultWeeklyPlan;
  });

  const [personalRecords, setPersonalRecords] = useState(() => {
    const saved = localStorage.getItem(prStorageKey);
    return saved ? JSON.parse(saved) : defaultPRs;
  });

  const [workoutsList, setWorkoutsList] = useState(() => {
    if (isDemoAccount) return demoWorkouts;
    const saved = localStorage.getItem(workoutStorageKey);
    return saved ? JSON.parse(saved) : [];
  });

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

  // Active Selected Day for Weekly Plan Preview / Editing
  const [selectedPlanDay, setSelectedPlanDay] = useState('Monday');
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
    localStorage.setItem(prStorageKey, JSON.stringify(personalRecords));
  }, [personalRecords, prStorageKey]);

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
      // Update existing
      setExercisesList(prev => prev.map(ex => ex.id === editingExerciseId ? { ...ex, ...exerciseForm } : ex));
    } else {
      // Create new
      const newEx = {
        id: `ex_${Date.now()}`,
        ...exerciseForm
      };
      setExercisesList(prev => [newEx, ...prev]);
      setSelectedExercise(newEx.name);
      // Auto update default select in plan modal
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
  const handleToggleExerciseCheckbox = (day, exerciseId, currentWeight) => {
    const updatedPlan = { ...weeklyPlan };
    const dayExList = updatedPlan[day].exercises;
    const targetEx = dayExList.find(e => e.id === exerciseId);

    if (targetEx) {
      targetEx.completed = !targetEx.completed;
      setWeeklyPlan(updatedPlan);

      if (targetEx.completed) {
        const weightNum = parseFloat(currentWeight || targetEx.targetWeight) || 0;
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

  // Add Exercise to Weekly Plan (STRICTLY FROM SAVED EXERCISES)
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
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5 card p-4 space-y-3 bg-gradient-to-br from-surface to-surface-elevated relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary">Today's Scheduled Workout</span>
                <span className="badge-success text-[9px]">Active Split</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple/10 text-purple flex items-center justify-center">
                      <FiActivity size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text-primary">
                        {weeklyPlan['Monday']?.title || 'Push Day'}
                      </h3>
                      <p className="text-[10px] text-text-muted">
                        {weeklyPlan['Monday']?.focus || 'Chest • Shoulders • Triceps'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-3 text-center">
                    <div className="p-1.5 rounded-lg bg-background/50">
                      <p className="text-[8px] text-text-muted">Exercises</p>
                      <p className="text-xs font-bold font-mono text-text-primary">{weeklyPlan['Monday']?.exercises?.length || 3}</p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-background/50">
                      <p className="text-[8px] text-text-muted">Duration</p>
                      <p className="text-xs font-bold font-mono text-text-primary">60 min</p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-background/50">
                      <p className="text-[8px] text-text-muted">Volume</p>
                      <p className="text-xs font-bold font-mono text-text-primary">7,500 kg</p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-background/50">
                      <p className="text-[8px] text-text-muted">Calories</p>
                      <p className="text-xs font-bold font-mono text-text-primary">550 kcal</p>
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
                  View Weekly Plan
                </button>
              </div>
            </div>

            <div className="col-span-4 card p-4 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="section-title">Weekly Activity</h3>
                <span onClick={() => setActiveTab('workouts')} className="section-link">View Calendar</span>
              </div>
              <div className="flex justify-between items-center px-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <span className="text-[9px] text-text-muted font-mono">{day}</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${i <= 5 ? 'bg-success text-white' : 'bg-surface-elevated text-text-muted'}`}>
                      {i <= 5 ? '✓' : '•'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-3 card p-4 flex flex-col items-center justify-center text-center space-y-2">
              <h3 className="section-title text-xs">Current Streak</h3>
              <div className="relative w-28 h-28 my-1">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                  <circle cx="56" cy="56" r="44" stroke="#161A2E" strokeWidth="10" fill="none" />
                  <circle cx="56" cy="56" r="44" stroke="#22C55E" strokeWidth="10" strokeDasharray="240 276" fill="none" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold font-mono text-text-primary">{streak}</span>
                  <span className="text-[9px] text-text-muted">Days</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB TAB 2: WORKOUTS (WITH SAVED EXERCISES WEEKLY PLANNER) */}
      {activeTab === 'workouts' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Workouts & Weekly Schedule</h2>
              <p className="text-xs text-text-muted">Manage your saved exercises and assign them to your weekly routine.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowWeeklyPlanModal(true)} className="btn-outline text-xs px-3 py-2 border-purple text-purple hover:bg-purple/10 flex items-center gap-1.5 font-bold">
                <FiList size={16} /> Edit Weekly Plan
              </button>
              <button onClick={() => openCreateExerciseModal()} className="btn-primary text-xs px-4 py-2 bg-purple hover:bg-purple/80 flex items-center gap-1.5 shadow-glow-primary">
                <FiPlus size={16} /> Create New Exercise
              </button>
            </div>
          </div>

          {/* WEEKLY PLANNER SELECTOR BAR */}
          <div className="card p-3 space-y-3 bg-gradient-to-br from-surface to-surface-elevated">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <h3 className="text-xs font-bold text-text-primary flex items-center gap-2">
                <FiCalendar className="text-purple" /> Weekly Plan Split
              </h3>
              <span className="text-[10px] text-text-muted">Select day to view or edit exercises</span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedPlanDay(day)}
                  className={`p-2 rounded-xl text-center transition-all border ${
                    selectedPlanDay === day ? 'bg-purple text-white border-purple font-bold shadow-glow-primary' : 'bg-surface-elevated/40 border-border-subtle text-text-muted hover:text-text-primary'
                  }`}
                >
                  <p className="text-[9px] uppercase tracking-wider">{day.slice(0, 3)}</p>
                  <p className="text-xs font-extrabold truncate mt-0.5">{weeklyPlan[day]?.title || 'Rest Day'}</p>
                </button>
              ))}
            </div>
          </div>

          {/* TODAY'S CHECKBOX EXERCISE LOGGING CARD */}
          <div className="card p-5 space-y-4 border border-purple/30 bg-surface-elevated/20">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple">{selectedPlanDay}'s Routine</span>
                <h3 className="text-base font-bold text-text-primary">{weeklyPlan[selectedPlanDay]?.title}</h3>
                <p className="text-xs text-text-muted">{weeklyPlan[selectedPlanDay]?.focus}</p>
              </div>

              <button onClick={() => setShowWeeklyPlanModal(true)} className="btn-outline text-xs px-3 py-1.5 border-purple/50 text-purple flex items-center gap-1.5">
                <FiPlus size={14} /> Add Saved Exercise
              </button>
            </div>

            {weeklyPlan[selectedPlanDay]?.exercises?.length > 0 ? (
              <div className="space-y-2">
                {weeklyPlan[selectedPlanDay].exercises.map((ex) => (
                  <div key={ex.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    ex.completed ? 'bg-success/10 border-success/30' : 'bg-surface-elevated border-border-subtle hover:border-purple/40'
                  }`}>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleExerciseCheckbox(selectedPlanDay, ex.id, ex.targetWeight)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                          ex.completed ? 'bg-success text-white shadow-glow-success' : 'border-2 border-border-subtle bg-surface hover:border-purple'
                        }`}
                      >
                        {ex.completed && <FiCheck size={14} className="stroke-[3]" />}
                      </button>

                      <div>
                        <p className={`text-xs font-bold ${ex.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                          {ex.name}
                        </p>
                        <p className="text-[10px] text-text-muted font-mono">
                          {ex.sets} Sets × {ex.reps} Reps • Target: <strong className="text-purple">{ex.targetWeight} kg</strong>
                        </p>
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
              <div className="text-center py-8 text-xs text-text-muted space-y-2">
                <p className="font-bold text-text-primary">No Exercises Assigned Yet</p>
                <p>Click 'Add Saved Exercise' to assign exercises from your saved exercise library to {selectedPlanDay}.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* SUB TAB 4: EXERCISES (FULL CRUD WITH IMAGE & VIDEO URLS) */}
      {activeTab === 'exercises' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Exercise Library Management (CRUD)</h2>
              <p className="text-xs text-text-muted">Create, edit, and manage your personal exercise library with custom video links and images.</p>
            </div>
            <button onClick={() => openCreateExerciseModal()} className="btn-primary text-xs px-4 py-2 bg-purple hover:bg-purple/80 flex items-center gap-1.5 shadow-glow-primary">
              <FiPlus size={16} /> + Create New Exercise
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-3 text-text-muted" size={16} />
              <input
                type="text"
                placeholder="Search exercise library..."
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
          </div>

          {/* Main Layout (Categories Left, Exercises Table Center, Detail Right) */}
          <div className="grid grid-cols-12 gap-4">
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
                  <span className="font-mono text-[10px]">{cat.count}</span>
                </button>
              ))}
            </div>

            <div className="col-span-5 card p-4 space-y-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border-subtle text-[10px] text-text-muted uppercase">
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
                          selectedExercise === ex.name ? 'bg-purple/10 border-l-2 border-purple font-bold' : ''
                        }`}
                      >
                        <td className="py-3 pr-2 flex items-center gap-2">
                          <span className="text-base">🏋️</span>
                          <span className="text-text-primary">{ex.name}</span>
                        </td>
                        <td className="py-3 px-2 text-text-muted">{ex.group}</td>
                        <td className="py-3 px-2">
                          <span className="badge-warning text-[9px]">{ex.difficulty}</span>
                        </td>
                        <td className="py-3 pl-2 text-right">
                          <button onClick={(e) => { e.stopPropagation(); openEditExerciseModal(ex); }} className="text-purple hover:underline p-1 text-[10px] font-bold">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Right Exercise Detail View with Image & Video */}
            <div className="col-span-4 card p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <h3 className="text-sm font-bold text-text-primary">{activeExerciseObj.name}</h3>
                <button onClick={() => openEditExerciseModal(activeExerciseObj)} className="btn-outline text-[10px] py-1 px-2 flex items-center gap-1">
                  <FiEdit3 /> Edit Exercise
                </button>
              </div>

              {/* Image & Video Media Container */}
              <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-900 border border-border-subtle flex items-center justify-center group">
                {activeExerciseObj.image_url ? (
                  <img src={activeExerciseObj.image_url} alt={activeExerciseObj.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-text-muted space-y-1">
                    <FiImage size={32} className="mx-auto text-purple/60" />
                    <p className="text-[10px]">No Exercise Image URL</p>
                  </div>
                )}

                {activeExerciseObj.video_url && (
                  <a
                    href={activeExerciseObj.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-2 right-2 px-3 py-1 rounded-lg bg-purple/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-glow-primary hover:bg-purple"
                  >
                    <FiVideo size={12} /> Watch Video <FiExternalLink size={10} />
                  </a>
                )}
              </div>

              <div className="space-y-1 text-xs">
                <p className="text-text-muted">Primary Target: <strong className="text-purple">{activeExerciseObj.primary}</strong></p>
                <p className="text-text-muted">Equipment: <strong className="text-text-primary">{activeExerciseObj.equipment}</strong></p>
                <p className="text-text-muted">Difficulty: <strong className="text-text-primary">{activeExerciseObj.difficulty}</strong></p>
              </div>

              {activeExerciseObj.instructions && (
                <div className="space-y-1 text-xs border-t border-border-subtle pt-2">
                  <h4 className="font-bold text-text-primary text-[11px]">Instructions</h4>
                  <p className="text-[10px] text-text-muted leading-relaxed">{activeExerciseObj.instructions}</p>
                </div>
              )}

              {activeExerciseObj.tips && (
                <div className="space-y-1 text-xs border-t border-border-subtle pt-2">
                  <h4 className="font-bold text-text-primary text-[11px]">Form Tips</h4>
                  <p className="text-[10px] text-text-muted leading-relaxed">{activeExerciseObj.tips}</p>
                </div>
              )}
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
              <p className="text-xs text-text-muted">Track your fitness journey and personal records.</p>
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
              <p className="text-xs text-text-muted">Track your daily calories and macros.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB TAB 7: SETTINGS */}
      {activeTab === 'settings' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Settings</h2>
              <p className="text-xs text-text-muted">Manage your preferences and profile.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* MODAL: CREATE / EDIT EXERCISE MODAL (WITH IMAGE & VIDEO URL) */}
      <AnimatePresence>
        {showExerciseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card p-6 max-w-lg w-full space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-text-primary">
                  {editingExerciseId ? 'Edit Exercise' : 'Create New Exercise'}
                </h3>
                <button onClick={() => setShowExerciseModal(false)} className="text-text-muted hover:text-text-primary"><FiX size={18} /></button>
              </div>

              <form onSubmit={handleSaveExercise} className="space-y-3 text-xs">
                <div>
                  <label className="block text-text-muted mb-1">Exercise Name *</label>
                  <input
                    type="text"
                    required
                    value={exerciseForm.name}
                    onChange={e => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                    placeholder="e.g. Incline Dumbbell Bench Press"
                    className="w-full p-2.5 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle focus:border-purple focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-text-muted mb-1">Muscle Group</label>
                    <select
                      value={exerciseForm.group}
                      onChange={e => setExerciseForm({ ...exerciseForm, group: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle"
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
                    <label className="block text-text-muted mb-1">Equipment</label>
                    <select
                      value={exerciseForm.equipment}
                      onChange={e => setExerciseForm({ ...exerciseForm, equipment: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle"
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
                    <label className="block text-text-muted mb-1">Difficulty</label>
                    <select
                      value={exerciseForm.difficulty}
                      onChange={e => setExerciseForm({ ...exerciseForm, difficulty: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-text-muted mb-1 flex items-center gap-1">
                      <FiImage size={12} /> Image URL / Link
                    </label>
                    <input
                      type="url"
                      value={exerciseForm.image_url}
                      onChange={e => setExerciseForm({ ...exerciseForm, image_url: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2.5 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle"
                    />
                  </div>

                  <div>
                    <label className="block text-text-muted mb-1 flex items-center gap-1">
                      <FiVideo size={12} /> Video URL / Link
                    </label>
                    <input
                      type="url"
                      value={exerciseForm.video_url}
                      onChange={e => setExerciseForm({ ...exerciseForm, video_url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full p-2.5 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-text-muted mb-1">Instructions</label>
                  <textarea
                    rows={2}
                    value={exerciseForm.instructions}
                    onChange={e => setExerciseForm({ ...exerciseForm, instructions: e.target.value })}
                    placeholder="Step-by-step instructions for performing the exercise..."
                    className="w-full p-2.5 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle"
                  />
                </div>

                <div>
                  <label className="block text-text-muted mb-1">Form Tips & Cues</label>
                  <input
                    type="text"
                    value={exerciseForm.tips}
                    onChange={e => setExerciseForm({ ...exerciseForm, tips: e.target.value })}
                    placeholder="e.g. Keep back flat, drive feet into floor"
                    className="w-full p-2.5 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  {editingExerciseId && (
                    <button
                      type="button"
                      onClick={() => handleDeleteExercise(editingExerciseId)}
                      className="px-4 py-2.5 rounded-xl bg-danger/20 text-danger font-bold hover:bg-danger/30 transition-all flex items-center gap-1"
                    >
                      <FiTrash2 size={14} /> Delete
                    </button>
                  )}
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-purple hover:bg-purple/80 text-white font-bold transition-all shadow-glow-primary">
                    {editingExerciseId ? 'Save Changes' : 'Create Exercise'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: WEEKLY PLAN BUILDER MODAL (STRICTLY SAVED EXERCISES) */}
      <AnimatePresence>
        {showWeeklyPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card p-6 max-w-lg w-full space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-text-primary">Add Exercise to {selectedPlanDay}'s Plan</h3>
                <button onClick={() => setShowWeeklyPlanModal(false)} className="text-text-muted hover:text-text-primary"><FiX size={18} /></button>
              </div>

              <form onSubmit={handleAddExerciseToPlan} className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-text-muted">Select Saved Exercise *</label>
                    <button
                      type="button"
                      onClick={() => { setShowWeeklyPlanModal(false); openCreateExerciseModal(); }}
                      className="text-[10px] font-bold text-purple hover:underline flex items-center gap-1"
                    >
                      <FiPlus size={12} /> Create New Exercise First
                    </button>
                  </div>
                  <select
                    value={newPlanExercise.name}
                    onChange={e => setNewPlanExercise({ ...newPlanExercise, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle"
                  >
                    {exercisesList.map(e => (
                      <option key={e.id || e.name} value={e.name}>
                        {e.name} ({e.group})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-text-muted mb-1">Target Sets</label>
                    <input
                      type="number"
                      required
                      value={newPlanExercise.sets}
                      onChange={e => setNewPlanExercise({ ...newPlanExercise, sets: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1">Target Reps</label>
                    <input
                      type="number"
                      required
                      value={newPlanExercise.reps}
                      onChange={e => setNewPlanExercise({ ...newPlanExercise, reps: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1">Target Weight (kg)</label>
                    <input
                      type="text"
                      required
                      value={newPlanExercise.targetWeight}
                      onChange={e => setNewPlanExercise({ ...newPlanExercise, targetWeight: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-surface-elevated text-text-primary border border-border-subtle"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-2.5 rounded-xl bg-purple text-white font-bold shadow-glow-primary">
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
