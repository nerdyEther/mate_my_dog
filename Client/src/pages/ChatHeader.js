import React, { useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';

const ChatHeader = ({ user }) => {
  const [cookies, setCookie, removeCookie] = useCookies(['user']);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      // Remove cookies
      removeCookie('UserId', { path: '/' });
      removeCookie('AuthToken', { path: '/' });
      
      // Simulate a brief delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="chat-header">
      <div className="profile">
        <div className="img-container">
          <img src={user.url} alt={`${user.first_name}'s profile`} />
        </div>
        <h3>{user.first_name}</h3>
      </div>
      <button 
        className={`logout-button ${isLoggingOut ? 'loading' : ''}`} 
        onClick={logout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <span className="loading-dots">
            Logging out<span>.</span><span>.</span><span>.</span>
          </span>
        ) : (
          'Logout'
        )}
      </button>
    </div>
  );
};

export default ChatHeader;