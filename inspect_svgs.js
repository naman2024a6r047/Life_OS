
const fs = require('fs');

// Read the original anatomy SVG (UTF-16 LE encoded)
const original = fs.readFileSync('original_anatomy.svg', 'utf16le');

// Extract the SVG tag
const svgTag = original.match(/<svg[^>]+>/)[0];
console.log('=== ORIGINAL SVG TAG ===');
console.log(svgTag);

// The original viewBox
console.log('\n=== ORIGINAL VIEWBOX ===');
const vb = svgTag.match(/viewBox="([^"]+)"/);
console.log(vb ? vb[1] : 'NOT FOUND');

// Check if it has named groups (<g id="...">)
const namedGroups = [...original.matchAll(/<g\s+id="([^"]+)"/g)];
console.log('\n=== NAMED GROUPS ===');
namedGroups.forEach(g => console.log(g[1]));

// Check classes used
const classes = [...original.matchAll(/class="([^"]+)"/g)];
const uniqueClasses = [...new Set(classes.map(c => c[1]))];
console.log('\n=== UNIQUE CLASSES ===');
uniqueClasses.forEach(c => console.log(c));

// Count total paths
const paths = [...original.matchAll(/<path/g)];
console.log('\n=== TOTAL PATHS ===');
console.log(paths.length);

// Get bounding box from path data
const coords = [...original.matchAll(/(?:M|L|C)\s*(-?\d+\.?\d*)\s*[\s,]\s*(-?\d+\.?\d*)/gi)];
let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
coords.forEach(m => {
  const x = parseFloat(m[1]);
  const y = parseFloat(m[2]);
  if (x < minX) minX = x;
  if (x > maxX) maxX = x;
  if (y < minY) minY = y;
  if (y > maxY) maxY = y;
});
console.log('\n=== ARTWORK BOUNDS ===');
console.log(`minX: ${minX}, minY: ${minY}, maxX: ${maxX}, maxY: ${maxY}`);
console.log(`Width: ${maxX - minX}, Height: ${maxY - minY}`);

// Now also check the CURRENT anatomy.svg
const current = fs.readFileSync('client/src/assets/anatomy.svg', 'utf8');
const currentSvgTag = current.match(/<svg[^>]+>/)[0];
console.log('\n=== CURRENT FRONT SVG TAG ===');
console.log(currentSvgTag);

const currentNamedGroups = [...current.matchAll(/<g\s+id="([^"]+)"/g)];
console.log('\n=== CURRENT FRONT NAMED GROUPS ===');
currentNamedGroups.forEach(g => console.log(g[1]));

const currentPaths = [...current.matchAll(/<path/g)];
console.log('\n=== CURRENT FRONT TOTAL PATHS ===');
console.log(currentPaths.length);

// And the CURRENT anatomy_back.svg
const back = fs.readFileSync('client/src/assets/anatomy_back.svg', 'utf8');
const backSvgTag = back.match(/<svg[^>]+>/)[0];
console.log('\n=== CURRENT BACK SVG TAG ===');
console.log(backSvgTag);

const backNamedGroups = [...back.matchAll(/<g\s+id="([^"]+)"/g)];
console.log('\n=== CURRENT BACK NAMED GROUPS ===');
backNamedGroups.forEach(g => console.log(g[1]));

const backPaths = [...back.matchAll(/<path/g)];
console.log('\n=== CURRENT BACK TOTAL PATHS ===');
console.log(backPaths.length);

// Get back artwork bounds  
const backCoords = [...back.matchAll(/(?:M|L|C)\s*(-?\d+\.?\d*)\s*[\s,]\s*(-?\d+\.?\d*)/gi)];
let bMinX=Infinity, bMinY=Infinity, bMaxX=-Infinity, bMaxY=-Infinity;
backCoords.forEach(m => {
  const x = parseFloat(m[1]);
  const y = parseFloat(m[2]);
  if (x < bMinX) bMinX = x;
  if (x > bMaxX) bMaxX = x;
  if (y < bMinY) bMinY = y;
  if (y > bMaxY) bMaxY = y;
});
console.log('\n=== BACK ARTWORK BOUNDS ===');
console.log(`minX: ${bMinX}, minY: ${bMinY}, maxX: ${bMaxX}, maxY: ${bMaxY}`);
console.log(`Width: ${bMaxX - bMinX}, Height: ${bMaxY - bMinY}`);

// Aspect ratios
const origAR = (maxX - minX) / (maxY - minY);
const backAR = (bMaxX - bMinX) / (bMaxY - bMinY);
console.log('\n=== ASPECT RATIOS ===');
console.log(`Original front artwork: ${origAR.toFixed(4)}`);
console.log(`Back artwork: ${backAR.toFixed(4)}`);
