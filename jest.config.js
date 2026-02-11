module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**',
    '!src/server.ts' // Exclude server startup file from coverage
  ],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/tests/'
  ],
  verbose: true,
  // Prevent real network calls and file system operations during tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  // Increase timeout for integration tests
  testTimeout: 10000
};
