# Quick Vercel Deployment Guide

## 🚀 Deploy in 5 Minutes

### Step 1: Push to GitHub
Make sure all code is pushed:
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push
```

### Step 2: Deploy on Vercel

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import repository: `sujaysarraf-dev/luno-learn-to-code`
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install && cd client && npm install && cd ../server && npm install`

5. **Add Environment Variables** (click "Environment Variables"):
   ```
   NODE_ENV=production
   DB_HOST=auth-db1336.hstgr.io
   DB_USER=u509616587_luno
   DB_PASS=Luno@5569
   DB_NAME=u509616587_luno
   OPENAI_API_KEY=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
   JWT_SECRET=your_strong_jwt_secret_here_change_in_production
   SITE_URL=https://your-project.vercel.app
   ```

6. Click **"Deploy"**

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Step 3: Configure API Routes

After deployment, Vercel will give you a URL like: `https://your-project.vercel.app`

1. Go to your project settings in Vercel
2. Add/Update environment variable:
   ```
   VITE_API_URL=https://your-project.vercel.app/api
   ```
3. Redeploy (or it will auto-deploy)

### Step 4: Test Your Deployment

1. Visit your Vercel URL
2. Test the API: `https://your-project.vercel.app/api/health`
3. Test chat: `https://your-project.vercel.app/api/test/test-api`

## ⚠️ Important Notes

### For Full-Stack Deployment (Frontend + Backend)

Vercel supports serverless functions, but for better performance with MySQL:

**Recommended Setup:**
- **Frontend**: Deploy to Vercel ✅
- **Backend**: Keep on Hostinger (better for MySQL connections)
- **Database**: Keep on Hostinger MySQL ✅

This gives you:
- Fast frontend via Vercel CDN
- Reliable backend with persistent MySQL
- Lower costs
- Better database performance

### If Deploying Backend to Vercel

1. MySQL connections work but have limitations
2. Connection pooling is optimized (2 connections)
3. May need to increase timeout for long operations
4. Consider Vercel Postgres for better serverless support

## 🔧 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version (Vercel uses 18.x)

### API Routes Return 404
- Check `vercel.json` routing configuration
- Ensure `/api` routes are properly configured
- Check function logs in Vercel dashboard

### Database Connection Errors
- Verify environment variables are set
- Check database allows connections from Vercel IPs
- Consider using Vercel Postgres or keeping MySQL on Hostinger

### CORS Errors
- Update CORS in `server/index.js` to include Vercel domain
- Check `VITE_API_URL` matches deployment URL

## 📝 Post-Deployment

1. Update `VITE_API_URL` with production URL
2. Test all features
3. Set up custom domain (optional)
4. Enable analytics (optional)

## 🎉 Done!

Your Luno platform is now live on Vercel!

