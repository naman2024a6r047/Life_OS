const fs = require('fs');
const backSvg = fs.readFileSync('client/src/assets/anatomy_back.svg', 'utf8');

// Map back muscle names to front muscle names
const replacementMap = {
  'upperBack': 'chest',
  'lowerBack': 'abs',
  'gluteal': 'obliques', // roughly the hip area
  'hamstring': 'quadriceps',
  'calves': 'shins', // front of lower leg
  'triceps': 'biceps',
  'forearm': 'forearm', // same
  'trapezius': 'trapezius',
  'deltoids': 'deltoids',
  'head': 'head',
  'neck': 'neck',
  'hair': 'hair'
};

let frontSvg = backSvg;

// We need to inject the transform inside every <g> or just wrap everything in a <g transform="...">
// But it's easier to just wrap all the <g> elements.
// The viewBox is viewBox="755 78 662 1268"
// X center = 755 + 662/2 = 1086
// translate = 1086 * 2 = 2172
const transformStr = 'transform="translate(2172, 0) scale(-1, 1)"';

// Replace all IDs and data-muscle
for (const [backName, frontName] of Object.entries(replacementMap)) {
  frontSvg = frontSvg.replace(new RegExp(`id="${backName}"`, 'g'), `id="${frontName}"`);
  frontSvg = frontSvg.replace(new RegExp(`data-muscle="${backName}"`, 'g'), `data-muscle="${frontName}"`);
}

// Wrap all <g> elements in the transform group
frontSvg = frontSvg.replace(/<g id=/g, `<g ${transformStr}><g id=`);
frontSvg = frontSvg.replace(/<\/g>/g, `<\/g><\/g>`);

fs.writeFileSync('client/src/assets/anatomy.svg', frontSvg);
console.log('Successfully generated anatomy.svg by flipping anatomy_back.svg!');
