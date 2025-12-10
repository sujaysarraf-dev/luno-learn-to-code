const express = require('express');
const router = express.Router();
const { getUserStreak, recordActivity, completeChallenge, getTodayChallenge } = require('../controllers/streakController');
const { authenticate } = require('../utils/auth');

// Get user streak (requires authentication)
router.get('/', authenticate, getUserStreak);
router.post('/activity', authenticate, recordActivity);
router.post('/challenge/complete', authenticate, completeChallenge);
router.get('/challenge/today', getTodayChallenge); // Public endpoint

module.exports = router;

