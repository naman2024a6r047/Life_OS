const fs = require('fs');

// The front viewBox is 191.40 wide, back viewBox is 679.38 wide.
// For equal visual stroke weight, we need:
// frontStroke / frontVBWidth = backStroke / backVBWidth
// 
// Let's target a nice visual stroke. 
// If front stroke = 1.0, then back stroke = 1.0 * (679.38 / 191.40) = 3.55
// 
// Current: front=0.8, back=1.6
// front relative: 0.8/191.4 = 0.00418
// back relative: 1.6/679.38 = 0.00235
// 
// To match, if front = 1.0: back = 1.0 * 679.38/191.40 = 3.55
// If we want them equal, let's use front=1.0 and back=3.55

const ratio = 679.38 / 191.40;
console.log('Scale ratio (back/front viewBox width):', ratio.toFixed(4));

// Let's set front stroke to 1.0 and back stroke to match
const frontStroke = 1.0;
const backStroke = frontStroke * ratio;
console.log('Front stroke:', frontStroke);
console.log('Back stroke:', backStroke.toFixed(2));

// Update front SVG
let frontSvg = fs.readFileSync('client/src/assets/anatomy.svg', 'utf8');
frontSvg = frontSvg.replace(/stroke-width: 0\.8;/g, `stroke-width: ${frontStroke};`);
fs.writeFileSync('client/src/assets/anatomy.svg', frontSvg);

// Update back SVG  
let backSvg = fs.readFileSync('client/src/assets/anatomy_back.svg', 'utf8');
backSvg = backSvg.replace(/stroke-width: 1\.6;/g, `stroke-width: ${backStroke.toFixed(1)};`);
fs.writeFileSync('client/src/assets/anatomy_back.svg', backSvg);

console.log('Done! Stroke widths normalized.');
