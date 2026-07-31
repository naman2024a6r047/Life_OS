const fs = require('fs');

// 1. MuscleDiagram.jsx updates
let mdContent = fs.readFileSync('client/src/components/fitness/MuscleDiagram.jsx', 'utf8');

// A. Opacity updates in useEffect
mdContent = mdContent.replace(
  /group\.style\.filter = 'drop-shadow\(0px 0px 8px rgba\(192, 132, 252, 0\.9\)\)';/g,
  "group.style.filter = 'drop-shadow(0px 0px 8px rgba(192, 132, 252, 0.9))';\n          group.style.opacity = '1';"
);
mdContent = mdContent.replace(
  /group\.style\.filter = 'drop-shadow\(0px 0px 7px rgba\(168, 85, 247, 0\.85\)\)';/g,
  "group.style.filter = 'drop-shadow(0px 0px 7px rgba(168, 85, 247, 0.85))';\n          group.style.opacity = '1';"
);
mdContent = mdContent.replace(
  /group\.style\.filter = 'drop-shadow\(0px 0px 5px rgba\(56, 189, 248, 0\.65\)\)';/g,
  "group.style.filter = 'drop-shadow(0px 0px 5px rgba(56, 189, 248, 0.65))';\n          group.style.opacity = '1';"
);
mdContent = mdContent.replace(
  /group\.style\.filter = 'none';/g,
  "group.style.filter = 'none';\n          group.style.opacity = '0.35';"
);

// B. Front SVG visual offset
// To match visual mass (reduce front by ~6% and align feet), apply scale and translate.
// Also add -mt-4 to move everything up.
mdContent = mdContent.replace(
  /className={`relative w-full h-full \${viewMode === 'both' \? 'grid grid-cols-2 gap-10 px-4' : 'flex justify-center items-center'}`}/,
  'className={`relative w-full h-full -mt-6 ${viewMode === \'both\' ? \'grid grid-cols-2 gap-10 px-4\' : \'flex justify-center items-center\'}`}'
);

mdContent = mdContent.replace(
  /<div className="w-full h-full flex items-center justify-center">\n\s*<div \n\s*className="w-full h-full flex justify-center items-center"\n\s*dangerouslySetInnerHTML={{ __html: anatomyFrontRaw/g,
  '<div className="w-full h-full flex items-center justify-center" style={{ transform: \'scale(0.94) translateY(3%)\' }}>\n            <div \n              className="w-full h-full flex justify-center items-center"\n              dangerouslySetInnerHTML={{ __html: anatomyFrontRaw'
);

// C. Shorten center divider
mdContent = mdContent.replace(
  /<div className="absolute left-1\/2 top-0 bottom-0 w-px bg-border-subtle -translate-x-1\/2 pointer-events-none" \/>/g,
  '<div className="absolute left-1/2 top-4 bottom-12 w-px bg-border-subtle -translate-x-1/2 pointer-events-none" />'
);

fs.writeFileSync('client/src/components/fitness/MuscleDiagram.jsx', mdContent);

// 2. anatomy.svg updates
let frontSvg = fs.readFileSync('client/src/assets/anatomy.svg', 'utf8');
// Thinner outlines for inactive muscle paths (default is thinner, hovered/active can stay or we just make base thinner)
// The user said "slightly thinner outline if necessary" for inactive. 
// We previously set stroke-width: 2.0. Let's make it 1.2
frontSvg = frontSvg.replace(
  /stroke-width: 2\.0;/g,
  'stroke-width: 1.2;'
);
// Update unmapped decorative opacity
frontSvg = frontSvg.replace(
  /opacity="1"/g,
  'opacity="0.35"'
);
fs.writeFileSync('client/src/assets/anatomy.svg', frontSvg);

// 3. anatomy_back.svg updates
let backSvg = fs.readFileSync('client/src/assets/anatomy_back.svg', 'utf8');
backSvg = backSvg.replace(
  /stroke-width: 2\.0;/g,
  'stroke-width: 1.2;'
);
fs.writeFileSync('client/src/assets/anatomy_back.svg', backSvg);

console.log('Applied final visual refinements');
