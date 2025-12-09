# Deploying Luno to Vercel

This guide will help you deploy Luno to Vercel. Vercel is great for frontend deployment and supports serverless functions for the backend.

## Prerequisites

- Vercel account (free tier works)
- GitHub repository connected
- MySQL database (can use Hostinger or Vercel Postgres)

## Option 1: Full Vercel Deployment (Recommended)

### Step 1: Prepare Your Repository

Make sure all code is committed and pushed to GitHub:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository: `sujaysarraf-dev/luno-learn-to-code`
4. Vercel will auto-detect the project

### Step 3: Configure Build Settings

**Root Directory**: Leave as root (`.`)

**Build Command**: 
```bash
cd client && npm run build
```

**Output Directory**: 
```
client/dist
```

**Install Command**:
```bash
npm install && cd client && npm install && cd ../server && npm install
```

### Step 4: Configure Environment Variables

In Vercel project settings, add these environment variables:

#### Backend Environment Variables:
```
NODE_ENV=production
DB_HOST=auth-db1336.hstgr.io
DB_USER=u509616587_luno
DB_PASS=Luno@5569
DB_NAME=u509616587_luno
OPENAI_API_KEY=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
JWT_SECRET=your_strong_jwt_secret_here
```

#### Frontend Environment Variables:
```
VITE_API_URL=https://your-project.vercel.app/api
```

**Note**: After first deployment, update `VITE_API_URL` with your actual Vercel URL.

### Step 5: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at `https://your-project.vercel.app`

## Option 2: Frontend on Vercel + Backend on Hostinger

If you prefer to keep the backend on Hostinger:

### Step 1: Deploy Frontend Only

1. In Vercel, set **Root Directory** to `client`
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. Set environment variable:
   ```
   VITE_API_URL=https://your-hostinger-domain.com/api
   ```

### Step 2: Keep Backend on Hostinger

Deploy backend to Hostinger as per `DEPLOYMENT.md`

## Vercel Configuration Files

### `vercel.json` (Root)
Handles routing for both frontend and API routes.

### `client/vercel.json`
Frontend-specific configuration with SPA routing.

## Important Notes

### Database Connections

Vercel serverless functions have connection limits. For MySQL:
- Use connection pooling (already implemented)
- Consider using Vercel Postgres for better serverless compatibility
- Or keep MySQL on Hostinger and only deploy frontend to Vercel

### Serverless Function Limits

- 10 second timeout on Hobby plan
- 60 second timeout on Pro plan
- Consider optimizing long-running operations (like AI API calls)

### Environment Variables

- Never commit `.env` files (already in `.gitignore`)
- Add all secrets in Vercel dashboard
- Use different `JWT_SECRET` for production

## Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version (Vercel uses 18.x by default)

### API Routes Not Working

1. Check that routes are in `/api` folder or configured in `vercel.json`
2. Verify environment variables are set
3. Check function logs in Vercel dashboard

### Database Connection Errors

1. Verify database credentials
2. Check if database allows connections from Vercel IPs
3. Consider using Vercel Postgres or keeping MySQL on Hostinger

### CORS Issues

1. Update CORS in `server/index.js` to include Vercel domain
2. Check `VITE_API_URL` matches actual deployment URL

## Recommended Setup

For best performance and cost:
- **Frontend**: Deploy to Vercel (free, fast CDN)
- **Backend**: Deploy to Hostinger (cheaper, better for MySQL)
- **Database**: Keep on Hostinger MySQL

This gives you:
- ✅ Fast frontend delivery via Vercel CDN
- ✅ Reliable backend with persistent MySQL connections
- ✅ Lower costs
- ✅ Better database performance

## Quick Deploy Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Post-Deployment

1. Update `VITE_API_URL` with production URL
2. Test all features
3. Set up custom domain (optional)
4. Enable analytics (optional)

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord

