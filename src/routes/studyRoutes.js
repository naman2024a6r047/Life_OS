const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getDashboard, getAnalytics, logSession } = require('../controllers/studyController');

router.use(authMiddleware);

router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);
router.post('/log', logSession);

module.exports = router;
