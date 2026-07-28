import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiCheckCircle, FiClock, FiTrendingUp, FiX, FiLayers, FiInfo, FiZap } from 'react-icons/fi';

/**
 * High-Fidelity Muscle Focus Card & Interactive Anatomical SVG Model
 * Supports:
 * - 60% Width Centerpiece Display in Today's Workout Card
 * - 40% Larger Athletic Vector Anatomy (Front & Back Views) with zero cropping
 * - Segmented Control (Both | Front | Back)
 * - 3 Muscle Highlight States (Primary Purple Glow, Secondary Blue, Not Trained Gray)
 * - Rich Hover Tooltip with Recovery %, Volume, Last Trained & Exercise Count
 * - Interactive Click Side Drawer with Detailed Muscle Analytics & Exercises List
 * - 4 Statistic Chips, Rounded Pill Legends & Distribution Bars
 */
export default function MuscleDiagram({
  selectedExercise = 'Bench Press',
  activeExercises = [],
  selectedMuscle = 'all',
  onSelectMuscle = () => {},
  showFullCard = false,
  minimalMode = false,
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

  const primarySet = new Set();
  const secondarySet = new Set();

  if (Array.isArray(activeExercises) && activeExercises.length > 0) {
    activeExercises.forEach(ex => {
      if (!ex) return;
      const exName = typeof ex === 'string' ? ex : (ex.name || '');
      const exKey = exName.toLowerCase();
      
      if (typeof ex === 'object' && ex.primary) {
        const pArr = Array.isArray(ex.primary) ? ex.primary : (typeof ex.primary === 'string' ? ex.primary.split(',') : []);
        pArr.forEach(s => {
          const m = s?.trim?.().toLowerCase().replace(/ /g, '_');
          if (m) primarySet.add(m);
        });
        
        if (ex.secondary) {
          const sArr = Array.isArray(ex.secondary) ? ex.secondary : (typeof ex.secondary === 'string' ? ex.secondary.split(',') : []);
          sArr.forEach(s => {
            const m = s?.trim?.().toLowerCase().replace(/ /g, '_');
            if (m && !primarySet.has(m)) secondarySet.add(m);
          });
        }
      } else {
        const mapped = exerciseMuscleMap[exKey];
        if (mapped) {
          if (Array.isArray(mapped.primary)) {
            mapped.primary.forEach(m => {
              if (m) primarySet.add(m);
            });
          }
          if (Array.isArray(mapped.secondary)) {
            mapped.secondary.forEach(m => {
              if (m && !primarySet.has(m)) secondarySet.add(m);
            });
          }
        }
      }
    });
  } else {
    const exKey = (selectedExercise || '').toLowerCase();
    const defaultTarget = exerciseMuscleMap[exKey] || { primary: ['chest'], secondary: ['deltoids_front', 'triceps'] };
    (defaultTarget.primary || []).forEach(m => primarySet.add(m));
    (defaultTarget.secondary || []).forEach(m => {
      if (!primarySet.has(m)) secondarySet.add(m);
    });
  }

  const targetInfo = {
    primary: Array.from(primarySet),
    secondary: Array.from(secondarySet)
  };

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
    if (status === 'primary') return 'drop-shadow(0px 0px 4px rgba(109, 40, 217, 0.4))';
    if (status === 'secondary') return 'drop-shadow(0px 0px 4px rgba(168, 85, 247, 0.4))';
    return 'none';
  };

  const currentHoverMeta = hoveredMuscle ? (muscleData[hoveredMuscle] || { name: hoveredMuscle, group: 'Body', status: getMuscleStatus(hoveredMuscle), exercisesCount: 8, lastTrained: '2 days ago', recovery: 85, weeklyVolume: '12,500 kg' }) : null;

  // Render SVG Anatomical Graphic Component
  const renderSVGGraphic = () => (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-visible">
      <svg
        viewBox="0 0 340 300"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full filter drop-shadow-xl"
      >
        <defs>
          <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#5b21b6" />
          </linearGradient>

          <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>

          <linearGradient id="inactiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3f3f46" />
            <stop offset="100%" stopColor="#27272a" />
          </linearGradient>

          <linearGradient id="hoverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d8b4fe" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>

        {/* FRONT ANATOMY MODEL (High Fidelity) */}
        {(viewMode === 'both' || viewMode === 'front') && (
          <g id="front-anatomy" transform={viewMode === 'front' ? "translate(110, 0) scale(0.75)" : "translate(20, 0) scale(0.75)"}>
            
/* HEAD (19 paths) */
<path d="M91 5c0,-2 -2,-4 -4,-4 -6,-2 -5,1 -5,5 -1,6 1,0 7,3 2,0 1,-2 2,-4z" fill="#1E293B" stroke="#334155" strokeWidth="1"  />
<path d="M73 8c0,2 3,-1 6,1 3,1 2,-2 2,-4 0,-4 0,-6 -5,-4 -5,2 -4,3 -3,7z" fill="#1E293B" stroke="#334155" strokeWidth="1"  />
<path d="M77 39c6,9 4,7 8,1 3,-3 -8,-3 -8,-1z" fill="#1E293B" stroke="#334155" strokeWidth="1"  />
<path d="M81 30c5,0 8,-2 4,-2 -2,0 -5,0 -7,0 -2,0 -4,0 -2,1 1,1 4,1 5,1z" fill="#1E293B" stroke="#334155" strokeWidth="1"  />
<path d="M72 14c1,3 2,-3 8,0 3,1 -3,-9 -7,-3 -1,1 -1,2 -1,3z" fill="#1E293B" stroke="#334155" strokeWidth="1"  />
<path d="M87 9c-3,0 -6,6 -3,4 5,-2 7,5 7,0 -1,-2 -2,-4 -4,-4z" fill="#1E293B" stroke="#334155" strokeWidth="1"  />
<path d="M82 26c1,0 7,1 5,-1 -2,-2 -12,0 -11,1 1,1 5,0 6,0z" fill="#1E293B" stroke="#334155" strokeWidth="1"  />
<path d="M73 18c3,1 7,-1 7,-2 0,-1 -7,-1 -7,0 -1,1 -1,2 0,2z" fill="#1E293B" stroke="#334155" strokeWidth="1"  />
<path d="M90 15c-1,0 -7,-1 -7,1 0,1 4,3 6,3 2,-1 2,-3 1,-4z" fill="#1E293B" stroke="#334155" strokeWidth="1"  />
<path d="M71 14c0,-1 2,-9 0,-8 -2,0 -2,5 -2,6 0,1 1,7 2,2l0 0z" fill="#1E293B" stroke="#334155" strokeWidth="1"  />
<path d="M92 14c1,6 2,-4 2,-5 0,-4 -4,-6 -2,4l0 1z" fill="#1E293B" stroke="#334155" strokeWidth="1"  />
<path d="M75 33c3,4 8,4 3,-1 -1,-1 -6,-3 -3,1z" fill="#1E293B" stroke="#334155" strokeWidth="1"  />
<path d="M85 35c3,-1 6,-8 1,-4 -3,2 -4,6 -1,4z" fill="#1E293B" stroke="#334155" strokeWidth="1"  />
<path d="M73 30c-1,-2 -2,-8 -4,-7 -2,2 4,11 5,9 0,0 -1,-2 -1,-2z" fill="#1E293B" stroke="#334155" strokeWidth="1"  />
<path d="M92 25c0,1 -3,7 -3,8 3,-2 7,-10 4,-10 -1,0 -1,2 -1,2z" fill="#1E293B" stroke="#334155" strokeWidth="1"  />
<path d="M71 22c1,2 3,6 4,3 0,-1 0,-3 -1,-4 -2,-1 -4,0 -3,1z" fill="#1E293B" stroke="#334155" strokeWidth="1"  />
<path d="M89 22c-3,6 1,4 3,0 0,-1 -2,-3 -3,0z" fill="#1E293B" stroke="#334155" strokeWidth="1"  />
<path d="M78 22c0,-3 0,-3 -3,-2 -2,0 1,3 1,3 1,0 2,0 2,-1z" fill="#1E293B" stroke="#334155" strokeWidth="1"  />
<path d="M88 22c1,-2 0,-3 -2,-3 -2,1 0,8 2,3z" fill="#1E293B" stroke="#334155" strokeWidth="1"  />

/* CHEST (17 paths) */
<path d="M80 75c0,-3 1,-17 -3,-17 -4,0 -21,12 -25,15 1,2 26,18 28,2z" fill={getMuscleFill('chest')} filter={getMuscleFilter('chest')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M84 101c2,5 11,5 11,2 1,-5 -10,-13 -11,-5 -1,1 0,2 0,3z" fill={getMuscleFill('chest')} filter={getMuscleFilter('chest')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M79 97c-6,-9 -16,9 -9,8 6,-1 12,0 9,-8z" fill={getMuscleFill('chest')} filter={getMuscleFilter('chest')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M85 90c3,2 14,8 10,0 -5,-8 -15,-6 -10,0z" fill={getMuscleFill('chest')} filter={getMuscleFilter('chest')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M79 86c-5,-4 -13,4 -11,8 1,2 10,-3 11,-4 1,-2 1,-3 0,-4z" fill={getMuscleFill('chest')} filter={getMuscleFilter('chest')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M57 94c-5,-7 -1,8 2,12 4,5 5,0 2,-6 -2,-2 -3,-4 -4,-6z" fill={getMuscleFill('chest')} filter={getMuscleFilter('chest')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M109 93c-1,-2 -2,1 -3,2 -1,2 -7,10 -5,12 2,2 7,-8 7,-10 0,-1 1,-3 1,-4z" fill={getMuscleFill('chest')} filter={getMuscleFilter('chest')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M62 93c-11,-9 0,10 2,5 0,-2 -1,-4 -2,-5z" fill={getMuscleFill('chest')} filter={getMuscleFilter('chest')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M102 93c-5,7 1,6 3,0 2,-4 -2,-1 -3,0z" fill={getMuscleFill('chest')} filter={getMuscleFilter('chest')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M61 84c-6,-4 0,6 1,7 2,2 4,-2 -1,-7z" fill={getMuscleFill('chest')} filter={getMuscleFilter('chest')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M104 83c-1,0 -6,4 -4,7 3,0 4,-5 4,-7z" fill={getMuscleFill('chest')} filter={getMuscleFilter('chest')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M56 84c-3,-1 -1,6 2,5 1,-2 -1,-4 -2,-5z" fill={getMuscleFill('chest')} filter={getMuscleFilter('chest')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M108 84c-3,-1 -5,7 -1,4 1,-1 2,-2 1,-4z" fill={getMuscleFill('chest')} filter={getMuscleFilter('chest')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M61 82c1,1 6,4 4,1 -1,-1 -3,-2 -4,-1z" fill={getMuscleFill('chest')} filter={getMuscleFilter('chest')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M101 82c-1,-1 -5,4 -2,2 1,0 2,-1 2,-2z" fill={getMuscleFill('chest')} filter={getMuscleFilter('chest')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M59 80c-2,-3 -6,1 -2,1 1,1 2,0 2,-1z" fill={getMuscleFill('chest')} filter={getMuscleFilter('chest')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M108 79c-2,-1 -5,3 -2,2 2,0 3,-1 2,-2z" fill={getMuscleFill('chest')} filter={getMuscleFilter('chest')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />

/* CORE (10 paths) */
<path d="M84 123c-1,5 -2,20 1,24 3,4 5,-2 6,-4 1,-4 6,-23 2,-24 -4,-2 -7,1 -9,4z" fill={getMuscleFill('core')} filter={getMuscleFilter('core')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('core')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('core'); setActiveDrawerMuscle(muscleData['core']); }} />
<path d="M69 121c-1,4 2,28 8,27 5,0 3,-20 2,-23 -2,-7 -9,-8 -10,-4z" fill={getMuscleFill('core')} filter={getMuscleFilter('core')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('core')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('core'); setActiveDrawerMuscle(muscleData['core']); }} />
<path d="M83 112c1,6 6,6 10,5 6,-1 0,-14 -7,-10 -2,1 -2,3 -3,5z" fill={getMuscleFill('core')} filter={getMuscleFilter('core')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('core')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('core'); setActiveDrawerMuscle(muscleData['core']); }} />
<path d="M68 115c2,1 9,4 11,2 2,-2 3,-14 -8,-10 -3,1 -4,4 -3,8z" fill={getMuscleFill('core')} filter={getMuscleFilter('core')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('core')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('core'); setActiveDrawerMuscle(muscleData['core']); }} />
<path d="M77 158c-4,8 -4,8 -1,17 2,4 2,2 3,-2 0,-3 2,-19 0,-19 0,0 -1,3 -2,4z" fill={getMuscleFill('core')} filter={getMuscleFilter('core')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('core')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('core'); setActiveDrawerMuscle(muscleData['core']); }} />
<path d="M83 157c0,3 2,31 5,13 2,-7 -1,-9 -4,-15 -1,-3 -1,0 -1,2z" fill={getMuscleFill('core')} filter={getMuscleFilter('core')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('core')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('core'); setActiveDrawerMuscle(muscleData['core']); }} />
<path d="M71 150c-2,5 -2,6 1,11 1,3 3,-1 4,-3 2,-4 2,-7 -3,-9 -2,-1 -2,-1 -2,1z" fill={getMuscleFill('core')} filter={getMuscleFilter('core')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('core')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('core'); setActiveDrawerMuscle(muscleData['core']); }} />
<path d="M86 154c1,3 3,12 6,7 1,-4 3,-8 0,-12 -1,-2 -6,1 -6,5z" fill={getMuscleFill('core')} filter={getMuscleFilter('core')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('core')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('core'); setActiveDrawerMuscle(muscleData['core']); }} />
<path d="M66 147c1,8 6,1 2,-2 -1,-1 -2,1 -2,2z" fill={getMuscleFill('core')} filter={getMuscleFilter('core')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('core')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('core'); setActiveDrawerMuscle(muscleData['core']); }} />
<path d="M94 147c0,3 0,3 1,3 1,0 3,-3 1,-4 -1,-1 -2,0 -2,1 0,0 0,0 0,0z" fill={getMuscleFill('core')} filter={getMuscleFilter('core')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('core')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('core'); setActiveDrawerMuscle(muscleData['core']); }} />

/* OBLIQUES (7 paths) */
<path d="M101 156c-3,8 -10,19 -10,27 1,8 2,14 2,23 0,1 -1,10 0,11 2,0 3,0 3,-2 2,-13 4,-23 7,-36 2,-8 2,-18 0,-26 -1,-3 -2,2 -2,3z" fill={getMuscleFill('obliques')} filter={getMuscleFilter('obliques')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('obliques')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('obliques'); setActiveDrawerMuscle(muscleData['obliques']); }} />
<path d="M58 114c-1,4 -2,15 1,18 1,2 8,9 8,3 0,-3 0,-8 -1,-10 0,-5 0,-13 -5,-15 -3,-2 -3,2 -3,4z" fill={getMuscleFill('obliques')} filter={getMuscleFilter('obliques')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('obliques')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('obliques'); setActiveDrawerMuscle(muscleData['obliques']); }} />
<path d="M100 111c-3,6 -3,14 -4,20 0,5 1,8 6,4 6,-5 4,-14 4,-21 -1,-4 -2,-6 -6,-3z" fill={getMuscleFill('obliques')} filter={getMuscleFilter('obliques')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('obliques')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('obliques'); setActiveDrawerMuscle(muscleData['obliques']); }} />
<path d="M104 140c0,9 1,17 2,25 0,18 -1,27 -5,44 0,4 4,-8 4,-9 5,-18 6,-44 1,-62 -1,-5 -2,-1 -2,2z" fill={getMuscleFill('obliques')} filter={getMuscleFilter('obliques')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('obliques')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('obliques'); setActiveDrawerMuscle(muscleData['obliques']); }} />
<path d="M100 145c-4,10 -16,38 -16,47 0,0 3,-8 4,-11 4,-10 16,-30 14,-40 0,-4 -2,3 -2,4z" fill={getMuscleFill('obliques')} filter={getMuscleFilter('obliques')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('obliques')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('obliques'); setActiveDrawerMuscle(muscleData['obliques']); }} />
<path d="M98 144c0,0 2,-1 2,-3 -1,0 -3,3 -2,3z" fill={getMuscleFill('obliques')} filter={getMuscleFilter('obliques')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('obliques')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('obliques'); setActiveDrawerMuscle(muscleData['obliques']); }} />
<path d="M65 144c2,3 0,-4 -2,-4 0,2 1,3 2,4z" fill={getMuscleFill('obliques')} filter={getMuscleFilter('obliques')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('obliques')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('obliques'); setActiveDrawerMuscle(muscleData['obliques']); }} />

