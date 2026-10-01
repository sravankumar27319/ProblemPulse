import { PriorityLevel } from '@prisma/client';

export interface PriorityFactors {
  severity: number;
  peopleAffected: number;
  reportCount: number;
  supportCount: number;
}

export interface PriorityBreakdown {
  severityScore: number;
  peopleScore: number;
  reportScore: number;
  supportScore: number;
  totalScore: number;
  isCapped: {
    people: boolean;
    reports: boolean;
    supports: boolean;
  };
}

export interface AutoPriorityResult {
  score: number;
  priority: PriorityLevel;
  breakdown: PriorityBreakdown;
}

export const PRIORITY_CONFIG = {
  WEIGHTS: {
    SEVERITY_MAX: 40,
    PEOPLE_MAX: 30,
    REPORTS_MAX: 15,
    SUPPORTS_MAX: 15,
  },
  CAPS: {
    PEOPLE_CEILING: 100,
    REPORTS_CEILING: 10,
    SUPPORTS_CEILING: 50,
  },
  THRESHOLDS: {
    CRITICAL: 65,
    MAJOR: 30,
  },
};

/**
 * Calculates normalized auto-priority score and maps to PriorityLevel enum
 *
 * Scoring breakdown (Max 100 points):
 * - Severity (1-10): up to 40 points
 * - People Affected (capped at 100): up to 30 points
 * - Report Count (capped at 10): up to 15 points
 * - Support Count (capped at 50): up to 15 points
 *
 * Each component is normalized and capped so a burst of new-account supports
 * cannot force CRITICAL on its own.
 */
export function calculateAutoPriority(factors: PriorityFactors): AutoPriorityResult {
  const { severity, peopleAffected, reportCount, supportCount } = factors;

  const validSeverity = Math.min(Math.max(severity || 5, 1), 10);
  const validPeople = Math.max(peopleAffected || 1, 1);
  const validReports = Math.max(reportCount || 1, 1);
  const validSupports = Math.max(supportCount || 0, 0);

  const severityScore = (validSeverity / 10) * PRIORITY_CONFIG.WEIGHTS.SEVERITY_MAX;
  const peopleScore =
    Math.min(validPeople / PRIORITY_CONFIG.CAPS.PEOPLE_CEILING, 1) *
    PRIORITY_CONFIG.WEIGHTS.PEOPLE_MAX;
  const reportScore =
    Math.min(validReports / PRIORITY_CONFIG.CAPS.REPORTS_CEILING, 1) *
    PRIORITY_CONFIG.WEIGHTS.REPORTS_MAX;
  const supportScore =
    Math.min(validSupports / PRIORITY_CONFIG.CAPS.SUPPORTS_CEILING, 1) *
    PRIORITY_CONFIG.WEIGHTS.SUPPORTS_MAX;

  const totalScore = Math.round(severityScore + peopleScore + reportScore + supportScore);

  let priority: PriorityLevel = 'LOW';
  if (totalScore >= PRIORITY_CONFIG.THRESHOLDS.CRITICAL) {
    priority = 'CRITICAL';
  } else if (totalScore >= PRIORITY_CONFIG.THRESHOLDS.MAJOR) {
    priority = 'MAJOR';
  }

  return {
    score: totalScore,
    priority,
    breakdown: {
      severityScore: Math.round(severityScore * 10) / 10,
      peopleScore: Math.round(peopleScore * 10) / 10,
      reportScore: Math.round(reportScore * 10) / 10,
      supportScore: Math.round(supportScore * 10) / 10,
      totalScore,
      isCapped: {
        people: validPeople >= PRIORITY_CONFIG.CAPS.PEOPLE_CEILING,
        reports: validReports >= PRIORITY_CONFIG.CAPS.REPORTS_CEILING,
        supports: validSupports >= PRIORITY_CONFIG.CAPS.SUPPORTS_CEILING,
      },
    },
  };
}

/**
 * Resolves the effective priority to display: adminPriority ?? autoPriority
 * The automatic score assists triage, but never overrides an admin's manual priority.
 */
export function resolveEffectivePriority(
  adminPriority?: PriorityLevel | null,
  autoPriority: PriorityLevel = 'LOW'
): PriorityLevel {
  return adminPriority ?? autoPriority;
}
