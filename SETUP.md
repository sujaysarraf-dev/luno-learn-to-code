# Luno Setup Guide

This guide will help you set up Luno on your local machine for development.

## Prerequisites

- Node.js (v18 or higher) - [Download](https://nodejs.org/)
- MySQL database (local or remote)
- OpenAI API key - [Get one here](https://platform.openai.com/api-keys)

## Step 1: Clone the Repository

```bash
git clone https://github.com/sujaysarraf-dev/luno-learn-to-code.git
cd luno-learn-to-code
```

## Step 2: Install Dependencies

### Root Dependencies
```bash
npm install
```

### Backend Dependencies
```bash
cd server
npm install
cd ..
```

### Frontend Dependencies
```bash
cd client
npm install
cd ..
```

## Step 3: Database Setup

1. Create a MySQL database named `u509616587_luno` (or your preferred name)
2. Create a database user with appropriate permissions
3. Run the schema file to create tables:

```bash
mysql -u your_username -p u509616587_luno < server/db/schema.sql
```

Or import it through phpMyAdmin or your preferred MySQL client.

## Step 4: Configure Environment Variables

### Backend (.env)

Create a `.env` file in the `server` directory with your credentials:

```env
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=auth-db1336.hstgr.io
DB_USER=u509616587_luno
DB_PASS=Luno@5569
DB_NAME=u509616587_luno

# OpenAI API
OPENAI_API_KEY=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

# JWT Secret (use a strong random string in production)
JWT_SECRET=luno_jwt_secret_change_this_in_production_2024
```

**Note**: All credentials are already configured. See [CREDENTIALS.md](./CREDENTIALS.md) for details.

### Frontend (.env)

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Step 5: Run the Application

### Development Mode (Both Frontend and Backend)

From the root directory:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend dev server on `http://localhost:5173`

### Run Separately

**Backend only:**
```bash
npm run server
# or
cd server && npm run dev
```

**Frontend only:**
```bash
npm run client
# or
cd client && npm run dev
```

## Step 6: Access the Application

1. Open your browser and go to `http://localhost:5173`
2. Sign up for a new account
3. Start learning!

## Troubleshooting

### Database Connection Issues

- Verify your database credentials in `server/.env`
- Ensure MySQL is running
- Check that the database and user exist
- Verify network connectivity if using a remote database

### OpenAI API Errors

- Verify your API key is correct in `server/.env`
- Check your OpenAI account has credits
- Ensure the API key has proper permissions

### Port Already in Use

If port 5000 or 5173 is already in use:
- Change `PORT` in `server/.env` for backend
- Change port in `client/vite.config.js` for frontend

### Module Not Found Errors

- Delete `node_modules` folders
- Delete `package-lock.json` files
- Run `npm install` again in each directory

## Next Steps

- See [QUICK_START.md](./QUICK_START.md) for a faster setup guide
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions
- Check [README.md](./README.md) for project overview
- View [CREDENTIALS.md](./CREDENTIALS.md) for all configured credentials

## Development Tips

- Backend uses nodemon for auto-reload on file changes
- Frontend uses Vite's hot module replacement
- Check browser console and terminal for error messages
- Use the network tab in browser dev tools to debug API calls

