// Image Compression App
class ImageCompressor {
    constructor() {
        this.originalFile = null;
        this.originalImage = null;
        this.compressedImage = null;
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        // Upload elements
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.controls = document.getElementById('controls');
        
        // Control elements
        this.qualitySlider = document.getElementById('qualitySlider');
        this.qualityValue = document.getElementById('qualityValue');
        this.formatSelect = document.getElementById('formatSelect');
        this.compressBtn = document.getElementById('compressBtn');
        
        // Results elements
        this.resultsSection = document.getElementById('resultsSection');
        this.originalImageEl = document.getElementById('originalImage');
        this.compressedImageEl = document.getElementById('compressedImage');
        this.originalSize = document.getElementById('originalSize');
        this.compressedSize = document.getElementById('compressedSize');
        this.originalDimensions = document.getElementById('originalDimensions');
        this.compressedDimensions = document.getElementById('compressedDimensions');
        this.sizeReduction = document.getElementById('sizeReduction');
        this.compressionRatio = document.getElementById('compressionRatio');
        this.downloadBtn = document.getElementById('downloadBtn');
    }

    bindEvents() {
        // Upload events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Control events
        this.qualitySlider.addEventListener('input', (e) => this.updateQualityValue(e));
        this.compressBtn.addEventListener('click', () => this.compressImage());
        this.downloadBtn.addEventListener('click', () => this.downloadCompressedImage());
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
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
        this.controls.style.display = 'block';
        this.resultsSection.style.display = 'none';
        
        // Add animation
        this.controls.style.opacity = '0';
        this.controls.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            this.controls.style.transition = 'all 0.3s ease';
            this.controls.style.opacity = '1';
            this.controls.style.transform = 'translateY(0)';
        }, 100);
    }

    displayOriginalImage() {
        this.originalImageEl.src = this.originalImage.src;
        this.originalSize.textContent = this.formatFileSize(this.originalFile.size);
        this.originalDimensions.textContent = `${this.originalImage.width} × ${this.originalImage.height}`;
    }

    updateQualityValue(e) {
        this.qualityValue.textContent = e.target.value;
    }

    async compressImage() {
        if (!this.originalImage) {
            this.showError('Please select an image first.');
            return;
        }

        // Show loading state
        this.compressBtn.innerHTML = '<div class="loading"></div> Compressing...';
        this.compressBtn.disabled = true;

        try {
            const quality = parseInt(this.qualitySlider.value) / 100;
            const format = this.formatSelect.value;
            
            // Compress image
            const compressedDataUrl = await this.compressImageData(this.originalImage, quality, format);
            
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
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas dimensions
            canvas.width = image.width;
            canvas.height = image.height;
            
            // Draw image on canvas
            ctx.drawImage(image, 0, 0);
            
            // Convert to desired format
            let mimeType = 'image/jpeg';
            if (format === 'png') {
                mimeType = 'image/png';
            } else if (format === 'webp') {
                mimeType = 'image/webp';
            }
            
            // Generate compressed data URL
            const dataUrl = canvas.toDataURL(mimeType, quality);
            resolve(dataUrl);
        });
    }

    displayResults(compressedDataUrl) {
        // Display compressed image
        this.compressedImageEl.src = compressedDataUrl;
        this.compressedDimensions.textContent = `${this.compressedImage.width} × ${this.compressedImage.height}`;
        
        // Calculate file sizes
        const originalSize = this.originalFile.size;
        const compressedSize = this.getDataUrlSize(compressedDataUrl);
        
        this.compressedSize.textContent = this.formatFileSize(compressedSize);
        
        // Calculate compression stats
        const sizeReduction = originalSize - compressedSize;
        const reductionPercent = ((sizeReduction / originalSize) * 100).toFixed(1);
        const compressionRatio = (originalSize / compressedSize).toFixed(1);
        
        this.sizeReduction.textContent = `${reductionPercent}% (${this.formatFileSize(sizeReduction)})`;
        this.compressionRatio.textContent = `${compressionRatio}:1`;
        
        // Store compressed data for download
        this.compressedDataUrl = compressedDataUrl;
        
        // Show results section
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Add success animation
        this.resultsSection.classList.add('success-animation');
        setTimeout(() => {
            this.resultsSection.classList.remove('success-animation');
        }, 600);
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
        const format = this.formatSelect.value;
        const quality = this.qualitySlider.value;
        
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
        this.compressBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Compress Image';
        this.compressBtn.disabled = false;
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

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageCompressor();
});

// Add some utility functions for better UX
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + O to open file dialog
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        document.getElementById('fileInput').click();
    }
    
    // Ctrl/Cmd + S to download (if compressed image exists)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn && downloadBtn.style.display !== 'none') {
            downloadBtn.click();
        }
    }
});

// Add service worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
