const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatController');
const { authenticate } = require('../utils/auth');

router.post('/', authenticate, chat);

module.exports = router;

