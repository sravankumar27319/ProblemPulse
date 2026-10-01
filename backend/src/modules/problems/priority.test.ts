import {
  calculateAutoPriority,
  resolveEffectivePriority,
  PRIORITY_CONFIG,
} from './priority.service';

function runPriorityEngineTests() {
  console.log('🧪 Running Phase-13 Priority Engine Tests...\n');
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

  // 1. Baseline Low Priority Case
  // Low severity (1), 1 person affected, 1 report, 0 supports
  const lowCase = calculateAutoPriority({
    severity: 1,
    peopleAffected: 1,
    reportCount: 1,
    supportCount: 0,
  });
  assert(
    lowCase.priority === 'LOW' && lowCase.score < PRIORITY_CONFIG.THRESHOLDS.MAJOR,
    `Low severity & impact yields LOW priority (Score: ${lowCase.score})`
  );

  // 2. Moderate / Major Priority Case
  // Moderate severity (6), 30 people affected, 3 reports, 10 supports
  const majorCase = calculateAutoPriority({
    severity: 6,
    peopleAffected: 30,
    reportCount: 3,
    supportCount: 10,
  });
  assert(
    majorCase.priority === 'MAJOR' &&
      majorCase.score >= PRIORITY_CONFIG.THRESHOLDS.MAJOR &&
      majorCase.score < PRIORITY_CONFIG.THRESHOLDS.CRITICAL,
    `Moderate severity & impact yields MAJOR priority (Score: ${majorCase.score})`
  );

  // 3. High / Critical Priority Case
  // High severity (9), 100+ people affected, 8 reports, 40 supports
  const criticalCase = calculateAutoPriority({
    severity: 9,
    peopleAffected: 120,
    reportCount: 8,
    supportCount: 40,
  });
  assert(
    criticalCase.priority === 'CRITICAL' &&
      criticalCase.score >= PRIORITY_CONFIG.THRESHOLDS.CRITICAL,
    `High severity, population & backing yields CRITICAL priority (Score: ${criticalCase.score})`
  );

  // 4. Component Capping & Protection against Burst/Bot Supports
  // A minor issue (severity 1, 1 person) with a burst of 5,000 new supports
  const burstSupportCase = calculateAutoPriority({
    severity: 1,
    peopleAffected: 1,
    reportCount: 1,
    supportCount: 5000,
  });
  assert(
    burstSupportCase.breakdown.isCapped.supports === true,
    `Supports above 50 ceiling are marked capped`
  );
  assert(
    burstSupportCase.breakdown.supportScore === PRIORITY_CONFIG.WEIGHTS.SUPPORTS_MAX,
    `Supports score is strictly capped at max ${PRIORITY_CONFIG.WEIGHTS.SUPPORTS_MAX} points (got ${burstSupportCase.breakdown.supportScore})`
  );
  assert(
    burstSupportCase.priority === 'LOW',
    `Burst supports alone CANNOT force CRITICAL on a minor issue (Score: ${burstSupportCase.score}, Priority: ${burstSupportCase.priority})`
  );

  // 5. People Affected & Reports Capping
  const burstPeopleCase = calculateAutoPriority({
    severity: 5,
    peopleAffected: 10000,
    reportCount: 500,
    supportCount: 0,
  });
  assert(
    burstPeopleCase.breakdown.isCapped.people === true,
    `People affected above 100 ceiling is capped`
  );
  assert(
    burstPeopleCase.breakdown.isCapped.reports === true,
    `Report count above 10 ceiling is capped`
  );
  assert(
    burstPeopleCase.breakdown.peopleScore === PRIORITY_CONFIG.WEIGHTS.PEOPLE_MAX,
    `People score capped at ${PRIORITY_CONFIG.WEIGHTS.PEOPLE_MAX} points`
  );
  assert(
    burstPeopleCase.breakdown.reportScore === PRIORITY_CONFIG.WEIGHTS.REPORTS_MAX,
    `Reports score capped at ${PRIORITY_CONFIG.WEIGHTS.REPORTS_MAX} points`
  );

  // 6. Admin Priority vs Auto Priority Precedence
  // Case A: Admin override to CRITICAL overrides calculated LOW
  const effectiveA = resolveEffectivePriority('CRITICAL', 'LOW');
  assert(effectiveA === 'CRITICAL', `Admin CRITICAL override takes precedence over auto LOW`);

  // Case B: Admin manual downgrade to LOW overrides calculated CRITICAL
  const effectiveB = resolveEffectivePriority('LOW', 'CRITICAL');
  assert(effectiveB === 'LOW', `Admin LOW override takes precedence over auto CRITICAL`);

  // Case C: Null admin priority uses calculated autoPriority
  const effectiveC = resolveEffectivePriority(null, 'MAJOR');
  assert(effectiveC === 'MAJOR', `Null admin priority defaults to autoPriority (MAJOR)`);

  // Case D: Undefined admin priority uses calculated autoPriority
  const effectiveD = resolveEffectivePriority(undefined, 'CRITICAL');
  assert(effectiveD === 'CRITICAL', `Undefined admin priority defaults to autoPriority (CRITICAL)`);

  console.log(`\n========================================`);
  console.log(`Priority Engine Tests finished: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runPriorityEngineTests();
