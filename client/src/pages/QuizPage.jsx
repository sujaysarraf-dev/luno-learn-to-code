import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quizAPI } from '../services/api';
import './QuizPage.css';

const QuizPage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const response = await quizAPI.getById(id);
      setQuiz(response.data.quiz);
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      if (!confirm('You haven\'t answered all questions. Submit anyway?')) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await quizAPI.submit(id, answers);
      setResults(response.data);
      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container">
        <div className="error-message">Quiz not found</div>
        <Link to="/dashboard">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <Link to="/dashboard" className="nav-brand">
              <h2>🚀 Luno</h2>
            </Link>
            <div className="nav-actions">
              <span className="nav-user">Welcome, {user.username}!</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container quiz-container">
        <div className="quiz-header">
          <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
          <h1>{quiz.title}</h1>
          <p>{quiz.description}</p>
        </div>

        {!submitted ? (
          <>
            <div className="quiz-questions">
              {quiz.questions.map((question, index) => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <span className="question-number">Question {index + 1}</span>
                  </div>
                  <h3 className="question-text">{question.question}</h3>
                  <div className="options">
                    {['a', 'b', 'c', 'd'].map((option) => (
                      <label key={option} className="option-label">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={() => handleAnswerChange(question.id, option)}
                        />
                        <span className="option-letter">{option.toUpperCase()}.</span>
                        <span className="option-text">{question.options[option]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="quiz-actions">
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </>
        ) : (
          <div className="quiz-results">
            <div className="results-header">
              <h2>🎉 Quiz Results</h2>
              <div className="score-display">
                <div className="score-circle">
                  <span className="score-number">{results.percentage}%</span>
                  <span className="score-label">Score</span>
                </div>
                <p className="score-text">
                  You got {results.score} out of {results.totalQuestions} questions correct!
                </p>
              </div>
            </div>

            <div className="results-questions">
              {results.results.map((result, index) => (
                <div
                  key={result.questionId}
                  className={`result-card ${result.isCorrect ? 'correct' : 'incorrect'}`}
                >
                  <div className="result-header">
                    <span className="result-number">Question {index + 1}</span>
                    <span className={`result-badge ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                      {result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                  <h3 className="result-question">{result.question}</h3>
                  <div className="result-answers">
                    <div className="answer-item">
                      <strong>Your answer:</strong>{' '}
                      <span className={result.isCorrect ? 'correct-text' : 'incorrect-text'}>
                        {result.userAnswer?.toUpperCase() || 'Not answered'}
                      </span>
                    </div>
                    {!result.isCorrect && (
                      <div className="answer-item">
                        <strong>Correct answer:</strong>{' '}
                        <span className="correct-text">
                          {result.correctAnswer.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  {result.explanation && (
                    <div className="result-explanation">
                      <strong>💡 Explanation:</strong>
                      <p>{result.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="results-actions">
              <Link to="/dashboard" className="btn btn-primary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;

