const pool = require('../db/connection');

/**
 * Get a quiz by ID
 */
const getQuiz = async (req, res) => {
    try {
        const { id } = req.params;

        // Get quiz details
        const [quizzes] = await pool.execute(
            'SELECT id, lesson_id, title, description FROM quizzes WHERE id = ?',
            [id]
        );

        if (quizzes.length === 0) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Get questions (without correct answers for security)
        const [questions] = await pool.execute(
            'SELECT id, question_text, option_a, option_b, option_c, option_d, order_index FROM questions WHERE quiz_id = ? ORDER BY order_index ASC',
            [id]
        );

        res.json({
            quiz: {
                ...quizzes[0],
                questions: questions.map(q => ({
                    id: q.id,
                    question: q.question_text,
                    options: {
                        a: q.option_a,
                        b: q.option_b,
                        c: q.option_c,
                        d: q.option_d
                    }
                }))
            }
        });
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Submit quiz answers
 */
const submitQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const { answers } = req.body; // { questionId: 'a' | 'b' | 'c' | 'd' }

        if (!answers || typeof answers !== 'object') {
            return res.status(400).json({ error: 'Answers are required' });
        }

        // Get all questions with correct answers
        const [questions] = await pool.execute(
            'SELECT id, correct_answer FROM questions WHERE quiz_id = ?',
            [id]
        );

        if (questions.length === 0) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Calculate score
        let score = 0;
        const results = [];

        for (const question of questions) {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.correct_answer;
            
            if (isCorrect) {
                score++;
            }

            results.push({
                questionId: question.id,
                userAnswer,
                correctAnswer: question.correct_answer,
                isCorrect
            });
        }

        // Get explanations for all questions
        const [explanations] = await pool.execute(
            'SELECT id, question_text, explanation FROM questions WHERE quiz_id = ?',
            [id]
        );

        const explanationsMap = {};
        explanations.forEach(q => {
            explanationsMap[q.id] = {
                question: q.question_text,
                explanation: q.explanation
            };
        });

        // Save attempt if user is authenticated
        if (req.userId) {
            await pool.execute(
                'INSERT INTO quiz_attempts (user_id, quiz_id, score, total_questions, answers) VALUES (?, ?, ?, ?, ?)',
                [req.userId, id, score, questions.length, JSON.stringify(answers)]
            );

            // Mark lesson as completed if quiz score is 80% or higher
            const percentage = (score / questions.length) * 100;
            if (percentage >= 80) {
                try {
                    const [quizInfo] = await pool.execute(
                        'SELECT lesson_id FROM quizzes WHERE id = ?',
                        [id]
                    );
                    if (quizInfo.length > 0) {
                        await pool.execute(
                            `INSERT INTO user_progress (user_id, lesson_id, completed, last_accessed_at) 
                             VALUES (?, ?, TRUE, NOW()) 
                             ON DUPLICATE KEY UPDATE completed = TRUE, last_accessed_at = NOW()`,
                            [req.userId, quizInfo[0].lesson_id]
                        );
                    }
                } catch (err) {
                    console.error('Failed to mark lesson as completed:', err);
                }
            }
        }

        res.json({
            score,
            totalQuestions: questions.length,
            percentage: Math.round((score / questions.length) * 100),
            results: results.map(r => ({
                ...r,
                ...explanationsMap[r.questionId]
            }))
        });
    } catch (error) {
        console.error('Submit quiz error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Get user's quiz history
 */
const getQuizHistory = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Get all quiz attempts with quiz and lesson info
        const [attempts] = await pool.execute(
            `SELECT 
                qa.id,
                qa.quiz_id,
                qa.score,
                qa.total_questions,
                qa.completed_at,
                q.title as quiz_title,
                q.lesson_id,
                l.title as lesson_title
            FROM quiz_attempts qa
            JOIN quizzes q ON qa.quiz_id = q.id
            JOIN lessons l ON q.lesson_id = l.id
            WHERE qa.user_id = ?
            ORDER BY qa.completed_at DESC
            LIMIT 50`,
            [userId]
        );

        const history = attempts.map(attempt => ({
            id: attempt.id,
            quizId: attempt.quiz_id,
            lessonId: attempt.lesson_id,
            lessonTitle: attempt.lesson_title,
            quizTitle: attempt.quiz_title,
            score: attempt.score,
            totalQuestions: attempt.total_questions,
            percentage: attempt.total_questions > 0 ? Math.round((attempt.score / attempt.total_questions) * 100) : 0,
            completedAt: attempt.completed_at
        }));

        res.json({ history });
    } catch (error) {
        console.error('Get quiz history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Get attempts for a specific quiz
 */
const getQuizAttempts = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const [attempts] = await pool.execute(
            `SELECT id, score, total_questions, completed_at, answers
             FROM quiz_attempts
             WHERE quiz_id = ? AND user_id = ?
             ORDER BY completed_at DESC
             LIMIT 10`,
            [id, userId]
        );

        const attemptsList = attempts.map(attempt => ({
            id: attempt.id,
            score: attempt.score,
            totalQuestions: attempt.total_questions,
            percentage: attempt.total_questions > 0 ? Math.round((attempt.score / attempt.total_questions) * 100) : 0,
            completedAt: attempt.completed_at,
            answers: JSON.parse(attempt.answers || '{}')
        }));

        res.json({ attempts: attemptsList });
    } catch (error) {
        console.error('Get quiz attempts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
  getQuiz,
  submitQuiz,
  getQuizHistory,
  getQuizAttempts
};

