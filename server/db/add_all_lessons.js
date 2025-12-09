// Script to add all lesson lines to the database
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'auth-db1336.hstgr.io',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true
};

const lessonLines = {
    2: [
        ['<!DOCTYPE html>', 'html'],
        ['<html lang="en">', 'html'],
        ['<head>', 'html'],
        ['    <meta charset="UTF-8">', 'html'],
        ['    <title>HTML Elements</title>', 'html'],
        ['</head>', 'html'],
        ['<body>', 'html'],
        ['    <h1 id="main-title" class="heading">Welcome</h1>', 'html'],
        ['    <p class="intro">This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>', 'html'],
        ['    <a href="https://example.com" target="_blank">Visit Example</a>', 'html'],
        ['    <img src="image.jpg" alt="Description" width="300" height="200">', 'html'],
        ['    <div class="container">', 'html'],
        ['        <span>Inline element</span>', 'html'],
        ['    </div>', 'html'],
        ['</body>', 'html'],
        ['</html>', 'html']
    ],
    3: [
        ['<!DOCTYPE html>', 'html'],
        ['<html lang="en">', 'html'],
        ['<head>', 'html'],
        ['    <meta charset="UTF-8">', 'html'],
        ['    <title>CSS Introduction</title>', 'html'],
        ['    <style>', 'html'],
        ['        body {', 'css'],
        ['            font-family: Arial, sans-serif;', 'css'],
        ['            background-color: #f0f0f0;', 'css'],
        ['            margin: 0;', 'css'],
        ['            padding: 20px;', 'css'],
        ['        }', 'css'],
        ['        h1 {', 'css'],
        ['            color: #333;', 'css'],
        ['            font-size: 32px;', 'css'],
        ['            text-align: center;', 'css'],
        ['        }', 'css'],
        ['        p {', 'css'],
        ['            color: #666;', 'css'],
        ['            line-height: 1.6;', 'css'],
        ['        }', 'css'],
        ['    </style>', 'html'],
        ['</head>', 'html'],
        ['<body>', 'html'],
        ['    <h1>Styled Heading</h1>', 'html'],
        ['    <p>This paragraph has custom styling applied.</p>', 'html'],
        ['</body>', 'html'],
        ['</html>', 'html']
    ],
    4: [
        ['<!DOCTYPE html>', 'html'],
        ['<html lang="en">', 'html'],
        ['<head>', 'html'],
        ['    <meta charset="UTF-8">', 'html'],
        ['    <title>CSS Selectors</title>', 'html'],
        ['    <style>', 'html'],
        ['        /* Element selector */', 'comment'],
        ['        p {', 'css'],
        ['            color: blue;', 'css'],
        ['        }', 'css'],
        ['        /* Class selector */', 'comment'],
        ['        .highlight {', 'css'],
        ['            background-color: yellow;', 'css'],
        ['        }', 'css'],
        ['        /* ID selector */', 'comment'],
        ['        #header {', 'css'],
        ['            font-size: 24px;', 'css'],
        ['        }', 'css'],
        ['        /* Descendant selector */', 'comment'],
        ['        div p {', 'css'],
        ['            margin: 10px;', 'css'],
        ['        }', 'css'],
        ['        /* Pseudo-class selector */', 'comment'],
        ['        a:hover {', 'css'],
        ['            color: red;', 'css'],
        ['        }', 'css'],
        ['    </style>', 'html'],
        ['</head>', 'html'],
        ['<body>', 'html'],
        ['    <div id="header">Header</div>', 'html'],
        ['    <p class="highlight">Highlighted text</p>', 'html'],
        ['    <div>', 'html'],
        ['        <p>Nested paragraph</p>', 'html'],
        ['    </div>', 'html'],
        ['    <a href="#">Hover me</a>', 'html'],
        ['</body>', 'html'],
        ['</html>', 'html']
    ],
    5: [
        ['<!DOCTYPE html>', 'html'],
        ['<html lang="en">', 'html'],
        ['<head>', 'html'],
        ['    <meta charset="UTF-8">', 'html'],
        ['    <title>Flexbox Layout</title>', 'html'],
        ['    <style>', 'html'],
        ['        .container {', 'css'],
        ['            display: flex;', 'css'],
        ['            justify-content: space-between;', 'css'],
        ['            align-items: center;', 'css'],
        ['            height: 300px;', 'css'],
        ['            background-color: #e0e0e0;', 'css'],
        ['        }', 'css'],
        ['        .item {', 'css'],
        ['            flex: 1;', 'css'],
        ['            padding: 20px;', 'css'],
        ['            margin: 10px;', 'css'],
        ['            background-color: #4CAF50;', 'css'],
        ['            color: white;', 'css'],
        ['            text-align: center;', 'css'],
        ['        }', 'css'],
        ['        .item:nth-child(2) {', 'css'],
        ['            flex: 2;', 'css'],
        ['        }', 'css'],
        ['    </style>', 'html'],
        ['</head>', 'html'],
        ['<body>', 'html'],
        ['    <div class="container">', 'html'],
        ['        <div class="item">Item 1</div>', 'html'],
        ['        <div class="item">Item 2 (larger)</div>', 'html'],
        ['        <div class="item">Item 3</div>', 'html'],
        ['    </div>', 'html'],
        ['</body>', 'html'],
        ['</html>', 'html']
    ]
};

async function addAllLessons() {
    let connection;
    
    try {
        console.log('🔄 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database successfully');

        for (const [lessonId, lines] of Object.entries(lessonLines)) {
            console.log(`\n📝 Adding lines for lesson ${lessonId}...`);
            
            // Check if lines already exist
            const [existing] = await connection.execute(
                'SELECT COUNT(*) as count FROM lesson_lines WHERE lesson_id = ?',
                [lessonId]
            );

            if (existing[0].count > 0) {
                console.log(`⚠️  Lesson ${lessonId} already has lines. Skipping...`);
                continue;
            }

            // Insert lines
            for (let i = 0; i < lines.length; i++) {
                const [content, type] = lines[i];
                await connection.execute(
                    'INSERT INTO lesson_lines (lesson_id, line_number, code_content, line_type) VALUES (?, ?, ?, ?)',
                    [lessonId, i + 1, content, type]
                );
            }
            
            console.log(`✅ Added ${lines.length} lines for lesson ${lessonId}`);
        }

        console.log('\n✨ All lessons updated successfully!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.sql) {
            console.error('SQL Error:', error.sql);
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

addAllLessons();

