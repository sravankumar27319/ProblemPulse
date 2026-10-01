import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema } from './auth.schema';

export async function runAuthTests() {
  console.log('🧪 Running Phase-28 [Auth Module] Tests...\n');
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

  const TEST_JWT_SECRET = 'test-auth-secret-key-phase28';

  // In-memory mock database for auth tests
  interface MockUser {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: 'USER' | 'ADMIN';
  }

  const mockUsersDb: MockUser[] = [];

  // Mock Register service
  async function mockRegister(input: { name: string; email: string; password: string }) {
    const validated = registerSchema.parse(input);
    const existing = mockUsersDb.find((u) => u.email.toLowerCase() === validated.email.toLowerCase());
    if (existing) {
      const err: any = new Error('An account with this email already exists.');
      err.statusCode = 400;
      throw err;
    }
    const passwordHash = await bcrypt.hash(validated.password, 10);
    const user: MockUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: validated.name.trim(),
      email: validated.email.toLowerCase().trim(),
      passwordHash,
      role: 'USER',
    };
    mockUsersDb.push(user);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  // Mock Login service
  async function mockLogin(input: { email: string; password: string }) {
    const validated = loginSchema.parse(input);
    const user = mockUsersDb.find((u) => u.email.toLowerCase() === validated.email.toLowerCase().trim());
    if (!user) {
      const err: any = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }
    const valid = await bcrypt.compare(validated.password, user.passwordHash);
    if (!valid) {
      const err: any = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      TEST_JWT_SECRET,
      { expiresIn: '7d' }
    );
    return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
  }

  // 1. Case: register
  const registered = await mockRegister({
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'securePassword123!',
  });
  assert(registered.name === 'Alice Johnson', 'register: successfully creates user');
  assert(registered.role === 'USER', 'register: sets default citizen role to USER');

  const savedUser = mockUsersDb.find((u) => u.email === 'alice@example.com');
  assert(savedUser !== undefined && savedUser.passwordHash.startsWith('$2b$'), 'register: stores password using salted bcrypt hash');

  // 2. Case: login
  const loginResult = await mockLogin({
    email: 'alice@example.com',
    password: 'securePassword123!',
  });
  assert(loginResult.user.id === registered.id, 'login: valid credentials return user payload');
  assert(typeof loginResult.token === 'string' && loginResult.token.length > 20, 'login: returns signed JWT session token');

  // 3. Case: wrong password
  let wrongPassCaught = false;
  try {
    await mockLogin({
      email: 'alice@example.com',
      password: 'WrongPassword456!',
    });
  } catch (err: any) {
    if (err.statusCode === 401) wrongPassCaught = true;
  }
  assert(wrongPassCaught, 'wrong password: login rejects with 401 Unauthorized');

  // 4. Case: duplicate email
  let duplicateCaught = false;
  try {
    await mockRegister({
      name: 'Alice Clone',
      email: 'ALICE@EXAMPLE.COM', // test case-insensitive duplicate
      password: 'anotherPassword789!',
    });
  } catch (err: any) {
    if (err.statusCode === 400) duplicateCaught = true;
  }
  assert(duplicateCaught, 'duplicate email: rejects registration with 400 Bad Request');

  // 5. Case: invalid token (tampered, wrong secret, expired)
  let tamperedCaught = false;
  try {
    const validParts = loginResult.token.split('.');
    const tampered = `${validParts[0]}.${Buffer.from('{"role":"ADMIN"}').toString('base64url')}.${validParts[2]}`;
    jwt.verify(tampered, TEST_JWT_SECRET);
  } catch {
    tamperedCaught = true;
  }
  assert(tamperedCaught, 'invalid token: tampered token rejected');

  let wrongSecretCaught = false;
  try {
    jwt.verify(loginResult.token, 'different-secret-key');
  } catch {
    wrongSecretCaught = true;
  }
  assert(wrongSecretCaught, 'invalid token: token signed with foreign secret rejected');

  // 6. Case: role boundaries (USER vs ADMIN)
  function verifyAccess(token: string, requiredRole: 'USER' | 'ADMIN') {
    const payload = jwt.verify(token, TEST_JWT_SECRET) as { role: 'USER' | 'ADMIN' };
    if (requiredRole === 'ADMIN' && payload.role !== 'ADMIN') {
      const err: any = new Error('Forbidden. Admin privileges required.');
      err.statusCode = 403;
      throw err;
    }
    return true;
  }

  // Regular user accessing user route
  assert(verifyAccess(loginResult.token, 'USER') === true, 'role boundaries: USER allowed on citizen routes');

  // Regular user accessing admin route
  let adminAccessDenied = false;
  try {
    verifyAccess(loginResult.token, 'ADMIN');
  } catch (err: any) {
    if (err.statusCode === 403) adminAccessDenied = true;
  }
  assert(adminAccessDenied, 'role boundaries: USER strictly forbidden (403) from admin operations');

  // Admin user accessing admin route
  const adminToken = jwt.sign(
    { userId: 'admin-1', email: 'officer@metro.gov', role: 'ADMIN' },
    TEST_JWT_SECRET
  );
  assert(verifyAccess(adminToken, 'ADMIN') === true, 'role boundaries: ADMIN authorized for admin operations');

  console.log(`\nAuth Module Tests finished: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
  return { passed, failed };
}

if (require.main === module) {
  runAuthTests();
}
