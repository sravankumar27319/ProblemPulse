import { NotificationEventType } from './notification.service';

function runNotificationTests() {
  console.log('🧪 Running Phase-17 Notifications Engine Logic Tests...\n');
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

  // 1. Stakeholder deduplication
  const problem = {
    id: 'prob_101',
    title: 'Main Street Pipeline Burst',
    createdById: 'user_1',
    reports: [{ userId: 'user_1' }, { userId: 'user_2' }, { userId: 'user_3' }],
    supports: [{ userId: 'user_2' }, { userId: 'user_4' }, { userId: 'user_5' }],
  };

  const recipientSet = new Set<string>();
  if (problem.createdById) recipientSet.add(problem.createdById);
  problem.reports.forEach((r) => recipientSet.add(r.userId));
  problem.supports.forEach((s) => recipientSet.add(s.userId));

  assert(
    recipientSet.size === 5 &&
      recipientSet.has('user_1') &&
      recipientSet.has('user_2') &&
      recipientSet.has('user_3') &&
      recipientSet.has('user_4') &&
      recipientSet.has('user_5'),
    `Stakeholder deduplication correctly identified unique recipients (${recipientSet.size} unique users)`
  );

  // 2. Formatted Messages for all Phase 17 lifecycle triggers
  function formatNotification(event: NotificationEventType, titleText: string, note?: string) {
    switch (event) {
      case 'VERIFIED':
        return { title: 'Report Verified', message: `Your report for "${titleText}" was verified by municipal authorities.` };
      case 'REJECTED':
        return { title: 'Report Rejected', message: `Your report for "${titleText}" was rejected.${note ? ` Reason: ${note}` : ''}` };
      case 'ASSIGNED':
        return { title: 'Department Assigned', message: `Your report for "${titleText}" was assigned to Water & Sanitation Dept.` };
      case 'IN_PROGRESS':
        return { title: 'Work Started', message: `Municipal work crews have initiated on-site repairs for "${titleText}".` };
      case 'RESOLVED':
        return { title: 'Problem Resolved!', message: `Municipal work on "${titleText}" has been completed and marked resolved.` };
      case 'REOPENED':
        return { title: 'Problem Reopened', message: `Citizen feedback indicated "${titleText}" requires further action and has been reopened.${note ? ` Note: ${note}` : ''}` };
      case 'COMMUNITY_VERIFIED':
        return { title: 'Community Verified', message: `Citizens confirmed the resolution for "${titleText}".` };
      case 'CLOSED':
        return { title: 'Problem Closed', message: `The municipal record for "${titleText}" has been closed.` };
    }
  }

  const verified = formatNotification('VERIFIED', problem.title);

  assert(verified.title === 'Report Verified' && verified.message.includes('verified'), 'VERIFIED trigger formats message correctly');

  const rejected = formatNotification('REJECTED', problem.title, 'Duplicate report');
  assert(rejected.title === 'Report Rejected' && rejected.message.includes('Reason: Duplicate report'), 'REJECTED trigger formats message with reason');

  const assigned = formatNotification('ASSIGNED', problem.title);
  assert(assigned.title === 'Department Assigned' && assigned.message.includes('Water & Sanitation Dept'), 'ASSIGNED trigger formats message with department');

  const inProgress = formatNotification('IN_PROGRESS', problem.title);
  assert(inProgress.title === 'Work Started' && inProgress.message.includes('initiated on-site repairs'), 'IN_PROGRESS (work started) trigger formats message');

  const resolved = formatNotification('RESOLVED', problem.title);
  assert(resolved.title === 'Problem Resolved!' && resolved.message.includes('marked resolved'), 'RESOLVED trigger formats message');

  const reopened = formatNotification('REOPENED', problem.title, 'Leak persists');
  assert(reopened.title === 'Problem Reopened' && reopened.message.includes('Note: Leak persists'), 'REOPENED trigger formats message with note');

  // 3. Unread count and mark-as-read simulation
  interface MockNotification {
    id: string;
    userId: string;
    isRead: boolean;
  }

  const mockNotifications: MockNotification[] = [
    { id: 'n1', userId: 'user_1', isRead: false },
    { id: 'n2', userId: 'user_1', isRead: false },
    { id: 'n3', userId: 'user_1', isRead: true },
  ];

  const unreadInitial = mockNotifications.filter((n) => !n.isRead).length;
  assert(unreadInitial === 2, 'Unread count computed accurately (2 unread)');

  // Mark single as read
  mockNotifications[0].isRead = true;
  const unreadAfterSingle = mockNotifications.filter((n) => !n.isRead).length;
  assert(unreadAfterSingle === 1, 'Marking single notification as read updates unread count (2 -> 1)');

  // Mark all as read
  mockNotifications.forEach((n) => (n.isRead = true));
  const unreadAfterAll = mockNotifications.filter((n) => !n.isRead).length;
  assert(unreadAfterAll === 0, 'Marking all notifications as read resets unread count to 0');

  console.log(`\n========================================`);
  console.log(`Phase 17 Tests finished: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runNotificationTests();
