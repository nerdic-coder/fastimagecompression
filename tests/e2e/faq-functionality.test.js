// End-to-end tests for FAQ functionality
describe('FAQ Functionality E2E Tests', () => {
  let browser, page;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
    
    // Wait for the FAQ section to load
    await page.waitForSelector('.faq-section', { visible: true });
  });

  test('should load FAQ section with proper structure', async () => {
    // Check FAQ section exists
    const faqSection = await page.$('.faq-section');
    expect(faqSection).toBeTruthy();

    // Check FAQ title
    const faqTitle = await page.$('#faq-title');
    expect(faqTitle).toBeTruthy();
    
    const titleText = await page.evaluate(el => el.textContent, faqTitle);
    expect(titleText).toBe('Frequently Asked Questions');

    // Check FAQ container
    const faqContainer = await page.$('.faq-container');
    expect(faqContainer).toBeTruthy();

    // Check that we have FAQ questions
    const faqQuestions = await page.$$('.faq-question');
    expect(faqQuestions.length).toBe(10);
  });

  test('should toggle FAQ answer visibility on click', async () => {
    // Get first FAQ question and answer
    const firstQuestion = await page.$('.faq-question');
    const firstAnswer = await page.$('#faq-answer-1');
    
    // Initially, the answer should be hidden
    const initialDisplay = await page.evaluate(el => {
      return window.getComputedStyle(el).display;
    }, firstAnswer);
    expect(initialDisplay).toBe('none');

    // Click the question
    await firstQuestion.click();
    await sleep(200);

    // Check that the answer is now visible
    const expandedDisplay = await page.evaluate(el => {
      return window.getComputedStyle(el).display;
    }, firstAnswer);
    expect(expandedDisplay).toBe('block');

    // Check aria-expanded attribute
    const ariaExpanded = await page.evaluate(el => {
      return el.getAttribute('aria-expanded');
    }, firstQuestion);
    expect(ariaExpanded).toBe('true');

    // Check active class
    const hasActiveClass = await page.evaluate(el => {
      return el.classList.contains('active');
    }, firstAnswer);
    expect(hasActiveClass).toBe(true);
  });

  test('should close FAQ answer when clicked again', async () => {
    // Get first FAQ question and answer
    const firstQuestion = await page.$('.faq-question');
    const firstAnswer = await page.$('#faq-answer-1');
    
    // Open the FAQ first
    await firstQuestion.click();
    await sleep(200);

    // Verify it's open
    const openDisplay = await page.evaluate(el => {
      return window.getComputedStyle(el).display;
    }, firstAnswer);
    expect(openDisplay).toBe('block');

    // Click again to close
    await firstQuestion.click();
    await sleep(200);

    // Check that it's closed
    const closedDisplay = await page.evaluate(el => {
      return window.getComputedStyle(el).display;
    }, firstAnswer);
    expect(closedDisplay).toBe('none');

    // Check aria-expanded is false
    const ariaExpanded = await page.evaluate(el => {
      return el.getAttribute('aria-expanded');
    }, firstQuestion);
    expect(ariaExpanded).toBe('false');

    // Check active class is removed
    const hasActiveClass = await page.evaluate(el => {
      return el.classList.contains('active');
    }, firstAnswer);
    expect(hasActiveClass).toBe(false);
  });

  test('should ensure only one FAQ item is open at a time (accordion behavior)', async () => {
    // Get FAQ questions
    const faqQuestions = await page.$$('.faq-question');
    expect(faqQuestions.length).toBeGreaterThan(1);

    // Open first question
    await faqQuestions[0].click();
    await sleep(200);

    // Verify first answer is open
    const firstAnswer = await page.$('#faq-answer-1');
    const firstAnswerDisplay = await page.evaluate(el => {
      return window.getComputedStyle(el).display;
    }, firstAnswer);
    expect(firstAnswerDisplay).toBe('block');

    // Open second question
    await faqQuestions[1].click();
    await sleep(200);

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

  test('should support keyboard navigation (Enter key)', async () => {
    // Get first FAQ question and answer
    const firstQuestion = await page.$('.faq-question');
    const firstAnswer = await page.$('#faq-answer-1');
    
    // Focus on the question
    await firstQuestion.focus();
    
    // Press Enter to open
    await page.keyboard.press('Enter');
    await sleep(200);

    // Check that answer is visible
    const answerDisplay = await page.evaluate(el => {
      return window.getComputedStyle(el).display;
    }, firstAnswer);
    expect(answerDisplay).toBe('block');

    // Press Enter again to close
    await page.keyboard.press('Enter');
    await sleep(200);

    // Check that answer is hidden
    const answerDisplayClosed = await page.evaluate(el => {
      return window.getComputedStyle(el).display;
    }, firstAnswer);
    expect(answerDisplayClosed).toBe('none');
  });

  test('should support keyboard navigation (Space key)', async () => {
    // Get first FAQ question and answer
    const firstQuestion = await page.$('.faq-question');
    const firstAnswer = await page.$('#faq-answer-1');
    
    // Focus on the question
    await firstQuestion.focus();
    
    // Press Space to open
    await page.keyboard.press('Space');
    await sleep(200);

    // Check that answer is visible
    const answerDisplay = await page.evaluate(el => {
      return window.getComputedStyle(el).display;
    }, firstAnswer);
    expect(answerDisplay).toBe('block');

    // Press Space again to close
    await page.keyboard.press('Space');
    await sleep(200);

    // Check that answer is hidden
    const answerDisplayClosed = await page.evaluate(el => {
      return window.getComputedStyle(el).display;
    }, firstAnswer);
    expect(answerDisplayClosed).toBe('none');
  });

  test('should have proper ARIA attributes for accessibility', async () => {
    // Get all FAQ questions
    const faqQuestions = await page.$$('.faq-question');
    
    // Check each question has proper ARIA attributes
    for (let i = 0; i < faqQuestions.length; i++) {
      const question = faqQuestions[i];
      const answer = await page.$(`#faq-answer-${i + 1}`);
      
      // Check aria-expanded starts as false
      const ariaExpanded = await page.evaluate(el => {
        return el.getAttribute('aria-expanded');
      }, question);
      expect(ariaExpanded).toBe('false');

      // Check aria-controls points to correct answer
      const ariaControls = await page.evaluate(el => {
        return el.getAttribute('aria-controls');
      }, question);
      expect(ariaControls).toBe(`faq-answer-${i + 1}`);

      // Check that answer has correct ID
      const answerId = await page.evaluate(el => {
        return el.getAttribute('id');
      }, answer);
      expect(answerId).toBe(`faq-answer-${i + 1}`);
    }
  });

  test('should have proper tabindex for keyboard navigation', async () => {
    // Get all FAQ questions
    const faqQuestions = await page.$$('.faq-question');
    
    // Check each question has tabindex
    for (const question of faqQuestions) {
      const tabindex = await page.evaluate(el => {
        return el.getAttribute('tabindex');
      }, question);
      expect(tabindex).toBe('0');
    }
  });

  test('should work on mobile viewport', async () => {
    // Set mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    
    // Wait for FAQ section to be visible
    await page.waitForSelector('.faq-section', { visible: true });
    
    // Get first FAQ question
    const firstQuestion = await page.$('.faq-question');
    const firstAnswer = await page.$('#faq-answer-1');
    
    // Test touch interaction
    await firstQuestion.click();
    await sleep(200);

    // Check that answer is visible on mobile
    const answerDisplay = await page.evaluate(el => {
      return window.getComputedStyle(el).display;
    }, firstAnswer);
    expect(answerDisplay).toBe('block');
  });

  test('should have proper FAQ content', async () => {
    // Check that FAQ questions have content
    const faqQuestions = await page.$$('.faq-question');
    
    // Check first few questions have expected content
    const firstQuestionText = await page.evaluate(el => el.textContent, faqQuestions[0]);
    expect(firstQuestionText).toContain('What is image compression');

    const secondQuestionText = await page.evaluate(el => el.textContent, faqQuestions[1]);
    expect(secondQuestionText).toContain('What image formats');

    // Check that answers have content
    const firstAnswer = await page.$('#faq-answer-1');
    const firstAnswerText = await page.evaluate(el => el.textContent, firstAnswer);
    expect(firstAnswerText.length).toBeGreaterThan(50); // Should have substantial content
  });

  test('should maintain state during page interactions', async () => {
    // Open first FAQ
    const firstQuestion = await page.$('.faq-question');
    await firstQuestion.click();
    await sleep(200);

    // Verify it's open
    const firstAnswer = await page.$('#faq-answer-1');
    const isOpen = await page.evaluate(el => {
      return window.getComputedStyle(el).display === 'block';
    }, firstAnswer);
    expect(isOpen).toBe(true);

    // Scroll to top of page
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(100);

    // Verify FAQ is still open
    const isStillOpen = await page.evaluate(el => {
      return window.getComputedStyle(el).display === 'block';
    }, firstAnswer);
    expect(isStillOpen).toBe(true);
  });
});
