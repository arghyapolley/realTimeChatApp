const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000", // React app URL
  methods: ["GET", "POST"],
  credentials: true
};

app.use(cors(corsOptions));

// Socket.IO setup with CORS
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store connected users
const connectedUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user joining
  socket.on('join', (username) => {
    connectedUsers.set(socket.id, username);
    socket.username = username;
    
    // Notify all clients about new user
    io.emit('userJoined', {
      username: username,
      userId: socket.id,
      timestamp: new Date().toISOString()
    });
    
    // Send current users list to the new user
    socket.emit('usersList', Array.from(connectedUsers.values()));
    
    console.log(`${username} joined the chat`);
  });

  // Handle chat messages
  socket.on('sendMessage', (messageData) => {
    const message = {
      id: Date.now() + Math.random(),
      username: socket.username,
      message: messageData.message,
      timestamp: new Date().toISOString(),
      userId: socket.id
    };
    
    // Broadcast message to all connected clients
    io.emit('newMessage', message);
    console.log(`Message from ${socket.username}: ${messageData.message}`);
  });

  // Handle typing indicator
  socket.on('typing', (isTyping) => {
    socket.broadcast.emit('userTyping', {
      username: socket.username,
      isTyping: isTyping
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const username = connectedUsers.get(socket.id);
    connectedUsers.delete(socket.id);
    
    if (username) {
      io.emit('userLeft', {
        username: username,
        userId: socket.id,
        timestamp: new Date().toISOString()
      });
      console.log(`${username} left the chat`);
    }
  });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Chat server is running!' });
});

// Get connected users
app.get('/users', (req, res) => {
  res.json(Array.from(connectedUsers.values()));
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for origin: http://localhost:3000`);
});
