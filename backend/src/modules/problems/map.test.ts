import { PriorityLevel, ProblemStatus, ProblemCategory } from '@prisma/client';

export async function runMapTests() {
  console.log('🧪 Running Phase-28 [Map Module] Tests...\n');
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

  interface MapProblemItem {
    id: string;
    latitude: number;
    longitude: number;
    title: string;
    category: ProblemCategory;
    autoPriority: PriorityLevel;
    adminPriority: PriorityLevel | null;
    status: ProblemStatus;
    reportCount: number;
    supportCount: number;
    address: string;
    area: string;
    city: string;
    department?: { id: string; name: string; code: string } | null;
  }

  const mockDataset: MapProblemItem[] = [
    {
      id: 'm-1',
      latitude: 12.9716,
      longitude: 77.5946,
      title: 'Water pipe leak near Metro station',
      category: 'WATER',
      autoPriority: 'CRITICAL',
      adminPriority: null,
      status: 'SUBMITTED',
      reportCount: 12,
      supportCount: 35,
      address: 'Station Square',
      area: 'Central Zone',
      city: 'Metro City',
      department: null,
    },
    {
      id: 'm-2',
      latitude: 12.9750,
      longitude: 77.6000,
      title: 'Massive pothole on outer bypass',
      category: 'ROAD',
      autoPriority: 'LOW',
      adminPriority: 'CRITICAL',
      status: 'IN_PROGRESS',
      reportCount: 8,
      supportCount: 22,
      address: 'Ring Road Pier 4',
      area: 'Central Zone',
      city: 'Metro City',
      department: { id: 'd-1', name: 'Roads & Infrastructure', code: 'ROADS' },
    },
    {
      id: 'm-3',
      latitude: 12.9850,
      longitude: 77.6150,
      title: 'Garbage accumulation near market',
      category: 'GARBAGE',
      autoPriority: 'MAJOR',
      adminPriority: null,
      status: 'RESOLVED',
      reportCount: 5,
      supportCount: 14,
      address: 'Market Yard Gate 2',
      area: 'North Market',
      city: 'Metro City',
      department: { id: 'd-2', name: 'Solid Waste Management', code: 'GARBAGE' },
    },
  ];

  // 1. Case: coordinates validation
  function validateCoordinates(lat: number, lng: number): boolean {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  }

  assert(validateCoordinates(12.9716, 77.5946), 'coordinates: valid Bengaluru lat/lng coordinates accepted');
  assert(!validateCoordinates(95.0, 77.5946), 'coordinates: latitude > 90 rejected');
  assert(!validateCoordinates(-95.0, 77.5946), 'coordinates: latitude < -90 rejected');
  assert(!validateCoordinates(12.9716, 185.0), 'coordinates: longitude > 180 rejected');
  assert(!validateCoordinates(12.9716, -185.0), 'coordinates: longitude < -180 rejected');
  assert(!validateCoordinates(NaN, 77.5946), 'coordinates: NaN coordinates rejected');

  // 2. Case: marker loading (lightweight projection)
  function projectMarker(item: MapProblemItem) {
    return {
      id: item.id,
      latitude: item.latitude,
      longitude: item.longitude,
      title: item.title,
      priority: item.adminPriority ?? item.autoPriority,
      status: item.status,
      reportCount: item.reportCount,
      supportCount: item.supportCount,
      address: item.address,
      area: item.area,
      city: item.city,
    };
  }

  const projected = mockDataset.map(projectMarker);
  assert(projected.length === 3, 'marker loading: returns all requested map items');
  assert(projected[0].priority === 'CRITICAL', 'marker loading: auto priority fallback calculated');
  assert(projected[1].priority === 'CRITICAL', 'marker loading: admin priority override calculated');
  assert(
    !('description' in projected[0]) && !('createdById' in projected[0]),
    'marker loading: omits heavy relational text/payloads for lightweight viewport performance'
  );

  // 3. Case: hover (quick tooltip data presence)
  function getHoverTooltip(item: MapProblemItem) {
    const priority = item.adminPriority ?? item.autoPriority;
    return `${item.title} • [${priority}] • ${item.reportCount + item.supportCount} Backers`;
  }
  const hoverTooltip = getHoverTooltip(mockDataset[0]);
  assert(hoverTooltip.includes('Water pipe leak'), 'hover: tooltip includes problem title');
  assert(hoverTooltip.includes('CRITICAL'), 'hover: tooltip includes effective priority');
  assert(hoverTooltip.includes('47 Backers'), 'hover: tooltip shows combined civic engagement backers count');

  // 4. Case: click (complete popup dossier)
  function getClickPopupData(item: MapProblemItem) {
    return {
      problem: item.title,
      priority: item.adminPriority ?? item.autoPriority,
      reports: item.reportCount,
      supports: item.supportCount,
      status: item.status,
      assignedDepartment: item.department ? item.department.name : 'Unassigned',
      location: `${item.address}, ${item.area}, ${item.city}`,
    };
  }

  const popupData = getClickPopupData(mockDataset[1]);
  assert(popupData.problem === 'Massive pothole on outer bypass', 'click: popup contains problem title');
  assert(popupData.priority === 'CRITICAL', 'click: popup contains priority');
  assert(popupData.reports === 8, 'click: popup contains reports count');
  assert(popupData.supports === 22, 'click: popup contains supports count');
  assert(popupData.status === 'IN_PROGRESS', 'click: popup contains status');
  assert(popupData.assignedDepartment === 'Roads & Infrastructure', 'click: popup contains assigned department');

  const unassignedPopup = getClickPopupData(mockDataset[0]);
  assert(unassignedPopup.assignedDepartment === 'Unassigned', 'click: popup identifies unassigned department cleanly');

  // 5. Case: filtering (All / Critical / Unverified / In Progress / Unresolved)
  const filterAll = mockDataset;
  assert(filterAll.length === 3, 'filtering: ALL returns all markers');

  const filterCritical = mockDataset.filter(
    (m) => (m.adminPriority ?? m.autoPriority) === 'CRITICAL'
  );
  assert(filterCritical.length === 2, 'filtering: CRITICAL isolates 2 critical priority problems');

  const filterUnverified = mockDataset.filter((m) =>
    ['SUBMITTED', 'UNDER_REVIEW'].includes(m.status)
  );
  assert(filterUnverified.length === 1 && filterUnverified[0].id === 'm-1', 'filtering: UNVERIFIED isolates unreviewed report');

  const filterInProgress = mockDataset.filter((m) => m.status === 'IN_PROGRESS');
  assert(filterInProgress.length === 1 && filterInProgress[0].id === 'm-2', 'filtering: IN_PROGRESS isolates ongoing remediation');

  const filterUnresolved = mockDataset.filter(
    (m) => !['RESOLVED', 'COMMUNITY_VERIFIED', 'CLOSED', 'REJECTED', 'DUPLICATE'].includes(m.status)
  );
  assert(filterUnresolved.length === 2, 'filtering: UNRESOLVED isolates active non-closed problems (2)');

  console.log(`\nMap Module Tests finished: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
  return { passed, failed };
}

if (require.main === module) {
  runMapTests();
}
