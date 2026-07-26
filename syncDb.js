require('dotenv').config();
const db = require('./src/models');

db.sequelize.sync({ alter: true }).then(() => {
    console.log('DB Synced successfully!');
    process.exit(0);
}).catch(e => {
    console.error('Sync Error:', e);
    process.exit(1);
});
