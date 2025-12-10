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
const testRoutes = require('./routes/testRoutes');
const streakRoutes = require('./routes/streakRoutes');
const codeReviewRoutes = require('./routes/codeReviewRoutes');

// Import database connection (to initialize it)
// Wrap in try-catch to prevent server crash if DB connection fails
try {
    require('./db/connection');
} catch (err) {
    console.error('⚠️  Database connection initialization error:', err.message);
    console.error('⚠️  Server will continue but database operations may fail');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.VITE_API_URL?.replace('/api', '')
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(null, true); // Allow all in production for now
        }
    },
    credentials: true
}));

// Log API key status (without exposing the key)
if (process.env.OPENAI_API_KEY) {
    const keyPrefix = process.env.OPENAI_API_KEY.substring(0, 7);
    const isOpenRouter = process.env.OPENAI_API_KEY.startsWith('sk-or-');
    console.log(`🔑 OpenAI API Key configured (${isOpenRouter ? 'OpenRouter' : 'OpenAI'}) - ${keyPrefix}...`);
    if (isOpenRouter) {
        console.log(`🌐 OpenRouter base URL: https://openrouter.ai/api/v1`);
        console.log(`📝 Site URL: ${process.env.SITE_URL || 'http://localhost:5173'}`);
    }
} else {
    console.warn('⚠️  OPENAI_API_KEY not found in environment variables');
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

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
app.use('/api/test', testRoutes);
app.use('/api/streak', streakRoutes);
app.use('/api/code-review', codeReviewRoutes);

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
        console.log(`🌐 API available at http://localhost:${PORT}/api`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Port ${PORT} is already in use. Please stop the other process or change PORT in .env`);
        } else {
            console.error('❌ Server error:', err);
        }
        process.exit(1);
    });
}

// Export app for Vercel
module.exports = app;

