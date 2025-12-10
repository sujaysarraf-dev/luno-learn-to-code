const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool for better performance
// Reduced connection limit for serverless (Vercel)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'auth-db1336.hstgr.io',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: process.env.VERCEL ? 2 : 10, // Lower limit for serverless
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 60000
});

// Test connection (non-blocking - don't crash server if DB is down)
pool.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection error:', err.message);
        console.error('⚠️  Server will continue but database operations may fail');
        // Don't throw - let server start even if DB is down
    });

module.exports = pool;

