# Luno Credentials Configuration

⚠️ **IMPORTANT**: This file contains sensitive information. Never commit actual credentials to version control.

## Database Credentials

- **Host**: auth-db1336.hstgr.io
- **Database**: u509616587_luno
- **Username**: u509616587_luno
- **Password**: Luno@5569

## OpenAI API Key

- **API Key**: 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

## Configuration Files

These credentials have been added to:
- `server/.env` - Backend environment variables (gitignored)
- `client/.env` - Frontend environment variables (gitignored)

## For Production (Hostinger)

When deploying to Hostinger, update the environment variables in the Hostinger control panel:

1. Go to Node.js section in hPanel
2. Add/Update environment variables:
   - `DB_HOST` - auth-db1336.hstgr.io
   - `DB_USER` - u509616587_luno
   - `DB_PASS` - Luno@5569
   - `DB_NAME` - u509616587_luno
   - `OPENAI_API_KEY` - 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
   - `JWT_SECRET` - Generate a strong random string for production

## Security Notes

- ✅ `.env` files are in `.gitignore` - they won't be committed
- ✅ Never share your API keys publicly
- ✅ Use different JWT_SECRET for production
- ✅ Consider rotating API keys periodically

