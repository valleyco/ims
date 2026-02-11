/**
 * Jest Test Setup
 * Sets environment variables for testing
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.IMS_API_TOKEN = 'test-token-12345';
process.env.PORT = '3099'; // Different port for tests

console.log('🧪 Test environment initialized');
