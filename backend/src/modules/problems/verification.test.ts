import {
  calculateVerificationThreshold,
  isUserEligibleToVerify,
  evaluateVerificationTransition,
  shouldAutoClose,
} from './verification.service';

function runCommunityVerificationTests() {
  console.log('\n--- Running Phase 25 Community Verification Logic Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Eligibility Checks
  const mockProblem = {
    createdById: 'user-author-1',
    reports: [{ userId: 'user-reporter-2' }, { userId: 'user-reporter-3' }],
    supports: [{ userId: 'user-backer-4' }, { userId: 'user-backer-5' }],
  };

  assert(
    isUserEligibleToVerify('user-author-1', mockProblem) === true,
    'Author/creator is eligible to verify resolution'
  );
  assert(
    isUserEligibleToVerify('user-reporter-2', mockProblem) === true,
    'Duplicate eyewitness reporter is eligible to verify'
  );
  assert(
    isUserEligibleToVerify('user-backer-4', mockProblem) === true,
    'Civic supporter/backer is eligible to verify'
  );
  assert(
    isUserEligibleToVerify('user-random-999', mockProblem) === false,
    'Unrelated citizen is NOT eligible to participate in verification'
  );
  assert(
    isUserEligibleToVerify('', mockProblem) === false,
    'Unauthenticated guest is NOT eligible to verify'
  );

  // 2. Threshold Calculation Rules (Prevents single-click flipping)
  assert(
    calculateVerificationThreshold(1) === 1,
    'Solo reporter problem threshold is 1 vote'
  );
  assert(
    calculateVerificationThreshold(2) === 2,
    'Problem with 2 citizens requires threshold of 2 votes'
  );
  assert(
    calculateVerificationThreshold(5) === 2,
    'Problem with 5 citizens requires threshold of 2 votes'
  );
  assert(
    calculateVerificationThreshold(10) === 3,
    'Problem with 10 citizens requires threshold of 3 votes'
  );

  // 3. State Transition: Single vote does NOT flip when threshold is 2
  const singleYesResult = evaluateVerificationTransition(
    'RESOLVED',
    1, // 1 yes
    0, // 0 no
    2, // threshold 2
    5  // 5 total eligible
  );
  assert(
    singleYesResult.nextStatus === null,
    'Single vote cannot flip status when threshold is 2 (requires community consensus)'
  );

  // 4. Affirmative Transition: Reaching threshold transitions RESOLVED -> COMMUNITY_VERIFIED
  const thresholdYesResult = evaluateVerificationTransition(
    'RESOLVED',
    2, // 2 yes
    0, // 0 no
    2, // threshold 2
    5
  );
  assert(
    thresholdYesResult.nextStatus === 'COMMUNITY_VERIFIED',
    'Reaching verification threshold (2 yes votes) transitions RESOLVED -> COMMUNITY_VERIFIED'
  );
  assert(
    thresholdYesResult.notificationEvent === 'COMMUNITY_VERIFIED',
    'Dispatches COMMUNITY_VERIFIED notification event to stakeholders'
  );

  // 5. Strong Consensus Transition: COMMUNITY_VERIFIED -> CLOSED
  const closureResult = evaluateVerificationTransition(
    'COMMUNITY_VERIFIED',
    3, // 3 yes votes (threshold + 1)
    0,
    2,
    5
  );
  assert(
    closureResult.nextStatus === 'CLOSED',
    'Strong community consensus transitions COMMUNITY_VERIFIED -> CLOSED'
  );
  assert(
    closureResult.notificationEvent === 'CLOSED',
    'Dispatches CLOSED notification event upon final consensus'
  );

  // 6. Dispute Transition: Reaching dispute threshold transitions to REOPENED
  const disputeResult = evaluateVerificationTransition(
    'RESOLVED',
    0, // 0 yes
    2, // 2 no ("problem remains")
    2, // threshold 2
    5
  );
  assert(
    disputeResult.nextStatus === 'REOPENED',
    'Threshold of "problem remains" dispute votes transitions RESOLVED -> REOPENED'
  );
  assert(
    disputeResult.notificationEvent === 'REOPENED',
    'Dispatches REOPENED notification event to alert municipal crews'
  );

  // 7. Auto-Close: 7-day grace period with zero dispute votes
  const now = Date.now();
  const eightDaysAgo = new Date(now - 8 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);

  assert(
    shouldAutoClose(eightDaysAgo, 0, 'RESOLVED') === true,
    'Auto-closes to CLOSED after 7 days with zero dispute votes'
  );
  assert(
    shouldAutoClose(threeDaysAgo, 0, 'RESOLVED') === false,
    'Does NOT auto-close before 7 days (active grace period)'
  );
  assert(
    shouldAutoClose(eightDaysAgo, 1, 'RESOLVED') === false,
    'Auto-close is blocked if dispute votes exist (noVotes > 0)'
  );
  assert(
    shouldAutoClose(eightDaysAgo, 0, 'IN_PROGRESS') === false,
    'Auto-close only applies to RESOLVED or COMMUNITY_VERIFIED problems'
  );

  console.log(`\n========================================`);
  console.log(`Phase 25 Community Verification Tests finished: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runCommunityVerificationTests();
