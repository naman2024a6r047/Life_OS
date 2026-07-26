require('dotenv').config();
const sequelize = require('./src/config/db');
sequelize.query('ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS privacy_settings JSON DEFAULT \'{"show_goals": true, "show_tasks": true, "show_streak": true}\'::json;')
  .then(() => {
    console.log('ADDED PRIVACY_SETTINGS');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
