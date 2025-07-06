# Testing Documentation

This document provides comprehensive information about the testing setup for the Chat Application.

## 🧪 Test Structure

### Frontend Tests (React)
- **Location**: `client/src/`
- **Framework**: Jest + React Testing Library
- **Main Test File**: `App.test.js`
- **Setup File**: `setupTests.js`
- **Utilities**: `utils/testUtils.js`

### Backend Tests (Node.js)
- **Location**: `server/`
- **Framework**: Jest + Supertest + Socket.IO Client
- **Main Test File**: `server.test.js`
- **Config**: `jest.config.js`

## 🚀 Running Tests

### Frontend Tests
```bash
cd client
npm test
```

### Backend Tests
```bash
cd server
npm test
```

### All Tests (from root)
```bash
# Frontend tests
cd client && npm test

# Backend tests (in another terminal)
cd server && npm test
```

### Test Commands

#### Frontend (client directory)
```bash
npm test              # Run tests in watch mode
npm test -- --coverage # Run tests with coverage report
npm test -- --verbose  # Run tests with verbose output
npm test -- --runInBand # Run tests sequentially
```

#### Backend (server directory)
```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## 📋 Test Coverage

### Frontend Test Coverage

#### Component Tests
- ✅ **Initial Render and Connection**
  - Connection status display
  - Socket connection establishment
  - Join form display

- ✅ **User Join Functionality**
  - Username validation
  - Join event emission
  - Form submission handling

- ✅ **Chat Interface**
  - Chat UI display
  - Message sending/receiving
  - User notifications
  - Typing indicators
  - Online users count

- ✅ **Message Display**
  - Own vs other messages
  - System messages
  - Timestamps
  - Message alignment

- ✅ **Connection Status**
  - Connected/disconnected states
  - Status indicators

- ✅ **Error Handling**
  - Socket connection errors
  - Graceful error handling

- ✅ **Accessibility**
  - Form labels
  - Button states
  - Keyboard navigation

#### Mock Coverage
- ✅ Socket.IO client mocking
- ✅ Browser APIs (matchMedia, ResizeObserver)
- ✅ DOM methods (scrollIntoView)

### Backend Test Coverage

#### HTTP Endpoints
- ✅ Server status endpoint
- ✅ Users list endpoint
- ✅ CORS configuration

#### Socket.IO Events
- ✅ Connection handling
- ✅ User join/leave events
- ✅ Message broadcasting
- ✅ Typing indicators
- ✅ User management

#### Error Handling
- ✅ Invalid data handling
- ✅ Missing data handling
- ✅ Server shutdown

#### Performance
- ✅ Multiple concurrent users
- ✅ Rapid message handling
- ✅ Message formatting

## 🛠️ Test Utilities

### Frontend Utilities (`client/src/utils/testUtils.js`)

```javascript
// Wait for condition
await waitForCondition(() => element.isVisible(), 5000);

// Simulate socket events
simulateSocketEvent(mockSocket, 'newMessage', messageData);

// Create mock data
const message = createMockMessage('User', 'Hello', 'user-id');
const joinData = createMockUserJoin('User', 'user-id');
const typingData = createMockTyping('User', true);

// Wait for element
const element = await waitForElement(() => screen.getByText('Hello'));

// Mock timers
withMockedTimers(() => {
  // Test timeout behavior
});

// Create custom mock socket
const customSocket = createMockSocket({
  id: 'custom-id',
  emit: jest.fn().mockReturnValue(true)
});
```

### Backend Utilities

```javascript
// Test HTTP endpoints
const response = await request(app)
  .get('/')
  .expect(200);

// Test Socket.IO events
clientSocket.emit('join', 'username');
clientSocket.on('userJoined', (data) => {
  expect(data.username).toBe('username');
});
```

## 🔧 Test Configuration

### Frontend Jest Configuration
- **Environment**: jsdom
- **Setup**: `setupTests.js`
- **Coverage**: Enabled
- **Watch**: Enabled by default

### Backend Jest Configuration
- **Environment**: node
- **Timeout**: 10 seconds
- **Coverage**: HTML, LCOV, text reports
- **Force Exit**: Enabled for cleanup

## 📊 Coverage Reports

### Frontend Coverage
- **Location**: `client/coverage/`
- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Report**: `coverage/lcov.info`

### Backend Coverage
- **Location**: `server/coverage/`
- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Report**: `coverage/lcov.info`

## 🧪 Writing New Tests

### Frontend Test Example

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('New Feature', () => {
  test('should handle new functionality', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Test implementation
    const button = screen.getByRole('button', { name: 'New Button' });
    await user.click(button);
    
    expect(screen.getByText('Expected Result')).toBeInTheDocument();
  });
});
```

### Backend Test Example

```javascript
describe('New Endpoint', () => {
  test('should handle new endpoint', async () => {
    const response = await request(app)
      .post('/new-endpoint')
      .send({ data: 'test' })
      .expect(200);
    
    expect(response.body).toEqual({ success: true });
  });
});
```

## 🐛 Debugging Tests

### Frontend Debugging
```bash
# Run specific test file
npm test App.test.js

# Run specific test
npm test -- -t "should handle user join"

# Debug mode
npm test -- --debug
```

### Backend Debugging
```bash
# Run specific test file
npm test server.test.js

# Run specific test
npm test -- -t "should handle user join"

# Verbose output
npm test -- --verbose
```

## 📝 Best Practices

### Frontend Testing
1. **Use React Testing Library** for component testing
2. **Test user interactions** rather than implementation details
3. **Mock external dependencies** (Socket.IO, APIs)
4. **Use semantic queries** (getByRole, getByText)
5. **Test accessibility** features
6. **Use async/await** for asynchronous operations

### Backend Testing
1. **Test HTTP endpoints** with Supertest
2. **Test Socket.IO events** with Socket.IO Client
3. **Mock external services** when needed
4. **Test error conditions** and edge cases
5. **Use proper cleanup** in afterEach/afterAll
6. **Test performance** with multiple concurrent users

### General Testing
1. **Write descriptive test names**
2. **Use proper test organization** (describe blocks)
3. **Keep tests independent** and isolated
4. **Use meaningful assertions**
5. **Maintain good test coverage**
6. **Run tests before committing**

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd client && npm install
          cd ../server && npm install
      - name: Run frontend tests
        run: cd client && npm test -- --coverage --watchAll=false
      - name: Run backend tests
        run: cd server && npm test -- --coverage
```

## 📈 Performance Testing

### Frontend Performance
- Test component rendering performance
- Test large message lists
- Test typing indicator performance

### Backend Performance
- Test multiple concurrent users
- Test rapid message sending
- Test memory usage under load

## 🎯 Test Goals

- **Coverage Target**: >90% for critical paths
- **Performance**: Tests should run quickly (<30s total)
- **Reliability**: Tests should be deterministic
- **Maintainability**: Tests should be easy to understand and modify

## 🚨 Common Issues

### Frontend Issues
1. **Socket.IO mocking**: Ensure proper mock setup
2. **Async operations**: Use proper waitFor and act
3. **Component state**: Test state changes properly

### Backend Issues
1. **Port conflicts**: Use different ports for tests
2. **Socket cleanup**: Ensure proper disconnection
3. **Test isolation**: Reset state between tests

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Socket.IO Testing](https://socket.io/docs/v4/testing/) 