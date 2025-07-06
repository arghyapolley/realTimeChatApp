# Real-time Chat Application

A modern, real-time chat application built with React frontend and Node.js/Express backend using Socket.IO for real-time communication.

## Features

- 🔄 Real-time messaging with Socket.IO
- 👥 User join/leave notifications
- ⌨️ Typing indicators
- 📱 Responsive design for mobile and desktop
- 🎨 Modern UI with beautiful gradients and animations
- 🔗 Connection status indicator
- 👤 Online users counter
- ⏰ Message timestamps
- 🚀 Auto-scroll to latest messages

## Tech Stack

### Frontend
- React 19.1.0
- Socket.IO Client 4.8.1
- Modern CSS with gradients and animations

### Backend
- Node.js
- Express 5.1.0
- Socket.IO 4.8.1
- CORS for cross-origin requests

## CORS Configuration

The application includes proper CORS configuration to handle cross-origin requests:

### Backend CORS Setup
- **Origin**: `http://localhost:3000` (React app URL)
- **Methods**: GET, POST
- **Credentials**: Enabled
- **Socket.IO CORS**: Configured for WebSocket connections

### Frontend Configuration
- Socket.IO client configured with `withCredentials: true`
- Proper error handling for connection issues

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd chat-app
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../client
npm install
```

## Running the Application

### 1. Start the Backend Server
```bash
cd server
npm start
```

The server will start on `http://localhost:5000`

### 2. Start the Frontend Application
```bash
cd client
npm start
```

The React app will start on `http://localhost:3000`

### 3. Access the Application
Open your browser and navigate to `http://localhost:3000`

## Development Scripts

### Backend (server directory)
- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon (requires nodemon to be installed)

### Frontend (client directory)
- `npm start` - Start the development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Project Structure

```
chat-app/
├── client/                 # React frontend
│   ├── public/
│   │   ├── App.js         # Main chat component
│   │   ├── App.css        # Modern styling
│   │   └── index.js       # React entry point
│   └── package.json
├── server/                 # Node.js backend
│   ├── server.js          # Express server with Socket.IO
│   └── package.json
└── README.md
```

## How It Works

### Backend (server.js)
1. **Express Server**: Handles HTTP requests and CORS
2. **Socket.IO Server**: Manages real-time WebSocket connections
3. **User Management**: Tracks connected users and their usernames
4. **Message Broadcasting**: Sends messages to all connected clients
5. **Event Handling**: Manages join, leave, typing, and message events

### Frontend (App.js)
1. **Socket Connection**: Establishes WebSocket connection to backend
2. **User Authentication**: Simple username-based authentication
3. **Real-time Updates**: Listens for new messages, user events, and typing indicators
4. **UI Components**: Modern chat interface with responsive design
5. **Auto-scroll**: Automatically scrolls to latest messages

## API Endpoints

### HTTP Endpoints
- `GET /` - Server status check
- `GET /users` - Get list of connected users

### Socket.IO Events

#### Client to Server
- `join` - User joins the chat
- `sendMessage` - Send a new message
- `typing` - User typing indicator

#### Server to Client
- `newMessage` - New message received
- `userJoined` - User joined notification
- `userLeft` - User left notification
- `usersList` - List of connected users
- `userTyping` - User typing indicator

## CORS Solution Details

The application implements a comprehensive CORS solution:

### 1. Express CORS Middleware
```javascript
const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true
};
app.use(cors(corsOptions));
```

### 2. Socket.IO CORS Configuration
```javascript
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

### 3. Frontend Socket Configuration
```javascript
const newSocket = io(SOCKET_SERVER_URL, {
  withCredentials: true
});
```

This configuration ensures:
- ✅ Cross-origin requests are properly handled
- ✅ WebSocket connections work across different ports
- ✅ Credentials are included in requests
- ✅ Security is maintained with specific origin restrictions

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure both frontend and backend are running
   - Check that the origin URL matches exactly
   - Verify CORS configuration in server.js

2. **Socket Connection Issues**
   - Check if the server is running on port 5000
   - Verify the SOCKET_SERVER_URL in App.js
   - Check browser console for connection errors

3. **Port Conflicts**
   - Backend: Change PORT in server.js if 5000 is occupied
   - Frontend: React will automatically suggest an alternative port

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reloading
2. **Debug Mode**: Check browser console and server logs for debugging
3. **Multiple Users**: Open multiple browser tabs to test real-time features

## Future Enhancements

- [ ] User authentication with JWT
- [ ] Message persistence with database
- [ ] File sharing capabilities
- [ ] Private messaging
- [ ] Message reactions
- [ ] User profiles and avatars
- [ ] Message search functionality
- [ ] Push notifications

## License

This project is open source and available under the [MIT License](LICENSE). 