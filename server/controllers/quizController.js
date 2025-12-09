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

module.exports = {
    getQuiz,
    submitQuiz
};

