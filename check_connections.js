require('dotenv').config();
const sequelize = require('./src/config/db');

async function run() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query(`
      SELECT count(*) FROM pg_stat_activity;
    `);
    console.log('Total Connections:', results[0].count);
    
    const [results2] = await sequelize.query(`
      SELECT state, count(*) FROM pg_stat_activity GROUP BY state;
    `);
    console.log('Connections by state:', results2);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
