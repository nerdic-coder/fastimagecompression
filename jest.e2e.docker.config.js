// Safer Jest E2E configuration for Docker
module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['<rootDir>/tests/e2e/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.js'],
  testTimeout: 60000, // Increased timeout for Docker
  collectCoverage: false,
  verbose: true,
  maxWorkers: 1, // Limit to single worker to prevent resource issues
  projects: [
    {
      displayName: 'Chrome-Docker',
      preset: 'jest-puppeteer',
      testMatch: ['<rootDir>/tests/e2e/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.js'],
      testTimeout: 60000,
      collectCoverage: false,
      verbose: true,
      launch: {
        headless: true, // Always headless in Docker
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage', // Prevent /dev/shm issues
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process', // Single process mode
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--memory-pressure-off',
          '--max_old_space_size=4096' // Limit memory usage
        ]
      },
      server: {
        command: 'npm run serve',
        port: 8000,
        launchTimeout: 30000,
        debug: true
      }
    }
  ]
};

