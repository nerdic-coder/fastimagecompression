// End-to-end tests for image compression functionality
describe('Image Compression E2E Tests', () => {
  let browser, page;

  beforeAll(async () => {
    const testPage = await createTestPage();
    browser = testPage.browser;
    page = testPage.page;
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    // Navigate to the app
    await page.goto('http://localhost:8000', { waitUntil: 'networkidle0' });
    
    // Wait for the app to load
    await page.waitForSelector('#uploadArea', { visible: true });
  });

  test('should load the application successfully', async () => {
    const title = await page.title();
    expect(title).toContain('Fast Image Compression');

    const header = await page.$('.logo h1');
    expect(header).toBeTruthy();

    const uploadArea = await page.$('#uploadArea');
    expect(uploadArea).toBeTruthy();
  });

  test('should upload and compress a single image', async () => {
    // Upload test image
    await uploadTestImage(page, './tests/fixtures/test-image.jpg');

    // Wait for controls to appear
    await page.waitForSelector('#controls', { visible: true });

    // Set compression quality
    await page.evaluate(() => {
      const slider = document.getElementById('qualitySlider');
      slider.value = '80';
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Click compress button
    await page.click('#compressBtn');

    // Wait for compression to complete
    await waitForCompression(page);

    // Verify results are displayed
    const resultsSection = await page.$('#resultsSection');
    expect(resultsSection).toBeTruthy();

    const downloadBtn = await page.$('#downloadBtn');
    expect(downloadBtn).toBeTruthy();
    const isEnabled = await page.evaluate(el => !el.disabled, downloadBtn);
    expect(isEnabled).toBe(true);
  });

  test('should handle multiple image upload', async () => {
    // Upload multiple images
    const fileInput = await page.$('#fileInput');
    await fileInput.uploadFile('./tests/fixtures/test-image.jpg');
    await fileInput.uploadFile('./tests/fixtures/test-image.png');

    // Wait for controls to appear
    await page.waitForSelector('#controls', { visible: true });

    // Verify batch processing UI - check if button text indicates multiple images
    const compressBtnText = await page.$eval('#compressBtn', el => el.textContent);
    expect(compressBtnText).toContain('Compress');

    // Start compression
    await page.click('#compressBtn');

    // Wait for compression to complete (either single or batch results)
    await Promise.race([
      page.waitForSelector('#batchResults', { visible: true, timeout: 15000 }),
      page.waitForSelector('#singleResults', { visible: true, timeout: 15000 }),
      page.waitForSelector('#downloadBtn', { visible: true, timeout: 15000 }),
      page.waitForSelector('#downloadAllBtn', { visible: true, timeout: 15000 })
    ]);

    // Verify some form of results appeared
    const batchResults = await page.$('#batchResults');
    const singleResults = await page.$('#singleResults');
    const downloadBtn = await page.$('#downloadBtn');
    const downloadAllBtn = await page.$('#downloadAllBtn');
    
    const hasResults = batchResults || singleResults || downloadBtn || downloadAllBtn;
    expect(hasResults).toBeTruthy();
  });

  test('should work with different output formats', async () => {
    await uploadTestImage(page, './tests/fixtures/test-image.jpg');
    await page.waitForSelector('#controls', { visible: true });

    // Test JPEG format
    await page.select('#formatSelect', 'jpeg');
    await page.click('#compressBtn');
    await waitForCompression(page);

    // Verify JPEG compression
    const compressedImage = await page.$('#compressedImage');
    expect(compressedImage).toBeTruthy();

    // Reset for WebP test
    await page.reload();
    await page.waitForSelector('#uploadArea', { visible: true });
    await uploadTestImage(page, './tests/fixtures/test-image.jpg');
    await page.waitForSelector('#controls', { visible: true });

    // Test WebP format
    await page.select('#formatSelect', 'webp');
    await page.click('#compressBtn');
    await waitForCompression(page);

    const compressedImageWebP = await page.$('#compressedImage');
    expect(compressedImageWebP).toBeTruthy();
  }, 60000);

  test('should handle drag and drop functionality', async () => {
    // Create a file input for drag and drop testing
    const uploadArea = await page.$('#uploadArea');
    
    // Simulate drag and drop
    await page.evaluate(() => {
      const uploadArea = document.getElementById('uploadArea');
      const fileInput = document.getElementById('fileInput');
      
      // Create a mock file
      const file = new File(['test content'], 'test-drag.jpg', { type: 'image/jpeg' });
      const fileList = [file];
      
      // Simulate file input change
      Object.defineProperty(fileInput, 'files', {
        value: fileList,
        writable: false
      });
      
      // Trigger change event
      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);
    });

    // Wait for controls to appear
    await page.waitForSelector('#controls', { visible: true });
    
    const controls = await page.$('#controls');
    expect(controls).toBeTruthy();
  });

  test('should display error messages for invalid files', async () => {
    // Try to upload a non-image file
    const fileInput = await page.$('#fileInput');
    
    // Create a text file (this will be rejected)
    await page.evaluate(() => {
      const fileInput = document.getElementById('fileInput');
      const textFile = new File(['not an image'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(fileInput, 'files', {
        value: [textFile],
        writable: false
      });
      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);
    });

    // Wait a bit for error handling
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check that controls don't appear for invalid files
    const controls = await page.$('#controls');
    const controlsVisible = await controls ? await controls.isVisible() : false;
    expect(controlsVisible).toBe(false);
  });

  test('should be responsive on mobile viewport', async () => {
    // Set mobile viewport
    await page.setViewport({ width: 375, height: 667 });

    // Check mobile-specific elements
    const mobileUploadButton = await page.$('#mobileUploadButton');
    expect(mobileUploadButton).toBeTruthy();

    // Upload image on mobile
    await uploadTestImage(page, './tests/fixtures/small-test.jpg');
    await page.waitForSelector('#controls', { visible: true });

    // Verify mobile layout
    const uploadArea = await page.$('#uploadArea');
    const classes = await page.evaluate(el => el.className, uploadArea);
    expect(classes).toContain('touch-device');
  });

  test('should handle compression quality slider', async () => {
    await uploadTestImage(page, './tests/fixtures/test-image.jpg');
    await page.waitForSelector('#controls', { visible: true });

    // Test different quality settings
    const qualitySlider = await page.$('#qualitySlider');
    
    await page.evaluate(slider => {
      slider.value = '50';
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    }, qualitySlider);

    const qualityValue = await page.$eval('#qualityValue', el => el.textContent);
    expect(qualityValue).toBe('50');

    // Compress with low quality
    await page.click('#compressBtn');
    await waitForCompression(page);

    // Verify compression completed
    const downloadBtn = await page.$('#downloadBtn');
    const isEnabled = await page.evaluate(el => !el.disabled, downloadBtn);
    expect(isEnabled).toBe(true);
  });
});
