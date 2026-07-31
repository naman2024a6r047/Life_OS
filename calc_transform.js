// Precisely calculate the transform needed to map back SVG coordinates
// into the front SVG coordinate space.

// Front SVG true bounds (from get_true_bounds.js):
const front = {
  minX: -11, minY: -16, maxX: 163, maxY: 315,
  width: 174, height: 331
};

// Back SVG true bounds (from get_true_bounds.js):
const back = {
  minX: 789.41, minY: 166.45, maxX: 1383.76, maxY: 1341.35,
  width: 594.35, height: 1174.9
};

// We want to map the back artwork so it occupies the same region as the front artwork.
// The front artwork aspect ratio:
const frontAR = front.width / front.height; // 174/331 = 0.5257
const backAR = back.width / back.height;    // 594.35/1174.9 = 0.5059

console.log('Front aspect ratio:', frontAR.toFixed(4));
console.log('Back aspect ratio:', backAR.toFixed(4));

// Since we want to fit the back artwork into the same visual space as the front,
// we need to scale based on height (since both are taller than wide).
// Scale = front.height / back.height
const scaleByHeight = front.height / back.height;
console.log('Scale by height:', scaleByHeight.toFixed(6));

// Scale = front.width / back.width
const scaleByWidth = front.width / back.width;
console.log('Scale by width:', scaleByWidth.toFixed(6));

// Use "meet" behavior - scale uniformly by the smaller scale factor
// so the entire artwork fits without cropping
const scale = Math.min(scaleByHeight, scaleByWidth);
console.log('Uniform scale (meet):', scale.toFixed(6));

// After scaling, the back artwork's top-left corner moves to:
// scaledMinX = back.minX * scale
// scaledMinY = back.minY * scale
// We want it to be at front.minX, front.minY
// So translateX = front.minX - back.minX * scale
// translateY = front.minY - back.minY * scale

// But we also need to center horizontally if the scaled width is smaller than front width
const scaledBackWidth = back.width * scale;
const scaledBackHeight = back.height * scale;
console.log('Scaled back width:', scaledBackWidth.toFixed(2));
console.log('Scaled back height:', scaledBackHeight.toFixed(2));

// Center the scaled artwork within the front's bounding box
const xOffset = front.minX + (front.width - scaledBackWidth) / 2;
const yOffset = front.minY + (front.height - scaledBackHeight) / 2;

const translateX = xOffset - back.minX * scale;
const translateY = yOffset - back.minY * scale;

console.log('');
console.log('=== CORRECT TRANSFORM VALUES ===');
console.log(`translate(${translateX.toFixed(4)}, ${translateY.toFixed(4)}) scale(${scale.toFixed(6)})`);

// Verify: after transform, back artwork should map to:
const newMinX = back.minX * scale + translateX;
const newMinY = back.minY * scale + translateY;
const newMaxX = back.maxX * scale + translateX;
const newMaxY = back.maxY * scale + translateY;
console.log('');
console.log('=== VERIFICATION ===');
console.log(`Back artwork mapped to: (${newMinX.toFixed(2)}, ${newMinY.toFixed(2)}) -> (${newMaxX.toFixed(2)}, ${newMaxY.toFixed(2)})`);
console.log(`Front artwork bounds:   (${front.minX}, ${front.minY}) -> (${front.maxX}, ${front.maxY})`);
console.log(`Mapped width: ${(newMaxX - newMinX).toFixed(2)}, Front width: ${front.width}`);
console.log(`Mapped height: ${(newMaxY - newMinY).toFixed(2)}, Front height: ${front.height}`);
