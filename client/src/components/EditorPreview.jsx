import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import './EditorPreview.css';

const EditorPreview = ({ initialCode = '', onCodeChange }) => {
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [activeTab, setActiveTab] = useState('html');
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    // Split initial code into HTML and CSS
    if (initialCode) {
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
  }, [initialCode]);

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

  return (
    <div className="editor-preview">
      <div className="editor-header">
        <h3>💻 Code Editor & Preview</h3>
        <div className="editor-tabs">
          <button
            className={`tab ${activeTab === 'html' ? 'active' : ''}`}
            onClick={() => setActiveTab('html')}
          >
            HTML
          </button>
          <button
            className={`tab ${activeTab === 'css' ? 'active' : ''}`}
            onClick={() => setActiveTab('css')}
          >
            CSS
          </button>
          <button
            className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
        </div>
      </div>

      <div className="editor-content">
        {activeTab === 'html' && (
          <Editor
            height="400px"
            defaultLanguage="html"
            value={htmlCode}
            onChange={handleHtmlChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on'
            }}
          />
        )}

        {activeTab === 'css' && (
          <Editor
            height="400px"
            defaultLanguage="css"
            value={cssCode}
            onChange={handleCssChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on'
            }}
          />
        )}

        {activeTab === 'preview' && (
          <div className="preview-container">
            <iframe
              key={previewKey}
              title="Preview"
              srcDoc={getPreviewContent()}
              className="preview-iframe"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPreview;

