const { analyzeCode } = require('../services/openaiService');

/**
 * Get code suggestions for a specific issue
 */
const getCodeSuggestions = async (code, issue, language) => {
    // This can be enhanced later with more specific AI prompts
    return analyzeCode(code, language);
};

/**
 * Review HTML/CSS code and provide suggestions
 */
const reviewCode = async (req, res) => {
    try {
        const { code, language = 'html' } = req.body;

        if (!code || typeof code !== 'string') {
            return res.status(400).json({ error: 'Code is required' });
        }

        if (code.trim().length === 0) {
            return res.json({
                suggestions: [],
                score: 100,
                message: 'Code is empty. Start typing to get suggestions!'
            });
        }

        // Analyze code using AI
        const analysis = await analyzeCode(code, language);

        res.json(analysis);
    } catch (error) {
        console.error('Code review error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            error: 'Failed to review code',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * Get suggestions for specific code issues
 */
const getSuggestions = async (req, res) => {
    try {
        const { code, issue, language = 'html' } = req.body;

        if (!code || !issue) {
            return res.status(400).json({ error: 'Code and issue are required' });
        }

        const suggestions = await getCodeSuggestions(code, issue, language);

        res.json({ suggestions });
    } catch (error) {
        console.error('Get suggestions error:', error);
        res.status(500).json({
            error: 'Failed to get suggestions',
            message: error.message
        });
    }
};

module.exports = {
    reviewCode,
    getSuggestions
};

