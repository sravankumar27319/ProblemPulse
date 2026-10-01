import { calculateAutoPriority } from './priority.service';

function runSupportTests() {
  console.log('🧪 Running Phase-14 Community Support Logic Tests...\n');
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

  // 1. Initial State: Problem with 0 supports
  const initial = calculateAutoPriority({
    severity: 6,
    peopleAffected: 50,
    reportCount: 1,
    supportCount: 0,
  });

  // 2. User adds support (toggle support -> ON)
  const supported1 = calculateAutoPriority({
    severity: 6,
    peopleAffected: 50,
    reportCount: 1,
    supportCount: 1,
  });

  assert(
    supported1.breakdown.supportScore > initial.breakdown.supportScore,
    `Adding support increases support component score (${initial.breakdown.supportScore} -> ${supported1.breakdown.supportScore})`
  );

  // 3. Multiple users supporting
  const supported10 = calculateAutoPriority({
    severity: 6,
    peopleAffected: 50,
    reportCount: 1,
    supportCount: 10,
  });

  assert(
    supported10.score > initial.score,
    `10 supports scales total priority higher than initial (${supported10.score} > ${initial.score})`
  );

  // 4. Removing support (toggle support -> OFF)
  const unsupport = calculateAutoPriority({
    severity: 6,
    peopleAffected: 50,
    reportCount: 1,
    supportCount: 0,
  });

  assert(
    unsupport.score === initial.score && unsupport.priority === initial.priority,
    `Removing support restores baseline priority score (${unsupport.score} === ${initial.score})`
  );

  // 5. Abuse Prevention: Support component cap (max 15 points)
  const support500 = calculateAutoPriority({
    severity: 5,
    peopleAffected: 10,
    reportCount: 1,
    supportCount: 500,
  });

  const support1000 = calculateAutoPriority({
    severity: 5,
    peopleAffected: 10,
    reportCount: 1,
    supportCount: 1000,
  });

  assert(
    support500.score === support1000.score,
    `Support priority score respects anti-brigading cap of 15 pts (${support500.score} === ${support1000.score})`
  );

  console.log(`\n========================================`);
  console.log(`Phase 14 Tests finished: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSupportTests();
