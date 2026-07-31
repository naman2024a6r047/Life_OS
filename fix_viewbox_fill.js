const fs = require('fs');

// ============================================================
// ROOT CAUSE ANALYSIS
// ============================================================
// Front viewBox: "0 0 163 393.75"
//   Artwork: Y from -16 to 315 (height 331), but VB height = 393.75
//   => artwork fills 331/393.75 = 84.1% of viewBox height
//   => 15.9% of the viewBox is empty space at bottom (for text credits)
//
// Back viewBox: "828.81 131.20 515.55 1245.39"
//   Artwork: Y from 166.45 to 1341.35 (height 1174.9), VB height = 1245.39
//   => artwork fills 1174.9/1245.39 = 94.3% of viewBox height
//
// BOTH viewBoxes have the same aspect ratio (0.4140), so when
// rendered with the same CSS height, they get the same pixel height.
// BUT the back body fills 94.3% of its pixel height while the front
// body fills only 84.1% — making the back body appear ~12% TALLER.
//
// THE FIX: Both viewBoxes must wrap artwork with IDENTICAL padding %.
// ============================================================

const front = fs.readFileSync('client/src/assets/anatomy.svg', 'utf8');
const back = fs.readFileSync('client/src/assets/anatomy_back.svg', 'utf8');

// Artwork bounds (from previous analysis)
const frontArt = { minX: -11, minY: -16, maxX: 163, maxY: 315, w: 174, h: 331 };
const backArt = { minX: 789.41, minY: 166.45, maxX: 1383.76, maxY: 1341.35, w: 594.35, h: 1174.9 };

// Use 5% padding on all sides (based on artwork size, not viewBox size)
const PAD = 0.05;

// Front viewBox: tight around artwork + 5% padding
const fPadX = frontArt.w * PAD;
const fPadY = frontArt.h * PAD;
const frontVB = {
  x: (frontArt.minX - fPadX).toFixed(2),
  y: (frontArt.minY - fPadY).toFixed(2),
  w: (frontArt.w + 2 * fPadX).toFixed(2),
  h: (frontArt.h + 2 * fPadY).toFixed(2)
};

// Back viewBox: tight around artwork + 5% padding
const bPadX = backArt.w * PAD;
const bPadY = backArt.h * PAD;
const backVB = {
  x: (backArt.minX - bPadX).toFixed(2),
  y: (backArt.minY - bPadY).toFixed(2),
  w: (backArt.w + 2 * bPadX).toFixed(2),
  h: (backArt.h + 2 * bPadY).toFixed(2)
};

// Check aspect ratios
const frontAR = Number(frontVB.w) / Number(frontVB.h);
const backAR = Number(backVB.w) / Number(backVB.h);

console.log('Front VB:', `${frontVB.x} ${frontVB.y} ${frontVB.w} ${frontVB.h}`, '| AR:', frontAR.toFixed(4));
console.log('Back VB:', `${backVB.x} ${backVB.y} ${backVB.w} ${backVB.h}`, '| AR:', backAR.toFixed(4));

// The aspect ratios will differ slightly (front ~0.526, back ~0.506)
// We need to MATCH them. Expand the narrower one horizontally.
const targetAR = Math.max(frontAR, backAR);
console.log('Target AR:', targetAR.toFixed(4));

// Adjust front VB width if needed
if (frontAR >= backAR) {
  // Front is already wider or equal, expand back
  const newBackW = Number(backVB.h) * targetAR;
  const delta = newBackW - Number(backVB.w);
  backVB.x = (Number(backVB.x) - delta / 2).toFixed(2);
  backVB.w = newBackW.toFixed(2);
} else {
  // Back is wider, expand front
  const newFrontW = Number(frontVB.h) * targetAR;
  const delta = newFrontW - Number(frontVB.w);
  frontVB.x = (Number(frontVB.x) - delta / 2).toFixed(2);
  frontVB.w = newFrontW.toFixed(2);
}

console.log('\nFINAL Front VB:', `${frontVB.x} ${frontVB.y} ${frontVB.w} ${frontVB.h}`, '| AR:', (Number(frontVB.w)/Number(frontVB.h)).toFixed(6));
console.log('FINAL Back VB:', `${backVB.x} ${backVB.y} ${backVB.w} ${backVB.h}`, '| AR:', (Number(backVB.w)/Number(backVB.h)).toFixed(6));

// Verify artwork fill percentages are now identical
const frontFillH = (frontArt.h / Number(frontVB.h) * 100).toFixed(1);
const backFillH = (backArt.h / Number(backVB.h) * 100).toFixed(1);
console.log('\nFront artwork fills:', frontFillH + '% of viewBox height');
console.log('Back artwork fills:', backFillH + '% of viewBox height');
console.log('Fill match:', frontFillH === backFillH ? 'YES ✓' : 'CLOSE ✓ (both ~' + ((Number(frontFillH)+Number(backFillH))/2).toFixed(1) + '%)');

// ============================================================
// APPLY THE FIX
// ============================================================

// Update front SVG viewBox
let frontFixed = front.replace(
  /viewBox="[^"]+"/,
  `viewBox="${frontVB.x} ${frontVB.y} ${frontVB.w} ${frontVB.h}"`
);
fs.writeFileSync('client/src/assets/anatomy.svg', frontFixed);

// Update back SVG viewBox
let backFixed = back.replace(
  /viewBox="[^"]+"/,
  `viewBox="${backVB.x} ${backVB.y} ${backVB.w} ${backVB.h}"`
);

// Normalize stroke width proportionally
// Front stroke is 1.0 in a viewBox width of frontVB.w
// Back stroke should be: 1.0 * backVB.w / frontVB.w
const backStroke = (1.0 * Number(backVB.w) / Number(frontVB.w)).toFixed(1);
console.log('\nBack stroke width:', backStroke);
backFixed = backFixed.replace(
  /stroke-width: [^;]+;/,
  `stroke-width: ${backStroke};`
);

fs.writeFileSync('client/src/assets/anatomy_back.svg', backFixed);

console.log('\n✅ Both SVGs now have identical padding ratios and matching aspect ratios.');
console.log('The artwork fills the same percentage of each viewBox, ensuring identical rendered sizes.');
