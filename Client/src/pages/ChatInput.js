import React, { useState } from 'react';
import axios from 'axios';

const ChatInput = ({ user, clickedUser, getUserMessages, getClickedUsersMessages }) => {
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    if (!message.trim()) return;

    const messageData = {
      timestamp: new Date().toISOString(),
      from_userId: user?.user_id,
      to_userId: clickedUser?.user_id,
      message: message.trim()
    };

    try {
      await axios.post('https://matemydog-production.up.railway.app/message', { message: messageData });
      getUserMessages();
      getClickedUsersMessages();
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-input-container">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        className="chat-input"
      />
      <button 
        className="send-button"
        onClick={sendMessage}
        disabled={!message.trim()}
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;