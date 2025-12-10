const OpenAI = require('openai');
require('dotenv').config();

// Import node-fetch for custom fetch implementation
let nodeFetch = null;
try {
    nodeFetch = require('node-fetch');
} catch (e) {
    // Use global fetch if available (Node.js 18+)
    if (typeof globalThis !== 'undefined' && globalThis.fetch) {
        nodeFetch = globalThis.fetch;
    } else if (typeof global !== 'undefined' && global.fetch) {
        nodeFetch = global.fetch;
    }
}

// Check if API key is set
let isOpenRouter = false;
let openai = null;

try {
    if (!process.env.OPENAI_API_KEY) {
        console.warn('⚠️  OPENAI_API_KEY is not set in environment variables');
    } else {
        // OpenRouter uses OpenAI-compatible API
        // If the key starts with sk-or-, use OpenRouter base URL
        isOpenRouter = process.env.OPENAI_API_KEY.startsWith('sk-or-');

        // Build OpenAI config
        const openaiConfig = {
            apiKey: process.env.OPENAI_API_KEY
        };

        if (isOpenRouter) {
            openaiConfig.baseURL = 'https://openrouter.ai/api/v1';
            const siteUrl = process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173');
            
            // Create custom fetch function to ensure OpenRouter headers are sent
            if (nodeFetch) {
                const originalFetch = nodeFetch;
                openaiConfig.fetch = async (url, options = {}) => {
                    const headers = {
                        ...options.headers,
                        'HTTP-Referer': siteUrl,
                        'X-Title': 'Luno - AI Coding Tutor'
                    };
                    return originalFetch(url, { ...options, headers });
                };
            }
            
            // Also set defaultHeaders as backup
            openaiConfig.defaultHeaders = {
                'HTTP-Referer': siteUrl,
                'X-Title': 'Luno - AI Coding Tutor'
            };
            
            console.log('✅ Using OpenRouter API');
            console.log(`📝 Site URL for headers: ${siteUrl}`);
            console.log(`📝 Base URL: ${openaiConfig.baseURL}`);
        } else {
            console.log('✅ Using OpenAI API');
        }

        console.log('🔧 Initializing OpenAI client...');
        openai = new OpenAI(openaiConfig);
        console.log('✅ OpenAI client initialized successfully');
    }
} catch (err) {
    console.error('⚠️  Error initializing OpenAI client:', err.message);
    console.warn('⚠️  AI features will not work until API key is configured');
}

/**
 * Explain a line of code using OpenAI
 */
