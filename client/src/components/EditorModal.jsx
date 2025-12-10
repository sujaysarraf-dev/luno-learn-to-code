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
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);

  useEffect(() => {
    // Split initial code into HTML and CSS
    if (code) {
      // Check if code has <link> tag for external stylesheet
      const hasLinkTag = code.includes('<link') && code.includes('stylesheet');
      
      if (hasLinkTag) {
        // User has external stylesheet, keep HTML complete
        setHtmlCode(code);
        setCssCode('');
        return;
      }
      
      const lines = code.split('\n');
      const htmlLines = [];
      const cssLines = [];
      let inStyleTag = false;

      lines.forEach(line => {
        if (line.includes('<style>')) {
          inStyleTag = true;
          // Don't include <style> tag in HTML, it will be added by combineCode
          return;
        }
        if (line.includes('</style>')) {
          inStyleTag = false;
          // Don't include </style> tag in HTML
          return;
        }
        if (inStyleTag) {
          cssLines.push(line);
        } else {
          htmlLines.push(line);
        }
      });

      const htmlContent = htmlLines.join('\n');
      const cssContent = cssLines.join('\n');
      
      // If HTML has inline <style> tag, keep HTML as-is
      const hasInlineStyle = htmlContent.includes('<style>');
      
      if (hasInlineStyle) {
        setHtmlCode(code); // Use full code as HTML
        setCssCode(''); // Clear CSS tab
      } else {
        setHtmlCode(htmlContent);
        setCssCode(cssContent);
      }
    }
  }, [code]);

  const handleHtmlChange = (value) => {
    const newHtml = value || '';
    setHtmlCode(newHtml);
    
    // Check if HTML has style/link tags - if so, use HTML directly
    const hasStyleTag = newHtml.includes('<style>') || newHtml.includes('</style>');
    const hasLinkTag = newHtml.includes('<link') && newHtml.includes('stylesheet');
    
    if (hasStyleTag || hasLinkTag) {
      // User is writing complete HTML with styles, use it directly
      updatePreview(newHtml, '');
      if (onCodeChange) {
        onCodeChange(newHtml);
      }
    } else {
      // Normal mode: combine HTML + CSS tab
      updatePreview(newHtml, cssCode);
      if (onCodeChange) {
        onCodeChange(combineCode(newHtml, cssCode));
      }
    }
  };

  const handleCssChange = (value) => {
    const newCss = value || '';
    setCssCode(newCss);
    
    // Check if HTML has style/link tags - if so, ignore CSS tab changes
    const hasStyleTag = htmlCode.includes('<style>') || htmlCode.includes('</style>');
    const hasLinkTag = htmlCode.includes('<link') && htmlCode.includes('stylesheet');
    
    if (hasStyleTag || hasLinkTag) {
      // HTML has its own styles, use HTML directly
      updatePreview(htmlCode, '');
      if (onCodeChange) {
        onCodeChange(htmlCode);
      }
    } else {
      // Normal mode: combine HTML + CSS tab
      updatePreview(htmlCode, newCss);
      if (onCodeChange) {
        onCodeChange(combineCode(htmlCode, newCss));
      }
    }
  };

  const combineCode = (html, css) => {
    // If HTML already has <style> or <link> tags, don't auto-add
    const hasStyleTag = html.includes('<style>') || html.includes('</style>');
    const hasLinkTag = html.includes('<link') && html.includes('stylesheet');
    
    // If user has their own style/link tags, use HTML as-is
    if (hasStyleTag || hasLinkTag) {
      return html;
    }
    
    // Otherwise, add CSS from the CSS tab
    if (!css.trim()) return html;
    
    // Try to add style tag in head, otherwise append
    if (html.includes('</head>')) {
      return html.replace('</head>', `  <style>\n${css}\n  </style>\n</head>`);
    } else if (html.includes('<head>')) {
      return html.replace('<head>', `<head>\n  <style>\n${css}\n  </style>`);
    } else {
      // No head tag, append style at the end
      return html + `\n<style>\n${css}\n</style>`;
    }
  };

  const updatePreview = (html, css) => {
    setPreviewKey(prev => prev + 1);
  };

  const getPreviewContent = () => {
    // If HTML has style/link tags, use HTML directly
    const hasStyleTag = htmlCode.includes('<style>') || htmlCode.includes('</style>');
    const hasLinkTag = htmlCode.includes('<link') && htmlCode.includes('stylesheet');
    
    if (hasStyleTag || hasLinkTag) {
      return htmlCode;
    }
    
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
                refreshTrigger={reviewRefreshTrigger}
                onSuggestionClick={(suggestion) => {
                  const currentCode = activeCodeTab === 'html' ? htmlCode : cssCode;
                  let newCode = currentCode;
                  
                  // Use newCode if available (the fix), otherwise fall back to code
                  const fixCode = suggestion.newCode || suggestion.code;
                  
                  if (!fixCode) {
                    alert('No code fix available for this suggestion.');
                    return;
                  }
                  
                  // If we have oldCode and newCode, do a smart replacement
                  if (suggestion.oldCode && suggestion.newCode) {
                    // Try to find and replace the old code
                    const oldCodeIndex = currentCode.indexOf(suggestion.oldCode);
                    if (oldCodeIndex !== -1) {
                      // Found the old code, replace it
                      newCode = currentCode.substring(0, oldCodeIndex) + 
                               suggestion.newCode + 
                               currentCode.substring(oldCodeIndex + suggestion.oldCode.length);
                    } else {
                      // Old code not found exactly, try line-based replacement
                      if (suggestion.line) {
                        const lines = currentCode.split('\n');
                        const lineIndex = suggestion.line - 1;
                        if (lineIndex >= 0 && lineIndex < lines.length) {
                          // Check if the line contains similar content
                          if (lines[lineIndex].trim().includes(suggestion.oldCode.trim().substring(0, 20))) {
                            lines[lineIndex] = suggestion.newCode;
                            newCode = lines.join('\n');
                          } else {
                            // Show confirmation for replacement
                            if (window.confirm(`Replace line ${suggestion.line} with the fix?`)) {
                              lines[lineIndex] = suggestion.newCode;
                              newCode = lines.join('\n');
                            } else {
                              return;
                            }
                          }
                        } else {
                          // Line out of range, append
                          newCode = currentCode + '\n' + suggestion.newCode;
                        }
                      } else {
                        // No line number, append with context
                        newCode = currentCode + '\n\n/* Fix: ' + suggestion.message + ' */\n' + suggestion.newCode;
                      }
                    }
                  } 
                  // If we have a range of lines (startLine to endLine)
                  else if (suggestion.startLine && suggestion.endLine) {
                    const lines = currentCode.split('\n');
                    const startIdx = suggestion.startLine - 1;
                    const endIdx = suggestion.endLine;
                    
                    if (startIdx >= 0 && endIdx <= lines.length) {
                      // Replace the range
                      const before = lines.slice(0, startIdx).join('\n');
                      const after = lines.slice(endIdx).join('\n');
                      newCode = before + (before ? '\n' : '') + fixCode + (after ? '\n' : '') + after;
                    } else {
                      newCode = currentCode + '\n' + fixCode;
                    }
                  }
                  // If we have a specific line number
                  else if (suggestion.line) {
                    const lines = currentCode.split('\n');
                    const lineIndex = suggestion.line - 1;
                    
                    if (lineIndex >= 0 && lineIndex < lines.length) {
                      // Replace the specific line
                      lines[lineIndex] = fixCode;
                      newCode = lines.join('\n');
                    } else {
                      // Line out of range, append
                      newCode = currentCode + '\n' + fixCode;
                    }
                  }
                  // No specific location, append the fix
                  else {
                    newCode = currentCode + '\n\n/* Fix: ' + (suggestion.message || 'AI Suggestion') + ' */\n' + fixCode;
                  }
                  
                  // Apply the change
                  if (activeCodeTab === 'html') {
                    handleHtmlChange(newCode);
                  } else {
                    handleCssChange(newCode);
                  }
                  
                  // Trigger review refresh after applying fix
                  setTimeout(() => {
                    setReviewRefreshTrigger(prev => prev + 1);
                  }, 100);
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

