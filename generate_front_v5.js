const fs = require('fs');

const oldJsx = fs.readFileSync('client/src/assets/old_muscle.jsx', 'utf16le');

const regex = /<path[^>]+d="([^"]+)"[^>]+fill=\{getMuscleFill\('([^']+)'\)\}/g;

const groups = {
  head: [], chest: [], deltoids_front: [], biceps: [], traps: [], trash_x_decorative: []
};

let match;
while ((match = regex.exec(oldJsx)) !== null) {
  const d = match[1];
  const name = match[2]; // e.g. 'chest'
  
  if (!groups[name]) groups[name] = [];
  groups[name].push(d);
}

// Map the old group names to the new required SVG IDs
const map = {
  head: groups['none'] || [], 
  chest: groups['chest'] || [],
  deltoids_front: groups['deltoids_front'] || [],
  biceps: groups['biceps'] || [],
  traps: groups['traps'] || [],
  // empty
  neck: [], abs: [], obliques: [], forearm: [], hands: [], adductors: [], quads: [], shins: [], calves: [], feet: []
};

let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 300" fill-rule="evenodd" clip-rule="evenodd">\n`;
svg += `  <style>.muscle path { stroke: #1a1c28; stroke-width: 1.2; }</style>\n`;

for (const [groupName, paths] of Object.entries(map)) {
  svg += `  <g id="${groupName}" class="muscle" data-muscle="${groupName}" fill="#4a5068">\n`;
  if (paths.length > 0) {
    paths.forEach((d, i) => {
      svg += `    <path id="${groupName}-${i}" d="${d}"/>\n`;
    });
  } else {
    // Just a tiny invisible dot so the group exists
    svg += `    <path id="${groupName}-0" d="M0,0 L0,0"/>\n`;
  }
  svg += `  </g>\n`;
}

// Check trash
const trashPaths = [];
const trashRegex = /\/\*\sTRASH \/ DECORATIVE \(\d+\spaths\)\s\*\/([\s\S]*?)<\/svg>/;
const trashMatch = trashRegex.exec(oldJsx);
if (trashMatch) {
  const dRegex = /d="([^"]+)"/g;
  let dMatch;
  while ((dMatch = dRegex.exec(trashMatch[1])) !== null) {
    trashPaths.push(dMatch[1]);
  }
}

if (trashPaths.length > 0) {
  svg += `  <g id="unmapped_decorative" fill="#4a5068" opacity="0.5">\n`;
  trashPaths.forEach((d, i) => {
    svg += `    <path d="${d}"/>\n`;
  });
  svg += `  </g>\n`;
}

svg += `</svg>`;

fs.writeFileSync('client/src/assets/anatomy.svg', svg);
console.log('Successfully generated anatomy.svg with mapped groups! (UTF16 fixed, updated IDs)');
