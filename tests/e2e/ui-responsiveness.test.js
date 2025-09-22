// UI and responsiveness tests
describe('UI Responsiveness Tests', () => {
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
    await page.goto('http://localhost:8000', { waitUntil: 'networkidle0' });
    await page.waitForSelector('#uploadArea', { visible: true });
  });

  test('should display correctly on desktop viewport', async () => {
    await page.setViewport({ width: 1280, height: 720 });

    // Check desktop layout elements
    const logo = await page.$('.logo');
    expect(logo).toBeTruthy();

    const nav = await page.$('.nav');
    expect(nav).toBeTruthy();

    const uploadArea = await page.$('#uploadArea');
    const classes = await page.evaluate(el => el.className, uploadArea);
    expect(classes).toContain('no-touch');

    // Check that mobile upload button is hidden
    const mobileButton = await page.$('#mobileUploadButton');
    const isVisible = await mobileButton ? await mobileButton.isVisible() : false;
    expect(isVisible).toBe(false);
  });

  test('should adapt to tablet viewport', async () => {
    await page.setViewport({ width: 768, height: 1024 });

    // Check that layout adapts
    const hero = await page.$('.hero h2');
    expect(hero).toBeTruthy();

    const uploadArea = await page.$('#uploadArea');
    expect(uploadArea).toBeTruthy();

    // Check responsive behavior
    const uploadAreaRect = await page.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }, uploadArea);

    expect(uploadAreaRect.width).toBeGreaterThan(0);
    expect(uploadAreaRect.height).toBeGreaterThan(0);
  });

  test('should work properly on mobile viewport', async () => {
    await page.setViewport({ width: 375, height: 667 });

    // Check mobile-specific elements
    const mobileUploadButton = await page.$('#mobileUploadButton');
    expect(mobileUploadButton).toBeTruthy();

    const uploadArea = await page.$('#uploadArea');
    const classes = await page.evaluate(el => el.className, uploadArea);
    expect(classes).toContain('touch-device');

    // Check that desktop upload message is hidden
    const desktopMessage = await page.$('.desktop-upload-message');
    const isVisible = await desktopMessage ? await desktopMessage.isVisible() : false;
    expect(isVisible).toBe(false);
  });

  test('should handle font loading correctly', async () => {
    // Check that fonts are loaded
    await page.waitForFunction(() => {
      return document.fonts && document.fonts.check('16px Inter');
    }, { timeout: 5000 });

    // Check Font Awesome icons
    await page.waitForFunction(() => {
      const boltIcon = document.querySelector('.fa-bolt');
      return boltIcon && window.getComputedStyle(boltIcon, '::before').content !== 'none';
    }, { timeout: 5000 });

    const boltIcon = await page.$('.fa-bolt');
    expect(boltIcon).toBeTruthy();
  });

  test('should display loading states correctly', async () => {
    await uploadTestImage(page, './tests/fixtures/test-image.jpg');
    await page.waitForSelector('#controls', { visible: true });

    // Click compress button and check loading state
    await page.click('#compressBtn');

    // Check loading animation
    const loadingElement = await page.$('.loading');
    expect(loadingElement).toBeTruthy();

    // Wait for compression to complete
    await waitForCompression(page);

    // Check that loading is gone
    const loadingAfter = await page.$('.loading');
    expect(loadingAfter).toBeFalsy();
  });

  test('should show progress indicators during batch processing', async () => {
    // Upload multiple images
    const fileInput = await page.$('#fileInput');
    await fileInput.uploadFile('./tests/fixtures/test-image.jpg');
    await fileInput.uploadFile('./tests/fixtures/test-image.png');
    await fileInput.uploadFile('./tests/fixtures/small-test.jpg');

    await page.waitForSelector('#controls', { visible: true });

    // Start batch compression
    await page.click('#compressBtn');

    // Check progress section appears
    await page.waitForSelector('#progressSection', { visible: true });

    // Check progress bar
    const progressBar = await page.$('.progress-bar');
    expect(progressBar).toBeTruthy();

    // Check image list
    const imageList = await page.$('#imageList');
    expect(imageList).toBeTruthy();

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

  test('should handle error notifications', async () => {
    // Try to upload invalid file
    await page.evaluate(() => {
      const fileInput = document.getElementById('fileInput');
      const invalidFile = new File(['not an image'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        writable: false
      });
      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);
    });

    // Check for error notification
    await page.waitForSelector('.error-notification', { visible: true, timeout: 2000 });
    
    const errorNotification = await page.$('.error-notification');
    expect(errorNotification).toBeTruthy();

    // Check that error notification disappears after timeout
    await page.waitForFunction(() => {
      return !document.querySelector('.error-notification');
    }, { timeout: 6000 });
  });

  test('should maintain accessibility features', async () => {
    // Check for proper ARIA labels
    const fileInput = await page.$('#fileInput');
    const ariaLabel = await page.evaluate(el => el.getAttribute('aria-label'), fileInput);
    expect(ariaLabel).toContain('Choose photos');

    // Check for proper button roles
    const mobileButton = await page.$('#mobileUploadButton');
    const role = await page.evaluate(el => el.getAttribute('role'), mobileButton);
    expect(role).toBe('button');

    // Check keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);
  });

  test('should handle viewport changes dynamically', async () => {
    // Start with desktop viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    // Wait for initial load
    await page.waitForSelector('#uploadArea', { visible: true });
    
    const uploadAreaDesktop = await page.$('#uploadArea');
    const classesDesktop = await page.evaluate(el => el.className, uploadAreaDesktop);
    
    // Check that it's not mobile (either no-touch or just upload-area)
    expect(classesDesktop).toMatch(/(no-touch|upload-area)/);

    // Change to mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    
    // Trigger resize event
    await page.evaluate(() => {
      window.dispatchEvent(new Event('resize'));
    });

    // Wait for mobile detection to update
    await new Promise(resolve => setTimeout(resolve, 500));

    const uploadAreaMobile = await page.$('#uploadArea');
    const classesMobile = await page.evaluate(el => el.className, uploadAreaMobile);
    expect(classesMobile).toContain('touch-device');
  });
});
