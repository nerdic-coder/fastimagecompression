// Service Worker for Image Compression
// This runs in a separate thread and won't block the main thread

// Service Worker lifecycle
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(self.clients.claim());
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
    const { type, data, id } = event.data;
    
    switch (type) {
        case 'COMPRESS_IMAGE':
            handleImageCompression(data, id);
            break;
        default:
            console.log('Unknown message type:', type);
    }
});

// Image compression handler
async function handleImageCompression(data, id) {
    try {
        const { imageData, width, height, quality, format } = data;
        
        // Create ImageData from the received data
        const imgData = new ImageData(
            new Uint8ClampedArray(imageData), 
            width, 
            height
        );
        
        // Compress the image
        const compressedData = await compressImageInWorker(imgData, quality, format);
        
        // Send result back to main thread
        self.postMessage({
            type: 'COMPRESSION_COMPLETE',
            id: id,
            success: true,
            data: compressedData
        });
        
    } catch (error) {
        console.error('Compression error in Service Worker:', error);
        
        // Send error back to main thread
        self.postMessage({
            type: 'COMPRESSION_COMPLETE',
            id: id,
            success: false,
            error: error.message
        });
    }
}

// Image compression function running in Service Worker
async function compressImageInWorker(imageData, quality, format) {
    return new Promise((resolve, reject) => {
        try {
            // Create an OffscreenCanvas (supported in Service Workers)
            const canvas = new OffscreenCanvas(imageData.width, imageData.height);
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                throw new Error('Could not get 2D context');
            }
            
            // Put image data on canvas
            ctx.putImageData(imageData, 0, 0);
            
            // Convert to desired format
            const mimeTypes = {
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'webp': 'image/webp'
            };
            const mimeType = mimeTypes[format] || 'image/jpeg';
            
            // Convert to blob
            canvas.convertToBlob({ 
                type: mimeType, 
                quality: quality 
            }).then(blob => {
                // Convert blob to ArrayBuffer for transfer
                blob.arrayBuffer().then(buffer => {
                    resolve({
                        data: Array.from(new Uint8Array(buffer)),
                        mimeType: mimeType,
                        size: buffer.byteLength
                    });
                }).catch(reject);
            }).catch(reject);
            
        } catch (error) {
            reject(error);
        }
    });
}

// Fallback compression for browsers without OffscreenCanvas
async function compressImageFallback(imageData, quality, format) {
    // This is a simplified fallback - in practice, you might want to
    // implement a different approach or just return an error
    throw new Error('OffscreenCanvas not supported in this browser');
}
