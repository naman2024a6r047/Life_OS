require('dotenv').config();
const { sequelize } = require('./src/models');
const CodingProfile = require('./src/models/CodingProfile');

async function test() {
    try {
        await sequelize.authenticate();
        let profile = await CodingProfile.findOne({ where: { user_id: 'aabe55fe-921a-4c61-a319-375b9905ce1b' } });
        if (profile) {
            console.log('Original:', profile.developer_info);
            profile.developer_info = { test: 'worked on second user' };
            profile.changed('developer_info', true);
            await profile.save();
            
            let reloaded = await CodingProfile.findByPk(profile.id);
            console.log('Saved:', reloaded.developer_info);
        } else {
            console.log('No profile found');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
test();
