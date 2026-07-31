const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const frontSvg = fs.readFileSync('client/src/assets/anatomy.svg', 'utf8');
  const backSvg = fs.readFileSync('client/src/assets/anatomy_back.svg', 'utf8');

  const html = `
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; display: flex; }
          .container { width: 400px; height: 600px; position: relative; border: 1px solid red; }
          svg { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div class="container" id="front">
          ${frontSvg}
        </div>
        <div class="container" id="back">
          ${backSvg}
        </div>
      </body>
    </html>
  `;

  fs.writeFileSync('measure.html', html);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);

  const stats = await page.evaluate(() => {
    const frontSvg = document.querySelector('#front svg');
    const backSvg = document.querySelector('#back svg');
    
    // We need the bounding box of the graphic elements, not the SVG container
    const frontG = frontSvg.querySelectorAll('g');
    const backG = backSvg.querySelectorAll('g');
    
    let fMinX=Infinity, fMinY=Infinity, fMaxX=-Infinity, fMaxY=-Infinity;
    for (let g of frontG) {
      const box = g.getBBox();
      if (box.width === 0 && box.height === 0) continue;
      if (box.x < fMinX) fMinX = box.x;
      if (box.y < fMinY) fMinY = box.y;
      if (box.x + box.width > fMaxX) fMaxX = box.x + box.width;
      if (box.y + box.height > fMaxY) fMaxY = box.y + box.height;
    }

    let bMinX=Infinity, bMinY=Infinity, bMaxX=-Infinity, bMaxY=-Infinity;
    for (let g of backG) {
      const box = g.getBBox();
      if (box.width === 0 && box.height === 0) continue;
      if (box.x < bMinX) bMinX = box.x;
      if (box.y < bMinY) bMinY = box.y;
      if (box.x + box.width > bMaxX) bMaxX = box.x + box.width;
      if (box.y + box.height > bMaxY) bMaxY = box.y + box.height;
    }

    return {
      front: { x: fMinX, y: fMinY, width: fMaxX - fMinX, height: fMaxY - fMinY },
      back: { x: bMinX, y: bMinY, width: bMaxX - bMinX, height: bMaxY - bMinY },
      frontViewBox: frontSvg.getAttribute('viewBox'),
      backViewBox: backSvg.getAttribute('viewBox')
    };
  });

  console.log('Stats:', stats);
  await browser.close();
})();
