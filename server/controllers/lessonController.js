const pool = require('../db/connection');
const { explainLine: explainLineAI, generateQuiz } = require('../services/openaiService');

/**
 * Get all lessons
 */
const getAllLessons = async (req, res) => {
    try {
        const [lessons] = await pool.execute(
            'SELECT id, title, description, order_index, difficulty_level FROM lessons ORDER BY order_index ASC'
        );

        res.json({ lessons });
    } catch (error) {
        console.error('Get lessons error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Get a single lesson with all lines
 */
const getLesson = async (req, res) => {
    try {
        const { id } = req.params;

        // Get lesson details
        let lessons, lines;
        try {
            [lessons] = await pool.execute(
                'SELECT id, title, description, order_index, difficulty_level FROM lessons WHERE id = ?',
                [id]
            );

            if (lessons.length === 0) {
                return res.status(404).json({ error: 'Lesson not found' });
            }

            const lesson = lessons[0];

            // Get lesson lines
            [lines] = await pool.execute(
                'SELECT id, line_number, code_content, line_type FROM lesson_lines WHERE lesson_id = ? ORDER BY line_number ASC',
                [id]
            );
        } catch (dbError) {
            console.error('Database error in getLesson:', dbError);
            return res.status(500).json({ 
                error: 'Database connection error',
                details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
            });
        }

        // Track lesson access if user is authenticated
        if (req.userId) {
            try {
                await pool.execute(
                    `INSERT INTO user_progress (user_id, lesson_id, last_accessed_at) 
                     VALUES (?, ?, NOW()) 
                     ON DUPLICATE KEY UPDATE last_accessed_at = NOW()`,
                    [req.userId, id]
                );
            } catch (err) {
                // Don't fail the request if tracking fails
                console.error('Failed to track lesson access:', err);
            }
        }

        res.json({
            lesson: {
                ...lessons[0],
                lines: lines || []
            }
        });
    } catch (error) {
        console.error('Get lesson error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Explain a specific line of code
 */
const explainLine = async (req, res) => {
    try {
        const { id } = req.params;
        const { lineId } = req.body;

        if (!lineId) {
            return res.status(400).json({ error: 'Line ID is required' });
        }

        // Get the line
        const [lines] = await pool.execute(
            'SELECT id, code_content, line_number FROM lesson_lines WHERE id = ? AND lesson_id = ?',
            [lineId, id]
        );

        if (lines.length === 0) {
            return res.status(404).json({ error: 'Line not found' });
        }

        const line = lines[0];

        // Check if explanation is cached
        const [cached] = await pool.execute(
            'SELECT explanation FROM line_explanations WHERE lesson_line_id = ?',
            [lineId]
        );

        if (cached.length > 0) {
            return res.json({ explanation: cached[0].explanation });
        }

        // Get context (surrounding lines)
        const [contextLines] = await pool.execute(
            'SELECT code_content FROM lesson_lines WHERE lesson_id = ? AND line_number BETWEEN ? AND ? ORDER BY line_number ASC',
            [id, Math.max(1, line.line_number - 2), line.line_number + 2]
        );

        const context = contextLines.map(l => l.code_content).join('\n');

        // Generate explanation using AI
        const explanation = await explainLineAI(line.code_content, context);

        // Cache the explanation
        await pool.execute(
            'INSERT INTO line_explanations (lesson_line_id, explanation) VALUES (?, ?) ON DUPLICATE KEY UPDATE explanation = ?',
            [lineId, explanation, explanation]
        );

        res.json({ explanation });
    } catch (error) {
        console.error('Explain line error:', error);
        res.status(500).json({ error: 'Failed to generate explanation' });
    }
};

/**
 * Generate quiz for a lesson
 */
const generateQuizForLesson = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if quiz already exists
        const [existingQuizzes] = await pool.execute(
            'SELECT id FROM quizzes WHERE lesson_id = ?',
            [id]
        );

        if (existingQuizzes.length > 0) {
            // Return existing quiz
            const quizId = existingQuizzes[0].id;
            const [questions] = await pool.execute(
                'SELECT id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index FROM questions WHERE quiz_id = ? ORDER BY order_index ASC',
                [quizId]
            );

            return res.json({
                quiz: {
                    id: quizId,
                    lesson_id: parseInt(id),
                    questions: questions.map(q => ({
                        id: q.id,
                        question: q.question_text,
                        options: {
                            a: q.option_a,
                            b: q.option_b,
                            c: q.option_c,
                            d: q.option_d
                        },
                        correctAnswer: q.correct_answer,
                        explanation: q.explanation
                    }))
                }
            });
        }

        // Get lesson content
        const [lessons] = await pool.execute(
            'SELECT title, description FROM lessons WHERE id = ?',
            [id]
        );

        if (lessons.length === 0) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        const [lines] = await pool.execute(
            'SELECT code_content FROM lesson_lines WHERE lesson_id = ? ORDER BY line_number ASC',
            [id]
        );

        const lessonContent = lines.map(l => l.code_content).join('\n');
        const lessonTitle = lessons[0].title;

        // Generate quiz using AI
        const quizData = await generateQuiz(lessonContent, lessonTitle);

        // Save quiz to database
        const [quizResult] = await pool.execute(
            'INSERT INTO quizzes (lesson_id, title, description) VALUES (?, ?, ?)',
            [id, `Quiz: ${lessonTitle}`, `Test your knowledge of ${lessonTitle}`]
        );

        const quizId = quizResult.insertId;

        // Validate quiz data structure
        if (!quizData.questions || !Array.isArray(quizData.questions)) {
            throw new Error('Invalid quiz data format: questions array not found');
        }

        // Save questions
        for (let i = 0; i < quizData.questions.length; i++) {
            const q = quizData.questions[i];
            if (!q.question || !q.options || !q.correctAnswer) {
                console.error('Invalid question format:', q);
                continue; // Skip invalid questions
            }
            await pool.execute(
                'INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    quizId,
                    q.question,
                    q.options.a || '',
                    q.options.b || '',
                    q.options.c || '',
                    q.options.d || '',
                    q.correctAnswer,
                    q.explanation || '',
                    i + 1
                ]
            );
        }

        res.json({
            quiz: {
                id: quizId,
                lesson_id: parseInt(id),
                questions: quizData.questions
            }
        });
    } catch (error) {
        console.error('Generate quiz error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Failed to generate quiz',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getAllLessons,
    getLesson,
    explainLine,
    generateQuizForLesson
};

