const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.error('PAGE ERROR:', msg.text());
  });
  
  page.on('pageerror', err => {
    console.error('PAGE EXCEPTION:', err.message);
  });

  try {
    await page.goto('http://localhost:5174/analytics', { waitUntil: 'networkidle0' });
    console.log("Page loaded");
  } catch (e) {
    console.error("Failed to load:", e);
  }

  await browser.close();
})();
