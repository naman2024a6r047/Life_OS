const fs = require('fs');

// The issue: my regex parsed relative coordinates as absolute.
// Let me only look at M (moveto) commands which are always absolute coordinates.
const back = fs.readFileSync('client/src/assets/anatomy_back.svg', 'utf8');

// Extract only absolute M commands (uppercase M followed by coordinates)
const moveToCoords = [...back.matchAll(/M\s*(-?\d+\.?\d*)\s*[\s,]\s*(-?\d+\.?\d*)/g)];
let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
moveToCoords.forEach(m => {
  const x = parseFloat(m[1]);
  const y = parseFloat(m[2]);
  if (x < minX) minX = x;
  if (x > maxX) maxX = x;
  if (y < minY) minY = y;
  if (y > maxY) maxY = y;
});
console.log('=== BACK SVG M-command bounds ===');
console.log(`minX: ${minX}, minY: ${minY}, maxX: ${maxX}, maxY: ${maxY}`);
console.log(`Width: ${maxX - minX}, Height: ${maxY - minY}`);
console.log(`Aspect ratio: ${((maxX - minX) / (maxY - minY)).toFixed(4)}`);

// Now front
const front = fs.readFileSync('client/src/assets/anatomy.svg', 'utf8');
const frontMoveToCoords = [...front.matchAll(/M\s*(-?\d+\.?\d*)\s*[\s,]\s*(-?\d+\.?\d*)/g)];
let fMinX=Infinity, fMinY=Infinity, fMaxX=-Infinity, fMaxY=-Infinity;
frontMoveToCoords.forEach(m => {
  const x = parseFloat(m[1]);
  const y = parseFloat(m[2]);
  if (x < fMinX) fMinX = x;
  if (x > fMaxX) fMaxX = x;
  if (y < fMinY) fMinY = y;
  if (y > fMaxY) fMaxY = y;
});
console.log('\n=== FRONT SVG M-command bounds ===');
console.log(`minX: ${fMinX}, minY: ${fMinY}, maxX: ${fMaxX}, maxY: ${fMaxY}`);
console.log(`Width: ${fMaxX - fMinX}, Height: ${fMaxY - fMinY}`);
console.log(`Aspect ratio: ${((fMaxX - fMinX) / (fMaxY - fMinY)).toFixed(4)}`);

// Current viewBoxes
console.log('\n=== CURRENT VIEWBOXES ===');
console.log('Front:', front.match(/viewBox="([^"]+)"/)[1]);
console.log('Back:', back.match(/viewBox="([^"]+)"/)[1]);

// The real fix: both SVGs need viewBoxes that properly frame their artwork
// with identical aspect ratios AND identical padding percentages.
// Since both use preserveAspectRatio="xMidYMid meet", if the viewBox AR matches,
// they will render at the same size when given the same CSS height.

// Let me compute proper tight viewBoxes with 3% padding:
const pad = 0.03;

const fW = fMaxX - fMinX;
const fH = fMaxY - fMinY;
const fPadX = fW * pad;
const fPadY = fH * pad;
const frontVB = {
  x: fMinX - fPadX,
  y: fMinY - fPadY,
  w: fW + 2 * fPadX,
  h: fH + 2 * fPadY
};

const bW = maxX - minX;
const bH = maxY - minY;
const bPadX = bW * pad;
const bPadY = bH * pad;
const backVB = {
  x: minX - bPadX,
  y: minY - bPadY,
  w: bW + 2 * bPadX,
  h: bH + 2 * bPadY
};

console.log('\n=== COMPUTED TIGHT VIEWBOXES ===');
console.log('Front:', frontVB);
console.log('Front AR:', (frontVB.w / frontVB.h).toFixed(4));
console.log('Back:', backVB);
console.log('Back AR:', (backVB.w / backVB.h).toFixed(4));

// Now normalize to same AR by expanding the narrower one horizontally
const targetAR = Math.max(frontVB.w / frontVB.h, backVB.w / backVB.h);
console.log('\nTarget AR:', targetAR.toFixed(4));

// Adjust front
if (frontVB.w / frontVB.h < targetAR) {
  const newW = frontVB.h * targetAR;
  const delta = newW - frontVB.w;
  frontVB.x -= delta / 2;
  frontVB.w = newW;
}

// Adjust back
if (backVB.w / backVB.h < targetAR) {
  const newW = backVB.h * targetAR;
  const delta = newW - backVB.w;
  backVB.x -= delta / 2;
  backVB.w = newW;
}

console.log('\n=== NORMALIZED VIEWBOXES (SAME AR) ===');
console.log('Front:', `${frontVB.x.toFixed(2)} ${frontVB.y.toFixed(2)} ${frontVB.w.toFixed(2)} ${frontVB.h.toFixed(2)}`);
console.log('Front AR:', (frontVB.w / frontVB.h).toFixed(6));
console.log('Back:', `${backVB.x.toFixed(2)} ${backVB.y.toFixed(2)} ${backVB.w.toFixed(2)} ${backVB.h.toFixed(2)}`);
console.log('Back AR:', (backVB.w / backVB.h).toFixed(6));
