// Image Compression App - Optimized for Performance with Service Worker
class ImageCompressor {
    constructor() {
        this.originalFile = null;
        this.originalFiles = [];
        this.originalImage = null;
        this.compressedImage = null;
        this.compressedImages = [];
        this.canvas = null;
        this.ctx = null;
        this.isProcessing = false;
        this.isBatchProcessing = false;
        this.serviceWorker = null;
        this.messageId = 0;
        this.pendingCompressions = new Map();
        this.batchProgress = {
            current: 0,
            total: 0,
            completed: 0,
            errors: 0
        };
        
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
                
                console.log('Service Worker registered successfully');
            } catch (error) {
                console.log('Service Worker registration failed:', error);
                // Fallback to main thread compression
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
            compressBtnText: document.getElementById('compressBtnText'),
            downloadAllBtn: document.getElementById('downloadAllBtn'),
            progressSection: document.getElementById('progressSection'),
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            progressPercent: document.getElementById('progressPercent'),
            imageList: document.getElementById('imageList'),
            resultsSection: document.getElementById('resultsSection'),
            singleResults: document.getElementById('singleResults'),
            batchResults: document.getElementById('batchResults'),
            originalImageEl: document.getElementById('originalImage'),
            compressedImageEl: document.getElementById('compressedImage'),
            originalSize: document.getElementById('originalSize'),
            compressedSize: document.getElementById('compressedSize'),
            originalDimensions: document.getElementById('originalDimensions'),
            compressedDimensions: document.getElementById('compressedDimensions'),
            sizeReduction: document.getElementById('sizeReduction'),
            compressionRatio: document.getElementById('compressionRatio'),
            downloadBtn: document.getElementById('downloadBtn'),
            totalImages: document.getElementById('totalImages'),
            totalSizeReduction: document.getElementById('totalSizeReduction'),
            averageCompression: document.getElementById('averageCompression'),
            batchImageGrid: document.getElementById('batchImageGrid')
        };
    }

    preCreateCanvas() {
        // Pre-create canvas to avoid creating it during compression
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    bindEvents() {
        const { uploadArea, fileInput, qualitySlider, compressBtn, downloadBtn, downloadAllBtn } = this.elements;
        
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
        downloadAllBtn.addEventListener('click', () => this.downloadAllCompressedImages(), options);
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
            this.processFiles(Array.from(files));
        }
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            this.processFiles(files);
        }
    }

    processFiles(files) {
        // Filter valid image files
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                this.showError(`Skipping ${file.name}: Not a valid image file.`);
                return false;
            }
            if (file.size > 10 * 1024 * 1024) {
                this.showError(`Skipping ${file.name}: File size must be less than 10MB.`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) {
            this.showError('No valid image files selected.');
            return;
        }

        this.originalFiles = validFiles;
        
        if (validFiles.length === 1) {
            // Single file - use existing single file flow
            this.originalFile = validFiles[0];
            this.processSingleFile(validFiles[0]);
        } else {
            // Multiple files - use batch processing flow
            this.processMultipleFiles(validFiles);
        }
    }

    processSingleFile(file) {
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

    processMultipleFiles(files) {
        this.showControls();
        this.updateCompressButtonForBatch(files.length);
        this.showProgressSection(files);
    }

    showControls() {
        const { controls, resultsSection, progressSection } = this.elements;
        controls.style.display = 'block';
        resultsSection.style.display = 'none';
        progressSection.style.display = 'none';
        
        // Use requestAnimationFrame for smoother animations
        requestAnimationFrame(() => {
            controls.style.transition = 'all 0.3s ease';
            controls.style.opacity = '1';
            controls.style.transform = 'translateY(0)';
        });
    }

    updateCompressButtonForBatch(fileCount) {
        const { compressBtnText } = this.elements;
        compressBtnText.textContent = `Compress ${fileCount} Images & Reduce Size`;
    }

    showProgressSection(files) {
        const { progressSection, imageList } = this.elements;
        progressSection.style.display = 'block';
        
        // Clear previous image list
        imageList.innerHTML = '';
        
        // Add each file to the progress list
        files.forEach((file, index) => {
            const imageItem = this.createImageListItem(file, index);
            imageList.appendChild(imageItem);
        });
        
        // Initialize progress
        this.batchProgress = {
            current: 0,
            total: files.length,
            completed: 0,
            errors: 0
        };
        
        this.updateProgress();
    }

    createImageListItem(file, index) {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.dataset.index = index;
        
        // Create thumbnail
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = file.name;
        
        // Create info section
        const info = document.createElement('div');
        info.className = 'image-item-info';
        
        const name = document.createElement('div');
        name.className = 'image-item-name';
        name.textContent = file.name;
        
        const size = document.createElement('div');
        size.className = 'image-item-size';
        size.textContent = this.formatFileSize(file.size);
        
        info.appendChild(name);
        info.appendChild(size);
        
        // Create status
        const status = document.createElement('div');
        status.className = 'image-item-status processing';
        status.textContent = 'Waiting...';
        
        imageItem.appendChild(img);
        imageItem.appendChild(info);
        imageItem.appendChild(status);
        
        return imageItem;
    }

    updateProgress() {
        const { progressFill, progressText, progressPercent } = this.elements;
        const { current, total, completed, errors } = this.batchProgress;
        
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${completed} of ${total} images processed`;
        progressPercent.textContent = `${percentage}%`;
    }

    updateImageStatus(index, status, error = null) {
        const imageItem = document.querySelector(`[data-index="${index}"]`);
        if (imageItem) {
            const statusEl = imageItem.querySelector('.image-item-status');
            statusEl.className = `image-item-status ${status}`;
            
            switch (status) {
                case 'processing':
                    statusEl.textContent = 'Processing...';
                    break;
                case 'completed':
                    statusEl.textContent = 'Completed';
                    this.batchProgress.completed++;
                    break;
                case 'error':
                    statusEl.textContent = error || 'Error';
                    this.batchProgress.errors++;
                    break;
            }
            
            this.updateProgress();
        }
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
        if (this.isProcessing || this.isBatchProcessing) {
            this.showError('Compression already in progress.');
            return;
        }

        if (this.originalFiles.length === 0) {
            this.showError('Please select images first.');
            return;
        }

        if (this.originalFiles.length === 1) {
            await this.compressSingleImage();
        } else {
            await this.compressBatchImages();
        }
    }

    async compressSingleImage() {
        if (!this.originalImage) {
            this.showError('Please select an image first.');
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
                this.displaySingleResults(compressedDataUrl);
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

    async compressBatchImages() {
        this.isBatchProcessing = true;
        const { compressBtn, qualitySlider, formatSelect } = this.elements;
        
        // Show loading state
        compressBtn.innerHTML = '<div class="loading"></div> Compressing...';
        compressBtn.disabled = true;

        try {
            const quality = parseInt(qualitySlider.value) / 100;
            const format = formatSelect.value;
            
            this.compressedImages = [];
            
            // Process images sequentially to avoid overwhelming the browser
            for (let i = 0; i < this.originalFiles.length; i++) {
                const file = this.originalFiles[i];
                this.updateImageStatus(i, 'processing');
                
                try {
                    const compressedData = await this.compressFile(file, quality, format);
                    this.compressedImages.push({
                        originalFile: file,
                        compressedDataUrl: compressedData.dataUrl,
                        compressedImage: compressedData.image,
                        originalSize: file.size,
                        compressedSize: compressedData.size,
                        reduction: compressedData.reduction
                    });
                    
                    this.updateImageStatus(i, 'completed');
                } catch (error) {
                    console.error(`Error compressing ${file.name}:`, error);
                    this.updateImageStatus(i, 'error', 'Compression failed');
                }
                
                // Small delay to prevent blocking the UI
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            this.displayBatchResults();
            this.resetCompressButton();
            this.isBatchProcessing = false;
            
        } catch (error) {
            console.error('Batch compression error:', error);
            this.showError('Failed to compress images. Please try again.');
            this.resetCompressButton();
            this.isBatchProcessing = false;
        }
    }

    async compressFile(file, quality, format) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = async () => {
                try {
                    let compressedDataUrl;
                    if (this.serviceWorker) {
                        compressedDataUrl = await this.compressImageWithServiceWorker(img, quality, format);
                    } else {
                        compressedDataUrl = await this.compressImageWithIdleCallback(img, quality, format);
                    }
                    
                    const compressedImg = new Image();
                    compressedImg.onload = () => {
                        const compressedSize = this.getDataUrlSize(compressedDataUrl);
                        const reduction = ((file.size - compressedSize) / file.size) * 100;
                        
                        resolve({
                            dataUrl: compressedDataUrl,
                            image: compressedImg,
                            size: compressedSize,
                            reduction: reduction
                        });
                    };
                    compressedImg.src = compressedDataUrl;
                    
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
            
            img.src = URL.createObjectURL(file);
        });
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
            
            // Send compression request to Service Worker using MessagePort
            if (this.serviceWorker) {
                const messageChannel = new MessageChannel();
                
                // Listen for response on port1
                messageChannel.port1.onmessage = (event) => {
                    const { type, id, success, data: resultData, error } = event.data;
                    if (type === 'COMPRESSION_COMPLETE' && id === messageId) {
                        if (success) {
                            // Convert ArrayBuffer back to data URL
                            const blob = new Blob([new Uint8Array(resultData.data)], { type: resultData.mimeType });
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        } else {
                            reject(new Error(error));
                        }
                    }
                };
                
                // Send message with port2
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
                }, [messageChannel.port2]);
            } else {
                reject(new Error('Service Worker not available'));
            }
            
            // Timeout after 30 seconds
            setTimeout(() => {
                reject(new Error('Compression timeout'));
            }, 30000);
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

    displaySingleResults(compressedDataUrl) {
        const { 
            compressedImageEl, compressedDimensions, compressedSize, 
            sizeReduction, compressionRatio, resultsSection, singleResults, batchResults 
        } = this.elements;
        
        // Show single results, hide batch results
        singleResults.style.display = 'block';
        batchResults.style.display = 'none';
        
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

    displayBatchResults() {
        const { 
            resultsSection, singleResults, batchResults, downloadAllBtn,
            totalImages, totalSizeReduction, averageCompression, batchImageGrid
        } = this.elements;
        
        // Show batch results, hide single results
        singleResults.style.display = 'none';
        batchResults.style.display = 'block';
        
        // Calculate summary stats
        const totalOriginalSize = this.compressedImages.reduce((sum, img) => sum + img.originalSize, 0);
        const totalCompressedSize = this.compressedImages.reduce((sum, img) => sum + img.compressedSize, 0);
        const totalReduction = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100;
        const averageReduction = this.compressedImages.reduce((sum, img) => sum + img.reduction, 0) / this.compressedImages.length;
        
        // Update summary
        totalImages.textContent = this.compressedImages.length;
        totalSizeReduction.textContent = `${totalReduction.toFixed(1)}% (${this.formatFileSize(totalOriginalSize - totalCompressedSize)})`;
        averageCompression.textContent = `${averageReduction.toFixed(1)}%`;
        
        // Clear and populate batch image grid
        batchImageGrid.innerHTML = '';
        this.compressedImages.forEach((imgData, index) => {
            const card = this.createBatchImageCard(imgData, index);
            batchImageGrid.appendChild(card);
        });
        
        // Show download all button
        downloadAllBtn.style.display = 'inline-flex';
        
        // Show results section with optimized animation
        resultsSection.style.display = 'block';
        requestAnimationFrame(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth' });
            resultsSection.classList.add('success-animation');
            setTimeout(() => resultsSection.classList.remove('success-animation'), 600);
        });
    }

    createBatchImageCard(imgData, index) {
        const card = document.createElement('div');
        card.className = 'batch-image-card';
        
        const img = document.createElement('img');
        img.src = imgData.compressedDataUrl;
        img.alt = imgData.originalFile.name;
        
        const name = document.createElement('h5');
        name.textContent = imgData.originalFile.name;
        
        const stats = document.createElement('div');
        stats.className = 'batch-image-stats';
        stats.innerHTML = `
            <div>Original: ${this.formatFileSize(imgData.originalSize)}</div>
            <div>Compressed: ${this.formatFileSize(imgData.compressedSize)}</div>
            <div>Reduction: ${imgData.reduction.toFixed(1)}%</div>
        `;
        
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'btn btn-success batch-image-download';
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
        downloadBtn.onclick = () => this.downloadSingleCompressedImage(imgData);
        
        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(stats);
        card.appendChild(downloadBtn);
        
        return card;
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

    downloadSingleCompressedImage(imgData) {
        const link = document.createElement('a');
        link.download = this.generateBatchFileName(imgData.originalFile);
        link.href = imgData.compressedDataUrl;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async downloadAllCompressedImages() {
        if (!this.compressedImages || this.compressedImages.length === 0) {
            this.showError('No compressed images available.');
            return;
        }

        try {
            // Create ZIP file using JSZip (we'll need to add this library)
            if (typeof JSZip !== 'undefined') {
                await this.downloadAsZip();
            } else {
                // Fallback: download individual files
                this.downloadIndividualFiles();
            }
        } catch (error) {
            console.error('Download error:', error);
            this.showError('Failed to download images. Trying individual downloads...');
            this.downloadIndividualFiles();
        }
    }

    async downloadAsZip() {
        const zip = new JSZip();
        
        this.compressedImages.forEach((imgData, index) => {
            // Convert data URL to blob
            const base64Data = imgData.compressedDataUrl.split(',')[1];
            const fileName = this.generateBatchFileName(imgData.originalFile);
            zip.file(fileName, base64Data, { base64: true });
        });
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        
        const link = document.createElement('a');
        link.download = `compressed_images_${new Date().getTime()}.zip`;
        link.href = url;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
    }

    downloadIndividualFiles() {
        // Download files one by one with a small delay
        this.compressedImages.forEach((imgData, index) => {
            setTimeout(() => {
                this.downloadSingleCompressedImage(imgData);
            }, index * 500); // 500ms delay between downloads
        });
    }

    generateFileName() {
        const originalName = this.originalFile.name;
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
        const format = this.elements.formatSelect.value;
        const quality = this.elements.qualitySlider.value;
        
        return `${nameWithoutExt}_compressed_${quality}%.${format}`;
    }

    generateBatchFileName(file) {
        const originalName = file.name;
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
        const { compressBtn, compressBtnText } = this.elements;
        const fileCount = this.originalFiles.length;
        
        if (fileCount === 1) {
            compressBtnText.textContent = 'Compress Image & Reduce Size';
        } else if (fileCount > 1) {
            compressBtnText.textContent = `Compress ${fileCount} Images & Reduce Size`;
        } else {
            compressBtnText.textContent = 'Compress Image & Reduce Size';
        }
        
        compressBtn.innerHTML = `<i class="fas fa-compress-alt"></i> <span id="compressBtnText">${compressBtnText.textContent}</span>`;
        compressBtn.disabled = false;
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
