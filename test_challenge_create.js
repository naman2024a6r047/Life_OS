require('dotenv').config();
const { sequelize, Challenge, Milestone } = require('./src/models');

async function run() {
  try {
    await sequelize.authenticate();
    const challenge = await Challenge.create({
        user_id: '7ae0816b-d725-470f-9392-ca6c4601ed24', // gt64384@gmail.com
        title: 'Recovery Challenge',
        description: 'Testing if data shows up on the dashboard',
        category: 'fitness',
        start_date: new Date(),
        status: 'active',
        difficulty: 'medium',
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    console.log('Challenge created:', challenge.id);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    process.exit();
  }
}
run();
