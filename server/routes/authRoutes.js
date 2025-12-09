const express = require('express');
const router = express.Router();
const { signup, login, getProfile } = require('../controllers/authController');
const { authenticate } = require('../utils/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);

module.exports = router;

