import { ProblemStatus } from '@prisma/client';

function runActivityTests() {
  console.log('🧪 Running Phase-16 User Activity Hub Logic Tests...\n');
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

  // 1. Mock problems dataset
  interface MockActivityProblem {
    id: string;
    title: string;
    createdById: string;
    status: ProblemStatus;
    reportedUserIds: string[];
    supportedUserIds: string[];
  }

  const mockDb: MockActivityProblem[] = [
    {
      id: 'p1',
      title: 'Pothole on 5th Avenue',
      createdById: 'user_alpha',
      status: 'IN_PROGRESS',
      reportedUserIds: ['user_alpha'],
      supportedUserIds: ['user_beta'],
    },
    {
      id: 'p2',
      title: 'Water pipe leak in Sector 4',
      createdById: 'user_gamma',
      status: 'RESOLVED',
      reportedUserIds: ['user_gamma', 'user_alpha'],
      supportedUserIds: ['user_beta', 'user_alpha'],
    },
    {
      id: 'p3',
      title: 'Streetlight outage',
      createdById: 'user_delta',
      status: 'COMMUNITY_VERIFIED',
      reportedUserIds: ['user_delta'],
      supportedUserIds: ['user_alpha'],
    },
    {
      id: 'p4',
      title: 'Garbage dump near park',
      createdById: 'user_epsilon',
      status: 'SUBMITTED',
      reportedUserIds: ['user_epsilon'],
      supportedUserIds: ['user_beta'],
    },
  ];

  const targetUser = 'user_alpha';

  // 2. Filter: My Reports (created by user OR linked as duplicate reporter)
  const myReports = mockDb.filter(
    (p) => p.createdById === targetUser || p.reportedUserIds.includes(targetUser)
  );

  assert(
    myReports.length === 2 && myReports.some((p) => p.id === 'p1') && myReports.some((p) => p.id === 'p2'),
    `My Reports correctly identifies problems authored or linked (found ${myReports.length})`
  );

  // 3. Filter: Supported Problems
  const supportedProblems = mockDb.filter((p) => p.supportedUserIds.includes(targetUser));

  assert(
    supportedProblems.length === 2 &&
      supportedProblems.some((p) => p.id === 'p2') &&
      supportedProblems.some((p) => p.id === 'p3'),
    `Supported Problems correctly identifies user backed items (found ${supportedProblems.length})`
  );

  // 4. Filter: Resolved Problems (reported OR supported AND status is resolved/verified/closed)
  const RESOLVED_STATUSES: ProblemStatus[] = ['RESOLVED', 'COMMUNITY_VERIFIED', 'CLOSED'];
  const resolvedProblems = mockDb.filter((p) => {
    const isAssociated =
      p.createdById === targetUser ||
      p.reportedUserIds.includes(targetUser) ||
      p.supportedUserIds.includes(targetUser);
    return isAssociated && RESOLVED_STATUSES.includes(p.status);
  });

  assert(
    resolvedProblems.length === 2 &&
      resolvedProblems.some((p) => p.id === 'p2') &&
      resolvedProblems.some((p) => p.id === 'p3'),
    `Resolved Problems correctly aggregates completed citizen civic engagements (found ${resolvedProblems.length})`
  );

  // 5. Activity Summary object structure
  const summary = {
    reportedCount: myReports.length,
    supportedCount: supportedProblems.length,
    resolvedCount: resolvedProblems.length,
  };

  assert(
    summary.reportedCount === 2 && summary.supportedCount === 2 && summary.resolvedCount === 2,
    `Summary metrics calculated accurately (${JSON.stringify(summary)})`
  );

  console.log(`\n========================================`);
  console.log(`Phase 16 Tests finished: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runActivityTests();
