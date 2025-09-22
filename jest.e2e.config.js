module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['<rootDir>/tests/e2e/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.js'],
  testTimeout: 30000,
  collectCoverage: false,
  verbose: true,
  projects: [
    {
      displayName: 'Chrome',
      preset: 'jest-puppeteer',
      testMatch: ['<rootDir>/tests/e2e/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.js'],
      testTimeout: 30000,
      collectCoverage: false,
      verbose: true,
      launch: {
        headless: process.env.CI === 'true',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    }
  ]
};