const explainLine = async (codeLine, context = '') => {
    if (!openai) {
        throw new Error('OpenAI API key is not configured');
    }
    try {
        const prompt = `You are a friendly coding tutor teaching HTML and CSS to beginners. Explain this line of code in a simple, encouraging way:

${codeLine}

${context ? `Context: ${context}` : ''}

Keep the explanation:
- Simple and beginner-friendly
- Fun and engaging
- Under 100 words
- Focus on what this line does and why it's important`;

        const response = await openai.chat.completions.create({
            model: isOpenRouter ? 'openai/gpt-3.5-turbo' : 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a friendly, patient coding tutor who explains code in simple terms for beginners learning HTML and CSS.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 200,
            temperature: 0.7
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('OpenAI API error:', error);
        console.error('Error details:', error.message);
        console.error('Full error:', JSON.stringify(error, null, 2));
        if (error.response) {
            console.error('API Response Status:', error.response.status);
            console.error('API Response Data:', JSON.stringify(error.response.data, null, 2));
        }
        if (error.error) {
            console.error('Error object:', JSON.stringify(error.error, null, 2));
        }
        const errorMessage = error.error?.message || error.message || 'Unknown error';
        throw new Error(`Failed to generate explanation: ${errorMessage}`);
    }
};

/**
 * Generate quiz questions for a lesson
 */
const generateQuiz = async (lessonContent, lessonTitle) => {
    if (!openai) {
        throw new Error('OpenAI API key is not configured');
    }
    try {
        const prompt = `Generate 5 multiple-choice questions about this HTML/CSS lesson:

Lesson Title: ${lessonTitle}
Lesson Content:
${lessonContent}

Create 5 MCQ questions with:
- Clear, beginner-friendly question text
- 4 options (a, b, c, d) for each question
- One correct answer per question
- Brief explanation for the correct answer

Format as JSON:
{
  "questions": [
    {
      "question": "Question text?",
      "options": {
        "a": "Option A",
        "b": "Option B",
        "c": "Option C",
        "d": "Option D"
      },
      "correctAnswer": "a",
      "explanation": "Brief explanation"
    }
  ]
}`;

        const response = await openai.chat.completions.create({
            model: isOpenRouter ? 'openai/gpt-3.5-turbo' : 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a coding tutor creating quiz questions. Always respond with valid JSON only, no markdown formatting.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 1500,
            temperature: 0.7
        });

        const content = response.choices[0].message.content.trim();
        // Remove markdown code blocks if present
        const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        return JSON.parse(jsonContent);
    } catch (error) {
        console.error('OpenAI API error:', error);
        console.error('Error details:', error.message);
        console.error('Full error:', JSON.stringify(error, null, 2));
        if (error.response) {
            console.error('API Response Status:', error.response.status);
            console.error('API Response Data:', JSON.stringify(error.response.data, null, 2));
        }
        if (error.error) {
            console.error('Error object:', JSON.stringify(error.error, null, 2));
        }
        const errorMessage = error.error?.message || error.message || 'Unknown error';
        throw new Error(`Failed to generate quiz: ${errorMessage}`);
    }
};

/**
 * Chat with AI tutor
 */
const chatWithTutor = async (message, conversationHistory = []) => {
    // Check if OpenAI client is initialized
    if (!openai) {
        console.error('❌ OpenAI client is not initialized');
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is not configured in environment variables');
        } else {
            throw new Error('OpenAI client failed to initialize. Please check your API key.');
        }
    }
    
    try {
        if (!message || typeof message !== 'string') {
            throw new Error('Message must be a non-empty string');
        }

        const messages = [
            {
                role: 'system',
                content: 'You are Luno, a friendly and patient AI coding tutor specializing in HTML and CSS. You help students learn step-by-step, explain concepts clearly, and encourage them. Keep responses concise (under 200 words) and beginner-friendly.'
            },
            ...(Array.isArray(conversationHistory) ? conversationHistory : []),
            {
                role: 'user',
                content: message
            }
        ];

        // Determine if using OpenRouter (check again in case module was reloaded)
        const apiKey = process.env.OPENAI_API_KEY || '';
        const usingOpenRouter = apiKey.startsWith('sk-or-');
        const model = usingOpenRouter ? 'openai/gpt-3.5-turbo' : 'gpt-3.5-turbo';
        
        console.log(`📤 Sending chat request to ${usingOpenRouter ? 'OpenRouter' : 'OpenAI'}...`);
        console.log(`📝 Using model: ${model}`);
        console.log(`📝 Message length: ${message.length} characters`);
        console.log(`📝 History length: ${conversationHistory.length} messages`);
        console.log(`📝 API Key prefix: ${process.env.OPENAI_API_KEY?.substring(0, 15)}...`);
        
        // For OpenRouter, ensure headers are included in the request
        const requestOptions = {
            model: model,
            messages: messages,
            max_tokens: 300,
            temperature: 0.7
        };
        
        const response = await openai.chat.completions.create(requestOptions).catch(err => {
            console.error('❌ OpenAI API call failed:');
            console.error('Error type:', err.constructor.name);
            console.error('Error message:', err.message);
            if (err.status) {
                console.error('HTTP Status:', err.status);
            }
            if (err.response) {
                console.error('Response status:', err.response.status);
                console.error('Response data:', JSON.stringify(err.response.data, null, 2));
            }
            if (err.error) {
                console.error('Error object:', JSON.stringify(err.error, null, 2));
            }
            // Check for specific OpenRouter errors
            if (err.message && err.message.includes('User not found')) {
                console.error('⚠️  OpenRouter "User not found" error - this usually means:');
                console.error('   1. The API key is invalid or expired');
                console.error('   2. The OpenRouter account associated with the key doesn\'t exist');
                console.error('   3. The API key format is incorrect');
            }
            throw err;
        });

        if (!response || !response.choices || !response.choices[0]) {
            throw new Error('Invalid response from API');
        }

        const content = response.choices[0].message?.content;
        if (!content) {
            throw new Error('Empty response from API');
        }

        console.log('✅ Chat response received');
        return content.trim();
    } catch (error) {
        console.error('❌ OpenAI API error in chatWithTutor:');
        console.error('Error message:', error.message);
        console.error('Error type:', error.constructor.name);
        
        // Handle different error types
        if (error.status) {
            console.error('HTTP Status:', error.status);
        }
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
        if (error.error) {
            console.error('Error object:', JSON.stringify(error.error, null, 2));
        }
        if (error.cause) {
            console.error('Error cause:', error.cause);
        }
        
        // Try to extract meaningful error message
        let errorMessage = 'Unknown error';
        if (error.error?.message) {
            errorMessage = error.error.message;
        } else if (error.response?.data?.error?.message) {
            errorMessage = error.response.data.error.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        throw new Error(`Failed to get response from tutor: ${errorMessage}`);
    }
};

/**
 * Debug code and provide suggestions
 */
const debugCode = async (code, errorMessage = '') => {
    if (!openai) {
        throw new Error('OpenAI API key is not configured');
    }
    try {
        const prompt = `A student is having trouble with their HTML/CSS code. Help them debug it:

Code:
${code}

${errorMessage ? `Error message: ${errorMessage}` : 'No specific error, but the code is not working as expected.'}

Provide:
1. What's wrong with the code
2. How to fix it
3. A corrected version (if applicable)

Keep it beginner-friendly and encouraging.`;

        const response = await openai.chat.completions.create({
            model: isOpenRouter ? 'openai/gpt-3.5-turbo' : 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful debugging assistant. Explain errors clearly and provide solutions in a friendly, encouraging way.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('OpenAI API error:', error);
        console.error('Error details:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.status, error.response.data);
        }
        throw new Error(`Failed to debug code: ${error.message}`);
    }
};

module.exports = {
    explainLine,
    generateQuiz,
    chatWithTutor,
    debugCode
};

