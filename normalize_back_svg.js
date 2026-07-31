const fs = require('fs');

let backSvg = fs.readFileSync('client/src/assets/anatomy_back.svg', 'utf8');

// The original back SVG has <svg ... viewBox="771.41 148.45 630.35 1210.9" ...>
// We want to replace the viewBox with the front's viewBox, and wrap the contents.
backSvg = backSvg.replace(
  /viewBox="[^"]+"/,
  'viewBox="-16 -21 184 341"'
);

// We need to inject the transform <g> right after the <style> tag.
// And close it right before </svg>
const styleEnd = backSvg.indexOf('</style>') + 8;
const beforeStyle = backSvg.substring(0, styleEnd);
let afterStyle = backSvg.substring(styleEnd);

// If there's already a transform from previous edits, we should be careful. 
// But we didn't add one.
afterStyle = `\n  <g transform="translate(-230.126, -62.894) scale(0.281726)">` + afterStyle.replace('</svg>', '  </g>\n</svg>');

fs.writeFileSync('client/src/assets/anatomy_back.svg', beforeStyle + afterStyle);
console.log('Fixed anatomy_back.svg coordinates and viewBox');
