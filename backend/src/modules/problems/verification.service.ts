import { prisma } from '../../config/db';
import { ProblemStatus } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import { notifyProblemStakeholders } from '../notifications/notification.service';
import { validateTransition } from './lifecycle.service';

export interface VerificationStats {
  status: ProblemStatus;
  isResolved: boolean;
  isCommunityVerified: boolean;
  isClosed: boolean;
  isReopened: boolean;
  canVote: boolean;
  userVote: {
    isFixed: boolean;
    comment: string | null;
    createdAt: Date;
  } | null;
  totalEligible: number;
  yesVotes: number;
  noVotes: number;
  threshold: number;
  daysRemaining: number;
  autoCloseAt: Date | null;
  resolvedAt: Date | null;
  votes: Array<{
    id: string;
    isFixed: boolean;
    comment: string | null;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
  }>;
}

/**
 * Calculates the required verification vote threshold based on total eligible citizens.
 * Prevents single-click flipping when multiple citizens are involved:
 * - 1 eligible citizen -> threshold = 1
 * - 2-6 eligible citizens -> threshold = 2
 * - 7+ eligible citizens -> threshold = 3
 */
export const calculateVerificationThreshold = (totalEligible: number): number => {
  if (totalEligible <= 1) return 1;
  if (totalEligible <= 6) return 2;
  return 3;
};

/**
 * Determines whether a user is an eligible voter for a problem's community verification.
 * Restricted to problem reporters (creator + duplicate eyewitnesses) and backers/supporters.
 */
export const isUserEligibleToVerify = (
  userId: string,
  problem: {
    createdById: string;
    reports?: Array<{ userId: string }>;
    supports?: Array<{ userId: string }>;
  }
): boolean => {
  if (!userId) return false;
  if (problem.createdById === userId) return true;
  if (problem.reports?.some((r) => r.userId === userId)) return true;
  if (problem.supports?.some((s) => s.userId === userId)) return true;
  return false;
};

/**
 * Computes verification state transitions given vote counts and current problem status.
 */
export const evaluateVerificationTransition = (
  currentStatus: ProblemStatus,
  yesVotes: number,
  noVotes: number,
  threshold: number,
  totalEligible: number
): {
  nextStatus: ProblemStatus | null;
  timelineNote: string | null;
  notificationEvent: 'REOPENED' | 'COMMUNITY_VERIFIED' | 'CLOSED' | null;
} => {
  // Rejection threshold reached: problem remains unresolved -> REOPEN
  if (noVotes >= threshold && noVotes > yesVotes) {
    return {
      nextStatus: 'REOPENED',
      timelineNote: `Community verification rejected the resolution (${noVotes} dispute votes). Problem reopened for municipal action.`,
      notificationEvent: 'REOPENED',
    };
  }

  // Affirmative threshold reached
  if (yesVotes >= threshold && yesVotes > noVotes) {
    if (currentStatus === 'RESOLVED') {
      return {
        nextStatus: 'COMMUNITY_VERIFIED',
        timelineNote: `Community verification confirmed resolution (${yesVotes} approval votes reached required threshold of ${threshold}).`,
        notificationEvent: 'COMMUNITY_VERIFIED',
      };
    }

    // If already COMMUNITY_VERIFIED and reach strong consensus (or all eligible voted)
    if (currentStatus === 'COMMUNITY_VERIFIED' && yesVotes >= Math.min(threshold + 1, totalEligible)) {
      return {
        nextStatus: 'CLOSED',
        timelineNote: `Case officially closed following strong community confirmation (${yesVotes} votes).`,
        notificationEvent: 'CLOSED',
      };
    }
  }

  return {
    nextStatus: null,
    timelineNote: null,
    notificationEvent: null,
  };
};

/**
 * Checks if 7 days have passed since resolution with zero dispute votes to auto-close.
 */
