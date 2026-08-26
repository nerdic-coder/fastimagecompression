// Unit tests for ImageCompressor class
describe('ImageCompressor', () => {
  let ImageCompressor;
  let mockElements;

  beforeEach(() => {
    // Mock DOM elements
    mockElements = {
      uploadArea: { addEventListener: jest.fn(), classList: { toggle: jest.fn() } },
      fileInput: { addEventListener: jest.fn(), click: jest.fn() },
      controls: { style: { display: 'none' } },
      qualitySlider: { addEventListener: jest.fn(), value: '70' },
      compressBtn: { addEventListener: jest.fn(), disabled: false },
      resultsSection: { style: { display: 'none' } }
    };

    // Mock document.getElementById
    global.document.getElementById = jest.fn((id) => {
      const elementMap = {
        'uploadArea': mockElements.uploadArea,
        'fileInput': mockElements.fileInput,
        'controls': mockElements.controls,
        'qualitySlider': mockElements.qualitySlider,
        'compressBtn': mockElements.compressBtn,
        'resultsSection': mockElements.resultsSection
      };
      return elementMap[id] || null;
    });

    // Load the ImageCompressor class
    delete require.cache[require.resolve('../../script-testable.js')];
    ImageCompressor = require('../../script-testable.js').ImageCompressor;
  });

  test('should initialize with default values', () => {
    const compressor = new ImageCompressor();

    expect(compressor.originalFile).toBeNull();
    expect(compressor.originalFiles).toEqual([]);
    expect(compressor.isProcessing).toBe(false);
    expect(compressor.isBatchProcessing).toBe(false);
  });

  test('should format file size correctly', () => {
    const compressor = new ImageCompressor();

    expect(compressor.formatFileSize(0)).toBe('0 Bytes');
    expect(compressor.formatFileSize(1024)).toBe('1 KB');
    expect(compressor.formatFileSize(1048576)).toBe('1 MB');
    expect(compressor.formatFileSize(1073741824)).toBe('1 GB');
  });

  test('should calculate data URL size correctly', () => {
    const compressor = new ImageCompressor();
    const dataUrl = 'data:image/jpeg;base64,' + 'a'.repeat(100);
    const size = compressor.getDataUrlSize(dataUrl);

    expect(size).toBeGreaterThan(0);
    expect(typeof size).toBe('number');
  });

  test('should recommend JPEG for an opaque PNG after alpha detection', () => {
    const compressor = new ImageCompressor();
    compressor.hasTransparency = false;

    expect(compressor.getRecommendedFormat({ type: 'image/png', name: 'opaque.png' })).toBe('jpeg');
  });

  test('should recommend PNG for a transparent PNG after alpha detection', () => {
    const compressor = new ImageCompressor();
    compressor.hasTransparency = true;

    expect(compressor.getRecommendedFormat({ type: 'image/png', name: 'transparent.png' })).toBe('png');
  });

  test('should generate correct file names', () => {
    const compressor = new ImageCompressor();
    compressor.originalFile = { name: 'test-image.jpg' };
    compressor.elements = { formatSelect: { value: 'jpeg' }, qualitySlider: { value: '80' } };

    const fileName = compressor.generateFileName();
    expect(fileName).toBe('test-image_compressed_80%.jpeg');
  });

  test('should detect Safari iOS correctly', () => {
    const compressor = new ImageCompressor();

    // Mock Safari iOS user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      configurable: true
    });

    compressor.detectSafariAndApplyFixes();
    expect(compressor.isSafariIOS).toBe(true);
  });

  test('should handle file validation correctly', () => {
    const compressor = new ImageCompressor();

    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const largeFile = new File(['test'], 'large.jpg', { type: 'image/jpeg' });
    largeFile.size = 11 * 1024 * 1024; // 11MB

    expect(compressor.isValidImageFile(validFile)).toBe(true);
    expect(compressor.isValidImageFile(invalidFile)).toBe(false);
    expect(compressor.isValidImageFile(largeFile)).toBe(false);
  });

  test('should include reduction class in batch image stats markup', () => {
    const compressor = new ImageCompressor();

    const card = compressor.createBatchImageCard({
      originalFile: { name: 'batch-photo.jpg' },
      originalSize: 5000,
      compressedSize: 3000,
      reduction: 40,
      compressedDataUrl: 'data:image/jpeg;base64,abc'
    }, 0);

    const reductionRow = card.querySelector('.batch-image-reduction');
    expect(reductionRow).not.toBeNull();
    expect(reductionRow.textContent).toContain('Reduction: 40.0%');
  });

  test('should detect AVIF support and disable it on Safari iOS', () => {
    const compressor = new ImageCompressor();
    compressor.preCreateCanvas();

    compressor.canvas.toDataURL = jest.fn((mime) => `data:${mime};base64,mock`);
    compressor.isSafariIOS = false;
    let support = compressor.detectSupportedOutputFormats();
    expect(support.avif).toBe(true);

    compressor.isSafariIOS = true;
    support = compressor.detectSupportedOutputFormats();
    expect(support.avif).toBe(false);
  });

  test('should gracefully fallback to JPEG when AVIF encoding is unavailable', async () => {
    const compressor = new ImageCompressor();
    compressor.preCreateCanvas();

    compressor.supportedOutputFormats = { jpeg: true, webp: true, avif: true };
    compressor.canvas.toDataURL = jest.fn((mime) => {
      if (mime === 'image/avif') {
        return 'data:image/png;base64,fallback';
      }
      return 'data:image/jpeg;base64,ok';
    });

    const result = await compressor.compressImageData({ width: 100, height: 100 }, 0.8, 'avif');
    expect(result.startsWith('data:image/jpeg')).toBe(true);
  });

  test('should hide unsupported AVIF option in format select', () => {
    const compressor = new ImageCompressor();
    const formatSelect = document.createElement('select');
    formatSelect.innerHTML = `
      <option value="jpeg">JPEG</option>
      <option value="webp">WebP</option>
      <option value="avif">AVIF</option>
    `;

    compressor.elements = { formatSelect };
    compressor.supportedOutputFormats = { jpeg: true, webp: true, avif: false };

    compressor.applyOutputFormatAvailability();

    expect(formatSelect.querySelector('option[value="avif"]').hidden).toBe(true);
    expect(formatSelect.querySelector('option[value="avif"]').disabled).toBe(true);
  });

  test('should preserve preview scale while moving the comparison handle', () => {
    const compressor = new ImageCompressor();
    const comparisonPanel = document.createElement('div');
    comparisonPanel.innerHTML = '<div class="comparison-after"><img alt="compressed"></div>';
    compressor.elements = { comparisonPanel };

    compressor.updateComparisonPosition(25);

    const after = comparisonPanel.querySelector('.comparison-after');
    const afterImage = after.querySelector('img');
    expect(after.style.width).toBe('25%');
    expect(afterImage.style.width).toBe('400%');
  });

  test('should use data URL mime type for output file extension', () => {
    const compressor = new ImageCompressor();
    compressor.originalFile = { name: 'test-image.jpg' };
    compressor.elements = { formatSelect: { value: 'avif' }, qualitySlider: { value: '80' } };

    const fileName = compressor.generateFileName('data:image/jpeg;base64,abc');
    expect(fileName).toBe('test-image_compressed_80%.jpeg');
  });

  test('should preserve aspect ratio without upscaling', () => {
    const compressor = new ImageCompressor();
    expect(compressor.getOutputDimensions(4000, 2000, 1920)).toEqual({ width: 1920, height: 960 });
    expect(compressor.getOutputDimensions(800, 400, 1920)).toEqual({ width: 800, height: 400 });
  });

  test('should expose target-size and metadata defaults', () => {
    const compressor = new ImageCompressor();
    compressor.elements = {
      targetSizeKb: { value: '200' },
      maxDimension: { value: '1200' },
      removeMetadata: { checked: true }
    };
    expect(compressor.getCompressionOptions()).toEqual({ maxDimension: 1200, targetSizeKb: 200, removeMetadata: true });
  });

  test('should generate unique ZIP names for duplicate source names', () => {
    const compressor = new ImageCompressor();
    compressor.elements = { formatSelect: { value: 'jpeg' }, qualitySlider: { value: '70' } };
    const name = compressor.uniqueBatchFileName({ originalFile: { name: 'photo.jpg' }, compressedDataUrl: 'data:image/jpeg;base64,abc' }, 1);
    expect(name).toBe('002_photo_compressed_70%.jpeg');
  });

  test('should recommend PNG for transparent PNG inputs', () => {
    const compressor = new ImageCompressor();

    expect(compressor.getRecommendedFormat({ name: 'logo.png', type: 'image/png' })).toBe('png');
  });

  test('should reset batch progress at the start of every run', () => {
    const compressor = new ImageCompressor();
    compressor.originalFiles = [{ name: 'a.jpg' }, { name: 'b.jpg' }];
    compressor.batchProgress = { current: 2, total: 2, completed: 2, errors: 0 };

    compressor.resetBatchProgress();

    expect(compressor.batchProgress).toEqual({ current: 0, total: 2, completed: 0, errors: 0 });
  });

  test('should format batch size increases without invalid units', () => {
    const compressor = new ImageCompressor();

    expect(compressor.formatBatchSizeChange(1000, 1711)).toBe('File size increased by 71.1% (711 Bytes)');
  });

  test('should explicitly reject GIF inputs to avoid silently destroying animation', () => {
    const compressor = new ImageCompressor();

    expect(compressor.isUnsupportedGif({ name: 'animation.gif', type: 'image/gif' })).toBe(true);
    expect(compressor.isUnsupportedGif({ name: 'photo.png', type: 'image/png' })).toBe(false);
  });

  test('should report all-invalid selections through one consolidated error', () => {
    const compressor = new ImageCompressor();
    compressor.showError = jest.fn();

    compressor.processFiles([
      new File(['test'], 'bad.txt', { type: 'text/plain' }),
      new File(['test'], 'bad.bin', { type: 'application/octet-stream' })
    ]);

    expect(compressor.showError).toHaveBeenCalledTimes(1);
    expect(compressor.showError.mock.calls[0][0]).toContain('bad.txt');
    expect(compressor.showError.mock.calls[0][0]).toContain('bad.bin');
    expect(compressor.showError.mock.calls[0][0]).toContain('No valid image files selected.');
  });
});
