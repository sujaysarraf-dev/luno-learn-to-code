# Deploying Luno to Hostinger Shared Hosting

This guide will walk you through deploying Luno to Hostinger's shared hosting plan.

## Prerequisites

- Hostinger shared hosting account with Node.js support
- MySQL database created in Hostinger panel
- FTP/File Manager access
- SSH access (if available)

## Step 1: Database Setup

1. Log in to your Hostinger control panel (hPanel)
2. Navigate to **MySQL Databases**
3. Create a new database (or use existing): `u509616587_luno`
4. Create a database user: `u509616587_luno`
5. Grant all privileges to the user on the database
6. Note down the database host (usually `localhost` or something like `localhost:3306`)

## Step 2: Prepare Backend Files

1. Build the frontend:
```bash
cd client
npm run build
cd ..
```

2. Copy the entire `server` folder to your local machine (you'll upload it)

## Step 3: Upload Backend to Hostinger

1. Log in to Hostinger File Manager or use FTP
2. Navigate to your domain's root directory
3. Create a folder called `api` (or as per Hostinger's Node.js app requirements)
4. Upload all files from the `server` folder to the `api` directory
5. Make sure `index.js` is in the `api` root

## Step 4: Configure Environment Variables

1. In Hostinger hPanel, navigate to **Node.js** section
2. Find your Node.js app (or create one pointing to `api/index.js`)
3. Add environment variables:
   - `PORT` = (Hostinger will assign this, usually 3000 or similar)
   - `NODE_ENV` = `production`
   - `DB_HOST` = auth-db1336.hstgr.io
   - `DB_USER` = `u509616587_luno`
   - `DB_PASS` = `Luno@5569`
   - `DB_NAME` = `u509616587_luno`
   - `OPENAI_API_KEY` = `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`
   - `JWT_SECRET` = (generate a strong random secret string for production)

## Step 5: Set Up Database Schema

1. In Hostinger hPanel, go to **phpMyAdmin**
2. Select your database: `u509616587_luno`
3. Click on **SQL** tab
4. Copy and paste the contents of `server/db/schema.sql`
5. Click **Go** to execute

## Step 6: Install Backend Dependencies

1. In Hostinger hPanel, go to **Node.js** section
2. Find your app and click **Terminal** or use SSH
3. Navigate to your `api` directory:
```bash
cd api
```
4. Install dependencies:
```bash
npm install
```

## Step 7: Deploy Frontend

1. In File Manager, navigate to `public_html` (or your domain's web root)
2. Upload the contents of `client/dist` folder to `public_html`
3. Create a `.htaccess` file in `public_html` with the following content:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Step 8: Configure API Endpoint

1. Update the frontend API base URL:
   - In `client/src/services/api.js`, update the `API_BASE_URL` to your backend URL
   - It should be something like: `https://yourdomain.com/api` or the Node.js app URL provided by Hostinger

## Step 9: Start the Node.js App

1. In Hostinger hPanel, go to **Node.js** section
2. Find your app and click **Start** or **Restart**
3. Make sure the app is running and check logs for any errors

## Step 10: Verify Deployment

1. Visit your domain: `https://yourdomain.com`
2. Test the application:
   - Sign up/Login
   - View lessons
   - Test AI features
   - Check API endpoints

## Troubleshooting

### Backend not starting
- Check Node.js version in Hostinger (should be 18+)
- Verify all environment variables are set correctly
- Check application logs in Hostinger panel
- Ensure database connection credentials are correct

### Frontend not loading
- Verify `.htaccess` file is in place
- Check that all files from `dist` folder are uploaded
- Clear browser cache

### API calls failing
- Verify CORS settings in backend
- Check that backend URL in frontend matches actual backend URL
- Ensure backend is running and accessible

### Database connection errors
- Verify database credentials in environment variables
- Check that database host is correct (might not be `localhost` on Hostinger)
- Ensure database user has proper permissions

## Notes

- Hostinger may have specific requirements for Node.js apps - check their documentation
- The backend URL might be different from your main domain (e.g., `yourdomain.com:3000` or a subdomain)
- Keep your `.env` file secure and never commit it to version control
- Regularly backup your database through phpMyAdmin

