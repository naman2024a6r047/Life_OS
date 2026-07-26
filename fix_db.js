require('dotenv').config();
const { sequelize } = require('./src/models');
const CodingProfile = require('./src/models/CodingProfile');

async function fix() {
    try {
        await sequelize.authenticate();
        // find all profiles
        const profiles = await CodingProfile.findAll();
        
        // group by user_id
        const userProfiles = {};
        for (const p of profiles) {
            if (!userProfiles[p.user_id]) userProfiles[p.user_id] = [];
            userProfiles[p.user_id].push(p);
        }
        
        // delete duplicates
        for (const [userId, prs] of Object.entries(userProfiles)) {
            if (prs.length > 1) {
                console.log(`Found ${prs.length} profiles for user ${userId}. Deleting duplicates...`);
                // keep the first one, delete the rest
                for (let i = 1; i < prs.length; i++) {
                    await prs[i].destroy();
                    console.log(`Deleted profile ${prs[i].id}`);
                }
            }
        }
        
        console.log('Fixed database.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
fix();
