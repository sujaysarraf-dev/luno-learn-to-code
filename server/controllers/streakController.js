const pool = require('../db/connection');

/**
 * Get user streak information
 */
const getUserStreak = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Get or create user streak
        let [streaks] = await pool.execute(
            'SELECT * FROM user_streaks WHERE user_id = ?',
            [userId]
        );

        if (streaks.length === 0) {
            // Create new streak record
            await pool.execute(
                'INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, total_days_active) VALUES (?, 0, 0, NULL, 0)',
                [userId]
            );
            [streaks] = await pool.execute(
                'SELECT * FROM user_streaks WHERE user_id = ?',
                [userId]
            );
        }

        const streak = streaks[0];
        const today = new Date().toISOString().split('T')[0];
        const lastActivity = streak.last_activity_date ? new Date(streak.last_activity_date).toISOString().split('T')[0] : null;

        // Check if streak should be reset (more than 1 day gap)
        if (lastActivity) {
            const daysDiff = Math.floor((new Date(today) - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
            if (daysDiff > 1) {
                // Reset streak
                await pool.execute(
                    'UPDATE user_streaks SET current_streak = 0, last_activity_date = ? WHERE user_id = ?',
                    [today, userId]
                );
                streak.current_streak = 0;
            }
        }

        // Get today's activities
        const [todayActivities] = await pool.execute(
            'SELECT COUNT(*) as count FROM daily_activities WHERE user_id = ? AND activity_date = ?',
            [userId, today]
        );

        // Get today's challenge
        const [todayChallenge] = await pool.execute(
            `SELECT dc.*, 
                CASE WHEN cc.id IS NOT NULL THEN TRUE ELSE FALSE END as completed
            FROM daily_challenges dc
            LEFT JOIN challenge_completions cc ON dc.id = cc.challenge_id AND cc.user_id = ?
            WHERE dc.challenge_date = ?
            LIMIT 1`,
            [userId, today]
        );

        // Get user badges
        const [badges] = await pool.execute(
            'SELECT * FROM user_badges WHERE user_id = ? ORDER BY earned_at DESC',
            [userId]
        );

        res.json({
            currentStreak: streak.current_streak,
            longestStreak: streak.longest_streak,
            totalDaysActive: streak.total_days_active,
            lastActivityDate: streak.last_activity_date,
            todayActivityCount: todayActivities[0].count,
            todayChallenge: todayChallenge[0] || null,
            badges: badges,
            isActiveToday: todayActivities[0].count > 0
        });
    } catch (error) {
        console.error('Get user streak error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error message:', error.message);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * Record user activity (called when user completes lesson, quiz, etc.)
 */
const recordActivity = async (req, res) => {
    try {
        const userId = req.userId;
        const { activityType, activityId, points = 0 } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!activityType) {
            return res.status(400).json({ error: 'Activity type is required' });
        }

        const today = new Date().toISOString().split('T')[0];

        // Check if activity already recorded today
        const [existing] = await pool.execute(
            'SELECT id FROM daily_activities WHERE user_id = ? AND activity_date = ? AND activity_type = ? AND activity_id = ?',
            [userId, today, activityType, activityId || null]
        );

        if (existing.length > 0) {
            return res.json({ message: 'Activity already recorded today' });
        }

        // Record activity
        await pool.execute(
            'INSERT INTO daily_activities (user_id, activity_date, activity_type, activity_id, points_earned) VALUES (?, ?, ?, ?, ?)',
            [userId, today, activityType, activityId || null, points]
        );

        // Update streak
        await updateStreak(userId, today);

        res.json({ message: 'Activity recorded', pointsEarned: points });
    } catch (error) {
        console.error('Record activity error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Complete daily challenge
 */
const completeChallenge = async (req, res) => {
    try {
        const userId = req.userId;
        const { challengeId } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Get challenge details
        const [challenges] = await pool.execute(
            'SELECT * FROM daily_challenges WHERE id = ?',
            [challengeId]
        );

        if (challenges.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        const challenge = challenges[0];

        // Check if already completed
        const [existing] = await pool.execute(
            'SELECT id FROM challenge_completions WHERE user_id = ? AND challenge_id = ?',
            [userId, challengeId]
        );

        if (existing.length > 0) {
            return res.json({ message: 'Challenge already completed', pointsEarned: challenge.points_reward });
        }

        // Record completion
        await pool.execute(
            'INSERT INTO challenge_completions (user_id, challenge_id, points_earned) VALUES (?, ?, ?)',
            [userId, challengeId, challenge.points_reward]
        );

        // Record activity
        const today = new Date().toISOString().split('T')[0];
        await pool.execute(
            'INSERT INTO daily_activities (user_id, activity_date, activity_type, activity_id, points_earned) VALUES (?, ?, ?, ?, ?)',
            [userId, today, 'challenge', challengeId, challenge.points_reward]
        );

        // Update streak
        await updateStreak(userId, today);

        // Check for badge unlocks
        await checkBadgeUnlocks(userId);

        res.json({ 
            message: 'Challenge completed', 
            pointsEarned: challenge.points_reward 
        });
    } catch (error) {
        console.error('Complete challenge error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Helper function to update user streak
 */
const updateStreak = async (userId, today) => {
    try {
        // Get current streak
        const [streaks] = await pool.execute(
            'SELECT * FROM user_streaks WHERE user_id = ?',
            [userId]
        );

        if (streaks.length === 0) {
            await pool.execute(
                'INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, total_days_active) VALUES (?, 1, 1, ?, 1)',
                [userId, today]
            );
            return;
        }

        const streak = streaks[0];
        const lastActivity = streak.last_activity_date ? new Date(streak.last_activity_date).toISOString().split('T')[0] : null;
        const yesterday = new Date(new Date(today).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        let newStreak = streak.current_streak;
        let newTotalDays = streak.total_days_active;

        if (!lastActivity) {
            // First activity ever
            newStreak = 1;
            newTotalDays = 1;
        } else if (lastActivity === today) {
            // Already active today, no change
            return;
        } else if (lastActivity === yesterday) {
            // Consecutive day - increment streak
            newStreak = streak.current_streak + 1;
            newTotalDays = streak.total_days_active + 1;
        } else {
            // New streak starting
            newStreak = 1;
            newTotalDays = streak.total_days_active + 1;
        }

        const newLongestStreak = Math.max(newStreak, streak.longest_streak);

        await pool.execute(
            'UPDATE user_streaks SET current_streak = ?, longest_streak = ?, last_activity_date = ?, total_days_active = ? WHERE user_id = ?',
            [newStreak, newLongestStreak, today, newTotalDays, userId]
        );
    } catch (error) {
        console.error('Update streak error:', error);
    }
};

/**
 * Check and award badges based on achievements
 */
const checkBadgeUnlocks = async (userId) => {
    try {
        const [streaks] = await pool.execute(
            'SELECT * FROM user_streaks WHERE user_id = ?',
            [userId]
        );

        if (streaks.length === 0) return;

        const streak = streaks[0];
        const badges = [];

        // Streak badges
        if (streak.current_streak >= 7 && !await hasBadge(userId, 'streak_7')) {
            badges.push({ type: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak!' });
        }
        if (streak.current_streak >= 30 && !await hasBadge(userId, 'streak_30')) {
            badges.push({ type: 'streak_30', name: 'Monthly Master', description: 'Maintain a 30-day streak!' });
        }
        if (streak.longest_streak >= 100 && !await hasBadge(userId, 'streak_100')) {
            badges.push({ type: 'streak_100', name: 'Century Champion', description: 'Achieve a 100-day streak!' });
        }

        // Total days badges
        if (streak.total_days_active >= 10 && !await hasBadge(userId, 'days_10')) {
            badges.push({ type: 'days_10', name: 'Getting Started', description: 'Be active for 10 days!' });
        }
        if (streak.total_days_active >= 50 && !await hasBadge(userId, 'days_50')) {
            badges.push({ type: 'days_50', name: 'Dedicated Learner', description: 'Be active for 50 days!' });
        }

        // Award badges
        for (const badge of badges) {
            await pool.execute(
                'INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description) VALUES (?, ?, ?, ?)',
                [userId, badge.type, badge.name, badge.description]
            );
        }

        return badges;
    } catch (error) {
        console.error('Check badge unlocks error:', error);
        return [];
    }
};

/**
 * Helper to check if user has a badge
 */
const hasBadge = async (userId, badgeType) => {
    const [badges] = await pool.execute(
        'SELECT id FROM user_badges WHERE user_id = ? AND badge_type = ?',
        [userId, badgeType]
    );
    return badges.length > 0;
};

/**
 * Generate or get today's daily challenge
 */
const getTodayChallenge = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const userId = req.userId || null;

        // Check if challenge exists for today
        let [challenges] = await pool.execute(
            'SELECT * FROM daily_challenges WHERE challenge_date = ?',
            [today]
        );

        if (challenges.length === 0) {
            // Generate a new challenge
            // Get random lesson for challenge
            const [lessons] = await pool.execute(
                'SELECT id, title FROM lessons ORDER BY RAND() LIMIT 1'
            );

            if (lessons.length > 0) {
                const lesson = lessons[0];
                const challengeTypes = [
                    { type: 'lesson', title: `Complete: ${lesson.title}`, description: `Finish the lesson "${lesson.title}" to earn bonus points!` },
                    { type: 'quiz', title: 'Take a Quiz', description: 'Complete any quiz to keep your streak alive!' },
                    { type: 'practice', title: 'Practice Coding', description: 'Spend 15 minutes coding in the editor today!' }
                ];

                const randomChallenge = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

                await pool.execute(
                    'INSERT INTO daily_challenges (challenge_date, title, description, challenge_type, target_id, points_reward, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [today, randomChallenge.title, randomChallenge.description, randomChallenge.type, lesson.id, 10, 'beginner']
                );

                [challenges] = await pool.execute(
                    'SELECT * FROM daily_challenges WHERE challenge_date = ?',
                    [today]
                );
            }
        }

        let challenge = challenges[0] || null;
        let completed = false;

        if (challenge && userId) {
            const [completions] = await pool.execute(
                'SELECT id FROM challenge_completions WHERE user_id = ? AND challenge_id = ?',
                [userId, challenge.id]
            );
            completed = completions.length > 0;
        }

        res.json({ challenge, completed });
    } catch (error) {
        console.error('Get today challenge error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error message:', error.message);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

module.exports = {
    getUserStreak,
    recordActivity,
    completeChallenge,
    getTodayChallenge
};

