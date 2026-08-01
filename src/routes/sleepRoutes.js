const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const sleepController = require('../controllers/sleepController');

router.use(authMiddleware);

// CRUD
router.post('/', sleepController.createEntry);
router.put('/:id', sleepController.updateEntry);
router.delete('/:id', sleepController.deleteEntry);

// Dashboard & Data
router.get('/today', sleepController.getToday);
router.get('/history', sleepController.getHistory);
router.get('/dashboard', sleepController.getDashboard);
router.get('/analytics', sleepController.getAnalytics);
router.get('/calendar/:year/:month', sleepController.getCalendar);
router.get('/insights', sleepController.getInsights);
router.get('/report', sleepController.getReport);

// Goals
router.get('/goals', sleepController.getGoals);
router.post('/goals', sleepController.setGoals);

module.exports = router;
