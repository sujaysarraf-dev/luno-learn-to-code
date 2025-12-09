# Database Tracking - What's Being Saved

## ✅ Currently Saved to Database

### 1. **User Accounts** ✅
- Username, email, password (hashed)
- Account creation timestamp
- **Table**: `users`

### 2. **Quiz Attempts** ✅
- User ID, Quiz ID
- Score and total questions
- All answers (JSON format)
- Completion timestamp
- **Table**: `quiz_attempts`
- **When**: Every time a user submits a quiz

### 3. **Lesson Access Tracking** ✅ (NEW)
- User ID, Lesson ID
- Last accessed timestamp
- Completion status
- **Table**: `user_progress`
- **When**: Automatically when user views a lesson

### 4. **AI Explanations Cache** ✅
- Line explanations are cached
- **Table**: `line_explanations`
- **When**: First time a line is explained (then reused)

### 5. **Generated Quizzes** ✅
- Quizzes are saved after first generation
- **Tables**: `quizzes`, `questions`
- **When**: First time quiz is generated for a lesson

## 📊 New Progress Tracking Features

### API Endpoints Added:
- `POST /api/progress/lesson/:lessonId/access` - Track lesson view
- `POST /api/progress/lesson/:lessonId/complete` - Mark lesson complete
- `GET /api/progress/progress` - Get all user progress
- `GET /api/progress/stats` - Get user statistics

### What Gets Tracked:
1. **Lesson Views**: Automatically tracked when user opens a lesson
2. **Lesson Completion**: Can be marked manually (for future UI)
3. **Quiz Scores**: Already tracked in `quiz_attempts`
4. **User Statistics**: 
   - Total lessons
   - Completed lessons
   - Total quizzes taken
   - Average quiz score
   - Progress percentage

## 🔄 Data Persistence

All user data is **permanently stored** in MySQL database:
- ✅ User accounts persist across sessions
- ✅ Quiz attempts are saved forever
- ✅ Lesson progress is tracked
- ✅ All data survives server restarts
- ✅ Database is on Hostinger (persistent storage)

## 📈 Future Enhancements

You can extend tracking for:
- Code editor usage time
- Lines of code explained
- Chat messages count
- Debug sessions
- Custom user preferences

