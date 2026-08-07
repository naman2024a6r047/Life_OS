const express = require('express');
const router = express.Router();
const { toggleTask, updateTask, createTask, deleteTask, getTodaysTasks } = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/today', getTodaysTasks);
router.post('/', createTask);
router.put('/:id/toggle', toggleTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
