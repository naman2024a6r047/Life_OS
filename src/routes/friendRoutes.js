const express = require('express');
const router = express.Router();
const { 
    sendRequest, 
    acceptRequest, 
    rejectRequest, 
    getPendingRequests, 
    getFriends, 
    searchUsers,
    connectDemoPartner,
    getPartnerTelemetry,
    sendIntervention,
    getInterventions,
    getUnreadCount,
    respondIntervention,
    markSentRead,
    resetMilestoneToDayOne,
    resetMilestoneFromIntervention,
    getFriendsFeed,
    updatePrivacySettings
} = require('../controllers/friendController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/request', sendRequest);
router.post('/connect-demo', connectDemoPartner);
router.get('/pending', getPendingRequests);
router.post('/accept/:id', acceptRequest);
router.post('/reject/:id', rejectRequest);
router.get('/', getFriends);
router.get('/search', searchUsers);

// Partner Telemetry & Accountability Interventions
router.get('/telemetry/:friendId', getPartnerTelemetry);
router.post('/intervention', sendIntervention);
router.get('/interventions', getInterventions);
router.get('/interventions/unread-count', getUnreadCount);
router.post('/intervention/:id/respond', respondIntervention);
router.post('/intervention/:id/reset-milestone', resetMilestoneFromIntervention);
router.post('/milestone/reset-day-one', resetMilestoneToDayOne);
router.post('/interventions/mark-read', markSentRead);

// Feed & Privacy
router.get('/feed', getFriendsFeed);
router.put('/privacy', updatePrivacySettings);

module.exports = router;
