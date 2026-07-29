/**
 * One-time migration: Fix user levels and streaks based on actual activity data
 * Run with: node fix_user_levels.js
 */
require('dotenv').config();
const seq = require('./src/config/db');
const { User, ActivityLog } = require('./src/models');
const { Op } = require('sequelize');

(async () => {
    try {
        console.log('🔧 Starting user data migration...\n');
        
        const users = await User.findAll();
        
        for (const user of users) {
            const userId = user.id;
            console.log(`\n── Processing user: ${user.username} (${userId}) ──`);
            
            // 1. Calculate correct total XP from all activity logs
            const totalXPResult = await ActivityLog.sum('xp_awarded', { 
                where: { user_id: userId, xp_awarded: { [Op.gt]: 0 } } 
            });
            const totalXP = totalXPResult || 0;
            
            // 2. Calculate correct level from total XP
            let remainingXP = totalXP;
            let level = 1;
            while (remainingXP >= level * 100) {
                remainingXP -= level * 100;
                level += 1;
            }
            
            // 3. Calculate streak from activity log dates
            const activityDates = await ActivityLog.findAll({
                where: { user_id: userId },
                attributes: [[seq.fn('DATE', seq.col('createdAt')), 'activity_date']],
                group: [seq.fn('DATE', seq.col('createdAt'))],
                order: [[seq.fn('DATE', seq.col('createdAt')), 'DESC']],
                raw: true
            });
            
            let streak = 0;
            if (activityDates.length > 0) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                // Check if the most recent activity was today or yesterday
                const mostRecentDate = new Date(activityDates[0].activity_date);
                mostRecentDate.setHours(0, 0, 0, 0);
                
                const diffDays = Math.round((today - mostRecentDate) / (1000 * 60 * 60 * 24));
                
                if (diffDays <= 1) {
                    // Count consecutive days backwards from the most recent activity
                    streak = 1;
                    for (let i = 1; i < activityDates.length; i++) {
                        const currentDate = new Date(activityDates[i - 1].activity_date);
                        const prevDate = new Date(activityDates[i].activity_date);
                        currentDate.setHours(0, 0, 0, 0);
                        prevDate.setHours(0, 0, 0, 0);
                        
                        const gap = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
                        if (gap <= 1) {
                            streak++;
                        } else {
                            break;
                        }
                    }
                }
            }
            
            const longestStreak = Math.max(user.longest_streak || 0, streak);
            
            console.log(`  Total XP from logs: ${totalXP}`);
            console.log(`  Current DB: xp=${user.xp}, level=${user.level}, streak=${user.current_streak}`);
            console.log(`  Corrected:  xp=${remainingXP}, level=${level}, streak=${streak}`);
            
            // 4. Update the user
            await user.update({
                xp: remainingXP,
                level: level,
                current_streak: streak,
                longest_streak: longestStreak
            });
            
            console.log(`  ✅ Updated successfully`);
        }
        
        console.log('\n🎉 Migration complete!');
    } catch (e) {
        console.error('Migration error:', e);
    }
    process.exit(0);
})();
