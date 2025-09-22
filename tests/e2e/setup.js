// E2E test setup for Puppeteer
const puppeteer = require('puppeteer');

// Global test timeout
jest.setTimeout(30000);

// Setup before all tests
beforeAll(async () => {
  // Set up any global configurations here
});

// Cleanup after all tests
afterAll(async () => {
  // Cleanup any global resources here
});

// Setup before each test
beforeEach(async () => {
  // Reset any global state before each test
});

// Cleanup after each test
afterEach(async () => {
  // Cleanup after each test
});

// Helper function to create a new page with common setup
global.createTestPage = async () => {
  const browser = await puppeteer.launch({
    headless: process.env.CI === 'true',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set viewport for consistent testing
  await page.setViewport({ width: 1280, height: 720 });
  
  // Enable request interception for faster tests
  await page.setRequestInterception(true);
  
  // Block unnecessary resources to speed up tests
  page.on('request', (request) => {
    const resourceType = request.resourceType();
    if (['image', 'font', 'media'].includes(resourceType)) {
      request.continue();
    } else {
      request.continue();
    }
  });
  
  return { browser, page };
};

// Helper function to wait for image compression to complete
global.waitForCompression = async (page) => {
  await page.waitForSelector('.results-section', { visible: true, timeout: 10000 });
  await page.waitForFunction(() => {
    const downloadBtn = document.querySelector('#downloadBtn');
    return downloadBtn && !downloadBtn.disabled;
  }, { timeout: 10000 });
};

// Helper function to upload test image
global.uploadTestImage = async (page, imagePath) => {
  const fileInput = await page.$('#fileInput');
  if (!fileInput) {
    throw new Error('File input not found');
  }
  
  await fileInput.uploadFile(imagePath);
  
  // Wait for file processing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Wait for controls to appear with longer timeout
  await page.waitForSelector('#controls', { visible: true, timeout: 10000 });
};
