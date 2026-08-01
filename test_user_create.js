require('dotenv').config();
const { sequelize, User } = require('./src/models');

async function run() {
  try {
    await sequelize.authenticate();
    const newUser = await User.create({
        id: '7ae0816b-d725-470f-9392-ca6c4601ed24',
        username: 'gt64384',
        email: 'gt64384@gmail.com'
    });
    console.log('User created:', newUser.toJSON());
  } catch (e) {
    console.error('Error creating user:', e);
  } finally {
    process.exit();
  }
}
run();
