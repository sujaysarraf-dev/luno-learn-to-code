const { debugCode } = require('../services/openaiService');

/**
 * Debug code and provide suggestions
 */
const debug = async (req, res) => {
    try {
        const { code, errorMessage } = req.body;

        if (!code || typeof code !== 'string' || code.trim().length === 0) {
            return res.status(400).json({ error: 'Code is required' });
        }

        // Get debugging help from AI
        const debugResponse = await debugCode(code.trim(), errorMessage || '');

        res.json({
            suggestion: debugResponse,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({ error: 'Failed to debug code' });
    }
};

module.exports = {
    debug
};

