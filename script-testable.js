// Testable ImageCompressor class extracted from script.js
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
        this.supportedOutputFormats = { jpeg: true, png: true, webp: true, avif: false };

        // Defer heavy initialization with Safari iOS compatibility
        if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(() => this.initialize());
        } else {
            // Fallback for Safari iOS and other browsers without requestIdleCallback
            setTimeout(() => this.initialize(), 0);
        }
    }

    initialize() {
        this.initializeElements();
        this.bindEvents();
        this.preCreateCanvas();
        this.detectSafariAndApplyFixes();
        this.detectSupportedOutputFormats();
        this.applyOutputFormatAvailability();
        this.applyLandingPreset();

        // Analytics
        this.analytics = {
            enabled: typeof window !== 'undefined' && typeof window.gtag === 'function',
        };

        // Initialize FAQ after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.initializeFAQ();
        }, 100);
    }

    applyLandingPreset() {
        const params = new URLSearchParams(window.location?.search || '');
        const target = Number(params.get('targetSizeKb') || 0);
        if (target > 0 && this.elements?.targetSizeKb) this.elements.targetSizeKb.value = String(target);
        const maxDimension = Number(params.get('maxDimension') || 0);
        if (maxDimension > 0 && this.elements?.maxDimension) this.elements.maxDimension.value = String(maxDimension);
    }

    detectSafariAndApplyFixes() {
        const userAgent = navigator.userAgent || '';
        const isIOS = /iPad|iPhone|iPod/.test(userAgent);
        const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
        const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const hasCoarsePointer = window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false;
        const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
        const isSmallScreen = window.innerWidth <= 768; // Force mobile UI on small screens
        const treatAsMobile = isIOS || isMobileUA || hasCoarsePointer || hasTouchSupport || isSmallScreen;

        // Store Safari iOS detection for later use
        this.isSafariIOS = isIOS && isSafari;

        // Debug logging
        console.log('Mobile Detection Debug:', {
            userAgent: userAgent,
            isIOS: isIOS,
            isSafari: isSafari,
            isSafariIOS: this.isSafariIOS,
            isMobileUA: isMobileUA,
            hasCoarsePointer: hasCoarsePointer,
            hasTouchSupport: hasTouchSupport,
            isSmallScreen: isSmallScreen,
            screenWidth: window.innerWidth,
            treatAsMobile: treatAsMobile
        });

        this.configureFileInput(isIOS || isMobileUA);

        const { uploadArea, fileInput, mobileUploadButton } = this.elements || {};
        if (!uploadArea || !fileInput || !fileInput.classList) {
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
                mobileHint.textContent = 'Tap "Choose Photos" to select from library, camera, or files. You can select multiple at once!';
            }

            // Configure format options for iOS
            this.configureFormatOptionsForIOS();
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

        // Debug: Add a test function to force show controls
        window.testShowControls = () => {
            console.log('Testing showControls function');
            this.showControls();
        };
    }

    configureFileInput(isMobile) {
        const { fileInput } = this.elements || {};
        if (!fileInput) return;

        console.log('Configuring file input for:', isMobile ? 'mobile' : 'desktop');

        // Remove all potentially problematic attributes for both mobile and desktop
        if (typeof fileInput.removeAttribute !== 'function') return;
        fileInput.removeAttribute('capture');
        fileInput.removeAttribute('webkitdirectory');
        fileInput.removeAttribute('directory');

        // Set only the essential attributes for both mobile and desktop
        fileInput.setAttribute('type', 'file');
        fileInput.setAttribute('accept', 'image/*');
        fileInput.setAttribute('multiple', 'true');

        console.log('File input configured - native picker will be used');
        console.log('File input attributes after configuration:', {
            type: fileInput.getAttribute('type'),
            capture: fileInput.getAttribute('capture'),
            webkitdirectory: fileInput.getAttribute('webkitdirectory'),
            directory: fileInput.getAttribute('directory'),
            multiple: fileInput.getAttribute('multiple'),
            accept: fileInput.getAttribute('accept')
        });
    }

    configureFormatOptionsForIOS() {
        const { formatSelect } = this.elements;

        if (!formatSelect) {
            console.error('Format select element not found');
            return;
        }

        if (this.isSafariIOS) {
            console.log('Configuring format options for Safari iOS - hiding format selector');

            // Hide the entire format control group for Safari iOS for safest behavior
            const formatControlGroup = formatSelect.closest('.control-group');
            if (formatControlGroup) {
                formatControlGroup.style.display = 'none';
                console.log('Format control group hidden for Safari iOS');
            }

            // Ensure JPEG is selected as default
            formatSelect.value = 'jpeg';
            console.log('Format options configured for Safari iOS - JPEG only');
        } else {
            console.log('Not Safari iOS - keeping all supported format options available');
        }
    }

    detectSupportedOutputFormats() {
        const support = { jpeg: true, png: true, webp: false, avif: false };

        if (!this.canvas || typeof this.canvas.toDataURL !== 'function') {
            this.supportedOutputFormats = support;
            return support;
        }

        const canEncode = (mimeType) => {
            try {
                const dataUrl = this.canvas.toDataURL(mimeType, 0.8);
                return typeof dataUrl === 'string' && dataUrl.startsWith(`data:${mimeType}`);
            } catch (error) {
                return false;
            }
        };

        support.webp = canEncode('image/webp');
        support.avif = !this.isSafariIOS && canEncode('image/avif');

        this.supportedOutputFormats = support;
        console.log('Detected output format support:', support);
        return support;
    }

    applyOutputFormatAvailability() {
        const { formatSelect } = this.elements;
        if (!formatSelect || typeof formatSelect.querySelector !== 'function') return;

        const labels = { jpeg: 'JPEG', png: 'PNG', webp: 'WebP', avif: 'AVIF' };
        ['jpeg', 'png', 'webp', 'avif'].forEach((format) => {
            let option = formatSelect.querySelector(`option[value="${format}"]`);
            if (!option) {
                option = document.createElement('option');
                option.value = format;
                option.textContent = labels[format] || format.toUpperCase();
                formatSelect.appendChild(option);
            }

            option.hidden = !this.supportedOutputFormats[format];
            option.disabled = !this.supportedOutputFormats[format];
        });

        const currentFormat = formatSelect.value || 'jpeg';
        if (!this.supportedOutputFormats[currentFormat]) {
            formatSelect.value = 'jpeg';
        }
    }

    resolveOutputFormat(format) {
        const requestedFormat = format || 'jpeg';
        if (requestedFormat === 'avif' && this.isSafariIOS) {
            return 'jpeg';
        }
        if (this.supportedOutputFormats[requestedFormat]) {
            return requestedFormat;
        }
        return 'jpeg';
    }

    getRecommendedFormat(originalFile) {
        if (!originalFile || !originalFile.type) {
            return 'jpeg'; // Default fallback
        }

        const originalType = originalFile.type.toLowerCase();
        const fileName = originalFile.name.toLowerCase();

        // Preserve PNG transparency by default when alpha detection is unavailable.
        if (originalType.includes('png') || fileName.endsWith('.png')) {
            return this.hasTransparency === false ? 'jpeg' : 'png';
        }

        // If original is WebP, keep as WebP (if supported)
        if (originalType.includes('webp') || fileName.endsWith('.webp')) {
            return 'webp';
        }

        // For JPEG and other opaque formats, recommend JPEG for best compression.
        return 'jpeg';
    }

    detectImageTransparency(image) {
        if (!image || typeof document?.createElement !== 'function') return null;

        try {
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth || image.width;
            canvas.height = image.naturalHeight || image.height;
            const context = canvas.getContext('2d', { willReadFrequently: true });
            if (!context || !canvas.width || !canvas.height) return null;

            context.drawImage(image, 0, 0);
            const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
            for (let index = 3; index < pixels.length; index += 4) {
                if (pixels[index] < 255) return true;
            }
            return false;
        } catch (error) {
            console.warn('Unable to detect image transparency; preserving PNG output.', error);
            return null;
        }
    }

    isUnsupportedGif(file) {
        if (!file) return false;
        const type = (file.type || '').toLowerCase();
        const name = (file.name || '').toLowerCase();
        return type === 'image/gif' || name.endsWith('.gif');
    }

    resetBatchProgress(total = this.originalFiles.length) {
        this.batchProgress = { current: 0, total, completed: 0, errors: 0 };
    }

    formatBatchSizeChange(originalSize, compressedSize) {
        if (!originalSize || compressedSize <= originalSize) {
            const bytes = originalSize - compressedSize;
            const reduction = originalSize ? (bytes / originalSize) * 100 : 0;
            return `${reduction.toFixed(1)}% (${this.formatFileSize(Math.max(0, bytes))})`;
        }

        const increase = ((compressedSize - originalSize) / originalSize) * 100;
        return `File size increased by ${increase.toFixed(1)}% (${this.formatFileSize(compressedSize - originalSize)})`;
    }

    updateFormatRecommendation() {
        if (!this.originalFile) return;

        const recommendedFormat = this.getRecommendedFormat(this.originalFile);
        const { formatSelect } = this.elements;

        if (formatSelect && formatSelect.value !== recommendedFormat) {
            console.log(`Recommending format change from ${formatSelect.value} to ${recommendedFormat} for better compression`);

            // Update the format select
            formatSelect.value = recommendedFormat;

            // Show a subtle hint
            const formatLabel = document.querySelector('label[for="formatSelect"]');
            if (formatLabel && !this.isSafariIOS) {
                const originalText = formatLabel.textContent.replace(/ \(.*\)/, '');
                formatLabel.innerHTML = `${originalText} <small style="color: #28a745;">(Recommended: ${recommendedFormat.toUpperCase()})</small>`;

                // Remove the hint after 5 seconds
                setTimeout(() => {
                    formatLabel.textContent = originalText;
                }, 5000);
            }
        }
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
            maxDimension: document.getElementById('maxDimension'),
            targetSizeKb: document.getElementById('targetSizeKb'),
            removeMetadata: document.getElementById('removeMetadata'),
            comparisonPanel: document.getElementById('comparisonPanel'),
            comparisonOriginal: document.getElementById('comparisonOriginal'),
            comparisonCompressed: document.getElementById('comparisonCompressed'),
            comparisonSlider: document.getElementById('comparisonSlider'),
            metadataResult: document.getElementById('metadataResult'),
            presetButtons: document.querySelectorAll('.preset-btn'),
            presetHint: document.getElementById('presetHint'),
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
            singleLoadTimeEstimate: document.getElementById('singleLoadTimeEstimate'),
            downloadBtn: document.getElementById('downloadBtn'),
            totalImages: document.getElementById('totalImages'),
            batchLoadTimeEstimate: document.getElementById('batchLoadTimeEstimate'),
            totalSizeReduction: document.getElementById('totalSizeReduction'),
            averageCompression: document.getElementById('averageCompression'),
            batchImageGrid: document.getElementById('batchImageGrid'),

            // Share hook elements
            shareResults: document.getElementById('shareResults'),
            shareMetrics: document.getElementById('shareMetrics'),
            copyShareTextBtn: document.getElementById('copyShareTextBtn'),
            copyShareLinkBtn: document.getElementById('copyShareLinkBtn'),
            shareFeedback: document.getElementById('shareFeedback')
        };

        // Debug: Check if critical elements are found
        console.log('Element initialization debug:', {
            uploadArea: !!this.elements.uploadArea,
            fileInput: !!this.elements.fileInput,
            controls: !!this.elements.controls,
            progressSection: !!this.elements.progressSection,
            resultsSection: !!this.elements.resultsSection
        });

        if (!this.elements.controls) {
            console.error('CRITICAL: Controls element not found!');
        }
    }

    preCreateCanvas() {
        // Pre-create canvas to avoid creating it during compression
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    bindEvents() {
        const {
            uploadArea,
            fileInput,
            qualitySlider,
            comparisonSlider,
            compressBtn,
            downloadBtn,
            downloadAllBtn,
            mobileUploadButton,
            copyShareTextBtn,
            presetButtons
        } = this.elements;

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
        if (comparisonSlider) comparisonSlider.addEventListener('input', (e) => this.updateComparisonPosition(e.target.value));

        if (presetButtons?.length) {
            presetButtons.forEach((button) => {
                button.addEventListener('click', () => this.applyPreset(button.dataset.preset));
            });
        }

        compressBtn.addEventListener('click', () => {
            this.trackEvent('compress_click', {
                output_format: this.elements.formatSelect?.value,
                quality: Number(this.elements.qualitySlider?.value),
                image_count: this.originalFiles?.length || (this.originalFile ? 1 : 0),
            });
            this.compressImage();
        }, options);

        downloadBtn.addEventListener('click', () => {
            this.trackEvent('download_click', {
                output_format: this.elements.formatSelect?.value,
                image_count: 1,
            });
            this.downloadCompressedImage();
        }, options);

        downloadAllBtn.addEventListener('click', () => {
            this.trackEvent('download_all_click', {
                output_format: this.elements.formatSelect?.value,
                image_count: this.compressedImages?.length || 0,
            });
            this.downloadAllCompressedImages();
        }, options);

        // Share results hook
        if (copyShareTextBtn) {
            copyShareTextBtn.addEventListener('click', () => this.copyShareText(), options);
        }
        if (this.elements.copyShareLinkBtn) {
            this.elements.copyShareLinkBtn.addEventListener('click', () => this.copyShareLink(), options);
        }
    }

    trackEvent(name, params = {}) {
        try {
            if (!this.analytics?.enabled) return;
            // GA4 event name should be lowercase/underscore
            window.gtag('event', name, {
                ...params,
                // Helpful context
                page_path: window.location?.pathname || undefined,
            });
        } catch {
            // no-op
        }
    }

    applyPreset(presetName) {
        const presets = {
            web: { quality: 78, format: 'webp', hint: 'Web preset: balanced quality and size for most websites.' },
            wordpress: { quality: 80, format: 'webp', hint: 'WordPress preset: strong balance for page speed and visual quality.' },
            social: { quality: 72, format: 'jpeg', hint: 'Social preset: tuned for broad compatibility and lighter files.' },
            email: { quality: 62, format: 'jpeg', hint: 'Email preset: smaller files for easier attachment and delivery.' },
        };

        const preset = presets[presetName];
        if (!preset || !this.elements?.qualitySlider || !this.elements?.formatSelect) return;

        this.elements.qualitySlider.value = String(preset.quality);
        this.elements.formatSelect.value = preset.format;
        this.elements.qualityValue.textContent = String(preset.quality);

        this.elements.presetButtons?.forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.preset === presetName);
        });

        if (this.elements.presetHint) {
            this.elements.presetHint.textContent = preset.hint;
        }

        this.trackEvent('preset_select', {
            preset: presetName,
            output_format: preset.format,
            quality: preset.quality,
        });
    }

    estimateTransferSeconds(bytes, mbps) {
        if (!bytes || !mbps || mbps <= 0) return 0;
        const bits = bytes * 8;
        const bitsPerSecond = mbps * 1000 * 1000;
        return bits / bitsPerSecond;
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
            console.log('File details:', files.map(f => ({
                name: f.name,
                size: f.size,
                type: f.type,
                lastModified: f.lastModified
            })));
            this.processFiles(files);
        } else {
            console.log('No files selected or files not accessible');
            // Try to reset the file input for Safari iOS
            e.target.value = '';
        }
    }

    processFiles(files) {
        console.log('processFiles called with', files.length, 'files');

        // Filter valid image files
        const validFiles = files.filter(file => {
            if (this.isUnsupportedGif(file)) {
                this.showError(`Skipping ${file.name}: GIF input is not supported because conversion would remove animation.`);
                return false;
            }
            const hasImageMimeType = file.type && file.type.startsWith('image/');
            const hasImageExtension = file.name ? /\.(jpe?g|png|gif|webp|heic|heif|avif|bmp|tiff?)$/i.test(file.name) : false;

            console.log(`File ${file.name}:`, {
                type: file.type,
                hasImageMimeType: hasImageMimeType,
                hasImageExtension: hasImageExtension,
                size: file.size
            });

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

        console.log('Valid files after filtering:', validFiles.length);

        if (validFiles.length === 0) {
            this.showError('No valid image files selected.');
            return;
        }

        this.originalFiles = validFiles;

        if (validFiles.length === 1) {
            // Single file - use existing single file flow
            console.log('Processing single file:', validFiles[0].name);
            this.originalFile = validFiles[0];
            this.processSingleFile(validFiles[0]);
        } else {
            // Multiple files - use batch processing flow
            console.log('Processing multiple files:', validFiles.length);
            this.processMultipleFiles(validFiles);
        }
    }

    processSingleFile(file) {
        console.log('processSingleFile called for:', file.name);
        this.showControls();
        this.showProgressSection([file]);
        this.prepareCompressButtonForImageLoad();

        // Create image object with Safari iOS compatibility
        const img = new Image();

        // Safari iOS specific fixes
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            console.log('Image loaded successfully:', file.name);
            this.originalImage = img;
            this.hasTransparency = this.detectImageTransparency(img);
            this.updateFormatRecommendation();
            this.updateImageStatus(0, 'ready');
            this.displayOriginalImage();
            this.resetCompressButton();
        };

        img.onerror = (error) => {
            console.error('Failed to load image:', file.name, error);
            this.showError(`Failed to load image "${file.name}". This might be due to Safari iOS restrictions. Please try a different image.`);
            this.updateImageStatus(0, 'error', 'Load failed');
            this.originalImage = null;
            this.originalFile = null;
            this.originalFiles = [];
            this.resetCompressButton();
        };

        console.log('Creating object URL for image:', file.name);
        try {
            const objectURL = URL.createObjectURL(file);
            console.log('Object URL created:', objectURL);
            img.src = objectURL;
        } catch (error) {
            console.error('Error creating object URL:', error);
            this.showError('Error processing image. Please try a different file.');
            this.updateImageStatus(0, 'error', 'URL creation failed');
        }
    }

    processMultipleFiles(files) {
        console.log('processMultipleFiles called for', files.length, 'files');
        this.showControls();
        this.updateCompressButtonForBatch(files.length);
        this.showProgressSection(files);
    }

    showControls() {
        console.log('showControls called');
        const { controls, resultsSection, progressSection } = this.elements;

        if (!controls) {
            console.error('Controls element not found!');
            return;
        }

        console.log('Showing controls, hiding results and progress sections');
        controls.style.display = 'block';
        resultsSection.style.display = 'none';
        progressSection.style.display = 'none';

        // Use requestAnimationFrame for smoother animations
        requestAnimationFrame(() => {
            controls.style.transition = 'all 0.3s ease';
            controls.style.opacity = '1';
            controls.style.transform = 'translateY(0)';
            console.log('Controls animation applied');
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
        if (compressBtn) { compressBtn.innerHTML = '<div class="loading"></div> Compressing...'; compressBtn.disabled = true; }

        try {
            const originalQuality = parseInt(qualitySlider.value) / 100;
            const format = formatSelect.value;
            const options = this.getCompressionOptions();

            // Update progress for single image
            this.updateImageStatus(0, 'processing');

            // Try compression with original settings first
            let compressedDataUrl = await this.compressWithTargetSize(this.originalImage, originalQuality, format, options);
            let compressedSize = this.getDataUrlSize(compressedDataUrl);
            let finalQuality = originalQuality;

            // If compression resulted in larger file, try with lower quality
            if (compressedSize >= this.originalFile.size && originalQuality > 0.3) {
                console.log('Compression increased file size, trying lower quality...');
                compressBtn.innerHTML = '<div class="loading"></div> Optimizing compression...';

                // Try progressively lower quality settings
                const qualityLevels = [0.7, 0.5, 0.3, 0.2];
                for (const testQuality of qualityLevels) {
                    if (testQuality >= originalQuality) continue;

                    const testCompressed = await this.compressImageWithIdleCallback(this.originalImage, testQuality, format);
                    const testSize = this.getDataUrlSize(testCompressed);

                    console.log(`Testing quality ${testQuality}: original=${this.originalFile.size}, compressed=${testSize}`);

                    if (testSize < this.originalFile.size) {
                        compressedDataUrl = testCompressed;
                        compressedSize = testSize;
                        finalQuality = testQuality;
                        console.log(`Found better compression at quality ${testQuality}`);
                        break;
                    }
                }
            }

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
        if (compressBtn) { compressBtn.innerHTML = '<div class="loading"></div> Compressing...'; compressBtn.disabled = true; }

        try {
            const quality = parseInt(qualitySlider.value) / 100;
            const format = formatSelect.value;
            const options = this.getCompressionOptions();

            this.compressedImages = [];
            this.resetBatchProgress(this.originalFiles.length);

            // Process images sequentially to avoid overwhelming the browser
            for (let i = 0; i < this.originalFiles.length; i++) {
                const file = this.originalFiles[i];
                this.updateImageStatus(i, 'processing');

                try {
                    const compressedData = await this.compressFile(file, quality, format, options);
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

    async compressFile(file, quality, format, options = this.getCompressionOptions()) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            // Safari iOS specific fixes
            if (this.isSafariIOS) {
                img.crossOrigin = 'anonymous';
            }

            img.onload = async () => {
                try {
                    // Use main thread compression only (Service Worker disabled)
                    let compressedDataUrl;
                    compressedDataUrl = await this.compressWithTargetSize(img, quality, format, options);

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
                console.error('Failed to load image in batch processing:', file.name, error);
                reject(new Error(`Failed to load image: ${file.name}`));
            };

            try {
                img.src = URL.createObjectURL(file);
            } catch (error) {
                console.error('Error creating object URL in batch processing:', error);
                reject(new Error(`Error processing image: ${file.name}`));
            }
        });
    }

    // Break compression into smaller chunks using idle callbacks
    compressImageWithIdleCallback(image, quality, format, options = {}) {
        return new Promise((resolve) => {
            if (typeof window.requestIdleCallback !== 'undefined') {
                // Use idle callback to avoid blocking main thread
                window.requestIdleCallback(() => {
                    const result = this.compressImageData(image, quality, format, options);
                    resolve(result);
                }, { timeout: 5000 });
            } else {
                // Fallback for browsers without requestIdleCallback (Safari iOS)
                setTimeout(() => {
                    const result = this.compressImageData(image, quality, format, options);
                    resolve(result);
                }, 0);
            }
        });
    }

    getCompressionOptions() {
        const maxDimension = Number(this.elements?.maxDimension?.value || 0);
        const targetSizeKb = Number(this.elements?.targetSizeKb?.value || 0);
        return { maxDimension: Number.isFinite(maxDimension) ? maxDimension : 0, targetSizeKb: Number.isFinite(targetSizeKb) ? targetSizeKb : 0, removeMetadata: this.elements?.removeMetadata?.checked !== false };
    }

    getOutputDimensions(width, height, maxDimension = 0) {
        if (!maxDimension || Math.max(width, height) <= maxDimension) return { width, height };
        const scale = maxDimension / Math.max(width, height);
        return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
    }

    async compressWithTargetSize(image, quality, format, options = {}) {
        const targetBytes = Number(options.targetSizeKb || 0) * 1024;
        if (!targetBytes) return this.compressImageWithIdleCallback(image, quality, format, options);
        let low = 0.1, high = Math.max(0.1, Math.min(1, quality)), best = null;
        for (let attempt = 0; attempt < 8; attempt += 1) {
            const candidateQuality = (low + high) / 2;
            const candidate = await this.compressImageWithIdleCallback(image, candidateQuality, format, options);
            const size = this.getDataUrlSize(candidate);
            if (size <= targetBytes) { best = candidate; low = candidateQuality; } else { high = candidateQuality; }
        }
        if (best) return best;
        return this.compressImageWithIdleCallback(image, 0.1, format, options);
    }

    updateComparisonPosition(value) {
        const after = this.elements?.comparisonPanel?.querySelector('.comparison-after');
        if (!after) return;

        const position = Math.max(0, Math.min(100, Number(value) || 0));
        after.style.width = `${position}%`;

        // The clipped layer must keep the same scale as the full-width image.
        // At 25%, for example, its image needs to be 400% of the clipped layer;
        // otherwise moving the handle left makes the preview itself shrink.
        const afterImage = after.querySelector('img');
        if (afterImage) {
            afterImage.style.width = position > 0 ? `${10000 / position}%` : '100%';
        }
    }

    updateComparison(originalUrl, compressedUrl) {
        const { comparisonPanel, comparisonOriginal, comparisonCompressed } = this.elements;
        if (!comparisonPanel || !comparisonOriginal || !comparisonCompressed) return;
        comparisonOriginal.src = originalUrl; comparisonCompressed.src = compressedUrl;
        comparisonPanel.style.display = 'block'; this.updateComparisonPosition(this.elements.comparisonSlider?.value || 50);
    }

    compressImageData(image, quality, format, options = this.getCompressionOptions()) {
        return new Promise((resolve) => {
            console.log('Starting compression:', {
                originalWidth: image.width,
                originalHeight: image.height,
                quality: quality,
                format: format,
                isSafariIOS: this.isSafariIOS,
                originalFormat: this.originalFile ? this.originalFile.type : 'unknown'
            });

            // Use pre-created canvas to avoid DOM creation overhead
            const dimensions = this.getOutputDimensions(image.width, image.height, options.maxDimension);
            this.canvas.width = dimensions.width;
            this.canvas.height = dimensions.height;

            // Clear canvas first (important for Safari iOS)
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Safari iOS specific optimizations
            if (this.isSafariIOS) {
                // Set image smoothing for better compression
                this.ctx.imageSmoothingEnabled = true;
                this.ctx.imageSmoothingQuality = 'high';
            }

            // Draw image on canvas
            this.ctx.drawImage(image, 0, 0, dimensions.width, dimensions.height);

            const safeFormat = this.resolveOutputFormat(format);
            const mimeTypes = {
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'webp': 'image/webp',
                'avif': 'image/avif'
            };
            const requestedMimeType = mimeTypes[safeFormat] || 'image/jpeg';

            console.log('Canvas dimensions:', {
                width: this.canvas.width,
                height: this.canvas.height
            });

            let dataUrl = this.canvas.toDataURL(requestedMimeType, quality);
            let actualMimeType = requestedMimeType;

            // Graceful fallback when browser silently returns a different format
            if (!dataUrl.startsWith(`data:${requestedMimeType}`)) {
                actualMimeType = 'image/jpeg';
                dataUrl = this.canvas.toDataURL(actualMimeType, quality);
            }

            // Calculate compressed size
            const compressedSize = this.getDataUrlSize(dataUrl);
            console.log('Compression result:', {
                originalSize: this.originalFile ? this.originalFile.size : 'unknown',
                compressedSize: compressedSize,
                dataUrlLength: dataUrl.length,
                requestedMimeType: requestedMimeType,
                actualMimeType: actualMimeType,
                quality: quality,
                formatChange: this.originalFile ? (this.originalFile.type !== actualMimeType) : false
            });

            resolve(dataUrl);
        });
    }

    updateShareHook({ originalBytes, compressedBytes, imageCount }) {
        const { shareResults, shareMetrics, copyShareLinkBtn, shareFeedback } = this.elements;

        if (!shareResults || !shareMetrics || !copyShareLinkBtn) {
            return;
        }

        const savingsBytes = originalBytes - compressedBytes;
        const savingsPct = originalBytes > 0 ? (savingsBytes / originalBytes) * 100 : 0;

        // Only show when there is a positive reduction.
        if (!(savingsBytes > 0)) {
            shareResults.style.display = 'none';
            return;
        }

        const savingsText = `${this.formatFileSize(savingsBytes)} (${savingsPct.toFixed(1)}%)`;
        const countText = imageCount === 1 ? '1 image' : `${imageCount} images`;

        shareMetrics.textContent = `Saved ${savingsText} across ${countText} (processed locally in your browser).`;

        const shareText = `I compressed ${countText} and saved ${savingsText} using FastImageCompression (runs locally in your browser - no uploads): https://fastimagecompression.com/`;

        // Store share text for copy handler
        this.lastShareText = shareText;

        // Store share link for copy handler
        this.lastShareLink = 'https://fastimagecompression.com/';

        if (shareFeedback) {
            shareFeedback.textContent = '';
        }

        shareResults.style.display = 'block';
    }

    async copyShareText() {
        const { shareFeedback } = this.elements;
        const text = this.lastShareText;

        if (!text) {
            if (shareFeedback) shareFeedback.textContent = 'Nothing to copy yet. Compress an image first.';
            return;
        }

        this.trackEvent('copy_results_text', {
            output_format: this.elements.formatSelect?.value,
        });

        await this.copyToClipboard(text);
        if (shareFeedback) shareFeedback.textContent = 'Copied!';
    }

    async copyShareLink() {
        const { shareFeedback } = this.elements;
        const link = this.lastShareLink || 'https://fastimagecompression.com/';

        this.trackEvent('copy_link', {
            output_format: this.elements.formatSelect?.value,
        });

        await this.copyToClipboard(link);
        if (shareFeedback) shareFeedback.textContent = 'Link copied!';
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return;
        } catch {
            // ignore and fall back
        }

        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
        } finally {
            document.body.removeChild(textarea);
        }
    }

    displaySingleResults(compressedDataUrl) {
        const {
            compressedImageEl, compressedDimensions, compressedSize,
            sizeReduction, compressionRatio, singleLoadTimeEstimate, resultsSection, singleResults, batchResults, progressSection
        } = this.elements;

        // Hide progress section when showing results
        progressSection.style.display = 'none';

        // Show single results, hide batch results
        singleResults.style.display = 'block';
        batchResults.style.display = 'none';

        // Display compressed image
        compressedImageEl.src = compressedDataUrl;
        this.updateComparison(this.originalImage?.src, compressedDataUrl);
        if (this.elements.metadataResult) this.elements.metadataResult.textContent = this.getCompressionOptions().removeMetadata ? 'Metadata removal: enabled (local re-encoding)' : 'Metadata removal: disabled';
        compressedDimensions.textContent = `${this.compressedImage.width} × ${this.compressedImage.height}`;

        // Calculate file sizes
        const originalSize = this.originalFile.size;
        const compressedSizeBytes = this.getDataUrlSize(compressedDataUrl);

        compressedSize.textContent = this.formatFileSize(compressedSizeBytes);

        // Calculate compression stats
        const sizeReductionBytes = originalSize - compressedSizeBytes;
        const reductionPercent = ((sizeReductionBytes / originalSize) * 100).toFixed(1);
        const compressionRatioValue = (originalSize / compressedSizeBytes).toFixed(1);

        // Check if compression actually reduced file size
        if (compressedSizeBytes >= originalSize) {
            console.warn('Compression resulted in larger file size!', {
                originalSize: originalSize,
                compressedSize: compressedSizeBytes,
                increase: compressedSizeBytes - originalSize,
                format: this.elements.formatSelect.value,
                originalFormat: this.originalFile.type
            });

            // Show warning message with format-specific advice
            let warningMessage;
            if (this.elements.formatSelect.value === 'webp') {
                warningMessage = `⚠️ WebP conversion increased file size by ${Math.abs(parseFloat(reductionPercent))}% (${this.formatFileSize(Math.abs(sizeReductionBytes))}). WebP compression may not work well with this image. Try using JPEG format instead.`;
            } else {
                warningMessage = `⚠️ File size increased by ${Math.abs(parseFloat(reductionPercent))}% (${this.formatFileSize(Math.abs(sizeReductionBytes))}). This can happen with certain image types or when using high quality settings. Try lowering the quality slider or changing the output format.`;
            }

            // Show warning message
            sizeReduction.textContent = `⚠️ File size increased by ${Math.abs(parseFloat(reductionPercent))}% (${this.formatFileSize(Math.abs(sizeReductionBytes))})`;
            sizeReduction.style.color = '#dc3545'; // Red color for warning

            compressionRatio.textContent = `1:${compressionRatioValue}`;
            compressionRatio.style.color = '#dc3545';

            // Show helpful message
            this.showError(warningMessage);
        } else {
            // Normal compression success
            sizeReduction.textContent = `${reductionPercent}% (${this.formatFileSize(sizeReductionBytes)})`;
            sizeReduction.style.color = '#28a745'; // Green color for success
            compressionRatio.textContent = `${compressionRatioValue}:1`;
            compressionRatio.style.color = '#28a745';
        }

        if (singleLoadTimeEstimate) {
            singleLoadTimeEstimate.textContent = this.buildLoadTimeEstimate(originalSize, compressedSizeBytes);
        }

        // Store compressed data for download
        this.compressedDataUrl = compressedDataUrl;
        this.trackEvent('compression_complete', { original_bytes: originalSize, compressed_bytes: compressedSizeBytes });

        // Share hook (single image)
        this.updateShareHook({
            originalBytes: originalSize,
            compressedBytes: compressedSizeBytes,
            imageCount: 1
        });

        // Show results section with optimized animation
        resultsSection.style.display = 'block';
        requestAnimationFrame(() => {
            if (typeof resultsSection.scrollIntoView === 'function') resultsSection.scrollIntoView({ behavior: 'smooth' });
            resultsSection.classList?.add('success-animation');
            setTimeout(() => resultsSection.classList?.remove('success-animation'), 600);
        });
    }

    displayBatchResults() {
        const {
            resultsSection, singleResults, batchResults, downloadAllBtn, progressSection,
            totalImages, totalSizeReduction, averageCompression, batchLoadTimeEstimate, batchImageGrid
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
        totalSizeReduction.textContent = totalCompressedSize > totalOriginalSize
            ? this.formatBatchSizeChange(totalOriginalSize, totalCompressedSize)
            : `${totalReduction.toFixed(1)}% (${this.formatFileSize(totalOriginalSize - totalCompressedSize)})`;
        averageCompression.textContent = `${averageReduction.toFixed(1)}%`;
        if (batchLoadTimeEstimate) {
            batchLoadTimeEstimate.textContent = this.buildLoadTimeEstimate(totalOriginalSize, totalCompressedSize);
        }

        // Share hook (batch)
        this.updateShareHook({
            originalBytes: totalOriginalSize,
            compressedBytes: totalCompressedSize,
            imageCount: this.compressedImages.length
        });

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
            if (typeof resultsSection.scrollIntoView === 'function') resultsSection.scrollIntoView({ behavior: 'smooth' });
            resultsSection.classList?.add('success-animation');
            setTimeout(() => resultsSection.classList?.remove('success-animation'), 600);
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
            <div class="batch-image-reduction">Reduction: ${imgData.reduction.toFixed(1)}%</div>
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
        link.download = this.generateFileName(this.compressedDataUrl);
        link.href = this.compressedDataUrl;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    downloadSingleCompressedImage(imgData) {
        const link = document.createElement('a');
        link.download = this.generateBatchFileName(imgData.originalFile, imgData.compressedDataUrl);
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
        const button = this.elements.downloadAllBtn;
        if (button) { button.disabled = true; button.setAttribute('aria-busy', 'true'); button.textContent = 'Building ZIP…'; }

        this.compressedImages.forEach((imgData, index) => {
            // Convert data URL to blob
            const base64Data = imgData.compressedDataUrl.split(',')[1];
            const fileName = this.uniqueBatchFileName(imgData, index);
            zip.file(fileName, base64Data, { base64: true });
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => { if (button) button.textContent = `Building ZIP… ${Math.round(metadata.percent)}%`; });
        const url = URL.createObjectURL(zipBlob);

        const link = document.createElement('a');
        link.download = `compressed_images_${new Date().getTime()}.zip`;
        link.href = url;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        URL.revokeObjectURL(url);
        if (button) { button.disabled = false; button.removeAttribute('aria-busy'); button.innerHTML = '<i class="fas fa-download"></i> Download All as ZIP'; }
    }

    uniqueBatchFileName(imgData, index) {
        const base = this.generateBatchFileName(imgData.originalFile, imgData.compressedDataUrl);
        return `${String(index + 1).padStart(3, '0')}_${base}`;
    }

    downloadIndividualFiles() {
        // Download files one by one with a small delay
        this.compressedImages.forEach((imgData, index) => {
            setTimeout(() => {
                this.downloadSingleCompressedImage(imgData);
            }, index * 500); // 500ms delay between downloads
        });
    }

    getFormatFromDataUrl(dataUrl, fallbackFormat = 'jpeg') {
        if (!dataUrl || typeof dataUrl !== 'string') return fallbackFormat;
        if (dataUrl.startsWith('data:image/avif')) return 'avif';
        if (dataUrl.startsWith('data:image/webp')) return 'webp';
        if (dataUrl.startsWith('data:image/jpeg')) return 'jpeg';
        if (dataUrl.startsWith('data:image/png')) return 'png';
        return fallbackFormat;
    }

    generateFileName(dataUrl = null) {
        const originalName = this.originalFile.name;
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
        const fallbackFormat = this.elements.formatSelect.value;
        const format = this.getFormatFromDataUrl(dataUrl, fallbackFormat);
        const quality = this.elements.qualitySlider.value;

        return `${nameWithoutExt}_compressed_${quality}%.${format}`;
    }

    generateBatchFileName(file, dataUrl = null) {
        const originalName = file.name;
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
        const fallbackFormat = this.elements.formatSelect.value;
        const format = this.getFormatFromDataUrl(dataUrl, fallbackFormat);
        const quality = this.elements.qualitySlider.value;

        return `${nameWithoutExt}_compressed_${quality}%.${format}`;
    }

    isValidImageFile(file) {
        const hasImageMimeType = file.type && file.type.startsWith('image/');
        const hasImageExtension = file.name ? /\.(jpe?g|png|gif|webp|heic|heif|avif|bmp|tiff?)$/i.test(file.name) : false;
        return (hasImageMimeType || hasImageExtension) && file.size <= 10 * 1024 * 1024;
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

            if (typeof window.requestIdleCallback !== 'undefined') {
                window.requestIdleCallback(() => {
                    setTimeout(removeError, 5000);
                });
            } else {
                setTimeout(removeError, 5000);
            }
        });
    }

    // FAQ Functionality
    initializeFAQ() {
        // Wait for DOM to be fully ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupFAQ());
        } else {
            this.setupFAQ();
        }
    }

    setupFAQ() {
        const faqQuestions = document.querySelectorAll('.faq-question');

        if (faqQuestions.length === 0) {
            setTimeout(() => this.setupFAQ(), 500);
            return;
        }

        faqQuestions.forEach((question) => {
            const q = question;

            function toggle() {
                const answer = q.nextElementSibling;
                const isExpanded = q.getAttribute('aria-expanded') === 'true';

                // Close all other FAQ items
                faqQuestions.forEach(otherQuestion => {
                    if (otherQuestion !== q) {
                        otherQuestion.setAttribute('aria-expanded', 'false');
                        otherQuestion.nextElementSibling.classList.remove('active');
                    }
                });

                // Toggle current FAQ item
                if (isExpanded) {
                    q.setAttribute('aria-expanded', 'false');
                    answer.classList.remove('active');
                } else {
                    q.setAttribute('aria-expanded', 'true');
                    answer.classList.add('active');
                }
            }

            // Single click handler (avoid double toggle from mixed handlers)
            q.addEventListener('click', function(event) {
                event.preventDefault();
                toggle();
            });

            // Add keyboard support
            q.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 32) {
                    e.preventDefault();
                    toggle();
                }
            });

            // Ensure the button is focusable
            q.setAttribute('tabindex', '0');
        });
    }
}
if (typeof module !== 'undefined' && module.exports) module.exports = { ImageCompressor };
