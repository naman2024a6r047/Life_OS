const fs = require('fs');
let content = fs.readFileSync('client/src/pages/GymDashboard.jsx', 'utf8');

content = content.replace(
  'className="btn-primary text-sm w-full py-4 bg-gradient-to-r from-purple to-purple-accent text-white font-bold flex items-center justify-center gap-2 shadow-glow-primary rounded-xl px-4"',
  'className="btn-primary text-sm w-full py-4 bg-gradient-to-r from-purple via-purple-accent to-purple text-white font-bold flex items-center justify-center gap-2 shadow-glow-primary rounded-xl px-4"'
);

fs.writeFileSync('client/src/pages/GymDashboard.jsx', content);
console.log('Fixed CTA gradient');
