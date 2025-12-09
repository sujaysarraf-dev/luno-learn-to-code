// Vercel serverless function entry point
// This wraps the Express app for Vercel

const app = require('../server/index');

module.exports = app;
