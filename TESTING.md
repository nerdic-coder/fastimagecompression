# Testing Guide

This document explains how to run tests for the Fast Image Compression application.

## Test Structure

```
tests/
├── unit/                    # Unit tests for individual functions
│   └── image-compressor.test.js
├── integration/            # Integration tests for workflows
│   └── compression-flow.test.js
├── e2e/                    # End-to-end tests with Puppeteer
│   ├── image-compression.test.js
│   ├── ui-responsiveness.test.js
│   └── setup.js
├── fixtures/               # Test images and data
│   ├── test-image.jpg
│   ├── test-image.png
│   └── small-test.jpg
└── setup.js               # Jest setup for unit tests
```

## Prerequisites

1. **Node.js 18+** - Required for running tests
2. **Python 3** - For serving the app locally during E2E tests
3. **PIL (Pillow)** - For creating test images (already created)

## Installation

```bash
# Install dependencies
npm install

# Install Python dependencies (if needed)
pip3 install Pillow
```

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### End-to-End Tests
```bash
# Start local server first
npm run serve

# In another terminal, run E2E tests
npm run test:e2e

# Run E2E tests in watch mode
npm run test:e2e:watch
```

### All Tests
```bash
# Run both unit and E2E tests
npm run test:all
```

## Test Categories

### Unit Tests (`tests/unit/`)
- Test individual functions and methods
- Mock external dependencies
- Fast execution
- High coverage of business logic

**Examples:**
- File size formatting
- Image validation
- Compression calculations
- Error handling

### Integration Tests (`tests/integration/`)
- Test complete workflows
- Mock some external dependencies
- Test component interactions

**Examples:**
- Complete compression workflow
- Batch processing flow
- Error recovery

### End-to-End Tests (`tests/e2e/`)
- Test complete user journeys
- Real browser interactions
- Test actual UI behavior

**Examples:**
- File upload and compression
- Mobile responsiveness
- Cross-browser compatibility
- Performance testing

## Test Data

Test images are located in `tests/fixtures/`:
- `test-image.jpg` - Standard test image (200x200)
- `test-image.png` - PNG with transparency (150x150)
- `small-test.jpg` - Small image for mobile testing (50x50)

## Writing New Tests

### Unit Test Example
```javascript
describe('ImageCompressor', () => {
  test('should format file size correctly', () => {
    const compressor = new ImageCompressor();
    expect(compressor.formatFileSize(1024)).toBe('1 KB');
  });
});
```

### E2E Test Example
```javascript
test('should compress image successfully', async () => {
  await uploadTestImage(page, './tests/fixtures/test-image.jpg');
  await page.click('#compressBtn');
  await waitForCompression(page);
  
  const downloadBtn = await page.$('#downloadBtn');
  expect(await downloadBtn.isEnabled()).toBe(true);
});
```

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `cursor` branches
- Pull requests
- GitHub Actions workflow

### Test Reports
- Unit test coverage: Available in `coverage/` directory
- E2E test results: Screenshots and videos on failure
- Lighthouse performance: Automated performance testing

## Debugging Tests

### Unit Tests
```bash
# Run specific test file
npm test -- image-compressor.test.js

# Run with verbose output
npm test -- --verbose

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

### E2E Tests
```bash
# Run with visible browser
HEADLESS=false npm run test:e2e

# Run specific test file
npm run test:e2e -- --testNamePattern="should compress image"

# Debug mode
DEBUG=puppeteer:* npm run test:e2e
```

## Performance Testing

### Lighthouse CI
```bash
# Install Lighthouse CI
npm install -g @lhci/cli@0.12.x

# Run performance tests
lhci autorun
```

### Manual Performance Testing
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit on `http://localhost:8000`
4. Check Performance, Accessibility, Best Practices, SEO

## Browser Compatibility

E2E tests run on:
- Chrome (default)
- Firefox (can be added)
- Safari (can be added)

## Mobile Testing

Mobile tests use viewport simulation:
- iPhone: 375x667
- iPad: 768x1024
- Android: 360x640

## Troubleshooting

### Common Issues

1. **Tests fail with "Cannot find module"**
   ```bash
   npm install
   ```

2. **E2E tests fail with "Navigation timeout"**
   ```bash
   # Make sure local server is running
   npm run serve
   ```

3. **Canvas tests fail**
   ```bash
   # Install canvas mock
   npm install --save-dev jest-canvas-mock
   ```

4. **Font loading issues in tests**
   - Tests mock font loading for consistency
   - Check `tests/setup.js` for font mocks

### Test Environment

- **Node.js**: 18+
- **Jest**: 29+
- **Puppeteer**: 21+
- **Python**: 3.6+ (for local server)

## Contributing

When adding new features:
1. Write unit tests for new functions
2. Add integration tests for workflows
3. Create E2E tests for user interactions
4. Update this documentation

## Netlify Deployment

Testing files are excluded from Netlify deployment via `.netlifyignore`:
- `tests/` directory
- `node_modules/`
- `package.json`
- `coverage/`
- Jest configuration files

This ensures only production files are deployed.
