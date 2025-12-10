import { useState, useEffect, useCallback } from 'react';
import { codeReviewAPI } from '../services/api';
import './CodeReviewPanel.css';

const CodeReviewPanel = ({ code, language = 'html', onSuggestionClick, refreshTrigger }) => {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoReview, setAutoReview] = useState(true);
  const [lastReviewedCode, setLastReviewedCode] = useState('');

  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const performReview = useCallback(async (codeToReview) => {
    if (!codeToReview || codeToReview.trim().length === 0) {
      setReview(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await codeReviewAPI.reviewCode(codeToReview, language);
      setReview(response.data);
    } catch (err) {
      console.error('Code review error:', err);
      setError(err.response?.data?.message || 'Failed to review code');
    } finally {
      setLoading(false);
    }
  }, [language]);

  // Debounced review function
  const debouncedReview = useCallback(
    debounce((codeToReview) => {
      if (autoReview) {
        performReview(codeToReview);
      }
    }, 2000), // Wait 2 seconds after user stops typing
    [autoReview, performReview]
  );

  // Re-review when refreshTrigger changes (after applying fix)
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0 && autoReview && code) {
      setLastReviewedCode(code);
      setReview(null); // Clear old review
      performReview(code); // Immediate review after fix
    }
  }, [refreshTrigger, autoReview, code, performReview]);

  // Normal debounced review for code changes (typing)
  useEffect(() => {
    if (autoReview && code && code !== lastReviewedCode) {
      // Only debounce if it's not a refresh trigger
      if (!refreshTrigger || refreshTrigger === 0) {
        setLastReviewedCode(code);
        setReview(null); // Clear old review when code changes
        debouncedReview(code);
      }
    }
  }, [code, autoReview, debouncedReview, lastReviewedCode, refreshTrigger]);

  const handleManualReview = () => {
    performReview(code);
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'suggestion':
        return '💡';
      default:
        return '📝';
    }
  };

  const getSuggestionColor = (type) => {
    switch (type) {
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      case 'suggestion':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="code-review-panel">
      <div className="review-header">
        <div className="review-title">
          <span className="review-icon">🤖</span>
          <h3>AI Code Review</h3>
        </div>
        <div className="review-controls">
          <label className="auto-review-toggle">
            <input
              type="checkbox"
              checked={autoReview}
              onChange={(e) => setAutoReview(e.target.checked)}
            />
            <span>Auto-review</span>
          </label>
          {!autoReview && (
            <button onClick={handleManualReview} className="review-btn" disabled={loading}>
              {loading ? 'Reviewing...' : 'Review Code'}
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="review-loading">
          <div className="spinner"></div>
          <p>{refreshTrigger ? 'Re-analyzing after fix...' : 'Analyzing your code...'}</p>
        </div>
      )}

      {error && (
        <div className="review-error">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {review && !loading && (
        <div className="review-content">
          <div className="review-score">
            <div className="score-circle" style={{ borderColor: getScoreColor(review.score) }}>
              <span className="score-number" style={{ color: getScoreColor(review.score) }}>
                {review.score}
              </span>
              <span className="score-label">Score</span>
            </div>
            <p className="score-summary">{review.summary || 'Code review completed'}</p>
            {review.score >= 80 && (
              <div className="score-badge-good">
                ✅ Great job! Your code looks good!
              </div>
            )}
          </div>

          {review.suggestions && review.suggestions.length > 0 && (
            <div className="suggestions-list">
              <h4>Suggestions ({review.suggestions.length})</h4>
              {review.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  style={{ borderLeftColor: getSuggestionColor(suggestion.type) }}
                >
                  <div className="suggestion-header">
                    <span className="suggestion-icon">{getSuggestionIcon(suggestion.type)}</span>
                    <span className="suggestion-type" style={{ color: getSuggestionColor(suggestion.type) }}>
                      {suggestion.type}
                    </span>
                    {suggestion.priority && (
                      <span className={`priority-badge priority-${suggestion.priority}`}>
                        {suggestion.priority}
                      </span>
                    )}
                    {suggestion.startLine && suggestion.endLine && (
                      <span className="suggestion-line">Lines {suggestion.startLine}-{suggestion.endLine}</span>
                    )}
                    {suggestion.line && !suggestion.startLine && (
                      <span className="suggestion-line">Line {suggestion.line}</span>
                    )}
                  </div>
                  <p className="suggestion-message">{suggestion.message}</p>
                  {suggestion.explanation && (
                    <p className="suggestion-explanation">{suggestion.explanation}</p>
                  )}
                  {(suggestion.newCode || suggestion.code) && (
                    <div className="suggestion-code">
                      {suggestion.oldCode && (
                        <div className="code-comparison">
                          <div className="code-before">
                            <span className="code-label">❌ Current:</span>
                            <code>{suggestion.oldCode}</code>
                          </div>
                          <div className="code-arrow">↓</div>
                          <div className="code-after">
                            <span className="code-label">✅ Fixed:</span>
                            <code>{suggestion.newCode || suggestion.code}</code>
                          </div>
                        </div>
                      )}
                      {!suggestion.oldCode && (
                        <div className="code-single">
                          <span className="code-label">💡 Suggested Fix:</span>
                          <code>{suggestion.newCode || suggestion.code}</code>
                        </div>
                      )}
                      {onSuggestionClick && (
                        <button
                          onClick={() => onSuggestionClick(suggestion)}
                          className="apply-suggestion-btn"
                        >
                          ✨ Apply Fix
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {(!review.suggestions || review.suggestions.length === 0) && (
            <div className="no-suggestions">
              <span>✅</span>
              <p>Great job! No suggestions at this time. Your code looks good!</p>
            </div>
          )}
        </div>
      )}

      {!review && !loading && !error && code && code.trim().length > 0 && (
        <div className="review-placeholder">
          <p>💡 {autoReview ? 'AI is analyzing your code...' : 'Click "Review Code" to get AI suggestions'}</p>
        </div>
      )}

      {(!code || code.trim().length === 0) && (
        <div className="review-placeholder">
          <p>Start typing code to get AI-powered suggestions and improvements!</p>
        </div>
      )}
    </div>
  );
};

export default CodeReviewPanel;

