import { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../services/api';
import './ChatWidget.css';

const ChatWidget = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Luno, your AI coding tutor. How can I help you learn HTML and CSS today? 😊"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await chatAPI.sendMessage(userMessage, history);
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget-overlay" onClick={onClose}>
      <div className="chat-widget" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <h3>💬 Chat with Luno</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="chat-input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about HTML/CSS..."
            className="chat-input"
            disabled={loading}
          />
          <button type="submit" className="send-btn" disabled={loading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWidget;

