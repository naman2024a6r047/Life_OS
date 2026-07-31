const fs = require('fs');
let content = fs.readFileSync('client/src/pages/GymDashboard.jsx', 'utf8');

// 1. Overall Card: Use a consistent 8px spacing system, equal padding, align header.
content = content.replace(
  /className="lg:col-span-5 card p-5 space-y-4 bg-gradient-to-br from-surface to-surface-elevated relative overflow-visible flex flex-col justify-between border border-purple\/30"/,
  'className="lg:col-span-5 card p-6 gap-6 bg-gradient-to-br from-surface to-surface-elevated relative overflow-visible flex flex-col border border-purple/30"'
);

// 2. Header: Align perfectly, vertically centered, equal spacing above and below divider.
content = content.replace(
  /<div className="flex items-center justify-between border-b border-border-subtle pb-3">/g,
  '<div className="flex items-center justify-between border-b border-border-subtle pb-4">'
);

// 3. Workout Summary: Vertically align icon, title, subtitle. Increase spacing slightly.
content = content.replace(
  /<div className="space-y-2">\s*<div className="flex items-center gap-2\.5">\s*<div className="w-10 h-10 rounded-xl bg-purple\/10 text-purple flex items-center justify-center font-bold text-lg">\s*🏋️\s*<\/div>\s*<div>\s*<h3 className="text-xl font-extrabold text-text-primary">\s*\{weeklyPlan\[currentWeekday\]\?\.title \|\| 'Rest Day'\}\s*<\/h3>\s*<p className="text-xs font-semibold text-purple">\s*\{weeklyPlan\[currentWeekday\]\?\.focus \|\| 'Rest & Recovery'\}\s*<\/p>\s*<\/div>\s*<\/div>/,
  `<div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple/10 text-purple flex items-center justify-center text-2xl shrink-0">
                    🏋️
                  </div>
                  <div className="flex flex-col justify-center gap-1">
                    <h3 className="text-xl font-extrabold text-text-primary leading-none">
                      {weeklyPlan[currentWeekday]?.title || 'Rest Day'}
                    </h3>
                    <p className="text-sm font-semibold text-purple leading-none mt-1">
                      {weeklyPlan[currentWeekday]?.focus || 'Rest & Recovery'}
                    </p>
                  </div>
                </div>`
);

// 4. Statistics Cards: Identical height and width, identical padding, vertically center icon/label/value.
content = content.replace(
  /<div className="grid grid-cols-4 gap-2 pt-1">\s*<div className="p-2 rounded-xl bg-purple\/10 border border-purple\/20 text-center">\s*<p className="text-\[9px\] text-text-muted uppercase">Duration<\/p>\s*<p className="text-xs font-bold font-mono text-purple">60 min<\/p>\s*<\/div>[\s\S]*?<div className="p-2 rounded-xl bg-success\/10 border border-success\/20 text-center">\s*<p className="text-\[9px\] text-text-muted uppercase">Target Vol<\/p>\s*<p className="text-xs font-bold font-mono text-success">7\.5k kg<\/p>\s*<\/div>\s*<\/div>\s*<\/div>/,
  `<div className="grid grid-cols-4 gap-3">
                  <div className="p-3 rounded-2xl bg-purple/10 border border-purple/20 flex flex-col items-center justify-center gap-2 aspect-square">
                    <FiClock className="text-purple shrink-0" size={18} />
                    <div className="flex flex-col items-center justify-center gap-1">
                      <p className="text-[9px] text-text-muted uppercase font-bold tracking-wider leading-none">Duration</p>
                      <p className="text-sm font-bold font-mono text-purple leading-none">60 min</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-info/10 border border-info/20 flex flex-col items-center justify-center gap-2 aspect-square">
                    <FiActivity className="text-info shrink-0" size={18} />
                    <div className="flex flex-col items-center justify-center gap-1">
                      <p className="text-[9px] text-text-muted uppercase font-bold tracking-wider leading-none">Exercises</p>
                      <p className="text-sm font-bold font-mono text-info leading-none">{weeklyPlan[currentWeekday]?.exercises?.length || 0}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-warning/10 border border-warning/20 flex flex-col items-center justify-center gap-2 aspect-square">
                    <FiZap className="text-warning shrink-0" size={18} />
                    <div className="flex flex-col items-center justify-center gap-1">
                      <p className="text-[9px] text-text-muted uppercase font-bold tracking-wider leading-none">Calories</p>
                      <p className="text-sm font-bold font-mono text-warning leading-none">550 kcal</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-success/10 border border-success/20 flex flex-col items-center justify-center gap-2 aspect-square">
                    <FiCheckCircle className="text-success shrink-0" size={18} />
                    <div className="flex flex-col items-center justify-center gap-1">
                      <p className="text-[9px] text-text-muted uppercase font-bold tracking-wider leading-none">Target Vol</p>
                      <p className="text-sm font-bold font-mono text-success leading-none">7.5k kg</p>
                    </div>
                  </div>
                </div>
              </div>`
);

// 5. Muscle Activation Section: Increase internal padding, equal margins.
content = content.replace(
  /<div className="w-full h-\[320px\] flex items-center justify-center bg-surface-elevated\/30 rounded-2xl border border-border-subtle\/50 p-2 my-1 overflow-visible">/,
  '<div className="w-full h-[360px] flex items-center justify-center bg-surface-elevated/30 rounded-2xl border border-border-subtle/50 p-6 overflow-visible">'
);

// 6. CTA Button: Increase top margin slightly, width consistent, center text/arrow, equal left/right padding.
content = content.replace(
  /<div className="pt-1">\s*<button onClick=\{\(\) => setActiveTab\('workouts'\)\} className="btn-primary text-xs w-full py-3 bg-gradient-to-r from-purple to-purple-accent text-white font-bold flex items-center justify-center gap-1\.5 shadow-glow-primary rounded-xl">\s*View Weekly Plan & Schedule <FiChevronRight size=\{16\} \/>\s*<\/button>\s*<\/div>/,
  `<div className="mt-auto pt-2">
                <button onClick={() => setActiveTab('workouts')} className="btn-primary text-sm w-full py-4 bg-gradient-to-r from-purple to-purple-accent text-white font-bold flex items-center justify-center gap-2 shadow-glow-primary rounded-xl px-4">
                  <FiCalendar size={18} />
                  <span>View Weekly Plan & Schedule</span>
                  <FiChevronRight size={18} className="ml-auto" />
                </button>
              </div>`
);

fs.writeFileSync('client/src/pages/GymDashboard.jsx', content);
console.log('Fixed GymDashboard.jsx UI layout');
