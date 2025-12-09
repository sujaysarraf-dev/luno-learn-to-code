import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { lessonsAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await lessonsAPI.getAll();
      setLessons(response.data.lessons);
    } catch (err) {
      setError('Failed to load lessons');
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
            <div className="nav-actions">
              <span className="nav-user">Welcome, {user.username}!</span>
              <button onClick={onLogout} className="btn btn-outline">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="dashboard-header">
          <h1>Your Learning Dashboard</h1>
          <p>Choose a lesson to start learning HTML and CSS step-by-step</p>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="lessons-grid">
            {lessons.map((lesson) => (
              <Link key={lesson.id} to={`/lesson/${lesson.id}`} className="lesson-card">
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
                  <span className="lesson-number">Lesson {lesson.order_index}</span>
                  <span className="lesson-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

