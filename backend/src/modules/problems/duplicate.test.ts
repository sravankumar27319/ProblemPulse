import { calculateHaversineDistance } from './duplicate.service';

function runTests() {
  console.log('🧪 Running Phase-11 Duplicate Detection Logic Tests...\n');
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

  // 1. Distance between exact same coordinates should be 0 meters
  const dist0 = calculateHaversineDistance(12.9716, 77.5946, 12.9716, 77.5946);
  assert(dist0 === 0, `Exact same coordinate distance should be 0m (got ${dist0}m)`);

  // 2. Small offset ~50m
  // 0.00045 degrees lat ≈ 50 meters
  const dist50 = calculateHaversineDistance(12.9716, 77.5946, 12.97205, 77.5946);
  assert(dist50 >= 45 && dist50 <= 55, `50m offset calculation accurate (got ${dist50}m)`);

  // 3. Offset ~100m threshold
  // 0.0009 degrees lat ≈ 100 meters
  const dist100 = calculateHaversineDistance(12.9716, 77.5946, 12.9725, 77.5946);
  assert(dist100 >= 95 && dist100 <= 105, `100m threshold calculation accurate (got ${dist100}m)`);

  // 4. Distant coordinate > 1000m
  // 0.01 degrees lat ≈ 1113 meters
  const dist1000 = calculateHaversineDistance(12.9716, 77.5946, 12.9816, 77.5946);
  assert(dist1000 > 1000, `Large distance (>1000m) calculated correctly (got ${dist1000}m)`);

  // 5. Symmetric distance
  const distAtoB = calculateHaversineDistance(12.9716, 77.5946, 12.9730, 77.5960);
  const distBtoA = calculateHaversineDistance(12.9730, 77.5960, 12.9716, 77.5946);
  assert(distAtoB === distBtoA, `Haversine symmetry (A->B === B->A, got ${distAtoB}m)`);

  console.log(`\n========================================`);
  console.log(`Tests finished: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
