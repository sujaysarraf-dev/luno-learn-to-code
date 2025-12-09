import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import './EditorModal.css';

const EditorModal = ({ code, onCodeChange, onClose }) => {
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [activeCodeTab, setActiveCodeTab] = useState('html'); // 'html' or 'css'
  const [viewMode, setViewMode] = useState('split'); // 'split', 'editor', 'preview'
  const [previewKey, setPreviewKey] = useState(0);

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

