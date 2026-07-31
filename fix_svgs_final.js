const fs = require('fs');

// ============================================================
// STEP 1: Rebuild anatomy.svg from original_anatomy.svg
// ============================================================

// Read the original (UTF-16 LE encoded)
const original = fs.readFileSync('original_anatomy.svg', 'utf16le');

// The original has viewBox="0 0 163 393.75" and uses class="fil0" on all paths
// with no named muscle groups. The current anatomy.svg has named groups
// (head, chest, deltoids_front, etc.) which are needed for the muscle activation logic.
// 
// So we need the CURRENT anatomy.svg's structure (named groups), but we need to
// remove any back-SVG paths that were accidentally mixed in.

const current = fs.readFileSync('client/src/assets/anatomy.svg', 'utf8');

// Find and remove paths with coordinates > 200 in X (back SVG contamination)
// These are paths like: M1071.06 308.94... or M1163.98 302.12...
let cleaned = current;

// Find all path elements and check if they contain high-X M commands
const pathRegex = /<path[^>]*d="([^"]+)"[^>]*\/>/g;
let match;
const pathsToRemove = [];
while ((match = pathRegex.exec(current)) !== null) {
  const pathData = match[1];
  // Check for M commands with X > 200 (clearly back SVG data)
  const mCommands = [...pathData.matchAll(/M\s*(-?\d+\.?\d*)\s*[\s,]?\s*(-?\d+\.?\d*)/g)];
  const hasHighX = mCommands.some(m => parseFloat(m[1]) > 200);
  if (hasHighX) {
    pathsToRemove.push({ fullMatch: match[0], pathData: pathData.substring(0, 50) + '...' });
  }
}

console.log(`Found ${pathsToRemove.length} contaminated paths to remove:`);
pathsToRemove.forEach(p => console.log('  -', p.pathData));

// Remove contaminated paths
pathsToRemove.forEach(p => {
  cleaned = cleaned.replace(p.fullMatch + '\r\n', '');
  cleaned = cleaned.replace(p.fullMatch + '\n', '');
  cleaned = cleaned.replace(p.fullMatch, '');
});

// Now set the viewBox to the original's viewBox: "0 0 163 393.75"
// This is the correct canvas for the front body
cleaned = cleaned.replace(
  /viewBox="[^"]+"/,
  'viewBox="0 0 163 393.75"'
);

// Set stroke width to 1.0 (good visibility for the small coordinate space)
cleaned = cleaned.replace(
  /stroke-width: [^;]+;/,
  'stroke-width: 1.0;'
);

fs.writeFileSync('client/src/assets/anatomy.svg', cleaned);
console.log('\nFront SVG cleaned and saved with original viewBox.');

// ============================================================
// STEP 2: Fix the back SVG viewBox
// ============================================================

const back = fs.readFileSync('client/src/assets/anatomy_back.svg', 'utf8');

// Back SVG artwork bounds (M-commands only, verified above):
// minX: 789.41, minY: 166.45, maxX: 1383.76, maxY: 1341.35
// Width: 594.35, Height: 1174.9

// The ORIGINAL front SVG viewBox is "0 0 163 393.75"
// Front artwork bounds: minX=-11, minY=-16, maxX=163, maxY=315
// Front artwork: width=174, height=331
// Front viewBox: width=163, height=393.75 (has extra padding at bottom for text)

// For IDENTICAL rendering, we need the back viewBox to have
// the SAME aspect ratio as the front viewBox.
// Front VB AR: 163 / 393.75 = 0.4140

const frontVBAR = 163 / 393.75;
console.log('\nFront viewBox AR:', frontVBAR.toFixed(6));

// Back artwork: 594.35 x 1174.9
// Back artwork AR: 594.35 / 1174.9 = 0.5059
// We need to create a back viewBox with AR = 0.4140
// This means adding horizontal padding to make it narrower relative to height

// Target: backVB_w / backVB_h = 0.4140
// Let's base it on height (tighter fit vertically)
// Add 3% vertical padding:
const backArtH = 1174.9;
const backArtW = 594.35;
const backPadY = backArtH * 0.03; // ~35.25
const backVBH = backArtH + 2 * backPadY; // ~1245.4

// Now calculate width from target AR
const backVBW = backVBH * frontVBAR; // ~515.8

// Center the artwork horizontally within the viewBox
const backCenterX = 789.41 + backArtW / 2; // ~1086.585
const backVBX = backCenterX - backVBW / 2;
const backVBY = 166.45 - backPadY;

console.log('Back viewBox:', `${backVBX.toFixed(2)} ${backVBY.toFixed(2)} ${backVBW.toFixed(2)} ${backVBH.toFixed(2)}`);
console.log('Back viewBox AR:', (backVBW / backVBH).toFixed(6));

// Set the back viewBox
let backFixed = back.replace(
  /viewBox="[^"]+"/,
  `viewBox="${backVBX.toFixed(2)} ${backVBY.toFixed(2)} ${backVBW.toFixed(2)} ${backVBH.toFixed(2)}"`
);

// Set stroke width proportionally
// Front stroke-width: 1.0 in a 163-wide viewBox
// Back should be: 1.0 * (backVBW / 163) = ~3.16
const backStroke = (1.0 * backVBW / 163).toFixed(1);
console.log('Back stroke width:', backStroke);
backFixed = backFixed.replace(
  /stroke-width: [^;]+;/,
  `stroke-width: ${backStroke};`
);

fs.writeFileSync('client/src/assets/anatomy_back.svg', backFixed);
console.log('Back SVG fixed and saved.');

// ============================================================
// VERIFICATION
// ============================================================
console.log('\n=== FINAL VERIFICATION ===');
const finalFront = fs.readFileSync('client/src/assets/anatomy.svg', 'utf8');
const finalBack = fs.readFileSync('client/src/assets/anatomy_back.svg', 'utf8');
const fVB = finalFront.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
const bVB = finalBack.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
console.log('Front viewBox:', fVB.join(', '), '| AR:', (fVB[2]/fVB[3]).toFixed(6));
console.log('Back viewBox:', bVB.map(v=>v.toFixed(2)).join(', '), '| AR:', (bVB[2]/bVB[3]).toFixed(6));
console.log('AR match:', Math.abs(fVB[2]/fVB[3] - bVB[2]/bVB[3]) < 0.001 ? 'YES ✓' : 'NO ✗');
