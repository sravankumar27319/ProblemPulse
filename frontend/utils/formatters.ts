import { ProblemStatus, PriorityLevel, ProblemCategory } from '../types/problem';

export function formatStatusLabel(status: ProblemStatus): string {
  const map: Record<ProblemStatus, string> = {
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    VERIFIED: 'Verified',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    COMMUNITY_VERIFIED: 'Community Verified',
    CLOSED: 'Closed',
    REJECTED: 'Rejected',
    DUPLICATE: 'Duplicate',
    REOPENED: 'Reopened',
  };
  return map[status] || status;
}

export function formatPriorityLabel(priority: PriorityLevel): string {
  const map: Record<PriorityLevel, string> = {
    CRITICAL: 'Critical',
    MAJOR: 'Major',
    LOW: 'Low',
  };
  return map[priority] || priority;
}

export function formatCategoryLabel(category: ProblemCategory): string {
  const map: Record<ProblemCategory, string> = {
    ROAD: 'Roads & Footpaths',
    WATER: 'Water Supply & Leakage',
    GARBAGE: 'Garbage & Sanitation',
    ELECTRICITY: 'Streetlights & Power',
    TRAFFIC: 'Traffic & Signals',
    OTHER: 'Other Hazards',
  };
  return map[category] || category;
}

export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Calculates combined community engagement (reporters + supporters)
 */
export function getCombinedEngagement(reportCount: number = 0, supportCount: number = 0): number {
  return (reportCount || 0) + (supportCount || 0);
}

/**
 * Formats a clear engagement summary string
 */
export function formatEngagementSummary(reportCount: number = 0, supportCount: number = 0): string {
  const total = getCombinedEngagement(reportCount, supportCount);
  return `${total} Backers (${reportCount} ${reportCount === 1 ? 'Report' : 'Reports'} · ${supportCount} ${supportCount === 1 ? 'Support' : 'Supports'})`;
}


