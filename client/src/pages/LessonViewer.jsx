import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { lessonsAPI } from '../services/api';
import EditorModal from '../components/EditorModal';
import ChatWidget from '../components/ChatWidget';
import DebugModal from '../components/DebugModal';
import './LessonViewer.css';

const LessonViewer = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLine, setSelectedLine] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [code, setCode] = useState('');

  useEffect(() => {
    fetchLesson();
  }, [id]);

  const fetchLesson = async () => {
    try {
      const response = await lessonsAPI.getById(id);
      setLesson(response.data.lesson);
      // Initialize code with lesson content
      const initialCode = response.data.lesson.lines.map(l => l.code_content).join('\n');
      setCode(initialCode);
    } catch (err) {
      console.error('Failed to load lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLineClick = async (lineId) => {
    if (selectedLine === lineId && explanation) {
      setSelectedLine(null);
      setExplanation('');
      return;
    }

    setSelectedLine(lineId);
    setLoadingExplanation(true);
    setExplanation('');

    try {
      const response = await lessonsAPI.explainLine(id, lineId);
      setExplanation(response.data.explanation);
    } catch (err) {
      setExplanation('Failed to load explanation. Please try again.');
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleGenerateQuiz = async () => {
    try {
      const response = await lessonsAPI.generateQuiz(id);
      navigate(`/quiz/${response.data.quiz.id}`);
    } catch (err) {
      alert('Failed to generate quiz. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container">
        <div className="error-message">Lesson not found</div>
        <Link to="/dashboard">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="lesson-viewer">
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <Link to="/dashboard" className="nav-brand">
              <h2>🚀 Luno</h2>
            </Link>
            <div className="nav-actions">
              <button 
                onClick={() => setShowEditor(true)} 
                className="btn btn-primary editor-btn"
                title="Open Code Editor"
              >
                💻 Open Editor
              </button>
              <button onClick={() => setShowChat(!showChat)} className="btn btn-outline">
                💬 Chat
              </button>
              <button onClick={() => setShowDebug(!showDebug)} className="btn btn-outline">
                🐛 Debug
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container lesson-container">
        <div className="lesson-header">
          <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
          <h1>{lesson.title}</h1>
          <p>{lesson.description}</p>
          <div className="lesson-actions">
            <button onClick={handleGenerateQuiz} className="btn btn-primary">
              🧪 Take Quiz
            </button>
          </div>
        </div>

        <div className="lesson-content">
          <div className="code-section">
            <h2>Code Walkthrough</h2>
            <p className="instruction">Click on any line to get an AI explanation!</p>
            <div className="code-block">
              {lesson.lines.map((line) => (
                <div
                  key={line.id}
                  className={`code-line ${selectedLine === line.id ? 'selected' : ''}`}
                  onClick={() => handleLineClick(line.id)}
                >
                  <span className="line-number">{line.line_number}</span>
                  <span className="line-content">{line.code_content}</span>
                </div>
              ))}
            </div>

            {selectedLine && (
              <div className="explanation-box">
                {loadingExplanation ? (
                  <div className="loading">
                    <div className="spinner"></div>
                    <p>Getting explanation...</p>
                  </div>
                ) : (
                  <>
                    <h3>💡 Explanation</h3>
                    <p>{explanation}</p>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {showEditor && (
        <EditorModal
          code={code}
          onCodeChange={setCode}
          onClose={() => setShowEditor(false)}
        />
      )}
      {showChat && <ChatWidget onClose={() => setShowChat(false)} />}
      {showDebug && (
        <DebugModal
          code={code}
          onClose={() => setShowDebug(false)}
        />
      )}
    </div>
  );
};

export default LessonViewer;

