const express = require('express');
const router = express.Router();
const { getQuiz, submitQuiz, getQuizHistory, getQuizAttempts } = require('../controllers/quizController');
const { authenticate } = require('../utils/auth');

// Order matters! Specific routes must come before parameterized routes
router.get('/history', authenticate, getQuizHistory);
router.get('/:id/attempts', authenticate, getQuizAttempts);
router.get('/:id', getQuiz);
router.post('/:id/submit', authenticate, submitQuiz);

module.exports = router;

