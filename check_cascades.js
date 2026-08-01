require('dotenv').config();
const sequelize = require('./src/config/db');

async function run() {
  try {
    await sequelize.authenticate();
    const [challenges] = await sequelize.query('SELECT count(*) FROM public."Challenges";');
    console.log('Total Challenges:', challenges[0].count);
    const [penalties] = await sequelize.query('SELECT count(*) FROM public."Penalties";');
    console.log('Total Penalties:', penalties[0].count);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
