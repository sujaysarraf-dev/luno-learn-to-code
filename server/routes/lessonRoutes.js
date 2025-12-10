const express = require('express');
const router = express.Router();
const { getAllLessons, getLesson, explainLine, generateQuizForLesson } = require('../controllers/lessonController');
const { authenticate } = require('../utils/auth');

// Public routes (no auth required)
router.get('/', getAllLessons);
router.get('/:id', getLesson);
router.post('/:id/explain-line', explainLine);

// Protected routes (auth required)
router.post('/:id/generate-quiz', authenticate, generateQuizForLesson);

module.exports = router;

