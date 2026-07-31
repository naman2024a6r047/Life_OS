require('dotenv').config();
const sequelize = require('./src/config/db');

async function run() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query(`
      SELECT pid, statement_timestamp() - query_start AS duration, query, state 
      FROM pg_stat_activity 
      WHERE state != 'idle' 
      ORDER BY duration DESC;
    `);
    console.log(results);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
