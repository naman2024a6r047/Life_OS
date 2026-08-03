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

    // Replace glass-panel/glass class with card
    c = c.replace(/glass-panel/g, 'card');
    c = c.replace(/className="glass /g, 'className="card ');
    c = c.replace(/className='glass /g, "className='card ");

    // text-white in className strings -> text-text-primary
    // Match className="..." patterns and replace text-white inside them
    c = c.replace(/(className=")([^"]*?)(text-white)([^"]*?)(")/g, (m, open, pre, tw, post, close) => {
      return open + pre + 'text-text-primary' + post + close;
    });
    c = c.replace(/(className=')([^']*?)(text-white)([^']*?)(')/g, (m, open, pre, tw, post, close) => {
      return open + pre + 'text-text-primary' + post + close;
    });
    // template literal classNames
    c = c.replace(/(className=\{`)([^`]*?)(text-white)([^`]*?)(`\})/g, (m, open, pre, tw, post, close) => {
      return open + pre + 'text-text-primary' + post + close;
    });

    // hover:text-white -> hover:text-text-primary
    c = c.replace(/hover:text-white/g, 'hover:text-text-primary');

    // indigo-* replacements
    c = c.replace(/text-indigo-[0-9]+/g, 'text-primary');
    c = c.replace(/bg-indigo-[0-9]+/g, 'bg-primary');
    c = c.replace(/border-indigo-[0-9]+/g, 'border-primary');
    c = c.replace(/hover:bg-indigo-[0-9]+/g, 'hover:bg-primary-dark');
    c = c.replace(/hover:text-indigo-[0-9]+/g, 'hover:text-primary-light');
    c = c.replace(/shadow-indigo-[0-9]+\/[0-9]+/g, 'shadow-primary/30');
    c = c.replace(/shadow-indigo-[0-9]+/g, 'shadow-primary');
    c = c.replace(/ring-indigo-[0-9]+/g, 'ring-primary');
    c = c.replace(/from-indigo-[0-9]+/g, 'from-primary/20');
    c = c.replace(/to-indigo-[0-9]+/g, 'to-primary/5');

    // violet
    c = c.replace(/to-violet-[0-9]+/g, 'to-primary');
    c = c.replace(/bg-violet-[0-9]+/g, 'bg-primary');
    c = c.replace(/text-violet-[0-9]+/g, 'text-primary');

    // slate remainders
    c = c.replace(/text-slate-[0-9]+/g, 'text-text-muted');
    c = c.replace(/placeholder-slate-[0-9]+/g, 'placeholder-text-muted');
    c = c.replace(/bg-slate-[0-9]+(?!\/)/g, 'bg-surface');
    c = c.replace(/border-slate-[0-9]+/g, 'border-border-subtle');

    // gray-* in classes
    c = c.replace(/text-gray-[0-9]+/g, 'text-text-muted');
    c = c.replace(/bg-gray-[0-9]+/g, 'bg-surface-elevated');

    // bg-primary + text-text-primary -> text-background (neon green buttons need dark text)
    c = c.replace(/\bbg-primary\b([^"'`\n]*?)\btext-text-primary\b/g, (m, mid) => {
      return 'bg-primary' + mid + 'text-background';
    });
    // Fix emerald buttons to success color
    c = c.replace(/\bbg-emerald-600\b/g, 'bg-success');
    c = c.replace(/\bhover:bg-emerald-500\b/g, 'hover:bg-success/80');
    c = c.replace(/\bhover:bg-emerald-600\b/g, 'hover:bg-success/90');
    c = c.replace(/\bbg-emerald-500\b/g, 'bg-success');

    if (c !== orig) {
      fs.writeFileSync(file, c);
      total++;
      console.log('Fixed: ' + path.basename(file));
    }
  });
  console.log('\nDone. Total files fixed: ' + total);
});
