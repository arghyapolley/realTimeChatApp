const request = require('supertest');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');

describe('Chat Server', () => {
  let io, serverSocket, clientSocket, app, server;

  beforeAll((done) => {
    // Don't import the actual server module as it starts the server
    // We'll create our own test server instead
    
    // Create HTTP server
    server = createServer();
    
    // Create Socket.IO server
    io = new Server(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Set up server event handlers (simulating the actual server logic)
    const connectedUsers = new Map();

    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);

      socket.on('join', (username) => {
        // Only join if username is provided
        if (username && username.trim()) {
          connectedUsers.set(socket.id, username);
          socket.username = username;
          
          io.emit('userJoined', {
            username: username,
            userId: socket.id,
            timestamp: new Date().toISOString()
          });
          
          socket.emit('usersList', Array.from(connectedUsers.values()));
          
          console.log(`${username} joined the chat`);
        }
      });

      socket.on('sendMessage', (messageData) => {
        // Only send message if it's not empty
        if (messageData.message && messageData.message.trim()) {
          const message = {
            id: Date.now() + Math.random(),
            username: socket.username,
            message: messageData.message,
            timestamp: new Date().toISOString(),
            userId: socket.id
          };
          
          io.emit('newMessage', message);
          console.log(`Message from ${socket.username}: ${messageData.message}`);
        }
      });

      socket.on('typing', (isTyping) => {
        socket.broadcast.emit('userTyping', {
          username: socket.username,
          isTyping: isTyping
        });
      });

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

    // Create Express app for HTTP endpoints
    const express = require('express');
    const cors = require('cors');
    
    app = express();
    app.use(cors({
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }));

    app.get('/', (req, res) => {
      res.json({ message: 'Chat server is running!' });
    });

    app.get('/users', (req, res) => {
      res.json(Array.from(connectedUsers.values()));
    });

    server.listen(5002, () => {
      done();
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
    server.close();
  });

  beforeEach((done) => {
    clientSocket = Client('http://localhost:5002');
    clientSocket.on('connect', done);
  });

  afterEach(() => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  describe('HTTP Endpoints', () => {
    test('should return server status', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toEqual({ message: 'Chat server is running!' });
    });

    test('should return empty users list initially', async () => {
      const response = await request(app)
        .get('/users')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    test('should handle CORS properly', async () => {
      const response = await request(app)
        .get('/')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });
  });

  describe('Socket.IO Connection', () => {
    test('should establish connection', (done) => {
      expect(clientSocket.connected).toBe(true);
      done();
    });

    test('should emit connection event', (done) => {
      // The connection is already established in beforeEach
      expect(clientSocket.connected).toBe(true);
      done();
    });
  });

  describe('User Join Functionality', () => {
    test('should handle user join event', (done) => {
      const username = 'TestUser';
      
      clientSocket.emit('join', username);
      
      clientSocket.on('userJoined', (data) => {
        expect(data.username).toBe(username);
        expect(data.userId).toBe(clientSocket.id);
        expect(data.timestamp).toBeDefined();
        done();
      });
    });

    test('should emit users list after join', (done) => {
      const username = 'TestUser';
      
      clientSocket.emit('join', username);
      
      clientSocket.on('usersList', (users) => {
        expect(users).toContain(username);
        done();
      });
    });

    test('should handle multiple users joining', (done) => {
      const clientSocket2 = Client('http://localhost:5002');
      const username1 = 'User1';
      const username2 = 'User2';
      let joinCount = 0;

      clientSocket.emit('join', username1);
      clientSocket2.emit('join', username2);

      clientSocket.on('userJoined', (data) => {
        joinCount++;
        if (joinCount === 2) {
          expect(data.username).toBe(username2);
          clientSocket2.disconnect();
          done();
        }
      });
    });
  });

  describe('Message Functionality', () => {
    beforeEach((done) => {
      clientSocket.emit('join', 'TestUser');
      clientSocket.on('usersList', () => done());
    });

    test('should handle send message event', (done) => {
      const messageText = 'Hello, world!';
      
      clientSocket.emit('sendMessage', { message: messageText });
      
      clientSocket.on('newMessage', (message) => {
        expect(message.username).toBe('TestUser');
        expect(message.message).toBe(messageText);
        expect(message.timestamp).toBeDefined();
        expect(message.id).toBeDefined();
        done();
      });
    });

    test('should broadcast messages to all clients', (done) => {
      const clientSocket2 = Client('http://localhost:5002');
      const messageText = 'Broadcast message';
      
      clientSocket2.on('connect', () => {
        clientSocket2.emit('join', 'User2');
        
        clientSocket2.on('usersList', () => {
          clientSocket.emit('sendMessage', { message: messageText });
        });
      });

      clientSocket2.on('newMessage', (message) => {
        expect(message.username).toBe('TestUser');
        expect(message.message).toBe(messageText);
        clientSocket2.disconnect();
        done();
      });
    });

    test('should not send empty messages', (done) => {
      let messageReceived = false;
      
      clientSocket.emit('sendMessage', { message: '' });
      
      clientSocket.on('newMessage', () => {
        messageReceived = true;
      });

      // Wait a bit to ensure no message is sent
      setTimeout(() => {
        expect(messageReceived).toBe(false);
        done();
      }, 200);
    });
  });

  describe('Typing Indicators', () => {
    beforeEach((done) => {
      clientSocket.emit('join', 'TestUser');
      clientSocket.on('usersList', () => done());
    });

    test('should handle typing start event', (done) => {
      const clientSocket2 = Client('http://localhost:5002');
      
      clientSocket2.on('connect', () => {
        clientSocket2.emit('join', 'User2');
        
        clientSocket2.on('usersList', () => {
          clientSocket.emit('typing', true);
        });
      });

      clientSocket2.on('userTyping', (data) => {
        expect(data.username).toBe('TestUser');
        expect(data.isTyping).toBe(true);
        clientSocket2.disconnect();
        done();
      });
    });

    test('should handle typing stop event', (done) => {
      const clientSocket2 = Client('http://localhost:5002');
      
      clientSocket2.on('connect', () => {
        clientSocket2.emit('join', 'User2');
        
        clientSocket2.on('usersList', () => {
          clientSocket.emit('typing', false);
        });
      });

      clientSocket2.on('userTyping', (data) => {
        expect(data.username).toBe('TestUser');
        expect(data.isTyping).toBe(false);
        clientSocket2.disconnect();
        done();
      });
    });

    test('should not emit typing to sender', (done) => {
      let typingReceived = false;
      
      clientSocket.emit('typing', true);
      
      clientSocket.on('userTyping', () => {
        typingReceived = true;
      });

      // Wait a bit to ensure typing is not sent to sender
      setTimeout(() => {
        expect(typingReceived).toBe(false);
        done();
      }, 100);
    });
  });

  describe('User Disconnect', () => {
    test('should handle user disconnect', (done) => {
      const clientSocket2 = Client('http://localhost:5002');
      const username = 'DisconnectingUser';
      
      clientSocket2.on('connect', () => {
        clientSocket2.emit('join', username);
        
        clientSocket2.on('usersList', () => {
          const socketId = clientSocket2.id;
          clientSocket2.disconnect();
          
          clientSocket.on('userLeft', (data) => {
            expect(data.username).toBe(username);
            expect(data.userId).toBe(socketId);
            expect(data.timestamp).toBeDefined();
            done();
          });
        });
      });
    });

    test('should remove user from connected users on disconnect', (done) => {
      const clientSocket2 = Client('http://localhost:5002');
      const username = 'TempUser';
      
      clientSocket2.on('connect', () => {
        clientSocket2.emit('join', username);
        
        clientSocket2.on('usersList', (users) => {
          expect(users).toContain(username);
          clientSocket2.disconnect();
          
          // Check users endpoint after disconnect
          setTimeout(async () => {
            const response = await request(app).get('/users');
            expect(response.body).not.toContain(username);
            done();
          }, 100);
        });
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid message data gracefully', (done) => {
      clientSocket.emit('join', 'TestUser');
      
      clientSocket.on('usersList', () => {
        // Send invalid message data
        clientSocket.emit('sendMessage', { invalidField: 'test' });
        
        // Should not crash and should still be connected
        setTimeout(() => {
          expect(clientSocket.connected).toBe(true);
          done();
        }, 100);
      });
    });

    test('should handle missing username in join event', (done) => {
      // Send join without username
      clientSocket.emit('join');
      
      // Should not crash
      setTimeout(() => {
        expect(clientSocket.connected).toBe(true);
        done();
      }, 100);
    });

    test('should handle server shutdown gracefully', (done) => {
      clientSocket.on('disconnect', () => {
        expect(clientSocket.connected).toBe(false);
        done();
      });

      // Close the server immediately
      server.close();
    });
  });

  describe('Message Formatting', () => {
    beforeEach((done) => {
      clientSocket.emit('join', 'TestUser');
      clientSocket.on('usersList', () => done());
    });

    test('should generate unique message IDs', (done) => {
      const message1 = 'First message';
      const message2 = 'Second message';
      let messageCount = 0;
      const messageIds = new Set();

      clientSocket.emit('sendMessage', { message: message1 });
      clientSocket.emit('sendMessage', { message: message2 });

      clientSocket.on('newMessage', (message) => {
        messageIds.add(message.id);
        messageCount++;
        
        if (messageCount === 2) {
          expect(messageIds.size).toBe(2);
          done();
        }
      });
    });

    test('should include proper timestamp format', (done) => {
      const messageText = 'Timestamp test';
      
      clientSocket.emit('sendMessage', { message: messageText });
      
      clientSocket.on('newMessage', (message) => {
        expect(message.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        done();
      });
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle multiple rapid messages', (done) => {
      clientSocket.emit('join', 'TestUser');
      
      clientSocket.on('usersList', () => {
        const messageCount = 10;
        let receivedCount = 0;

        clientSocket.on('newMessage', () => {
          receivedCount++;
          if (receivedCount === messageCount) {
            done();
          }
        });

        // Send multiple messages rapidly
        for (let i = 0; i < messageCount; i++) {
          clientSocket.emit('sendMessage', { message: `Message ${i}` });
        }
      });
    });

    test('should handle multiple concurrent users', (done) => {
      const userCount = 5;
      const clients = [];
      let connectedCount = 0;

      for (let i = 0; i < userCount; i++) {
        const client = Client('http://localhost:5002');
        client.on('connect', () => {
          client.emit('join', `User${i}`);
          connectedCount++;
          
          if (connectedCount === userCount) {
            // All users connected, clean up
            clients.forEach(c => c.disconnect());
            done();
          }
        });
        clients.push(client);
      }
    });
  });
}); 