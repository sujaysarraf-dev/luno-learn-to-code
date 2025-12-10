import { useState } from 'react';
import { Link } from 'react-router-dom';
import { streakAPI } from '../services/api';
import './StreakWidget.css';

const StreakWidget = ({ streak, todayChallenge, onChallengeComplete }) => {
  const [completing, setCompleting] = useState(false);

  const handleCompleteChallenge = async () => {
    if (!todayChallenge || todayChallenge.completed) return;
    
    setCompleting(true);
    try {
      await streakAPI.completeChallenge(todayChallenge.id);
      if (onChallengeComplete) {
        onChallengeComplete();
      }
    } catch (err) {
      console.error('Failed to complete challenge:', err);
      alert('Failed to complete challenge. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  const getStreakEmoji = (days) => {
    if (days >= 30) return '🔥🔥🔥';
    if (days >= 7) return '🔥🔥';
    if (days >= 3) return '🔥';
    return '💪';
  };

  const getNextBadge = () => {
    if (streak.currentStreak < 7) {
      return { days: 7, name: 'Week Warrior', emoji: '🏆' };
    }
    if (streak.currentStreak < 30) {
      return { days: 30, name: 'Monthly Master', emoji: '👑' };
    }
    if (streak.currentStreak < 100) {
      return { days: 100, name: 'Century Champion', emoji: '💎' };
    }
    return null;
  };

  const nextBadge = getNextBadge();

  return (
    <div className="streak-widget">
      <div className="streak-main">
        <div className="streak-display">
          <div className="streak-icon">{getStreakEmoji(streak.currentStreak)}</div>
          <div className="streak-info">
            <div className="streak-number">{streak.currentStreak}</div>
            <div className="streak-label">Day Streak</div>
            {streak.isActiveToday && (
              <div className="streak-status active">✓ Active Today</div>
            )}
            {!streak.isActiveToday && (
              <div className="streak-status inactive">Complete a lesson to keep your streak!</div>
            )}
          </div>
        </div>
        <div className="streak-stats">
          <div className="streak-stat">
            <div className="stat-value">{streak.longestStreak}</div>
            <div className="stat-label">Longest</div>
          </div>
          <div className="streak-stat">
            <div className="stat-value">{streak.totalDaysActive}</div>
            <div className="stat-label">Total Days</div>
          </div>
        </div>
      </div>

      {nextBadge && (
        <div className="next-badge">
          <span className="badge-emoji">{nextBadge.emoji}</span>
          <span className="badge-text">
            {nextBadge.days - streak.currentStreak} more days for <strong>{nextBadge.name}</strong>
          </span>
        </div>
      )}

      {todayChallenge && !todayChallenge.completed && (
        <div className="daily-challenge">
          <div className="challenge-header">
            <span className="challenge-icon">🎯</span>
            <h3>Daily Challenge</h3>
            <span className="challenge-points">+{todayChallenge.points_reward} pts</span>
          </div>
          <p className="challenge-description">{todayChallenge.description}</p>
          {todayChallenge.challenge_type === 'lesson' && todayChallenge.target_id && (
            <Link 
              to={`/lesson/${todayChallenge.target_id}`}
              className="btn btn-primary challenge-btn"
            >
              Start Challenge
            </Link>
          )}
          {todayChallenge.challenge_type === 'quiz' && (
            <button 
              onClick={handleCompleteChallenge}
              className="btn btn-primary challenge-btn"
              disabled={completing}
            >
              {completing ? 'Completing...' : 'Complete Challenge'}
            </button>
          )}
          {todayChallenge.challenge_type === 'practice' && (
            <button 
              onClick={handleCompleteChallenge}
              className="btn btn-primary challenge-btn"
              disabled={completing}
            >
              {completing ? 'Completing...' : 'Mark as Complete'}
            </button>
          )}
        </div>
      )}

      {todayChallenge && todayChallenge.completed && (
        <div className="daily-challenge completed">
          <div className="challenge-header">
            <span className="challenge-icon">✅</span>
            <h3>Daily Challenge Completed!</h3>
          </div>
          <p className="challenge-description">Great job! You earned {todayChallenge.points_reward} points.</p>
        </div>
      )}

      {streak.badges && streak.badges.length > 0 && (
        <div className="recent-badges">
          <h4>Recent Badges</h4>
          <div className="badges-list">
            {streak.badges.slice(0, 3).map((badge) => (
              <div key={badge.id} className="badge-item" title={badge.badge_description}>
                <span className="badge-icon">🏅</span>
                <span className="badge-name">{badge.badge_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakWidget;

