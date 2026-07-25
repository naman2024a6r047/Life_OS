import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiCheckCircle, FiClock, FiTrendingUp, FiX, FiLayers, FiInfo, FiZap } from 'react-icons/fi';

/**
 * High-Fidelity Muscle Focus Card & Interactive Anatomical SVG Model
 * Features:
 * - 40% Larger Athletic Vector Anatomy (Front & Back Views)
 * - Segmented Control (Front | Back | Both)
 * - 3 Muscle Highlight States (Primary Purple Glow, Secondary Blue, Not Trained Gray)
 * - Rich Hover Tooltip with Recovery %, Volume, Last Trained & Exercise Count
 * - Interactive Click Side Drawer with Detailed Muscle Analytics & Exercises List
 * - 4 Statistic Chips
 * - Rounded Pill Legends
 * - Weekly Muscle Distribution Summary Progress Bars
 */
export default function MuscleDiagram({
  selectedExercise = 'Bench Press',
  selectedMuscle = 'all',
  onSelectMuscle = () => {},
  className = ''
}) {
  const [viewMode, setViewMode] = useState('both'); // 'both' | 'front' | 'back'
  const [hoveredMuscle, setHoveredMuscle] = useState(null);
  const [activeDrawerMuscle, setActiveDrawerMuscle] = useState(null);

  // Exercise to Muscle Group Mapping
  const exerciseMuscleMap = {
    'bench press': { primary: ['chest'], secondary: ['deltoids_front', 'triceps'] },
    'barbell bench press': { primary: ['chest'], secondary: ['deltoids_front', 'triceps'] },
    'deadlift': { primary: ['lats', 'lower_back'], secondary: ['glutes', 'hamstrings', 'forearms'] },
    'squat': { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'core'] },
    'barbell back squat': { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'core'] },
    'pull up': { primary: ['lats'], secondary: ['biceps', 'deltoids_rear'] },
    'pull ups': { primary: ['lats'], secondary: ['biceps', 'deltoids_rear'] },
    'shoulder press': { primary: ['deltoids_front', 'deltoids_side'], secondary: ['triceps', 'chest'] },
    'dumbbell shoulder press': { primary: ['deltoids_front', 'deltoids_side'], secondary: ['triceps', 'chest'] },
    'overhead press': { primary: ['deltoids_front', 'deltoids_side'], secondary: ['triceps', 'traps'] },
    'dumbbell bicep curl': { primary: ['biceps'], secondary: ['forearms'] },
    'cable tricep pushdown': { primary: ['triceps'], secondary: ['forearms'] },
    'plank': { primary: ['core', 'obliques'], secondary: ['deltoids_front'] },
  };

  const exKey = (selectedExercise || '').toLowerCase();
  const targetInfo = exerciseMuscleMap[exKey] || { primary: ['chest'], secondary: ['deltoids_front', 'triceps'] };

  // Rich Metadata for every muscle group
  const muscleData = {
    chest: {
      name: 'Chest (Pectoralis Major)',
      group: 'Upper Body',
      status: 'primary',
      exercisesCount: 12,
      lastTrained: 'Yesterday',
      recovery: 82,
      weeklyVolume: '18,500 kg',
      exercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Chest Flyes', 'Dips']
    },
    deltoids_front: {
      name: 'Front Deltoids',
      group: 'Shoulders',
      status: 'secondary',
      exercisesCount: 10,
      lastTrained: 'Yesterday',
      recovery: 78,
      weeklyVolume: '12,200 kg',
      exercises: ['Overhead Press', 'Front Raises', 'Arnold Press']
    },
    deltoids_side: {
      name: 'Side Deltoids',
      group: 'Shoulders',
      status: 'secondary',
      exercisesCount: 8,
      lastTrained: '2 days ago',
      recovery: 85,
      weeklyVolume: '9,400 kg',
      exercises: ['Lateral Raises', 'Cable Lateral Raises']
    },
    deltoids_rear: {
      name: 'Rear Deltoids',
      group: 'Shoulders',
      status: 'secondary',
      exercisesCount: 6,
      lastTrained: '3 days ago',
      recovery: 90,
      weeklyVolume: '7,100 kg',
      exercises: ['Face Pulls', 'Reverse Flyes']
    },
    biceps: {
      name: 'Biceps Brachii',
      group: 'Arms',
      status: 'secondary',
      exercisesCount: 9,
      lastTrained: '2 days ago',
      recovery: 88,
      weeklyVolume: '8,600 kg',
      exercises: ['Barbell Bicep Curl', 'Hammer Curls', 'Preacher Curls']
    },
    triceps: {
      name: 'Triceps Brachii',
      group: 'Arms',
      status: 'secondary',
      exercisesCount: 10,
      lastTrained: 'Yesterday',
      recovery: 76,
      weeklyVolume: '11,400 kg',
      exercises: ['Cable Tricep Pushdown', 'Skullcrushers', 'Tricep Dips']
    },
    forearms: {
      name: 'Forearms & Brachioradialis',
      group: 'Arms',
      status: 'untrained',
      exercisesCount: 5,
      lastTrained: '4 days ago',
      recovery: 95,
      weeklyVolume: '5,200 kg',
      exercises: ['Wrist Curls', 'Farmers Walk']
    },
    core: {
      name: 'Abs (Rectus Abdominis)',
      group: 'Core',
      status: 'untrained',
      exercisesCount: 8,
      lastTrained: '3 days ago',
      recovery: 92,
      weeklyVolume: '6,000 kg',
      exercises: ['Hanging Leg Raises', 'Plank', 'Ab Wheel Rollouts']
    },
    obliques: {
      name: 'Obliques',
      group: 'Core',
      status: 'untrained',
      exercisesCount: 6,
      lastTrained: '3 days ago',
      recovery: 92,
      weeklyVolume: '4,500 kg',
      exercises: ['Russian Twists', 'Side Planks']
    },
    quads: {
      name: 'Quadriceps',
      group: 'Legs',
      status: 'primary',
      exercisesCount: 14,
      lastTrained: '3 days ago',
      recovery: 72,
      weeklyVolume: '22,400 kg',
      exercises: ['Barbell Back Squat', 'Leg Press', 'Bulgarian Split Squats']
    },
    calves: {
      name: 'Calves (Gastrocnemius)',
      group: 'Legs',
      status: 'untrained',
      exercisesCount: 4,
      lastTrained: '3 days ago',
      recovery: 94,
      weeklyVolume: '4,800 kg',
      exercises: ['Standing Calf Raises', 'Seated Calf Raises']
    },
    traps: {
      name: 'Trapezius',
      group: 'Back',
      status: 'secondary',
      exercisesCount: 8,
      lastTrained: '4 days ago',
      recovery: 88,
      weeklyVolume: '10,500 kg',
      exercises: ['Barbell Shrugs', 'Rack Pulls']
    },
    lats: {
      name: 'Latissimus Dorsi (Lats)',
      group: 'Back',
      status: 'primary',
      exercisesCount: 15,
      lastTrained: '4 days ago',
      recovery: 68,
      weeklyVolume: '24,800 kg',
      exercises: ['Pull Ups', 'Lat Pulldown', 'Barbell Rows']
    },
    lower_back: {
      name: 'Erector Spinae (Lower Back)',
      group: 'Back',
      status: 'primary',
      exercisesCount: 7,
      lastTrained: '4 days ago',
      recovery: 70,
      weeklyVolume: '16,200 kg',
      exercises: ['Deadlift', 'Hyperextensions']
    },
    glutes: {
      name: 'Gluteus Maximus',
      group: 'Legs',
      status: 'primary',
      exercisesCount: 11,
      lastTrained: '3 days ago',
      recovery: 74,
      weeklyVolume: '19,300 kg',
      exercises: ['Hip Thrusts', 'Barbell Squat', 'Romanian Deadlift']
    },
    hamstrings: {
      name: 'Hamstrings',
      group: 'Legs',
      status: 'secondary',
      exercisesCount: 9,
      lastTrained: '3 days ago',
      recovery: 75,
      weeklyVolume: '14,100 kg',
      exercises: ['Romanian Deadlift', 'Lying Leg Curls']
    }
  };

  const getMuscleStatus = (muscleId) => {
    if (selectedMuscle && selectedMuscle !== 'all' && selectedMuscle === muscleId) return 'primary';
    if (targetInfo.primary.includes(muscleId)) return 'primary';
    if (targetInfo.secondary.includes(muscleId)) return 'secondary';
    return 'none';
  };

  const getMuscleFill = (muscleId) => {
    const status = getMuscleStatus(muscleId);
    if (hoveredMuscle === muscleId) return 'url(#hoverGradient)';
    if (status === 'primary') return 'url(#primaryGradient)';
    if (status === 'secondary') return 'url(#secondaryGradient)';
    return 'url(#inactiveGradient)';
  };

  const getMuscleFilter = (muscleId) => {
    const status = getMuscleStatus(muscleId);
    if (hoveredMuscle === muscleId) return 'drop-shadow(0px 0px 8px rgba(192, 132, 252, 0.9))';
    if (status === 'primary') return 'drop-shadow(0px 0px 7px rgba(168, 85, 247, 0.85))';
    if (status === 'secondary') return 'drop-shadow(0px 0px 5px rgba(56, 189, 248, 0.65))';
    return 'none';
  };

  const currentHoverMeta = hoveredMuscle ? (muscleData[hoveredMuscle] || { name: hoveredMuscle, group: 'Body', status: getMuscleStatus(hoveredMuscle), exercisesCount: 8, lastTrained: '2 days ago', recovery: 85, weeklyVolume: '12,500 kg' }) : null;

  return (
    <div className={`card p-5 space-y-5 bg-gradient-to-br from-surface to-surface-elevated relative overflow-hidden border border-border-subtle ${className}`}>
      {/* CARD HEADER WITH SEGMENTED CONTROL */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple/10 text-purple flex items-center justify-center font-bold">
            <FiActivity size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary tracking-wide">Muscle Focus</h3>
            <p className="text-[10px] text-text-muted">Targeted muscle activation heatmap & recovery stats</p>
          </div>
        </div>

        {/* Modern Segmented Control: Front | Back | Both */}
        <div className="flex items-center p-1 rounded-xl bg-surface-elevated border border-border-subtle">
          {[
            { id: 'both', label: 'Both' },
            { id: 'front', label: 'Front' },
            { id: 'back', label: 'Back' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all duration-300 ${
                viewMode === tab.id
                  ? 'bg-gradient-to-r from-purple to-purple-accent text-white shadow-glow-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CENTER HIGH-QUALITY SVG ANATOMY MODELS */}
      <div className="relative w-full min-h-[300px] flex items-center justify-center py-2 select-none">
        <svg viewBox="0 0 340 260" className="w-full h-72 object-contain filter drop-shadow-2xl">
          {/* DEFINITIONS FOR GRADIENTS & GLOW FILTERS */}
          <defs>
            {/* Primary Purple Glow Gradient */}
            <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>

            {/* Secondary Blue Glow Gradient */}
            <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>

            {/* Inactive Dark Slate Gradient */}
            <linearGradient id="inactiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0.85" />
            </linearGradient>

            {/* Hover Gradient */}
            <linearGradient id="hoverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E9D5FF" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
          </defs>

          {/* ======================================================== */}
          {/* FRONT ANATOMY MODEL (LEFT SIDE)                          */}
          {/* ======================================================== */}
          {(viewMode === 'both' || viewMode === 'front') && (
            <g id="front-anatomy" transform={viewMode === 'front' ? "translate(80, 0) scale(1.15)" : "translate(10, 0)"}>
              {/* Head & Neck Base Skeleton */}
              <circle cx="80" cy="22" r="13" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
              <rect x="74" y="33" width="12" height="9" fill="#1E293B" rx="2" stroke="#334155" strokeWidth="1" />

              {/* Trapezius Front */}
              <path
                d="M 64 36 Q 74 33 74 41 L 62 43 Z"
                fill={getMuscleFill('traps')}
                filter={getMuscleFilter('traps')}
                className="cursor-pointer transition-all duration-300 hover:opacity-90"
                onMouseEnter={() => setHoveredMuscle('traps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('traps'); setActiveDrawerMuscle(muscleData['traps']); }}
              />
              <path
                d="M 96 36 Q 86 33 86 41 L 98 43 Z"
                fill={getMuscleFill('traps')}
                filter={getMuscleFilter('traps')}
                className="cursor-pointer transition-all duration-300 hover:opacity-90"
                onMouseEnter={() => setHoveredMuscle('traps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('traps'); setActiveDrawerMuscle(muscleData['traps']); }}
              />

              {/* Deltoids (Front Shoulders) */}
              <path
                d="M 48 44 Q 60 41 64 48 L 54 68 Q 44 60 48 44 Z"
                fill={getMuscleFill('deltoids_front')}
                filter={getMuscleFilter('deltoids_front')}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('deltoids_front')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }}
              />
              <path
                d="M 112 44 Q 100 41 96 48 L 106 68 Q 116 60 112 44 Z"
                fill={getMuscleFill('deltoids_front')}
                filter={getMuscleFilter('deltoids_front')}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('deltoids_front')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }}
              />

              {/* Chest (Pectoralis Major) */}
              <path
                d="M 64 45 Q 80 43 80 58 Q 64 68 60 56 Z"
                fill={getMuscleFill('chest')}
                filter={getMuscleFilter('chest')}
                stroke="#0F172A"
                strokeWidth="1.2"
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('chest')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }}
              />
              <path
                d="M 96 45 Q 80 43 80 58 Q 96 68 100 56 Z"
                fill={getMuscleFill('chest')}
                filter={getMuscleFilter('chest')}
                stroke="#0F172A"
                strokeWidth="1.2"
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('chest')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }}
              />

              {/* Biceps */}
              <path
                d="M 52 66 Q 44 76 49 88 Q 57 84 57 70 Z"
                fill={getMuscleFill('biceps')}
                filter={getMuscleFilter('biceps')}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('biceps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }}
              />
              <path
                d="M 108 66 Q 116 76 111 88 Q 103 84 103 70 Z"
                fill={getMuscleFill('biceps')}
                filter={getMuscleFilter('biceps')}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('biceps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }}
              />

              {/* Forearms Front */}
              <path
                d="M 47 89 Q 40 105 44 122 Q 52 118 52 94 Z"
                fill={getMuscleFill('forearms')}
                filter={getMuscleFilter('forearms')}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('forearms')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('forearms'); setActiveDrawerMuscle(muscleData['forearms']); }}
              />
              <path
                d="M 113 89 Q 120 105 116 122 Q 108 118 108 94 Z"
                fill={getMuscleFill('forearms')}
                filter={getMuscleFilter('forearms')}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('forearms')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('forearms'); setActiveDrawerMuscle(muscleData['forearms']); }}
              />

              {/* Core / Abs (Rectus Abdominis 6-Pack Grid) */}
              <g
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('core')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('core'); setActiveDrawerMuscle(muscleData['core']); }}
              >
                <rect x="71" y="69" width="8" height="9" rx="2" fill={getMuscleFill('core')} filter={getMuscleFilter('core')} />
                <rect x="81" y="69" width="8" height="9" rx="2" fill={getMuscleFill('core')} filter={getMuscleFilter('core')} />
                <rect x="71" y="80" width="8" height="9" rx="2" fill={getMuscleFill('core')} filter={getMuscleFilter('core')} />
                <rect x="81" y="80" width="8" height="9" rx="2" fill={getMuscleFill('core')} filter={getMuscleFilter('core')} />
                <rect x="72" y="91" width="7" height="9" rx="2" fill={getMuscleFill('core')} filter={getMuscleFilter('core')} />
                <rect x="81" y="91" width="7" height="9" rx="2" fill={getMuscleFill('core')} filter={getMuscleFilter('core')} />
              </g>

              {/* Obliques */}
              <path
                d="M 62 70 Q 70 85 68 102 Q 60 92 62 70 Z"
                fill={getMuscleFill('obliques')}
                filter={getMuscleFilter('obliques')}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('obliques')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('obliques'); setActiveDrawerMuscle(muscleData['obliques']); }}
              />
              <path
                d="M 98 70 Q 90 85 92 102 Q 100 92 98 70 Z"
                fill={getMuscleFill('obliques')}
                filter={getMuscleFilter('obliques')}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('obliques')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('obliques'); setActiveDrawerMuscle(muscleData['obliques']); }}
              />

              {/* Quadriceps (Quads) */}
              <path
                d="M 62 108 Q 78 105 78 125 L 75 168 Q 60 162 58 128 Z"
                fill={getMuscleFill('quads')}
                filter={getMuscleFilter('quads')}
                stroke="#0F172A"
                strokeWidth="1.2"
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('quads')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('quads'); setActiveDrawerMuscle(muscleData['quads']); }}
              />
              <path
                d="M 98 108 Q 82 105 82 125 L 85 168 Q 100 162 102 128 Z"
                fill={getMuscleFill('quads')}
                filter={getMuscleFilter('quads')}
                stroke="#0F172A"
                strokeWidth="1.2"
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('quads')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('quads'); setActiveDrawerMuscle(muscleData['quads']); }}
              />

              {/* Calves Front */}
              <path
                d="M 60 178 Q 73 175 73 205 Q 64 225 58 200 Z"
                fill={getMuscleFill('calves')}
                filter={getMuscleFilter('calves')}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('calves')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }}
              />
              <path
                d="M 100 178 Q 87 175 87 205 Q 96 225 102 200 Z"
                fill={getMuscleFill('calves')}
                filter={getMuscleFilter('calves')}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('calves')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }}
              />
            </g>
          )}

          {/* ======================================================== */}
          {/* BACK ANATOMY MODEL (RIGHT SIDE)                           */}
          {/* ======================================================== */}
          {(viewMode === 'both' || viewMode === 'back') && (
            <g id="back-anatomy" transform={viewMode === 'back' ? "translate(80, 0) scale(1.15)" : "translate(170, 0)"}>
              {/* Head & Neck Back Skeleton */}
              <circle cx="80" cy="22" r="13" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
              <rect x="74" y="33" width="12" height="9" fill="#1E293B" rx="2" stroke="#334155" strokeWidth="1" />

              {/* Upper Trapezius Back */}
              <path
                d="M 60 38 Q 80 32 100 38 L 92 56 Q 80 64 68 56 Z"
                fill={getMuscleFill('traps')}
                filter={getMuscleFilter('traps')}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('traps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('traps'); setActiveDrawerMuscle(muscleData['traps']); }}
              />

              {/* Deltoids (Rear Shoulders) */}
              <path
                d="M 48 44 Q 60 41 64 48 L 54 68 Q 44 60 48 44 Z"
                fill={getMuscleFill('deltoids_rear')}
                filter={getMuscleFilter('deltoids_rear')}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('deltoids_rear')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('deltoids_rear'); setActiveDrawerMuscle(muscleData['deltoids_rear']); }}
              />
              <path
                d="M 112 44 Q 100 41 96 48 L 106 68 Q 116 60 112 44 Z"
                fill={getMuscleFill('deltoids_rear')}
                filter={getMuscleFilter('deltoids_rear')}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('deltoids_rear')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('deltoids_rear'); setActiveDrawerMuscle(muscleData['deltoids_rear']); }}
              />

              {/* Lats (Latissimus Dorsi V-Taper) */}
              <path
                d="M 64 56 Q 80 62 80 92 Q 62 84 56 65 Z"
                fill={getMuscleFill('lats')}
                filter={getMuscleFilter('lats')}
                stroke="#0F172A"
                strokeWidth="1.2"
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('lats')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('lats'); setActiveDrawerMuscle(muscleData['lats']); }}
              />
              <path
                d="M 96 56 Q 80 62 80 92 Q 98 84 104 65 Z"
                fill={getMuscleFill('lats')}
                filter={getMuscleFilter('lats')}
                stroke="#0F172A"
                strokeWidth="1.2"
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('lats')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('lats'); setActiveDrawerMuscle(muscleData['lats']); }}
              />

              {/* Lower Back (Erector Spinae) */}
              <path
                d="M 72 85 L 88 85 L 86 104 L 74 104 Z"
                fill={getMuscleFill('lower_back')}
                filter={getMuscleFilter('lower_back')}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('lower_back')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('lower_back'); setActiveDrawerMuscle(muscleData['lower_back']); }}
              />

              {/* Triceps Back */}
              <path
                d="M 52 66 Q 44 76 49 88 Q 57 84 57 70 Z"
                fill={getMuscleFill('triceps')}
                filter={getMuscleFilter('triceps')}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('triceps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('triceps'); setActiveDrawerMuscle(muscleData['triceps']); }}
              />
              <path
                d="M 108 66 Q 116 76 111 88 Q 103 84 103 70 Z"
                fill={getMuscleFill('triceps')}
                filter={getMuscleFilter('triceps')}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('triceps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('triceps'); setActiveDrawerMuscle(muscleData['triceps']); }}
              />

              {/* Glutes */}
              <path
                d="M 58 106 Q 80 102 80 134 Q 58 132 58 106 Z"
                fill={getMuscleFill('glutes')}
                filter={getMuscleFilter('glutes')}
                stroke="#0F172A"
                strokeWidth="1.2"
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('glutes')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('glutes'); setActiveDrawerMuscle(muscleData['glutes']); }}
              />
              <path
                d="M 102 106 Q 80 102 80 134 Q 102 132 102 106 Z"
                fill={getMuscleFill('glutes')}
                filter={getMuscleFilter('glutes')}
                stroke="#0F172A"
                strokeWidth="1.2"
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('glutes')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('glutes'); setActiveDrawerMuscle(muscleData['glutes']); }}
              />

              {/* Hamstrings */}
              <path
                d="M 60 136 Q 78 135 78 168 Q 62 165 58 136 Z"
                fill={getMuscleFill('hamstrings')}
                filter={getMuscleFilter('hamstrings')}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('hamstrings')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('hamstrings'); setActiveDrawerMuscle(muscleData['hamstrings']); }}
              />
              <path
                d="M 100 136 Q 82 135 82 168 Q 98 165 102 136 Z"
                fill={getMuscleFill('hamstrings')}
                filter={getMuscleFilter('hamstrings')}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('hamstrings')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('hamstrings'); setActiveDrawerMuscle(muscleData['hamstrings']); }}
              />

              {/* Calves Back */}
              <path
                d="M 58 176 Q 75 174 75 208 Q 62 222 56 195 Z"
                fill={getMuscleFill('calves')}
                filter={getMuscleFilter('calves')}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('calves')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }}
              />
              <path
                d="M 102 176 Q 85 174 85 208 Q 98 222 104 195 Z"
                fill={getMuscleFill('calves')}
                filter={getMuscleFilter('calves')}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredMuscle('calves')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }}
              />
            </g>
          )}
        </svg>

        {/* FLOATING GLASSMORPHISM TOOLTIP */}
        <AnimatePresence>
          {currentHoverMeta && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute top-2 right-4 z-30 p-3 rounded-2xl bg-surface/90 backdrop-blur-md border border-purple/40 shadow-glow-primary text-white w-52 space-y-2 pointer-events-none"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-text-primary">{currentHoverMeta.name}</h4>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                  currentHoverMeta.status === 'primary' ? 'bg-purple text-white' :
                  currentHoverMeta.status === 'secondary' ? 'bg-info text-white' : 'bg-surface-elevated text-text-muted'
                }`}>
                  {currentHoverMeta.status === 'primary' ? 'Primary' : currentHoverMeta.status === 'secondary' ? 'Secondary' : 'Not Trained'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[9px]">
                <div className="p-1 rounded bg-background/50">
                  <span className="text-text-muted">Exercises</span>
                  <p className="font-bold text-text-primary">{currentHoverMeta.exercisesCount} active</p>
                </div>
                <div className="p-1 rounded bg-background/50">
                  <span className="text-text-muted">Last Trained</span>
                  <p className="font-bold text-text-primary">{currentHoverMeta.lastTrained}</p>
                </div>
                <div className="p-1 rounded bg-background/50">
                  <span className="text-text-muted">Recovery</span>
                  <p className="font-bold text-success">{currentHoverMeta.recovery}%</p>
                </div>
                <div className="p-1 rounded bg-background/50">
                  <span className="text-text-muted">Weekly Volume</span>
                  <p className="font-bold text-purple">{currentHoverMeta.weeklyVolume}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4 STATISTIC CHIPS UNDER MODELS */}
      <div className="grid grid-cols-4 gap-2 pt-1 border-t border-border-subtle/60">
        <div className="p-2 rounded-xl bg-surface-elevated/40 border border-purple/20 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-text-muted font-medium">Primary Muscles</span>
          <p className="text-sm font-extrabold font-mono text-purple">{targetInfo.primary.length || 4}</p>
        </div>

        <div className="p-2 rounded-xl bg-surface-elevated/40 border border-info/20 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-text-muted font-medium">Secondary</span>
          <p className="text-sm font-extrabold font-mono text-info">{targetInfo.secondary.length || 3}</p>
        </div>

        <div className="p-2 rounded-xl bg-surface-elevated/40 border border-success/20 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-text-muted font-medium">Recovery Rate</span>
          <p className="text-sm font-extrabold font-mono text-success">82%</p>
        </div>

        <div className="p-2 rounded-xl bg-surface-elevated/40 border border-border-subtle flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-text-muted font-medium">Active Exercises</span>
          <p className="text-sm font-extrabold font-mono text-text-primary">12</p>
        </div>
      </div>

      {/* ROUNDED PILLS LEGEND */}
      <div className="flex items-center justify-center gap-4 pt-1">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple/10 border border-purple/30">
          <span className="w-2.5 h-2.5 rounded-full bg-purple shadow-glow-primary" />
          <span className="text-xs font-bold text-text-primary">Primary Target</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-info/10 border border-info/30">
          <span className="w-2.5 h-2.5 rounded-full bg-info" />
          <span className="text-xs font-bold text-text-primary">Secondary Target</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-elevated border border-border-subtle">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          <span className="text-xs font-semibold text-text-muted">Not Trained</span>
        </div>
      </div>

      {/* WEEKLY SUMMARY: WEEKLY MUSCLE DISTRIBUTION PROGRESS BARS */}
      <div className="space-y-2 border-t border-border-subtle pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-text-primary">Weekly Muscle Distribution</span>
          <span className="text-[10px] text-text-muted">Volume Breakdown</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {[
            { muscle: 'Chest', percent: 85, color: 'bg-purple', vol: '18,500 kg' },
            { muscle: 'Back', percent: 68, color: 'bg-info', vol: '24,800 kg' },
            { muscle: 'Legs', percent: 72, color: 'bg-success', vol: '22,400 kg' },
            { muscle: 'Shoulders', percent: 55, color: 'bg-warning', vol: '12,200 kg' },
            { muscle: 'Arms', percent: 60, color: 'bg-purple-accent', vol: '11,400 kg' },
            { muscle: 'Core', percent: 42, color: 'bg-slate-500', vol: '6,000 kg' },
          ].map(item => (
            <div key={item.muscle} className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-text-muted font-medium">{item.muscle}</span>
                <span className="font-mono font-bold text-text-primary">{item.percent}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-background overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${item.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INTERACTIVE CLICK MUSCLE SIDE DRAWER / DETAIL MODAL */}
      <AnimatePresence>
        {activeDrawerMuscle && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="card p-6 max-w-sm w-full h-full max-h-[550px] space-y-4 bg-surface border border-purple/40 shadow-glow-primary overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div>
                  <span className="text-[9px] font-bold text-purple uppercase tracking-wider">{activeDrawerMuscle.group}</span>
                  <h3 className="text-base font-bold text-text-primary">{activeDrawerMuscle.name}</h3>
                </div>
                <button onClick={() => setActiveDrawerMuscle(null)} className="text-text-muted hover:text-text-primary p-1">
                  <FiX size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-surface-elevated">
                  <span className="text-[10px] text-text-muted">Recovery Score</span>
                  <p className="text-lg font-bold font-mono text-success">{activeDrawerMuscle.recovery}%</p>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-elevated">
                  <span className="text-[10px] text-text-muted">Weekly Volume</span>
                  <p className="text-lg font-bold font-mono text-purple">{activeDrawerMuscle.weeklyVolume}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <FiLayers className="text-purple" /> Assigned Exercises
                </h4>
                <div className="space-y-1.5">
                  {activeDrawerMuscle.exercises.map((ex, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-surface-elevated/40 border border-border-subtle text-xs flex items-center justify-between">
                      <span className="font-bold text-text-primary">{ex}</span>
                      <span className="badge-purple text-[9px]">Active</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple/10 border border-purple/30 text-xs space-y-1">
                <p className="font-bold text-purple flex items-center gap-1"><FiZap /> Recommendation</p>
                <p className="text-[10px] text-text-muted">Optimal recovery time remaining: 18 hours before next heavy training session.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
