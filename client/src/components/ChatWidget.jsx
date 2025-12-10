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
      console.error('Chat error:', err);
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      // Show more helpful error messages
      if (err.response?.data) {
        const errorData = err.response.data;
        let baseError = errorData.error || errorData.message || 'Unknown error';
        
        // Check for API key related errors (including "User not found" from OpenRouter)
        if (baseError.includes('User not found') || 
            baseError.includes('user not found') ||
            baseError.includes('API key') || 
            baseError.includes('OpenRouter') || 
            baseError.includes('invalid') || 
            baseError.includes('expired')) {
          errorMessage = '⚠️ OpenRouter API key is invalid or expired.\n\n💡 Please verify your API key at https://openrouter.ai/keys and update it in server/.env file.';
        } else if (errorData.message && errorData.message.includes('User not found')) {
          errorMessage = '⚠️ OpenRouter API key is invalid or expired.\n\n💡 Please verify your API key at https://openrouter.ai/keys and update it in server/.env file.';
        } else {
          errorMessage = baseError;
        }
      } else if (err.response?.status === 401) {
        errorMessage = '🔐 Authentication error. Please check your API key configuration.';
      } else if (err.response?.status === 500) {
        errorMessage = '⚠️ Server error. The chat service may be temporarily unavailable.\n\n💡 This is likely due to an invalid OpenRouter API key. Please check your server/.env file.';
      } else if (err.message) {
        errorMessage = '❌ ' + err.message;
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage
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

