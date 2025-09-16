// Image Compression App - Optimized for Performance with Service Worker
class ImageCompressor {
    constructor() {
        this.originalFile = null;
        this.originalImage = null;
        this.compressedImage = null;
        this.canvas = null;
        this.ctx = null;
        this.isProcessing = false;
        this.serviceWorker = null;
        this.messageId = 0;
        this.pendingCompressions = new Map();
        
        // Defer heavy initialization
        requestIdleCallback ? 
            requestIdleCallback(() => this.initialize()) :
            setTimeout(() => this.initialize(), 0);
    }
    
    initialize() {
        this.initializeElements();
        this.bindEvents();
        this.preCreateCanvas();
        this.initializeServiceWorker();
    }
    
    async initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                this.serviceWorker = registration.active || registration.waiting || registration.installing;
                
                // Listen for messages from Service Worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                    this.handleServiceWorkerMessage(event.data);
                });
                
                console.log('Service Worker registered successfully');
            } catch (error) {
                console.log('Service Worker registration failed:', error);
                // Fallback to main thread compression
            }
        }
    }
    
    handleServiceWorkerMessage(data) {
        const { type, id, success, data: resultData, error } = data;
        
        if (type === 'COMPRESSION_COMPLETE') {
            const pendingCompression = this.pendingCompressions.get(id);
            if (pendingCompression) {
                this.pendingCompressions.delete(id);
                
                if (success) {
                    pendingCompression.resolve(resultData);
                } else {
                    pendingCompression.reject(new Error(error));
                }
            }
        }
    }

    initializeElements() {
        // Cache DOM elements to reduce repeated queries
        this.elements = {
            uploadArea: document.getElementById('uploadArea'),
            fileInput: document.getElementById('fileInput'),
            controls: document.getElementById('controls'),
            qualitySlider: document.getElementById('qualitySlider'),
            qualityValue: document.getElementById('qualityValue'),
            formatSelect: document.getElementById('formatSelect'),
            compressBtn: document.getElementById('compressBtn'),
            resultsSection: document.getElementById('resultsSection'),
            originalImageEl: document.getElementById('originalImage'),
            compressedImageEl: document.getElementById('compressedImage'),
            originalSize: document.getElementById('originalSize'),
            compressedSize: document.getElementById('compressedSize'),
            originalDimensions: document.getElementById('originalDimensions'),
            compressedDimensions: document.getElementById('compressedDimensions'),
            sizeReduction: document.getElementById('sizeReduction'),
            compressionRatio: document.getElementById('compressionRatio'),
            downloadBtn: document.getElementById('downloadBtn')
        };
    }

    preCreateCanvas() {
        // Pre-create canvas to avoid creating it during compression
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    bindEvents() {
        const { uploadArea, fileInput, qualitySlider, compressBtn, downloadBtn } = this.elements;
        
        // Use passive listeners where possible for better performance
        const options = { passive: true };
        
        // Upload events
        uploadArea.addEventListener('click', () => fileInput.click(), options);
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e), options);
        
        // Drag and drop events
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Control events with throttling
        qualitySlider.addEventListener('input', this.throttle((e) => this.updateQualityValue(e), 16), options);
        compressBtn.addEventListener('click', () => this.compressImage(), options);
        downloadBtn.addEventListener('click', () => this.downloadCompressedImage(), options);
    }
    
    // Throttle function to reduce event handler frequency
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    handleDragOver(e) {
        e.preventDefault();
        this.elements.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.elements.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.elements.uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showError('Please select a valid image file.');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showError('File size must be less than 10MB.');
            return;
        }

        this.originalFile = file;
        
        // Create image object
        const img = new Image();
        img.onload = () => {
            this.originalImage = img;
            this.showControls();
            this.displayOriginalImage();
        };
        
        img.onerror = () => {
            this.showError('Failed to load image. Please try another file.');
        };
        
        img.src = URL.createObjectURL(file);
    }

    showControls() {
        const { controls, resultsSection } = this.elements;
        controls.style.display = 'block';
        resultsSection.style.display = 'none';
        
        // Use requestAnimationFrame for smoother animations
        requestAnimationFrame(() => {
            controls.style.transition = 'all 0.3s ease';
            controls.style.opacity = '1';
            controls.style.transform = 'translateY(0)';
        });
    }

    displayOriginalImage() {
        const { originalImageEl, originalSize, originalDimensions } = this.elements;
        originalImageEl.src = this.originalImage.src;
        originalSize.textContent = this.formatFileSize(this.originalFile.size);
        originalDimensions.textContent = `${this.originalImage.width} × ${this.originalImage.height}`;
    }

    updateQualityValue(e) {
        this.elements.qualityValue.textContent = e.target.value;
    }

    async compressImage() {
        if (!this.originalImage || this.isProcessing) {
            if (!this.originalImage) this.showError('Please select an image first.');
            return;
        }

        this.isProcessing = true;
        const { compressBtn, qualitySlider, formatSelect } = this.elements;
        
        // Show loading state
        compressBtn.innerHTML = '<div class="loading"></div> Compressing...';
        compressBtn.disabled = true;

        try {
            const quality = parseInt(qualitySlider.value) / 100;
            const format = formatSelect.value;
            
            // Try Service Worker compression first, fallback to main thread
            let compressedDataUrl;
            if (this.serviceWorker) {
                compressedDataUrl = await this.compressImageWithServiceWorker(this.originalImage, quality, format);
            } else {
                compressedDataUrl = await this.compressImageWithIdleCallback(this.originalImage, quality, format);
            }
            
            // Create compressed image object
            const compressedImg = new Image();
            compressedImg.onload = () => {
                this.compressedImage = compressedImg;
                this.displayResults(compressedDataUrl);
                this.resetCompressButton();
                this.isProcessing = false;
            };
            compressedImg.src = compressedDataUrl;
            
        } catch (error) {
            console.error('Compression error:', error);
            this.showError('Failed to compress image. Please try again.');
            this.resetCompressButton();
            this.isProcessing = false;
        }
    }
    
    // Compress image using Service Worker (non-blocking)
    async compressImageWithServiceWorker(image, quality, format) {
        return new Promise((resolve, reject) => {
            // Get image data from canvas
            this.canvas.width = image.width;
            this.canvas.height = image.height;
            this.ctx.drawImage(image, 0, 0);
            
            const imageData = this.ctx.getImageData(0, 0, image.width, image.height);
            
            // Generate unique message ID
            const messageId = ++this.messageId;
            
            // Store promise resolvers
            this.pendingCompressions.set(messageId, { resolve, reject });
            
            // Send compression request to Service Worker
            if (this.serviceWorker) {
                this.serviceWorker.postMessage({
                    type: 'COMPRESS_IMAGE',
                    id: messageId,
                    data: {
                        imageData: imageData.data,
                        width: image.width,
                        height: image.height,
                        quality: quality,
                        format: format
                    }
                });
            } else {
                reject(new Error('Service Worker not available'));
            }
            
            // Timeout after 30 seconds
            setTimeout(() => {
                if (this.pendingCompressions.has(messageId)) {
                    this.pendingCompressions.delete(messageId);
                    reject(new Error('Compression timeout'));
                }
            }, 30000);
        }).then(result => {
            // Convert ArrayBuffer back to data URL
            const blob = new Blob([new Uint8Array(result.data)], { type: result.mimeType });
            return new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        });
    }
    
    // Break compression into smaller chunks using idle callbacks
    compressImageWithIdleCallback(image, quality, format) {
        return new Promise((resolve) => {
            if (window.requestIdleCallback) {
                // Use idle callback to avoid blocking main thread
                window.requestIdleCallback(() => {
                    const result = this.compressImageData(image, quality, format);
                    resolve(result);
                }, { timeout: 5000 });
            } else {
                // Fallback for browsers without requestIdleCallback
                setTimeout(() => {
                    const result = this.compressImageData(image, quality, format);
                    resolve(result);
                }, 0);
            }
        });
    }

    compressImageData(image, quality, format) {
        return new Promise((resolve) => {
            // Use pre-created canvas to avoid DOM creation overhead
            this.canvas.width = image.width;
            this.canvas.height = image.height;
            
            // Draw image on canvas
            this.ctx.drawImage(image, 0, 0);
            
            // Convert to desired format
            const mimeTypes = {
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'webp': 'image/webp'
            };
            const mimeType = mimeTypes[format] || 'image/jpeg';
            
            // Generate compressed data URL
            const dataUrl = this.canvas.toDataURL(mimeType, quality);
            resolve(dataUrl);
        });
    }

    displayResults(compressedDataUrl) {
        const { 
            compressedImageEl, compressedDimensions, compressedSize, 
            sizeReduction, compressionRatio, resultsSection 
        } = this.elements;
        
        // Display compressed image
        compressedImageEl.src = compressedDataUrl;
        compressedDimensions.textContent = `${this.compressedImage.width} × ${this.compressedImage.height}`;
        
        // Calculate file sizes
        const originalSize = this.originalFile.size;
        const compressedSizeBytes = this.getDataUrlSize(compressedDataUrl);
        
        compressedSize.textContent = this.formatFileSize(compressedSizeBytes);
        
        // Calculate compression stats
        const sizeReductionBytes = originalSize - compressedSizeBytes;
        const reductionPercent = ((sizeReductionBytes / originalSize) * 100).toFixed(1);
        const compressionRatioValue = (originalSize / compressedSizeBytes).toFixed(1);
        
        sizeReduction.textContent = `${reductionPercent}% (${this.formatFileSize(sizeReductionBytes)})`;
        compressionRatio.textContent = `${compressionRatioValue}:1`;
        
        // Store compressed data for download
        this.compressedDataUrl = compressedDataUrl;
        
        // Show results section with optimized animation
        resultsSection.style.display = 'block';
        requestAnimationFrame(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth' });
            resultsSection.classList.add('success-animation');
            setTimeout(() => resultsSection.classList.remove('success-animation'), 600);
        });
    }

    getDataUrlSize(dataUrl) {
        // Calculate approximate size from data URL
        const base64Length = dataUrl.split(',')[1].length;
        const padding = (dataUrl.match(/=/g) || []).length;
        return Math.floor((base64Length * 3) / 4) - padding;
    }

    downloadCompressedImage() {
        if (!this.compressedDataUrl) {
            this.showError('No compressed image available.');
            return;
        }

        // Create download link
        const link = document.createElement('a');
        link.download = this.generateFileName();
        link.href = this.compressedDataUrl;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    generateFileName() {
        const originalName = this.originalFile.name;
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
        const format = this.elements.formatSelect.value;
        const quality = this.elements.qualitySlider.value;
        
        return `${nameWithoutExt}_compressed_${quality}%.${format}`;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    resetCompressButton() {
        this.elements.compressBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Compress Image';
        this.elements.compressBtn.disabled = false;
    }

    showError(message) {
        // Use requestAnimationFrame to avoid blocking main thread
        requestAnimationFrame(() => {
            // Create error notification
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-notification';
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #dc3545;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
                z-index: 1000;
                animation: slideIn 0.3s ease;
            `;
            errorDiv.textContent = message;
            
            document.body.appendChild(errorDiv);
            
            // Remove after 5 seconds using idle callback
            const removeError = () => {
                errorDiv.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (errorDiv.parentNode) {
                        document.body.removeChild(errorDiv);
                    }
                }, 300);
            };
            
            if (window.requestIdleCallback) {
                window.requestIdleCallback(() => {
                    setTimeout(removeError, 5000);
                });
            } else {
                setTimeout(removeError, 5000);
            }
        });
    }
}

// Optimized initialization with minimal main-thread impact
function initializeApp() {
    // Use requestIdleCallback for initialization if available
    if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
            new ImageCompressor();
        }, { timeout: 2000 });
    } else {
        // Fallback: use setTimeout to defer initialization
        setTimeout(() => {
            new ImageCompressor();
        }, 0);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
