import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiCheckCircle, FiClock, FiTrendingUp, FiX, FiLayers, FiInfo, FiZap } from 'react-icons/fi';

import anatomyFrontRaw from '../../assets/anatomy.svg?raw';
import anatomyBackRaw from '../../assets/anatomy_back.svg?raw';

/** & Interactive Anatomical SVG Model
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

  const svgContainerRef = useRef(null);

  // SVG Data-Muscle -> Internal Tracker ID mapping
  const svgToInternalMap = {
      chest: 'chest',
      deltoids_front: 'deltoids_front',
      deltoids_rear: 'deltoids_rear',
      biceps: 'biceps',
      triceps: 'triceps',
      traps: 'traps',
      upperBack: 'lats',
      lowerBack: 'lower_back',
      gluteal: 'glutes',
      hamstring: 'hamstrings',
      calves: 'calves',
    trapezius: 'traps',
    deltoids: 'deltoids_side', // Group them for display
    chest: 'chest',
    abs: 'core',
    obliques: 'obliques',
    biceps: 'biceps',
    forearm: 'forearms',
    quadriceps: 'quads',
    upperBack: 'lats',
    lowerBack: 'lower_back',
    gluteal: 'glutes',
    hamstring: 'hamstrings',
    triceps: 'triceps',
    calves: 'calves'
  };

  // Internal Tracker ID -> SVG Data-Muscle mapping (for highlighting)
  const internalToSvgMap = {
    chest: 'chest',
    deltoids_front: 'deltoids',
    deltoids_side: 'deltoids',
    deltoids_rear: 'deltoids',
    biceps: 'biceps',
    triceps: 'triceps',
    forearms: 'forearm',
    core: 'abs',
    obliques: 'obliques',
    quads: 'quadriceps',
    calves: 'calves',
    traps: 'trapezius',
    lats: 'upperBack',
    lower_back: 'lowerBack',
    glutes: 'gluteal',
    hamstrings: 'hamstring'
  };

  useEffect(() => {
    if (!svgContainerRef.current) return;
    const container = svgContainerRef.current;
    
    // First, clear all previous event listeners by cloning nodes if we need to? 
    // Actually, simple DOM events can be attached. Since this runs on every render, 
    // it's safer to just set styles and attributes dynamically without duplicating listeners, 
    // or just re-attach them. Wait, React handles the DOM, but we are injecting raw SVG.
    // The raw SVG doesn't change unless viewMode changes.
    // But we need to update fills every time targetInfo or hoveredMuscle changes.
    
    const muscles = container.querySelectorAll('g.muscle[data-muscle]');
    
    muscles.forEach((group) => {
      const svgId = group.getAttribute('data-muscle');
      const internalId = svgToInternalMap[svgId];
      
      // Setup event listeners ONLY ONCE by checking a flag
      if (!group.dataset.initialized) {
        group.dataset.initialized = 'true';
        if (internalId) {
          group.style.cursor = 'pointer';
          group.style.transition = 'all 0.3s ease';
          
          group.addEventListener('mouseenter', () => setHoveredMuscle(internalId));
          group.addEventListener('mouseleave', () => setHoveredMuscle(null));
          group.addEventListener('click', () => {
            onSelectMuscle(internalId);
            setActiveDrawerMuscle(muscleData[internalId]);
          });
        }
      }

      // Calculate styles based on current state
      let status = 'none';
      
      // Determine if this SVG group is primary/secondary based on active tracker IDs
      const isPrimary = targetInfo.primary.some(id => internalToSvgMap[id] === svgId) || (selectedMuscle !== 'all' && internalToSvgMap[selectedMuscle] === svgId);
      const isSecondary = targetInfo.secondary.some(id => internalToSvgMap[id] === svgId);
      
      if (isPrimary) status = 'primary';
      else if (isSecondary) status = 'secondary';
      
      // Determine if this specific SVG group is hovered
      const isHovered = hoveredMuscle && internalToSvgMap[hoveredMuscle] === svgId;
      
      // Apply styles
      if (isHovered) {
        group.style.fill = 'url(#hoverGradient)';
        group.style.filter = 'drop-shadow(0px 0px 8px rgba(192, 132, 252, 0.9))';
          group.style.opacity = '1';
      } else if (status === 'primary') {
        group.style.fill = 'url(#primaryGradient)';
        group.style.filter = 'drop-shadow(0px 0px 7px rgba(168, 85, 247, 0.85))';
          group.style.opacity = '1';
      } else if (status === 'secondary') {
        group.style.fill = 'url(#secondaryGradient)';
        group.style.filter = 'drop-shadow(0px 0px 5px rgba(56, 189, 248, 0.65))';
          group.style.opacity = '1';
      } else {
        group.style.fill = 'url(#inactiveGradient)';
        group.style.filter = 'none';
          group.style.opacity = '0.42';
      }
    });
  }); // Run on every render to ensure styles update


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
    <div ref={svgContainerRef} className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden">
      {/* PERFECT CENTER DIVIDER */}
      {viewMode === 'both' && (
        <div className="absolute left-1/2 top-4 bottom-12 w-px bg-border-subtle -translate-x-1/2 pointer-events-none" />
      )}

      {/* GRID FOR EQUAL SIZING AND HORIZONTAL SPACING */}
      <div className={`relative w-full h-full ${viewMode === 'both' ? 'grid grid-cols-2 gap-8' : 'flex justify-center items-center'}`}>
        
        {/* FRONT ANATOMY MODEL (High Fidelity) */}
        {(viewMode === 'both' || viewMode === 'front') && (
          <div className="w-full h-full flex items-center justify-center">
            <div 
              className="w-full h-full flex justify-center items-center"
              dangerouslySetInnerHTML={{ __html: anatomyFrontRaw.replace('<svg ', '<svg class="h-full w-auto max-h-full filter drop-shadow-[0_0_15px_rgba(0,0,0,0.4)]" preserveAspectRatio="xMidYMid meet" ').replace('</style>', '</style><defs><linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient><linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#0ea5e9" /></linearGradient><linearGradient id="inactiveGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#52525b" /><stop offset="100%" stopColor="#27272a" /></linearGradient><linearGradient id="hoverGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#d8b4fe" /><stop offset="100%" stopColor="#c084fc" /></linearGradient></defs>') }} 
            />
          </div>
        )}

        {/* BACK ANATOMY MODEL (High Fidelity) */}
        {(viewMode === 'both' || viewMode === 'back') && (
          <div className="w-full h-full flex items-center justify-center">
            <div 
              className="w-full h-full flex justify-center items-center"
              dangerouslySetInnerHTML={{ __html: anatomyBackRaw.replace('<svg ', '<svg class="h-full w-auto max-h-full filter drop-shadow-[0_0_15px_rgba(0,0,0,0.4)]" preserveAspectRatio="xMidYMid meet" ').replace('</style>', '</style><defs><linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient><linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#0ea5e9" /></linearGradient><linearGradient id="inactiveGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#52525b" /><stop offset="100%" stopColor="#27272a" /></linearGradient><linearGradient id="hoverGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#d8b4fe" /><stop offset="100%" stopColor="#c084fc" /></linearGradient></defs>') }} 
            />
          </div>
        )}
      </div>
      
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
        <div className="flex items-center justify-between pb-4 shrink-0 w-full">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Muscle Activation</h4>
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
        <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
          {renderSVGGraphic()}
        </div>

        {/* Compact legend */}
        <div className="flex items-center justify-center gap-6 pt-3 pb-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider leading-none">Primary</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-info" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider leading-none">Secondary</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider leading-none">Inactive</span>
          </div>
        </div>
      </div>
    );
  }

  // Standalone Card Mode (showFullCard = true)
  return (
    <div className={`rounded-2xl bg-[#17191d] border border-border-subtle p-6 overflow-hidden ${className}`}>
      {/* TOP HEADER: TITLE & CONTROLS */}
      {!minimalMode && (
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[13px] font-bold text-white tracking-[0.15em] uppercase flex items-center gap-2">
            Muscle Activation
          </h3>

          {/* Modern Segmented Control: Both | Front | Back */}
          <div className="flex items-center p-1 rounded-full bg-[#1d2025] border border-border-subtle shadow-inner">
            {[
              { id: 'both', label: 'Both' },
              { id: 'front', label: 'Front' },
              { id: 'back', label: 'Back' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-full transition-all duration-300 ${
                  viewMode === tab.id
                    ? 'bg-[#a855f7] text-white shadow-md'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CENTER SVG GRAPHIC */}
      <div className="w-full h-[420px] relative">
        {renderSVGGraphic()}
      </div>

      {/* DOT LEGENDS */}
      {!minimalMode && (
        <div className="flex justify-center items-center gap-8 mt-8">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#a855f7] shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">Primary</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#0ea5e9] shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">Secondary</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#52525b]" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">Inactive</span>
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
