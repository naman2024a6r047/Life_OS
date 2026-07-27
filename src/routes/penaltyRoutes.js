const express = require('express');
const router = express.Router();
const { getPenaltyAuditLog, triggerMissPenalty, applyGraceDayToken, getActivePenalties, acknowledgePenalty } = require('../controllers/penaltyController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/audit-log', getPenaltyAuditLog);
router.get('/active', getActivePenalties);
router.post('/:id/acknowledge', acknowledgePenalty);
router.post('/trigger-penalty', triggerMissPenalty);
router.post('/grace-token', applyGraceDayToken);

module.exports = router;
