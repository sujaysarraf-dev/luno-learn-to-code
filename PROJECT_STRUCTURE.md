# Luno Project Structure

## Overview

Luno is a full-stack AI-powered coding tutor built with React (Vite) frontend and Node.js/Express backend.

## Directory Structure

```
luno-learn-to-code/
├── client/                      # React Frontend (Vite)
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   │   ├── ChatWidget.jsx   # AI chat interface
│   │   │   ├── DebugModal.jsx   # Code debugging assistant
│   │   │   └── EditorPreview.jsx # Monaco editor with live preview
│   │   ├── pages/               # Page components
│   │   │   ├── Dashboard.jsx    # Main dashboard with lessons
│   │   │   ├── LessonViewer.jsx # Lesson display with line-by-line
│   │   │   ├── QuizPage.jsx     # Quiz taking interface
│   │   │   ├── Login.jsx        # User login
│   │   │   └── Signup.jsx       # User registration
│   │   ├── services/            # API service layer
│   │   │   └── api.js           # Axios API client
│   │   ├── App.jsx              # Main app component with routing
│   │   ├── App.css              # Global app styles
│   │   ├── index.css            # Base styles
│   │   └── main.jsx             # React entry point
│   ├── index.html               # HTML template
│   ├── package.json             # Frontend dependencies
│   └── vite.config.js           # Vite configuration
│
├── server/                      # Node.js Backend (Express)
│   ├── controllers/             # Request handlers
│   │   ├── authController.js    # Authentication logic
│   │   ├── lessonController.js  # Lesson operations
│   │   ├── quizController.js    # Quiz operations
│   │   ├── chatController.js    # AI chat handler
│   │   └── debugController.js   # Code debugging handler
│   ├── routes/                  # API route definitions
│   │   ├── authRoutes.js        # /api/auth endpoints
│   │   ├── lessonRoutes.js      # /api/lesson endpoints
│   │   ├── quizRoutes.js        # /api/quiz endpoints
│   │   ├── chatRoutes.js        # /api/chat endpoints
│   │   └── debugRoutes.js       # /api/debug endpoints
│   ├── services/                # Business logic services
│   │   └── openaiService.js     # OpenAI API integration
│   ├── db/                      # Database related
│   │   ├── connection.js        # MySQL connection pool
│   │   └── schema.sql           # Database schema
│   ├── utils/                   # Utility functions
│   │   └── auth.js              # JWT authentication utilities
│   ├── index.js                 # Server entry point
│   └── package.json             # Backend dependencies
│
├── .gitignore                   # Git ignore rules
├── package.json                 # Root package.json (dev scripts)
├── README.md                    # Project overview
├── SETUP.md                     # Local setup instructions
└── DEPLOYMENT.md                # Production deployment guide
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Lessons
- `GET /api/lesson` - Get all lessons
- `GET /api/lesson/:id` - Get lesson by ID
- `POST /api/lesson/:id/explain-line` - Get AI explanation for a line
- `POST /api/lesson/:id/generate-quiz` - Generate quiz for lesson (protected)

### Quizzes
- `GET /api/quiz/:id` - Get quiz by ID
- `POST /api/quiz/:id/submit` - Submit quiz answers (protected)

### AI Features
- `POST /api/chat` - Chat with AI tutor (protected)
- `POST /api/debug` - Debug code with AI (protected)

## Database Schema

### Tables
- `users` - User accounts
- `lessons` - Lesson metadata
- `lesson_lines` - Individual lines of code in lessons
- `line_explanations` - Cached AI explanations
- `quizzes` - Quiz metadata
- `questions` - Quiz questions (MCQ)
- `quiz_attempts` - User quiz submissions
- `user_progress` - Track lesson completion

## Key Features

1. **Line-by-Line Learning**: Click any line of code to get AI explanations
2. **Live Code Editor**: Monaco editor with real-time HTML/CSS preview
3. **AI-Generated Quizzes**: Automatic quiz generation for each lesson
4. **Debugging Assistant**: AI-powered code debugging help
5. **Chat Tutor**: Interactive chatbot for questions
6. **Progress Tracking**: Track lesson completion and quiz scores

## Technology Stack

### Frontend
- React 18
- Vite
- React Router
- Monaco Editor
- Axios
- Lucide React (icons)

### Backend
- Node.js
- Express
- MySQL2
- OpenAI API
- JWT (jsonwebtoken)
- bcryptjs

## Environment Variables

### Backend (.env)
- `PORT` - Server port
- `NODE_ENV` - Environment (development/production)
- `DB_HOST` - Database host
- `DB_USER` - Database user
- `DB_PASS` - Database password
- `DB_NAME` - Database name
- `OPENAI_API_KEY` - OpenAI API key
- `JWT_SECRET` - JWT signing secret

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

## Development Workflow

1. Start MySQL database
2. Run database schema: `mysql < server/db/schema.sql`
3. Configure `.env` files
4. Install dependencies: `npm install` (root, server, client)
5. Run dev servers: `npm run dev`
6. Access at `http://localhost:5173`

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Hostinger deployment instructions.

