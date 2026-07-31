require('dotenv').config();
const sequelize = require('./src/config/db');

async function run() {
  try {
    await sequelize.authenticate();
    const [challenges] = await sequelize.query('SELECT count(*) FROM public."Challenges";');
    console.log('Total Challenges in DB:', challenges[0].count);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
