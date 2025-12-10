import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import CodeReviewPanel from './CodeReviewPanel';
import './EditorModal.css';

const EditorModal = ({ code, onCodeChange, onClose }) => {
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [activeCodeTab, setActiveCodeTab] = useState('html'); // 'html' or 'css'
  const [viewMode, setViewMode] = useState('split'); // 'split', 'editor', 'preview'
  const [previewKey, setPreviewKey] = useState(0);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    // Split initial code into HTML and CSS
    if (code) {
      const lines = code.split('\n');
      const htmlLines = [];
      const cssLines = [];
      let inStyleTag = false;

      lines.forEach(line => {
        if (line.includes('<style>')) {
          inStyleTag = true;
          return;
        }
        if (line.includes('</style>')) {
          inStyleTag = false;
          return;
        }
        if (inStyleTag) {
          cssLines.push(line);
        } else {
          htmlLines.push(line);
        }
      });

      setHtmlCode(htmlLines.join('\n'));
      setCssCode(cssLines.join('\n'));
    }
  }, [code]);

  const handleHtmlChange = (value) => {
    setHtmlCode(value || '');
    updatePreview(value || '', cssCode);
    if (onCodeChange) {
      onCodeChange(combineCode(value || '', cssCode));
    }
  };

  const handleCssChange = (value) => {
    setCssCode(value || '');
    updatePreview(htmlCode, value || '');
    if (onCodeChange) {
      onCodeChange(combineCode(htmlCode, value || ''));
    }
  };

  const combineCode = (html, css) => {
    if (!css.trim()) return html;
    const htmlWithStyle = html.includes('</head>')
      ? html.replace('</head>', `  <style>\n${css}\n  </style>\n</head>`)
      : html + `\n<style>\n${css}\n</style>`;
    return htmlWithStyle;
  };

  const updatePreview = (html, css) => {
    setPreviewKey(prev => prev + 1);
  };

  const getPreviewContent = () => {
    return combineCode(htmlCode, cssCode);
  };

  const handleReset = () => {
    if (window.confirm('Reset code to lesson content?')) {
      const initialCode = code;
      const lines = initialCode.split('\n');
      const htmlLines = [];
      const cssLines = [];
      let inStyleTag = false;

      lines.forEach(line => {
        if (line.includes('<style>')) {
          inStyleTag = true;
          return;
        }
        if (line.includes('</style>')) {
          inStyleTag = false;
          return;
        }
        if (inStyleTag) {
          cssLines.push(line);
        } else {
          htmlLines.push(line);
        }
      });

      setHtmlCode(htmlLines.join('\n'));
      setCssCode(cssLines.join('\n'));
    }
  };

  return (
    <div className="editor-modal-overlay" onClick={onClose}>
      <div className="editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="editor-modal-header">
          <div className="editor-modal-title">
            <h2>💻 Code Editor & Live Preview</h2>
            <p>Edit your HTML and CSS code and see the results in real-time</p>
          </div>
          <button onClick={onClose} className="close-btn" title="Close Editor">
            ✕
          </button>
        </div>

        <div className="editor-modal-toolbar">
          <div className="view-mode-selector">
            <button
              className={`view-btn ${viewMode === 'split' ? 'active' : ''}`}
              onClick={() => setViewMode('split')}
              title="Split View"
            >
              ⚡ Split View
            </button>
            <button
              className={`view-btn ${viewMode === 'editor' ? 'active' : ''}`}
              onClick={() => setViewMode('editor')}
              title="Editor Only"
            >
              📝 Editor
            </button>
            <button
              className={`view-btn ${viewMode === 'preview' ? 'active' : ''}`}
              onClick={() => setViewMode('preview')}
              title="Preview Only"
            >
              👁️ Preview
            </button>
          </div>
          <div className="editor-actions">
            <button 
              onClick={() => setShowReview(!showReview)} 
              className={`action-btn ${showReview ? 'active' : ''}`}
              title="Toggle AI Code Review"
            >
              🤖 {showReview ? 'Hide' : 'Show'} Review
            </button>
            <button onClick={handleReset} className="action-btn" title="Reset to Lesson Code">
              🔄 Reset
            </button>
            <button 
              onClick={() => setPreviewKey(prev => prev + 1)} 
              className="action-btn"
              title="Refresh Preview"
            >
              🔃 Refresh
            </button>
          </div>
        </div>

        <div className="editor-modal-content">
          <div className={`editor-main-area ${showReview ? 'with-review' : ''}`}>
          {(viewMode === 'split' || viewMode === 'editor') && (
            <div className="editor-panel">
              <div className="code-tabs">
                <button
                  className={`code-tab ${activeCodeTab === 'html' ? 'active' : ''}`}
                  onClick={() => setActiveCodeTab('html')}
                >
                  <span className="tab-icon">📄</span>
                  HTML
                </button>
                <button
                  className={`code-tab ${activeCodeTab === 'css' ? 'active' : ''}`}
                  onClick={() => setActiveCodeTab('css')}
                >
                  <span className="tab-icon">🎨</span>
                  CSS
                </button>
              </div>
              <div className="editor-container">
                {activeCodeTab === 'html' && (
                  <div className="editor-wrapper html-editor">
                    <div className="editor-label">HTML</div>
                    <Editor
                      height="100%"
                      defaultLanguage="html"
                      value={htmlCode}
                      onChange={handleHtmlChange}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        padding: { top: 10, bottom: 10 }
                      }}
                    />
                  </div>
                )}
                {activeCodeTab === 'css' && (
                  <div className="editor-wrapper css-editor">
                    <div className="editor-label">CSS</div>
                    <Editor
                      height="100%"
                      defaultLanguage="css"
                      value={cssCode}
                      onChange={handleCssChange}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        padding: { top: 10, bottom: 10 }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {(viewMode === 'split' || viewMode === 'preview') && (
            <div className="preview-panel">
              <div className="preview-header">
                <span className="preview-icon">👁️</span>
                <span>Live Preview</span>
                <button 
                  onClick={() => setPreviewKey(prev => prev + 1)}
                  className="refresh-preview-btn"
                  title="Refresh Preview"
                >
                  🔃
                </button>
              </div>
              <div className="preview-container">
                <iframe
                  key={previewKey}
                  title="Preview"
                  srcDoc={getPreviewContent()}
                  className="preview-iframe"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          )}
          </div>
          {showReview && (
            <div className="review-panel-wrapper">
              <CodeReviewPanel
                code={activeCodeTab === 'html' ? htmlCode : cssCode}
                language={activeCodeTab}
                onSuggestionClick={(suggestion) => {
                  const currentCode = activeCodeTab === 'html' ? htmlCode : cssCode;
                  let newCode = currentCode;
                  
                  // If suggestion has a line number, try to replace that specific line
                  if (suggestion.line && suggestion.code) {
                    const lines = currentCode.split('\n');
                    const lineIndex = suggestion.line - 1; // Convert to 0-based index
                    
                    if (lineIndex >= 0 && lineIndex < lines.length) {
                      // Replace the specific line
                      lines[lineIndex] = suggestion.code;
                      newCode = lines.join('\n');
                    } else {
                      // Line number out of range, append at the end
                      newCode = currentCode + '\n' + suggestion.code;
                    }
                  } else if (suggestion.code) {
                    // No line number, append the suggestion code
                    // Check if it's a complete replacement or an addition
                    const suggestionText = suggestion.code.trim();
                    const currentText = currentCode.trim();
                    
                    // If suggestion is much shorter, it might be a partial fix
                    // In that case, append it. Otherwise, it might be a complete replacement
                    if (suggestionText.length < currentText.length * 0.5) {
                      // Likely a partial fix - append it
                      newCode = currentCode + '\n\n/* AI Suggestion */\n' + suggestion.code;
                    } else {
                      // Likely a complete replacement - ask user or append
                      if (window.confirm('This suggestion appears to be a complete code replacement. Append it to your current code?')) {
                        newCode = currentCode + '\n\n/* AI Suggestion - Review and use as needed */\n' + suggestion.code;
                      } else {
                        return; // User cancelled
                      }
                    }
                  }
                  
                  // Apply the change
                  if (activeCodeTab === 'html') {
                    handleHtmlChange(newCode);
                  } else {
                    handleCssChange(newCode);
                  }
                }}
              />
            </div>
          )}
        </div>

        <div className="editor-modal-footer">
          <div className="footer-info">
            <span>💡 Tip: Changes are saved automatically. Use the preview to see your results in real-time!</span>
          </div>
          <button onClick={onClose} className="btn btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorModal;