/* QUADS (19 paths) */
<path d="M61 183c2,8 4,19 5,28 1,2 1,7 4,5 1,0 0,-6 0,-7 0,-8 1,-14 2,-22 1,-15 -7,-20 -10,-33 -2,-3 -2,-2 -2,1 -2,11 -2,16 1,28z" fill={getMuscleFill('quads')} filter={getMuscleFilter('quads')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('quads')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('quads'); setActiveDrawerMuscle(muscleData['quads']); }} />
<path d="M62 233c-2,6 6,34 8,42 0,1 5,25 6,21 1,-1 -4,-15 -4,-18 -2,-12 0,-33 -6,-43 -1,-2 -2,-3 -4,-2z" fill={getMuscleFill('quads')} filter={getMuscleFilter('quads')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('quads')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('quads'); setActiveDrawerMuscle(muscleData['quads']); }} />
<path d="M98 234c-7,7 -5,34 -7,45 0,3 -4,17 -4,17 2,2 5,-16 6,-17 2,-9 4,-19 6,-28 1,-2 5,-21 -1,-17z" fill={getMuscleFill('quads')} filter={getMuscleFilter('quads')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('quads')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('quads'); setActiveDrawerMuscle(muscleData['quads']); }} />
<path d="M55 181c0,5 4,25 7,29 0,1 -2,-9 -2,-11 -4,-22 -3,-33 -1,-55 1,-10 -1,-12 -3,0 -2,15 -2,22 -1,37z" fill={getMuscleFill('quads')} filter={getMuscleFilter('quads')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('quads')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('quads'); setActiveDrawerMuscle(muscleData['quads']); }} />
<path d="M88 219c5,1 2,-30 1,-34 -1,-6 -10,33 -1,34z" fill={getMuscleFill('quads')} filter={getMuscleFilter('quads')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('quads')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('quads'); setActiveDrawerMuscle(muscleData['quads']); }} />
<path d="M73 191c0,2 -4,34 4,27 6,-5 -2,-38 -3,-32 -1,1 -1,4 -1,5z" fill={getMuscleFill('quads')} filter={getMuscleFilter('quads')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('quads')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('quads'); setActiveDrawerMuscle(muscleData['quads']); }} />
<path d="M78 189c3,11 -2,-11 -2,-11 -4,-12 -9,-25 -14,-37 -2,-4 -1,0 -1,2 1,15 12,31 17,46z" fill={getMuscleFill('quads')} filter={getMuscleFilter('quads')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('quads')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('quads'); setActiveDrawerMuscle(muscleData['quads']); }} />
<path d="M102 247c-2,2 -8,36 -9,43 -2,9 -1,11 1,0 3,-12 8,-26 9,-37 0,-1 1,-5 -1,-6z" fill={getMuscleFill('quads')} filter={getMuscleFilter('quads')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('quads')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('quads'); setActiveDrawerMuscle(muscleData['quads']); }} />
<path d="M104 181c-1,4 -10,38 -6,37 3,-1 7,-32 6,-37l0 0z" fill={getMuscleFill('quads')} filter={getMuscleFilter('quads')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('quads')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('quads'); setActiveDrawerMuscle(muscleData['quads']); }} />
<path d="M62 211c1,2 2,5 3,7 2,0 1,-5 0,-7 -2,-21 -10,-52 -4,-7 1,2 1,5 1,7z" fill={getMuscleFill('quads')} filter={getMuscleFilter('quads')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('quads')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('quads'); setActiveDrawerMuscle(muscleData['quads']); }} />
<path d="M77 224c-2,8 -6,14 -4,22 0,0 2,-6 2,-8 3,-7 5,-12 4,-19 -1,-4 -2,5 -2,5z" fill={getMuscleFill('quads')} filter={getMuscleFilter('quads')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('quads')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('quads'); setActiveDrawerMuscle(muscleData['quads']); }} />
<path d="M84 225c1,8 4,12 6,20 0,2 1,-5 1,-5 -1,-6 -4,-13 -6,-19 -2,-8 -1,2 -1,4z" fill={getMuscleFill('quads')} filter={getMuscleFilter('quads')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('quads')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('quads'); setActiveDrawerMuscle(muscleData['quads']); }} />
<path d="M76 239c-1,2 -2,22 1,22 3,-1 1,-19 -1,-22z" fill={getMuscleFill('quads')} filter={getMuscleFilter('quads')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('quads')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('quads'); setActiveDrawerMuscle(muscleData['quads']); }} />
<path d="M61 229c4,-1 6,6 5,0 0,-1 -6,-20 -5,-14 0,2 -1,12 0,14z" fill={getMuscleFill('quads')} filter={getMuscleFilter('quads')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('quads')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('quads'); setActiveDrawerMuscle(muscleData['quads']); }} />
<path d="M103 213c-1,1 -8,21 -5,18 5,-5 4,0 5,-6 0,-2 0,-9 0,-12z" fill={getMuscleFill('quads')} filter={getMuscleFilter('quads')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('quads')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('quads'); setActiveDrawerMuscle(muscleData['quads']); }} />
<path d="M93 220c-6,3 2,9 4,4 1,-3 -1,-4 -4,-4z" fill={getMuscleFill('quads')} filter={getMuscleFilter('quads')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('quads')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('quads'); setActiveDrawerMuscle(muscleData['quads']); }} />
<path d="M66 221c-2,6 8,7 6,1 0,-2 -3,-3 -6,-1z" fill={getMuscleFill('quads')} filter={getMuscleFilter('quads')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('quads')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('quads'); setActiveDrawerMuscle(muscleData['quads']); }} />
<path d="M69 228c-1,1 0,3 1,6 1,2 2,-4 2,-5 1,-3 0,-1 -3,-1z" fill={getMuscleFill('quads')} filter={getMuscleFilter('quads')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('quads')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('quads'); setActiveDrawerMuscle(muscleData['quads']); }} />
<path d="M91 228c0,0 1,9 2,5 1,-4 2,-4 -1,-5l-1 0z" fill={getMuscleFill('quads')} filter={getMuscleFilter('quads')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('quads')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('quads'); setActiveDrawerMuscle(muscleData['quads']); }} />

