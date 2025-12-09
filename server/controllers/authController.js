const pool = require('../db/connection');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

/**
 * Register a new user
 */
const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'User already exists with this email or username' });
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, passwordHash]
        );

        // Generate token
        const token = generateToken(result.insertId);

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: result.insertId,
                username,
                email
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Login user
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const [users] = await pool.execute(
            'SELECT id, username, email, password_hash FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await comparePassword(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user.id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, username, email, created_at FROM users WHERE id = ?',
            [req.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: users[0] });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    signup,
    login,
    getProfile
};

