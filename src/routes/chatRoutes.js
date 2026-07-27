const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const protect = require('../middlewares/authMiddleware');

router.get('/:partnerId', protect, chatController.getChatHistory);
router.put('/:partnerId/read', protect, chatController.markAsRead);

module.exports = router;