/* CALVES (22 paths) */
<path d="M66 278c0,2 4,19 5,19 1,0 -3,-18 -3,-20 0,-1 -7,-40 -8,-27 -1,6 4,20 6,28z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
<path d="M87 260c2,-2 1,-20 0,-20 -2,1 -3,23 0,20z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
<path d="M87 282c0,17 2,-11 2,-12 1,-17 -3,-9 -2,1 0,4 0,7 0,11z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
<path d="M75 260c-3,4 1,31 1,27 0,-5 0,-10 0,-14 0,-2 1,-13 -1,-13z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
<path d="M87 299c0,2 0,11 3,10 1,0 -1,-14 -3,-10z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
<path d="M76 299c-1,-5 -4,9 -2,10 2,2 3,-9 2,-10z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
<path d="M91 300c-1,2 0,9 2,9 1,-2 -1,-10 -2,-9z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
<path d="M72 307c2,-12 -1,-8 -2,1 -1,2 1,2 2,-1z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
<path d="M84 307c1,5 3,0 1,-6 -1,-5 -1,6 -1,6z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
<path d="M79 306c0,-16 -3,2 -1,3 1,1 1,-3 1,-3z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
<path d="M76 311c-3,4 3,6 2,1 0,-1 -1,-1 -2,-1z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
<path d="M69 304c4,-9 -4,4 -4,4 2,3 4,-4 4,-4z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
<path d="M85 312c-2,4 4,4 2,0 0,-1 -1,-1 -2,0z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
<path d="M93 301c2,9 5,9 4,7 0,-1 -4,-8 -4,-7z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
<path d="M71 314c1,3 4,-3 1,-2 -1,0 -1,1 -1,2z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
<path d="M91 315c2,1 0,-6 -1,-3 0,1 0,2 1,3z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
<path d="M68 313c0,2 3,-1 1,-2 -1,0 -1,2 -1,2z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
<path d="M94 314c2,1 0,-4 -1,-2 0,1 1,1 1,2z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
<path d="M96 311c-1,2 3,4 1,0 0,0 -1,-1 -1,0z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
<path d="M65 313c1,2 4,-3 1,-2 0,0 -1,1 -1,2z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
<path d="M100 312c2,1 -3,-4 -2,-1 0,1 1,1 2,1z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
<path d="M63 312c1,1 3,-2 1,-2 -1,1 -1,1 -1,2z" fill={getMuscleFill('calves')} filter={getMuscleFilter('calves')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />

/* BICEPS (21 paths) */
<path d="M146 143c0,-1 -3,-5 -4,-7 -5,-9 -5,-27 -13,-34 -2,-2 -1,10 -1,11 1,7 12,22 16,29 1,1 2,2 2,1z" fill={getMuscleFill('biceps')} filter={getMuscleFilter('biceps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M18 143c1,0 15,-23 16,-25 2,-4 2,-11 1,-16 -1,-3 -6,9 -6,9 -5,12 -3,20 -12,32 -1,1 1,0 1,0z" fill={getMuscleFill('biceps')} filter={getMuscleFilter('biceps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M9 159c2,2 12,4 12,0 0,-2 -1,-5 -1,-10 0,-5 -1,0 -5,2 -2,2 -11,5 -6,8z" fill={getMuscleFill('biceps')} filter={getMuscleFilter('biceps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M155 156c-3,-4 -7,-3 -11,-9 -2,-2 0,5 -1,6 0,6 -5,10 7,8 2,-1 7,-2 5,-5z" fill={getMuscleFill('biceps')} filter={getMuscleFilter('biceps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M133 127c-2,-3 -6,-8 -9,-9 -2,-1 10,15 13,18 0,1 5,9 5,8 0,0 -8,-15 -9,-17z" fill={getMuscleFill('biceps')} filter={getMuscleFilter('biceps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M21 144c0,2 6,-8 6,-8 1,-2 13,-18 13,-18 -1,-1 -7,6 -8,7 -3,4 -7,11 -10,16 0,1 -1,2 -1,3z" fill={getMuscleFill('biceps')} filter={getMuscleFilter('biceps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M127 116c-3,-5 -13,-12 -11,-5 1,3 8,5 11,7 2,1 1,0 0,-2z" fill={getMuscleFill('biceps')} filter={getMuscleFilter('biceps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M35 118c-1,3 2,0 3,-1 3,-2 10,-4 9,-9 -1,-3 -10,7 -11,8 0,1 -1,1 -1,2z" fill={getMuscleFill('biceps')} filter={getMuscleFilter('biceps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M27 145c4,-3 14,-19 16,-24 2,-6 2,-9 -1,-2 -5,9 -9,16 -14,25 0,0 -1,1 -1,1z" fill={getMuscleFill('biceps')} filter={getMuscleFilter('biceps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M136 144c-2,-2 -5,-8 -7,-10 -1,-2 -9,-18 -10,-18 -1,-1 3,9 4,10 1,3 9,15 12,18 1,1 1,1 1,0z" fill={getMuscleFill('biceps')} filter={getMuscleFilter('biceps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M145 146c-1,2 3,4 5,5 15,4 -5,-10 -5,-5z" fill={getMuscleFill('biceps')} filter={getMuscleFilter('biceps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M8 149c-5,4 9,2 10,-2 1,-4 -8,1 -10,2z" fill={getMuscleFill('biceps')} filter={getMuscleFilter('biceps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M138 143c-3,-5 -9,-16 -13,-20 -3,-4 13,23 13,23 1,0 0,-2 0,-3z" fill={getMuscleFill('biceps')} filter={getMuscleFilter('biceps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M25 146c3,-5 8,-12 10,-17 6,-11 3,-7 -2,1 0,0 -11,19 -8,16l0 0z" fill={getMuscleFill('biceps')} filter={getMuscleFilter('biceps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M163 154c-1,-1 -5,-4 -6,-3 -2,3 0,4 3,5 3,2 4,0 3,-2z" fill={getMuscleFill('biceps')} filter={getMuscleFilter('biceps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M0 156c2,2 9,-3 6,-5 -1,0 -7,3 -6,5z" fill={getMuscleFill('biceps')} filter={getMuscleFilter('biceps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M6 159c-1,1 -7,11 -4,9 2,-1 7,-9 4,-9z" fill={getMuscleFill('biceps')} filter={getMuscleFilter('biceps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M54 153c0,0 3,-18 2,-19 -2,-2 -3,19 -2,19z" fill={getMuscleFill('biceps')} filter={getMuscleFilter('biceps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M110 148c0,0 -2,-18 -3,-13 0,1 4,29 3,13z" fill={getMuscleFill('biceps')} filter={getMuscleFilter('biceps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M22 156c5,-6 -1,-13 -1,-3 0,0 0,4 1,3z" fill={getMuscleFill('biceps')} filter={getMuscleFilter('biceps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M140 153c3,11 3,-9 0,-5 -1,1 -1,4 0,5z" fill={getMuscleFill('biceps')} filter={getMuscleFilter('biceps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />

/* FOREARMS (7 paths) */
<path d="M157 170c-1,-1 -3,-8 -5,-9 -3,0 0,5 1,6 0,0 1,3 2,4 1,2 2,1 2,-1z" fill={getMuscleFill('forearms')} filter={getMuscleFilter('forearms')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('forearms')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('forearms'); setActiveDrawerMuscle(muscleData['forearms']); }} />
<path d="M8 172c0,-1 6,-12 3,-11 -2,1 -7,13 -3,11z" fill={getMuscleFill('forearms')} filter={getMuscleFilter('forearms')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('forearms')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('forearms'); setActiveDrawerMuscle(muscleData['forearms']); }} />
<path d="M157 160c-3,0 1,5 2,6 2,4 4,3 2,0 -1,-1 -3,-7 -4,-6z" fill={getMuscleFill('forearms')} filter={getMuscleFilter('forearms')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('forearms')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('forearms'); setActiveDrawerMuscle(muscleData['forearms']); }} />
<path d="M14 171c4,-8 2,-14 -2,-2 -1,2 0,4 2,2z" fill={getMuscleFill('forearms')} filter={getMuscleFilter('forearms')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('forearms')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('forearms'); setActiveDrawerMuscle(muscleData['forearms']); }} />
<path d="M149 171c1,2 3,1 2,-3 -1,-1 -2,-8 -4,-5 -1,0 2,6 2,8z" fill={getMuscleFill('forearms')} filter={getMuscleFilter('forearms')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('forearms')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('forearms'); setActiveDrawerMuscle(muscleData['forearms']); }} />
<path d="M20 162c-1,1 -4,10 -2,8 1,0 4,-9 2,-8z" fill={getMuscleFill('forearms')} filter={getMuscleFilter('forearms')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('forearms')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('forearms'); setActiveDrawerMuscle(muscleData['forearms']); }} />
<path d="M144 169c1,3 2,1 1,-3 0,0 -1,-5 -2,-3 -1,0 1,5 1,6z" fill={getMuscleFill('forearms')} filter={getMuscleFilter('forearms')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('forearms')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('forearms'); setActiveDrawerMuscle(muscleData['forearms']); }} />

/* DELTOIDS_FRONT (9 paths) */
<path d="M45 100c4,-5 7,-15 8,-22 0,-2 -3,-4 -5,-4 -7,4 -5,0 -8,10 -1,3 -4,17 2,18 1,0 2,-1 3,-2z" fill={getMuscleFill('deltoids_front')} filter={getMuscleFilter('deltoids_front')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M125 99c1,-5 -2,-16 -4,-21 -1,-2 -4,-2 -7,-4 -5,0 -4,9 -1,17 1,3 8,16 12,8z" fill={getMuscleFill('deltoids_front')} filter={getMuscleFilter('deltoids_front')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M112 70c1,2 7,5 9,5 1,-3 -7,-14 -8,-16 -5,-5 -14,-9 -7,3 1,2 3,6 6,8z" fill={getMuscleFill('deltoids_front')} filter={getMuscleFilter('deltoids_front')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M110 71c0,-1 -8,-13 -9,-13 -6,-6 -15,-4 -11,-1 2,2 5,3 8,5 3,2 9,7 12,9z" fill={getMuscleFill('deltoids_front')} filter={getMuscleFilter('deltoids_front')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M124 70c-1,-7 -2,-15 -12,-15 -4,0 1,2 3,5 4,5 5,8 8,14 2,4 1,-2 1,-4z" fill={getMuscleFill('deltoids_front')} filter={getMuscleFilter('deltoids_front')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M38 106c1,0 -1,-7 -1,-9 -1,-7 1,-12 4,-18 1,-3 -2,0 -3,4 -2,5 -4,19 0,23 0,0 0,0 0,0z" fill={getMuscleFill('deltoids_front')} filter={getMuscleFilter('deltoids_front')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M127 103c1,-6 0,-22 -5,-25 0,0 7,12 3,27 -1,2 1,0 2,-2z" fill={getMuscleFill('deltoids_front')} filter={getMuscleFilter('deltoids_front')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M39 108c4,-1 8,-6 9,-9 1,-3 -4,2 -4,3 0,0 -8,7 -5,6z" fill={getMuscleFill('deltoids_front')} filter={getMuscleFilter('deltoids_front')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M125 108c-2,-2 -7,-7 -9,-10 -4,-5 2,5 2,6 1,1 6,6 7,4z" fill={getMuscleFill('deltoids_front')} filter={getMuscleFilter('deltoids_front')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />

/* TRAPS (10 paths) */
<path d="M85 59c-3,4 -2,13 -2,18 2,11 23,2 28,-4 -3,-3 -22,-17 -26,-14z" fill={getMuscleFill('traps')} filter={getMuscleFilter('traps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('traps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('traps'); setActiveDrawerMuscle(muscleData['traps']); }} />
<path d="M56 55c-4,3 -10,9 -12,15 -2,4 -1,5 3,3 6,-3 10,-10 12,-15 2,-4 0,-4 -3,-3z" fill={getMuscleFill('traps')} filter={getMuscleFilter('traps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('traps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('traps'); setActiveDrawerMuscle(muscleData['traps']); }} />
<path d="M61 64c6,-4 7,-4 13,-7 5,-3 -8,-6 -13,2 -8,11 -13,17 0,5z" fill={getMuscleFill('traps')} filter={getMuscleFilter('traps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('traps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('traps'); setActiveDrawerMuscle(muscleData['traps']); }} />
<path d="M43 58c-3,4 -4,11 -4,16 2,-1 6,-10 8,-13 1,-1 6,-6 6,-6 0,-2 -7,0 -10,3z" fill={getMuscleFill('traps')} filter={getMuscleFilter('traps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('traps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('traps'); setActiveDrawerMuscle(muscleData['traps']); }} />
<path d="M83 49c-3,18 7,-5 8,-8 2,-7 0,-9 -3,-1 -2,2 -4,6 -5,9z" fill={getMuscleFill('traps')} filter={getMuscleFilter('traps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('traps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('traps'); setActiveDrawerMuscle(muscleData['traps']); }} />
<path d="M75 47c9,19 6,2 1,-6 -1,-3 -2,-5 -4,-7 -1,3 1,10 3,13z" fill={getMuscleFill('traps')} filter={getMuscleFilter('traps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('traps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('traps'); setActiveDrawerMuscle(muscleData['traps']); }} />
<path d="M103 51c4,0 -1,-2 -4,-3 -1,-1 -11,-7 -7,-1 3,3 7,4 11,4z" fill={getMuscleFill('traps')} filter={getMuscleFilter('traps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('traps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('traps'); setActiveDrawerMuscle(muscleData['traps']); }} />
<path d="M64 51c3,-1 6,-3 8,-6 1,-3 -8,3 -9,3 -5,3 -7,3 1,3z" fill={getMuscleFill('traps')} filter={getMuscleFilter('traps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('traps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('traps'); setActiveDrawerMuscle(muscleData['traps']); }} />
<path d="M92 50c-1,-1 -1,-3 -2,-4 -1,2 -2,3 -2,4 1,3 4,2 4,0z" fill={getMuscleFill('traps')} filter={getMuscleFilter('traps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('traps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('traps'); setActiveDrawerMuscle(muscleData['traps']); }} />
<path d="M72 51c6,2 1,-5 1,-5 -1,1 -2,5 -1,5z" fill={getMuscleFill('traps')} filter={getMuscleFilter('traps')} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('traps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('traps'); setActiveDrawerMuscle(muscleData['traps']); }} />

          </g>
        )}

        {/* BACK ANATOMY MODEL (Kept Stylized for now) */}
        {(viewMode === 'both' || viewMode === 'back') && (
          <g id="back-anatomy" transform={viewMode === 'back' ? "translate(110, 30) scale(1.15)" : "translate(200, 30)"}>
            <circle cx="80" cy="22" r="13" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            <rect x="74" y="33" width="12" height="9" fill="#1E293B" rx="2" stroke="#334155" strokeWidth="1" />

            <path
              d="M 60 38 Q 80 32 100 38 L 92 56 Q 80 64 68 56 Z"
              fill={getMuscleFill('traps')}
              filter={getMuscleFilter('traps')}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredMuscle('traps')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => { onSelectMuscle('traps'); setActiveDrawerMuscle(muscleData['traps']); }}
            />

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

            <path
              d="M 72 85 L 88 85 L 86 104 L 74 104 Z"
              fill={getMuscleFill('lower_back')}
              filter={getMuscleFilter('lower_back')}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredMuscle('lower_back')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => { onSelectMuscle('lower_back'); setActiveDrawerMuscle(muscleData['lower_back']); }}
            />

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
            className="absolute top-2 right-4 z-30 p-3.5 rounded-2xl bg-surface/90 backdrop-blur-md border border-purple/40 shadow-glow-primary text-white w-56 space-y-2 pointer-events-none"
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

            <div className="grid grid-cols-2 gap-1.5 text-[9px]">
              <div className="p-1.5 rounded-lg bg-background/50">
                <span className="text-text-muted">Exercises</span>
                <p className="font-bold text-text-primary">{currentHoverMeta.exercisesCount} active</p>
              </div>
              <div className="p-1.5 rounded-lg bg-background/50">
                <span className="text-text-muted">Last Trained</span>
                <p className="font-bold text-text-primary">{currentHoverMeta.lastTrained}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-background/50">
                <span className="text-text-muted">Recovery</span>
                <p className="font-bold text-success">{currentHoverMeta.recovery}%</p>
              </div>
              <div className="p-1.5 rounded-lg bg-background/50">
                <span className="text-text-muted">Weekly Volume</span>
                <p className="font-bold text-purple">{currentHoverMeta.weeklyVolume}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // If embedded inside Today's Workout Card (showFullCard = false)
  // Renders ONLY the SVG graphic with a compact view toggle — no card, no stats, no distribution.
  if (!showFullCard) {
    return (
      <div className={`w-full h-full flex flex-col ${className}`}>
        {/* Compact View Toggle */}
        <div className="flex items-center justify-between pb-2 mb-1 shrink-0">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Muscle Activation</span>
          <div className="flex items-center p-0.5 rounded-lg bg-surface-elevated border border-border-subtle gap-0.5">
            {[
              { id: 'both', label: 'Both' },
              { id: 'front', label: 'Front' },
              { id: 'back', label: 'Back' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all duration-200 ${
                  viewMode === tab.id
                    ? 'bg-purple text-white'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* SVG fills remaining space */}
        <div className="flex-1 min-h-0 flex items-center justify-center overflow-visible">
          {renderSVGGraphic()}
        </div>

        {/* Compact legend */}
        <div className="flex items-center justify-center gap-3 pt-2 shrink-0">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple" />
            <span className="text-[9px] text-text-muted">Primary</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-info" />
            <span className="text-[9px] text-text-muted">Secondary</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-700" />
            <span className="text-[9px] text-text-muted">Inactive</span>
          </div>
        </div>
      </div>
    );
  }

  // Standalone Card Mode (showFullCard = true)
  return (
    <div className={`card p-5 space-y-5 bg-gradient-to-br from-surface to-surface-elevated relative overflow-visible border border-border-subtle ${className}`}>
      {/* TOP HEADER: TITLE & CONTROLS */}
      {!minimalMode && (
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div>
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <FiActivity className="text-purple" />
              Targeted Muscles
            </h3>
            <p className="text-[10px] text-text-muted mt-0.5">Muscles engaged in current routine</p>
          </div>

          {/* Modern Segmented Control: Both | Front | Back */}
          <div className="flex items-center p-1.5 rounded-xl bg-surface-elevated border border-border-subtle gap-1">
            {[
              { id: 'both', label: 'Both' },
              { id: 'front', label: 'Front' },
              { id: 'back', label: 'Back' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${
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
      )}

      {/* CENTER SVG GRAPHIC */}
      <div className="w-full h-[300px]">
        {renderSVGGraphic()}
      </div>

      {/* 4 STATISTIC CHIPS UNDER MODELS */}
      {!minimalMode && (
        <div className="grid grid-cols-4 gap-3 pt-1 border-t border-border-subtle/60">
          <div className="p-2.5 rounded-xl bg-surface-elevated/40 border border-purple/20 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-text-muted font-medium">Primary Muscles</span>
            <p className="text-base font-extrabold font-mono text-purple">{targetInfo.primary.length || 4}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-elevated/40 border border-info/20 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-text-muted font-medium">Secondary</span>
            <p className="text-base font-extrabold font-mono text-info">{targetInfo.secondary.length || 3}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-elevated/40 border border-success/20 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-text-muted font-medium">Recovery Rate</span>
            <p className="text-base font-extrabold font-mono text-success">82%</p>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-elevated/40 border border-border-subtle flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-text-muted font-medium">Active Exercises</span>
            <p className="text-base font-extrabold font-mono text-text-primary">12</p>
          </div>
        </div>
      )}

      {/* EXACT REFERENCE LEGEND */}
      {!minimalMode && (
        <div className="flex items-center justify-center gap-10 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full bg-[#5b21b6]" />
            <span className="text-base font-medium text-text-primary">Primary</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full bg-[#a855f7]" />
            <span className="text-base font-medium text-text-primary">Secondary</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full bg-[#27272a]" />
            <span className="text-base font-medium text-text-primary">Not Trained</span>
          </div>
        </div>
      )}

      {/* WEEKLY SUMMARY: WEEKLY MUSCLE DISTRIBUTION PROGRESS BARS */}
      {!minimalMode && (
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
      )}

      {/* INTERACTIVE CLICK MUSCLE SIDE DRAWER / DETAIL MODAL */}
      {!minimalMode && (
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
      )}
    </div>
  );
}
