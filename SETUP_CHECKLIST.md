# Luno Setup Checklist

Use this checklist to ensure everything is properly set up.

## ✅ Completed

- [x] Backend code structure (routes, controllers, services, db, utils)
- [x] Frontend code structure (pages, components, services)
- [x] Database schema created
- [x] Database migration run successfully
- [x] All credentials documented
- [x] GitHub repository configured
- [x] Documentation files created

## ⚠️ Required Setup Steps

### 1. Install Dependencies

**Root dependencies** (for running both servers):
```bash
npm install
```

**Client dependencies** (if not installed):
```bash
cd client
npm install
cd ..
```

**Server dependencies** (already installed ✅)

### 2. Create Environment Files

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

### 3. Test the Application

**Start development servers:**
```bash
npm run dev
```

This will start:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:5173`

**Test the application:**
1. Open `http://localhost:5173` in your browser
2. Sign up for a new account
3. View lessons
4. Test AI features (explain line, chat, debug)
5. Take a quiz

## 📋 Pre-Deployment Checklist

Before deploying to Hostinger:

- [ ] All dependencies installed
- [ ] `.env` files created with correct credentials
- [ ] Application runs locally without errors
- [ ] Database connection works
- [ ] OpenAI API key is valid and has credits
- [ ] Frontend builds successfully: `npm run build`
- [ ] Test all features locally

## 🚀 Ready to Deploy?

Once everything above is checked, follow [DEPLOYMENT.md](./DEPLOYMENT.md) for Hostinger deployment.

## 🔍 Quick Verification

Run these commands to verify setup:

```bash
# Check if dependencies are installed
npm list --depth=0
cd client && npm list --depth=0 && cd ..
cd server && npm list --depth=0 && cd ..

# Test backend connection (if .env exists)
cd server && node -e "require('dotenv').config(); console.log('DB_HOST:', process.env.DB_HOST)" && cd ..

# Build frontend (test if it compiles)
cd client && npm run build && cd ..
```

## ❓ Troubleshooting

**If you see "Cannot find module" errors:**
- Run `npm install` in the directory with the error

**If database connection fails:**
- Verify `.env` file exists in `server/` directory
- Check database credentials are correct
- Ensure database host `auth-db1336.hstgr.io` is accessible

**If OpenAI API errors:**
- Verify API key in `server/.env`
- Check OpenAI account has credits
- Test API key at https://platform.openai.com

**If frontend can't connect to backend:**
- Verify backend is running on port 5000
- Check `client/.env` has correct `VITE_API_URL`
- Check CORS settings in `server/index.js`

