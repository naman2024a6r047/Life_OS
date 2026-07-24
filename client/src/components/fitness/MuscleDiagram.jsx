import React, { useState } from 'react';

/**
 * Interactive Front & Back Muscle Diagram SVG Component
 * Supports muscle highlighting based on active exercise or direct click filtering
 */
export default function MuscleDiagram({
  selectedExercise = '',
  selectedMuscle = 'all',
  onSelectMuscle = () => {},
  side = 'front',
  onToggleSide = () => {}
}) {
  const [hoveredMuscle, setHoveredMuscle] = useState(null);

  // Mapping from exercise to target muscles
  const exerciseMuscleMap = {
    'barbell bench press': { primary: ['chest'], secondary: ['shoulders', 'triceps'] },
    'bench press': { primary: ['chest'], secondary: ['shoulders', 'triceps'] },
    'barbell back squat': { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'core'] },
    'squat': { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'core'] },
    'deadlift': { primary: ['back', 'hamstrings', 'glutes'], secondary: ['forearms', 'core'] },
    'pull up': { primary: ['back', 'lats'], secondary: ['biceps', 'shoulders', 'core'] },
    'pull ups': { primary: ['back', 'lats'], secondary: ['biceps', 'shoulders', 'core'] },
    'dumbbell shoulder press': { primary: ['shoulders'], secondary: ['triceps'] },
    'overhead press': { primary: ['shoulders'], secondary: ['triceps', 'back'] },
    'dumbbell bicep curl': { primary: ['biceps'], secondary: ['forearms'] },
    'cable tricep pushdown': { primary: ['triceps'], secondary: ['forearms'] },
    'plank': { primary: ['core'], secondary: ['shoulders'] },
  };

  const exKey = selectedExercise.toLowerCase();
  const targetInfo = exerciseMuscleMap[exKey] || { primary: [], secondary: [] };

  const getMuscleStatus = (muscleId) => {
    if (selectedMuscle && selectedMuscle !== 'all' && selectedMuscle === muscleId) {
      return 'selected';
    }
    if (targetInfo.primary.includes(muscleId)) return 'primary';
    if (targetInfo.secondary.includes(muscleId)) return 'secondary';
    return 'none';
  };

  const getMuscleFill = (muscleId) => {
    const status = getMuscleStatus(muscleId);
    if (status === 'selected') return '#A855F7'; // Neon Purple
    if (status === 'primary') return '#A855F7'; // Neon Purple
    if (status === 'secondary') return '#38BDF8'; // Neon Cyan
    if (hoveredMuscle === muscleId) return '#818CF8'; // Soft Indigo
    return '#1E293B'; // Default Slate Dark
  };

  const muscleCounts = {
    chest: { count: 12, name: 'Chest (Pectorals)' },
    shoulders: { count: 10, name: 'Shoulders (Deltoids)' },
    biceps: { count: 8, name: 'Biceps' },
    triceps: { count: 10, name: 'Triceps' },
    forearms: { count: 6, name: 'Forearms' },
    core: { count: 12, name: 'Core & Abs' },
    quads: { count: 14, name: 'Quadriceps' },
    hamstrings: { count: 8, name: 'Hamstrings' },
    glutes: { count: 8, name: 'Glutes' },
    back: { count: 15, name: 'Back & Lats' },
    calves: { count: 6, name: 'Calves' },
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-2 bg-surface-elevated/40 rounded-2xl border border-border-subtle">
      {/* Side Toggle Button */}
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
          {side === 'front' ? 'Front Body' : 'Back Body'}
        </span>
        <button
          type="button"
          onClick={onToggleSide}
          className="px-2 py-0.5 rounded-lg bg-surface border border-border-subtle text-[9px] font-bold text-purple hover:bg-purple/10 transition-all"
        >
          Switch to {side === 'front' ? 'Back' : 'Front'}
        </button>
      </div>

      {/* SVG Muscle Graphic */}
      <div className="relative w-36 h-64 flex items-center justify-center">
        <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-md">
          {/* Head & Neck Base */}
          <circle cx="50" cy="18" r="10" fill="#334155" />
          <rect x="46" y="27" width="8" height="8" fill="#334155" rx="2" />

          {side === 'front' ? (
            /* FRONT BODY MUSCLES */
            <g>
              {/* Shoulders / Delts */}
              <path
                d="M 28 35 Q 36 34 40 37 L 34 50 Q 25 45 28 35 Z"
                fill={getMuscleFill('shoulders')}
                stroke="#0F172A"
                strokeWidth="1.5"
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={() => setHoveredMuscle('shoulders')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onSelectMuscle('shoulders')}
              />
              <path
                d="M 72 35 Q 64 34 60 37 L 66 50 Q 75 45 72 35 Z"
                fill={getMuscleFill('shoulders')}
                stroke="#0F172A"
                strokeWidth="1.5"
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={() => setHoveredMuscle('shoulders')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onSelectMuscle('shoulders')}
              />

              {/* Chest (Pectorals) */}
              <path
                d="M 37 38 Q 50 36 63 38 L 60 58 Q 50 62 40 58 Z"
                fill={getMuscleFill('chest')}
                stroke="#0F172A"
                strokeWidth="1.5"
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={() => setHoveredMuscle('chest')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onSelectMuscle('chest')}
              />

              {/* Biceps */}
              <path
                d="M 25 48 L 33 51 L 30 70 L 22 65 Z"
                fill={getMuscleFill('biceps')}
                stroke="#0F172A"
                strokeWidth="1.5"
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={() => setHoveredMuscle('biceps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onSelectMuscle('biceps')}
              />
              <path
                d="M 75 48 L 67 51 L 70 70 L 78 65 Z"
                fill={getMuscleFill('biceps')}
                stroke="#0F172A"
                strokeWidth="1.5"
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={() => setHoveredMuscle('biceps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onSelectMuscle('biceps')}
              />

              {/* Core / Abs */}
              <path
                d="M 41 60 Q 50 61 59 60 L 57 95 Q 50 97 43 95 Z"
                fill={getMuscleFill('core')}
                stroke="#0F172A"
                strokeWidth="1.5"
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={() => setHoveredMuscle('core')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onSelectMuscle('core')}
              />

              {/* Quads */}
              <path
                d="M 38 98 Q 48 97 48 135 L 36 130 Q 34 110 38 98 Z"
                fill={getMuscleFill('quads')}
                stroke="#0F172A"
                strokeWidth="1.5"
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={() => setHoveredMuscle('quads')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onSelectMuscle('quads')}
              />
              <path
                d="M 62 98 Q 52 97 52 135 L 64 130 Q 66 110 62 98 Z"
                fill={getMuscleFill('quads')}
                stroke="#0F172A"
                strokeWidth="1.5"
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={() => setHoveredMuscle('quads')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onSelectMuscle('quads')}
              />

              {/* Calves */}
              <path
                d="M 36 138 Q 44 138 43 175 L 37 175 Q 33 155 36 138 Z"
                fill={getMuscleFill('calves')}
                stroke="#0F172A"
                strokeWidth="1.5"
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={() => setHoveredMuscle('calves')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onSelectMuscle('calves')}
              />
              <path
                d="M 64 138 Q 56 138 57 175 L 63 175 Q 67 155 64 138 Z"
                fill={getMuscleFill('calves')}
                stroke="#0F172A"
                strokeWidth="1.5"
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={() => setHoveredMuscle('calves')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onSelectMuscle('calves')}
              />
            </g>
          ) : (
            /* BACK BODY MUSCLES */
            <g>
              {/* Upper Back & Traps */}
              <path
                d="M 32 35 Q 50 32 68 35 L 62 60 Q 50 63 38 60 Z"
                fill={getMuscleFill('back')}
                stroke="#0F172A"
                strokeWidth="1.5"
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={() => setHoveredMuscle('back')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onSelectMuscle('back')}
              />

              {/* Triceps */}
              <path
                d="M 23 46 L 31 49 L 28 68 L 20 63 Z"
                fill={getMuscleFill('triceps')}
                stroke="#0F172A"
                strokeWidth="1.5"
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={() => setHoveredMuscle('triceps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onSelectMuscle('triceps')}
              />
              <path
                d="M 77 46 L 69 49 L 72 68 L 80 63 Z"
                fill={getMuscleFill('triceps')}
                stroke="#0F172A"
                strokeWidth="1.5"
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={() => setHoveredMuscle('triceps')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onSelectMuscle('triceps')}
              />

              {/* Glutes */}
              <path
                d="M 37 92 Q 50 90 63 92 L 60 115 Q 50 118 40 115 Z"
                fill={getMuscleFill('glutes')}
                stroke="#0F172A"
                strokeWidth="1.5"
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={() => setHoveredMuscle('glutes')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onSelectMuscle('glutes')}
              />

              {/* Hamstrings */}
              <path
                d="M 38 117 Q 48 116 47 142 L 37 140 Z"
                fill={getMuscleFill('hamstrings')}
                stroke="#0F172A"
                strokeWidth="1.5"
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={() => setHoveredMuscle('hamstrings')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onSelectMuscle('hamstrings')}
              />
              <path
                d="M 62 117 Q 52 116 53 142 L 63 140 Z"
                fill={getMuscleFill('hamstrings')}
                stroke="#0F172A"
                strokeWidth="1.5"
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={() => setHoveredMuscle('hamstrings')}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onSelectMuscle('hamstrings')}
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip */}
        {hoveredMuscle && muscleCounts[hoveredMuscle] && (
          <div className="absolute top-2 bg-slate-900 border border-purple text-white p-1.5 rounded-lg text-[9px] font-mono shadow-2xl z-30 pointer-events-none text-center">
            <p className="font-bold text-purple">{muscleCounts[hoveredMuscle].name}</p>
            <p className="text-text-muted">{muscleCounts[hoveredMuscle].count} Exercises Available</p>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-between w-full pt-2 border-t border-border-subtle text-[9px] text-text-muted">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple inline-block" /> Primary Target</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400 inline-block" /> Secondary</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-700 inline-block" /> Inactive</span>
      </div>
    </div>
  );
}
