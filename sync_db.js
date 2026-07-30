require('dotenv').config();
const { sequelize } = require('./src/models');

async function syncDB() {
    try {
        console.log('Starting DB sync...');
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully!');
        process.exit(0);
    } catch (e) {
        console.error('Error syncing DB:', e);
        process.exit(1);
    }
}

syncDB();
