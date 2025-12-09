const { chatWithTutor } = require('../services/openaiService');

/**
 * Chat with AI tutor
 */
const chat = async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Format conversation history
        const conversationHistory = history.map(msg => ({
            role: msg.role || 'user',
            content: msg.content
        }));

        // Get response from AI
        const response = await chatWithTutor(message.trim(), conversationHistory);

        res.json({
            response,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Chat error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Failed to get response from tutor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    chat
};

