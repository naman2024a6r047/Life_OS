const express = require('express');
const router = express.Router();
const { submitForReview, submitReview, getPendingReviews, getMyReviews, getReviewHistory } = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/submit', submitForReview);
router.post('/evaluate/:request_id', submitReview);
router.get('/pending', getPendingReviews);
router.get('/mine', getMyReviews);
router.get('/history', getReviewHistory);

module.exports = router;
