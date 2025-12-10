import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { lessonsAPI, progressAPI, quizHistoryAPI, streakAPI } from '../services/api';
import MobileMenu from '../components/MobileMenu';
import StreakWidget from '../components/StreakWidget';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState({});
  const [stats, setStats] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [streak, setStreak] = useState(null);
  const [todayChallenge, setTodayChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [lessonsRes, progressRes, statsRes, historyRes, streakRes, challengeRes] = await Promise.all([
        lessonsAPI.getAll(),
        progressAPI.getProgress().catch(() => ({ data: { progress: {} } })),
        progressAPI.getStats().catch(() => ({ data: null })),
        quizHistoryAPI.getHistory().catch(() => ({ data: { history: [] } })),
        streakAPI.getStreak().catch(() => ({ data: null })),
        streakAPI.getTodayChallenge().catch(() => ({ data: { challenge: null } }))
      ]);
      
      setLessons(lessonsRes.data.lessons);
      setProgress(progressRes.data.progress || {});
      setStats(statsRes.data);
      setQuizHistory(historyRes.data.history || []);
      setStreak(streakRes.data);
      setTodayChallenge(challengeRes.data.challenge);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return '#10b981';
      case 'intermediate':
        return '#f59e0b';
      case 'advanced':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <div className="nav-brand">
              <h2>🚀 Luno</h2>
            </div>
            <button className="mobile-menu-toggle" onClick={() => setShowMobileMenu(true)}>
              ☰
            </button>
            <div className="nav-actions">
              <span className="nav-user">Welcome, {user.username}!</span>
              <button onClick={onLogout} className="btn btn-outline">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {showMobileMenu && (
        <MobileMenu 
          user={user} 
          onLogout={onLogout} 
          onClose={() => setShowMobileMenu(false)} 
        />
      )}

      <div className="container">
        <div className="dashboard-header">
          <h1>Your Learning Dashboard</h1>
          <p>Choose a lesson to start learning HTML and CSS step-by-step</p>
        </div>

        {/* Streak Widget */}
        {streak && (
          <StreakWidget 
            streak={streak} 
            todayChallenge={todayChallenge}
            onChallengeComplete={() => {
              // Refresh data after challenge completion
              fetchDashboardData();
            }}
          />
        )}

        {/* Stats Section */}
        {stats && (
          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <div className="stat-value">{stats.completedLessons}/{stats.totalLessons}</div>
                <div className="stat-label">Lessons Completed</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🧪</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalQuizzes}</div>
                <div className="stat-label">Quizzes Taken</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <div className="stat-value">{stats.avgScore}%</div>
                <div className="stat-label">Average Score</div>
              </div>
            </div>
            <div className="stat-card progress-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">{stats.progressPercentage}%</div>
                <div className="stat-label">Overall Progress</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${stats.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Quiz Results */}
        {quizHistory.length > 0 && (
          <div className="quiz-history-section">
            <h2>Recent Quiz Results</h2>
            <div className="quiz-history-list">
              {quizHistory.slice(0, 5).map((attempt) => (
                <div key={attempt.id} className="quiz-history-item">
                  <div className="quiz-history-info">
                    <div className="quiz-history-title">{attempt.lessonTitle}</div>
                    <div className="quiz-history-date">
                      {new Date(attempt.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="quiz-history-score">
                    <span className={`score-badge ${attempt.percentage >= 80 ? 'excellent' : attempt.percentage >= 60 ? 'good' : 'needs-improvement'}`}>
                      {attempt.percentage}%
                    </span>
                    <span className="score-detail">
                      {attempt.score}/{attempt.totalQuestions}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lessons Grid */}
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <h2 className="lessons-section-title">Lessons</h2>
            <div className="lessons-grid">
              {lessons.map((lesson) => {
                const lessonProgress = progress[lesson.id];
                const isCompleted = lessonProgress?.completed || false;
                const isAccessed = lessonProgress?.lastAccessed ? true : false;
                
                return (
                  <Link key={lesson.id} to={`/lesson/${lesson.id}`} className="lesson-card">
                    {isCompleted && <div className="completion-badge">✓ Completed</div>}
                    <div className="lesson-header">
                      <h3>{lesson.title}</h3>
                      <span
                        className="difficulty-badge"
                        style={{ backgroundColor: getDifficultyColor(lesson.difficulty_level) }}
                      >
                        {lesson.difficulty_level}
                      </span>
                    </div>
                    <p className="lesson-description">{lesson.description}</p>
                    <div className="lesson-footer">
                      <div className="lesson-meta">
                        <span className="lesson-number">Lesson {lesson.order_index}</span>
                        {isAccessed && !isCompleted && (
                          <span className="lesson-status">In Progress</span>
                        )}
                      </div>
                      <span className="lesson-arrow">→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

