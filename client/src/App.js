import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

const SOCKET_SERVER_URL = 'http://localhost:5001';

function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket connection
  useEffect(() => {
    console.log('Attempting to connect to:', SOCKET_SERVER_URL);
    const newSocket = io(SOCKET_SERVER_URL, {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to server successfully');
      setIsConnected(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('userJoined', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        message: `${data.username} joined the chat`,
        timestamp: data.timestamp
      }]);
    });

    newSocket.on('userLeft', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        message: `${data.username} left the chat`,
        timestamp: data.timestamp
      }]);
    });

    newSocket.on('usersList', (usersList) => {
      setUsers(usersList);
    });

    newSocket.on('userTyping', (data) => {
      if (data.isTyping) {
        setTypingUsers(prev => [...prev.filter(user => user !== data.username), data.username]);
      } else {
        setTypingUsers(prev => prev.filter(user => user !== data.username));
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleJoinChat = (e) => {
    e.preventDefault();
    if (username.trim() && socket) {
      socket.emit('join', username.trim());
      setHasJoined(true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('sendMessage', { message: newMessage.trim() });
      setNewMessage('');
      setIsTyping(false);
      socket.emit('typing', false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', false);
    }, 1000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Debug logging
  console.log('App state:', {
    isConnected,
    username,
    hasJoined,
    messagesCount: messages.length,
    usersCount: users.length
  });

  if (!isConnected) {
    return (
      <div className="app">
        <div className="connection-status">
          <div className="spinner"></div>
          <p>Connecting to chat server...</p>
        </div>
      </div>
    );
  }

  if (!username || !hasJoined) {
    return (
      <div className="app">
        <div className="join-container">
          <div className="join-card">
            <h1>Arghya Chat App</h1>
            <p>Enter your username to start chatting</p>
            <form onSubmit={handleJoinChat}>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={20}
                required
              />
              <button type="submit">Join Chat</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="header-info">
            <h2>Real-time Chat</h2>
            <div className="connection-indicator">
              <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          <div className="online-users">
            <span>{users.length} online</span>
            <button 
              className="leave-button" 
              onClick={() => {
                setHasJoined(false);
                setUsername('');
                setMessages([]);
                setUsers([]);
                setTypingUsers([]);
                if (socket) {
                  socket.emit('disconnect');
                }
              }}
            >
              Leave Chat
            </button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-main">
          {/* Messages */}
          <div className="messages-container">
            <div className="messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.type === 'system' ? 'system' : msg.username === username ? 'own' : 'other'}`}>
                  {msg.type === 'system' ? (
                    <div className="system-message">
                      <span>{msg.message}</span>
                      <small>{formatTime(msg.timestamp)}</small>
                    </div>
                  ) : (
                    <>
                      <div className="message-header">
                        <span className="username">{msg.username}</span>
                        <span className="timestamp">{formatTime(msg.timestamp)}</span>
                      </div>
                      <div className="message-content">
                        {msg.message}
                      </div>
                    </>
                  )}
                </div>
              ))}
              {typingUsers.length > 0 && (
                <div className="typing-indicator">
                  <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="message-input-container">
            <form onSubmit={handleSendMessage}>
              <textarea
                placeholder="Type a message..."
                value={newMessage}
                onChange={handleTyping}
                maxLength={500}
                rows="2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button type="submit" disabled={!newMessage.trim()}>
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
