require('dotenv').config();
const sequelize = require('./src/config/db');

async function alterDb() {
    try {
        await sequelize.query('ALTER TABLE "Challenges" ADD COLUMN "penalty_mode" VARCHAR(255) DEFAULT \'easy\'');
        console.log('Added column penalty_mode');
    } catch(e) {
        console.error('Error adding column, might already exist:', e.message);
    }
    process.exit(0);
}

alterDb();
