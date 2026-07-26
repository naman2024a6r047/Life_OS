const express = require('express');
const router = express.Router();
const { register, login, getProfile, syncProfile, googleAuthExchange, getGoogleToken, updateProfile } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/sync-profile', syncProfile);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

router.post('/google-auth', authMiddleware, googleAuthExchange);
router.get('/google-token', authMiddleware, getGoogleToken);

module.exports = router;
