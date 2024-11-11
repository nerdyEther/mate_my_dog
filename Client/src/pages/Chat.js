import React from 'react';

const Chat = ({ descendingOrderMessages }) => {
  return (
    <div className="chat-messages">
      {descendingOrderMessages?.map((message, index) => (
        <div key={index} className="message-container">
          <div className="message-header">
            <div className="img-container">
              <img src={message.img} alt={`${message.name}'s profile`} />
            </div>
            <span className="sender-name">{message.name}</span>
          </div>
          <p className="message-content">{message.message}</p>
        </div>
      ))}
    </div>
  );
};

export default Chat;