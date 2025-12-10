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
        console.error('❌ Chat controller error:');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
        if (error.error) {
            console.error('Error object:', JSON.stringify(error.error, null, 2));
        }
        
        // Check for specific OpenRouter errors
        let userFriendlyMessage = 'Failed to get response from tutor';
        let statusCode = 500;
        
        if (error.message && (error.message.includes('User not found') || error.message.includes('user not found'))) {
            userFriendlyMessage = '⚠️ OpenRouter API key is invalid or expired. Please check your API key configuration in server/.env file.';
            statusCode = 401;
        } else if (error.message && error.message.includes('API key')) {
            userFriendlyMessage = '⚠️ OpenAI API key is not configured correctly.';
            statusCode = 500;
        } else if (error.message && error.message.includes('Failed to get response from tutor')) {
            // Extract the underlying error message
            const underlyingError = error.message.replace('Failed to get response from tutor: ', '');
            if (underlyingError.includes('User not found')) {
                userFriendlyMessage = '⚠️ OpenRouter API key is invalid or expired. Please verify your API key at https://openrouter.ai/keys';
                statusCode = 401;
            } else {
                userFriendlyMessage = '⚠️ ' + underlyingError;
            }
        }
        
        // Always send error details in development
        const errorResponse = { 
            error: userFriendlyMessage,
            message: error.message || 'Unknown error',
            type: error.constructor.name
        };
        
        if (process.env.NODE_ENV === 'development') {
            errorResponse.details = {
                stack: error.stack,
                response: error.response?.data,
                error: error.error
            };
        }
        
        res.status(statusCode).json(errorResponse);
    }
};

module.exports = {
    chat
};

