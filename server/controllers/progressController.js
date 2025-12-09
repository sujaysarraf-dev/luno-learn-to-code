const pool = require('../db/connection');

/**
 * Track lesson access (when user views a lesson)
 */
const trackLessonAccess = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Insert or update user progress
        await pool.execute(
            `INSERT INTO user_progress (user_id, lesson_id, last_accessed_at) 
             VALUES (?, ?, NOW()) 
             ON DUPLICATE KEY UPDATE last_accessed_at = NOW()`,
            [userId, lessonId]
        );

        res.json({ message: 'Progress tracked' });
    } catch (error) {
        console.error('Track lesson access error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Mark lesson as completed
 */
const markLessonCompleted = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Mark lesson as completed
        await pool.execute(
            `INSERT INTO user_progress (user_id, lesson_id, completed, last_accessed_at) 
             VALUES (?, ?, TRUE, NOW()) 
             ON DUPLICATE KEY UPDATE completed = TRUE, last_accessed_at = NOW()`,
            [userId, lessonId]
        );

        res.json({ message: 'Lesson marked as completed' });
    } catch (error) {
        console.error('Mark lesson completed error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Get user progress for all lessons
 */
const getUserProgress = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const [progress] = await pool.execute(
            'SELECT lesson_id, completed, last_accessed_at FROM user_progress WHERE user_id = ?',
            [userId]
        );

        // Convert to object for easy lookup
        const progressMap = {};
        progress.forEach(p => {
            progressMap[p.lesson_id] = {
                completed: p.completed === 1,
                lastAccessed: p.last_accessed_at
            };
        });

        res.json({ progress: progressMap });
    } catch (error) {
        console.error('Get user progress error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Get user statistics
 */
const getUserStats = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Get total lessons
        const [lessonsCount] = await pool.execute('SELECT COUNT(*) as total FROM lessons');
        const totalLessons = lessonsCount[0].total;

        // Get completed lessons
        const [completedCount] = await pool.execute(
            'SELECT COUNT(*) as total FROM user_progress WHERE user_id = ? AND completed = TRUE',
            [userId]
        );
        const completedLessons = completedCount[0].total;

        // Get quiz attempts
        const [quizAttempts] = await pool.execute(
            'SELECT COUNT(*) as total, AVG(score * 100.0 / total_questions) as avg_score FROM quiz_attempts WHERE user_id = ?',
            [userId]
        );
        const totalQuizzes = quizAttempts[0].total;
        const avgScore = quizAttempts[0].avg_score ? Math.round(quizAttempts[0].avg_score) : 0;

        res.json({
            totalLessons,
            completedLessons,
            totalQuizzes,
            avgScore,
            progressPercentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    trackLessonAccess,
    markLessonCompleted,
    getUserProgress,
    getUserStats
};

