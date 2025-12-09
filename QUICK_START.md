# Luno Quick Start Guide

## Your Credentials (Already Configured)

✅ **Database**: `u509616587_luno`  
✅ **Username**: `u509616587_luno`  
✅ **Password**: `Luno@5569`  
✅ **OpenAI API Key**: Configured  
✅ **GitHub Repo**: https://github.com/sujaysarraf-dev/luno-learn-to-code

## Quick Setup (3 Steps)

### 1. Install Dependencies

```bash
# Root
npm install

# Backend
cd server
npm install
cd ..

# Frontend
cd client
npm install
cd ..
```

### 2. Create .env Files

**Create `server/.env`:**
```env
PORT=5000
NODE_ENV=development

DB_HOST=auth-db1336.hstgr.io
DB_USER=u509616587_luno
DB_PASS=Luno@5569
DB_NAME=u509616587_luno

OPENAI_API_KEY=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

JWT_SECRET=luno_jwt_secret_change_this_in_production_2024
```

**Create `client/.env`:**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Setup Database & Run

```bash
# Import database schema
mysql -u u509616587_luno -pLuno@5569 u509616587_luno < server/db/schema.sql

# Start development servers
npm run dev
```

🎉 **Done!** Open http://localhost:5173 in your browser.

## Next Steps

- Sign up for a new account
- Start learning HTML/CSS with AI-powered lessons
- Try the code editor and live preview
- Take quizzes to test your knowledge

## Troubleshooting

**Database connection error?**
- Make sure MySQL is running
- Verify credentials in `server/.env`
- Check database exists: `mysql -u u509616587_luno -pLuno@5569 -e "SHOW DATABASES;"`

**Port already in use?**
- Change `PORT` in `server/.env`
- Or kill the process using the port

**OpenAI API errors?**
- Verify API key is correct in `server/.env`
- Check your OpenAI account has credits

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Hostinger deployment.

