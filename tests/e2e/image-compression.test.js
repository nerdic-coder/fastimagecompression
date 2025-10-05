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
    console.log('Reloading page for WebP test...');
    await page.reload();
    await page.waitForSelector('#uploadArea', { visible: true });
    
    // Wait a bit for the page to fully load after reload
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Upload test image again
    console.log('Uploading test image for WebP test...');
    await uploadTestImage(page, './tests/fixtures/test-image.jpg');
    
    console.log('Waiting for controls to appear...');
    // Wait for controls with longer timeout
    await page.waitForSelector('#controls', { visible: true, timeout: 10000 });

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

  test('should toggle FAQ section visibility properly', async () => {
    // Wait for FAQ section to load
    await page.waitForSelector('.faq-section', { visible: true });
    
    // Check that FAQ section exists
    const faqSection = await page.$('.faq-section');
    expect(faqSection).toBeTruthy();

    // Get all FAQ questions
    const faqQuestions = await page.$$('.faq-question');
    expect(faqQuestions.length).toBeGreaterThan(0);

    // Test first FAQ question
    const firstQuestion = faqQuestions[0];
    const firstAnswer = await page.$('#faq-answer-1');
    
    // Initially, the answer should be hidden
    const initialDisplay = await page.evaluate(el => {
      return window.getComputedStyle(el).display;
    }, firstAnswer);
    expect(initialDisplay).toBe('none');

    // Click the first question
    await firstQuestion.click();
    
    // Wait a bit for the toggle to complete
    await new Promise(r => setTimeout(r, 100));

    // Check that the answer is now visible
    const expandedDisplay = await page.evaluate(el => {
      return window.getComputedStyle(el).display;
    }, firstAnswer);
    expect(expandedDisplay).toBe('block');

    // Check that aria-expanded is set to true
    const ariaExpanded = await page.evaluate(el => {
      return el.getAttribute('aria-expanded');
    }, firstQuestion);
    expect(ariaExpanded).toBe('true');

    // Check that the answer has the active class
    const hasActiveClass = await page.evaluate(el => {
      return el.classList.contains('active');
    }, firstAnswer);
    expect(hasActiveClass).toBe(true);

    // Click the question again to close it
    await firstQuestion.click();
    await new Promise(r => setTimeout(r, 100));

    // Check that the answer is hidden again
    const closedDisplay = await page.evaluate(el => {
      return window.getComputedStyle(el).display;
    }, firstAnswer);
    expect(closedDisplay).toBe('none');

    // Check that aria-expanded is set to false
    const ariaExpandedClosed = await page.evaluate(el => {
      return el.getAttribute('aria-expanded');
    }, firstQuestion);
    expect(ariaExpandedClosed).toBe('false');

    // Check that the answer no longer has the active class
    const hasActiveClassClosed = await page.evaluate(el => {
      return el.classList.contains('active');
    }, firstAnswer);
    expect(hasActiveClassClosed).toBe(false);
  });

  test('should ensure only one FAQ item is open at a time', async () => {
    // Wait for FAQ section to load
    await page.waitForSelector('.faq-section', { visible: true });
    
    // Get FAQ questions
    const faqQuestions = await page.$$('.faq-question');
    expect(faqQuestions.length).toBeGreaterThan(1);

    // Click first question
    await faqQuestions[0].click();
    await new Promise(r => setTimeout(r, 100));

    // Verify first answer is open
    const firstAnswer = await page.$('#faq-answer-1');
    const firstAnswerDisplay = await page.evaluate(el => {
      return window.getComputedStyle(el).display;
    }, firstAnswer);
    expect(firstAnswerDisplay).toBe('block');

    // Click second question
    await faqQuestions[1].click();
    await new Promise(r => setTimeout(r, 100));

    // Verify first answer is now closed
    const firstAnswerDisplayAfter = await page.evaluate(el => {
      return window.getComputedStyle(el).display;
    }, firstAnswer);
    expect(firstAnswerDisplayAfter).toBe('none');

    // Verify second answer is open
    const secondAnswer = await page.$('#faq-answer-2');
    const secondAnswerDisplay = await page.evaluate(el => {
      return window.getComputedStyle(el).display;
    }, secondAnswer);
    expect(secondAnswerDisplay).toBe('block');
  });

  test('should support keyboard navigation for FAQ', async () => {
    // Wait for FAQ section to load
    await page.waitForSelector('.faq-section', { visible: true });
    
    // Get first FAQ question
    const firstQuestion = await page.$('.faq-question');
    const firstAnswer = await page.$('#faq-answer-1');
    
    // Focus on the first question
    await firstQuestion.focus();
    
    // Press Enter key
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 100));

    // Check that the answer is visible
    const answerDisplay = await page.evaluate(el => {
      return window.getComputedStyle(el).display;
    }, firstAnswer);
    expect(answerDisplay).toBe('block');

    // Press Enter again to close
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 100));

    // Check that the answer is hidden
    const answerDisplayClosed = await page.evaluate(el => {
      return window.getComputedStyle(el).display;
    }, firstAnswer);
    expect(answerDisplayClosed).toBe('none');
  });

  test('should have proper FAQ content and structure', async () => {
    // Wait for FAQ section to load
    await page.waitForSelector('.faq-section', { visible: true });
    
    // Check FAQ title
    const faqTitle = await page.$('#faq-title');
    expect(faqTitle).toBeTruthy();
    
    const titleText = await page.evaluate(el => el.textContent, faqTitle);
    expect(titleText).toBe('Frequently Asked Questions');

    // Check that we have FAQ questions
    const faqQuestions = await page.$$('.faq-question');
    expect(faqQuestions.length).toBe(10); // We have 10 FAQ questions

    // Check that each question has proper structure
    for (let i = 0; i < faqQuestions.length; i++) {
      const question = faqQuestions[i];
      const answer = await page.$(`#faq-answer-${i + 1}`);
      
      // Check aria-expanded attribute
      const ariaExpanded = await page.evaluate(el => {
        return el.getAttribute('aria-expanded');
      }, question);
      expect(ariaExpanded).toBe('false');

      // Check aria-controls attribute
      const ariaControls = await page.evaluate(el => {
        return el.getAttribute('aria-controls');
      }, question);
      expect(ariaControls).toBe(`faq-answer-${i + 1}`);

      // Check that answer exists
      expect(answer).toBeTruthy();
    }
  });
});
