const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');

const relativeLuminance = (hexColor) => {
  const normalizedHex = hexColor.length === 4
    ? hexColor.replace(/[a-f\d]/gi, (digit) => `${digit}${digit}`)
    : hexColor;
  const channels = normalizedHex.match(/[a-f\d]{2}/gi).map((channel) => parseInt(channel, 16) / 255);
  const linearChannels = channels.map((channel) => (
    channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4
  ));

  return (0.2126 * linearChannels[0]) + (0.7152 * linearChannels[1]) + (0.0722 * linearChannels[2]);
};

const contrastRatio = (firstColor, secondColor) => {
  const luminances = [relativeLuminance(firstColor), relativeLuminance(secondColor)].sort((a, b) => b - a);
  return (luminances[0] + 0.05) / (luminances[1] + 0.05);
};

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

  test('keeps verbose compressor logging disabled in production and testable scripts', () => {
    const production = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
    const testable = fs.readFileSync(path.join(root, 'script-testable.js'), 'utf8');

    for (const source of [production, testable]) {
      expect(source).toMatch(/const DEBUG_LOGGING = false;/);
      expect(source.match(/console\.log\(/g)).toHaveLength(1);
      expect(source).toMatch(/const debugLog = \(\.\.\.args\) =>/);
      expect(source).toMatch(/debugLog\('Mobile Detection Debug:/);
      expect(source).toMatch(/debugLog\('Starting compression:/);
    }
  });

  test('does not claim animated GIF preservation', () => {
    const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

    expect(homepage).not.toMatch(/preserving animation quality/i);
    expect(homepage).toMatch(/animated GIF.*not supported|GIF.*static/i);
  });

  test('keeps light-theme footer headings at WCAG AA contrast', () => {
    const styles = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
    const footerBackground = styles.match(/\.footer\s*{[^}]*background:\s*(#[a-f\d]{3,6})/i)?.[1];
    const headingColor = styles.match(/\.footer-section h4\s*{[^}]*color:\s*(#[a-f\d]{3,6})/i)?.[1];

    expect(footerBackground).toBeDefined();
    expect(headingColor).toBeDefined();
    expect(contrastRatio(headingColor, footerBackground)).toBeGreaterThanOrEqual(4.5);
  });

  test('keeps upload and control helper text readable in dark mode', () => {
    const styles = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
    const helperRule = styles.match(
      /html\.theme-dark \.upload-content p,\s*html\.theme-dark \.privacy-badge,\s*html\.theme-dark \.local-processing-note,\s*html\.theme-dark \.metadata-result,\s*html\.theme-dark \.control-group small\s*{[^}]*color:\s*(#[a-f\d]{3,6})/i,
    );

    expect(helperRule).not.toBeNull();
    expect(contrastRatio(helperRule[1], '#353346')).toBeGreaterThanOrEqual(4.5);
  });
});