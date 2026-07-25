require('dotenv').config();
const { Challenge, Milestone, MilestoneTask } = require('./src/models');

const SAMPLE_10_DAY_SYLLABUS = `📅 Day 1
MERN Stack
☐ React Lecture 1
Python
☐ Angela Yu Bootcamp – Day 1
☐ Python Notes Revision (Pages 1–12)
HackerRank
☐ Problem 1
☐ Problem 2
DSA
☐ Introduction to DSA
FastAPI
☐ Web & HTTP Fundamentals
Data Science
☐ Python Programming Foundations
English
☐ Learn 1 New Word
☐ Speak English (10–15 min)
Fitness
☐ Workout Completed
Newspaper
☐ Read Today's News
Book Reading
☐ Read 10–15 Pages

📅 Day 2
MERN Stack
☐ React Lecture 2
Python
☐ Angela Yu Bootcamp – Day 2
☐ Python Notes Revision (Pages 13–24)
HackerRank
☐ Problem 3
☐ Problem 4
DSA
☐ Why Learn DSA
FastAPI
☐ APIs & JSON
Data Science
☐ Python Programming Foundations
English
☐ Learn 1 New Word
☐ Speak English
Fitness
☐ Workout Completed
Newspaper
☐ Read Today's News
Book Reading
☐ Read 10–15 Pages

📅 Day 3
MERN Stack
☐ React Lecture 3
Python
☐ Angela Yu Bootcamp – Day 3
☐ Python Notes Revision (Pages 25–36)
HackerRank
☐ Problem 5
☐ Problem 6
DSA
☐ Data Structures vs Algorithms
FastAPI
☐ Virtual Environment & pip
Data Science
☐ Python Programming Foundations
English
☐ Learn 1 New Word
☐ Speak English
Fitness
☐ Workout Completed
Newspaper
☐ Read Today's News
Book Reading
☐ Read 10–15 Pages

📅 Day 4
MERN Stack
☐ React Lecture 4
Python
☐ Angela Yu Bootcamp – Day 4
☐ Python Notes Revision (Pages 37–48)
HackerRank
☐ Problem 7
☐ Problem 8
DSA
☐ Real World Applications
FastAPI
☐ FastAPI Setup
Data Science
☐ Python Programming Foundations
English
☐ Learn 1 New Word
☐ Speak English
Fitness
☐ Workout Completed
Newspaper
☐ Read Today's News
Book Reading
☐ Read 10–15 Pages

📅 Day 5
MERN Stack
☐ React Lecture 5
Python
☐ Angela Yu Bootcamp – Day 5
☐ Python Notes Revision (Pages 49–57)
HackerRank
☐ Problem 9
☐ Problem 10
DSA
☐ Choosing Right Data Structure
FastAPI
☐ Path Parameters
Data Science
☐ Python Programming Foundations
English
☐ Learn 1 New Word
☐ Speak English
Fitness
☐ Workout Completed
Newspaper
☐ Read Today's News
Book Reading
☐ Read 10–15 Pages

📅 Day 6
MERN Stack
☐ React Practice
☐ Mini Project Progress
Python
☐ Revise Angela Yu Days 1–5
☐ Practice Python
HackerRank
☐ Problem 11
☐ Problem 12
DSA
☐ Time Complexity
FastAPI
☐ Query Parameters
Data Science
☐ Python Programming Foundations
English
☐ Learn 1 New Word
☐ Speak English
Fitness
☐ Workout Completed
Newspaper
☐ Read Today's News
Book Reading
☐ Read 10–15 Pages

📅 Day 7
MERN Stack
☐ React Practice
Python
☐ Python Revision
HackerRank
☐ Problem 13
☐ Problem 14
DSA
☐ Space Complexity
FastAPI
☐ Request Body
Data Science
☐ Python Programming Foundations
English
☐ Learn 1 New Word
☐ Speak English
Fitness
☐ Workout Completed
Newspaper
☐ Read Today's News
Book Reading
☐ Read 10–15 Pages

📅 Day 8
MERN Stack
☐ React Practice
Python
☐ Build Small Python Program
HackerRank
☐ Problem 15
☐ Problem 16
DSA
☐ Big-O Notation
FastAPI
☐ Pydantic Models
Data Science
☐ Python Programming Foundations
English
☐ Learn 1 New Word
☐ Speak English
Fitness
☐ Workout Completed
Newspaper
☐ Read Today's News
Book Reading
☐ Read 10–15 Pages

📅 Day 9
MERN Stack
☐ React Components Practice
Python
☐ Complete Pending Python Tasks
HackerRank
☐ Problem 17
☐ Problem 18
DSA
☐ Big Theta & Big Omega
FastAPI
☐ Data Validation
Data Science
☐ Python Programming Foundations
English
☐ Learn 1 New Word
☐ Speak English
Fitness
☐ Workout Completed
Newspaper
☐ Read Today's News
Book Reading
☐ Read 10–15 Pages

📅 Day 10
MERN Stack
☐ React Mini Project
Python
☐ Sprint 1 Revision
HackerRank
☐ Problem 19
☐ Problem 20
DSA
☐ Sprint Revision
FastAPI
☐ Response Models
Data Science
☐ Revise Module 1
English
☐ Learn 1 New Word
☐ Speak English
Fitness
☐ Workout Completed
Newspaper
☐ Read Today's News
Book Reading
☐ Sprint Review
☐ Review Goals
☐ Plan Sprint 2
☐ Write Lessons Learned`;

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

const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

async function rebuild() {
    try {
        const challengeId = '8fd65c9d-6669-4476-942c-cd90fdacf188';
        const challenge = await Challenge.findByPk(challengeId);
        
        let milestones = await Milestone.findAll({
            where: { challenge_id: challengeId },
            order: [['start_date', 'ASC']]
        });
        
        const parsedDays = parseRawCurriculum(SAMPLE_10_DAY_SYLLABUS);
        
        const milestoneIds = milestones.map(m => m.id);
        if (milestoneIds.length > 0) {
            await MilestoneTask.destroy({ where: { milestone_id: milestoneIds } });
        }
        
        const startDate = new Date(challenge.start_date || new Date());
        const allTasks = [];
        
        milestones.forEach((milestone, idx) => {
            const milestoneStartDay = idx * 10 + 1;
            const milestoneEndDay = (idx + 1) * 10;
        
            for (let dNum = milestoneStartDay; dNum <= Math.min(parsedDays.length, milestoneEndDay); dNum++) {
                const dayOffsetIndex = dNum - 1;
                const taskDate = addDays(startDate, dayOffsetIndex);
                const dayData = parsedDays.find(pd => pd.dayNum === dNum);
        
                if (dayData && dayData.tasks.length > 0) {
                    dayData.tasks.forEach((t, tIdx) => {
                        allTasks.push({
                            milestone_id: milestone.id,
                            title: t.title,
                            priority: tIdx < 3 ? 'P1' : 'P2',
                            date: taskDate
                        });
                    });
                }
            }
        });
        
        if (allTasks.length > 0) {
            await MilestoneTask.bulkCreate(allTasks);
            console.log(`Rebuilt ${allTasks.length} tasks!`);
        }
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
rebuild();