export const shouldAutoClose = (
  resolvedAt: Date | null,
  noVotes: number,
  currentStatus: ProblemStatus
): boolean => {
  if (!resolvedAt) return false;
  if (currentStatus !== 'RESOLVED' && currentStatus !== 'COMMUNITY_VERIFIED') return false;
  if (noVotes > 0) return false;

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const elapsed = Date.now() - new Date(resolvedAt).getTime();
  return elapsed >= sevenDaysMs;
};

/**
 * Fetches community verification statistics for a problem, with automatic 7-day auto-close check.
 */
export const getProblemVerification = async (
  problemId: string,
  userId?: string
): Promise<VerificationStats> => {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: {
      resolution: true,
      reports: { select: { userId: true } },
      supports: { select: { userId: true } },
      communityVotes: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!problem) {
    const error: AppError = new Error('Problem not found');
    error.statusCode = 404;
    throw error;
  }

  // Count distinct eligible voters
  const eligibleUserIds = new Set<string>();
  if (problem.createdById) eligibleUserIds.add(problem.createdById);
  problem.reports.forEach((r) => eligibleUserIds.add(r.userId));
  problem.supports.forEach((s) => eligibleUserIds.add(s.userId));
  const totalEligible = eligibleUserIds.size;

  const threshold = calculateVerificationThreshold(totalEligible);

  const yesVotes = problem.communityVotes.filter((v) => v.isFixed).length;
  const noVotes = problem.communityVotes.filter((v) => !v.isFixed).length;

  const resolvedAt = problem.resolution?.resolvedAt || null;
  const autoCloseAt = resolvedAt
    ? new Date(new Date(resolvedAt).getTime() + 7 * 24 * 60 * 60 * 1000)
    : null;

  const daysRemaining = autoCloseAt
    ? Math.max(0, Math.ceil((autoCloseAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Check 7-day auto-close rule: auto-CLOSED after 7 days with no "still broken" votes
  let currentStatus = problem.status;
  if (shouldAutoClose(resolvedAt, noVotes, currentStatus)) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.problemTimeline.create({
          data: {
            problemId,
            fromStatus: currentStatus,
            toStatus: 'CLOSED',
            note: 'Automatically closed after 7-day community verification grace period with zero dispute votes.',
            actorId: problem.createdById,
          },
        });

        await tx.problem.update({
          where: { id: problemId },
          data: { status: 'CLOSED' },
        });

        if (problem.resolution) {
          await tx.resolution.update({
            where: { id: problem.resolution.id },
            data: { closedAt: new Date() },
          });
        }
      });

      currentStatus = 'CLOSED';

      // Notify stakeholders
      notifyProblemStakeholders(problemId, 'CLOSED', {
        note: 'Automatically closed after 7-day community verification period.',
      }).catch(() => {});
    } catch {
      // Continue without interrupting read
    }
  }

  const canVote = userId ? isUserEligibleToVerify(userId, problem) : false;
  const userVoteRecord = userId
    ? problem.communityVotes.find((v) => v.userId === userId) || null
    : null;

  return {
    status: currentStatus,
    isResolved: currentStatus === 'RESOLVED',
    isCommunityVerified: currentStatus === 'COMMUNITY_VERIFIED',
    isClosed: currentStatus === 'CLOSED',
    isReopened: currentStatus === 'REOPENED',
    canVote,
    userVote: userVoteRecord
      ? {
          isFixed: userVoteRecord.isFixed,
          comment: userVoteRecord.comment,
          createdAt: userVoteRecord.createdAt,
        }
      : null,
    totalEligible,
    yesVotes,
    noVotes,
    threshold,
    daysRemaining,
    autoCloseAt,
    resolvedAt,
    votes: problem.communityVotes.map((v) => ({
      id: v.id,
      isFixed: v.isFixed,
      comment: v.comment,
      createdAt: v.createdAt,
      user: v.user,
    })),
  };
};

/**
 * Casts or updates a community verification vote on a resolved problem.
 * Evaluates threshold and executes lifecycle transition if threshold is reached.
 */
