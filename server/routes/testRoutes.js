const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
require('dotenv').config();

/**
 * Test OpenAI/OpenRouter connection
 */
router.get('/test-api', async (req, res) => {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        const isOpenRouter = apiKey.startsWith('sk-or-');
        const config = {
            apiKey: apiKey
        };

        if (isOpenRouter) {
            config.baseURL = 'https://openrouter.ai/api/v1';
            const siteUrl = process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173');
            config.defaultHeaders = {};
            config.defaultHeaders['HTTP-Referer'] = siteUrl;
            config.defaultHeaders['X-Title'] = 'Luno - AI Coding Tutor';
            console.log('🧪 Test: Using OpenRouter with site URL:', siteUrl);
        } else {
            console.log('🧪 Test: Using OpenAI');
        }

        console.log('🧪 Test: Creating OpenAI client...');
        const openai = new OpenAI(config);
        console.log('🧪 Test: OpenAI client created');

        const response = await openai.chat.completions.create({
            model: isOpenRouter ? 'openai/gpt-3.5-turbo' : 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: 'Say "Hello" if you can hear me.'
                }
            ],
            max_tokens: 10
        });

        res.json({
            success: true,
            provider: isOpenRouter ? 'OpenRouter' : 'OpenAI',
            response: response.choices[0].message.content,
            model: response.model
        });
    } catch (error) {
        console.error('Test API error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? {
                status: error.status,
                response: error.response?.data,
                error: error.error
            } : undefined
        });
    }
});

module.exports = router;

