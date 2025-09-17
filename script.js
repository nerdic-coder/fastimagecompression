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
        this.batchProgress = {
            current: 0,
            total: 0,
            completed: 0,
            errors: 0
        };
        this.usesNativeFileInput = false;
        
        // Defer heavy initialization
        requestIdleCallback ? 
            requestIdleCallback(() => this.initialize()) :
            setTimeout(() => this.initialize(), 0);
    }
    
    initialize() {
        this.initializeElements();
        this.bindEvents();
        this.preCreateCanvas();
        this.detectSafariAndApplyFixes();
    }
    
    detectSafariAndApplyFixes() {
        const userAgent = navigator.userAgent || '';
        const isIOS = /iPad|iPhone|iPod/.test(userAgent);
        const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const hasCoarsePointer = window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false;
        const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
        const isSmallScreen = window.innerWidth <= 768; // Force mobile UI on small screens
        const treatAsMobile = isIOS || isMobileUA || hasCoarsePointer || hasTouchSupport || isSmallScreen;

        // Debug logging
        console.log('Mobile Detection Debug:', {
            userAgent: userAgent,
            isIOS: isIOS,
            isMobileUA: isMobileUA,
            hasCoarsePointer: hasCoarsePointer,
            hasTouchSupport: hasTouchSupport,
            isSmallScreen: isSmallScreen,
            screenWidth: window.innerWidth,
            treatAsMobile: treatAsMobile
        });

        this.configureFileInput(isIOS || isMobileUA);

        const { uploadArea, fileInput, mobileUploadButton } = this.elements;
        if (!uploadArea || !fileInput) {
            console.error('Upload area or file input not found');
            return;
        }

        this.usesNativeFileInput = treatAsMobile;
        uploadArea.classList.toggle('touch-device', treatAsMobile);
        uploadArea.classList.toggle('no-touch', !treatAsMobile);

        console.log('Upload area classes after toggle:', uploadArea.className);

        if (treatAsMobile) {
            fileInput.classList.remove('file-input-hidden');
            fileInput.classList.add('file-input-touch');
            if (mobileUploadButton) {
                mobileUploadButton.setAttribute('aria-hidden', 'false');
                mobileUploadButton.setAttribute('tabindex', '0');
                console.log('Mobile upload button configured for mobile');
            }

            const mobileHint = uploadArea.querySelector('.multi-file-hint');
            if (mobileHint) {
                mobileHint.textContent = 'Tap "Choose Photos" to browse images from your device. You can select multiple at once!';
            }
        } else {
            fileInput.classList.add('file-input-hidden');
            fileInput.classList.remove('file-input-touch');
            if (mobileUploadButton) {
                mobileUploadButton.setAttribute('aria-hidden', 'true');
                mobileUploadButton.removeAttribute('tabindex');
                console.log('Mobile upload button configured for desktop');
            }
        }

        // Also handle window resize events to update mobile detection
        window.addEventListener('resize', () => {
            const newIsSmallScreen = window.innerWidth <= 768;
            const newTreatAsMobile = isIOS || isMobileUA || hasCoarsePointer || hasTouchSupport || newIsSmallScreen;
            
            if (newTreatAsMobile !== treatAsMobile) {
                console.log('Screen size changed, updating mobile detection');
                uploadArea.classList.toggle('touch-device', newTreatAsMobile);
                uploadArea.classList.toggle('no-touch', !newTreatAsMobile);
            }
        });
    }
    
    configureFileInput(isMobile) {
        const { fileInput } = this.elements;

        // For desktop browsers, create a completely clean file input
        if (!isMobile) {
            console.log('Desktop device detected - creating clean file input');
            
            // Remove all potentially problematic attributes
            fileInput.removeAttribute('capture');
            fileInput.removeAttribute('webkitdirectory');
            fileInput.removeAttribute('directory');
            
            // Set only the essential attributes
            fileInput.setAttribute('type', 'file');
            fileInput.setAttribute('accept', 'image/*');
            fileInput.setAttribute('multiple', 'true');
            
            console.log('Clean file input created for desktop');
        } else {
            // Mobile configuration
            fileInput.setAttribute('capture', 'environment');
            fileInput.removeAttribute('webkitdirectory');
            fileInput.setAttribute('multiple', 'true');
            console.log('Mobile device detected - capture attribute set');
        }

        console.log('File input configured for:', isMobile ? 'mobile' : 'desktop');
        console.log('File input attributes after configuration:', {
            type: fileInput.getAttribute('type'),
            capture: fileInput.getAttribute('capture'),
            webkitdirectory: fileInput.getAttribute('webkitdirectory'),
            directory: fileInput.getAttribute('directory'),
            multiple: fileInput.getAttribute('multiple'),
            accept: fileInput.getAttribute('accept')
        });
    }
    
    initializeElements() {
        // Cache DOM elements to reduce repeated queries
        this.elements = {
            uploadArea: document.getElementById('uploadArea'),
            fileInput: document.getElementById('fileInput'),
            mobileUploadButton: document.getElementById('mobileUploadButton'),
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
        const { uploadArea, fileInput, qualitySlider, compressBtn, downloadBtn, downloadAllBtn, mobileUploadButton } = this.elements;
        
        // Use passive listeners where possible for better performance
        const options = { passive: true };
        
        // Upload events - Simplified for better compatibility
        uploadArea.addEventListener('click', (e) => {
            if (this.usesNativeFileInput) {
                return;
            }
            // Prevent infinite loop by checking if the click originated from file input
            if (e.target === fileInput || e.target.closest('input[type="file"]')) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();
            console.log('Upload area clicked, triggering file input');
            
            // Simple direct click without complex timing
            try {
                fileInput.click();
                console.log('File input click triggered');
            } catch (error) {
                console.error('Error triggering file input:', error);
                this.showError('Unable to open file picker. Please try the "Choose Photos" button below.');
            }
        }, false);
        
        // Add touch events for mobile Safari
        uploadArea.addEventListener('touchstart', (e) => {
            if (this.usesNativeFileInput) {
                return;
            }
            e.preventDefault();
        }, { passive: false });

        uploadArea.addEventListener('touchend', (e) => {
            if (this.usesNativeFileInput) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            console.log('Upload area touched, triggering file input');

            // Simple direct click for touch events
            try {
                fileInput.click();
                console.log('File input click triggered from touch');
            } catch (error) {
                console.error('Error triggering file input from touch:', error);
                this.showError('Unable to open file picker. Please try the "Choose Photos" button below.');
            }
        }, { passive: false });

        fileInput.addEventListener('change', (e) => this.handleFileSelect(e), options);

        if (mobileUploadButton) {
            mobileUploadButton.addEventListener('keydown', (e) => {
                if (!this.usesNativeFileInput) {
                    return;
                }

                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                    try {
                        fileInput.click();
                    } catch (error) {
                        console.error('Error triggering file input from keyboard:', error);
                    }
                }
            });
        }
        
        // Add debugging for file input click
        fileInput.addEventListener('click', (e) => {
            console.log('File input clicked directly - this should open file picker');
            console.log('File input attributes at click time:', {
                type: e.target.getAttribute('type'),
                capture: e.target.getAttribute('capture'),
                webkitdirectory: e.target.getAttribute('webkitdirectory'),
                directory: e.target.getAttribute('directory'),
                multiple: e.target.getAttribute('multiple'),
                accept: e.target.getAttribute('accept')
            });
        }, false);
        
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
        console.log('Files selected:', files.length, 'files');
        console.log('File input attributes:', {
            capture: e.target.getAttribute('capture'),
            webkitdirectory: e.target.getAttribute('webkitdirectory'),
            multiple: e.target.getAttribute('multiple'),
            accept: e.target.getAttribute('accept')
        });
        
        if (files.length > 0) {
            console.log('File names:', files.map(f => f.name));
            this.processFiles(files);
        } else {
            console.log('No files selected or files not accessible');
            // Try to reset the file input for Safari iOS
            e.target.value = '';
        }
    }

    processFiles(files) {
        // Filter valid image files
        const validFiles = files.filter(file => {
            const hasImageMimeType = file.type && file.type.startsWith('image/');
            const hasImageExtension = file.name ? /\.(jpe?g|png|gif|webp|heic|heif|avif|bmp|tiff?)$/i.test(file.name) : false;

            if (!hasImageMimeType && !hasImageExtension) {
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
        this.showControls();
        this.showProgressSection([file]);
        this.prepareCompressButtonForImageLoad();

        // Create image object
        const img = new Image();
        img.onload = () => {
            this.originalImage = img;
            this.updateImageStatus(0, 'ready');
            this.displayOriginalImage();
            this.resetCompressButton();
        };

        img.onerror = () => {
            this.showError('Failed to load image. Please try another file.');
            this.updateImageStatus(0, 'error', 'Load failed');
            this.originalImage = null;
            this.originalFile = null;
            this.originalFiles = [];
            this.resetCompressButton();
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
                case 'ready':
                    statusEl.textContent = 'Ready to compress';
                    break;
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

    prepareCompressButtonForImageLoad() {
        const { compressBtn } = this.elements;
        if (!compressBtn) {
            return;
        }

        compressBtn.innerHTML = '<div class="loading"></div> Preparing image...';
        compressBtn.disabled = true;
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
            
            // Update progress for single image
            this.updateImageStatus(0, 'processing');
            
            // Use main thread compression only (Service Worker disabled)
            let compressedDataUrl;
            compressedDataUrl = await this.compressImageWithIdleCallback(this.originalImage, quality, format);
            
            // Create compressed image object
            const compressedImg = new Image();
            compressedImg.onload = () => {
                this.compressedImage = compressedImg;
                this.updateImageStatus(0, 'completed');
                this.displaySingleResults(compressedDataUrl);
                this.resetCompressButton();
                this.isProcessing = false;
            };
            compressedImg.src = compressedDataUrl;
            
        } catch (error) {
            console.error('Compression error:', error);
            this.updateImageStatus(0, 'error', 'Compression failed');
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
                    // Use main thread compression only (Service Worker disabled)
                    let compressedDataUrl;
                    compressedDataUrl = await this.compressImageWithIdleCallback(img, quality, format);
                    
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
            sizeReduction, compressionRatio, resultsSection, singleResults, batchResults, progressSection
        } = this.elements;
        
        // Hide progress section when showing results
        progressSection.style.display = 'none';
        
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
            resultsSection, singleResults, batchResults, downloadAllBtn, progressSection,
            totalImages, totalSizeReduction, averageCompression, batchImageGrid
        } = this.elements;
        
        // Hide progress section when showing results
        progressSection.style.display = 'none';
        
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
