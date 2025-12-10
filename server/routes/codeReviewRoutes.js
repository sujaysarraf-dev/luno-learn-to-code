const express = require('express');
const router = express.Router();
const { reviewCode, getSuggestions } = require('../controllers/codeReviewController');
const { authenticate } = require('../utils/auth');

// Code review endpoints (authentication optional for now)
router.post('/review', authenticate, reviewCode);
router.post('/suggestions', authenticate, getSuggestions);

module.exports = router;

