const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, 'client/src/components/fitness/MuscleDiagram.jsx');
let content = fs.readFileSync(srcFile, 'utf-8');

const clustered = fs.readFileSync('svg_clustered.txt', 'utf-8');

// We will transform the `<path>` tags from svg_clustered.txt to have the full React event handlers.
let processedFrontPaths = clustered.split('\n').map(line => {
    if (line.includes('<path')) {
        // Extract muscle group from handleSelect('muscle')
        const match = line.match(/handleSelect\('([^']+)'\)/);
        if (match) {
            const muscle = match[1];
            if (muscle === 'head' || muscle === 'none') {
                return line.replace(/onClick=\{[^\}]+\}/, '')
                           .replace(/fill=\{[^\}]+\}/, 'fill="#1E293B"')
                           .replace(/filter=\{[^\}]+\}/, 'stroke="#334155" strokeWidth="1"');
            }
            return line
                .replace(/fill=\{getMuscleFill\('[^']+'\)\}/, `fill={getMuscleFill('${muscle}')}`)
                .replace(/filter=\{getMuscleFilter\('[^']+'\)\}/, `filter={getMuscleFilter('${muscle}')}`)
                .replace(/onClick=\{[^\}]+\}/, `className="cursor-pointer transition-all duration-300" onMouseEnter={() => setHoveredMuscle('${muscle}')} onMouseLeave={() => setHoveredMuscle(null)} onClick={() => { onSelectMuscle('${muscle}'); setActiveDrawerMuscle(muscleData['${muscle}']); }}`)
                .replace('/>', '/>');
        }
    }
    return line;
}).join('\n');

const newRenderSVG = `  // Render SVG Anatomical Graphic Component
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
            ${processedFrontPaths}
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

      {/* FLOATING GLASSMORPHISM TOOLTIP */}`;

const startIndex = content.indexOf('  // Render SVG Anatomical Graphic Component');
const endIndex = content.indexOf('      {/* FLOATING GLASSMORPHISM TOOLTIP */}');

if (startIndex !== -1 && endIndex !== -1) {
    content = content.substring(0, startIndex) + newRenderSVG + content.substring(endIndex + 44);
    fs.writeFileSync(srcFile, content);
    console.log('Successfully injected highly detailed interactive SVG anatomy into MuscleDiagram.jsx!');
} else {
    console.error('Could not find injection markers in MuscleDiagram.jsx');
}
