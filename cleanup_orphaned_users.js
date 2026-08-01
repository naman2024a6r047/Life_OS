require('dotenv').config();
const sequelize = require('./src/config/db');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB.');
    
    // Delete users in public."Users" that do not exist in auth.users
    // Also, we probably shouldn't delete demo users like 'alex_partner' if they have a mock UUID that's not in auth.users, 
    // but the system doesn't create mock UUIDs usually, except for alex_partner. Let's exclude 'alex_partner@lifeos.dev' just in case.
    const [results, metadata] = await sequelize.query(`
      DELETE FROM public."Users"
      WHERE id NOT IN (SELECT id FROM auth.users)
      AND email NOT LIKE '%@lifeos.dev';
    `);
    
    console.log('Cleanup complete. Rows affected:', metadata.rowCount);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    process.exit();
  }
}
run();
