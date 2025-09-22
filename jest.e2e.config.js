module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['<rootDir>/tests/e2e/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.js', '<rootDir>/tests/e2e/setup.docker.js'],
  testTimeout: 30000,
  projects: [
    {
      displayName: 'Chrome',
      preset: 'jest-puppeteer',
      testMatch: ['<rootDir>/tests/e2e/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.js', '<rootDir>/tests/e2e/setup.docker.js'],
      testTimeout: 30000
    }
  ]
};
