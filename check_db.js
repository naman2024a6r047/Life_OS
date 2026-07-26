require('dotenv').config();
const { sequelize } = require('./src/models');
const CodingProfile = require('./src/models/CodingProfile');

async function check() {
    try {
        await sequelize.authenticate();
        const profiles = await CodingProfile.findAll();
        console.log(JSON.stringify(profiles, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
