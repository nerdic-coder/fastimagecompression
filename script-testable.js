// Extract ImageCompressor class for testing
// This is a simplified version of the main script.js for testing purposes

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
        this.isSafariIOS = false;
    }

    initialize() {
        this.initializeElements();
        this.bindEvents();
        this.preCreateCanvas();
        this.detectSafariAndApplyFixes();
    }

    initializeElements() {
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
            batchImageGrid: document.getElementById('batchImageGrid'),
            exportReportTxtBtn: document.getElementById('exportReportTxtBtn'),
            exportReportMdBtn: document.getElementById('exportReportMdBtn')
        };
    }

    preCreateCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    bindEvents() {
        // Simplified event binding for testing
        const { uploadArea, fileInput, qualitySlider, compressBtn, downloadBtn, downloadAllBtn, exportReportTxtBtn, exportReportMdBtn } = this.elements;
        
        if (uploadArea) {
            uploadArea.addEventListener('click', (e) => {
                if (!this.usesNativeFileInput && fileInput) {
                    fileInput.click();
                }
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        if (qualitySlider) {
            qualitySlider.addEventListener('input', (e) => this.updateQualityValue(e));
        }

        if (compressBtn) {
            compressBtn.addEventListener('click', () => this.compressImage());
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadCompressedImage());
        }

        if (downloadAllBtn) {
            downloadAllBtn.addEventListener('click', () => this.downloadAllCompressedImages());
        }

        if (exportReportTxtBtn) {
            exportReportTxtBtn.addEventListener('click', () => this.exportOptimizationReport('txt'));
        }

        if (exportReportMdBtn) {
            exportReportMdBtn.addEventListener('click', () => this.exportOptimizationReport('md'));
        }
    }

    detectSafariAndApplyFixes() {
        const userAgent = navigator.userAgent || '';
        const isIOS = /iPad|iPhone|iPod/.test(userAgent);
        const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
        
        this.isSafariIOS = isIOS && isSafari;
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            this.processFiles(files);
        }
    }

    processFiles(files) {
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
            this.originalFile = validFiles[0];
            this.processSingleFile(validFiles[0]);
        } else {
            this.processMultipleFiles(validFiles);
        }
    }

    processSingleFile(file) {
        this.showControls();
        this.showProgressSection([file]);
        this.prepareCompressButtonForImageLoad();

        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            this.originalImage = img;
            this.updateImageStatus(0, 'ready');
            this.displayOriginalImage();
            this.resetCompressButton();
        };

        img.onerror = (error) => {
            this.showError(`Failed to load image "${file.name}".`);
            this.updateImageStatus(0, 'error', 'Load failed');
            this.originalImage = null;
            this.originalFile = null;
            this.originalFiles = [];
            this.resetCompressButton();
        };

        try {
            const objectURL = URL.createObjectURL(file);
            img.src = objectURL;
        } catch (error) {
            this.showError('Error processing image. Please try a different file.');
            this.updateImageStatus(0, 'error', 'URL creation failed');
        }
    }

    processMultipleFiles(files) {
        this.showControls();
        this.updateCompressButtonForBatch(files.length);
        this.showProgressSection(files);
    }

    showControls() {
        const { controls, resultsSection, progressSection } = this.elements;
        
        if (controls) {
            controls.style.display = 'block';
        }
        if (resultsSection) {
            resultsSection.style.display = 'none';
        }
        if (progressSection) {
            progressSection.style.display = 'none';
        }
    }

    updateCompressButtonForBatch(fileCount) {
        const { compressBtnText } = this.elements;
        if (compressBtnText) {
            compressBtnText.textContent = `Compress ${fileCount} Images & Reduce Size`;
        }
    }

    showProgressSection(files) {
        const { progressSection, imageList } = this.elements;
        if (progressSection) {
            progressSection.style.display = 'block';
        }
        
        if (imageList) {
            imageList.innerHTML = '';
            files.forEach((file, index) => {
                const imageItem = this.createImageListItem(file, index);
                imageList.appendChild(imageItem);
            });
        }
        
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
        
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = file.name;
        
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
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (progressText) {
            progressText.textContent = `${completed} of ${total} images processed`;
        }
        if (progressPercent) {
            progressPercent.textContent = `${percentage}%`;
        }
    }

    updateImageStatus(index, status, error = null) {
        const imageItem = document.querySelector(`[data-index="${index}"]`);
        if (imageItem) {
            const statusEl = imageItem.querySelector('.image-item-status');
            if (statusEl) {
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
    }

    prepareCompressButtonForImageLoad() {
        const { compressBtn } = this.elements;
        if (compressBtn) {
            compressBtn.innerHTML = '<div class="loading"></div> Preparing image...';
            compressBtn.disabled = true;
        }
    }

    displayOriginalImage() {
        const { originalImageEl, originalSize, originalDimensions } = this.elements;
        if (originalImageEl && this.originalImage) {
            originalImageEl.src = this.originalImage.src;
        }
        if (originalSize && this.originalFile) {
            originalSize.textContent = this.formatFileSize(this.originalFile.size);
        }
        if (originalDimensions && this.originalImage) {
            originalDimensions.textContent = `${this.originalImage.width} × ${this.originalImage.height}`;
        }
    }

    updateQualityValue(e) {
        const { qualityValue } = this.elements;
        if (qualityValue) {
            qualityValue.textContent = e.target.value;
        }
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
        
        if (compressBtn) {
            compressBtn.innerHTML = '<div class="loading"></div> Compressing...';
            compressBtn.disabled = true;
        }

        try {
            const originalQuality = parseInt(qualitySlider.value) / 100;
            const format = formatSelect.value;
            
            this.updateImageStatus(0, 'processing');
            
            let compressedDataUrl = await this.compressImageWithIdleCallback(this.originalImage, originalQuality, format);
            let compressedSize = this.getDataUrlSize(compressedDataUrl);
            let finalQuality = originalQuality;
            
            if (compressedSize >= this.originalFile.size && originalQuality > 0.3) {
                const qualityLevels = [0.7, 0.5, 0.3, 0.2];
                for (const testQuality of qualityLevels) {
                    if (testQuality >= originalQuality) continue;
                    
                    const testCompressed = await this.compressImageWithIdleCallback(this.originalImage, testQuality, format);
                    const testSize = this.getDataUrlSize(testCompressed);
                    
                    if (testSize < this.originalFile.size) {
                        compressedDataUrl = testCompressed;
                        compressedSize = testSize;
                        finalQuality = testQuality;
                        break;
                    }
                }
            }
            
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
        
        if (compressBtn) {
            compressBtn.innerHTML = '<div class="loading"></div> Compressing...';
            compressBtn.disabled = true;
        }

        try {
            const quality = parseInt(qualitySlider.value) / 100;
            const format = formatSelect.value;
            
            this.compressedImages = [];
            
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
            
            if (this.isSafariIOS) {
                img.crossOrigin = 'anonymous';
            }
            
            img.onload = async () => {
                try {
                    let compressedDataUrl = await this.compressImageWithIdleCallback(img, quality, format);
                    
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
            
            img.onerror = (error) => {
                reject(new Error(`Failed to load image: ${file.name}`));
            };
            
            try {
                img.src = URL.createObjectURL(file);
            } catch (error) {
                reject(new Error(`Error processing image: ${file.name}`));
            }
        });
    }
    
    compressImageWithIdleCallback(image, quality, format) {
        return new Promise((resolve) => {
            if (typeof window.requestIdleCallback !== 'undefined') {
                window.requestIdleCallback(() => {
                    const result = this.compressImageData(image, quality, format);
                    resolve(result);
                }, { timeout: 5000 });
            } else {
                setTimeout(() => {
                    const result = this.compressImageData(image, quality, format);
                    resolve(result);
                }, 0);
            }
        });
    }

    compressImageData(image, quality, format) {
        return new Promise((resolve) => {
            this.canvas.width = image.width;
            this.canvas.height = image.height;
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            if (this.isSafariIOS) {
                this.ctx.imageSmoothingEnabled = true;
                this.ctx.imageSmoothingQuality = 'high';
            }
            
            this.ctx.drawImage(image, 0, 0);
            
            const mimeTypes = {
                'jpeg': 'image/jpeg',
                'webp': 'image/webp'
            };
            const mimeType = mimeTypes[format] || 'image/jpeg';
            
            const dataUrl = this.canvas.toDataURL(mimeType, quality);
            resolve(dataUrl);
        });
    }

    displaySingleResults(compressedDataUrl) {
        const { 
            compressedImageEl, compressedDimensions, compressedSize, 
            sizeReduction, compressionRatio, resultsSection, singleResults, batchResults, progressSection
        } = this.elements;
        
        if (progressSection) {
            progressSection.style.display = 'none';
        }
        
        if (singleResults) {
            singleResults.style.display = 'block';
        }
        if (batchResults) {
            batchResults.style.display = 'none';
        }
        
        if (compressedImageEl && this.compressedImage) {
            compressedImageEl.src = compressedDataUrl;
        }
        if (compressedDimensions && this.compressedImage) {
            compressedDimensions.textContent = `${this.compressedImage.width} × ${this.compressedImage.height}`;
        }
        
        const originalSize = this.originalFile.size;
        const compressedSizeBytes = this.getDataUrlSize(compressedDataUrl);
        
        if (compressedSize) {
            compressedSize.textContent = this.formatFileSize(compressedSizeBytes);
        }
        
        const sizeReductionBytes = originalSize - compressedSizeBytes;
        const reductionPercent = ((sizeReductionBytes / originalSize) * 100).toFixed(1);
        const compressionRatioValue = (originalSize / compressedSizeBytes).toFixed(1);
        
        if (compressedSizeBytes >= originalSize) {
            if (sizeReduction) {
                sizeReduction.textContent = `⚠️ File size increased by ${Math.abs(parseFloat(reductionPercent))}% (${this.formatFileSize(Math.abs(sizeReductionBytes))})`;
                sizeReduction.style.color = '#dc3545';
            }
            if (compressionRatio) {
                compressionRatio.textContent = `1:${compressionRatioValue}`;
                compressionRatio.style.color = '#dc3545';
            }
        } else {
            if (sizeReduction) {
                sizeReduction.textContent = `${reductionPercent}% (${this.formatFileSize(sizeReductionBytes)})`;
                sizeReduction.style.color = '#28a745';
            }
            if (compressionRatio) {
                compressionRatio.textContent = `${compressionRatioValue}:1`;
                compressionRatio.style.color = '#28a745';
            }
        }
        
        this.compressedDataUrl = compressedDataUrl;
        
        if (resultsSection) {
            resultsSection.style.display = 'block';
        }
    }

    displayBatchResults() {
        const { 
            resultsSection, singleResults, batchResults, downloadAllBtn, progressSection,
            totalImages, totalSizeReduction, averageCompression, batchImageGrid
        } = this.elements;
        
        if (progressSection) {
            progressSection.style.display = 'none';
        }
        
        if (singleResults) {
            singleResults.style.display = 'none';
        }
        if (batchResults) {
            batchResults.style.display = 'block';
        }
        
        const totalOriginalSize = this.compressedImages.reduce((sum, img) => sum + img.originalSize, 0);
        const totalCompressedSize = this.compressedImages.reduce((sum, img) => sum + img.compressedSize, 0);
        const totalReduction = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100;
        const averageReduction = this.compressedImages.reduce((sum, img) => sum + img.reduction, 0) / this.compressedImages.length;
        
        if (totalImages) {
            totalImages.textContent = this.compressedImages.length;
        }
        if (totalSizeReduction) {
            totalSizeReduction.textContent = `${totalReduction.toFixed(1)}% (${this.formatFileSize(totalOriginalSize - totalCompressedSize)})`;
        }
        if (averageCompression) {
            averageCompression.textContent = `${averageReduction.toFixed(1)}%`;
        }
        
        if (batchImageGrid) {
            batchImageGrid.innerHTML = '';
            this.compressedImages.forEach((imgData, index) => {
                const card = this.createBatchImageCard(imgData, index);
                batchImageGrid.appendChild(card);
            });
        }
        
        if (downloadAllBtn) {
            downloadAllBtn.style.display = 'inline-flex';
        }
        
        if (resultsSection) {
            resultsSection.style.display = 'block';
        }
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

    exportOptimizationReport(format = 'txt') {
        const report = this.generateOptimizationReport(format);
        if (!report) {
            this.showError('No compression results available yet. Compress an image first.');
            return;
        }

        const mimeType = format === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8';
        const blob = new Blob([report], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = this.generateReportFileName(format);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    generateReportFileName(format = 'txt') {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
        const mode = this.compressedImages?.length > 0 && !(this.originalFile && this.compressedDataUrl) ? 'batch' : (this.compressedImages?.length > 1 ? 'batch' : 'single');
        return `optimization-report_${mode}_${stamp}.${format}`;
    }

    estimateTransferSeconds(bytes, mbps) {
        if (!bytes || !mbps || mbps <= 0) return 0;
        return (bytes * 8) / (mbps * 1000 * 1000);
    }

    formatSeconds(seconds) {
        if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
        return `${seconds.toFixed(2)}s`;
    }

    buildLoadTimeEstimate(originalBytes, compressedBytes) {
        const profiles = [
            { label: 'Fast 3G', mbps: 1.6 },
            { label: 'Slow 4G', mbps: 9 },
            { label: 'Wi‑Fi', mbps: 30 },
        ];

        const estimates = profiles.map((p) => {
            const before = this.estimateTransferSeconds(originalBytes, p.mbps);
            const after = this.estimateTransferSeconds(compressedBytes, p.mbps);
            const saved = Math.max(0, before - after);
            return `${p.label}: ~${this.formatSeconds(saved)} saved`;
        });

        return `Estimated transfer-time savings (${estimates.join(' · ')})`;
    }

    generateOptimizationReport(format = 'txt') {
        const hasSingle = this.originalFile && this.compressedDataUrl;
        const hasBatch = this.compressedImages && this.compressedImages.length > 0;

        if (!hasSingle && !hasBatch) return '';

        const isBatch = hasBatch && (!hasSingle || this.compressedImages.length > 1);
        const originalBytes = isBatch
            ? this.compressedImages.reduce((sum, img) => sum + img.originalSize, 0)
            : this.originalFile.size;
        const compressedBytes = isBatch
            ? this.compressedImages.reduce((sum, img) => sum + img.compressedSize, 0)
            : this.getDataUrlSize(this.compressedDataUrl);

        const savedBytes = Math.max(0, originalBytes - compressedBytes);
        const reductionPct = originalBytes > 0 ? ((savedBytes / originalBytes) * 100) : 0;
        const ratio = compressedBytes > 0 ? (originalBytes / compressedBytes) : 0;
        const transferEstimate = this.buildLoadTimeEstimate(originalBytes, compressedBytes);
        const timestamp = new Date().toLocaleString();
        const selectedFormat = this.elements.formatSelect?.value || 'jpeg';
        const quality = this.elements.qualitySlider?.value || '70';

        const lines = format === 'md'
            ? [
                '# Optimization Report',
                '',
                `- **Timestamp:** ${timestamp}`,
                `- **Mode:** ${isBatch ? `Batch (${this.compressedImages.length} images)` : 'Single image'}`,
                `- **Selected format:** ${selectedFormat.toUpperCase()}`,
                `- **Quality:** ${quality}%`,
                '',
                '## Summary',
                '',
                `- Original size: ${this.formatFileSize(originalBytes)}`,
                `- Compressed size: ${this.formatFileSize(compressedBytes)}`,
                `- Size reduction: ${reductionPct.toFixed(1)}% (${this.formatFileSize(savedBytes)})`,
                `- Compression ratio: ${ratio.toFixed(2)}:1`,
                `- ${transferEstimate}`,
            ]
            : [
                'Optimization Report',
                '===================',
                `Timestamp: ${timestamp}`,
                `Mode: ${isBatch ? `Batch (${this.compressedImages.length} images)` : 'Single image'}`,
                `Selected format: ${selectedFormat.toUpperCase()}`,
                `Quality: ${quality}%`,
                '',
                'Summary',
                '-------',
                `Original size: ${this.formatFileSize(originalBytes)}`,
                `Compressed size: ${this.formatFileSize(compressedBytes)}`,
                `Size reduction: ${reductionPct.toFixed(1)}% (${this.formatFileSize(savedBytes)})`,
                `Compression ratio: ${ratio.toFixed(2)}:1`,
                transferEstimate,
            ];

        if (isBatch) {
            if (format === 'md') {
                lines.push('', '## Per-image results', '');
            } else {
                lines.push('', 'Per-image results', '-----------------');
            }

            this.compressedImages.forEach((img, index) => {
                lines.push(`${index + 1}. ${img.originalFile.name}: ${this.formatFileSize(img.originalSize)} -> ${this.formatFileSize(img.compressedSize)} (${img.reduction.toFixed(1)}% reduction)`);
            });
        }

        return `${lines.join('\n')}\n`;
    }

    getDataUrlSize(dataUrl) {
        const base64Length = dataUrl.split(',')[1].length;
        const padding = (dataUrl.match(/=/g) || []).length;
        return Math.floor((base64Length * 3) / 4) - padding;
    }

    downloadCompressedImage() {
        if (!this.compressedDataUrl) {
            this.showError('No compressed image available.');
            return;
        }

        const link = document.createElement('a');
        link.download = this.generateFileName();
        link.href = this.compressedDataUrl;
        
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
            if (typeof JSZip !== 'undefined') {
                await this.downloadAsZip();
            } else {
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
        
        URL.revokeObjectURL(url);
    }

    downloadIndividualFiles() {
        this.compressedImages.forEach((imgData, index) => {
            setTimeout(() => {
                this.downloadSingleCompressedImage(imgData);
            }, index * 500);
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
        
        if (compressBtnText) {
            if (fileCount === 1) {
                compressBtnText.textContent = 'Compress Image & Reduce Size';
            } else if (fileCount > 1) {
                compressBtnText.textContent = `Compress ${fileCount} Images & Reduce Size`;
            } else {
                compressBtnText.textContent = 'Compress Image & Reduce Size';
            }
        }
        
        if (compressBtn) {
            compressBtn.innerHTML = `<i class="fas fa-compress-alt"></i> <span id="compressBtnText">${compressBtnText ? compressBtnText.textContent : 'Compress Image & Reduce Size'}</span>`;
            compressBtn.disabled = false;
        }
    }

    showError(message) {
        requestAnimationFrame(() => {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-notification';
            
            // Check if style property exists before setting cssText
            if (errorDiv.style && typeof errorDiv.style.cssText !== 'undefined') {
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
            }
            
            errorDiv.textContent = message;
            
            if (document.body) {
                document.body.appendChild(errorDiv);
                
                const removeError = () => {
                    if (errorDiv.style && typeof errorDiv.style.cssText !== 'undefined') {
                        errorDiv.style.animation = 'slideOut 0.3s ease';
                    }
                    setTimeout(() => {
                        if (errorDiv.parentNode) {
                            document.body.removeChild(errorDiv);
                        }
                    }, 300);
                };
                
                if (typeof window.requestIdleCallback !== 'undefined') {
                    window.requestIdleCallback(() => {
                        setTimeout(removeError, 5000);
                    });
                } else {
                    setTimeout(removeError, 5000);
                }
            }
        });
    }

    // Helper method for testing
    isValidImageFile(file) {
        const hasImageMimeType = file.type && file.type.startsWith('image/');
        const hasImageExtension = file.name ? /\.(jpe?g|png|gif|webp|heic|heif|avif|bmp|tiff?)$/i.test(file.name) : false;
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
        
        return (hasImageMimeType || hasImageExtension) && isValidSize;
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ImageCompressor };
}
