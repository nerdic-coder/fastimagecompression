# Safe E2E Testing with Docker

This guide explains how to run E2E tests safely using Docker containers to prevent system crashes.

## Why Docker for Testing?

The original E2E tests crashed your Linux machine because:
- Puppeteer/Chrome consumed too much system memory
- Multiple browser instances overwhelmed system resources
- No resource limits or isolation

Docker provides:
- **Resource isolation** - Tests run in containers with limited resources
- **Memory limits** - Prevents system crashes
- **Clean environment** - Consistent testing environment
- **Easy cleanup** - Containers are destroyed after tests

## Quick Start

### Option 1: Docker Compose (Recommended)
```bash
# Run E2E tests safely in Docker
npm run test:e2e:safe
```

### Option 2: Direct Docker
```bash
# Build the test image
npm run docker:build

# Run tests in Docker container
npm run docker:test
```

### Option 3: Manual Docker Compose
```bash
# Start test server and run tests
docker-compose -f docker-compose.testing.yml up --build --abort-on-container-exit
```

## What's Included

### Docker Configuration
- **Dockerfile.testing**: Optimized Alpine Linux image with Chromium
- **docker-compose.testing.yml**: Multi-service setup (server + tests)
- **jest.e2e.docker.config.js**: Safer Jest configuration with resource limits

### Safety Features
- **Memory limits**: Max 2GB per container
- **Single process**: Chrome runs in single-process mode
- **Resource monitoring**: Memory usage logging
- **Timeout protection**: 60-second timeouts prevent hanging
- **Clean shutdown**: Proper cleanup after tests

### Simplified Tests
- **Reduced complexity**: Fewer simultaneous operations
- **Better error handling**: Graceful failure handling
- **Resource monitoring**: Memory usage tracking
- **Docker-optimized**: Tests designed for containerized environment

## Test Commands

### Safe E2E Testing
```bash
# Run E2E tests in Docker (safest)
npm run test:e2e:safe

# Run all tests including E2E safely
npm run test:all:safe

# Run only Docker-optimized E2E tests
npm run test:e2e:docker
```

### Traditional Testing (Use with caution)
```bash
# Original E2E tests (may crash system)
npm run test:e2e

# All tests including unsafe E2E
npm run test:all
```

## Docker Configuration Details

### Resource Limits
```yaml
# In docker-compose.testing.yml
deploy:
  resources:
    limits:
      memory: 2G
      cpus: '1.0'
```

### Chrome Arguments (Safety)
```javascript
args: [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',    // Prevent /dev/shm issues
  '--disable-gpu',              // Disable GPU acceleration
  '--single-process',           // Single process mode
  '--max_old_space_size=2048'   // Limit memory usage
]
```

## Test Results

### Success Output
```
✓ Application loaded successfully
✓ Single image compression completed
✓ File upload click handled without errors
✓ Compression controls displayed correctly
✓ Quality slider working correctly
✓ Mobile responsiveness working
```

### Memory Monitoring
```
Memory usage: {
  rss: '245.67 MB',
  heapTotal: '89.23 MB',
  heapUsed: '67.45 MB',
  external: '12.34 MB'
}
```

## Troubleshooting

### Container Won't Start
```bash
# Check Docker is running
docker --version

# Check available memory
free -h

# Clean up old containers
docker system prune -f
```

### Tests Timeout
```bash
# Increase timeout in jest.e2e.docker.config.js
testTimeout: 120000  // 2 minutes

# Check container logs
docker-compose -f docker-compose.testing.yml logs
```

### Memory Issues
```bash
# Reduce memory limits in docker-compose.testing.yml
memory: 1G

# Use smaller test images
# Replace test-image.jpg with small-test.jpg
```

## File Structure

```
├── Dockerfile.testing              # Docker image for testing
├── docker-compose.testing.yml      # Multi-service Docker setup
├── jest.e2e.docker.config.js      # Safer Jest configuration
├── tests/e2e/
│   ├── setup.docker.js            # Docker-optimized test setup
│   └── image-compression.docker.test.js  # Simplified E2E tests
└── package.json                   # Updated with Docker scripts
```

## Best Practices

1. **Always use Docker for E2E tests** - Prevents system crashes
2. **Monitor memory usage** - Watch for memory leaks
3. **Use simplified tests** - Fewer simultaneous operations
4. **Clean up containers** - Run `docker system prune` regularly
5. **Test locally first** - Run unit tests before E2E tests

## Performance Comparison

| Method | Memory Usage | System Impact | Safety |
|--------|-------------|---------------|---------|
| Direct E2E | 2-4GB | High (crashes) | ❌ Unsafe |
| Docker E2E | 512MB-2GB | Low (isolated) | ✅ Safe |

## Next Steps

1. **Run safe E2E tests**: `npm run test:e2e:safe`
2. **Monitor results**: Check console output for memory usage
3. **Adjust limits**: Modify Docker config if needed
4. **Add more tests**: Extend `image-compression.docker.test.js`

This Docker-based approach ensures your E2E tests run safely without crashing your Linux machine!

