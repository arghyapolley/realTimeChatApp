import { act } from '@testing-library/react';

/**
 * Utility function to wait for a specific condition
 * @param {Function} condition - Function that returns true when condition is met
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise} Promise that resolves when condition is met
 */
export const waitForCondition = (condition, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkCondition = () => {
      try {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Condition not met within timeout'));
        } else {
          setTimeout(checkCondition, 50);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    checkCondition();
  });
};

/**
 * Utility function to simulate socket events
 * @param {Object} mockSocket - Mock socket instance
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const simulateSocketEvent = (mockSocket, event, data) => {
  act(() => {
    const callback = mockSocket.on.mock.calls.find(call => call[0] === event)?.[1];
    if (callback) {
      callback(data);
    }
  });
};

/**
 * Utility function to create mock message data
 * @param {string} username - Username
 * @param {string} message - Message content
 * @param {string} userId - User ID
 * @returns {Object} Mock message object
 */
export const createMockMessage = (username, message, userId = 'test-user-id') => ({
  id: Date.now() + Math.random(),
  username,
  message,
  timestamp: new Date().toISOString(),
  userId
});

/**
 * Utility function to create mock user join data
 * @param {string} username - Username
 * @param {string} userId - User ID
 * @returns {Object} Mock user join object
 */
export const createMockUserJoin = (username, userId = 'test-user-id') => ({
  username,
  userId,
  timestamp: new Date().toISOString()
});

/**
 * Utility function to create mock typing data
 * @param {string} username - Username
 * @param {boolean} isTyping - Typing status
 * @returns {Object} Mock typing object
 */
export const createMockTyping = (username, isTyping) => ({
  username,
  isTyping
});

/**
 * Utility function to wait for element to be present
 * @param {Function} getElement - Function to get element
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Element>} Promise that resolves with the element
 */
export const waitForElement = (getElement, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkElement = () => {
      try {
        const element = getElement();
        if (element) {
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Element not found within timeout'));
        } else {
          setTimeout(checkElement, 50);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    checkElement();
  });
};

/**
 * Utility function to mock timers for testing timeouts
 * @param {Function} testFn - Test function to run with mocked timers
 */
export const withMockedTimers = (testFn) => {
  jest.useFakeTimers();
  
  try {
    testFn();
  } finally {
    jest.useRealTimers();
  }
};

/**
 * Utility function to create a mock socket with specific behavior
 * @param {Object} overrides - Override default mock behavior
 * @returns {Object} Mock socket instance
 */
export const createMockSocket = (overrides = {}) => {
  const defaultMock = {
    on: jest.fn(),
    emit: jest.fn(),
    close: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    id: 'test-socket-id'
  };
  
  return { ...defaultMock, ...overrides };
}; 