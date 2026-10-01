import { ProblemSummary } from '../types/problem';

export const HERO_CONTENT = {
  badge: 'CIVIC RESOLUTION PLATFORM',
  heading: 'Transforming City Issues into Verified Solutions',
  subheading:
    'Report community problems, track real-time municipal response, and verify resolution progress together with full transparency.',
  primaryCta: 'Report a Problem',
  secondaryCta: 'Explore Map View',
  stats: [
    { value: '1,420+', label: 'Problems Resolved' },
    { value: '94%', label: 'Community Satisfaction' },
    { value: '< 48h', label: 'Avg Verification Time' },
  ],
};

export const FEATURED_PROBLEMS: ProblemSummary[] = [
  {
    id: 'prob-1',
    title: 'Severe Water Pipe Leak & Street Flooding',
    description:
      'High-pressure main line rupture causing water wastage and road erosion near the central market intersection.',
    category: 'WATER',
    severity: 9,
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    reportCount: 14,
    supportCount: 86,
    address: '452 Commerce Blvd, Sector 4',
    area: 'Central Market',
    city: 'Metro City',
    latitude: 12.9716,
    longitude: 77.5946,
    createdAt: '2026-09-28T09:30:00Z',
    updatedAt: '2026-09-29T11:20:00Z',
  },
  {
    id: 'prob-2',
    title: 'Damaged Asphalt & Deep Pothole Grid',
    description:
      'Multiple deep potholes causing traffic slowdowns and vehicle damage during peak commute hours.',
    category: 'ROAD',
    severity: 7,
    priority: 'MAJOR',
    status: 'ASSIGNED',
    reportCount: 8,
    supportCount: 42,
    address: '88 Oakridge Road, Near School Gate',
    area: 'Oakridge Suburb',
    city: 'Metro City',
    latitude: 12.965,
    longitude: 77.6,
    createdAt: '2026-09-27T14:15:00Z',
    updatedAt: '2026-09-28T16:00:00Z',
  },
  {
    id: 'prob-3',
    title: 'Non-Functional Streetlights along Public Park',
    description:
      'Entire stretch of streetlights broken for over 5 days creating safety hazards for evening pedestrians.',
    category: 'ELECTRICITY',
    severity: 5,
    priority: 'LOW',
    status: 'VERIFIED',
    reportCount: 3,
    supportCount: 19,
    address: 'Greenwood Park Boundary Road',
    area: 'Greenwood',
    city: 'Metro City',
    latitude: 12.98,
    longitude: 77.58,
    createdAt: '2026-09-26T18:45:00Z',
    updatedAt: '2026-09-27T10:00:00Z',
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Report with Evidence',
    description:
      'Citizens snap photos/videos, set exact location on the map, and submit issue details in seconds.',
  },
  {
    step: '02',
    title: 'Admin Verification & Priority Scoring',
    description:
      'Municipal staff review evidence, link duplicates, and assign priority scores based on severity and community backing.',
  },
  {
    step: '03',
    title: 'Department Assignment & Work',
    description:
      'Issues are dispatched to dedicated municipal departments (Roads, Water, Electricity) with real-time timeline tracking.',
  },
  {
    step: '04',
    title: 'Community Proof & Verification',
    description:
      'Resolution proof is published. Original reporters and community members vote to confirm the fix or request reopening.',
  },
];
