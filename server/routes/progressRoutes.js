const express = require('express');
const router = express.Router();
const { trackLessonAccess, markLessonCompleted, getUserProgress, getUserStats } = require('../controllers/progressController');
const { authenticate } = require('../utils/auth');

router.post('/lesson/:lessonId/access', authenticate, trackLessonAccess);
router.post('/lesson/:lessonId/complete', authenticate, markLessonCompleted);
router.get('/progress', authenticate, getUserProgress);
router.get('/stats', authenticate, getUserStats);

module.exports = router;

