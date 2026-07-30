require('dotenv').config();
const { User } = require('./src/models');

async function testActivate() {
    try {
        const user = await User.findOne({ where: { email: 'naman@lifeos.dev' } });
        console.log('Found user:', user.id);
        
        // Let's pretend to call the DB code directly to see what fails
        const { ExamSession, Challenge, ActivityPauseState } = require('./src/models');
        
        const req = {
            user: { id: user.id },
            body: { reason: 'Test', exam_type: 'Semester' }
        };

        const defaultReason = req.body.reason;
        const exam_type = req.body.exam_type;

        let session = await ExamSession.findOne({ 
            where: { user_id: req.user.id, is_active: true } 
        });

        if (!session) {
            session = await ExamSession.create({
                user_id: req.user.id,
                reason: defaultReason,
                exam_type: exam_type || 'Semester',
                start_date: new Date(),
                end_date: new Date(Date.now() + 14 * 86400000),
                is_active: true
            });
        }

        await User.update({ is_in_exam_mode: true }, { where: { id: req.user.id } });

        const activeChallenges = await Challenge.findAll({
            where: { user_id: req.user.id, status: 'active' }
        });

        const pauseStates = activeChallenges.map(challenge => ({
            user_id: req.user.id,
            exam_session_id: session.id,
            activity_type: 'Challenge',
            activity_id: challenge.id,
            state_snapshot: challenge.toJSON()
        }));

        if (pauseStates.length > 0) {
            await ActivityPauseState.bulkCreate(pauseStates);
            await Challenge.update(
                { status: 'paused' },
                { where: { user_id: req.user.id, status: 'active' } }
            );
        }
        
        console.log('Success!');
    } catch (e) {
        console.error('ERROR:', e.message);
        console.error(e.stack);
    }
}
testActivate();
