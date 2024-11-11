import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chat from './Chat';
import ChatInput from './ChatInput';

const ChatDisplay = ({ user, clickedUser }) => {
    const [usersMessages, setUsersMessages] = useState(null);
    const [clickedUsersMessages, setClickedUsersMessages] = useState(null);
    const [loading, setLoading] = useState(true);

    const getUsersMessages = async () => {
        try {
            const response = await axios.get('https://matemydog-production.up.railway.app/messages', {
                params: { 
                    userId: user?.user_id, 
                    correspondingUserId: clickedUser?.user_id
                }
            });
            setUsersMessages(response.data);
        } catch (error) {
            console.error("Error fetching user messages:", error);
        }
    };

    const getClickedUsersMessages = async () => {
        try {
            const response = await axios.get('https://matemydog-production.up.railway.app/messages', {
                params: { 
                    userId: clickedUser?.user_id, 
                    correspondingUserId: user?.user_id
                }
            });
            setClickedUsersMessages(response.data);
        } catch (error) {
            console.error("Error fetching clicked user messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        getUsersMessages();
        getClickedUsersMessages();
    }, [clickedUser?.user_id, user?.user_id]);

    const formatMessages = () => {
        const messages = [];

        usersMessages?.forEach(message => {
            messages.push({
                name: user?.first_name,
                img: user?.url,
                message: message.message,
                timestamp: message.timestamp
            });
        });

        clickedUsersMessages?.forEach(message => {
            messages.push({
                name: clickedUser?.first_name,
                img: clickedUser?.url,
                message: message.message,
                timestamp: message.timestamp
            });
        });

        return messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    };

    if (loading) {
        return <div className="loading-spinner">Loading messages...</div>;
    }

    return (
        <div className="chat-display-container">
            <Chat descendingOrderMessages={formatMessages()} />
            <ChatInput
                user={user}
                clickedUser={clickedUser}
                getUserMessages={getUsersMessages}
                getClickedUsersMessages={getClickedUsersMessages}
            />
        </div>
    );
};

export default ChatDisplay;