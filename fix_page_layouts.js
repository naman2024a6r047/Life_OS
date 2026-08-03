const fs = require('fs');
const path = require('path');
const dir = './client/src';

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(file => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => { results = results.concat(res); if (!--pending) done(null, results); });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

walk(dir, (err, files) => {
  if (err) throw err;
  let total = 0;
  files.filter(f => f.endsWith('.jsx')).forEach(file => {
    let c = fs.readFileSync(file, 'utf8');
    const orig = c;

    // Fix spinner border-t-indigo-500 remnants
    c = c.replace(/border-t-indigo-[0-9]+/g, 'border-t-primary');

    // Fix pages that own the full screen layout (they use min-h-screen which conflicts with AppShell).
    // These pages are INSIDE AppShell so they should NOT re-declare min-h-screen / bg-[#...]
    // We replace `min-h-screen bg-[#090A0F]` with just a relative wrapper
    c = c.replace(/min-h-screen bg-\[#090A0F\] text-text-muted p-4 md:p-8 relative overflow-hidden/g,
      'w-full p-4 md:p-8 relative overflow-hidden text-text-primary');
    c = c.replace(/min-h-screen bg-\[#090A0F\] text-text-muted p-8/g,
      'w-full p-8 text-text-primary');
    c = c.replace(/min-h-screen bg-\[#090A0F\] text-text-muted p-6/g,
      'w-full p-6 text-text-primary');
    c = c.replace(/min-h-screen bg-\[#090A0F\] text-text-muted flex items-center justify-center/g,
      'w-full flex items-center justify-center min-h-[60vh] text-text-primary');
    c = c.replace(/min-h-screen bg-\[#090A0F\] text-text-primary flex items-center justify-center/g,
      'w-full flex items-center justify-center min-h-[60vh] text-text-primary');
    c = c.replace(/min-h-screen bg-\[#090A0F\] text-text-primary flex flex-col items-center justify-center p-8/g,
      'w-full flex flex-col items-center justify-center min-h-[60vh] p-8 text-text-primary');
    c = c.replace(/min-h-screen bg-\[#090A0F\] text-text-primary font-sans relative overflow-hidden/g,
      'w-full relative overflow-hidden text-text-primary font-sans');
    c = c.replace(/min-h-screen bg-\[#090A0F\] text-text-primary/g,
      'w-full text-text-primary');
    c = c.replace(/min-h-screen bg-\[#090A0F\]/g, 'w-full');

    // Fix text-text-muted on outer page wrapper -> text-text-primary
    c = c.replace(/^(\s*<div className="w-full[^"]*?")(\s*text-text-muted)/gm, (m) => {
      return m.replace('text-text-muted', 'text-text-primary');
    });

    // Fix loading spinners that use text-text-muted as primary
    c = c.replace(/>Loading/g, '>Loading');

    // Fix emerald-400 badge class used in challenge status (keep as success)
    c = c.replace(/text-emerald-400/g, 'text-success');

    // fix grace_tokens -> field name (shouldn't change user field name)
    // fix remaining text-text-muted on loading states
    c = c.replace(/className="w-full flex items-center justify-center min-h-\[60vh\] text-text-muted/g,
      'className="w-full flex items-center justify-center min-h-[60vh] text-text-primary');

    if (c !== orig) {
      fs.writeFileSync(file, c);
      total++;
      console.log('Fixed: ' + path.basename(file));
    }
  });
  console.log('\nDone. Total files fixed: ' + total);
});
