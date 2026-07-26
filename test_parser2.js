const cleanChecklistPrefix = (str) => {
    if (!str) return '';
    let result = str.replace(/^[\s\u2610\u2611\u2612\u25A0\u25A1\u25A2\u25A3\u2705\u274C\u2022\-\*\•]+/, '').trim();
    result = result.replace(/^\[\s*\]\s*/, '').replace(/^\[x\]\s*/i, '').trim();
    return result;
};

const parseRawCurriculum = (text) => {
    if (!text || !text.trim()) return [];

    const lines = text.split('\n');
    const days = [];
    let currentDay = null;
    let currentCategory = 'General';

    lines.forEach(rawLine => {
        const line = rawLine.trim();
        if (!line) return;

        const dayMatch = line.match(/^(?:📅\s*)?Day[\s\-]*(\d+)/i);
        if (dayMatch) {
            const dayNum = parseInt(dayMatch[1], 10);
            currentDay = {
                dayNum,
                tasks: []
            };
            days.push(currentDay);
            currentCategory = 'General';
            return;
        }

        if (!currentDay) {
            currentDay = {
                dayNum: 1,
                tasks: []
            };
            days.push(currentDay);
        }

        const cleanTitle = cleanChecklistPrefix(line);

        if (cleanTitle && cleanTitle !== line) {
            currentDay.tasks.push({
                title: currentCategory !== 'General' ? `${currentCategory}: ${cleanTitle}` : cleanTitle,
                category: currentCategory
            });
        } else {
            if (line.length < 45 && !line.includes(':') && !line.startsWith('http') && !line.toLowerCase().startsWith('sprint review')) {
                currentCategory = line;
            } else {
                currentDay.tasks.push({
                    title: currentCategory !== 'General' ? `${currentCategory}: ${cleanTitle || line}` : (cleanTitle || line),
                    category: currentCategory
                });
            }
        }
    });

    return days;
};

console.log(JSON.stringify(parseRawCurriculum(`📅 Day 1
MERN Stack
☐ React Lecture 1
Python
☐ Angela Yu Day 1
☐ Python Notes
DSA
☐ Introduction
English
☐ Learn 1 Word`), null, 2));
