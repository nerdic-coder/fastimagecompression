// Simplified E2E tests for Docker environment
describe('Image Compression E2E Tests (Docker)', () => {
  let browser, page;

  beforeAll(async () => {
    console.log('Starting E2E tests in Docker environment');
    global.logMemoryUsage();
    
    const testPage = await createTestPage();
    browser = testPage.browser;
    page = testPage.page;
  });

  afterAll(async () => {
    console.log('Cleaning up E2E tests');
    await cleanupTest(browser);
    global.logMemoryUsage();
  });

  beforeEach(async () => {
    // Navigate to the app
    const serverUrl = process.env.TEST_SERVER_URL || 'http://localhost:8000';
    await page.goto(serverUrl, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for the app to load
    await page.waitForSelector('#uploadArea', { visible: true, timeout: 10000 });
  });

  test('should load the application successfully', async () => {
    const title = await page.title();
    expect(title).toContain('Fast Image Compression');

    const header = await page.$('.logo h1');
    expect(header).toBeTruthy();

    const uploadArea = await page.$('#uploadArea');
    expect(uploadArea).toBeTruthy();
    
    console.log('✓ Application loaded successfully');
  });

  test('should upload and compress a single image', async () => {
    console.log('Starting single image compression test');
    
    // Upload test image
    await uploadTestImage(page, './tests/fixtures/test-image.jpg');

    // Wait for controls to appear
    await page.waitForSelector('#controls', { visible: true, timeout: 10000 });

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
    expect(await downloadBtn.isEnabled()).toBe(true);
    
    console.log('✓ Single image compression completed');
  });

  test('should handle file upload click', async () => {
    console.log('Testing file upload click functionality');
    
    // Click the upload area
    await page.click('#uploadArea');
    
    // Wait a moment for any file picker to appear
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if controls appeared (indicating file was selected)
    // This test mainly verifies the click doesn't crash the app
    const uploadArea = await page.$('#uploadArea');
    expect(uploadArea).toBeTruthy();
    
    console.log('✓ File upload click handled without errors');
  });

  test('should display compression controls after file selection', async () => {
    console.log('Testing controls display after file selection');
    
    // Upload test image
    await uploadTestImage(page, './tests/fixtures/test-image.jpg');

    // Wait for controls to appear
    await page.waitForSelector('#controls', { visible: true, timeout: 10000 });
    
    // Verify control elements exist
    const qualitySlider = await page.$('#qualitySlider');
    expect(qualitySlider).toBeTruthy();
    
    const formatSelect = await page.$('#formatSelect');
    expect(formatSelect).toBeTruthy();
    
    const compressBtn = await page.$('#compressBtn');
    expect(compressBtn).toBeTruthy();
    
    console.log('✓ Compression controls displayed correctly');
  });

  test('should handle compression quality slider', async () => {
    console.log('Testing quality slider functionality');
    
    await uploadTestImage(page, './tests/fixtures/test-image.jpg');
    await page.waitForSelector('#controls', { visible: true, timeout: 10000 });

    // Test different quality settings
    const qualitySlider = await page.$('#qualitySlider');
    
    await page.evaluate(slider => {
      slider.value = '50';
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    }, qualitySlider);

    const qualityValue = await page.$eval('#qualityValue', el => el.textContent);
    expect(qualityValue).toBe('50');
    
    console.log('✓ Quality slider working correctly');
  });

  test('should be responsive on mobile viewport', async () => {
    console.log('Testing mobile responsiveness');
    
    // Set mobile viewport
    await page.setViewport({ width: 375, height: 667 });

    // Check that upload area is still visible
    const uploadArea = await page.$('#uploadArea');
    expect(uploadArea).toBeTruthy();
    
    // Check mobile-specific styling
    const uploadAreaVisible = await uploadArea.isVisible();
    expect(uploadAreaVisible).toBe(true);
    
    console.log('✓ Mobile responsiveness working');
  });
});

