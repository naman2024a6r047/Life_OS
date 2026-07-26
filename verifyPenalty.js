require('dotenv').config();
const { Challenge, Milestone, MilestoneTask, ActivityLog } = require('./src/models');
const { getChallenges } = require('./src/controllers/challengeController');

async function verify() {
    try {
        console.log('--- Verification Started ---');

        // Create mock user id
        const user_id = '9e43d6f9-ede3-4863-a152-af790a919ee4';

        // Create a mock challenge with Hard mode
        const challenge = await Challenge.create({
            user_id,
            title: 'Penalty Verification Challenge',
            category: 'Testing',
            start_date: new Date(),
            end_date: new Date(),
            difficulty: 'hard',
            penalty_mode: 'hard',
            status: 'active'
        });
        
        console.log('Created challenge:', challenge.id);

        const ms = await Milestone.create({
            challenge_id: challenge.id,
            title: 'Test Milestone 1',
            status: 'in_progress',
            start_date: new Date(),
            deadline: new Date(),
            order_index: 0
        });

        // Create a task that was due yesterday and is incomplete (missed)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const task1 = await MilestoneTask.create({
            milestone_id: ms.id,
            title: 'Missed Task Yesterday',
            is_completed: false,
            date: yesterday
        });

        // Mock req, res
        const req = { user: { id: user_id } };
        const res = {
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function(data) {
                const c = data.find(d => d.id === challenge.id);
                if (c) {
                    console.log('--- Evaluation Result ---');
                    console.log('Penalty Warning:', c.penalty_warning);
                    console.log('Penalty Applied:', c.penalty_applied);
                    console.log('Task 1 Is Completed:', c.milestones[0].tasks[0].is_completed);
                    
                    const newDate = new Date(c.milestones[0].tasks[0].date);
                    const today = new Date();
                    console.log('Task 1 Date shifted to today?', newDate.getDate() === today.getDate() ? 'YES' : 'NO (' + newDate.toISOString() + ')');
                }
            }
        };

        // This should trigger the penalty
        await getChallenges(req, res);

        // Cleanup
        await MilestoneTask.destroy({ where: { milestone_id: ms.id } });
        await Milestone.destroy({ where: { id: ms.id } });
        await Challenge.destroy({ where: { id: challenge.id } });
        await ActivityLog.destroy({ where: { user_id, action_type: 'PENALTY_TRIGGERED' } });

        console.log('--- Verification Complete ---');
    } catch(e) {
        console.error('Error during verification:', e);
    }
}

verify().then(() => process.exit(0));
