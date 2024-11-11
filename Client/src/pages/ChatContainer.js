import React, { useState } from 'react';
import ChatHeader from './ChatHeader';
import MatchesDisplay from './MatchesDisplay';
import ChatDisplay from './ChatDisplay';

const ChatContainer = ({ user }) => {
  const [clickedUser, setClickedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('matches');

  // If user is null, show loading state
  if (!user) {
    return (
      <div className="chat-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'matches') {
      setClickedUser(null);
    }
  };

  // Safely access matches with fallback to empty array
  const matches = user?.matches || [];

  return (
    <div className="chat-container">
      <ChatHeader user={user} />
      
      <div className="chat-tabs">
        <button 
          className={`tab-button ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => handleTabChange('matches')}
        >
          Matches ({matches.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => handleTabChange('chat')}
          disabled={!clickedUser}
        >
          Chat {clickedUser && `with ${clickedUser.first_name}`}
        </button>
      </div>

      <div className="chat-content">
        {activeTab === 'matches' && (
          <MatchesDisplay 
            matches={matches}
            setClickedUser={(matchedUser) => {
              if (matchedUser) {
                setClickedUser(matchedUser);
                setActiveTab('chat');
              }
            }}
          />
        )}
        
        {activeTab === 'chat' && clickedUser && (
          <ChatDisplay 
            user={user} 
            clickedUser={clickedUser} 
          />
        )}

        {activeTab === 'chat' && !clickedUser && (
          <div className="no-chat-selected">
            <p>Select a match to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;