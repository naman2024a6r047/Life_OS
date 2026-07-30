require('dotenv').config();
const { sequelize } = require('./src/models');

async function fix() {
  try {
    await sequelize.query('ALTER TABLE "MilestoneTasks" ADD COLUMN actual_hours FLOAT DEFAULT 0 NOT NULL;');
    console.log('Column added');
    process.exit(0);
  } catch(e) {
    if (e.message && e.message.includes('already exists')) {
        console.log('Column already exists');
        process.exit(0);
    }
    console.error(e);
    process.exit(1);
  }
}
fix();
