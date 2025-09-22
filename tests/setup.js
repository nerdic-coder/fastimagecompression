// Jest setup for unit and integration tests
require('jest-canvas-mock');

// Mock canvas for unit tests
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  drawImage: jest.fn(),
  putImageData: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1
  })),
  clearRect: jest.fn(),
  canvas: {
    width: 100,
    height: 100,
    toDataURL: jest.fn(() => 'data:image/jpeg;base64,test')
  }
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock File and FileList
global.File = class MockFile {
  constructor(chunks, filename, options = {}) {
    this.name = filename;
    this.size = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    this.type = options.type || 'image/jpeg';
    this.lastModified = Date.now();
  }
};

global.FileList = class MockFileList extends Array {
  constructor(files) {
    super();
    files.forEach(file => this.push(file));
  }
};

// Mock Image constructor
global.Image = class MockImage {
  constructor() {
    this.width = 100;
    this.height = 100;
    this.src = '';
    this.onload = null;
    this.onerror = null;
    
    // Simulate async loading
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 10);
  }
};

// Mock requestIdleCallback
global.requestIdleCallback = jest.fn((callback) => {
  setTimeout(callback, 0);
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
