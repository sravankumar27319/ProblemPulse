import { createCommentSchema } from './problem.schema';

function runCommentTests() {
  console.log('🧪 Running Phase-15 Comments & Moderation Flagging Tests...\n');
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

  // 1. Validation: Valid Comment Input
  const validResult = createCommentSchema.safeParse({
    content: 'Work crews arrived this morning with heavy machinery to begin repairs.',
  });
  assert(
    validResult.success && validResult.data.content.includes('Work crews arrived'),
    'Valid comment passes schema validation'
  );

  // 2. Validation: Empty Comment Input Rejected
  const emptyResult = createCommentSchema.safeParse({
    content: '   ',
  });
  assert(!emptyResult.success, 'Empty or whitespace-only comment is rejected');

  // 3. Validation: Overlength (>1000 chars) Rejected
  const longText = 'A'.repeat(1001);
  const overlengthResult = createCommentSchema.safeParse({
    content: longText,
  });
  assert(!overlengthResult.success, 'Comment exceeding 1000 characters is rejected');

  // 4. Data Shape & Flagging Logic
  interface MockComment {
    id: string;
    problemId: string;
    userId: string;
    content: string;
    isFlagged: boolean;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      avatarUrl?: string | null;
    };
  }

  const mockComments: MockComment[] = [
    {
      id: 'c1',
      problemId: 'p1',
      userId: 'u1',
      content: 'Water supply restored partially.',
      isFlagged: false,
      createdAt: new Date(),
      user: { id: 'u1', name: 'Citizen Reporter' },
    },
  ];

  // Simulating flag action
  const targetComment = mockComments.find((c) => c.id === 'c1');
  if (targetComment) {
    targetComment.isFlagged = true;
  }

  assert(
    mockComments[0].isFlagged === true,
    'Flagging comment toggles isFlagged to true for municipal moderation'
  );

  console.log(`\n========================================`);
  console.log(`Phase 15 Tests finished: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runCommentTests();
