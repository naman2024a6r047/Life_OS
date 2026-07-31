const fs = require('fs');

// 1. GymDashboard.jsx
let gymContent = fs.readFileSync('client/src/pages/GymDashboard.jsx', 'utf8');
// Increase container height from h-[360px] to h-[440px]
gymContent = gymContent.replace(
  /className="w-full h-\[360px\] flex items-center justify-center bg-surface-elevated\/30 rounded-2xl border border-border-subtle\/50 p-6 overflow-visible"/,
  'className="w-full h-[460px] flex items-center justify-center bg-surface-elevated/30 rounded-2xl border border-border-subtle/50 p-6 overflow-visible"'
);
fs.writeFileSync('client/src/pages/GymDashboard.jsx', gymContent);

// 2. MuscleDiagram.jsx
let mdContent = fs.readFileSync('client/src/components/fitness/MuscleDiagram.jsx', 'utf8');
// Update inactiveGradient
mdContent = mdContent.replace(
  /<linearGradient id="inactiveGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#52525b" \/><stop offset="100%" stopColor="#3f3f46" \/><\/linearGradient>/g,
  '<linearGradient id="inactiveGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#71717a" /><stop offset="100%" stopColor="#52525b" /></linearGradient>'
);

// Move legend closer
mdContent = mdContent.replace(
  /<div className="flex items-center justify-center gap-6 pt-6 pb-2 shrink-0">/,
  '<div className="flex items-center justify-center gap-6 pt-3 pb-2 shrink-0">'
);
fs.writeFileSync('client/src/components/fitness/MuscleDiagram.jsx', mdContent);

// 3. anatomy.svg
let frontSvg = fs.readFileSync('client/src/assets/anatomy.svg', 'utf8');
// Replace viewBox
frontSvg = frontSvg.replace(
  /viewBox="0 0 163 393\.75"/,
  'viewBox="-16 -21 184 341"'
);
// Replace styling
frontSvg = frontSvg.replace(
  /\.muscle path \{ stroke: #27272a; stroke-width: 1\.5; \}/,
  '.muscle path { stroke: #52525b; stroke-width: 2.0; }'
);
// Replace unmapped decorative
frontSvg = frontSvg.replace(
  /<g id="unmapped_decorative" fill="#52525b" opacity="1">/,
  '<g id="unmapped_decorative" fill="#71717a" opacity="1">'
);
fs.writeFileSync('client/src/assets/anatomy.svg', frontSvg);

// 4. anatomy_back.svg
let backSvg = fs.readFileSync('client/src/assets/anatomy_back.svg', 'utf8');
// Replace viewBox
backSvg = backSvg.replace(
  /viewBox="755 78 662 1268"/,
  'viewBox="771.41 148.45 630.35 1210.9"'
);
// Replace styling
backSvg = backSvg.replace(
  /fill="#52525b"/g,
  'fill="#71717a"'
);
backSvg = backSvg.replace(
  /stroke: #27272a; stroke-width: 1\.5;/g,
  'stroke: #52525b; stroke-width: 2.0;'
);
fs.writeFileSync('client/src/assets/anatomy_back.svg', backSvg);

console.log('Successfully updated component layout, SVG viewBox bounds, and styling!');
