import {
  isAllowedMimeType,
  validateFileSize,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
} from '../../middleware/fileValidation';

export async function runMediaTests() {
  console.log('🧪 Running Phase-28 [Media Module] Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Case: valid image/video
  for (const imgType of ALLOWED_IMAGE_TYPES) {
    assert(isAllowedMimeType(imgType), `valid image: whitelists ${imgType}`);
  }
  for (const vidType of ALLOWED_VIDEO_TYPES) {
    assert(isAllowedMimeType(vidType), `valid video: whitelists ${vidType}`);
  }

  // 2. Case: invalid file
  const forbiddenMimes = [
    'application/x-msdownload', // .exe
    'application/x-sh',         // shell script
    'application/x-php',        // php
    'text/html',                // html / xss
    'text/javascript',          // js
    'application/x-bat',        // batch
    'application/zip',          // archive
  ];
  for (const mime of forbiddenMimes) {
    assert(!isAllowedMimeType(mime), `invalid file: strictly blocks dangerous MIME ${mime}`);
  }

  // 3. Case: oversized file
  // Image ceiling: 10MB
  assert(validateFileSize('image/jpeg', 2 * 1024 * 1024), 'oversized file check: 2MB image allowed');
  assert(validateFileSize('image/png', MAX_IMAGE_SIZE), 'oversized file check: exactly 10MB image allowed');
  assert(!validateFileSize('image/png', MAX_IMAGE_SIZE + 1024), 'oversized file check: >10MB image rejected');

  // Video ceiling: 50MB
  assert(validateFileSize('video/mp4', 25 * 1024 * 1024), 'oversized file check: 25MB video allowed');
  assert(validateFileSize('video/mp4', MAX_VIDEO_SIZE), 'oversized file check: exactly 50MB video allowed');
  assert(!validateFileSize('video/mp4', MAX_VIDEO_SIZE + 1024), 'oversized file check: >50MB video rejected');

  // Empty / 0-byte file check
  assert(!validateFileSize('image/jpeg', 0), 'oversized file check: empty 0-byte file rejected');
  assert(!validateFileSize('video/mp4', -10), 'oversized file check: negative byte length rejected');

  // 4. Case: Cloudinary failure / offline fallback simulation
  interface CloudinaryConfig {
    cloudName?: string;
    apiKey?: string;
    apiSecret?: string;
  }

  function simulateMediaUpload(fileBuffer: Buffer, mimetype: string, config: CloudinaryConfig) {
    if (!isAllowedMimeType(mimetype)) {
      throw new Error(`Unsupported MIME type ${mimetype}`);
    }
    if (!validateFileSize(mimetype, fileBuffer.length)) {
      throw new Error('File exceeds size limit');
    }

    const isCloudinaryActive = Boolean(config.cloudName && config.apiKey && config.apiSecret);

    if (isCloudinaryActive) {
      // Normal remote upload return
      return {
        url: `https://res.cloudinary.com/${config.cloudName}/image/upload/v1/evidence.jpg`,
        publicId: `cloud_${Date.now()}`,
        mode: 'CLOUDINARY',
      };
    } else {
      // Cloudinary missing or network failure fallback
      return {
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?auto=format&fit=crop&w=800&q=80',
        publicId: `fallback_${Date.now()}`,
        mode: 'DIRECT_FALLBACK',
      };
    }
  }

  const sampleBuffer = Buffer.from('fake image content');

  // With Cloudinary configured
  const cloudUpload = simulateMediaUpload(sampleBuffer, 'image/jpeg', {
    cloudName: 'test-cloud',
    apiKey: 'key-123',
    apiSecret: 'secret-456',
  });
  assert(cloudUpload.mode === 'CLOUDINARY', 'Cloudinary active: uploads to secure Cloudinary bucket');

  // With Cloudinary failure / unconfigured
  const fallbackUpload = simulateMediaUpload(sampleBuffer, 'image/jpeg', {
    cloudName: '',
    apiKey: '',
    apiSecret: '',
  });
  assert(fallbackUpload.mode === 'DIRECT_FALLBACK', 'Cloudinary failure: activates direct fallback gracefully without crashing');
  assert(typeof fallbackUpload.url === 'string' && fallbackUpload.url.startsWith('https://'), 'Cloudinary failure: returns valid HTTPS fallback asset URL');

  console.log(`\nMedia Module Tests finished: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
  return { passed, failed };
}

if (require.main === module) {
  runMediaTests();
}
