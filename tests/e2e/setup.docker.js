// Safer E2E test setup for Docker
const puppeteer = require('puppeteer');

// Global test utilities
global.createTestPage = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection',
      '--memory-pressure-off',
      '--max_old_space_size=2048' // Reduced memory limit
    ]
  });

  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1280, height: 720 });
  
  // Set longer timeouts for Docker environment
  page.setDefaultTimeout(30000);
  page.setDefaultNavigationTimeout(30000);

  return { browser, page };
};

// Helper function to upload test image
global.uploadTestImage = async (page, imagePath) => {
  const fileInput = await page.$('#fileInput');
  if (!fileInput) {
    throw new Error('File input not found');
  }
  
  await fileInput.uploadFile(imagePath);
  
  // Wait for file processing
  await page.waitForTimeout(1000);
};

// Helper function to wait for compression to complete
global.waitForCompression = async (page) => {
  try {
    // Wait for either single results or batch results
    await Promise.race([
      page.waitForSelector('#resultsSection', { visible: true, timeout: 30000 }),
      page.waitForSelector('#batchResults', { visible: true, timeout: 30000 })
    ]);
  } catch (error) {
    console.log('Compression timeout - checking for error messages');
    // Check if there's an error notification
    const errorNotification = await page.$('.error-notification');
    if (errorNotification) {
      const errorText = await page.evaluate(el => el.textContent, errorNotification);
      throw new Error(`Compression failed: ${errorText}`);
    }
    throw error;
  }
};

// Cleanup function
global.cleanupTest = async (browser) => {
  if (browser) {
    try {
      await browser.close();
    } catch (error) {
      console.log('Browser cleanup error:', error.message);
    }
  }
};

// Memory monitoring
global.logMemoryUsage = () => {
  const used = process.memoryUsage();
  console.log('Memory usage:', {
    rss: `${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`,
    external: `${Math.round(used.external / 1024 / 1024 * 100) / 100} MB`
  });
};

// Memory logging removed to prevent Jest "Cannot log after tests are done" error

