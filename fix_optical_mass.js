const fs = require('fs');

// 1. MuscleDiagram.jsx opacity to 0.45
let mdContent = fs.readFileSync('client/src/components/fitness/MuscleDiagram.jsx', 'utf8');
mdContent = mdContent.replace(/group\.style\.opacity = '0\.35';/g, "group.style.opacity = '0.45';");
fs.writeFileSync('client/src/components/fitness/MuscleDiagram.jsx', mdContent);

// 2. anatomy.svg opacity to 0.45, stroke to 0.7 for lighter visual mass
let frontSvg = fs.readFileSync('client/src/assets/anatomy.svg', 'utf8');
frontSvg = frontSvg.replace(/opacity="0\.35"/g, 'opacity="0.45"');
frontSvg = frontSvg.replace(/stroke-width: 1\.2;/g, 'stroke-width: 0.8;');
fs.writeFileSync('client/src/assets/anatomy.svg', frontSvg);

// 3. anatomy_back.svg stroke to 1.6 for heavier visual mass
let backSvg = fs.readFileSync('client/src/assets/anatomy_back.svg', 'utf8');
backSvg = backSvg.replace(/stroke-width: 1\.2;/g, 'stroke-width: 1.6;');
fs.writeFileSync('client/src/assets/anatomy_back.svg', backSvg);

console.log('Fixed optical mass and opacity');
