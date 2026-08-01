const { SleepEntry, SleepGoal } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// ── Helpers ──────────────────────────────────────────────────────────────

function calcDurationMinutes(bedTime, wakeTime) {
    const bed = new Date(bedTime);
    const wake = new Date(wakeTime);
    let diff = (wake - bed) / 60000; // ms → minutes
    if (diff < 0) diff += 1440; // crossed midnight
    return Math.round(diff);
}

function calcSleepScore(durationMinutes, goalMinutes, quality) {
    // Duration component (40%) — how close to goal
    const durationRatio = Math.min(durationMinutes / goalMinutes, 1.3);
    let durationScore;
    if (durationRatio >= 0.9 && durationRatio <= 1.1) {
        durationScore = 100; // sweet spot
    } else if (durationRatio < 0.9) {
        durationScore = Math.round((durationRatio / 0.9) * 100);
    } else {
        // Oversleep penalty (gentle)
        durationScore = Math.round(100 - (durationRatio - 1.1) * 50);
    }
    durationScore = Math.max(0, Math.min(100, durationScore));

    // Quality component (30%)
    const qualityScore = quality ? (quality / 5) * 100 : 60; // default 3/5

    // Duration adequacy bonus (30%) — penalise <6h or >10h
    let adequacyScore = 100;
    const hours = durationMinutes / 60;
    if (hours < 5) adequacyScore = 20;
    else if (hours < 6) adequacyScore = 50;
    else if (hours < 7) adequacyScore = 75;
    else if (hours > 10) adequacyScore = 70;
    else if (hours > 9) adequacyScore = 85;

    const total = Math.round(
        durationScore * 0.4 + qualityScore * 0.3 + adequacyScore * 0.3
    );
    return Math.max(0, Math.min(100, total));
}

function formatMinutesToHM(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
}

function getDateStr(d) {
    return d.toISOString().slice(0, 10);
}

// ── CREATE ───────────────────────────────────────────────────────────────