export const castVerificationVote = async (
  problemId: string,
  userId: string,
  input: { isFixed: boolean; comment?: string }
): Promise<VerificationStats> => {
  const { isFixed, comment } = input;

  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: {
      resolution: true,
      reports: { select: { userId: true } },
      supports: { select: { userId: true } },
      communityVotes: true,
    },
  });

  if (!problem) {
    const error: AppError = new Error('Problem not found');
    error.statusCode = 404;
    throw error;
  }

  // Verification is only active when problem is RESOLVED or awaiting final closure in COMMUNITY_VERIFIED
  if (problem.status !== 'RESOLVED' && problem.status !== 'COMMUNITY_VERIFIED') {
    const error: AppError = new Error(
      `Community verification is not available for problems in status "${problem.status}". Problem must be marked RESOLVED.`
    );
    error.statusCode = 400;
    throw error;
  }

  // Voter eligibility check: Must be problem reporter, eyewitness, or backer
  const isEligible = isUserEligibleToVerify(userId, problem);
  if (!isEligible) {
    const error: AppError = new Error(
      'Only citizen reporters and supporters of this problem are eligible to participate in community verification.'
    );
    error.statusCode = 403;
    throw error;
  }

  // Upsert the citizen's vote
  await prisma.communityVote.upsert({
    where: {
      problemId_userId: {
        problemId,
        userId,
      },
    },
    update: {
      isFixed,
      comment: comment?.trim() || null,
    },
    create: {
      problemId,
      userId,
      isFixed,
      comment: comment?.trim() || null,
    },
  });

  // Calculate updated votes
  const allVotes = await prisma.communityVote.findMany({
    where: { problemId },
  });

  const eligibleUserIds = new Set<string>();
  if (problem.createdById) eligibleUserIds.add(problem.createdById);
  problem.reports.forEach((r) => eligibleUserIds.add(r.userId));
  problem.supports.forEach((s) => eligibleUserIds.add(s.userId));
  const totalEligible = eligibleUserIds.size;

  const threshold = calculateVerificationThreshold(totalEligible);
  const yesVotes = allVotes.filter((v) => v.isFixed).length;
  const noVotes = allVotes.filter((v) => !v.isFixed).length;

  // Evaluate state machine transitions
  const transition = evaluateVerificationTransition(
    problem.status,
    yesVotes,
    noVotes,
    threshold,
    totalEligible
  );

  if (transition.nextStatus && transition.nextStatus !== problem.status) {
    validateTransition(problem.status, transition.nextStatus);

    await prisma.$transaction(async (tx) => {
      // 1. Create timeline event
      await tx.problemTimeline.create({
        data: {
          problemId,
          fromStatus: problem.status,
          toStatus: transition.nextStatus!,
          note: transition.timelineNote,
          actorId: userId,
        },
      });

      // 2. Update problem status
      await tx.problem.update({
        where: { id: problemId },
        data: { status: transition.nextStatus! },
      });

      // 3. Update resolution timestamps if applicable
      if (problem.resolution) {
        if (transition.nextStatus === 'REOPENED') {
          await tx.resolution.update({
            where: { id: problem.resolution.id },
            data: { isReopened: true },
          });
        } else if (transition.nextStatus === 'COMMUNITY_VERIFIED') {
          await tx.resolution.update({
            where: { id: problem.resolution.id },
            data: { communityVerifiedAt: new Date() },
          });
        } else if (transition.nextStatus === 'CLOSED') {
          await tx.resolution.update({
            where: { id: problem.resolution.id },
            data: { closedAt: new Date() },
          });
        }
      }
    });

    // Notify stakeholders
    if (transition.notificationEvent) {
      notifyProblemStakeholders(problemId, transition.notificationEvent, {
        note: transition.timelineNote || undefined,
        actorId: userId,
      }).catch(() => {});
    }
  }

  // Return fresh verification stats
  return getProblemVerification(problemId, userId);
};
