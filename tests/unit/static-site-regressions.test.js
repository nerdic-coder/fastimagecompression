const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');

describe('static site regressions', () => {
  test('service worker does not cache failed HTTP responses', () => {
    const serviceWorker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

    expect(serviceWorker).toMatch(/fast-image-compression-v3/);
    expect(serviceWorker).toMatch(/NETWORK_FIRST_PATHS/);
    expect(serviceWorker).toMatch(/response\.ok/);
    expect(serviceWorker).toMatch(/cache\.put/);
  });

  test('provides a branded 404 recovery page', () => {
    const notFound = fs.readFileSync(path.join(root, '404.html'), 'utf8');

    expect(notFound).toMatch(/FastImageCompression/);
    expect(notFound).toMatch(/href=["']\/["']/);
    expect(notFound).toMatch(/href=["']\/guides\.html["']/);
  });

  test('privacy copy distinguishes local image processing from site analytics', () => {
    const privacy = fs.readFileSync(path.join(root, 'privacy-policy.html'), 'utf8');
    const privateGuide = fs.readFileSync(path.join(root, 'private-image-compression.html'), 'utf8');

    expect(privacy).toMatch(/processed locally in your browser/i);
    expect(privacy).toMatch(/Google Analytics|analytics services/i);
    expect(privateGuide).toMatch(/image files are processed locally/i);
    expect(privateGuide).not.toMatch(/the site does not receive the selected image/i);
  });

  test('keeps production and test compressor format recommendations in sync', () => {
    const production = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
    const testable = fs.readFileSync(path.join(root, 'script-testable.js'), 'utf8');

    for (const source of [production, testable]) {
      expect(source).toMatch(/this\.hasTransparency === false \? 'jpeg' : 'png'/);
      expect(source).toMatch(/this\.hasTransparency = this\.detectImageTransparency\(img\)/);
      expect(source).toMatch(/detectImageTransparency\(image\)/);
    }
  });

  test('provides an accessible persistent status region for file validation errors', () => {
    const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    const production = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
    const testable = fs.readFileSync(path.join(root, 'script-testable.js'), 'utf8');

    expect(homepage).toMatch(/id=["']errorStatus["']/);
    expect(homepage).toMatch(/role=["']status["']/);
    expect(homepage).toMatch(/aria-live=["']polite["']/);
    for (const source of [production, testable]) {
      expect(source).toMatch(/errorStatus: document\.getElementById\('errorStatus'\)/);
      expect(source).toMatch(/errorStatus\.textContent = message/);
    }
  });

  test('does not claim animated GIF preservation', () => {
    const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

    expect(homepage).not.toMatch(/preserving animation quality/i);
    expect(homepage).toMatch(/animated GIF.*not supported|GIF.*static/i);
  });
});