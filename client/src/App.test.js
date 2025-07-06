import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';

// Mock socket.io-client
const mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  close: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  id: 'test-socket-id'
};

jest.mock('socket.io-client', () => ({
  __esModule: true,
  default: jest.fn(() => mockSocket)
}));

describe('Chat App Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset the mock socket
    Object.assign(mockSocket, {
      on: jest.fn(),
      emit: jest.fn(),
      close: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      id: 'test-socket-id'
    });
  });

  describe('Initial Render and Connection', () => {
    test('should show connection status when not connected', () => {
      render(<App />);
      
      expect(screen.getByText('Connecting to chat server...')).toBeInTheDocument();
    });

    test('should establish socket connection on mount', () => {
      render(<App />);
      
      // The socket should be created
      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('newMessage', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('userJoined', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('userLeft', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('usersList', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('userTyping', expect.any(Function));
    });

    test('should show join form when connected', async () => {
      render(<App />);
      
      // Simulate connection
      act(() => {
        const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
        connectCallback();
      });

      await waitFor(() => {
        expect(screen.getByText('Arghya Chat App')).toBeInTheDocument();
        expect(screen.getByText('Enter your username to start chatting')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Join Chat' })).toBeInTheDocument();
      });
    });
  });

  describe('User Join Functionality', () => {
    beforeEach(async () => {
      render(<App />);
      
      // Simulate connection
      act(() => {
        const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
        connectCallback();
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
      });
    });

    test('should allow user to enter username and join chat', async () => {
      const usernameInput = screen.getByPlaceholderText('Enter your username');
      const joinButton = screen.getByRole('button', { name: 'Join Chat' });

      fireEvent.change(usernameInput, { target: { value: 'TestUser' } });
      fireEvent.click(joinButton);

      expect(mockSocket.emit).toHaveBeenCalledWith('join', 'TestUser');
    });

    test('should not allow joining with empty username', async () => {
      const joinButton = screen.getByRole('button', { name: 'Join Chat' });

      fireEvent.click(joinButton);

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    test('should not allow joining with whitespace-only username', async () => {
      const usernameInput = screen.getByPlaceholderText('Enter your username');
      const joinButton = screen.getByRole('button', { name: 'Join Chat' });

      fireEvent.change(usernameInput, { target: { value: '   ' } });
      fireEvent.click(joinButton);

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    test('should trim username before joining', async () => {
      const usernameInput = screen.getByPlaceholderText('Enter your username');
      const joinButton = screen.getByRole('button', { name: 'Join Chat' });

      fireEvent.change(usernameInput, { target: { value: '  TestUser  ' } });
      fireEvent.click(joinButton);

      expect(mockSocket.emit).toHaveBeenCalledWith('join', 'TestUser');
    });
  });

  describe('Chat Interface', () => {
    beforeEach(async () => {
      render(<App />);
      
      // Simulate connection and join
      act(() => {
        const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
        connectCallback();
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
      });

      // Join chat
      const usernameInput = screen.getByPlaceholderText('Enter your username');
      const joinButton = screen.getByRole('button', { name: 'Join Chat' });
      
      fireEvent.change(usernameInput, { target: { value: 'TestUser' } });
      fireEvent.click(joinButton);
    });

    test('should show chat interface after joining', async () => {
      await waitFor(() => {
        expect(screen.getByText('Real-time Chat')).toBeInTheDocument();
        expect(screen.getByText('Connected')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
      });
    });

    test('should display user join notification', async () => {
      // Simulate user joined event
      act(() => {
        const userJoinedCallback = mockSocket.on.mock.calls.find(call => call[0] === 'userJoined')[1];
        userJoinedCallback({
          username: 'NewUser',
          userId: 'new-user-id',
          timestamp: new Date().toISOString()
        });
      });

      await waitFor(() => {
        expect(screen.getByText('NewUser joined the chat')).toBeInTheDocument();
      });
    });

    test('should display user leave notification', async () => {
      // Simulate user left event
      act(() => {
        const userLeftCallback = mockSocket.on.mock.calls.find(call => call[0] === 'userLeft')[1];
        userLeftCallback({
          username: 'LeavingUser',
          userId: 'leaving-user-id',
          timestamp: new Date().toISOString()
        });
      });

      await waitFor(() => {
        expect(screen.getByText('LeavingUser left the chat')).toBeInTheDocument();
      });
    });

    test('should display new messages', async () => {
      // Simulate new message event
      act(() => {
        const newMessageCallback = mockSocket.on.mock.calls.find(call => call[0] === 'newMessage')[1];
        newMessageCallback({
          id: 'msg-1',
          username: 'OtherUser',
          message: 'Hello everyone!',
          timestamp: new Date().toISOString(),
          userId: 'other-user-id'
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Hello everyone!')).toBeInTheDocument();
        expect(screen.getByText('OtherUser')).toBeInTheDocument();
      });
    });

    test('should allow sending messages', async () => {
      const messageInput = screen.getByPlaceholderText('Type a message...');
      const sendButton = screen.getByRole('button', { name: 'Send' });

      fireEvent.change(messageInput, { target: { value: 'Hello world!' } });
      fireEvent.click(sendButton);

      expect(mockSocket.emit).toHaveBeenCalledWith('sendMessage', { message: 'Hello world!' });
    });

    test('should not send empty messages', async () => {
      const sendButton = screen.getByRole('button', { name: 'Send' });

      fireEvent.click(sendButton);

      expect(mockSocket.emit).not.toHaveBeenCalledWith('sendMessage', expect.any(Object));
    });

    test('should emit typing events when user types', async () => {
      const messageInput = screen.getByPlaceholderText('Type a message...');

      fireEvent.change(messageInput, { target: { value: 'Hello' } });

      expect(mockSocket.emit).toHaveBeenCalledWith('typing', true);
    });

    test('should update online users count', async () => {
      // Simulate users list update
      act(() => {
        const usersListCallback = mockSocket.on.mock.calls.find(call => call[0] === 'usersList')[1];
        usersListCallback(['TestUser', 'OtherUser', 'ThirdUser']);
      });

      await waitFor(() => {
        expect(screen.getByText('3 online')).toBeInTheDocument();
      });
    });

    test('should allow leaving chat', async () => {
      const leaveButton = screen.getByRole('button', { name: 'Leave Chat' });

      fireEvent.click(leaveButton);

      await waitFor(() => {
        expect(screen.getByText('Arghya Chat App')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
      });
    });
  });

  describe('Message Display', () => {
    beforeEach(async () => {
      render(<App />);
      
      // Simulate connection and join
      act(() => {
        const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
        connectCallback();
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
      });

      // Join chat
      const usernameInput = screen.getByPlaceholderText('Enter your username');
      const joinButton = screen.getByRole('button', { name: 'Join Chat' });
      
      fireEvent.change(usernameInput, { target: { value: 'TestUser' } });
      fireEvent.click(joinButton);
    });

    test('should display own messages on the right', async () => {
      // Simulate own message
      act(() => {
        const newMessageCallback = mockSocket.on.mock.calls.find(call => call[0] === 'newMessage')[1];
        newMessageCallback({
          id: 'msg-1',
          username: 'TestUser',
          message: 'My message',
          timestamp: new Date().toISOString(),
          userId: 'test-user-id'
        });
      });

      await waitFor(() => {
        const messageElement = screen.getByText('My message').closest('.message');
        expect(messageElement).toHaveClass('own');
      });
    });

    test('should display other users messages on the left', async () => {
      // Simulate other user's message
      act(() => {
        const newMessageCallback = mockSocket.on.mock.calls.find(call => call[0] === 'newMessage')[1];
        newMessageCallback({
          id: 'msg-1',
          username: 'OtherUser',
          message: 'Other message',
          timestamp: new Date().toISOString(),
          userId: 'other-user-id'
        });
      });

      await waitFor(() => {
        const messageElement = screen.getByText('Other message').closest('.message');
        expect(messageElement).toHaveClass('other');
      });
    });

    test('should display system messages in center', async () => {
      // Simulate system message
      act(() => {
        const userJoinedCallback = mockSocket.on.mock.calls.find(call => call[0] === 'userJoined')[1];
        userJoinedCallback({
          username: 'NewUser',
          userId: 'new-user-id',
          timestamp: new Date().toISOString()
        });
      });

      await waitFor(() => {
        const messageElement = screen.getByText('NewUser joined the chat').closest('.message');
        expect(messageElement).toHaveClass('system');
      });
    });
  });

  describe('Connection Status', () => {
    test('should show disconnected status when connection is lost', async () => {
      render(<App />);
      
      // Simulate connection
      act(() => {
        const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
        connectCallback();
      });

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument();
      });

      // Simulate disconnection
      act(() => {
        const disconnectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')[1];
        disconnectCallback();
      });

      await waitFor(() => {
        expect(screen.getByText('Disconnected')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('should have proper form labels and accessibility', async () => {
      render(<App />);
      
      // Simulate connection
      act(() => {
        const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
        connectCallback();
      });

      await waitFor(() => {
        const usernameInput = screen.getByPlaceholderText('Enter your username');
        const joinButton = screen.getByRole('button', { name: 'Join Chat' });
        
        expect(usernameInput).toBeInTheDocument();
        expect(joinButton).toBeInTheDocument();
        expect(usernameInput).toHaveAttribute('required');
        expect(usernameInput).toHaveAttribute('maxLength', '20');
      });
    });
  });
});
