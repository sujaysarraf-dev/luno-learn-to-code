const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const quizRoutes = require('./routes/quizRoutes');
const chatRoutes = require('./routes/chatRoutes');
const debugRoutes = require('./routes/debugRoutes');
const progressRoutes = require('./routes/progressRoutes');

// Import database connection (to initialize it)
require('./db/connection');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Log API key status (without exposing the key)
if (process.env.OPENAI_API_KEY) {
    const keyPrefix = process.env.OPENAI_API_KEY.substring(0, 7);
    const isOpenRouter = process.env.OPENAI_API_KEY.startsWith('sk-or-');
    console.log(`🔑 OpenAI API Key configured (${isOpenRouter ? 'OpenRouter' : 'OpenAI'}) - ${keyPrefix}...`);
} else {
    console.warn('⚠️  OPENAI_API_KEY not found in environment variables');
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Luno API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/lesson', lessonRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/progress', progressRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Export for Vercel serverless
if (require.main === module) {
    // Only start server if running directly (not in Vercel)
    app.listen(PORT, () => {
        console.log(`🚀 Luno server running on port ${PORT}`);
        console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

// Export app for Vercel
module.exports = app;

