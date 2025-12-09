const express = require('express');
const router = express.Router();
const { getQuiz, submitQuiz } = require('../controllers/quizController');
const { authenticate } = require('../utils/auth');

router.get('/:id', getQuiz);
router.post('/:id/submit', authenticate, submitQuiz);

module.exports = router;

