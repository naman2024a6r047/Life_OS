const fs = require('fs');

function getBounds(filename, validXMin, validXMax) {
  const content = fs.readFileSync(filename, 'utf8');
  const paths = [...content.matchAll(/d="([^"]+)"/g)].map(m => m[1]);
  let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
  paths.forEach(p => {
    [...p.matchAll(/(?:M|L|C)\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)|(?:M|L|C)\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/gi)].forEach(m => {
      const x = parseFloat(m[1]||m[3]);
      const y = parseFloat(m[2]||m[4]);
      if (x === 0 && y === 0) return;
      if (x >= validXMin && x <= validXMax) {
        if(x<minX) minX=x;
        if(x>maxX) maxX=x;
        if(y<minY) minY=y;
        if(y>maxY) maxY=y;
      }
    });
  });
  return {minX, minY, maxX, maxY, width: maxX-minX, height: maxY-minY};
}

const fBounds = getBounds('client/src/assets/anatomy.svg', -50, 300);
const bBounds = getBounds('client/src/assets/anatomy_back.svg', 500, 1600);

console.log('Front True Bounds:', fBounds);
console.log('Back True Bounds:', bBounds);
