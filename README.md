# Luno - AI-Powered Coding Tutor

Luno is an AI-powered coding tutor designed for students to learn HTML and CSS step-by-step.

## Features

- 📚 Line-by-line lesson viewing with AI explanations
- 💻 Built-in code editor with live HTML/CSS preview
- 🧪 AI-generated MCQ quizzes for each lesson
- 🤖 Debugging assistant
- 💬 Chatbot for general questions
- 📊 Progress tracking and dashboard

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MySQL
- **AI**: OpenAI API

## Setup

### Prerequisites

- Node.js (v18 or higher)
- MySQL database
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sujaysarraf-dev/luno-learn-to-code.git
cd luno-learn-to-code
```

2. Install root dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
cd ..
```

4. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

5. Set up environment variables:

Create a `.env` file in the `server` directory with your credentials:
```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=auth-db1336.hstgr.io
DB_USER=u509616587_luno
DB_PASS=Luno@5569
DB_NAME=u509616587_luno

# OpenAI
OPENAI_API_KEY=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

# JWT Secret (for authentication)
JWT_SECRET=luno_jwt_secret_change_this_in_production_2024
```

**Note**: See [CREDENTIALS.md](./CREDENTIALS.md) for all configured credentials.

6. Set up the database:

Run the SQL schema file to create tables:
```bash
mysql -u u509616587_luno -p u509616587_luno < server/db/schema.sql
```

7. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5000`.

## GitHub Repository

🔗 [https://github.com/sujaysarraf-dev/luno-learn-to-code](https://github.com/sujaysarraf-dev/luno-learn-to-code)

## Deployment to Hostinger

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to Hostinger shared hosting.

## Project Structure

```
luno-learn-to-code/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── db/
│   ├── utils/
│   └── index.js
└── package.json
```

## GitHub Repository

🔗 [https://github.com/sujaysarraf-dev/luno-learn-to-code](https://github.com/sujaysarraf-dev/luno-learn-to-code)

## License

MIT

