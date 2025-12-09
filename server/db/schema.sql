-- Luno Database Schema
-- Run this in your MySQL database to create all required tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 0,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order (order_index),
    INDEX idx_difficulty (difficulty_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lesson lines table (stores each line of code in a lesson)
CREATE TABLE IF NOT EXISTS lesson_lines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT NOT NULL,
    line_number INT NOT NULL,
    code_content TEXT NOT NULL,
    line_type ENUM('html', 'css', 'comment', 'text') DEFAULT 'html',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    INDEX idx_lesson (lesson_id),
    INDEX idx_line_number (lesson_id, line_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Line explanations cache (stores AI explanations for each line)
CREATE TABLE IF NOT EXISTS line_explanations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_line_id INT NOT NULL,
    explanation TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_line_id) REFERENCES lesson_lines(id) ON DELETE CASCADE,
    UNIQUE KEY unique_line_explanation (lesson_line_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    INDEX idx_lesson (lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Questions table (MCQ questions for quizzes)
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    option_a VARCHAR(500) NOT NULL,
    option_b VARCHAR(500) NOT NULL,
    option_c VARCHAR(500) NOT NULL,
    option_d VARCHAR(500) NOT NULL,
    correct_answer ENUM('a', 'b', 'c', 'd') NOT NULL,
    explanation TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_quiz (quiz_id),
    INDEX idx_order (quiz_id, order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quiz attempts table (tracks user quiz submissions)
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    total_questions INT NOT NULL DEFAULT 0,
    answers JSON,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_quiz (quiz_id),
    INDEX idx_completed (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User progress table (optional - tracks lesson completion)
CREATE TABLE IF NOT EXISTS user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lesson_id INT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_lesson (user_id, lesson_id),
    INDEX idx_user (user_id),
    INDEX idx_lesson (lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample lessons
INSERT INTO lessons (title, description, order_index, difficulty_level) VALUES
('Introduction to HTML', 'Learn the basics of HTML structure and tags', 1, 'beginner'),
('HTML Elements and Attributes', 'Understanding HTML elements, attributes, and nesting', 2, 'beginner'),
('Introduction to CSS', 'Learn how to style your HTML with CSS', 3, 'beginner'),
('CSS Selectors', 'Master CSS selectors to target elements precisely', 4, 'intermediate'),
('CSS Layout with Flexbox', 'Create flexible layouts using CSS Flexbox', 5, 'intermediate');

-- Insert sample lesson lines for first lesson
INSERT INTO lesson_lines (lesson_id, line_number, code_content, line_type) VALUES
(1, 1, '<!DOCTYPE html>', 'html'),
(1, 2, '<html lang="en">', 'html'),
(1, 3, '<head>', 'html'),
(1, 4, '    <meta charset="UTF-8">', 'html'),
(1, 5, '    <meta name="viewport" content="width=device-width, initial-scale=1.0">', 'html'),
(1, 6, '    <title>My First Web Page</title>', 'html'),
(1, 7, '</head>', 'html'),
(1, 8, '<body>', 'html'),
(1, 9, '    <h1>Welcome to HTML!</h1>', 'html'),
(1, 10, '    <p>This is my first paragraph.</p>', 'html'),
(1, 11, '</body>', 'html'),
(1, 12, '</html>', 'html');

