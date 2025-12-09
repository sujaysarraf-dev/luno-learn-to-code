import { useState } from 'react';
import { debugAPI } from '../services/api';
import './DebugModal.css';

const DebugModal = ({ code, onClose }) => {
  const [debugCode, setDebugCode] = useState(code || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDebug = async () => {
    if (!debugCode.trim()) {
      alert('Please enter some code to debug');
      return;
    }

    setLoading(true);
    setSuggestion('');

    try {
      const response = await debugAPI.debugCode(debugCode, errorMessage);
      setSuggestion(response.data.suggestion);
    } catch (err) {
      setSuggestion('Failed to get debugging help. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="debug-modal-overlay" onClick={onClose}>
      <div className="debug-modal" onClick={(e) => e.stopPropagation()}>
        <div className="debug-header">
          <h3>🐛 Debug Assistant</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="debug-content">
          <div className="input-group">
            <label htmlFor="debug-code">Your Code</label>
            <textarea
              id="debug-code"
              value={debugCode}
              onChange={(e) => setDebugCode(e.target.value)}
              placeholder="Paste your HTML/CSS code here..."
              rows="10"
              className="code-textarea"
            />
          </div>

          <div className="input-group">
            <label htmlFor="error-message">Error Message (Optional)</label>
            <input
              id="error-message"
              type="text"
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              placeholder="Any error message you're seeing..."
            />
          </div>

          <button onClick={handleDebug} className="btn btn-primary" disabled={loading}>
            {loading ? 'Analyzing...' : '🔍 Debug Code'}
          </button>

          {suggestion && (
            <div className="suggestion-box">
              <h4>💡 Debugging Suggestion</h4>
              <div className="suggestion-content">{suggestion}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugModal;

