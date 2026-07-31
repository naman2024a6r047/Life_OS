const fs = require('fs');
let content = fs.readFileSync('client/src/components/fitness/MuscleDiagram.jsx', 'utf8');

const defsLiteral = `<defs><linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient><linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#0ea5e9" /></linearGradient><linearGradient id="inactiveGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3f3f46" /><stop offset="100%" stopColor="#27272a" /></linearGradient><linearGradient id="hoverGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#d8b4fe" /><stop offset="100%" stopColor="#c084fc" /></linearGradient></defs>`;

content = content.replace(/`<\/style>\$\{defsString\}`/g, `'</style>${defsLiteral}'`);
fs.writeFileSync('client/src/components/fitness/MuscleDiagram.jsx', content);
console.log('Fixed MuscleDiagram crash');
