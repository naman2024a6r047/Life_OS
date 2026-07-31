require('dotenv').config();
const sequelize = require('./src/config/db');

async function run() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query('SELECT count(*) FROM public."Users";');
    console.log('Total Users:', results[0].count);
    
    const [users] = await sequelize.query('SELECT username, email FROM public."Users";');
    console.log(users);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
