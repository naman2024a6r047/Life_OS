const fs = require('fs');

const oldJsx = fs.readFileSync('client/src/assets/old_muscle.jsx', 'utf8');

// We split by "/* " to easily isolate each block
const blocks = oldJsx.split('/* ');
const groups = {};

for (const block of blocks) {
  if (!block.includes('paths) */')) continue;
  
  const headerMatch = block.match(/^([A-Z_]+)\s\(\d+\spaths\)\s\*\//);
  if (!headerMatch) continue;
  
  const name = headerMatch[1].toLowerCase();
  
  // Extract paths
  const dRegex = /d="([^"]+)"/g;
  let dMatch;
  const paths = [];
  while ((dMatch = dRegex.exec(block)) !== null) {
    paths.push(dMatch[1]);
  }
  
  groups[name] = paths;
}

// Map the old group names to the new required SVG IDs
const map = {
  head: groups['head'] || [],
  chest: groups['chest'] || [],
  deltoids: groups['deltoids_front'] || [],
  biceps: groups['biceps'] || [],
  trapezius: groups['traps'] || [],
  // empty
  neck: [], abs: [], obliques: [], forearm: [], hands: [], adductors: [], quadriceps: [], shins: [], ankles: [], feet: []
};

// Also keep the trash paths
const trashPaths = groups['trash_/_decorative'] || [];

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

if (trashPaths.length > 0) {
  svg += `  <g id="unmapped_decorative" fill="#4a5068" opacity="0.5">\n`;
  trashPaths.forEach((d, i) => {
    svg += `    <path d="${d}"/>\n`;
  });
  svg += `  </g>\n`;
}

svg += `</svg>`;

// The user wants it in anatomy.svg, so we'll overwrite anatomy.svg with our properly grouped version!
fs.writeFileSync('client/src/assets/anatomy.svg', svg);
console.log('Successfully generated anatomy.svg with mapped groups!');
