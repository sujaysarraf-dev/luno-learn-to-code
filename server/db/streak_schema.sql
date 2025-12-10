-- Streak System & Daily Challenges Schema
-- Run this to add streak tracking to your database

-- User streaks table (tracks daily activity and streaks)
CREATE TABLE IF NOT EXISTS user_streaks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_activity_date DATE,
    total_days_active INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_streak (user_id),
    INDEX idx_user (user_id),
    INDEX idx_last_activity (last_activity_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Daily activity log (tracks what user did each day)
CREATE TABLE IF NOT EXISTS daily_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_date DATE NOT NULL,
    activity_type ENUM('lesson', 'quiz', 'challenge', 'code') NOT NULL,
    activity_id INT,
    points_earned INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_activity (user_id, activity_date, activity_type, activity_id),
    INDEX idx_user_date (user_id, activity_date),
    INDEX idx_date (activity_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Daily challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    challenge_date DATE NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    challenge_type ENUM('lesson', 'quiz', 'code', 'practice') NOT NULL,
    target_id INT,
    points_reward INT DEFAULT 10,
    difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date (challenge_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User challenge completions
CREATE TABLE IF NOT EXISTS challenge_completions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_id INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    points_earned INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES daily_challenges(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_challenge (user_id, challenge_id),
    INDEX idx_user (user_id),
    INDEX idx_challenge (challenge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User badges/achievements
CREATE TABLE IF NOT EXISTS user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    badge_type VARCHAR(50) NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    badge_description TEXT,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_badge (user_id, badge_type),
    INDEX idx_user (user_id),
    INDEX idx_badge_type (badge_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

