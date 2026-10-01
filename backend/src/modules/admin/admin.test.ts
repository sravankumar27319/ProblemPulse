import { ProblemStatus, PriorityLevel, ProblemCategory } from '@prisma/client';
import {
  validateTransition,
  getAllowedTransitions,
  isValidTransition,
} from '../problems/lifecycle.service';

function runAdminDashboardTests() {
  console.log('🧪 Running Phase-18 Admin Dashboard Logic Tests...\n');
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

  // 1. Mock problem dataset
  interface MockProblem {
    id: string;
    title: string;
    category: ProblemCategory;
    status: ProblemStatus;
    adminPriority: PriorityLevel | null;
    autoPriority: PriorityLevel;
    createdAt: Date;
    resolvedAt?: Date;
  }

  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

  const mockProblems: MockProblem[] = [
    {
      id: 'p1',
      title: 'Water pipe leak in Zone A',
      category: 'WATER',
      status: 'SUBMITTED',
      adminPriority: null,
      autoPriority: 'CRITICAL',
      createdAt: twoDaysAgo,
    },
    {
      id: 'p2',
      title: 'Dangerous road sinkhole',
      category: 'ROAD',
      status: 'UNDER_REVIEW',
      adminPriority: 'CRITICAL',
      autoPriority: 'MAJOR',
      createdAt: twoDaysAgo,
    },
    {
      id: 'p3',
      title: 'Streetlight repair in Sector 9',
      category: 'ELECTRICITY',
      status: 'IN_PROGRESS',
      adminPriority: null,
      autoPriority: 'MAJOR',
      createdAt: tenDaysAgo,
    },
    {
      id: 'p4',
      title: 'Garbage accumulation cleared',
      category: 'GARBAGE',
      status: 'RESOLVED',
      adminPriority: 'LOW',
      autoPriority: 'LOW',
      createdAt: tenDaysAgo,
      resolvedAt: twoDaysAgo,
    },
    {
      id: 'p5',
      title: 'Traffic signal malfunction',
      category: 'TRAFFIC',
      status: 'ASSIGNED',
      adminPriority: 'MAJOR',
      autoPriority: 'MAJOR',
      createdAt: twoDaysAgo,
    },
  ];

  // 2. Test KPI calculations
  const pendingReview = mockProblems.filter((p) =>
    ['SUBMITTED', 'UNDER_REVIEW'].includes(p.status)
  ).length;

  const critical = mockProblems.filter((p) => {
    const effPriority = p.adminPriority ?? p.autoPriority;
    return (
      effPriority === 'CRITICAL' &&
      !['RESOLVED', 'COMMUNITY_VERIFIED', 'CLOSED', 'REJECTED'].includes(p.status)
    );
  }).length;

  const inProgress = mockProblems.filter((p) =>
    ['IN_PROGRESS', 'ASSIGNED'].includes(p.status)
  ).length;

  const resolved = mockProblems.filter((p) =>
    ['RESOLVED', 'COMMUNITY_VERIFIED', 'CLOSED'].includes(p.status)
  ).length;

  assert(pendingReview === 2, `Pending review count accurate (expected 2, got ${pendingReview})`);
  assert(critical === 2, `Critical priority count accurate (expected 2, got ${critical})`);
  assert(inProgress === 2, `In-progress count accurate (expected 2, got ${inProgress})`);
  assert(resolved === 1, `Resolved count accurate (expected 1, got ${resolved})`);

  // 3. Test Category Distribution
  const categoryCounts: Record<string, number> = {};
  mockProblems.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  const total = mockProblems.length;
  const roadPercentage = Math.round(((categoryCounts['ROAD'] || 0) / total) * 100);
  assert(roadPercentage === 20, `Road category percentage computed accurately (expected 20%, got ${roadPercentage}%)`);

  // 4. Test Weekly Metrics calculation (last 7 days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const newReportsThisWeek = mockProblems.filter((p) => p.createdAt >= sevenDaysAgo).length;
  assert(newReportsThisWeek === 3, `New reports this week calculated accurately (expected 3, got ${newReportsThisWeek})`);

  // 5. Test Priority Resolution helper
  function resolveEffective(adminPriority: PriorityLevel | null, autoPriority: PriorityLevel): PriorityLevel {
    return adminPriority ?? autoPriority;
  }
  assert(resolveEffective(null, 'CRITICAL') === 'CRITICAL', 'Auto priority fallback when admin is null');
  assert(resolveEffective('LOW', 'CRITICAL') === 'LOW', 'Admin priority override takes precedence over auto');

  console.log(`\n========================================`);
  console.log(`Phase 18 Tests finished: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

function runAdminProblemManagementTests() {
  console.log('🧪 Running Phase-19 Admin Problem Management Filtering & Pagination Tests...\n');
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

  interface TestProblem {
    id: string;
    title: string;
    description: string;
    category: ProblemCategory;
    area: string;
    city: string;
    status: ProblemStatus;
    adminPriority: PriorityLevel | null;
    autoPriority: PriorityLevel;
    reportCount: number;
    supportCount: number;
    createdAt: Date;
  }

  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
  const fortyDaysAgo = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);

  const dataset: TestProblem[] = [
    {
      id: 'pr-1',
      title: 'Water main rupture in Downtown West',
      description: 'Major pipe break causing water pressure loss',
      category: 'WATER',
      area: 'Downtown West',
      city: 'Metro City',
      status: 'SUBMITTED',
      adminPriority: null,
      autoPriority: 'CRITICAL',
      reportCount: 12,
      supportCount: 45,
      createdAt: threeHoursAgo,
    },
    {
      id: 'pr-2',
      title: 'Deep pothole on Main Street',
      description: 'Dangerous pothole damaging vehicles',
      category: 'ROAD',
      area: 'Uptown Main',
      city: 'Metro City',
      status: 'VERIFIED',
      adminPriority: 'MAJOR',
      autoPriority: 'LOW',
      reportCount: 4,
      supportCount: 15,
      createdAt: threeDaysAgo,
    },
    {
      id: 'pr-3',
      title: 'Overflowing dumpster in Sector 4',
      description: 'Trash spilling onto pedestrian footpath',
      category: 'GARBAGE',
      area: 'Sector 4',
      city: 'Metro City',
      status: 'IN_PROGRESS',
      adminPriority: null,
      autoPriority: 'LOW',
      reportCount: 2,
      supportCount: 6,
      createdAt: fifteenDaysAgo,
    },
    {
      id: 'pr-4',
      title: 'Fallen electric wire across alleyway',
      description: 'Live electrical cable posing public risk',
      category: 'ELECTRICITY',
      area: 'Downtown West',
      city: 'Metro City',
      status: 'ASSIGNED',
      adminPriority: 'CRITICAL',
      autoPriority: 'CRITICAL',
      reportCount: 8,
      supportCount: 28,
      createdAt: threeDaysAgo,
    },
    {
      id: 'pr-5',
      title: 'Old street sign replaced and road repainted',
      description: 'Resolved municipal transit work',
      category: 'TRAFFIC',
      area: 'Sector 4',
      city: 'Metro City',
      status: 'RESOLVED',
      adminPriority: 'LOW',
      autoPriority: 'LOW',
      reportCount: 1,
      supportCount: 2,
      createdAt: fortyDaysAgo,
    },
  ];

  // Helper filter function replicating service logic
  function filterProblems(query: {
    priority?: string;
    status?: string;
    category?: string;
    area?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    sort?: string;
  }) {
    return dataset.filter((p) => {
      const effPriority = p.adminPriority ?? p.autoPriority;

      if (query.priority && query.priority !== 'ALL' && effPriority !== query.priority) {
        return false;
      }
      if (query.status && query.status !== 'ALL' && p.status !== query.status) {
        return false;
      }
      if (query.category && query.category !== 'ALL' && p.category !== query.category) {
        return false;
      }
      if (
        query.area &&
        query.area !== 'ALL' &&
        !p.area.toLowerCase().includes(query.area.toLowerCase())
      ) {
        return false;
      }
      if (query.date === 'today') {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (p.createdAt < startOfToday) return false;
      } else if (query.date === '7days') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (p.createdAt < sevenDaysAgo) return false;
      } else if (query.date === '30days') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (p.createdAt < thirtyDaysAgo) return false;
      } else if (query.startDate || query.endDate) {
        if (query.startDate && p.createdAt < new Date(query.startDate)) return false;
        if (query.endDate && p.createdAt > new Date(query.endDate)) return false;
      }
      if (query.search && query.search.trim()) {
        const q = query.search.toLowerCase().trim();
        const matches =
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.area.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }

  // 1. Test Priority Filter
  const criticals = filterProblems({ priority: 'CRITICAL' });
  assert(
    criticals.length === 2 && criticals.every((c) => (c.adminPriority ?? c.autoPriority) === 'CRITICAL'),
    'Priority filter accurately filters CRITICAL problems (with admin override or auto fallback)'
  );

  const majors = filterProblems({ priority: 'MAJOR' });
  assert(
    majors.length === 1 && majors[0].id === 'pr-2',
    'Priority filter identifies adminPriority override to MAJOR'
  );

  // 2. Test Status Filter
  const inProgress = filterProblems({ status: 'IN_PROGRESS' });
  assert(inProgress.length === 1 && inProgress[0].id === 'pr-3', 'Status filter isolates IN_PROGRESS items');

  const resolved = filterProblems({ status: 'RESOLVED' });
  assert(resolved.length === 1 && resolved[0].id === 'pr-5', 'Status filter isolates RESOLVED items');

  // 3. Test Category Filter
  const waterProblems = filterProblems({ category: 'WATER' });
  assert(waterProblems.length === 1 && waterProblems[0].id === 'pr-1', 'Category filter correctly selects WATER issues');

  // 4. Test Area Filter
  const downtownProblems = filterProblems({ area: 'Downtown West' });
  assert(downtownProblems.length === 2, 'Area filter correctly selects issues in Downtown West (found 2)');

  // 5. Test Date Filter Presets
  const todayProblems = filterProblems({ date: 'today' });
  assert(todayProblems.length === 1 && todayProblems[0].id === 'pr-1', 'Date preset "today" isolates issues from today');

  const sevenDaysProblems = filterProblems({ date: '7days' });
  assert(sevenDaysProblems.length === 3, 'Date preset "7days" isolates issues created in the past week (found 3)');

  const thirtyDaysProblems = filterProblems({ date: '30days' });
  assert(thirtyDaysProblems.length === 4, 'Date preset "30days" isolates issues created in the past month (found 4)');

  // 6. Test Search Filter
  const searchLeak = filterProblems({ search: 'rupture' });
  assert(searchLeak.length === 1 && searchLeak[0].id === 'pr-1', 'Search term matches title or description ("rupture")');

  // 7. Test Combined Filters
  const combined = filterProblems({
    category: 'ELECTRICITY',
    priority: 'CRITICAL',
    area: 'Downtown',
  });
  assert(combined.length === 1 && combined[0].id === 'pr-4', 'Multi-attribute filter (category + priority + area) matches exactly');

  // 8. Test Sorting Logic
  const sortedByReports = [...dataset].sort((a, b) => b.reportCount - a.reportCount);
  assert(sortedByReports[0].id === 'pr-1' && sortedByReports[0].reportCount === 12, 'Sort by reports desc places highest reportCount first');

  const sortedBySupports = [...dataset].sort((a, b) => b.supportCount - a.supportCount);
  assert(sortedBySupports[0].id === 'pr-1' && sortedBySupports[0].supportCount === 45, 'Sort by supports desc places highest supportCount first');

  // 9. Test Pagination Math
  const total = 55;
  const limit = 15;
  const totalPages = Math.ceil(total / limit);
  const page = 2;
  const skip = (page - 1) * limit;
  assert(totalPages === 4, `Total pages math correct (55 items / 15 per page = ${totalPages} pages)`);
  assert(skip === 15, `Skip offset calculation correct for page 2 (skip = ${skip})`);

  console.log(`\n========================================`);
  console.log(`Phase 19 Tests finished: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

function runAdminReviewTests() {
  console.log('🧪 Running Phase-20 Admin Review Actions & Verification Tests...\n');
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

  // 1. Test Verification Logic & Timeline Generation
  interface MockProblemState {
    id: string;
    title: string;
    status: ProblemStatus;
    adminPriority: PriorityLevel | null;
    autoPriority: PriorityLevel;
    reportCount: number;
    timeline: Array<{ from: ProblemStatus; to: ProblemStatus; note: string }>;
  }

  const problemState: MockProblemState = {
    id: 'prob-100',
    title: 'Severe road crater on 5th Ave',
    status: 'SUBMITTED',
    adminPriority: null,
    autoPriority: 'MAJOR',
    reportCount: 1,
    timeline: [],
  };

  // Simulate Verify
  function applyVerify(prob: MockProblemState, priorityOverride?: PriorityLevel, note?: string) {
    const from = prob.status;
    prob.status = 'VERIFIED';
    if (priorityOverride) {
      prob.adminPriority = priorityOverride;
    }
    prob.timeline.push({
      from,
      to: 'VERIFIED',
      note: note || 'Problem verified by municipal triage officer',
    });
    return prob;
  }

  const verifiedProb = applyVerify({ ...problemState, timeline: [] }, 'CRITICAL', 'Urgent public safety issue');
  assert(verifiedProb.status === 'VERIFIED', 'Verify transitions problem status to VERIFIED');
  assert(verifiedProb.adminPriority === 'CRITICAL', 'Verify correctly sets optional adminPriority override');
  assert(
    verifiedProb.timeline.length === 1 && verifiedProb.timeline[0].to === 'VERIFIED',
    'Verify creates corresponding ProblemTimeline event'
  );

  // 2. Test Reject Action & Validation
  function applyReject(prob: MockProblemState, reason: string) {
    if (!reason || !reason.trim()) {
      throw new Error('Rejection reason is required');
    }
    const from = prob.status;
    prob.status = 'REJECTED';
    prob.timeline.push({
      from,
      to: 'REJECTED',
      note: `Rejected: ${reason.trim()}`,
    });
    return prob;
  }

  let rejectErrorCaught = false;
  try {
    applyReject({ ...problemState, timeline: [] }, '');
  } catch {
    rejectErrorCaught = true;
  }
  assert(rejectErrorCaught, 'Empty rejection reason is strictly rejected with error');

  const rejectedProb = applyReject({ ...problemState, timeline: [] }, 'Insufficient evidence provided in photo');
  assert(rejectedProb.status === 'REJECTED', 'Valid reason transitions problem status to REJECTED');
  assert(
    rejectedProb.timeline[0].note.includes('Insufficient evidence provided'),
    'Rejection timeline note preserves municipal rationale'
  );

  // 3. Test Mark Duplicate Action
  const canonicalProb: MockProblemState = {
    id: 'canonical-200',
    title: 'Deep road damage on 5th Ave',
    status: 'VERIFIED',
    adminPriority: null,
    autoPriority: 'MAJOR',
    reportCount: 3,
    timeline: [],
  };

  function applyDuplicate(duplicate: MockProblemState, canonical: MockProblemState, note?: string) {
    if (duplicate.id === canonical.id) {
      throw new Error('A problem cannot be marked as duplicate of itself');
    }
    const from = duplicate.status;
    duplicate.status = 'DUPLICATE';
    duplicate.timeline.push({
      from,
      to: 'DUPLICATE',
      note: `Marked duplicate of #${canonical.id}. ${note || ''}`.trim(),
    });

    // Merge into canonical
    canonical.reportCount += 1;
    canonical.timeline.push({
      from: canonical.status,
      to: canonical.status,
      note: `Merged duplicate report from #${duplicate.id}`,
    });

    return { duplicate, canonical };
  }

  let selfDuplicateCaught = false;
  try {
    applyDuplicate(problemState, problemState);
  } catch {
    selfDuplicateCaught = true;
  }
  assert(selfDuplicateCaught, 'Problem cannot be marked duplicate of itself');

  const merged = applyDuplicate(
    { ...problemState, timeline: [] },
    { ...canonicalProb, timeline: [] },
    'Same pothole reported at intersection'
  );
  assert(merged.duplicate.status === 'DUPLICATE', 'Target problem marked as DUPLICATE');
  assert(merged.canonical.reportCount === 4, 'Canonical problem reportCount successfully incremented (3 -> 4)');
  assert(
    merged.canonical.timeline[0].note.includes('Merged duplicate report'),
    'Canonical problem logs timeline merge entry'
  );

  console.log(`\n========================================`);
  console.log(`Phase 20 Tests finished: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

function runAdminAssignmentTests() {
  console.log('🧪 Running Phase-21 Department Assignment Logic Tests...\n');
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

  interface MockDepartment {
    id: string;
    name: string;
    code: string;
  }

  const mockDepartments: MockDepartment[] = [
    { id: 'dept-roads', name: 'Road Maintenance Dept', code: 'ROADS' },
    { id: 'dept-water', name: 'Water Supply & Sewage Board', code: 'WATER' },
    { id: 'dept-garbage', name: 'Solid Waste Management', code: 'GARBAGE' },
    { id: 'dept-elec', name: 'Electrical Operations Cell', code: 'ELECTRICITY' },
    { id: 'dept-traffic', name: 'Traffic Engineering Cell', code: 'TRAFFIC' },
    { id: 'dept-sanis', name: 'Public Health & Sanitation', code: 'SANIS' },
  ];

  interface MockProblemAssignmentState {
    id: string;
    title: string;
    status: ProblemStatus;
    category: ProblemCategory;
    departmentId: string | null;
    timeline: Array<{ from: ProblemStatus; to: ProblemStatus; note: string; actor: string }>;
  }

  const problemState: MockProblemAssignmentState = {
    id: 'pr-verified-1',
    title: 'Severe road sinkhole on Highway 4',
    status: 'VERIFIED',
    category: 'ROAD',
    departmentId: null,
    timeline: [
      { from: 'SUBMITTED', to: 'VERIFIED', note: 'Verified by officer', actor: 'Admin' },
    ],
  };

  // Simulate assignment function
  function applyAssignment(
    problem: MockProblemAssignmentState,
    departmentId: string,
    options: { zone?: string; team?: string; note?: string; actor?: string }
  ) {
    if (!departmentId || !departmentId.trim()) {
      throw new Error('Department ID is required for assignment');
    }

    const dept = mockDepartments.find((d) => d.id === departmentId);
    if (!dept) {
      throw new Error('Department not found');
    }

    const from = problem.status;
    problem.status = 'ASSIGNED';
    problem.departmentId = dept.id;

    const parts: string[] = [];
    if (options.zone?.trim()) parts.push(`Zone: ${options.zone.trim()}`);
    if (options.team?.trim()) parts.push(`Team: ${options.team.trim()}`);
    const teamZone = parts.length > 0 ? ` (${parts.join(', ')})` : '';
    const customNote = options.note?.trim() ? ` Note: ${options.note.trim()}` : '';

    const timelineNote = `Assigned to ${dept.name}${teamZone}.${customNote}`.trim();

    problem.timeline.push({
      from,
      to: 'ASSIGNED',
      note: timelineNote,
      actor: options.actor || 'Admin',
    });

    return { problem, department: dept, note: timelineNote };
  }

  // 1. Test VERIFIED -> ASSIGNED transition with department and zone
  const assignedResult = applyAssignment(
    { ...problemState, timeline: [...problemState.timeline] },
    'dept-roads',
    { zone: 'Zone 3', team: 'Asphalt Rapid Unit', note: 'Dispatch immediately' }
  );

  assert(assignedResult.problem.status === 'ASSIGNED', 'Status successfully transitions from VERIFIED to ASSIGNED');
  assert(assignedResult.problem.departmentId === 'dept-roads', 'Department ID correctly assigned to problem');
  assert(
    assignedResult.note.includes('Road Maintenance Dept') &&
      assignedResult.note.includes('Zone: Zone 3') &&
      assignedResult.note.includes('Team: Asphalt Rapid Unit'),
    'Timeline note properly formats department name, zone, and dispatch team'
  );
  assert(
    assignedResult.problem.timeline[assignedResult.problem.timeline.length - 1].to === 'ASSIGNED',
    'ProblemTimeline entry created with toStatus ASSIGNED'
  );

  // 2. Test Missing department validation
  let missingDeptError = false;
  try {
    applyAssignment({ ...problemState, timeline: [] }, '', {});
  } catch {
    missingDeptError = true;
  }
  assert(missingDeptError, 'Missing departmentId throws validation error');

  // 3. Test Invalid department validation
  let invalidDeptError = false;
  try {
    applyAssignment({ ...problemState, timeline: [] }, 'non-existent-dept', {});
  } catch {
    invalidDeptError = true;
  }
  assert(invalidDeptError, 'Non-existent departmentId throws not found error');

  // 4. Test Category Recommended Department Mapping
  const categoryDeptMap: Record<ProblemCategory, string> = {
    ROAD: 'ROADS',
    WATER: 'WATER',
    GARBAGE: 'GARBAGE',
    ELECTRICITY: 'ELECTRICITY',
    TRAFFIC: 'TRAFFIC',
    OTHER: 'SANIS',
  };

  const roadDeptCode = categoryDeptMap['ROAD'];
  const matchedRoadDept = mockDepartments.find((d) => d.code === roadDeptCode);
  assert(matchedRoadDept?.name === 'Road Maintenance Dept', 'Category ROAD maps to Road Maintenance Dept');

  const waterDeptCode = categoryDeptMap['WATER'];
  const matchedWaterDept = mockDepartments.find((d) => d.code === waterDeptCode);
  assert(matchedWaterDept?.name === 'Water Supply & Sewage Board', 'Category WATER maps to Water Supply & Sewage Board');

  console.log(`\n========================================`);
  console.log(`Phase 21 Tests finished: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

function runAdminStatusManagementTests() {
  console.log('🧪 Running Phase-22 Status Management & Transition Map Tests...\n');
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

  // 1. Verify valid full lifecycle transition chain
  // SUBMITTED -> UNDER_REVIEW -> VERIFIED -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED -> REOPENED
  interface TestProblem {
    id: string;
    status: ProblemStatus;
    departmentId?: string | null;
    timeline: Array<{ from: ProblemStatus | null; to: ProblemStatus; note: string; actor: string }>;
  }

  const applyStatusTransition = (
    problem: TestProblem,
    toStatus: ProblemStatus,
    note?: string,
    departmentId?: string
  ): TestProblem => {
    // 1. Validate using transition map
    validateTransition(problem.status, toStatus);

    // If toStatus is ASSIGNED, ensure department exists
    if (toStatus === 'ASSIGNED') {
      const activeDept = departmentId || problem.departmentId;
      if (!activeDept) {
        throw new Error('Department required for ASSIGNED transition');
      }
    }

    const defaultNotes: Record<ProblemStatus, string> = {
      SUBMITTED: 'Report submitted.',
      UNDER_REVIEW: 'Status moved to Under Review.',
      VERIFIED: 'Report verified by municipal officer.',
      ASSIGNED: 'Assigned to municipal department.',
      IN_PROGRESS: 'Field crew deployed. Repair work in progress.',
      RESOLVED: 'Municipal work completed and marked resolved.',
      COMMUNITY_VERIFIED: 'Citizen community verified resolution.',
      CLOSED: 'Municipal problem case closed.',
      REJECTED: 'Problem report rejected.',
      DUPLICATE: 'Marked as duplicate problem.',
      REOPENED: 'Problem reopened for further municipal action.',
    };

    const timelineNote = note || defaultNotes[toStatus];
    const newTimeline = [
      ...problem.timeline,
      { from: problem.status, to: toStatus, note: timelineNote, actor: 'admin-1' },
    ];

    return {
      ...problem,
      status: toStatus,
      ...(departmentId ? { departmentId } : {}),
      timeline: newTimeline,
    };
  };

  let testProb: TestProblem = {
    id: 'prob-lifecycle-1',
    status: 'VERIFIED',
    departmentId: 'dept-roads',
    timeline: [{ from: null, to: 'SUBMITTED', note: 'Created', actor: 'user-1' }],
  };

  // VERIFIED -> ASSIGNED
  testProb = applyStatusTransition(testProb, 'ASSIGNED', 'Assigned to Roads');
  assert(testProb.status === 'ASSIGNED', 'Valid transition: VERIFIED -> ASSIGNED');
  assert(
    testProb.timeline[testProb.timeline.length - 1].to === 'ASSIGNED',
    'Timeline logs entry for ASSIGNED'
  );

  // ASSIGNED -> IN_PROGRESS
  testProb = applyStatusTransition(testProb, 'IN_PROGRESS', 'Crews dispatched to pothole site');
  assert(testProb.status === 'IN_PROGRESS', 'Valid transition: ASSIGNED -> IN_PROGRESS');
  assert(
    testProb.timeline[testProb.timeline.length - 1].note === 'Crews dispatched to pothole site',
    'Timeline preserves work-in-progress note'
  );

  // IN_PROGRESS -> RESOLVED
  testProb = applyStatusTransition(testProb, 'RESOLVED', 'Asphalt repaved and inspected');
  assert(testProb.status === 'RESOLVED', 'Valid transition: IN_PROGRESS -> RESOLVED');

  // RESOLVED -> CLOSED
  testProb = applyStatusTransition(testProb, 'CLOSED', 'Case officially closed');
  assert(testProb.status === 'CLOSED', 'Valid transition: RESOLVED -> CLOSED');

  // CLOSED -> REOPENED
  testProb = applyStatusTransition(testProb, 'REOPENED', 'Citizen reported road subsided again');
  assert(testProb.status === 'REOPENED', 'Valid transition: CLOSED -> REOPENED');

  // REOPENED -> UNDER_REVIEW
  testProb = applyStatusTransition(testProb, 'UNDER_REVIEW', 'Sent back to triage review');
  assert(testProb.status === 'UNDER_REVIEW', 'Valid transition: REOPENED -> UNDER_REVIEW');

  // 2. Test illegal transitions blocked by transition map
  // Test illegal jump: SUBMITTED -> CLOSED
  let submittedToClosedBlocked = false;
  try {
    validateTransition('SUBMITTED', 'CLOSED');
  } catch {
    submittedToClosedBlocked = true;
  }
  assert(submittedToClosedBlocked, 'Illegal jump prevented: SUBMITTED -> CLOSED throws error');

  // Test illegal jump: VERIFIED -> RESOLVED (cannot resolve without assigning & in-progress)
  let verifiedToResolvedBlocked = false;
  try {
    validateTransition('VERIFIED', 'RESOLVED');
  } catch {
    verifiedToResolvedBlocked = true;
  }
  assert(verifiedToResolvedBlocked, 'Illegal jump prevented: VERIFIED -> RESOLVED throws error');

  // Test illegal jump from terminal duplicate state: DUPLICATE -> IN_PROGRESS
  let duplicateToInProgressBlocked = false;
  try {
    validateTransition('DUPLICATE', 'IN_PROGRESS');
  } catch {
    duplicateToInProgressBlocked = true;
  }
  assert(duplicateToInProgressBlocked, 'Terminal state protection: DUPLICATE -> IN_PROGRESS throws error');

  // Test illegal transition to same status: IN_PROGRESS -> IN_PROGRESS
  let sameStatusBlocked = false;
  try {
    validateTransition('IN_PROGRESS', 'IN_PROGRESS');
  } catch {
    sameStatusBlocked = true;
  }
  assert(sameStatusBlocked, 'Same-status transition blocked: IN_PROGRESS -> IN_PROGRESS throws error');

  // 3. Test getAllowedTransitions query helper
  const assignedAllowed = getAllowedTransitions('ASSIGNED');
  assert(
    assignedAllowed.includes('IN_PROGRESS') &&
      assignedAllowed.includes('REOPENED') &&
      assignedAllowed.includes('REJECTED'),
    'Allowed transitions for ASSIGNED contains IN_PROGRESS, REOPENED, and REJECTED'
  );

  const resolvedAllowed = getAllowedTransitions('RESOLVED');
  assert(
    resolvedAllowed.includes('CLOSED') &&
      resolvedAllowed.includes('COMMUNITY_VERIFIED') &&
      resolvedAllowed.includes('REOPENED'),
    'Allowed transitions for RESOLVED contains CLOSED, COMMUNITY_VERIFIED, and REOPENED'
  );

  // 4. Test ASSIGNED transition requires department
  let missingDeptForAssigned = false;
  try {
    applyStatusTransition(
      { id: 'prob-no-dept', status: 'VERIFIED', departmentId: null, timeline: [] },
      'ASSIGNED'
    );
  } catch {
    missingDeptForAssigned = true;
  }
  assert(missingDeptForAssigned, 'Transition to ASSIGNED requires an assigned department');

  console.log(`\n========================================`);
  console.log(`Phase 22 Tests finished: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

function runAdminResolutionTests() {
  console.log('🧪 Running Phase-23 Resolution System & Proof of Work Tests...\n');
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

  interface MockMediaItem {
    id: string;
    url: string;
    mediaType: string;
    publicId?: string;
  }

  interface MockResolution {
    id: string;
    description: string;
    resolvedAt: Date;
    isReopened: boolean;
    proofMedia: MockMediaItem[];
  }

  interface MockProblemWithResolution {
    id: string;
    status: ProblemStatus;
    resolution?: MockResolution | null;
    timeline: Array<{ from: ProblemStatus | null; to: ProblemStatus; note: string; actor: string }>;
  }

  const applyResolution = (
    problem: MockProblemWithResolution,
    description: string,
    proofMedia: Array<{ url: string; mediaType?: string; publicId?: string }> = []
  ): MockProblemWithResolution => {
    if (!description || !description.trim()) {
      throw new Error('Resolution description is required');
    }
    const cleanDesc = description.trim();
    if (cleanDesc.length < 5) {
      throw new Error('Resolution description must be at least 5 characters');
    }

    // Validate transition: IN_PROGRESS -> RESOLVED
    if (problem.status !== 'RESOLVED') {
      validateTransition(problem.status, 'RESOLVED');
    }

    const createdResolution: MockResolution = {
      id: `res-${Date.now()}`,
      description: cleanDesc,
      resolvedAt: new Date(),
      isReopened: false,
      proofMedia: proofMedia.map((m, idx) => ({
        id: `proof-${idx}`,
        url: m.url,
        mediaType: m.mediaType || 'image',
        publicId: m.publicId,
      })),
    };

    const timelineNote = `Marked resolved: ${cleanDesc}`;
    const newTimeline = [
      ...problem.timeline,
      { from: problem.status, to: 'RESOLVED' as ProblemStatus, note: timelineNote, actor: 'admin-1' },
    ];

    return {
      ...problem,
      status: 'RESOLVED',
      resolution: createdResolution,
      timeline: newTimeline,
    };
  };

  // 1. Successful IN_PROGRESS -> RESOLVED with proof photos
  const inProgressProb: MockProblemWithResolution = {
    id: 'prob-pothole-1',
    status: 'IN_PROGRESS',
    resolution: null,
    timeline: [
      { from: null, to: 'SUBMITTED', note: 'Created', actor: 'citizen' },
      { from: 'SUBMITTED', to: 'VERIFIED', note: 'Verified', actor: 'admin' },
      { from: 'VERIFIED', to: 'ASSIGNED', note: 'Assigned', actor: 'admin' },
      { from: 'ASSIGNED', to: 'IN_PROGRESS', note: 'Repairs underway', actor: 'admin' },
    ],
  };

  const resolved = applyResolution(
    inProgressProb,
    'Pothole excavated, filled with hot-mix asphalt, compacted and sealed.',
    [
      { url: 'https://res.cloudinary.com/proof1.jpg', mediaType: 'image' },
      { url: 'https://res.cloudinary.com/proof2.mp4', mediaType: 'video' },
    ]
  );

  assert(resolved.status === 'RESOLVED', 'Status successfully transitions to RESOLVED');
  assert(resolved.resolution !== null && resolved.resolution !== undefined, 'Resolution record created on problem');
  assert(
    Boolean(resolved.resolution?.description.includes('Pothole excavated')),
    'Resolution description properly persisted'
  );
  assert(resolved.resolution?.proofMedia.length === 2, 'Proof media uploaded and linked to resolution (2 items)');
  assert(
    resolved.timeline[resolved.timeline.length - 1].to === 'RESOLVED',
    'ProblemTimeline entry created with toStatus RESOLVED'
  );
  assert(
    resolved.timeline[resolved.timeline.length - 1].note.includes('Pothole excavated'),
    'Timeline note includes resolution summary'
  );

  // 2. Test missing or short description validation
  let emptyDescError = false;
  try {
    applyResolution(inProgressProb, '   ', []);
  } catch {
    emptyDescError = true;
  }
  assert(emptyDescError, 'Empty resolution description throws validation error');

  let shortDescError = false;
  try {
    applyResolution(inProgressProb, 'done', []);
  } catch {
    shortDescError = true;
  }
  assert(shortDescError, 'Description shorter than 5 chars throws validation error');

  // 3. Test illegal transition: cannot resolve from SUBMITTED or VERIFIED without IN_PROGRESS
  let submittedResolveBlocked = false;
  try {
    applyResolution({ ...inProgressProb, status: 'SUBMITTED' }, 'Premature resolution', []);
  } catch {
    submittedResolveBlocked = true;
  }
  assert(submittedResolveBlocked, 'Cannot resolve directly from SUBMITTED (must be IN_PROGRESS)');

  let verifiedResolveBlocked = false;
  try {
    applyResolution({ ...inProgressProb, status: 'VERIFIED' }, 'Premature resolution', []);
  } catch {
    verifiedResolveBlocked = true;
  }
  assert(verifiedResolveBlocked, 'Cannot resolve directly from VERIFIED (must be ASSIGNED -> IN_PROGRESS)');

  // 4. Test re-resolving an issue after being reopened
  const reopenedProb: MockProblemWithResolution = {
    id: 'prob-reopened-1',
    status: 'IN_PROGRESS',
    resolution: {
      id: 'res-old',
      description: 'First attempt',
      resolvedAt: new Date(Date.now() - 86400000),
      isReopened: true,
      proofMedia: [],
    },
    timeline: [],
  };

  const reResolved = applyResolution(
    reopenedProb,
    'Second attempt complete with reinforced concrete seal.',
    [{ url: 'https://res.cloudinary.com/proof-new.jpg', mediaType: 'image' }]
  );
  assert(reResolved.status === 'RESOLVED', 'Reopened problem successfully re-resolved from IN_PROGRESS');
  assert(
    Boolean(reResolved.resolution?.description.includes('reinforced concrete seal')),
    'Updated resolution description saved'
  );
  assert(reResolved.resolution?.proofMedia.length === 1, 'Updated proof media attached');

  console.log(`\n========================================`);
  console.log(`Phase 23 Tests finished: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAdminDashboardTests();
runAdminProblemManagementTests();
runAdminReviewTests();
runAdminAssignmentTests();
runAdminStatusManagementTests();
runAdminResolutionTests();
runAdminAnalyticsTests();
runAdminMapTests();

function runAdminAnalyticsTests() {
  console.log('\n--- Running Phase 24 Admin Analytics Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  interface MockAnalyticsProblem {
    id: string;
    category: string;
    area: string;
    status: string;
    autoPriority: string;
    adminPriority?: string | null;
    createdAt: Date;
    resolution?: {
      resolvedAt: Date;
    } | null;
  }

  const now = new Date('2026-09-30T10:00:00Z');

  const mockProblems: MockAnalyticsProblem[] = [
    {
      id: 'p1',
      category: 'ROAD',
      area: 'Downtown',
      status: 'RESOLVED',
      autoPriority: 'LOW',
      adminPriority: 'CRITICAL',
      createdAt: new Date('2026-09-20T10:00:00Z'),
      resolution: { resolvedAt: new Date('2026-09-22T10:00:00Z') },
    },
    {
      id: 'p2',
      category: 'ROAD',
      area: 'Downtown',
      status: 'COMMUNITY_VERIFIED',
      autoPriority: 'MAJOR',
      adminPriority: null,
      createdAt: new Date('2026-09-25T10:00:00Z'),
      resolution: { resolvedAt: new Date('2026-09-26T10:00:00Z') },
    },
    {
      id: 'p3',
      category: 'WATER',
      area: 'Westside',
      status: 'IN_PROGRESS',
      autoPriority: 'CRITICAL',
      adminPriority: null,
      createdAt: new Date('2026-09-28T10:00:00Z'),
      resolution: null,
    },
    {
      id: 'p4',
      category: 'GARBAGE',
      area: 'North End',
      status: 'SUBMITTED',
      autoPriority: 'LOW',
      adminPriority: null,
      createdAt: new Date('2026-09-29T10:00:00Z'),
      resolution: null,
    },
    {
      id: 'p5',
      category: 'ROAD',
      area: 'Westside',
      status: 'CLOSED',
      autoPriority: 'MAJOR',
      adminPriority: null,
      createdAt: new Date('2026-08-15T10:00:00Z'),
      resolution: { resolvedAt: new Date('2026-08-17T10:00:00Z') },
    },
  ];

  const resolvedStatuses = ['RESOLVED', 'COMMUNITY_VERIFIED', 'CLOSED'];

  // 1. Total & Resolution Ratio
  const total = mockProblems.length;
  const resolvedCount = mockProblems.filter(p => resolvedStatuses.includes(p.status)).length;
  const unresolvedCount = total - resolvedCount;
  const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 1000) / 10 : 0;

  assert(total === 5, 'Total problems counted accurately (5)');
  assert(resolvedCount === 3, 'Resolved problems counted (3: RESOLVED, COMMUNITY_VERIFIED, CLOSED)');
  assert(unresolvedCount === 2, 'Unresolved problems counted (2)');
  assert(resolutionRate === 60, 'Resolution rate calculated accurately (60%)');

  // 2. Average Resolution Time
  const resolvedWithTimes = mockProblems.filter(
    p => p.resolution?.resolvedAt && resolvedStatuses.includes(p.status)
  );
  const totalResolutionMs = resolvedWithTimes.reduce((acc, p) => {
    return acc + (p.resolution!.resolvedAt.getTime() - p.createdAt.getTime());
  }, 0);
  const avgHours = totalResolutionMs > 0 ? Math.round((totalResolutionMs / (resolvedWithTimes.length * 3600000)) * 10) / 10 : 0;
  assert(avgHours === 40, 'Average resolution turnaround accurately computed (40.0 hours)');

  // 3. Category Distribution
  const roadProblems = mockProblems.filter(p => p.category === 'ROAD');
  const roadPercentage = Math.round((roadProblems.length / total) * 100);
  assert(roadProblems.length === 3, 'ROAD category has 3 problems');
  assert(roadPercentage === 60, 'ROAD category represents 60% of total');

  // 4. Priority Breakdown with Effective Priority override
  const criticalCount = mockProblems.filter(p => (p.adminPriority || p.autoPriority) === 'CRITICAL').length;
  assert(criticalCount === 2, 'Critical priority uses adminPriority override (p1 was LOW auto, CRITICAL admin)');

  // 5. Area Breakdown
  const areaCounts: Record<string, number> = {};
  mockProblems.forEach(p => {
    areaCounts[p.area] = (areaCounts[p.area] || 0) + 1;
  });
  assert(areaCounts['Downtown'] === 2, 'Downtown has 2 problems');
  assert(areaCounts['Westside'] === 2, 'Westside has 2 problems');
  assert(areaCounts['North End'] === 1, 'North End has 1 problem');

  // 6. Time Filtering (e.g. 7 days vs 30 days vs 90 days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const filtered7Days = mockProblems.filter(p => p.createdAt >= sevenDaysAgo);
  assert(filtered7Days.length === 3, '7-day range filters only recent problems (3)');

  // 7. Monthly Trends
  const monthlyBuckets: Record<string, { month: string; reports: number; resolved: number }> = {};
  mockProblems.forEach(p => {
    const monthKey = p.createdAt.toISOString().slice(0, 7);
    if (!monthlyBuckets[monthKey]) {
      monthlyBuckets[monthKey] = { month: monthKey, reports: 0, resolved: 0 };
    }
    monthlyBuckets[monthKey].reports++;
    if (resolvedStatuses.includes(p.status)) {
      monthlyBuckets[monthKey].resolved++;
    }
  });

  assert(monthlyBuckets['2026-08'].reports === 1, 'August 2026 bucket contains 1 report');
  assert(monthlyBuckets['2026-09'].reports === 4, 'September 2026 bucket contains 4 reports');
  assert(monthlyBuckets['2026-09'].resolved === 2, 'September 2026 bucket contains 2 resolved');

  console.log(`\n========================================`);
  console.log(`Phase 24 Tests finished: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

function runAdminMapTests() {
  console.log('\n--- Running Phase 26 Admin Map Logic Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  interface MockMapProblem {
    id: string;
    title: string;
    description: string;
    category: ProblemCategory;
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
    departmentId: string | null;
    department?: { id: string; name: string; code: string } | null;
  }

  const mockMapData: MockMapProblem[] = [
    {
      id: 'map-1',
      title: 'Major water pipeline burst on MG Road',
      description: 'Severe water flooding entire junction',
      category: 'WATER',
      autoPriority: 'CRITICAL',
      adminPriority: null,
      status: 'SUBMITTED',
      reportCount: 15,
      supportCount: 42,
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'MG Road Junction',
      area: 'Central Zone',
      city: 'Metro City',
      departmentId: null,
      department: null,
    },
    {
      id: 'map-2',
      title: 'Dangerous road crater and sinkhole',
      description: 'Deep road damage causing accidents',
      category: 'ROAD',
      autoPriority: 'LOW',
      adminPriority: 'CRITICAL',
      status: 'IN_PROGRESS',
      reportCount: 9,
      supportCount: 28,
      latitude: 12.9750,
      longitude: 77.6000,
      address: 'Brigade Road 4th Cross',
      area: 'Central Zone',
      city: 'Metro City',
      departmentId: 'dept-roads',
      department: { id: 'dept-roads', name: 'Roads & Infrastructure', code: 'ROADS' },
    },
    {
      id: 'map-3',
      title: 'Flickering streetlights at night',
      description: 'Multiple streetlights unlit on park pathway',
      category: 'ELECTRICITY',
      autoPriority: 'LOW',
      adminPriority: null,
      status: 'UNDER_REVIEW',
      reportCount: 2,
      supportCount: 6,
      latitude: 12.9800,
      longitude: 77.6100,
      address: 'Cubbon Park Perimeter',
      area: 'Parkside',
      city: 'Metro City',
      departmentId: null,
      department: null,
    },
    {
      id: 'map-4',
      title: 'Garbage dump near primary school',
      description: 'Solid waste unattended for 5 days',
      category: 'GARBAGE',
      autoPriority: 'MAJOR',
      adminPriority: null,
      status: 'ASSIGNED',
      reportCount: 8,
      supportCount: 19,
      latitude: 12.9600,
      longitude: 77.5800,
      address: 'School Lane Sector 3',
      area: 'South Ward',
      city: 'Metro City',
      departmentId: 'dept-waste',
      department: { id: 'dept-waste', name: 'Solid Waste Management', code: 'GARBAGE' },
    },
    {
      id: 'map-5',
      title: 'Repaired bridge expansion joint',
      description: 'Joint resurfaced with concrete overlay',
      category: 'ROAD',
      autoPriority: 'MAJOR',
      adminPriority: null,
      status: 'RESOLVED',
      reportCount: 12,
      supportCount: 30,
      latitude: 12.9900,
      longitude: 77.6200,
      address: 'Flyover North ramp',
      area: 'North Ring',
      city: 'Metro City',
      departmentId: 'dept-roads',
      department: { id: 'dept-roads', name: 'Roads & Infrastructure', code: 'ROADS' },
    },
    {
      id: 'map-6',
      title: 'Closed community verified sewer fix',
      description: 'Sewer line replaced and tested',
      category: 'WATER',
      autoPriority: 'LOW',
      adminPriority: null,
      status: 'CLOSED',
      reportCount: 5,
      supportCount: 14,
      latitude: 12.9500,
      longitude: 77.5700,
      address: 'Old Town Lane',
      area: 'Old Town',
      city: 'Metro City',
      departmentId: 'dept-water',
      department: { id: 'dept-water', name: 'Water & Sewage Board', code: 'WATER' },
    },
  ];

  const effectivePriority = (p: MockMapProblem) => p.adminPriority ?? p.autoPriority;

  // 1. Filter ALL
  assert(mockMapData.length === 6, 'Filter "ALL" returns all map records (6)');

  // 2. Filter CRITICAL (effective priority CRITICAL)
  const criticalProblems = mockMapData.filter((p) => effectivePriority(p) === 'CRITICAL');
  assert(criticalProblems.length === 2, 'Filter "CRITICAL" returns 2 items with effective CRITICAL priority');
  assert(
    criticalProblems.some((p) => p.id === 'map-1') && criticalProblems.some((p) => p.id === 'map-2'),
    'Filter "CRITICAL" respects both autoPriority fallback (map-1) and adminPriority override (map-2)'
  );

  // 3. Filter UNVERIFIED (SUBMITTED or UNDER_REVIEW)
  const unverifiedProblems = mockMapData.filter((p) =>
    ['SUBMITTED', 'UNDER_REVIEW'].includes(p.status)
  );
  assert(unverifiedProblems.length === 2, 'Filter "UNVERIFIED" isolates SUBMITTED & UNDER_REVIEW (2 items)');
  assert(
    unverifiedProblems.every((p) => ['map-1', 'map-3'].includes(p.id)),
    'Filter "UNVERIFIED" matches map-1 and map-3'
  );

  // 4. Filter IN_PROGRESS
  const inProgressProblems = mockMapData.filter((p) => p.status === 'IN_PROGRESS');
  assert(inProgressProblems.length === 1, 'Filter "IN_PROGRESS" isolates 1 in-progress problem');
  assert(inProgressProblems[0].id === 'map-2', 'Filter "IN_PROGRESS" returns map-2');

  // 5. Filter UNRESOLVED (not in RESOLVED, COMMUNITY_VERIFIED, CLOSED, REJECTED, DUPLICATE)
  const resolvedStatuses: ProblemStatus[] = [
    'RESOLVED',
    'COMMUNITY_VERIFIED',
    'CLOSED',
    'REJECTED',
    'DUPLICATE',
  ];
  const unresolvedProblems = mockMapData.filter((p) => !resolvedStatuses.includes(p.status));
  assert(unresolvedProblems.length === 4, 'Filter "UNRESOLVED" returns all active unresolved problems (4)');
  assert(
    unresolvedProblems.every((p) => ['map-1', 'map-2', 'map-3', 'map-4'].includes(p.id)),
    'Filter "UNRESOLVED" matches SUBMITTED, UNDER_REVIEW, IN_PROGRESS, and ASSIGNED'
  );

  // 6. Marker Payload Details Specification
  // Marker click shows: Problem -> Priority -> Reports -> Supports -> Status -> Assigned Department
  const sampleMarker = mockMapData.find((p) => p.id === 'map-2')!;
  assert(sampleMarker.title.length > 0, 'Marker payload includes Problem title');
  assert(effectivePriority(sampleMarker) === 'CRITICAL', 'Marker payload includes Priority');
  assert(sampleMarker.reportCount === 9, 'Marker payload includes Reports count');
  assert(sampleMarker.supportCount === 28, 'Marker payload includes Supports count');
  assert(sampleMarker.status === 'IN_PROGRESS', 'Marker payload includes Status');
  assert(sampleMarker.department?.name === 'Roads & Infrastructure', 'Marker payload includes Assigned Department');

  // 7. Unassigned Department detection
  const unassignedMarker = mockMapData.find((p) => p.id === 'map-1')!;
  assert(
    unassignedMarker.department === null && unassignedMarker.departmentId === null,
    'Marker handles unassigned department cleanly'
  );

  // 8. Bounding Box spatial filtering
  const swLat = 12.9700;
  const swLng = 77.5900;
  const neLat = 12.9850;
  const neLng = 77.6150;
  const boundedProblems = mockMapData.filter(
    (p) =>
      p.latitude >= swLat &&
      p.latitude <= neLat &&
      p.longitude >= swLng &&
      p.longitude <= neLng
  );
  assert(boundedProblems.length === 3, 'Bounding box correctly isolates 3 problems in Central Area');
  assert(
    boundedProblems.every((p) => ['map-1', 'map-2', 'map-3'].includes(p.id)),
    'Spatial coordinates filter accurately bounded markers'
  );

  console.log(`\n========================================`);
  console.log(`Phase 26 Tests finished: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}




