# 🚀 Deploy Luno to Vercel - Step by Step

## Quick Deploy (5 Minutes)

### Method 1: Vercel Dashboard (Easiest)

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Project**
   - Click **"Add New Project"**
   - Find and select: `sujaysarraf-dev/luno-learn-to-code`
   - Click **"Import"**

3. **Configure Project Settings**
   
   **Root Directory**: `.` (root - leave as default)
   
   **Framework Preset**: Other
   
   **Build and Output Settings**:
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install && cd client && npm install && cd ../server && npm install`

4. **Add Environment Variables**
   
   Click **"Environment Variables"** and add:
   
   ```
   NODE_ENV=production
   DB_HOST=auth-db1336.hstgr.io
   DB_USER=u509616587_luno
   DB_PASS=Luno@5569
   DB_NAME=u509616587_luno
   OPENAI_API_KEY=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
   JWT_SECRET=luno_jwt_secret_production_2024_change_this
   SITE_URL=https://your-project.vercel.app
   ```
   
   **Note**: Replace `your-project` with your actual Vercel project name after first deploy.

5. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes for build to complete
   - Your site will be live! 🎉

6. **Update API URL** (After first deploy)
   - Copy your Vercel URL (e.g., `https://luno-learn-to-code.vercel.app`)
   - Go to Project Settings → Environment Variables
   - Add/Update:
     ```
     VITE_API_URL=https://your-actual-url.vercel.app/api
     SITE_URL=https://your-actual-url.vercel.app
     ```
   - Redeploy (or it will auto-redeploy)

### Method 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? luno-learn-to-code (or your choice)
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add NODE_ENV
vercel env add DB_HOST
vercel env add DB_USER
vercel env add DB_PASS
vercel env add DB_NAME
vercel env add OPENAI_API_KEY
vercel env add JWT_SECRET
vercel env add SITE_URL

# Deploy to production
vercel --prod
```

## ✅ Verify Deployment

1. **Check Health Endpoint**
   ```
   https://your-project.vercel.app/api/health
   ```
   Should return: `{"status":"ok","message":"Luno API is running"}`

2. **Test API**
   ```
   https://your-project.vercel.app/api/test/test-api
   ```
   Should test OpenAI/OpenRouter connection

3. **Visit Your Site**
   ```
   https://your-project.vercel.app
   ```

## 🔧 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure Node.js version is 18.x (Vercel default)
- Verify all dependencies are in package.json

### API Routes Return 404
- Check `vercel.json` configuration
- Ensure `/api` routes are properly set up
- Check function logs in Vercel dashboard

### Database Connection Errors
- Verify environment variables are set correctly
- Check database allows external connections
- Consider keeping backend on Hostinger if issues persist

## 📝 Recommended Setup

For best performance:
- **Frontend**: Vercel (fast CDN, free)
- **Backend**: Hostinger (better for MySQL)
- **Database**: Hostinger MySQL

This gives you the best of both worlds!

## 🎉 Done!

Your Luno platform is now live on Vercel!

