const fs = require('fs');
let content = fs.readFileSync('client/src/components/fitness/MuscleDiagram.jsx', 'utf8');

content = content.replace(
  'const svgToInternalMap = {',
  `const svgToInternalMap = {
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
      calves: 'calves',`
);

const defsString = `<defs>
  <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stopColor="#a855f7" />
    <stop offset="100%" stopColor="#8b5cf6" />
  </linearGradient>
  <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stopColor="#38bdf8" />
    <stop offset="100%" stopColor="#0ea5e9" />
  </linearGradient>
  <linearGradient id="inactiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stopColor="#3f3f46" />
    <stop offset="100%" stopColor="#27272a" />
  </linearGradient>
  <linearGradient id="hoverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stopColor="#d8b4fe" />
    <stop offset="100%" stopColor="#c084fc" />
  </linearGradient>
</defs>`;

content = content.replace(
  "anatomyFrontRaw.replace('<svg ', '<svg class=\"w-full h-full filter drop-shadow-xl\" ')",
  "anatomyFrontRaw.replace('<svg ', '<svg class=\"w-full h-full filter drop-shadow-xl\" ').replace('</style>', `</style>${defsString}`)"
);
content = content.replace(
  "anatomyBackRaw.replace('<svg ', '<svg class=\"w-full h-full filter drop-shadow-xl\" ')",
  "anatomyBackRaw.replace('<svg ', '<svg class=\"w-full h-full filter drop-shadow-xl\" ').replace('</style>', `</style>${defsString}`)"
);

// Delete the external <svg> element containing defs
content = content.replace(/<svg width="0" height="0" className="absolute">[\s\S]*?<\/svg>/g, '');

fs.writeFileSync('client/src/components/fitness/MuscleDiagram.jsx', content);
console.log('Fixed MuscleDiagram');
