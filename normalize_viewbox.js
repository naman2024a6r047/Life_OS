// This script takes a completely different approach:
// Instead of using a <g transform> wrapper, we'll rewrite every single 
// coordinate in anatomy_back.svg to map directly into the front SVG's coordinate space.
//
// This ensures both SVGs have IDENTICAL coordinate systems with NO transforms.

const fs = require('fs');

// Step 1: Read the current back SVG (which has the transform wrapper)
let backSvg = fs.readFileSync('client/src/assets/anatomy_back.svg', 'utf8');

// Step 2: Remove the transform wrapper <g> that was previously added
backSvg = backSvg.replace(
  /\s*<g transform="translate\(-230\.126, -62\.894\) scale\(0\.281726\)">/,
  ''
);
// Remove the closing </g> for that wrapper (it's the second-to-last </g> before </svg>)
// The closing </g> for the transform wrapper is on the line before </svg>
backSvg = backSvg.replace(/\s*<\/g>\s*<\/svg>/, '\n</svg>');

// Step 3: Parse the raw back SVG path coordinates
// Back SVG true bounds (raw coordinates): 
//   minX: 789.41, minY: 166.45, maxX: 1383.76, maxY: 1341.35
// Front SVG true bounds:
//   minX: -11, minY: -16, maxX: 163, maxY: 315

const backBounds = { minX: 789.41, minY: 166.45, width: 594.35, height: 1174.9 };
const frontBounds = { minX: -11, minY: -16, width: 174, height: 331 };

// Scale factor (uniform, fit by height since aspect ratios are similar)
const scale = frontBounds.height / backBounds.height; // 331 / 1174.9 = 0.281726

// Center horizontally
const scaledWidth = backBounds.width * scale; // ~167.44
const xOffset = frontBounds.minX + (frontBounds.width - scaledWidth) / 2; // center

// Transform function: maps back coordinate to front coordinate space
function transformX(x) {
  return (x - backBounds.minX) * scale + xOffset;
}
function transformY(y) {
  return (y - backBounds.minY) * scale + frontBounds.minY;
}

// Step 4: Transform ALL path data coordinates
// SVG path commands: M, L, C, Q, S, T, A, H, V, Z (and lowercase relative versions)
// We need to transform absolute coordinates and leave relative ones alone.
// BUT - many of these paths use absolute commands (uppercase).

// A more robust approach: transform all numbers in path data that represent coordinates.
// However this is extremely complex for general SVG paths.
// 
// Instead, let's use the <g transform> approach but verify it's correct.
// The issue might be that the viewBox already accounts for the content bounds
// and preserveAspectRatio="xMidYMid meet" handles the rest.

// Actually, let me try a completely different strategy:
// Make both SVGs use their NATIVE coordinate systems, but set their viewBox
// to tightly wrap only the visible artwork with identical padding ratios.

// FRONT SVG: artwork at (-11, -16) to (163, 315), so 174x331
// Add 5% padding on each side:
const padPct = 0.05;
const frontPadX = frontBounds.width * padPct;  // 8.7
const frontPadY = frontBounds.height * padPct; // 16.55
const frontVB = {
  x: frontBounds.minX - frontPadX,
  y: frontBounds.minY - frontPadY,
  w: frontBounds.width + 2 * frontPadX,
  h: frontBounds.height + 2 * frontPadY
};

// BACK SVG: artwork at (789.41, 166.45) to (1383.76, 1341.35), so 594.35x1174.9
const backPadX = backBounds.width * padPct;  // 29.7
const backPadY = backBounds.height * padPct; // 58.7
const backVB = {
  x: backBounds.minX - backPadX,
  y: backBounds.minY - backPadY,
  w: backBounds.width + 2 * backPadX,
  h: backBounds.height + 2 * backPadY
};

// Now the KEY insight: both viewBoxes must have the SAME aspect ratio
// for the SVGs to render at the same size when given identical CSS dimensions.
const frontAR = frontVB.w / frontVB.h;
const backAR = backVB.w / backVB.h;

console.log('Front viewBox:', frontVB, 'AR:', frontAR.toFixed(4));
console.log('Back viewBox:', backVB, 'AR:', backAR.toFixed(4));

// If aspect ratios differ, we need to expand one to match.
// Since we use preserveAspectRatio="xMidYMid meet", the browser will
// scale to fit the smaller dimension. If the VB aspect ratios match,
// both SVGs will fill identically.

// Let's use the WIDER aspect ratio (more square) and pad the narrower one.
const targetAR = Math.max(frontAR, backAR);

// Adjust front viewBox to match target AR
if (frontAR < targetAR) {
  const newW = frontVB.h * targetAR;
  const delta = newW - frontVB.w;
  frontVB.x -= delta / 2;
  frontVB.w = newW;
}

// Adjust back viewBox to match target AR
if (backAR < targetAR) {
  const newW = backVB.h * targetAR;
  const delta = newW - backVB.w;
  backVB.x -= delta / 2;
  backVB.w = newW;
}

console.log('\nNormalized Front viewBox:', frontVB, 'AR:', (frontVB.w / frontVB.h).toFixed(4));
console.log('Normalized Back viewBox:', backVB, 'AR:', (backVB.w / backVB.h).toFixed(4));

// Step 5: Apply the new viewBox to both SVGs

// Front SVG
let frontSvg = fs.readFileSync('client/src/assets/anatomy.svg', 'utf8');
frontSvg = frontSvg.replace(
  /viewBox="[^"]+"/,
  `viewBox="${frontVB.x.toFixed(2)} ${frontVB.y.toFixed(2)} ${frontVB.w.toFixed(2)} ${frontVB.h.toFixed(2)}"`
);
fs.writeFileSync('client/src/assets/anatomy.svg', frontSvg);

// Back SVG - also remove the transform wrapper since we're using viewBox instead
backSvg = backSvg.replace(
  /viewBox="[^"]+"/,
  `viewBox="${backVB.x.toFixed(2)} ${backVB.y.toFixed(2)} ${backVB.w.toFixed(2)} ${backVB.h.toFixed(2)}"`
);
fs.writeFileSync('client/src/assets/anatomy_back.svg', backSvg);

console.log('\nDone! Both SVGs now have matching aspect-ratio viewBoxes.');
console.log(`Front: viewBox="${frontVB.x.toFixed(2)} ${frontVB.y.toFixed(2)} ${frontVB.w.toFixed(2)} ${frontVB.h.toFixed(2)}"`);
console.log(`Back:  viewBox="${backVB.x.toFixed(2)} ${backVB.y.toFixed(2)} ${backVB.w.toFixed(2)} ${backVB.h.toFixed(2)}"`);
