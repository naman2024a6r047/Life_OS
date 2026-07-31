require('dotenv').config();
const sequelize = require('./src/config/db');

async function run() {
  try {
    await sequelize.authenticate();
    const [locks] = await sequelize.query(`
      SELECT 
        l.pid,
        c.relname,
        l.locktype,
        l.mode,
        l.granted
      FROM pg_locks l
      LEFT JOIN pg_class c ON l.relation = c.oid
      WHERE l.pid != pg_backend_pid();
    `);
    console.log('Locks:', locks);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
