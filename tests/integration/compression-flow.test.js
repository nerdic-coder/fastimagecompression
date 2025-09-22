// Integration tests for compression workflow
describe('Compression Flow Integration', () => {
  let compressor;
  let mockCanvas;
  let mockContext;

  beforeEach(() => {
    // Mock canvas and context
    mockContext = {
      drawImage: jest.fn(),
      putImageData: jest.fn(),
      getImageData: jest.fn(() => ({
        data: new Uint8ClampedArray(4),
        width: 1,
        height: 1
      })),
      clearRect: jest.fn(),
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    };

    mockCanvas = {
      width: 100,
      height: 100,
      getContext: jest.fn(() => mockContext),
      toDataURL: jest.fn(() => 'data:image/jpeg;base64,test')
    };

    global.document.createElement = jest.fn((tagName) => {
      if (tagName === 'canvas') {
        return mockCanvas;
      }
      // Create a proper mock element that can be appended to DOM
      const mockElement = {
        addEventListener: jest.fn(),
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        className: '',
        textContent: '',
        style: {
          cssText: '',
          animation: ''
        },
        parentNode: null
      };
      return mockElement;
    });

    // Mock DOM elements
    const mockElements = {
      uploadArea: { addEventListener: jest.fn(), classList: { toggle: jest.fn() } },
      fileInput: { addEventListener: jest.fn(), click: jest.fn() },
      controls: { style: { display: 'none' } },
      qualitySlider: { addEventListener: jest.fn(), value: '70' },
      compressBtn: { addEventListener: jest.fn(), disabled: false, innerHTML: '' },
      resultsSection: { style: { display: 'none' } },
      progressSection: { style: { display: 'none' } },
      progressFill: { style: { width: '0%' } },
      progressText: { textContent: '' },
      progressPercent: { textContent: '0%' },
      imageList: { innerHTML: '', appendChild: jest.fn() },
      singleResults: { style: { display: 'none' } },
      batchResults: { style: { display: 'none' } },
      originalImageEl: { src: '' },
      compressedImageEl: { src: '' },
      originalSize: { textContent: '' },
      compressedSize: { textContent: '' },
      originalDimensions: { textContent: '' },
      compressedDimensions: { textContent: '' },
      sizeReduction: { textContent: '', style: { color: '' } },
      compressionRatio: { textContent: '', style: { color: '' } },
      downloadBtn: { addEventListener: jest.fn(), disabled: false },
      downloadAllBtn: { addEventListener: jest.fn(), style: { display: 'none' } },
      totalImages: { textContent: '' },
      totalSizeReduction: { textContent: '' },
      averageCompression: { textContent: '' },
      batchImageGrid: { innerHTML: '', appendChild: jest.fn() },
      compressBtnText: { textContent: '' },
      qualityValue: { textContent: '70' },
      formatSelect: { value: 'jpeg' }
    };

    global.document.getElementById = jest.fn((id) => {
      const elementMap = {
        'uploadArea': mockElements.uploadArea,
        'fileInput': mockElements.fileInput,
        'controls': mockElements.controls,
        'qualitySlider': mockElements.qualitySlider,
        'compressBtn': mockElements.compressBtn,
        'resultsSection': mockElements.resultsSection,
        'progressSection': mockElements.progressSection,
        'progressFill': mockElements.progressFill,
        'progressText': mockElements.progressText,
        'progressPercent': mockElements.progressPercent,
        'imageList': mockElements.imageList,
        'singleResults': mockElements.singleResults,
        'batchResults': mockElements.batchResults,
        'originalImage': mockElements.originalImageEl,
        'compressedImage': mockElements.compressedImageEl,
        'originalSize': mockElements.originalSize,
        'compressedSize': mockElements.compressedSize,
        'originalDimensions': mockElements.originalDimensions,
        'compressedDimensions': mockElements.compressedDimensions,
        'sizeReduction': mockElements.sizeReduction,
        'compressionRatio': mockElements.compressionRatio,
        'downloadBtn': mockElements.downloadBtn,
        'downloadAllBtn': mockElements.downloadAllBtn,
        'totalImages': mockElements.totalImages,
        'totalSizeReduction': mockElements.totalSizeReduction,
        'averageCompression': mockElements.averageCompression,
        'batchImageGrid': mockElements.batchImageGrid,
        'compressBtnText': mockElements.compressBtnText,
        'qualityValue': mockElements.qualityValue,
        'formatSelect': mockElements.formatSelect
      };
      return elementMap[id] || null;
    });

    // Mock document.body methods
    Object.defineProperty(global.document, 'body', {
      value: {
        appendChild: jest.fn(),
        removeChild: jest.fn()
      },
      writable: true
    });

    // Mock Image constructor
    global.Image = class MockImage {
      constructor() {
        this.width = 100;
        this.height = 100;
        this.src = '';
        this.onload = null;
        this.onerror = null;
        
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 10);
      }
    };

    // Load ImageCompressor
    delete require.cache[require.resolve('../../script-testable.js')];
    const ImageCompressor = require('../../script-testable.js').ImageCompressor;
    compressor = new ImageCompressor();
    
    // Mock the showError method to avoid DOM issues
    compressor.showError = jest.fn();
  });

  test('should complete single image compression workflow', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    mockFile.size = 1024;
    
    compressor.originalFile = mockFile;
    compressor.originalImage = new Image();
    compressor.elements = {
      qualitySlider: { value: '70' },
      formatSelect: { value: 'jpeg' }
    };

    // Mock compression result
    const compressedDataUrl = 'data:image/jpeg;base64,compressed';
    compressor.compressImageData = jest.fn().mockResolvedValue(compressedDataUrl);

    // Start compression
    const compressionPromise = compressor.compressSingleImage();
    
    // Wait for the compression to complete
    await compressionPromise;
    
    // Wait a bit more for any async callbacks to complete
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(compressor.compressImageData).toHaveBeenCalled();
    expect(compressor.isProcessing).toBe(false);
  });

  test('should handle compression errors gracefully', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    compressor.originalFile = mockFile;
    compressor.originalImage = new Image();
    compressor.elements = {
      qualitySlider: { value: '70' },
      formatSelect: { value: 'jpeg' }
    };

    // Mock compression error
    compressor.compressImageData = jest.fn().mockRejectedValue(new Error('Compression failed'));

    // Start compression
    const compressionPromise = compressor.compressSingleImage();
    
    // Wait for the compression to complete
    await compressionPromise;
    
    // Wait a bit more for any async callbacks to complete
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(compressor.isProcessing).toBe(false);
  });

  test('should process multiple files in batch', async () => {
    const mockFiles = [
      new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
    ];

    compressor.originalFiles = mockFiles;
    compressor.elements = {
      qualitySlider: { value: '70' },
      formatSelect: { value: 'jpeg' }
    };

    // Mock batch compression
    compressor.compressFile = jest.fn().mockResolvedValue({
      dataUrl: 'data:image/jpeg;base64,compressed',
      image: new Image(),
      size: 512,
      reduction: 50
    });

    // Start batch compression
    const batchPromise = compressor.compressBatchImages();
    
    // Wait for the batch compression to complete
    await batchPromise;
    
    // Wait a bit more for any async callbacks to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(compressor.compressFile).toHaveBeenCalledTimes(2);
    expect(compressor.isBatchProcessing).toBe(false);
  });

  test('should update progress correctly during batch processing', () => {
    // Ensure elements are properly initialized
    compressor.initializeElements();
    
    compressor.batchProgress = {
      current: 0,
      total: 5,
      completed: 2,
      errors: 0
    };

    compressor.updateProgress();

    expect(compressor.batchProgress.completed).toBe(2);
  });
});
