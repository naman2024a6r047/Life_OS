require('dotenv').config();
const sequelize = require('./src/config/db');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB.');
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION public.handle_deleted_user()
      RETURNS trigger AS $$
      BEGIN
        DELETE FROM public."Users" WHERE id = old.id;
        RETURN old;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      
      DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
      CREATE TRIGGER on_auth_user_deleted
        AFTER DELETE ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_deleted_user();
    `);
    console.log('Trigger created successfully!');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    process.exit();
  }
}
run();
