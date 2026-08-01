const text = `
📅 Day 1 (Sun, Aug 2)
Maths
☐ Number System – Learn Theory (Natural, Whole, Integers, Rational, Irrational, Real)
☐ Solve Examples – Number System

📅 Day 2 (Sat, Aug 8)
Maths
☐ Number System – Exercise Practice (Easy → Medium → Difficult)
☐ Formula Revision + Revision Test

📅 Day 3
No explicit date here
`;

const lines = text.split('\n');
const currentYear = new Date().getFullYear();

lines.forEach(line => {
    line = line.trim();
    if (!line) return;
    
    // Detect Day Header (e.g. 📅 Day 1, Day 1, Day 01, Day-1, DAY 1, 📅 Day 1 (Sun, Aug 2))
    const dayMatch = line.match(/^(?:📅\s*)?Day[\s\-]*(\d+)(?:\s*\((.*?)\))?/i);
    if (dayMatch) {
        const rawDayNum = parseInt(dayMatch[1], 10);
        const dateStr = dayMatch[2];
        console.log(`Matched Day ${rawDayNum}, Date string: ${dateStr}`);
        
        if (dateStr) {
            const cleanDateStr = dateStr.replace(/^[A-Za-z]+,\s*/, '').trim(); 
            const nativeDate = new Date(`${cleanDateStr}, ${currentYear}`);
            if (!isNaN(nativeDate.getTime())) {
                console.log(`Native parsed date: ${nativeDate.toISOString().split('T')[0]}`);
            }
        }
    }
});
