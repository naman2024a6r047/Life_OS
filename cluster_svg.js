const fs = require('fs');
const path = require('path');

const svgFile = path.join(__dirname, 'client/src/assets/anatomy.svg');
const content = fs.readFileSync(svgFile, 'utf-8');

// Extract all 'd' attributes from paths
const pathRegex = /d="([^"]+)"/g;
let match;
const paths = [];

while ((match = pathRegex.exec(content)) !== null) {
    paths.push(match[1]);
}

console.log(`Found ${paths.length} paths in the SVG.`);

function getBoundingBox(d) {
    const coords = d.match(/-?\d+(\.\d+)?/g);
    if (!coords) return { xMin: 0, xMax: 0, yMin: 0, yMax: 0, cx: 0, cy: 0 };
    
    const x = [];
    const y = [];
    
    // Simplistic extraction: assume alternating x, y (not perfectly accurate for all SVG commands, but good enough for rough clustering of mostly absolute curves)
    let currentX = 0, currentY = 0;
    
    // We will just grab all numbers and assume they are coordinates.
    // For a better approximation, let's just use the first 'M' coordinate as the anchor.
    const mMatch = d.match(/M\s*(-?\d+)\s*(-?\d+)/);
    let startX = 0, startY = 0;
    if (mMatch) {
        startX = parseFloat(mMatch[1]);
        startY = parseFloat(mMatch[2]);
    }
    
    return { cx: startX, cy: startY, d };
}

const categorized = {
    head: [],
    chest: [],
    core: [],
    obliques: [],
    quads: [],
    calves: [],
    biceps: [],
    forearms: [],
    deltoids_front: [],
    traps: []
};

paths.forEach((d) => {
    const { cx, cy } = getBoundingBox(d);
    
    // Anatomy SVG Viewbox: 0 0 163 393.75
    // Head: cy < 45
    // Shoulders/Traps: cy 45-70, cx near center
    // Chest: cy 70-110, cx 50-110
    // Core (Abs): cy 110-170, cx 60-100
    // Obliques: cy 110-170, cx <60 or >100
    // Quads: cy 170-260
    // Calves: cy 260-350
    // Arms (Biceps/Delts): cy 70-140, cx <50 or >110
    // Forearms: cy 140-190, cx <50 or >110
    
    if (cy < 45) {
        categorized.head.push(d);
    } else if (cy >= 45 && cy < 70) {
        categorized.traps.push(d);
    } else if (cy >= 70 && cy < 110) {
        if (cx > 50 && cx < 110) categorized.chest.push(d);
        else categorized.deltoids_front.push(d);
    } else if (cy >= 110 && cy < 160) {
        if (cx > 65 && cx < 95) categorized.core.push(d);
        else if (cx > 55 && cx < 105) categorized.obliques.push(d);
        else categorized.biceps.push(d);
    } else if (cy >= 160 && cy < 260) {
        if (cx > 50 && cx < 110) categorized.quads.push(d);
        else categorized.forearms.push(d);
    } else if (cy >= 260) {
        categorized.calves.push(d);
    }
});

let output = '';
for (const [group, groupPaths] of Object.entries(categorized)) {
    output += `\n/* ${group.toUpperCase()} (${groupPaths.length} paths) */\n`;
    groupPaths.forEach(d => {
        output += `<path d="${d}" fill={getMuscleFill('${group === 'head' ? 'none' : group}')} filter={getMuscleFilter('${group === 'head' ? 'none' : group}')} onClick={() => handleSelect('${group}')} />\n`;
    });
}

fs.writeFileSync('svg_clustered.txt', output);
console.log('Clustered SVG written to svg_clustered.txt');
