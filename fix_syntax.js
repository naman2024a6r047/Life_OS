const fs = require('fs');
let content = fs.readFileSync('client/src/components/fitness/MuscleDiagram.jsx', 'utf8');

content = content.replace(
  /preserveAspectRatio="xMidYMid meet" \)\.replace/g,
  'preserveAspectRatio="xMidYMid meet" \').replace'
);

fs.writeFileSync('client/src/components/fitness/MuscleDiagram.jsx', content);
console.log('Fixed syntax error');
