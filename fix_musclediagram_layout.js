const fs = require('fs');

let content = fs.readFileSync('client/src/components/fitness/MuscleDiagram.jsx', 'utf8');

const startStr = '  const renderSVGGraphic = () => (';
const endStr = '  // If embedded inside Today\'s Workout Card';

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr);

if (startIdx === -1 || endIdx === -1) {
  console.log('Could not find start or end bounds');
  process.exit(1);
}

const before = content.substring(0, startIdx);
const after = content.substring(endIdx);

const newRender = `  const renderSVGGraphic = () => (
    <div ref={svgContainerRef} className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-visible">
      {/* PERFECT CENTER DIVIDER */}
      {viewMode === 'both' && (
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border-subtle -translate-x-1/2 pointer-events-none" />
      )}

      {/* GRID FOR EQUAL SIZING AND HORIZONTAL SPACING */}
      <div className={\`relative w-full h-full \${viewMode === 'both' ? 'grid grid-cols-2 gap-10 px-4' : 'flex justify-center items-center'}\`}>
        
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
              <span className={\`text-[8px] font-bold px-2 py-0.5 rounded-full \${
                currentHoverMeta.status === 'primary' ? 'bg-purple text-white' :
                currentHoverMeta.status === 'secondary' ? 'bg-info text-white' : 'bg-surface-elevated text-text-muted'
              }\`}>
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

`;

fs.writeFileSync('client/src/components/fitness/MuscleDiagram.jsx', before + newRender + after);
console.log('Fixed MuscleDiagram layout');
