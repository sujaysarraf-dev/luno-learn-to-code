const express = require('express');
const router = express.Router();
const { getAllLessons, getLesson, explainLine, generateQuizForLesson } = require('../controllers/lessonController');
const { authenticate } = require('../utils/auth');

router.get('/', getAllLessons);
router.get('/:id', getLesson);
router.post('/:id/explain-line', explainLine);
router.post('/:id/generate-quiz', authenticate, generateQuizForLesson);

module.exports = router;

