// Image Compression App - Optimized for Performance
class ImageCompressor {
    constructor() {
        this.originalFile = null;
        this.originalImage = null;
        this.compressedImage = null;
        this.canvas = null;
        this.ctx = null;
        this.initializeElements();
        this.bindEvents();
        this.preCreateCanvas();
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
        
        // Upload events
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop events
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Control events
        qualitySlider.addEventListener('input', (e) => this.updateQualityValue(e));
        compressBtn.addEventListener('click', () => this.compressImage());
        downloadBtn.addEventListener('click', () => this.downloadCompressedImage());
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
        if (!this.originalImage) {
            this.showError('Please select an image first.');
            return;
        }

        const { compressBtn, qualitySlider, formatSelect } = this.elements;
        
        // Show loading state
        compressBtn.innerHTML = '<div class="loading"></div> Compressing...';
        compressBtn.disabled = true;

        try {
            const quality = parseInt(qualitySlider.value) / 100;
            const format = formatSelect.value;
            
            // Use requestIdleCallback for better performance if available
            const compressTask = () => this.compressImageData(this.originalImage, quality, format);
            
            const compressedDataUrl = window.requestIdleCallback ? 
                await new Promise(resolve => {
                    window.requestIdleCallback(() => resolve(compressTask()));
                }) : 
                await compressTask();
            
            // Create compressed image object
            const compressedImg = new Image();
            compressedImg.onload = () => {
                this.compressedImage = compressedImg;
                this.displayResults(compressedDataUrl);
                this.resetCompressButton();
            };
            compressedImg.src = compressedDataUrl;
            
        } catch (error) {
            console.error('Compression error:', error);
            this.showError('Failed to compress image. Please try again.');
            this.resetCompressButton();
        }
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
        
        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(errorDiv);
            }, 300);
        }, 5000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageCompressor();
});
