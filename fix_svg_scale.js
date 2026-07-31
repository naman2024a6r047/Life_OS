const fs = require('fs');
let content = fs.readFileSync('client/src/components/fitness/MuscleDiagram.jsx', 'utf8');

// 1. Update inactive gradient
content = content.replace(
  /<linearGradient id="inactiveGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3f3f46" \/><stop offset="100%" stopColor="#27272a" \/><\/linearGradient>/g,
  '<linearGradient id="inactiveGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#52525b" /><stop offset="100%" stopColor="#3f3f46" /></linearGradient>'
);

// 2. Fix SVG rendering properties (h-full w-auto max-h-full)
// The current replacement strings contain '<svg class="w-full h-full filter drop-shadow-xl" '
content = content.replace(
  /<svg class="w-full h-full filter drop-shadow-xl" '/g,
  '<svg class="h-full w-auto max-h-full filter drop-shadow-[0_0_15px_rgba(0,0,0,0.4)]" preserveAspectRatio="xMidYMid meet" '
);

// 3. Make the layout perfectly equal for the models
content = content.replace(
  /<div className=\{\`h-full \$\{viewMode === 'both' \? 'w-1\/2' : 'w-full max-w-\[400px\]'\} flex items-center justify-center\`\}>/g,
  '<div className={`relative h-full flex-1 flex flex-col items-center justify-center ${viewMode === "both" ? "max-w-[50%]" : "w-full max-w-[400px]"}`}>'
);

fs.writeFileSync('client/src/components/fitness/MuscleDiagram.jsx', content);
console.log('Fixed MuscleDiagram scaling & gradient visibility');
