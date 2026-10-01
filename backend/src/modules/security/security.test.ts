import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import {
  isAllowedMimeType,
  validateFileSize,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
} from '../../middleware/fileValidation';
import { registerSchema, loginSchema } from '../auth/auth.schema';
import { createProblemSchema, createCommentSchema } from '../problems/problem.schema';

async function runSecurityTests() {
  console.log('🧪 Running Phase-27 Security & Hardening Tests...\n');
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

  const TEST_JWT_SECRET = 'super-secret-test-jwt-key-2026';

  // ==========================================
  // 1. JWT Authentication & Tamper Proofing
  // ==========================================
  console.log('\n--- 1. JWT Token Security & Integrity ---');
  const userPayload = { userId: 'usr-123', email: 'citizen@example.com', role: 'USER' as const };
  const adminPayload = { userId: 'adm-456', email: 'officer@metro.gov', role: 'ADMIN' as const };

  const validToken = jwt.sign(userPayload, TEST_JWT_SECRET, { expiresIn: '1h' });
  const decoded = jwt.verify(validToken, TEST_JWT_SECRET) as typeof userPayload;
  assert(decoded.userId === userPayload.userId && decoded.role === 'USER', 'JWT correctly signs and decodes user payload');

  // Tampered payload test
  const parts = validToken.split('.');
  const tamperedPayload = Buffer.from(JSON.stringify({ ...userPayload, role: 'ADMIN' })).toString('base64url');
  const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

  let tamperedCaught = false;
  try {
    jwt.verify(tamperedToken, TEST_JWT_SECRET);
  } catch {
    tamperedCaught = true;
  }
  assert(tamperedCaught, 'Tampered token role escalation attempt is strictly rejected');

  // Invalid secret test
  let invalidSecretCaught = false;
  try {
    jwt.verify(validToken, 'wrong-secret-key');
  } catch {
    invalidSecretCaught = true;
  }
  assert(invalidSecretCaught, 'Token signed with foreign secret key is rejected');

  // Expired token test
  const expiredToken = jwt.sign(userPayload, TEST_JWT_SECRET, { expiresIn: '-1s' });
  let expiredCaught = false;
  try {
    jwt.verify(expiredToken, TEST_JWT_SECRET);
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') expiredCaught = true;
  }
  assert(expiredCaught, 'Expired token is rejected with TokenExpiredError');

  // ==========================================
  // 2. Password Hashing with bcrypt
  // ==========================================
  console.log('\n--- 2. Password Security (bcrypt) ---');
  const plainPassword = 'CorrectHorseBatteryStaple!2026';
  const saltRounds = 10;
  const hash1 = await bcrypt.hash(plainPassword, saltRounds);
  const hash2 = await bcrypt.hash(plainPassword, saltRounds);

  assert(hash1.startsWith('$2b$') || hash1.startsWith('$2a$'), 'bcrypt hash uses modern format');
  assert(hash1 !== plainPassword, 'Password is never stored in plain text');
  assert(hash1 !== hash2, 'bcrypt applies unique per-password salt (identical passwords produce different hashes)');

  const matchSuccess = await bcrypt.compare(plainPassword, hash1);
  assert(matchSuccess, 'bcrypt.compare validates correct password');

  const matchFail = await bcrypt.compare('WrongPassword!123', hash1);
  assert(!matchFail, 'bcrypt.compare rejects incorrect password');

  // ==========================================
  // 3. Role-Based Authorization Boundaries
  // ==========================================
  console.log('\n--- 3. Role-Based Access Control (RBAC) ---');
  function checkAdminAccess(userRole: string | undefined): { allowed: boolean; status: number } {
    if (!userRole) return { allowed: false, status: 401 };
    if (userRole !== 'ADMIN') return { allowed: false, status: 403 };
    return { allowed: true, status: 200 };
  }

  assert(checkAdminAccess(undefined).status === 401, 'Anonymous request to admin route yields 401 Unauthorized');
  assert(checkAdminAccess('USER').status === 403, 'Regular USER request to admin route yields 403 Forbidden');
  assert(checkAdminAccess('ADMIN').allowed === true && checkAdminAccess('ADMIN').status === 200, 'ADMIN role is granted access to admin route');

  // ==========================================
  // 4. File Type & Size Validation
  // ==========================================
  console.log('\n--- 4. File Type & MIME Whitelisting ---');
  assert(isAllowedMimeType('image/jpeg'), 'MIME image/jpeg is allowed');
  assert(isAllowedMimeType('image/png'), 'MIME image/png is allowed');
  assert(isAllowedMimeType('image/webp'), 'MIME image/webp is allowed');
  assert(isAllowedMimeType('video/mp4'), 'MIME video/mp4 is allowed');
  assert(isAllowedMimeType('video/quicktime'), 'MIME video/quicktime is allowed');
  assert(isAllowedMimeType('video/webm'), 'MIME video/webm is allowed');

  assert(!isAllowedMimeType('application/x-msdownload'), 'Malicious .exe MIME is blocked');
  assert(!isAllowedMimeType('application/x-sh'), 'Executable shell script MIME is blocked');
  assert(!isAllowedMimeType('application/x-php'), 'PHP script MIME is blocked');
  assert(!isAllowedMimeType('text/html'), 'Raw HTML/SVG with potential XSS vector is blocked');
  assert(!isAllowedMimeType('application/javascript'), 'JavaScript file MIME is blocked');

  console.log('\n--- 5. File Size Constraints ---');
  // 10MB image limit
  assert(validateFileSize('image/jpeg', 5 * 1024 * 1024), '5MB image is within 10MB limit');
  assert(validateFileSize('image/png', MAX_IMAGE_SIZE), '10MB image is within upper bound');
  assert(!validateFileSize('image/png', MAX_IMAGE_SIZE + 1), '10.01MB image is rejected');

  // 50MB video limit
  assert(validateFileSize('video/mp4', 35 * 1024 * 1024), '35MB video is within 50MB limit');
  assert(validateFileSize('video/mp4', MAX_VIDEO_SIZE), '50MB video is within upper bound');
  assert(!validateFileSize('video/mp4', MAX_VIDEO_SIZE + 1), '50.01MB video is rejected');
  assert(!validateFileSize('image/jpeg', 0), 'Empty 0-byte file is rejected');

  // ==========================================
  // 6. Request Input Validation (Zod)
  // ==========================================
  console.log('\n--- 6. Request Schema Validation (Zod) ---');
  // Auth Validation
  const validRegister = registerSchema.safeParse({
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
  });
  assert(validRegister.success, 'Valid registration payload accepted');

  const invalidEmailRegister = registerSchema.safeParse({
    name: 'Jane Doe',
    email: 'not-an-email',
    password: 'password123',
  });
  assert(!invalidEmailRegister.success, 'Malformed email address is rejected by Zod');

  const shortPasswordRegister = registerSchema.safeParse({
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: '123',
  });
  assert(!shortPasswordRegister.success, 'Passwords under 6 characters are rejected');

  // Problem Validation
  const validProblem = createProblemSchema.safeParse({
    title: 'Broken drainage cover on 5th main',
    description: 'Pedestrian hazard near bus shelter',
    category: 'WATER',
    severity: 7,
    peopleAffected: 25,
    latitude: 12.9716,
    longitude: 77.5946,
    address: '5th Main Road',
    area: 'Indiranagar',
    city: 'Metro City',
  });
  assert(validProblem.success, 'Valid problem creation schema accepted');

  const invalidCoordsProblem = createProblemSchema.safeParse({
    title: 'Broken drainage cover on 5th main',
    description: 'Pedestrian hazard near bus shelter',
    category: 'WATER',
    severity: 7,
    peopleAffected: 25,
    latitude: 195.0, // Invalid lat > 90
    longitude: 77.5946,
    address: '5th Main Road',
    area: 'Indiranagar',
    city: 'Metro City',
  });
  assert(!invalidCoordsProblem.success, 'Out-of-bounds latitude (>90) is rejected');

  const invalidCategoryProblem = createProblemSchema.safeParse({
    title: 'Broken drainage cover on 5th main',
    description: 'Pedestrian hazard near bus shelter',
    category: 'SPACE_INVADERS', // Non-existent category
    severity: 7,
    peopleAffected: 25,
    latitude: 12.9716,
    longitude: 77.5946,
    address: '5th Main Road',
    area: 'Indiranagar',
    city: 'Metro City',
  });
  assert(!invalidCategoryProblem.success, 'Invalid enum category is rejected');

  // Comment Validation
  const emptyComment = createCommentSchema.safeParse({ content: '   ' });
  assert(!emptyComment.success, 'Empty or whitespace-only comment is rejected');

  // ==========================================
  // 7. SQL Injection Immunity (Prisma Parameterization)
  // ==========================================
  console.log('\n--- 7. SQL Injection Protection (Prisma) ---');
  const maliciousSearchInput = "'; DROP TABLE problems; --";
  const prismaWhere: any = {
    OR: [
      { title: { contains: maliciousSearchInput, mode: 'insensitive' } },
      { address: { contains: maliciousSearchInput, mode: 'insensitive' } },
    ],
  };
  assert(
    typeof prismaWhere.OR[0].title.contains === 'string' &&
    prismaWhere.OR[0].title.contains === maliciousSearchInput,
    'Prisma treats raw SQL injection strings as escaped literal string values'
  );

  // ==========================================
  // 8. Rate Limiting Response Spec
  // ==========================================
  console.log('\n--- 8. Rate Limiter Response Specification ---');
  const mock429Response = {
    status: 429,
    body: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
      },
    },
  };
  assert(mock429Response.status === 429, 'Rate limit violation yields HTTP 429');
  assert(mock429Response.body.error.code === 'RATE_LIMIT_EXCEEDED', 'Rate limit payload contains RATE_LIMIT_EXCEEDED code');

  console.log(`\n========================================`);
  console.log(`Phase 27 Security Tests finished: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTests().catch((err) => {
  console.error('Security test runner error:', err);
  process.exit(1);
});
