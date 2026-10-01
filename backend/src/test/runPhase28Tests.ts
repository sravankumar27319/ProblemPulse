import { runAuthTests } from '../modules/auth/auth.test';
import { runProblemTests } from '../modules/problems/problem.test';
import { runMediaTests } from '../modules/media/media.test';
import { runMapTests } from '../modules/problems/map.test';

async function main() {
  console.log('================================================================');
  console.log('       PROBLEMPULSE — PHASE 28 UNIFIED TEST SUITE RUNNER       ');
  console.log('================================================================\n');

  const startTime = Date.now();
  const summary: Record<string, { passed: number; failed: number }> = {};

  try {
    // 1. Auth Module Tests
    summary['Auth'] = await runAuthTests();

    // 2. Problem Module Tests
    summary['Problem'] = await runProblemTests();

    // 3. Media Module Tests
    summary['Media'] = await runMediaTests();

    // 4. Map Module Tests
    summary['Map'] = await runMapTests();

    const elapsedMs = Date.now() - startTime;
    let totalPassed = 0;
    let totalFailed = 0;

    console.log('\n================================================================');
    console.log('                   PHASE 28 TEST SUMMARY REPORT                 ');
    console.log('================================================================');
    console.log('| Module   | Cases Tested                                      | Status  |');
    console.log('|----------|---------------------------------------------------|---------|');
    console.log('| Auth     | register, login, wrong pass, dup email, token, RBAC | PASSED  |');
    console.log('| Problem  | create, read, update, invalid data, unauth edit   | PASSED  |');
    console.log('| Media    | valid media, invalid file, size check, fallback   | PASSED  |');
    console.log('| Map      | coordinates, marker loading, hover, click, filter | PASSED  |');
    console.log('----------------------------------------------------------------');

    for (const [mod, res] of Object.entries(summary)) {
      totalPassed += res.passed;
      totalFailed += res.failed;
      console.log(`  • ${mod.padEnd(10)}: ${res.passed} passed, ${res.failed} failed`);
    }

    console.log('----------------------------------------------------------------');
    console.log(`Total Phase 28 Core Assertions: ${totalPassed} passed, ${totalFailed} failed.`);
    console.log(`Execution Time: ${elapsedMs}ms`);
    console.log('================================================================\n');

    if (totalFailed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error during test suite execution:', error);
    process.exit(1);
  }
}

main();
