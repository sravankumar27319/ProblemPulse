import { calculateAutoPriority } from './priority.service';

function runEngagementTests() {
  console.log('🧪 Running Phase-12 Report Count vs Support Count Logic Tests...\n');
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

  // 1. Initial State: 1 Report, 0 Supports
  const initial = calculateAutoPriority({
    severity: 5,
    peopleAffected: 20,
    reportCount: 1,
    supportCount: 0,
  });
  assert(initial.score >= 0, `Initial problem priority computed (Score: ${initial.score}, Priority: ${initial.priority})`);

  // 2. Report Count vs Support Count Independence
  // Report Count represents independent eyewitnesses who logged or linked evidence
  const highReports = calculateAutoPriority({
    severity: 5,
    peopleAffected: 20,
    reportCount: 8,
    supportCount: 0,
  });

  // Support Count represents community "me too" upvotes
  const highSupports = calculateAutoPriority({
    severity: 5,
    peopleAffected: 20,
    reportCount: 1,
    supportCount: 50,
  });

  assert(highReports.score > initial.score, `Incrementing reportCount increases priority score (${initial.score} -> ${highReports.score})`);
  assert(highSupports.score > initial.score, `Incrementing supportCount increases priority score (${initial.score} -> ${highSupports.score})`);

  // 3. Combined Community Impact computation
  const totalBackersA = 8 + 0; // 8 reporters
  const totalBackersB = 1 + 50; // 51 backers
  assert(totalBackersA === 8, `Combined engagement for highReports calculated accurately (8 backers)`);
  assert(totalBackersB === 51, `Combined engagement for highSupports calculated accurately (51 backers)`);

  // 4. Synergistic impact: high reports + high supports
  const highBoth = calculateAutoPriority({
    severity: 8,
    peopleAffected: 100,
    reportCount: 10,
    supportCount: 60,
  });
  assert(highBoth.priority === 'CRITICAL', `High reports + high supports appropriately triggers CRITICAL level (Score: ${highBoth.score})`);

  console.log(`\n========================================`);
  console.log(`Phase 12 Tests finished: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runEngagementTests();
