const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatController');
const { authenticate } = require('../utils/auth');

// Chat can work without authentication, but we'll try to get user if available
router.post('/', (req, res, next) => {
    // Try to authenticate, but don't fail if not authenticated
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    if (token) {
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.userId = decoded.userId;
        } catch (err) {
            // Invalid token, continue without user
        }
    }
    next();
}, chat);

module.exports = router;

