const fs = require('fs');
let content = fs.readFileSync('client/src/assets/anatomy_back.svg', 'utf8');
content = content.replace(/fill="#4a5068"/g, 'fill="#52525b"');
content = content.replace(/stroke: #1a1c28; stroke-width: 1\.2;/g, 'stroke: #27272a; stroke-width: 1.5;');
fs.writeFileSync('client/src/assets/anatomy_back.svg', content);
console.log('Fixed anatomy_back styling!');
