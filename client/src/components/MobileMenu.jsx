import { useState } from 'react';
import { Link } from 'react-router-dom';
import './MobileMenu.css';

const MobileMenu = ({ user, onLogout, onClose, showEditor, onShowEditor, onShowChat, onShowDebug }) => {
  return (
    <div className="mobile-menu-overlay" onClick={onClose}>
      <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-menu-header">
          <h3>🚀 Luno</h3>
          <button className="close-menu-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="mobile-menu-content">
          {user && (
            <div className="mobile-menu-user">
              <span>Welcome, {user.username}!</span>
            </div>
          )}
          
          <div className="mobile-menu-actions">
            {showEditor !== undefined && (
              <button onClick={() => { onShowEditor(); onClose(); }} className="mobile-menu-btn">
                💻 Open Editor
              </button>
            )}
            {onShowChat && (
              <button onClick={() => { onShowChat(); onClose(); }} className="mobile-menu-btn">
                💬 Chat with Tutor
              </button>
            )}
            {onShowDebug && (
              <button onClick={() => { onShowDebug(); onClose(); }} className="mobile-menu-btn">
                🐛 Debug Assistant
              </button>
            )}
            <Link to="/dashboard" className="mobile-menu-btn" onClick={onClose}>
              📚 Dashboard
            </Link>
            {onLogout && (
              <button onClick={() => { onLogout(); onClose(); }} className="mobile-menu-btn logout-btn">
                🚪 Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;

