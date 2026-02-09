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

  test('should generate single-image optimization report in markdown', () => {
    const compressor = new ImageCompressor();
    compressor.originalFile = { name: 'test-image.jpg', size: 5000 };
    compressor.compressedDataUrl = 'data:image/jpeg;base64,' + 'a'.repeat(2000);
    compressor.elements = { formatSelect: { value: 'webp' }, qualitySlider: { value: '75' } };

    const report = compressor.generateOptimizationReport('md');

    expect(report).toContain('# Optimization Report');
    expect(report).toContain('**Selected format:** WEBP');
    expect(report).toContain('**Quality:** 75%');
    expect(report).toContain('Estimated transfer-time savings');
  });

  test('should generate batch optimization report with per-image entries', () => {
    const compressor = new ImageCompressor();
    compressor.compressedImages = [
      {
        originalFile: { name: 'a.jpg' },
        originalSize: 4000,
        compressedSize: 2000,
        reduction: 50,
      },
      {
        originalFile: { name: 'b.jpg' },
        originalSize: 2000,
        compressedSize: 1000,
        reduction: 50,
      },
    ];
    compressor.elements = { formatSelect: { value: 'jpeg' }, qualitySlider: { value: '80' } };

    const report = compressor.generateOptimizationReport('txt');

    expect(report).toContain('Mode: Batch (2 images)');
    expect(report).toContain('Per-image results');
    expect(report).toContain('1. a.jpg');
    expect(report).toContain('2. b.jpg');
  });

  test('should generate clear report filename with mode and timestamp', () => {
    const compressor = new ImageCompressor();
    compressor.compressedImages = [{}, {}];

    const fileName = compressor.generateReportFileName('txt');

    expect(fileName).toMatch(/^optimization-report_batch_\d{8}_\d{6}\.txt$/);
  });
});
