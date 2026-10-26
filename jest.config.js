module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testTimeout: 30000,
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/test_scripts/'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  moduleNameMapper: {
    '^uuid$': '<rootDir>/tests/__mocks__/uuid.js'
  }
};

