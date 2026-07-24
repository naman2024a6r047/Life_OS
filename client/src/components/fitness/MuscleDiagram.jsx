import React, { useState } from 'react';

/**
 * High-Fidelity Side-by-Side Dual Front & Back Anatomical Muscle Diagram
 * Matches reference UI with detailed muscle paths for Chest, Delts, Abs, Biceps, Triceps, Lats, Quads, Glutes, Hamstrings, and Calves.
 */
export default function MuscleDiagram({
  selectedExercise = '',
  selectedMuscle = 'all',
  onSelectMuscle = () => {},
  className = ''
}) {
  const [hoveredMuscle, setHoveredMuscle] = useState(null);

  // Mapping from exercise to target muscles
  const exerciseMuscleMap = {
    'barbell bench press': { primary: ['chest'], secondary: ['shoulders', 'triceps'] },
    'bench press': { primary: ['chest'], secondary: ['shoulders', 'triceps'] },
    'barbell back squat': { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'core'] },
    'squat': { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'core'] },
    'deadlift': { primary: ['back', 'lats', 'hamstrings', 'glutes'], secondary: ['forearms', 'core'] },
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
    if (status === 'selected') return '#A855F7'; // Vivid Purple (Primary)
    if (status === 'primary') return '#A855F7'; // Vivid Purple (Primary)
    if (status === 'secondary') return '#818CF8'; // Soft Purple/Indigo (Secondary)
    if (hoveredMuscle === muscleId) return '#C084FC'; // Glowing Purple Hover
    return '#1E293B'; // Dark Inactive Slate
  };

  const muscleMeta = {
    chest: { count: 12, name: 'Chest (Pectorals)' },
    shoulders: { count: 10, name: 'Shoulders (Deltoids)' },
    biceps: { count: 8, name: 'Biceps' },
    triceps: { count: 10, name: 'Triceps' },
    forearms: { count: 6, name: 'Forearms' },
    core: { count: 12, name: 'Abs & Obliques' },
    quads: { count: 14, name: 'Quadriceps' },
    hamstrings: { count: 8, name: 'Hamstrings' },
    glutes: { count: 8, name: 'Glutes' },
    back: { count: 15, name: 'Back & Lats' },
    lats: { count: 12, name: 'Latissimus Dorsi' },
    calves: { count: 6, name: 'Calves' },
  };

  return (
    <div className={`relative flex flex-col items-center justify-center p-3 bg-surface-elevated/30 rounded-2xl border border-border-subtle ${className}`}>
      {/* Side-by-Side Dual Body SVG */}
      <div className="relative w-full max-w-[280px] h-[220px] flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl select-none">
          {/* ======================================================== */}
          {/* LEFT FIGURE — FRONT BODY                                */}
          {/* ======================================================== */}
          <g id="front-body">
            {/* Head & Hair */}
            <circle cx="50" cy="18" r="10" fill="#334155" />
            <path d="M 42 15 Q 50 10 58 15 Q 55 12 45 12 Z" fill="#94A3B8" opacity="0.8" />
            {/* Neck */}
            <rect x="46" y="27" width="8" height="6" fill="#334155" rx="1" />

            {/* Shoulders / Deltoids (Front) */}
            <path
              d="M 28 35 Q 36 34 40 37 L 34 50 Q 25 45 28 35 Z"
              fill={getMuscleFill('shoulders')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('shoulders')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('shoulders')}
            />
            <path
              d="M 72 35 Q 64 34 60 37 L 66 50 Q 75 45 72 35 Z"
              fill={getMuscleFill('shoulders')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('shoulders')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('shoulders')}
            />

            {/* Chest (Left & Right Pectorals) */}
            <path
              d="M 37 35 Q 50 34 50 49 L 36 48 Z"
              fill={getMuscleFill('chest')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('chest')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('chest')}
            />
            <path
              d="M 63 35 Q 50 34 50 49 L 64 48 Z"
              fill={getMuscleFill('chest')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('chest')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('chest')}
            />

            {/* Biceps */}
            <path
              d="M 24 48 Q 32 49 30 68 L 21 63 Z"
              fill={getMuscleFill('biceps')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('biceps')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('biceps')}
            />
            <path
              d="M 76 48 Q 68 49 70 68 L 79 63 Z"
              fill={getMuscleFill('biceps')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('biceps')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('biceps')}
            />

            {/* Forearms (Front) */}
            <path
              d="M 20 65 L 29 69 L 24 94 L 16 90 Z"
              fill={getMuscleFill('forearms')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('forearms')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('forearms')}
            />
            <path
              d="M 80 65 L 71 69 L 76 94 L 84 90 Z"
              fill={getMuscleFill('forearms')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('forearms')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('forearms')}
            />

            {/* Core / Abs (6 Pack Grid) */}
            <path
              d="M 37 51 L 63 51 L 61 94 L 39 94 Z"
              fill={getMuscleFill('core')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('core')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('core')}
            />
            {/* Abdominal Lines Overlay */}
            <line x1="50" y1="51" x2="50" y2="94" stroke="#0F172A" strokeWidth="1" opacity="0.6" />
            <line x1="38" y1="64" x2="62" y2="64" stroke="#0F172A" strokeWidth="1" opacity="0.6" />
            <line x1="39" y1="78" x2="61" y2="78" stroke="#0F172A" strokeWidth="1" opacity="0.6" />

            {/* Quads (Quadriceps Thighs) */}
            <path
              d="M 38 96 Q 48 95 47 142 L 35 138 Q 33 115 38 96 Z"
              fill={getMuscleFill('quads')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('quads')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('quads')}
            />
            <path
              d="M 62 96 Q 52 95 53 142 L 65 138 Q 67 115 62 96 Z"
              fill={getMuscleFill('quads')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('quads')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('quads')}
            />

            {/* Knees */}
            <circle cx="41" cy="146" r="3.5" fill="#334155" stroke="#0F172A" strokeWidth="1" />
            <circle cx="59" cy="146" r="3.5" fill="#334155" stroke="#0F172A" strokeWidth="1" />

            {/* Calves (Front Shin/Calf) */}
            <path
              d="M 36 151 Q 44 151 43 186 L 37 186 Q 32 165 36 151 Z"
              fill={getMuscleFill('calves')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('calves')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('calves')}
            />
            <path
              d="M 64 151 Q 56 151 57 186 L 63 186 Q 68 165 64 151 Z"
              fill={getMuscleFill('calves')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('calves')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('calves')}
            />
          </g>

          {/* ======================================================== */}
          {/* RIGHT FIGURE — BACK BODY                                 */}
          {/* ======================================================== */}
          <g id="back-body">
            {/* Head (Back Silhouette) */}
            <circle cx="150" cy="18" r="10" fill="#334155" />
            <rect x="146" y="27" width="8" height="6" fill="#334155" rx="1" />

            {/* Rear Deltoids (Shoulders Back) */}
            <path
              d="M 128 35 Q 136 34 140 37 L 134 50 Q 125 45 128 35 Z"
              fill={getMuscleFill('shoulders')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('shoulders')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('shoulders')}
            />
            <path
              d="M 172 35 Q 164 34 160 37 L 166 50 Q 175 45 172 35 Z"
              fill={getMuscleFill('shoulders')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('shoulders')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('shoulders')}
            />

            {/* Back & Traps & Lats (V-Taper) */}
            <path
              d="M 138 35 Q 150 33 162 35 L 158 72 Q 150 76 142 72 Z"
              fill={getMuscleFill('back')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('back')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('back')}
            />
            {/* Lat Lines V-Shape */}
            <path d="M 140 38 Q 150 55 145 70" stroke="#0F172A" strokeWidth="1" fill="none" opacity="0.6" />
            <path d="M 160 38 Q 150 55 155 70" stroke="#0F172A" strokeWidth="1" fill="none" opacity="0.6" />

            {/* Triceps (Back of Arms) */}
            <path
              d="M 124 48 Q 132 49 130 68 L 121 63 Z"
              fill={getMuscleFill('triceps')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('triceps')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('triceps')}
            />
            <path
              d="M 176 48 Q 168 49 170 68 L 179 63 Z"
              fill={getMuscleFill('triceps')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('triceps')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('triceps')}
            />

            {/* Forearms (Back) */}
            <path
              d="M 120 65 L 129 69 L 124 94 L 116 90 Z"
              fill={getMuscleFill('forearms')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('forearms')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('forearms')}
            />
            <path
              d="M 180 65 L 171 69 L 176 94 L 184 90 Z"
              fill={getMuscleFill('forearms')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('forearms')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('forearms')}
            />

            {/* Glutes (Buttocks) */}
            <path
              d="M 137 74 Q 150 72 163 74 L 160 102 Q 150 106 140 102 Z"
              fill={getMuscleFill('glutes')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('glutes')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('glutes')}
            />
            <line x1="150" y1="74" x2="150" y2="104" stroke="#0F172A" strokeWidth="1" opacity="0.6" />

            {/* Hamstrings (Back Thighs) */}
            <path
              d="M 138 105 Q 148 104 147 142 L 135 138 Q 133 120 138 105 Z"
              fill={getMuscleFill('hamstrings')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('hamstrings')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('hamstrings')}
            />
            <path
              d="M 162 105 Q 152 104 153 142 L 165 138 Q 167 120 162 105 Z"
              fill={getMuscleFill('hamstrings')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('hamstrings')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('hamstrings')}
            />

            {/* Calves (Gastrocnemius Back) */}
            <path
              d="M 136 145 Q 144 145 143 186 L 137 186 Q 132 165 136 145 Z"
              fill={getMuscleFill('calves')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('calves')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('calves')}
            />
            <path
              d="M 164 145 Q 156 145 157 186 L 163 186 Q 168 165 164 145 Z"
              fill={getMuscleFill('calves')}
              stroke="#0F172A"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHoveredMuscle('calves')}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => onSelectMuscle('calves')}
            />
          </g>
        </svg>

        {/* Hover Tooltip Popup */}
        {hoveredMuscle && muscleMeta[hoveredMuscle] && (
          <div className="absolute top-1 bg-slate-950 border border-purple text-white px-2 py-1 rounded-xl text-[10px] font-mono shadow-2xl z-30 pointer-events-none text-center">
            <p className="font-extrabold text-purple leading-tight">{muscleMeta[hoveredMuscle].name}</p>
            <p className="text-[8px] text-text-muted">{muscleMeta[hoveredMuscle].count} Exercises Available</p>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-between w-full pt-2 border-t border-border-subtle text-[9px] font-mono text-text-muted">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple inline-block" /> Primary</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" /> Secondary</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-border-subtle inline-block" /> Not Trained</span>
      </div>
    </div>
  );
}
