import { ProblemStatus } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';

/**
 * Phase 4 & Phase 22 — Problem Lifecycle State Machine Transition Map
 * 
 * Strict transition graph derived from IMPLEMENTATION_PLAN.md:
 * SUBMITTED → UNDER_REVIEW → VERIFIED → ASSIGNED → IN_PROGRESS → RESOLVED → COMMUNITY_VERIFIED → CLOSED
 * 
 * Alternate transitions:
 * - UNDER_REVIEW → REJECTED | DUPLICATE
 * - VERIFIED → ASSIGNED | REJECTED
 * - RESOLVED → REOPENED
 * - CLOSED → REOPENED
 * 
 * Prevents illegal state jumps (e.g. SUBMITTED → CLOSED, VERIFIED → RESOLVED).
 */
export const VALID_STATUS_TRANSITIONS: Record<ProblemStatus, ProblemStatus[]> = {
  SUBMITTED: ['UNDER_REVIEW', 'VERIFIED', 'REJECTED'],
  UNDER_REVIEW: ['VERIFIED', 'REJECTED', 'DUPLICATE'],
  VERIFIED: ['ASSIGNED', 'REJECTED'],
  ASSIGNED: ['IN_PROGRESS', 'REOPENED', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'ASSIGNED', 'REOPENED'],
  RESOLVED: ['CLOSED', 'COMMUNITY_VERIFIED', 'REOPENED'],
  COMMUNITY_VERIFIED: ['CLOSED', 'REOPENED'],
  CLOSED: ['REOPENED'],
  REOPENED: ['UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS'],
  REJECTED: ['UNDER_REVIEW', 'REOPENED'],
  DUPLICATE: [],
};

/**
 * Returns array of legal next statuses from a given current status
 */
export const getAllowedTransitions = (fromStatus: ProblemStatus): ProblemStatus[] => {
  return VALID_STATUS_TRANSITIONS[fromStatus] || [];
};

/**
 * Checks whether a transition between two statuses is valid
 */
export const isValidTransition = (
  fromStatus: ProblemStatus,
  toStatus: ProblemStatus
): boolean => {
  if (fromStatus === toStatus) return false;
  const allowed = getAllowedTransitions(fromStatus);
  return allowed.includes(toStatus);
};

/**
 * Asserts that a transition between two statuses is valid. Throws 400 AppError on violation.
 */
export const validateTransition = (
  fromStatus: ProblemStatus,
  toStatus: ProblemStatus
): void => {
  if (fromStatus === toStatus) {
    const error: AppError = new Error(`Problem is already in status ${fromStatus}.`);
    error.statusCode = 400;
    throw error;
  }

  if (!isValidTransition(fromStatus, toStatus)) {
    const allowed = getAllowedTransitions(fromStatus);
    const allowedStr = allowed.length > 0 ? allowed.join(', ') : 'None (Terminal state)';
    const error: AppError = new Error(
      `Illegal status transition from ${fromStatus} to ${toStatus}. Allowed transitions: ${allowedStr}`
    );
    error.statusCode = 400;
    throw error;
  }
};