exports.createEntry = async (req, res) => {
    try {
        const { date, bed_time, wake_time, sleep_quality, notes } = req.body;
        const userId = req.user.id;

        if (!bed_time || !wake_time) {
            return res.status(400).json({ message: 'bed_time and wake_time are required' });
        }

        const entryDate = date || getDateStr(new Date());

        // Check duplicate
        const existing = await SleepEntry.findOne({
            where: { user_id: userId, date: entryDate }
        });
        if (existing) {
            return res.status(409).json({ message: 'Entry already exists for this date. Use PUT to update.' });
        }

        // Get goal
        const goal = await SleepGoal.findOne({ where: { user_id: userId } });
        const goalMinutes = goal?.daily_goal_minutes || 480;

        const durationMinutes = calcDurationMinutes(bed_time, wake_time);
        const sleepScore = calcSleepScore(durationMinutes, goalMinutes, sleep_quality);
        const goalMet = durationMinutes >= goalMinutes;

        const entry = await SleepEntry.create({
            user_id: userId,
            date: entryDate,
            bed_time,
            wake_time,
            duration_minutes: durationMinutes,
            sleep_quality: sleep_quality || null,
            sleep_score: sleepScore,
            notes: notes || null,
            goal_met: goalMet
        });

        res.status(201).json(entry);
    } catch (error) {
        console.error('Sleep createEntry error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ── UPDATE ───────────────────────────────────────────────────────────────

exports.updateEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { bed_time, wake_time, sleep_quality, notes } = req.body;
        const userId = req.user.id;

        const entry = await SleepEntry.findOne({ where: { id, user_id: userId } });
        if (!entry) return res.status(404).json({ message: 'Entry not found' });

        const goal = await SleepGoal.findOne({ where: { user_id: userId } });
        const goalMinutes = goal?.daily_goal_minutes || 480;

        const newBed = bed_time || entry.bed_time;
        const newWake = wake_time || entry.wake_time;
        const newQuality = sleep_quality !== undefined ? sleep_quality : entry.sleep_quality;

        const durationMinutes = calcDurationMinutes(newBed, newWake);
        const sleepScore = calcSleepScore(durationMinutes, goalMinutes, newQuality);

        await entry.update({
            bed_time: newBed,
            wake_time: newWake,
            duration_minutes: durationMinutes,
            sleep_quality: newQuality,
            sleep_score: sleepScore,
            notes: notes !== undefined ? notes : entry.notes,
            goal_met: durationMinutes >= goalMinutes
        });

        res.json(entry);
    } catch (error) {
        console.error('Sleep updateEntry error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ── DELETE ───────────────────────────────────────────────────────────────

exports.deleteEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await SleepEntry.destroy({ where: { id, user_id: req.user.id } });
        if (!deleted) return res.status(404).json({ message: 'Entry not found' });
        res.json({ message: 'Entry deleted' });
    } catch (error) {
        console.error('Sleep deleteEntry error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ── GET TODAY ────────────────────────────────────────────────────────────

exports.getToday = async (req, res) => {
    try {
        const today = getDateStr(new Date());
        const entry = await SleepEntry.findOne({
            where: { user_id: req.user.id, date: today }
        });
        res.json(entry || null);
    } catch (error) {
        console.error('Sleep getToday error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ── HISTORY ──────────────────────────────────────────────────────────────

exports.getHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 30;
        const offset = (page - 1) * limit;

        const { count, rows } = await SleepEntry.findAndCountAll({
            where: { user_id: req.user.id },
            order: [['date', 'DESC']],
            limit,
            offset
        });

        res.json({
            entries: rows,
            total: count,
            page,
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        console.error('Sleep getHistory error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ── DASHBOARD ────────────────────────────────────────────────────────────

exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        const todayStr = getDateStr(today);

        // Last night
        const lastEntry = await SleepEntry.findOne({
            where: { user_id: userId },
            order: [['date', 'DESC']]
        });

        // Last 7 days
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        const weekEntries = await SleepEntry.findAll({
            where: { user_id: userId, date: { [Op.gte]: getDateStr(weekAgo) } },
            order: [['date', 'ASC']]
        });

        // Last 30 days
        const monthAgo = new Date(today);
        monthAgo.setDate(today.getDate() - 30);
        const monthEntries = await SleepEntry.findAll({
            where: { user_id: userId, date: { [Op.gte]: getDateStr(monthAgo) } },
            order: [['date', 'ASC']]
        });

        // Goal
        const goal = await SleepGoal.findOne({ where: { user_id: userId } });
        const goalMinutes = goal?.daily_goal_minutes || 480;

        // Weekly average
        const weeklyAvg = weekEntries.length > 0
            ? Math.round(weekEntries.reduce((s, e) => s + e.duration_minutes, 0) / weekEntries.length)
            : 0;

        // Monthly average
        const monthlyAvg = monthEntries.length > 0
            ? Math.round(monthEntries.reduce((s, e) => s + e.duration_minutes, 0) / monthEntries.length)
            : 0;

        // Sleep streak (consecutive goal-met days, counting backwards)
        let streak = 0;
        const allEntries = await SleepEntry.findAll({
            where: { user_id: userId },
            order: [['date', 'DESC']]
        });
        for (const entry of allEntries) {
            if (entry.goal_met) streak++;
            else break;
        }

        // Sleep debt (last 7 days)
        const sleepDebt = weekEntries.reduce((debt, e) => {
            return debt + Math.max(0, goalMinutes - e.duration_minutes);
        }, 0);

        // Bed time consistency (std dev of bed times in last 14 days)
        const twoWeeksAgo = new Date(today);
        twoWeeksAgo.setDate(today.getDate() - 14);
        const consistencyEntries = await SleepEntry.findAll({
            where: { user_id: userId, date: { [Op.gte]: getDateStr(twoWeeksAgo) } }
        });
        let bedConsistency = 0;
        let wakeConsistency = 0;
        if (consistencyEntries.length > 1) {
            const bedMinutes = consistencyEntries.map(e => {
                const d = new Date(e.bed_time);
                let m = d.getHours() * 60 + d.getMinutes();
                if (m < 720) m += 1440; // after midnight → treat as late night
                return m;
            });
            const wakeMinutes = consistencyEntries.map(e => {
                const d = new Date(e.wake_time);
                return d.getHours() * 60 + d.getMinutes();
            });
            const stdDev = (arr) => {
                const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
                const sqDiffs = arr.map(v => Math.pow(v - avg, 2));
                return Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / arr.length);
            };
            // Convert std dev to a 0-100 consistency score (lower deviation = higher score)
            bedConsistency = Math.max(0, Math.min(100, Math.round(100 - stdDev(bedMinutes) * 1.5)));
            wakeConsistency = Math.max(0, Math.min(100, Math.round(100 - stdDev(wakeMinutes) * 1.5)));
        }

        // Average bed/wake times
        let avgBedTime = null;
        let avgWakeTime = null;
        if (weekEntries.length > 0) {
            const avgBedMin = Math.round(weekEntries.reduce((s, e) => {
                const d = new Date(e.bed_time);
                let m = d.getHours() * 60 + d.getMinutes();
                if (m < 720) m += 1440;
                return s + m;
            }, 0) / weekEntries.length) % 1440;
            const avgWakeMin = Math.round(weekEntries.reduce((s, e) => {
                const d = new Date(e.wake_time);
                return s + d.getHours() * 60 + d.getMinutes();
            }, 0) / weekEntries.length);

            const padTime = (mins) => {
                const h = Math.floor(mins / 60) % 24;
                const m = mins % 60;
                const ampm = h >= 12 ? 'PM' : 'AM';
                const h12 = h % 12 || 12;
                return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
            };
            avgBedTime = padTime(avgBedMin);
            avgWakeTime = padTime(avgWakeMin);
        }

        // Goal achievement % this week
        const goalAchievement = weekEntries.length > 0
            ? Math.round((weekEntries.filter(e => e.goal_met).length / weekEntries.length) * 100)
            : 0;

        res.json({
            lastNight: lastEntry ? {
                duration_minutes: lastEntry.duration_minutes,
                duration_formatted: formatMinutesToHM(lastEntry.duration_minutes),
                sleep_score: lastEntry.sleep_score,
                sleep_quality: lastEntry.sleep_quality,
                bed_time: lastEntry.bed_time,
                wake_time: lastEntry.wake_time,
                goal_met: lastEntry.goal_met,
                date: lastEntry.date
            } : null,
            weeklyAvg,
            weeklyAvgFormatted: formatMinutesToHM(weeklyAvg),
            monthlyAvg,
            monthlyAvgFormatted: formatMinutesToHM(monthlyAvg),
            streak,
            sleepDebt,
            sleepDebtFormatted: formatMinutesToHM(sleepDebt),
            bedConsistency,
            wakeConsistency,
            avgBedTime,
            avgWakeTime,
            goalMinutes,
            goalAchievement,
            totalEntries: allEntries.length
        });
    } catch (error) {
        console.error('Sleep getDashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ── ANALYTICS ────────────────────────────────────────────────────────────

exports.getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();

        // Daily data (last 14 days)
        const twoWeeksAgo = new Date(today);
        twoWeeksAgo.setDate(today.getDate() - 14);
        const dailyEntries = await SleepEntry.findAll({
            where: { user_id: userId, date: { [Op.gte]: getDateStr(twoWeeksAgo) } },
            order: [['date', 'ASC']]
        });

        const dailyData = dailyEntries.map(e => ({
            date: e.date,
            hours: +(e.duration_minutes / 60).toFixed(1),
            score: e.sleep_score,
            bedTime: new Date(e.bed_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            wakeTime: new Date(e.wake_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            bedMinutes: (() => {
                const d = new Date(e.bed_time);
                let m = d.getHours() * 60 + d.getMinutes();
                if (m < 720) m += 1440;
                return m;
            })(),
            wakeMinutes: (() => {
                const d = new Date(e.wake_time);
                return d.getHours() * 60 + d.getMinutes();
            })()
        }));

        // Weekly averages (last 12 weeks)
        const weeklyData = [];
        for (let i = 11; i >= 0; i--) {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - (i + 1) * 7);
            const weekEnd = new Date(today);
            weekEnd.setDate(today.getDate() - i * 7);

            const entries = await SleepEntry.findAll({
                where: {
                    user_id: userId,
                    date: { [Op.gte]: getDateStr(weekStart), [Op.lt]: getDateStr(weekEnd) }
                }
            });

            const avg = entries.length > 0
                ? +(entries.reduce((s, e) => s + e.duration_minutes, 0) / entries.length / 60).toFixed(1)
                : 0;

            weeklyData.push({
                week: `W${12 - i}`,
                weekStart: getDateStr(weekStart),
                avgHours: avg,
                entries: entries.length
            });
        }

        // Goal
        const goal = await SleepGoal.findOne({ where: { user_id: userId } });

        res.json({
            daily: dailyData,
            weekly: weeklyData,
            goalHours: (goal?.daily_goal_minutes || 480) / 60
        });
    } catch (error) {
        console.error('Sleep getAnalytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ── CALENDAR ─────────────────────────────────────────────────────────────

exports.getCalendar = async (req, res) => {
    try {
        const { year, month } = req.params;
        const userId = req.user.id;

        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
        const endYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
        const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

        const entries = await SleepEntry.findAll({
            where: {
                user_id: userId,
                date: { [Op.gte]: startDate, [Op.lt]: endDate }
            },
            order: [['date', 'ASC']]
        });

        const calendarData = {};
        entries.forEach(e => {
            calendarData[e.date] = {
                duration_minutes: e.duration_minutes,
                sleep_score: e.sleep_score,
                sleep_quality: e.sleep_quality,
                bed_time: e.bed_time,
                wake_time: e.wake_time,
                goal_met: e.goal_met,
                notes: e.notes,
                // color coding
                status: e.sleep_score >= 80 ? 'good' : e.sleep_score >= 60 ? 'average' : 'poor'
            };
        });

        res.json(calendarData);
    } catch (error) {
        console.error('Sleep getCalendar error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ── INSIGHTS ─────────────────────────────────────────────────────────────

exports.getInsights = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        const insights = [];

        // Last 30 days entries
        const monthAgo = new Date(today);
        monthAgo.setDate(today.getDate() - 30);
        const entries = await SleepEntry.findAll({
            where: { user_id: userId, date: { [Op.gte]: getDateStr(monthAgo) } },
            order: [['date', 'ASC']]
        });

        if (entries.length === 0) {
            return res.json([{ type: 'info', icon: '💤', text: 'Start logging your sleep to see insights!' }]);
        }

        // Average duration
        const avgDuration = entries.reduce((s, e) => s + e.duration_minutes, 0) / entries.length;
        insights.push({
            type: 'stat',
            icon: '⏱️',
            text: `Your average sleep this month is ${formatMinutesToHM(Math.round(avgDuration))}`
        });

        // Average bed time
        const avgBedMin = Math.round(entries.reduce((s, e) => {
            const d = new Date(e.bed_time);
            let m = d.getHours() * 60 + d.getMinutes();
            if (m < 720) m += 1440;
            return s + m;
        }, 0) / entries.length) % 1440;
        const bedH = Math.floor(avgBedMin / 60) % 24;
        const bedM = avgBedMin % 60;
        const bedAmPm = bedH >= 12 ? 'PM' : 'AM';
        insights.push({
            type: 'stat',
            icon: '🌙',
            text: `Average bedtime: ${bedH % 12 || 12}:${String(bedM).padStart(2, '0')} ${bedAmPm}`
        });

        // Average wake time
        const avgWakeMin = Math.round(entries.reduce((s, e) => {
            const d = new Date(e.wake_time);
            return s + d.getHours() * 60 + d.getMinutes();
        }, 0) / entries.length);
        const wakeH = Math.floor(avgWakeMin / 60) % 24;
        const wakeM = avgWakeMin % 60;
        const wakeAmPm = wakeH >= 12 ? 'PM' : 'AM';
        insights.push({
            type: 'stat',
            icon: '☀️',
            text: `Average wake time: ${wakeH % 12 || 12}:${String(wakeM).padStart(2, '0')} ${wakeAmPm}`
        });

        // Best/worst day of week
        const dayBuckets = {};
        entries.forEach(e => {
            const dayName = new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' });
            if (!dayBuckets[dayName]) dayBuckets[dayName] = [];
            dayBuckets[dayName].push(e.duration_minutes);
        });
        let bestDay = null, bestAvg = 0, worstDay = null, worstAvg = Infinity;
        for (const [day, durations] of Object.entries(dayBuckets)) {
            const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
            if (avg > bestAvg) { bestAvg = avg; bestDay = day; }
            if (avg < worstAvg) { worstAvg = avg; worstDay = day; }
        }
        if (bestDay) {
            insights.push({
                type: 'positive',
                icon: '🏆',
                text: `You sleep best on ${bestDay}s (avg ${formatMinutesToHM(Math.round(bestAvg))})`
            });
        }
        if (worstDay && worstDay !== bestDay) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                text: `Least sleep on ${worstDay}s (avg ${formatMinutesToHM(Math.round(worstAvg))})`
            });
        }

        // Sleep debt this week
        const goal = await SleepGoal.findOne({ where: { user_id: userId } });
        const goalMin = goal?.daily_goal_minutes || 480;
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        const weekEntries = entries.filter(e => new Date(e.date) >= weekAgo);
        const weekDebt = weekEntries.reduce((d, e) => d + Math.max(0, goalMin - e.duration_minutes), 0);
        if (weekDebt > 0) {
            insights.push({
                type: 'warning',
                icon: '😴',
                text: `Sleep debt this week: ${formatMinutesToHM(weekDebt)}`
            });
        } else {
            insights.push({
                type: 'positive',
                icon: '✅',
                text: 'No sleep debt this week — great job!'
            });
        }

        // Improvement trend (compare last 7 days avg vs previous 7 days)
        const prevWeekAgo = new Date(today);
        prevWeekAgo.setDate(today.getDate() - 14);
        const prevWeekEntries = entries.filter(e => {
            const d = new Date(e.date);
            return d >= prevWeekAgo && d < weekAgo;
        });
        if (weekEntries.length > 0 && prevWeekEntries.length > 0) {
            const thisWeekAvg = weekEntries.reduce((s, e) => s + e.duration_minutes, 0) / weekEntries.length;
            const lastWeekAvg = prevWeekEntries.reduce((s, e) => s + e.duration_minutes, 0) / prevWeekEntries.length;
            const diff = thisWeekAvg - lastWeekAvg;
            if (Math.abs(diff) > 5) {
                insights.push({
                    type: diff > 0 ? 'positive' : 'warning',
                    icon: diff > 0 ? '📈' : '📉',
                    text: diff > 0
                        ? `You're sleeping ${formatMinutesToHM(Math.round(Math.abs(diff)))} more than last week`
                        : `You're sleeping ${formatMinutesToHM(Math.round(Math.abs(diff)))} less than last week`
                });
            }
        }

        res.json(insights);
    } catch (error) {
        console.error('Sleep getInsights error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ── REPORT ───────────────────────────────────────────────────────────────

exports.getReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();

        // Weekly
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        const weekEntries = await SleepEntry.findAll({
            where: { user_id: userId, date: { [Op.gte]: getDateStr(weekAgo) } },
            order: [['date', 'ASC']]
        });

        // Monthly
        const monthAgo = new Date(today);
        monthAgo.setDate(today.getDate() - 30);
        const monthEntries = await SleepEntry.findAll({
            where: { user_id: userId, date: { [Op.gte]: getDateStr(monthAgo) } },
            order: [['date', 'ASC']]
        });

        const buildReport = (entries, label) => {
            if (entries.length === 0) return { label, totalHours: 0, avgSleep: '0h 0m', bestDay: null, worstDay: null, consistency: 0, goalAchievement: 0, avgScore: 0 };

            const totalMin = entries.reduce((s, e) => s + e.duration_minutes, 0);
            const avgMin = totalMin / entries.length;
            const bestEntry = entries.reduce((best, e) => e.duration_minutes > best.duration_minutes ? e : best);
            const worstEntry = entries.reduce((worst, e) => e.duration_minutes < worst.duration_minutes ? e : worst);
            const goalMetCount = entries.filter(e => e.goal_met).length;
            const avgScore = Math.round(entries.reduce((s, e) => s + e.sleep_score, 0) / entries.length);

            return {
                label,
                totalHours: +(totalMin / 60).toFixed(1),
                avgSleep: formatMinutesToHM(Math.round(avgMin)),
                bestDay: { date: bestEntry.date, duration: formatMinutesToHM(bestEntry.duration_minutes) },
                worstDay: { date: worstEntry.date, duration: formatMinutesToHM(worstEntry.duration_minutes) },
                goalAchievement: Math.round((goalMetCount / entries.length) * 100),
                avgScore,
                entries: entries.length
            };
        };

        res.json({
            weekly: buildReport(weekEntries, 'This Week'),
            monthly: buildReport(monthEntries, 'This Month')
        });
    } catch (error) {
        console.error('Sleep getReport error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ── GOALS ────────────────────────────────────────────────────────────────

exports.getGoals = async (req, res) => {
    try {
        let goal = await SleepGoal.findOne({ where: { user_id: req.user.id } });
        if (!goal) {
            // Return defaults
            goal = { daily_goal_minutes: 480, preferred_bed_time: '23:00', preferred_wake_time: '07:00', bed_reminder_enabled: false, wake_reminder_enabled: false };
        }
        res.json(goal);
    } catch (error) {
        console.error('Sleep getGoals error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.setGoals = async (req, res) => {
    try {
        const { daily_goal_minutes, preferred_bed_time, preferred_wake_time, bed_reminder_enabled, wake_reminder_enabled } = req.body;
        const userId = req.user.id;

        let goal = await SleepGoal.findOne({ where: { user_id: userId } });

        if (goal) {
            await goal.update({
                daily_goal_minutes: daily_goal_minutes ?? goal.daily_goal_minutes,
                preferred_bed_time: preferred_bed_time ?? goal.preferred_bed_time,
                preferred_wake_time: preferred_wake_time ?? goal.preferred_wake_time,
                bed_reminder_enabled: bed_reminder_enabled ?? goal.bed_reminder_enabled,
                wake_reminder_enabled: wake_reminder_enabled ?? goal.wake_reminder_enabled
            });
        } else {
            goal = await SleepGoal.create({
                user_id: userId,
                daily_goal_minutes: daily_goal_minutes || 480,
                preferred_bed_time: preferred_bed_time || '23:00',
                preferred_wake_time: preferred_wake_time || '07:00',
                bed_reminder_enabled: bed_reminder_enabled || false,
                wake_reminder_enabled: wake_reminder_enabled || false
            });
        }

        res.json(goal);
    } catch (error) {
        console.error('Sleep setGoals error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
