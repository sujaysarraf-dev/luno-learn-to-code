const express = require('express');
const router = express.Router();
const { debug } = require('../controllers/debugController');
const { authenticate } = require('../utils/auth');

router.post('/', authenticate, debug);

module.exports = router;

