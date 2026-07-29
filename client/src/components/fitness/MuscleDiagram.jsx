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

/* HEAD (54 paths) */
<path d="M85 59c-3,4 -2,13 -2,18 2,11 23,2 28,-4 -3,-3 -22,-17 -26,-14z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M80 75c0,-3 1,-17 -3,-17 -4,0 -21,12 -25,15 1,2 26,18 28,2z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M45 100c4,-5 7,-15 8,-22 0,-2 -3,-4 -5,-4 -7,4 -5,0 -8,10 -1,3 -4,17 2,18 1,0 2,-1 3,-2z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M125 99c1,-5 -2,-16 -4,-21 -1,-2 -4,-2 -7,-4 -5,0 -4,9 -1,17 1,3 8,16 12,8z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M104 140c0,9 1,17 2,25 0,18 -1,27 -5,44 0,4 4,-8 4,-9 5,-18 6,-44 1,-62 -1,-5 -2,-1 -2,2z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M112 70c1,2 7,5 9,5 1,-3 -7,-14 -8,-16 -5,-5 -14,-9 -7,3 1,2 3,6 6,8z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M56 55c-4,3 -10,9 -12,15 -2,4 -1,5 3,3 6,-3 10,-10 12,-15 2,-4 0,-4 -3,-3z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M84 101c2,5 11,5 11,2 1,-5 -10,-13 -11,-5 -1,1 0,2 0,3z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M79 97c-6,-9 -16,9 -9,8 6,-1 12,0 9,-8z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M110 71c0,-1 -8,-13 -9,-13 -6,-6 -15,-4 -11,-1 2,2 5,3 8,5 3,2 9,7 12,9z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M61 64c6,-4 7,-4 13,-7 5,-3 -8,-6 -13,2 -8,11 -13,17 0,5z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M43 58c-3,4 -4,11 -4,16 2,-1 6,-10 8,-13 1,-1 6,-6 6,-6 0,-2 -7,0 -10,3z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M124 70c-1,-7 -2,-15 -12,-15 -4,0 1,2 3,5 4,5 5,8 8,14 2,4 1,-2 1,-4z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M85 90c3,2 14,8 10,0 -5,-8 -15,-6 -10,0z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M79 86c-5,-4 -13,4 -11,8 1,2 10,-3 11,-4 1,-2 1,-3 0,-4z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M83 49c-3,18 7,-5 8,-8 2,-7 0,-9 -3,-1 -2,2 -4,6 -5,9z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M75 47c9,19 6,2 1,-6 -1,-3 -2,-5 -4,-7 -1,3 1,10 3,13z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M91 5c0,-2 -2,-4 -4,-4 -6,-2 -5,1 -5,5 -1,6 1,0 7,3 2,0 1,-2 2,-4z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M73 8c0,2 3,-1 6,1 3,1 2,-2 2,-4 0,-4 0,-6 -5,-4 -5,2 -4,3 -3,7z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M57 94c-5,-7 -1,8 2,12 4,5 5,0 2,-6 -2,-2 -3,-4 -4,-6z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M109 93c-1,-2 -2,1 -3,2 -1,2 -7,10 -5,12 2,2 7,-8 7,-10 0,-1 1,-3 1,-4z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M77 39c6,9 4,7 8,1 3,-3 -8,-3 -8,-1z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M103 51c4,0 -1,-2 -4,-3 -1,-1 -11,-7 -7,-1 3,3 7,4 11,4z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M64 51c3,-1 6,-3 8,-6 1,-3 -8,3 -9,3 -5,3 -7,3 1,3z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M38 106c1,0 -1,-7 -1,-9 -1,-7 1,-12 4,-18 1,-3 -2,0 -3,4 -2,5 -4,19 0,23 0,0 0,0 0,0z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M127 103c1,-6 0,-22 -5,-25 0,0 7,12 3,27 -1,2 1,0 2,-2z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M62 93c-11,-9 0,10 2,5 0,-2 -1,-4 -2,-5z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M102 93c-5,7 1,6 3,0 2,-4 -2,-1 -3,0z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M81 30c5,0 8,-2 4,-2 -2,0 -5,0 -7,0 -2,0 -4,0 -2,1 1,1 4,1 5,1z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M72 14c1,3 2,-3 8,0 3,1 -3,-9 -7,-3 -1,1 -1,2 -1,3z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M87 9c-3,0 -6,6 -3,4 5,-2 7,5 7,0 -1,-2 -2,-4 -4,-4z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M61 84c-6,-4 0,6 1,7 2,2 4,-2 -1,-7z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M104 83c-1,0 -6,4 -4,7 3,0 4,-5 4,-7z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M82 26c1,0 7,1 5,-1 -2,-2 -12,0 -11,1 1,1 5,0 6,0z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M73 18c3,1 7,-1 7,-2 0,-1 -7,-1 -7,0 -1,1 -1,2 0,2z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M90 15c-1,0 -7,-1 -7,1 0,1 4,3 6,3 2,-1 2,-3 1,-4z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M71 14c0,-1 2,-9 0,-8 -2,0 -2,5 -2,6 0,1 1,7 2,2l0 0z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M92 14c1,6 2,-4 2,-5 0,-4 -4,-6 -2,4l0 1z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M75 33c3,4 8,4 3,-1 -1,-1 -6,-3 -3,1z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M85 35c3,-1 6,-8 1,-4 -3,2 -4,6 -1,4z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M73 30c-1,-2 -2,-8 -4,-7 -2,2 4,11 5,9 0,0 -1,-2 -1,-2z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M92 25c0,1 -3,7 -3,8 3,-2 7,-10 4,-10 -1,0 -1,2 -1,2z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M56 84c-3,-1 -1,6 2,5 1,-2 -1,-4 -2,-5z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M108 84c-3,-1 -5,7 -1,4 1,-1 2,-2 1,-4z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M71 22c1,2 3,6 4,3 0,-1 0,-3 -1,-4 -2,-1 -4,0 -3,1z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M89 22c-3,6 1,4 3,0 0,-1 -2,-3 -3,0z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M92 50c-1,-1 -1,-3 -2,-4 -1,2 -2,3 -2,4 1,3 4,2 4,0z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M72 51c6,2 1,-5 1,-5 -1,1 -2,5 -1,5z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M78 22c0,-3 0,-3 -3,-2 -2,0 1,3 1,3 1,0 2,0 2,-1z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M88 22c1,-2 0,-3 -2,-3 -2,1 0,8 2,3z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M61 82c1,1 6,4 4,1 -1,-1 -3,-2 -4,-1z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M101 82c-1,-1 -5,4 -2,2 1,0 2,-1 2,-2z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M59 80c-2,-3 -6,1 -2,1 1,1 2,0 2,-1z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />
<path d="M108 79c-2,-1 -5,3 -2,2 2,0 3,-1 2,-2z" fill={getMuscleFill('none')} style={{ filter: getMuscleFilter('none') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('none')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('none'); setActiveDrawerMuscle(muscleData['none']); }} />

