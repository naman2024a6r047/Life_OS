require('dotenv').config();
const { sequelize } = require('./src/models');
sequelize.query('SELECT * FROM "ExamSessions" LIMIT 1;')
    .then(() => { console.log('Exists!'); process.exit(0); })
    .catch(e => { console.error('Error:', e.message); process.exit(1); });
