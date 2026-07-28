require('dotenv').config();
const { sequelize } = require('./src/models');

async function syncDb() {
    try {
        console.log('Authenticating...');
        await sequelize.authenticate();
        console.log('Syncing database (alter: true)...');
        await sequelize.sync({ alter: true });
        console.log('Database sync complete!');
        process.exit(0);
    } catch (e) {
        console.error('Error syncing DB:', e);
        process.exit(1);
    }
}

syncDb();
