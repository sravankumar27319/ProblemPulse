import { createProblemSchema } from './problem.schema';
import { ProblemStatus, PriorityLevel, ProblemCategory } from '@prisma/client';
import { calculateAutoPriority } from './priority.service';

export async function runProblemTests() {
  console.log('🧪 Running Phase-28 [Problem Module] Tests...\n');
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

  interface MockProblemRecord {
    id: string;
    title: string;
    description: string;
    category: ProblemCategory;
    severity: number;
    peopleAffected: number;
    autoPriority: PriorityLevel;
    adminPriority: PriorityLevel | null;
    status: ProblemStatus;
    reportCount: number;
    supportCount: number;
    latitude: number;
    longitude: number;
    address: string;
    area: string;
    city: string;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
  }

  const mockProblemStore: MockProblemRecord[] = [];

  // Service Simulation: Create
  function createProblem(userId: string, input: any) {
    const validated = createProblemSchema.parse(input);
    const { priority } = calculateAutoPriority({
      severity: validated.severity,
      peopleAffected: validated.peopleAffected,
      reportCount: 1,
      supportCount: 0,
    });

    const record: MockProblemRecord = {
      id: `prob-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      title: validated.title,
      description: validated.description,
      category: validated.category,
      severity: validated.severity,
      peopleAffected: validated.peopleAffected,
      autoPriority: priority,
      adminPriority: null,
      status: 'SUBMITTED',
      reportCount: 1,
      supportCount: 0,
      latitude: validated.latitude,
      longitude: validated.longitude,
      address: validated.address,
      area: validated.area,
      city: validated.city,
      createdById: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockProblemStore.push(record);
    return record;
  }

  // Service Simulation: Read
  function getProblemById(id: string) {
    const record = mockProblemStore.find((p) => p.id === id);
    if (!record) {
      const err: any = new Error('Problem not found');
      err.statusCode = 404;
      throw err;
    }
    return record;
  }

  // Service Simulation: Update (e.g. author or admin)
  function updateProblemDetails(id: string, actorId: string, actorRole: string, patch: { description?: string; severity?: number }) {
    const problem = getProblemById(id);
    if (problem.createdById !== actorId && actorRole !== 'ADMIN') {
      const err: any = new Error('Unauthorized to edit this problem record');
      err.statusCode = 403;
      throw err;
    }
    if (patch.description) problem.description = patch.description.trim();
    if (patch.severity) problem.severity = patch.severity;
    problem.updatedAt = new Date();
    return problem;
  }

  // 1. Case: create
  const validPayload = {
    title: 'Burst water main flooding commercial lane',
    description: 'Fresh water flooding into basement shops near Central Plaza',
    category: 'WATER',
    severity: 8,
    peopleAffected: 50,
    latitude: 12.9716,
    longitude: 77.5946,
    address: '42 Commercial Street',
    area: 'Central Plaza',
    city: 'Metro City',
  };

  const created = createProblem('user-1', validPayload);
  assert(created.title === validPayload.title, 'create: problem record created with valid title');
  assert(created.status === 'SUBMITTED', 'create: initial status defaults to SUBMITTED');
  assert(created.reportCount === 1, 'create: initial reportCount starts at 1');
  assert(created.autoPriority === 'MAJOR' || created.autoPriority === 'CRITICAL', 'create: auto-calculates baseline priority');

  // 2. Case: read
  const fetched = getProblemById(created.id);
  assert(fetched.id === created.id, 'read: retrieves problem by unique id');
  assert(fetched.createdById === 'user-1', 'read: preserves creator relationship');

  // 3. Case: update (by creator)
  const updated = updateProblemDetails(created.id, 'user-1', 'USER', {
    description: 'Updated: Water line isolated by emergency valve team',
  });
  assert(updated.description.includes('isolated by emergency valve team'), 'update: creator can update problem details');

  // 4. Case: invalid data
  // 4a. Short title
  let shortTitleCaught = false;
  try {
    createProblem('user-1', { ...validPayload, title: 'Hi' });
  } catch {
    shortTitleCaught = true;
  }
  assert(shortTitleCaught, 'invalid data: short title (<5 chars) rejected');

  // 4b. Out of range coordinates
  let invalidCoordsCaught = false;
  try {
    createProblem('user-1', { ...validPayload, latitude: 150.0 });
  } catch {
    invalidCoordsCaught = true;
  }
  assert(invalidCoordsCaught, 'invalid data: invalid latitude (>90) rejected');

  // 4c. Invalid category
  let invalidCatCaught = false;
  try {
    createProblem('user-1', { ...validPayload, category: 'SPORTS_GROUND' });
  } catch {
    invalidCatCaught = true;
  }
  assert(invalidCatCaught, 'invalid data: non-existent category enum rejected');

  // 5. Case: unauthorized update
  let unauthorizedCaught = false;
  try {
    // user-2 attempts to modify user-1's problem
    updateProblemDetails(created.id, 'user-2', 'USER', {
      description: 'Hacked description',
    });
  } catch (err: any) {
    if (err.statusCode === 403) unauthorizedCaught = true;
  }
  assert(unauthorizedCaught, 'unauthorized update: non-creator USER rejected with 403 Forbidden');

  // Admin update is allowed
  const adminUpdated = updateProblemDetails(created.id, 'admin-1', 'ADMIN', {
    description: 'Municipal officer revised description',
  });
  assert(adminUpdated.description.includes('Municipal officer'), 'update: ADMIN role authorized to update record');

  console.log(`\nProblem Module Tests finished: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
  return { passed, failed };
}

if (require.main === module) {
  runProblemTests();
}