/* CHEST (7 paths) */
<path d="M155 156c-3,-4 -7,-3 -11,-9 -2,-2 0,5 -1,6 0,6 -5,10 7,8 2,-1 7,-2 5,-5z" fill={getMuscleFill('chest')} style={{ filter: getMuscleFilter('chest') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M157 170c-1,-1 -3,-8 -5,-9 -3,0 0,5 1,6 0,0 1,3 2,4 1,2 2,1 2,-1z" fill={getMuscleFill('chest')} style={{ filter: getMuscleFilter('chest') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M163 154c-1,-1 -5,-4 -6,-3 -2,3 0,4 3,5 3,2 4,0 3,-2z" fill={getMuscleFill('chest')} style={{ filter: getMuscleFilter('chest') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M157 160c-3,0 1,5 2,6 2,4 4,3 2,0 -1,-1 -3,-7 -4,-6z" fill={getMuscleFill('chest')} style={{ filter: getMuscleFilter('chest') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M149 171c1,2 3,1 2,-3 -1,-1 -2,-8 -4,-5 -1,0 2,6 2,8z" fill={getMuscleFill('chest')} style={{ filter: getMuscleFilter('chest') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M140 153c3,11 3,-9 0,-5 -1,1 -1,4 0,5z" fill={getMuscleFill('chest')} style={{ filter: getMuscleFilter('chest') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />
<path d="M144 169c1,3 2,1 1,-3 0,0 -1,-5 -2,-3 -1,0 1,5 1,6z" fill={getMuscleFill('chest')} style={{ filter: getMuscleFilter('chest') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('chest')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('chest'); setActiveDrawerMuscle(muscleData['chest']); }} />

/* CORE (0 paths) */

/* OBLIQUES (0 paths) */

/* QUADS (0 paths) */

/* CALVES (0 paths) */

/* BICEPS (43 paths) */
<path d="M61 183c2,8 4,19 5,28 1,2 1,7 4,5 1,0 0,-6 0,-7 0,-8 1,-14 2,-22 1,-15 -7,-20 -10,-33 -2,-3 -2,-2 -2,1 -2,11 -2,16 1,28z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M62 233c-2,6 6,34 8,42 0,1 5,25 6,21 1,-1 -4,-15 -4,-18 -2,-12 0,-33 -6,-43 -1,-2 -2,-3 -4,-2z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M73 191c0,2 -4,34 4,27 6,-5 -2,-38 -3,-32 -1,1 -1,4 -1,5z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M78 189c3,11 -2,-11 -2,-11 -4,-12 -9,-25 -14,-37 -2,-4 -1,0 -1,2 1,15 12,31 17,46z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M66 278c0,2 4,19 5,19 1,0 -3,-18 -3,-20 0,-1 -7,-40 -8,-27 -1,6 4,20 6,28z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M9 159c2,2 12,4 12,0 0,-2 -1,-5 -1,-10 0,-5 -1,0 -5,2 -2,2 -11,5 -6,8z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M62 211c1,2 2,5 3,7 2,0 1,-5 0,-7 -2,-21 -10,-52 -4,-7 1,2 1,5 1,7z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M71 150c-2,5 -2,6 1,11 1,3 3,-1 4,-3 2,-4 2,-7 -3,-9 -2,-1 -2,-1 -2,1z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M77 224c-2,8 -6,14 -4,22 0,0 2,-6 2,-8 3,-7 5,-12 4,-19 -1,-4 -2,5 -2,5z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M87 260c2,-2 1,-20 0,-20 -2,1 -3,23 0,20z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M87 282c0,17 2,-11 2,-12 1,-17 -3,-9 -2,1 0,4 0,7 0,11z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M75 260c-3,4 1,31 1,27 0,-5 0,-10 0,-14 0,-2 1,-13 -1,-13z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M61 229c4,-1 6,6 5,0 0,-1 -6,-20 -5,-14 0,2 -1,12 0,14z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M66 221c-2,6 8,7 6,1 0,-2 -3,-3 -6,-1z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M8 149c-5,4 9,2 10,-2 1,-4 -8,1 -10,2z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M87 299c0,2 0,11 3,10 1,0 -1,-14 -3,-10z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M76 299c-1,-5 -4,9 -2,10 2,2 3,-9 2,-10z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M8 172c0,-1 6,-12 3,-11 -2,1 -7,13 -3,11z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M0 156c2,2 9,-3 6,-5 -1,0 -7,3 -6,5z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M14 171c4,-8 2,-14 -2,-2 -1,2 0,4 2,2z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M6 159c-1,1 -7,11 -4,9 2,-1 7,-9 4,-9z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M91 300c-1,2 0,9 2,9 1,-2 -1,-10 -2,-9z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M72 307c2,-12 -1,-8 -2,1 -1,2 1,2 2,-1z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M22 156c5,-6 -1,-13 -1,-3 0,0 0,4 1,3z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M66 147c1,8 6,1 2,-2 -1,-1 -2,1 -2,2z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M84 307c1,5 3,0 1,-6 -1,-5 -1,6 -1,6z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M79 306c0,-16 -3,2 -1,3 1,1 1,-3 1,-3z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M20 162c-1,1 -4,10 -2,8 1,0 4,-9 2,-8z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M69 228c-1,1 0,3 1,6 1,2 2,-4 2,-5 1,-3 0,-1 -3,-1z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M76 311c-3,4 3,6 2,1 0,-1 -1,-1 -2,-1z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M69 304c4,-9 -4,4 -4,4 2,3 4,-4 4,-4z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M85 312c-2,4 4,4 2,0 0,-1 -1,-1 -2,0z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M91 228c0,0 1,9 2,5 1,-4 2,-4 -1,-5l-1 0z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M93 301c2,9 5,9 4,7 0,-1 -4,-8 -4,-7z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M71 314c1,3 4,-3 1,-2 -1,0 -1,1 -1,2z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M91 315c2,1 0,-6 -1,-3 0,1 0,2 1,3z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M65 144c2,3 0,-4 -2,-4 0,2 1,3 2,4z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M68 313c0,2 3,-1 1,-2 -1,0 -1,2 -1,2z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M94 314c2,1 0,-4 -1,-2 0,1 1,1 1,2z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M96 311c-1,2 3,4 1,0 0,0 -1,-1 -1,0z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M65 313c1,2 4,-3 1,-2 0,0 -1,1 -1,2z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M100 312c2,1 -3,-4 -2,-1 0,1 1,1 2,1z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />
<path d="M63 312c1,1 3,-2 1,-2 -1,1 -1,1 -1,2z" fill={getMuscleFill('biceps')} style={{ filter: getMuscleFilter('biceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('biceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('biceps'); setActiveDrawerMuscle(muscleData['biceps']); }} />

/* FOREARMS (0 paths) */

/* DELTOIDS_FRONT (35 paths) */
<path d="M101 156c-3,8 -10,19 -10,27 1,8 2,14 2,23 0,1 -1,10 0,11 2,0 3,0 3,-2 2,-13 4,-23 7,-36 2,-8 2,-18 0,-26 -1,-3 -2,2 -2,3z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M84 123c-1,5 -2,20 1,24 3,4 5,-2 6,-4 1,-4 6,-23 2,-24 -4,-2 -7,1 -9,4z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M69 121c-1,4 2,28 8,27 5,0 3,-20 2,-23 -2,-7 -9,-8 -10,-4z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M98 234c-7,7 -5,34 -7,45 0,3 -4,17 -4,17 2,2 5,-16 6,-17 2,-9 4,-19 6,-28 1,-2 5,-21 -1,-17z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M58 114c-1,4 -2,15 1,18 1,2 8,9 8,3 0,-3 0,-8 -1,-10 0,-5 0,-13 -5,-15 -3,-2 -3,2 -3,4z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M100 111c-3,6 -3,14 -4,20 0,5 1,8 6,4 6,-5 4,-14 4,-21 -1,-4 -2,-6 -6,-3z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M55 181c0,5 4,25 7,29 0,1 -2,-9 -2,-11 -4,-22 -3,-33 -1,-55 1,-10 -1,-12 -3,0 -2,15 -2,22 -1,37z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M88 219c5,1 2,-30 1,-34 -1,-6 -10,33 -1,34z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M18 143c1,0 15,-23 16,-25 2,-4 2,-11 1,-16 -1,-3 -6,9 -6,9 -5,12 -3,20 -12,32 -1,1 1,0 1,0z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M100 145c-4,10 -16,38 -16,47 0,0 3,-8 4,-11 4,-10 16,-30 14,-40 0,-4 -2,3 -2,4z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M83 112c1,6 6,6 10,5 6,-1 0,-14 -7,-10 -2,1 -2,3 -3,5z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M68 115c2,1 9,4 11,2 2,-2 3,-14 -8,-10 -3,1 -4,4 -3,8z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M102 247c-2,2 -8,36 -9,43 -2,9 -1,11 1,0 3,-12 8,-26 9,-37 0,-1 1,-5 -1,-6z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M104 181c-1,4 -10,38 -6,37 3,-1 7,-32 6,-37l0 0z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M77 158c-4,8 -4,8 -1,17 2,4 2,2 3,-2 0,-3 2,-19 0,-19 0,0 -1,3 -2,4z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M83 157c0,3 2,31 5,13 2,-7 -1,-9 -4,-15 -1,-3 -1,0 -1,2z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M86 154c1,3 3,12 6,7 1,-4 3,-8 0,-12 -1,-2 -6,1 -6,5z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M84 225c1,8 4,12 6,20 0,2 1,-5 1,-5 -1,-6 -4,-13 -6,-19 -2,-8 -1,2 -1,4z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M76 239c-1,2 -2,22 1,22 3,-1 1,-19 -1,-22z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M133 127c-2,-3 -6,-8 -9,-9 -2,-1 10,15 13,18 0,1 5,9 5,8 0,0 -8,-15 -9,-17z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M21 144c0,2 6,-8 6,-8 1,-2 13,-18 13,-18 -1,-1 -7,6 -8,7 -3,4 -7,11 -10,16 0,1 -1,2 -1,3z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M103 213c-1,1 -8,21 -5,18 5,-5 4,0 5,-6 0,-2 0,-9 0,-12z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M127 116c-3,-5 -13,-12 -11,-5 1,3 8,5 11,7 2,1 1,0 0,-2z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M35 118c-1,3 2,0 3,-1 3,-2 10,-4 9,-9 -1,-3 -10,7 -11,8 0,1 -1,1 -1,2z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M27 145c4,-3 14,-19 16,-24 2,-6 2,-9 -1,-2 -5,9 -9,16 -14,25 0,0 -1,1 -1,1z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M136 144c-2,-2 -5,-8 -7,-10 -1,-2 -9,-18 -10,-18 -1,-1 3,9 4,10 1,3 9,15 12,18 1,1 1,1 1,0z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M93 220c-6,3 2,9 4,4 1,-3 -1,-4 -4,-4z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M138 143c-3,-5 -9,-16 -13,-20 -3,-4 13,23 13,23 1,0 0,-2 0,-3z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M25 146c3,-5 8,-12 10,-17 6,-11 3,-7 -2,1 0,0 -11,19 -8,16l0 0z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M39 108c4,-1 8,-6 9,-9 1,-3 -4,2 -4,3 0,0 -8,7 -5,6z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M125 108c-2,-2 -7,-7 -9,-10 -4,-5 2,5 2,6 1,1 6,6 7,4z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M54 153c0,0 3,-18 2,-19 -2,-2 -3,19 -2,19z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M110 148c0,0 -2,-18 -3,-13 0,1 4,29 3,13z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M94 147c0,3 0,3 1,3 1,0 3,-3 1,-4 -1,-1 -2,0 -2,1 0,0 0,0 0,0z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />
<path d="M98 144c0,0 2,-1 2,-3 -1,0 -3,3 -2,3z" fill={getMuscleFill('deltoids_front')} style={{ filter: getMuscleFilter('deltoids_front') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_front')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_front'); setActiveDrawerMuscle(muscleData['deltoids_front']); }} />

/* TRAPS (2 paths) */
<path d="M146 143c0,-1 -3,-5 -4,-7 -5,-9 -5,-27 -13,-34 -2,-2 -1,10 -1,11 1,7 12,22 16,29 1,1 2,2 2,1z" fill={getMuscleFill('traps')} style={{ filter: getMuscleFilter('traps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('traps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('traps'); setActiveDrawerMuscle(muscleData['traps']); }} />
<path d="M145 146c-1,2 3,4 5,5 15,4 -5,-10 -5,-5z" fill={getMuscleFill('traps')} style={{ filter: getMuscleFilter('traps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('traps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('traps'); setActiveDrawerMuscle(muscleData['traps']); }} />

          </g>
        )}

        {/* BACK ANATOMY MODEL (Kept Stylized for now) */}
        {(viewMode === 'both' || viewMode === 'back') && (
          <g id="back-anatomy" transform={viewMode === 'back' ? "translate(110, 30) scale(1.15)" : "translate(200, 30)"}>
            <g transform="scale(0.198) translate(-842, -298)">
            {/* HAIR */}
            <path d="M1138.38 168.39q-.49 4.68-3.37 8.55-.31.41-.81.56c-9.91 3.11-15.97 9.67-20.28 18.94-2.21 4.75-5.25 12.39-11.48 12.3q-18.46-.25-36.94.25-5.35.14-7.43-3.53c-6.78-11.97-10.46-22.53-23.52-27.48-5.05-1.92-5.38-6.47-6.41-11.53q-6.64-26.16 4.43-48.88c8.13-16.7 34.61-21.41 51.58-21.04 4.89.11 9.69-.11 14.42.85 18.79 3.8 33.17 8.5 39.34 28.66q6.38 20.88.47 42.35z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            {/* HEAD */}
            <path d="M1028.14 166.45c1.03 5.06 1.36 9.61 6.41 11.53 13.06 4.95 16.74 15.51 23.52 27.48 1.387 2.447 3.863 3.623 7.43 3.53a910.025 910.025 0 0136.94-.25c6.23.09 9.27-7.55 11.48-12.3 4.31-9.27 10.37-15.83 20.28-18.94.333-.1.603-.287.81-.56 1.92-2.58 3.043-5.43 3.37-8.55l2.31-1.51a.977.977 0 01.99-.08c11.92 5.42-3.35 35.31-8.21 42.45-.761 1.11-2.423 1.028-3.06-.15l-1.26-2.32c-.133-.253-.32-.297-.56-.13-.34.24-.48.61-.42 1.11.86 7.64.75 16.87-2.96 23.31-.173.3.839.041-3.7 4.71-3.34 3.436-74.18 3.78-75.48-1.38a1.465 1.465 0 00-.55-.82c-4.15-2.97-6.07-7.95-6.16-12.39-.03-1.68.18-14.28-.53-14.63-.207-.1-.33-.037-.37.19-.3 1.553-1.183 2.597-2.65 3.13a.951.951 0 01-1.07-.32c-7.29-9.56-12.32-22.18-12.97-33.54-.34-6.04 1.797-9.23 6.41-9.57zm29.95 61.71c.173 14.187 18.967 14.703 19.1-1.37.03-4.05-.38-6.54-4.68-7.3-4.2-.75-11.87-1.47-13.85 2.91-.413.92-.603 2.84-.57 5.76zm31.71-3.35c.36 19.647 18.59 14.82 18.87 5.94.13-3.9 1.32-9.43-2.88-10.79-4.25-1.38-16.12-2.54-15.99 4.85z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            {/* NECK */}
            <path d="M1022.74 290.63a.62.61 25.9 01-.36-1.03q1.71-1.83 4.11-3.11c8.19-4.35 19.4-8.3 23.38-17.48q8.48-19.57 8.22-40.85-.05-4.38.57-5.76c1.98-4.38 9.65-3.66 13.85-2.91 4.3.76 4.71 3.25 4.68 7.3q-.2 24.11-.88 48.2c-.12 4.25 1.6 15.84-4.88 16.32-14.57 1.08-32.6 1.81-48.69-.68z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            <path d="M1095.75 291.46c-4.3-.25-4.9-3.99-4.95-7.71q-.46-29.47-1-58.94c-.13-7.39 11.74-6.23 15.99-4.85 4.2 1.36 3.01 6.89 2.88 10.79-.28 8.88 5.15 41.1 15.32 46.78q8.6 4.81 17.27 9.51 1.97 1.07 3.26 2.36a.8.79 63.6 01-.45 1.35c-16.12 2.17-33.78 1.56-48.32.71z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            {/* TRAPEZIUS */}
            <path d="M1071.06 308.94c5.6 4.92 6.96 17.83 7.43 24.88q1.5 22.3.93 44.68-1.2 46.76-5.66 94a.57.56 3.7 01-.59.51q-.68-.03-.94-1.01-4.29-15.9-9.79-25.19c-10.24-17.31-18.8-31.84-25.59-49.4-10.19-26.38-15.6-54.28-26.46-80.58q-3.07-7.43-7.61-14.07-.3-.43.2-.6 12.47-4.28 25.48-4.85c5.54-.25 12.15.86 18.32 1.41 9.7.87 16.77 3.6 24.28 10.22z" fill={getMuscleFill('traps')} style={{ filter: getMuscleFilter('traps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('traps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('traps'); setActiveDrawerMuscle(muscleData['traps']); }} />
            <path d="M1163.98 302.12a.43.43 0 01.22.65q-7.08 10.77-11.41 23.37c-10.53 30.61-17.8 62.94-31.3 91.07-5.11 10.64-15.17 25.22-20.12 36.26q-4.08 9.08-6.59 18.83a.77.77 0 01-1.51-.12q-4.27-45.15-5.52-90.99c-.56-20.28-.74-39.92 2.75-60.43 1.04-6.13 2.77-9.98 7.85-13.85 9.8-7.48 18.02-7.73 30.1-9.11 12.02-1.39 23.92.4 35.53 4.32z" fill={getMuscleFill('traps')} style={{ filter: getMuscleFilter('traps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('traps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('traps'); setActiveDrawerMuscle(muscleData['traps']); }} />
            {/* DELTOIDS */}
            <path d="M980.66 319.58c.19.14.55.19.65.32a.8.8 0 01-.16 1.15c-6.78 4.75-15.26 9.77-20.03 15.58-6.41 7.78-8.76 16.96-9.44 27.04-.39 5.92-1.68 9.5-5.59 13.43-10.02 10.08-19.04 16.47-31.14 20.41q-.75.25-.75-.55.19-18.4-.09-36.3-.14-9.4 1.07-14.22c4.04-16.07 22.8-33.85 39.68-35.64 9.99-1.06 17.34 2.46 25.8 8.78z" fill={getMuscleFill('deltoids_rear')} style={{ filter: getMuscleFilter('deltoids_rear') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_rear')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_rear'); setActiveDrawerMuscle(muscleData['deltoids_rear']); }} />
            <path d="M1227.3 316.44c14.62 9.44 25.48 21.03 25.46 39.51q-.02 20.56-.01 41.37a.37.37 0 01-.51.35c-5.08-2.06-10.41-3.98-14.9-6.97-7.84-5.24-21.14-14.95-21.77-24.95-.69-10.75-2.81-20.85-9.76-29.25-4.68-5.65-12.96-10.58-19.6-15.26q-1.23-.87.01-1.71c4.6-3.13 9.91-6.78 15.25-7.98q13.58-3.03 25.83 4.89z" fill={getMuscleFill('deltoids_rear')} style={{ filter: getMuscleFilter('deltoids_rear') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('deltoids_rear')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('deltoids_rear'); setActiveDrawerMuscle(muscleData['deltoids_rear']); }} />
            {/* UPPERBACK */}
            <path d="M987.06 381.44c-8.48-5.06-14.14-13.28-18.82-22.92q-5.3-10.92-6.46-14.04c-1.49-4.01 35.14-19.22 39.61-20.97q2.75-1.08 4.33-.72c4.33.96 6.61 9.96 7.46 13.7q5.43 23.89 14.65 55.74.78 2.7-.88 4.39c-5.37 5.5-34.69-12.08-39.89-15.18z" fill={getMuscleFill('lats')} style={{ filter: getMuscleFilter('lats') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('lats')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('lats'); setActiveDrawerMuscle(muscleData['lats']); }} />
            <path d="M1017.44 583.31q-9.11-9.57-16.97-22.03-2.28-3.62-2.91-7.25c-3.28-18.82-5.77-38.04-10.52-56.55-3.53-13.73-4.74-25.19-6.61-41.43-.85-7.35-5.67-13.34-8.22-18.75q-4.93-10.47-6.44-22.88-.33-2.72 1.89-1.11c7.25 5.27 16.36 6.16 26.91 7.56 8.86 1.19 23.41-3.18 28.94-10.76 3.34-4.58 4.7-6.5 8.86-8.77a.67.66-26.4 01.92.3q10.02 21.8 19.93 43.78c2.56 5.69 12.11 15.88 10.77 21.83-3.65 16.09-9.88 31.96-16.24 47.13-9.72 23.21-18.61 46.72-27.2 70.36q-.24.67-.88.35-1.03-.52-2.23-1.78z" fill={getMuscleFill('lats')} style={{ filter: getMuscleFilter('lats') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('lats')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('lats'); setActiveDrawerMuscle(muscleData['lats']); }} />
            <path d="M1017.71 404.73c-23.86 13.25-54.31 7.11-60.45-22.75-1.2-5.81-2.5-15.84.64-20.55 3.63-5.44 7.17 4.18 8.17 6.14 7.71 15.14 31.62 29.16 48.2 31.13q1.84.21 5.26 2.06.4.21.26.64-.86 2.65-2.08 3.33z" fill={getMuscleFill('lats')} style={{ filter: getMuscleFilter('lats') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('lats')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('lats'); setActiveDrawerMuscle(muscleData['lats']); }} />
            <path d="M1141.45 397.63a2.17 2.14-3.6 01-1.88-1.64q-.71-2.97.18-5.95 8.74-29.19 11.75-43.29c1.73-8.11 3.07-16.77 6.94-22.08 1.92-2.62 4.28-2.27 7.19-1.15q20.52 7.9 39.09 18.77a1.37 1.36 25.9 01.58 1.67c-6.05 15.46-12.98 30.84-28.43 39.45-9.45 5.26-25.83 15.17-35.42 14.22z" fill={getMuscleFill('lats')} style={{ filter: getMuscleFilter('lats') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('lats')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('lats'); setActiveDrawerMuscle(muscleData['lats']); }} />
            <path d="M1149.69 404.8q-2.04-1.15-2.45-3.5-.09-.53.41-.75c4.64-2.04 9.78-2.51 14.63-3.87 11.01-3.1 22.03-10.83 30.34-18.57q6.33-5.89 7.58-8.93c1.02-2.49 3.79-9.5 7-9.46q.52.01.87.39 2.71 3.01 2.81 7.2c.33 13.77-2.24 26.93-13.26 35.95-13.88 11.36-33.12 9.94-47.93 1.54z" fill={getMuscleFill('lats')} style={{ filter: getMuscleFilter('lats') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('lats')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('lats'); setActiveDrawerMuscle(muscleData['lats']); }} />
            <path d="M1161.19 419.98c6.1 1.57 11.6.99 17.75.06 8.36-1.27 14.83-2.76 21.34-7.27a.54.53 74.1 01.84.47q-.64 11.88-5.76 22.85c-2.42 5.2-6.64 10.84-8.04 16.67q-1.02 4.24-1.43 8.92-1.64 18.72-6.34 37.47c-4.73 18.91-7.13 38.67-10.8 57.85q-.24 1.24-2.2 4.3c-4.57 7.14-12.22 19.43-19.34 23.88a.44.43-25.6 01-.64-.22c-8.26-22.57-16.6-45.11-25.91-67.23-6.67-15.85-13.27-32.14-17.27-48.42q-1.58-6.41 2.91-12.01 5.21-6.51 8.57-14.14 9.25-21 19.01-41.64a.47.47 0 01.65-.21q6.17 3.37 9.51 9.64c2.45 4.6 12.22 7.75 17.15 9.03z" fill={getMuscleFill('lats')} style={{ filter: getMuscleFilter('lats') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('lats')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('lats'); setActiveDrawerMuscle(muscleData['lats']); }} />
            {/* TRICEPS */}
            <path d="M931.03 442.29c-2.01 2.57-6.52 9.71-10.12 9.17q-.52-.08-.8-.52-1.35-2.09-1.84-4.44c-2.25-10.87-3.28-22.88 1.35-33.38 5.45-12.33 18.27-23.68 29.61-31.2a.47.46 68.7 01.71.32l6.42 38.52q.09.54-.26.97c-.47.58-1.12 1.52-1.71 1.94q-9.11 6.58-18.08 13.36-2.9 2.2-5.28 5.26z" fill={getMuscleFill('triceps')} style={{ filter: getMuscleFilter('triceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('triceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('triceps'); setActiveDrawerMuscle(muscleData['triceps']); }} />
            <path d="M958.15 427.11a.41.41 0 01.55.27q4.44 16.16-2.23 31.41-3.37 7.73-5.91 19.98c-1.51 7.28-8.93 12.21-11.81 18.82-2.42 5.56-2.41 12.5-3.51 16.66-2.14 8.06-8.51 14.15-13.91 20.13a.93.93 0 01-1.54-.25q-.57-1.3-.75-2.89c-1.93-16.91 2.52-33.52 5.71-49.99 2.16-11.21-1.54-24.15 9.68-34.59q9.54-8.86 19.55-17.23c1.3-1.08 2.7-1.72 4.17-2.32z" fill={getMuscleFill('triceps')} style={{ filter: getMuscleFilter('triceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('triceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('triceps'); setActiveDrawerMuscle(muscleData['triceps']); }} />
            <path d="M903.57 519.67a1.84 1.82-5.4 01-1.12-.92q-3.54-6.97-3.68-15.19c-.37-21.2 3.8-42.53 9.5-63.44q.33-1.23.92-.1 4.64 8.78 8.6 18.67c2.88 7.21 4.19 12.98 1.88 20.57q-6.07 19.96-14.02 39.23-.65 1.58-2.08 1.18z" fill={getMuscleFill('triceps')} style={{ filter: getMuscleFilter('triceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('triceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('triceps'); setActiveDrawerMuscle(muscleData['triceps']); }} />
            <path d="M1213.94 424.56q-2.02-1.5-3.08-3.02-.31-.46-.22-1 3.32-19.22 6.42-38.46.09-.56.56-.25 14.9 9.82 24.8 22.71c9.8 12.75 9.72 30.37 5.41 45.13a2.62 2.62 0 01-3.76 1.57c-3.26-1.77-6.22-6.71-8.62-9.67-5.24-6.46-14.75-12-21.51-17.01z" fill={getMuscleFill('triceps')} style={{ filter: getMuscleFilter('triceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('triceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('triceps'); setActiveDrawerMuscle(muscleData['triceps']); }} />
            <path d="M1246.2 534.5q-.95-.3-1.75-1.22c-4.65-5.4-9.13-9.88-11.46-15.51-2.96-7.13-1.37-15.5-5.64-22.09-4.06-6.26-8.72-9.91-10.89-17.58-1.62-5.68-2.81-11.46-4.97-17.02-4.56-11.69-6.45-20.86-3.33-33.56a.59.58-74 01.75-.42q1.69.56 3.22 1.79 11.23 9.08 21.54 19.18c5.39 5.28 6.92 10.13 7.24 18.16.9 22.52 10.62 44.97 6.59 67.49a1.01 1 13.9 01-1.3.78z" fill={getMuscleFill('triceps')} style={{ filter: getMuscleFilter('triceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('triceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('triceps'); setActiveDrawerMuscle(muscleData['triceps']); }} />
            <path d="M1258.43 439.96q2.01 5.38 3.1 10.68c3.58 17.36 7.13 34.77 6.89 52.61q-.11 8.3-3.94 15.61a1.61 1.6 33.4 01-2.44.5c-1.45-1.19-1.9-3.58-2.43-4.94q-9.23-23.41-13.19-38.15c-2.63-9.81 6.82-27.63 11.53-36.35q.28-.5.48.04z" fill={getMuscleFill('triceps')} style={{ filter: getMuscleFilter('triceps') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('triceps')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('triceps'); setActiveDrawerMuscle(muscleData['triceps']); }} />
            {/* FOREARM */}
            <path d="M878.44 534.38a.15.15 0 01.18-.13c.47.12 6.68 15.77 7.07 17.22q6.66 24.73 5.52 50.29c-.4 8.9-3.45 17.35-6.64 25.55-7.94 20.38-17.41 41.88-29.59 60.09a1.04 1.02-54.2 01-1.49.25c-.34-.26.37-1.45.47-1.83q5.58-20.8 8.97-42.08 8.65-54.15 15.51-109.36z" fill={getMuscleFill('forearms')} style={{ filter: getMuscleFilter('forearms') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('forearms')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('forearms'); setActiveDrawerMuscle(muscleData['forearms']); }} />
            <path d="M893 518.93a.39.38 24.6 01.69-.25q5.97 7.83 13.11 15.27c8.08 8.4 1.41 28.73-5.88 37.12a1.05 1.05 0 01-1.63-.05c-6.09-7.93-5.41-18.74-4.97-28.44.36-8.12-.76-15.7-1.32-23.65z" fill={getMuscleFill('forearms')} style={{ filter: getMuscleFilter('forearms') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('forearms')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('forearms'); setActiveDrawerMuscle(muscleData['forearms']); }} />
            <path d="M869.06 547.19c2.16.36 1.67 6.21 1.57 7.8q-2.54 38.84-9.11 77.16c-3.04 17.71-8.47 41.3-22.09 54.09a.38.38 0 01-.62-.41c14.51-40.44 19-84.26 26.8-126.31q.9-4.88 1.48-10.82.18-1.81 1.97-1.51z" fill={getMuscleFill('forearms')} style={{ filter: getMuscleFilter('forearms') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('forearms')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('forearms'); setActiveDrawerMuscle(muscleData['forearms']); }} />
            <path d="M864.24 682.58q15.09-28.18 25.12-58.55c8.14-24.63 13.67-42.4 20.79-60.35q3.31-8.37 12.08-9.63c1.35-.2 3.68-.75 4.86.21q1.13.93.61 2.3-5.8 15.45-12.04 29.88c-5.79 13.39-14.92 28.68-20.32 40.14-6.12 13-28.07 59.18-31.64 56.64a.21.21 0 01.03-.36q.15-.07.34-.13.12-.04.17-.15z" fill={getMuscleFill('forearms')} style={{ filter: getMuscleFilter('forearms') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('forearms')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('forearms'); setActiveDrawerMuscle(muscleData['forearms']); }} />
            <path d="M1272.99 519.43c.27-.33.33-.75.75-1.05a.32.32 0 01.5.29c-.7 7.22-1.77 14.33-1.66 21.54.13 8.94 2.13 24-5.35 31.17q-.37.35-.73 0c-7.63-7.55-14.2-28.29-6.52-36.92q6.6-7.41 13.01-15.03z" fill={getMuscleFill('forearms')} style={{ filter: getMuscleFilter('forearms') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('forearms')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('forearms'); setActiveDrawerMuscle(muscleData['forearms']); }} />
            <path d="M1312.82 688.04c-4.78-6.01-7.2-10.8-11.76-19.56q-12.39-23.79-21.03-47.53c-4.86-13.36-5.22-26.17-3.83-40.19q1.13-11.5 2.69-19.53 2.72-13.98 9.59-26.79a.17.17 0 01.32.06q7.26 63.12 17.22 120.49 2.43 14.04 7.03 30.55c.22.79.74 1.33.36 2.4a.34.34 0 01-.59.1z" fill={getMuscleFill('forearms')} style={{ filter: getMuscleFilter('forearms') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('forearms')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('forearms'); setActiveDrawerMuscle(muscleData['forearms']); }} />
            <path d="M1296.52 558.51c-.22-2.94-1.44-10.25 2-12.04a.62.61-18.4 01.89.44q6.25 35.69 12.21 71.07c3.88 23 8.77 46.2 16.73 68.19a.29.29 0 01-.47.31c-11.67-10.67-18.09-31.15-20.89-45.98q-7.27-38.55-10.47-81.99z" fill={getMuscleFill('forearms')} style={{ filter: getMuscleFilter('forearms') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('forearms')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('forearms'); setActiveDrawerMuscle(muscleData['forearms']); }} />
            <path d="M1303.5 683.6c-2.89-.66-10.16-13.21-12.11-17.02-8.8-17.21-16.92-34.81-25.84-51.89-5.36-10.27-10.98-20.49-15.39-30.95q-5.86-13.86-11.07-27.8a1.63 1.62 79.5 011.5-2.2c13.02-.16 15.5 7.18 19.65 18.81q9.04 25.33 17.43 50.89 9.65 29.37 23.82 56.84.87 1.69 2.13 3.12.24.28-.12.2z" fill={getMuscleFill('forearms')} style={{ filter: getMuscleFilter('forearms') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('forearms')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('forearms'); setActiveDrawerMuscle(muscleData['forearms']); }} />
            {/* HANDS */}
            <path d="M789.41 726.84c3.98-6.79 9.89-14.6 16.56-20.14a.31.31 0 01.48.35c-4.39 11.06-5.38 21.94-14.02 30.72-5.82 5.93-10.7 9.81-19.04 8.57q-.55-.08-.59-.63c-.24-3.07-.26-7.29 3.1-8.85 4.82-2.26 10.72-5.28 13.51-10.02z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            <path d="M807.27 745.31c17.61 3.49 2.75 13.52-.73 18.99q-10.05 15.82-21.86 30.37-1.56 1.92-2.52-.58a2.41 2.33-55.4 01-.16-.96q.2-5.26 2.75-9.71c6.94-12.09 13.12-24.52 19.72-36.79q.91-1.7 2.8-1.32z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            <path d="M819.3 744.82c-7.79-6.06-14.51-12.4-11.88-23.38 3.07-12.83 14.66-20.7 25.14-26.38 9.57-5.18 37.61-.75 37.6 13.68q-.01 16.24-3.67 31.99c-2.38 10.26-4.49 16.44-16.87 16.3-10.71-.13-21.93-5.7-30.32-12.21z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            <path d="M827.99 758.27a2.08 2.07 26.6 01.91 2.73q-10.47 22.03-19.66 45.04-2.25 5.63-8.23 6.74a1.45 1.44 84.3 01-1.7-1.4q-.1-4.29 1.51-8.31 7.3-18.34 13.86-36.96c.74-2.1 1.53-6.08 2.97-8.96q.26-.5.82-.57 5.05-.64 9.52 1.69z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            <path d="M841.68 762.32a.76.75-79.1 01.6.89q-4.51 23.14-9.28 45.87c-.73 3.49-2.09 5.73-5.85 5.43q-.52-.04-.61-.56-.74-4.54-.32-7.21 2.89-18.57 5.59-37.18.38-2.65 1.67-8.22.13-.54.68-.44l7.52 1.42z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            <path d="M854.75 799.53a.78.78 0 01-1.37-.02q-.91-1.75-1.15-4.29-1.62-16.58-1.2-33.25a.84.84 0 01.61-.78l7.09-1.93q.59-.16.56.45-.58 14.77-1.12 29.56c-.14 4.06-1.54 6.86-3.42 10.26z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            <path d="M1336.39 751.96c-8.72 4.49-29.38 10.28-33.61-3.6q-5.68-18.65-5.83-38.24c-.06-7.59 4.01-11.75 11.09-14.08 8.85-2.92 19.02-5.3 27.54-.35 8.74 5.09 18.39 11.28 22.45 21.01 3.05 7.3 3.34 13.66-1.78 20.01-5.21 6.47-12.49 11.45-19.86 15.25z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            <path d="M1374.32 737.5c-8.05-8.14-9.61-19.67-13.85-30.75a.22.22 0 01.35-.24q10.3 8.96 17.1 20.77c2.57 4.47 9.08 7.59 13.57 9.79 3.11 1.52 2.96 5.9 2.71 8.73q-.05.52-.57.59c-8.87 1.17-13.48-2.98-19.31-8.89z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            <path d="M1383.76 795.45c-.59-.21-.96-.17-1.39-.68-8.84-10.3-15.85-21.5-23.44-32.41-2.81-4.02-8.81-7.64-7.45-13.14q.15-.6.7-.84l7.85-3.44q.66-.29 1.13.25 2.36 2.73 4.17 6.49 7.36 15.23 16.89 31.47c2.33 3.96 3.04 7.59 2.32 11.85a.58.58 0 01-.78.45z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            <path d="M1365.79 812.62c-2.7-.28-6.42-2.66-7.49-5.33q-8.74-21.76-19.85-45.74c-2.12-4.58 6.55-5.17 9.12-5.21 1.8-.03 1.93.71 2.38 2.18q5.72 18.34 15.35 42.12c.74 1.84 4.81 12.43.49 11.98z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            <path d="M1308.16 759.17l7.44 2.1q.23.07.24.31.75 16.26-.86 32.41-.3 3-1.25 5.48a.79.79 0 01-1.42.12q-3.9-6.58-3.82-13.9.16-13.07-.83-26.11-.05-.57.5-.41z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            <path d="M1340.07 814.35c-2.7.82-4.99-1.16-5.54-3.71q-5.06-23.49-9.82-47.47a.77.76-10.7 01.62-.9l7.52-1.38q.59-.11.73.47c2.08 8.53 3.26 19.85 4.22 25.75q2.09 12.92 3.19 21.14.34 2.54-.33 5.46a.86.84 88.4 01-.59.64z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            {/* LOWERBACK */}
            <path d="M986.76 627.1c-3.13-13.13-7.31-49.77 7.27-58.07 2.4-1.37 4.8-.82 6.7 1.29 6.15 6.8 16.22 18.56 18.77 28.15a1.35 1.3 52.6 01-.11.98c-2.51 4.53-9.96 8.09-15.83 11.36q-5.47 3.06-11.33 10.52c-1.23 1.56-2.6 4.3-4.5 6.06a.59.58-28.2 01-.97-.29z" fill={getMuscleFill('lower_back')} style={{ filter: getMuscleFilter('lower_back') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('lower_back')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('lower_back'); setActiveDrawerMuscle(muscleData['lower_back']); }} />
            <path d="M1023.15 607.96a2.06 2.04-74.3 01-.94-1.69c-.17-10.98 5.04-24.58 8.79-34.9q15.61-42.83 36-83.59a1.11 1.1-62.5 011.51-.48c1.25.66 3.21 12.98 3.46 15.08q6.94 59.25 2.82 116.88-.62 8.66-3.1 19.37-.13.53-.59.24l-47.95-30.91z" fill={getMuscleFill('lower_back')} style={{ filter: getMuscleFilter('lower_back') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('lower_back')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('lower_back'); setActiveDrawerMuscle(muscleData['lower_back']); }} />
            <path d="M1090.76 581.75q.62-5.16 0-10.27.22-29.79 3.05-59.5 1.1-11.58 3.91-22.88.31-1.27.44-1.43 1.08-1.43 1.88.17 23.38 46.97 40.14 96.18c1.8 5.28 5.84 16.69 4.38 22.96a1.64 1.64 0 01-.71 1.01l-47.63 30.72q-1.12.72-1.34-.6-4.54-28-4.12-56.36z" fill={getMuscleFill('lower_back')} style={{ filter: getMuscleFilter('lower_back') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('lower_back')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('lower_back'); setActiveDrawerMuscle(muscleData['lower_back']); }} />
            <path d="M1151.19 603.31q-5.39-3.38-2.19-9.05 8.03-14.22 17.88-24.62c3.49-3.69 9.04.89 10.97 3.99q2.92 4.66 3.8 10.14 3.5 21.77-1.21 43.02a.96.96 0 01-1.77.28c-6.92-11.85-16.03-16.56-27.48-23.76z" fill={getMuscleFill('lower_back')} style={{ filter: getMuscleFilter('lower_back') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('lower_back')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('lower_back'); setActiveDrawerMuscle(muscleData['lower_back']); }} />
            {/* GLUTEAL */}
            <path d="M1045.06 626.19q1.42.61 4.11 4.4.27.39-.19.52c-14.47 4.12-26.13 7.4-38.13 15.77q-15.37 10.71-30.53 21.6a.55.54 74.9 01-.86-.5c1.19-13.13 10.35-35.23 20.46-45.06 9.14-8.88 34.99-1.11 45.14 3.27z" fill={getMuscleFill('glutes')} style={{ filter: getMuscleFilter('glutes') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('glutes')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('glutes'); setActiveDrawerMuscle(muscleData['glutes']); }} />
            <path d="M1007.94 762.81c-16.94-16.64-29.37-37.66-31.47-61-2.06-22.84 15.63-34.95 32.18-45.71 8.2-5.33 46.51-27.32 54.37-17.65 5.92 7.29 13.38 15.84 15.44 25.21q3.01 13.63 2.44 27.6-.94 22.59-6.27 44.49c-2.43 9.96-2.9 17.16-2.59 26.75.47 14.83-18.52 17.18-29.12 14.07-6.38-1.87-13.79-4.83-21.35-6.25q-7.39-1.38-13.63-7.51z" fill={getMuscleFill('glutes')} style={{ filter: getMuscleFilter('glutes') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('glutes')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('glutes'); setActiveDrawerMuscle(muscleData['glutes']); }} />
            <path d="M1117.94 631.04q-.13-.03-.27-.06-.12-.02-.06-.13 2.58-4.2 7.05-5.92 12.71-4.87 26.13-5.81c12.93-.91 17.1 3.08 23.28 13.06 5.71 9.22 13.32 24.7 13.44 36.06q.01.76-.61.32-16.65-11.74-33.2-23.51c-10.03-7.14-23.72-10.58-35.76-14.01z" fill={getMuscleFill('glutes')} style={{ filter: getMuscleFilter('glutes') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('glutes')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('glutes'); setActiveDrawerMuscle(muscleData['glutes']); }} />
            <path d="M1124.12 776.61c-9.28 2.74-26.75 1.29-28.86-10.88-1.05-6.03.27-14.88-1.3-23.27q-.54-2.94-2.15-9.35c-3.2-12.81-4.02-23.33-5.08-35.27-1.07-12.03-.57-22 1.64-33.17q1.1-5.6 4.19-10.41 8.74-13.58 11.87-16.59c4.96-4.77 15.84.18 21.19 2.11q19.7 7.12 40.17 21.43c9.59 6.7 19.29 14.31 22.93 25.17 4.81 14.37-.65 33.88-7.42 46.87q-7.79 14.97-21.39 28.9-6.74 6.9-15.26 8.36c-7.07 1.21-13.68 4.08-20.53 6.1z" fill={getMuscleFill('glutes')} style={{ filter: getMuscleFilter('glutes') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('glutes')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('glutes'); setActiveDrawerMuscle(muscleData['glutes']); }} />
            {/* ADDUCTORS */}
            <path d="M1070.06 785.19c2.95 1.36 1.8 10.43 1.49 13.04q-3.98 33.27-14.66 64.61a.39.39 0 01-.76-.17c.9-7.05 2.31-14.29 2.16-20.92q-.68-30.14-18.71-54.52-.29-.39.18-.49c7.42-1.52 23.53-4.69 30.3-1.55z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            <path d="M1127.24 787.66c-15.99 21.49-22.3 48.51-16.08 74.83a.47.46-63.2 01-.88.29q-1.99-4.69-3.65-10.24-8.29-27.75-11.6-56.54c-.65-5.71-1.1-11.77 6.87-11.9q13-.19 25.68 2.83a.31.24 41.2 01.1.53q-.12.01-.27.07-.1.04-.17.13z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            {/* HAMSTRING */}
            <path d="M963.27 741.53a.71.7 31.7 011.19-.28q1.51 1.62 2.47 3.99c4.6 11.41 8.93 22.66 11.07 34.72 3.38 19.14 4.84 38.23 3.12 57.74q-1.68 19.06-2.99 38.15c-.51 7.55-.88 15.71.07 23.18q1.08 8.54 1.39 17.57a.52.52 0 01-.98.25q-1.03-2.07-1.8-4.62-5.13-16.92-7.25-34.49-5.01-41.45-6.86-83.17-1.09-24.75-.07-49.51.06-1.59.64-3.53z" fill={getMuscleFill('hamstrings')} style={{ filter: getMuscleFilter('hamstrings') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('hamstrings')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('hamstrings'); setActiveDrawerMuscle(muscleData['hamstrings']); }} />
            <path d="M1030.2 791.53q.17-.36.38-.03c5.26 8.11 9.94 16.15 12.47 25.64 3.12 11.72 5.87 24.36 4.31 36.24q-.5 3.8-3.57 14.02c-10.75 35.81-12.83 74.2-18.5 111.1q-.82 5.4-2.55 10.55-.23.68-.59.07c-4.72-8.07-5.18-25.09-5.34-34.81-.7-43.69 1.92-87.82 6.38-131.28 1.41-13.74 1.99-21.15 7.01-31.5z" fill={getMuscleFill('hamstrings')} style={{ filter: getMuscleFilter('hamstrings') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('hamstrings')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('hamstrings'); setActiveDrawerMuscle(muscleData['hamstrings']); }} />
            <path d="M998.81 761.94q14.07 14.17 20.1 33.62c.98 3.15-.78 9.61-.93 12.91q-1.3 27.63-2.3 55.27c-.55 15.31-1.54 30.27-5.12 45.26q-8.62 36.18-22.76 68.73-3.65 8.41-10.15 17.19-.45.61-.41-.14c.11-1.93.82-4.15.99-5.71q2.45-22.72 6.08-45.26c2.83-17.66 4.18-35.95 4.33-52.37.33-36.43-.75-73.34 1.47-109.68.33-5.32 1.07-16.16 4.7-20.25q.33-.36.81-.45 1.95-.37 3.19.88z" fill={getMuscleFill('hamstrings')} style={{ filter: getMuscleFilter('hamstrings') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('hamstrings')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('hamstrings'); setActiveDrawerMuscle(muscleData['hamstrings']); }} />
            <path d="M1052.52 855.62a.04.04 0 01.08.01q1.07 9.9 2.17 19.87.33 3.04-2.37 14.18c-3.83 15.8-8.15 31.11-8.9 47.47-.99 21.61-3.11 45.66-9.92 66.3q-1.49 4.52-.87-.2 3.38-25.36 3.7-51.99c.05-3.74-.4-10.32.2-15.58 2.19-19.2 7.39-38.25 11.75-57.05 1.78-7.64 2.93-15.21 4.16-23.01z" fill={getMuscleFill('hamstrings')} style={{ filter: getMuscleFilter('hamstrings') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('hamstrings')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('hamstrings'); setActiveDrawerMuscle(muscleData['hamstrings']); }} />
            <path d="M1183.25 947.53c2.57 14.85 4.32 31.11 6.22 46.14q.35 2.74-1.11.39c-14.67-23.67-23.34-52.15-30.55-79.32q-5.08-19.14-5.97-39.05-1.36-30.37-2.44-60.74c-.22-6.09-2.56-15.63-.55-21.57q5.87-17.35 18.96-31.07c10.77-11.28 10.17 46.55 10.16 48.97-.13 41.09-.45 74.18 1.91 110.07.57 8.75 1.88 17.53 3.37 26.18z" fill={getMuscleFill('hamstrings')} style={{ filter: getMuscleFilter('hamstrings') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('hamstrings')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('hamstrings'); setActiveDrawerMuscle(muscleData['hamstrings']); }} />
            <path d="M1136.43 791.52q.27-.42.49.03c3.12 6.46 4.84 12.26 5.68 19.83 5.07 45.8 8.05 94.61 7.56 140.76-.13 11.8-.46 26.22-5.13 37.08a.44.44 0 01-.83-.06q-2.51-9.14-3.69-18.41-3.54-27.64-7.36-55.24c-2.49-18-5.47-35.67-11.09-52.26q-4.35-12.82-2.08-26.75c1.76-10.77 3.58-21.61 8.46-31.16q3.58-6.99 7.99-13.82z" fill={getMuscleFill('hamstrings')} style={{ filter: getMuscleFilter('hamstrings') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('hamstrings')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('hamstrings'); setActiveDrawerMuscle(muscleData['hamstrings']); }} />
            <path d="M1115.03 856.73c2.03 18.72 7.11 37.44 11.47 55.77 2.25 9.46 3.94 19.51 3.95 30.11q.02 31.7 4.08 63.16.16 1.26-.29.07-2.7-7.15-4.19-14.6c-4.44-22.21-5.71-40.52-6.87-61.23-.24-4.24-1.19-9.64-2.23-13.92q-3.94-16.25-7.7-32.55c-2.09-9.04.08-18.69 1.6-27.66q.07-.38.32-.09.16.19.01.4-.19.24-.15.54z" fill={getMuscleFill('hamstrings')} style={{ filter: getMuscleFilter('hamstrings') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('hamstrings')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('hamstrings'); setActiveDrawerMuscle(muscleData['hamstrings']); }} />
            <path d="M1202.61 741.08a.44.44 0 01.72.03c.52.82.9 1.86.95 2.91q.73 15.98.37 31.97-1.16 52.95-7.85 105.49-1.88 14.74-5.97 29.04-1 3.52-1.92 4.95-1.57 2.47-1.39-.37c.58-9.44 1.83-19.17 1.71-28.16-.32-24.52-4.94-49.11-3.95-72.75.69-16.54 2.5-33.51 7.54-49.38q2.99-9.4 6.61-18.6.74-1.88 3.18-5.13z" fill={getMuscleFill('hamstrings')} style={{ filter: getMuscleFilter('hamstrings') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('hamstrings')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('hamstrings'); setActiveDrawerMuscle(muscleData['hamstrings']); }} />
            {/* CALVES */}
            <path d="M982.69 1149.31c-3.07-2.23-3.98-6.24-5.24-11.03-7.19-27.14-7.88-53.18-6.67-82.78q1.03-25.29 9.23-47.45c4.77-12.89 15.33-24.77 23.79-36q.82-1.09.74.27c-1.37 22.86-2.72 45.67-3.11 68.49-.52 30.56-1.51 61.11-.42 91.68.24 6.83-2.77 16.29-10.08 18.37q-4.39 1.25-8.24-1.55z" fill={getMuscleFill('calves')} style={{ filter: getMuscleFilter('calves') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
            <path d="M983.99 1163.56c7.15-5.59 16.16-.63 17 8.23q4.31 45.02 5.22 90.26c.16 8.25-.8 15.79-2.19 23.65q-.45 2.52-1.43 3.66-.95 1.11-1.22-.33c-5.03-26.7-8.28-53.49-11.87-80.36q-1.68-12.52-3.24-18.71-2.04-8.12-5.53-18.24c-1.03-3 .8-6.25 3.26-8.16z" fill={getMuscleFill('calves')} style={{ filter: getMuscleFilter('calves') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
            <path d="M1013.69 1150.31c-4.8-2.61-4.66-16.17-4.36-20.75 2.34-36.49 3.44-73.94 1.04-110.45-1.03-15.55.02-31.49.62-47.06q.03-.66.25-.03c2.28 6.45 4.52 12.88 7.39 19.11 5.12 11.14 11.5 22.91 14.83 33.92q2.34 7.74 3.97 16.46 5.3 28.43 5.62 56.09c.2 18.32-7.9 40-22.63 51.79q-3.42 2.73-6.73.92z" fill={getMuscleFill('calves')} style={{ filter: getMuscleFilter('calves') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
            <path d="M1014.14 1164.37c7-1.83 14.1 2.2 14.11 9.95q.06 29.04-5.62 57.41c-3.87 19.28-6.24 38.23-8.43 57.48a.37.37 0 01-.74-.01q-3.12-43.48-3.58-86.64-.15-14.16.76-28.3c.18-2.83.02-8.98 3.5-9.89z" fill={getMuscleFill('calves')} style={{ filter: getMuscleFilter('calves') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
            <path d="M1172.94 1149.31c-6.06-4.56-6.94-11.4-6.8-19.4.96-52.67-.49-105.31-3.54-157.9q-.04-.72.41-.16 7.96 10.07 15.43 20.44c9.11 12.64 13.61 28.98 15.78 44.21 4.96 34.71 3.75 72.94-5.97 106.5-1.97 6.82-9.18 10.93-15.31 6.31z" fill={getMuscleFill('calves')} style={{ filter: getMuscleFilter('calves') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
            <path d="M1144.41 1147.33q-17.19-17.37-20.08-40.86-.89-7.22-.13-19.97 1.18-20.06 4.69-41.33c2.33-14.1 5.8-25.22 12.41-38.61q8.19-16.59 14.35-34.15a.14.13-37.7 01.26.03q1.01 15.71 1.26 31.44c.18 11.61-1.34 24.91-1.58 36.43-.72 34.7 1.22 62.05 2.06 93.19.17 6.32-1.1 26.1-13.24 13.83z" fill={getMuscleFill('calves')} style={{ filter: getMuscleFilter('calves') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
            <path d="M1173.74 1161.73c6.88-2 14.34 3.23 11.98 10.91-2.24 7.3-4.78 14.44-5.99 21.96-5.07 31.52-8.04 63.18-14.13 94.6a.72.71-61.9 01-1.21.37c-.14-.14-.35-.39-.4-.59q-3.53-13.58-3.19-28.23 1.04-44.67 5.06-87.04c.58-6.1 1.93-10.25 7.88-11.98z" fill={getMuscleFill('calves')} style={{ filter: getMuscleFilter('calves') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
            <path d="M1154.32 1165a1.58 1.57-84.6 01.97 1.18c.79 4.42 1.42 8.78 1.57 13.4.96 29.17-.47 62.66-2.04 90.23q-.78 13.79-1.39 19.52a.23.23 0 01-.45 0c-2.79-21.25-5.41-41.99-9.64-63.03-3.44-17.08-4.29-34.91-4.68-52.3-.19-8.37 8.99-11.61 15.66-9z" fill={getMuscleFill('calves')} style={{ filter: getMuscleFilter('calves') }} className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('calves')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('calves'); setActiveDrawerMuscle(muscleData['calves']); }} />
            {/* ANKLES */}
            <path d="M998.25 1320.52c-4.62.24-8.17-1.08-8.78-6.28-1.6-13.81-.75-28.85-2.16-42.41q-.39-3.74.24-7.03a.69.69 0 011.23-.28c2.35 3.15 4.22 5.75 5.14 9.66 1.54 6.57 1.91 22.57 9.97 24.09q13.33 2.5 15.93-10.47c.92-4.57 1-12.33 5.05-17.25q.42-.51.42.15c.11 14.39.4 30.86-3.08 44.54-.79 3.13-3.31 4.23-6.51 4.4q-8.73.45-17.45.88z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            <path d="M1149.5 1319.51c-6.93-.63-6.82-18.08-7.14-23.7q-.73-12.53-.59-25.09.01-.71.45-.15 2.74 3.49 3.29 7.17c1.67 11.25 3.21 25.34 19.7 19.99 4.87-1.58 7.03-18.57 7.89-23.21.79-4.2 2.74-7 5.28-10.13a.56.56 0 01.98.22c1.12 4.6.04 12.39-.37 17.26-.92 10.77-.32 21.48-1.52 32.37q-.7 6.23-7.01 6.18-12.13-.11-20.96-.91z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            {/* FEET */}
            <path d="M962.87 1327.38q-.62-.51-.05-1.07l1.99-1.99q.39-.39.93-.41 25.66-.82 51.26 1 1.34.1 4.43 1.47.46.2.69.64 1.84 3.5 2.87 7.23c2.32 8.38-6.63 7.24-12.23 6.68q-15.37-1.53-30.5-4.56c-8.21-1.65-13.33-3.95-19.39-8.99z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            <path d="M1154.35 1341.35c-12.48 1.36-13.27-3.88-8.67-13.37 1.82-3.76 12.72-3.65 16.39-3.77q19.44-.63 38.9-.44c2.41.02 3.31 1 4.61 2.76q.32.44-.09.79c-5.43 4.67-10.52 7.17-17.95 8.74q-16.46 3.47-33.19 5.29z" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
            </g>
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
