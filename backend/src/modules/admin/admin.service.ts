import { prisma } from '../../config/db';
import { ProblemCategory, PriorityLevel, ProblemStatus, Prisma } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import { calculateAutoPriority, AutoPriorityResult } from '../problems/priority.service';
import { notifyProblemStakeholders, NotificationEventType } from '../notifications/notification.service';
import { findDuplicateProblems, NearbyProblemMatch } from '../problems/duplicate.service';
import {
  getAllowedTransitions,
  validateTransition,
  isValidTransition,
} from '../problems/lifecycle.service';

export interface AdminProblemReviewData {
  problem: any;
  candidateDuplicates: NearbyProblemMatch[];
  priorityBreakdown: AutoPriorityResult;
  departments: Array<{
    id: string;
    name: string;
    code: string;
    description: string | null;
  }>;
  allowedTransitions: ProblemStatus[];
}

export interface AssignProblemInput {
  departmentId: string;
  zone?: string;
  team?: string;
  note?: string;
}

export interface UpdateStatusInput {
  status: ProblemStatus;
  note?: string;
  departmentId?: string;
}

export interface ResolveProblemInput {
  description: string;
  proofMedia?: Array<{
    url: string;
    publicId?: string;
    mediaType?: string;
  }>;
}

export interface AdminProblemsQueryInput {
  page?: number;
  limit?: number;
  priority?: PriorityLevel | 'ALL';
  status?: ProblemStatus | 'ALL';
  category?: ProblemCategory | 'ALL';
  area?: string;
  date?: 'all' | 'today' | '7days' | '30days' | 'custom' | string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sort?: 'date_desc' | 'date_asc' | 'reports' | 'supports' | 'priority';
}

export interface AdminProblemItem {
  id: string;
  title: string;
  description: string;
  category: ProblemCategory;
  area: string;
  city: string;
  address: string;
  reportCount: number;
  supportCount: number;
  peopleAffected: number;
  autoPriority: PriorityLevel;
  adminPriority: PriorityLevel | null;
  priority: PriorityLevel;
  status: ProblemStatus;
  createdAt: Date;
  updatedAt: Date;
  department: {
    id: string;
    name: string;
    code: string;
  } | null;
  mediaUrl: string | null;
}

export interface AdminProblemsResult {
  problems: AdminProblemItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  areas: string[];
}

export interface AdminKpiStats {
  pendingReview: number;
  critical: number;
  inProgress: number;
  resolved: number;
}

export interface AdminCategoryCount {
  category: ProblemCategory;
  count: number;
  percentage: number;
}

export interface AdminWeeklyMetrics {
  newReports: number;
  verified: number;
  reopened: number;
  avgResolutionTime: string;
}

export interface AdminQueueItem {
  id: string;
  title: string;
  category: ProblemCategory;
  area: string;
  city: string;
  reportCount: number;
  supportCount: number;
  priority: PriorityLevel;
  status: ProblemStatus;
  createdAt: Date;
}

export interface AdminDashboardData {
  kpis: AdminKpiStats;
  queue: AdminQueueItem[];
  awaitingReview: AdminQueueItem[];
  byCategory: AdminCategoryCount[];
  thisWeek: AdminWeeklyMetrics;
}

export const getDashboardStats = async (): Promise<AdminDashboardData> => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // 1. KPI Counts
  const [
    pendingReviewCount,
    criticalCount,
    inProgressCount,
    resolvedCount,
    totalProblemsCount,
  ] = await Promise.all([
    // Pending Review: SUBMITTED or UNDER_REVIEW
    prisma.problem.count({
      where: {
        status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
      },
    }),

    // Critical: effective priority is CRITICAL and not resolved/closed/rejected
    prisma.problem.count({
      where: {
        OR: [
          { adminPriority: 'CRITICAL' },
          { adminPriority: null, autoPriority: 'CRITICAL' },
        ],
        status: { notIn: ['RESOLVED', 'COMMUNITY_VERIFIED', 'CLOSED', 'REJECTED'] },
      },
    }),

    // In Progress: IN_PROGRESS or ASSIGNED
    prisma.problem.count({
      where: {
        status: { in: ['IN_PROGRESS', 'ASSIGNED'] },
      },
    }),

    // Resolved: RESOLVED, COMMUNITY_VERIFIED, or CLOSED
    prisma.problem.count({
      where: {
        status: { in: ['RESOLVED', 'COMMUNITY_VERIFIED', 'CLOSED'] },
      },
    }),

    // Total problems
    prisma.problem.count(),
  ]);

  // 2. Problem Queue Table (recent active issues requiring municipal handling)
  const queueProblems = await prisma.problem.findMany({
    where: {
      status: { notIn: ['CLOSED', 'REJECTED'] },
    },
    select: {
      id: true,
      title: true,
      category: true,
      area: true,
      city: true,
      reportCount: true,
      supportCount: true,
      adminPriority: true,
      autoPriority: true,
      status: true,
      createdAt: true,
    },
    orderBy: [
      { createdAt: 'desc' },
    ],
    take: 15,
  });

  const queue: AdminQueueItem[] = queueProblems.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    area: p.area,
    city: p.city,
    reportCount: p.reportCount,
    supportCount: p.supportCount,
    priority: p.adminPriority ?? p.autoPriority,
    status: p.status,
    createdAt: p.createdAt,
  }));

  // 3. Side Panel: Awaiting your review (Top items in SUBMITTED or UNDER_REVIEW)
  const awaitingReviewProblems = await prisma.problem.findMany({
    where: {
      status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
    },
    select: {
      id: true,
      title: true,
      category: true,
      area: true,
      city: true,
      reportCount: true,
      supportCount: true,
      adminPriority: true,
      autoPriority: true,
      status: true,
      createdAt: true,
    },
    orderBy: [
      { createdAt: 'asc' },
    ],
    take: 5,
  });

  const awaitingReview: AdminQueueItem[] = awaitingReviewProblems.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    area: p.area,
    city: p.city,
    reportCount: p.reportCount,
    supportCount: p.supportCount,
    priority: p.adminPriority ?? p.autoPriority,
    status: p.status,
    createdAt: p.createdAt,
  }));

  // 4. Side Panel: By Category breakdown
  const categoryGroups = await prisma.problem.groupBy({
    by: ['category'],
    _count: {
      id: true,
    },
  });

  const allCategories: ProblemCategory[] = [
    'ROAD',
    'WATER',
    'GARBAGE',
    'ELECTRICITY',
    'TRAFFIC',
    'OTHER',
  ];

  const categoryMap = new Map<ProblemCategory, number>();
  categoryGroups.forEach((g) => {
    categoryMap.set(g.category, g._count.id);
  });

  const byCategory: AdminCategoryCount[] = allCategories.map((category) => {
    const count = categoryMap.get(category) || 0;
    const percentage =
      totalProblemsCount > 0 ? Math.round((count / totalProblemsCount) * 100) : 0;
    return {
      category,
      count,
      percentage,
    };
  });

  // 5. Side Panel: This Week metrics
  const [newReportsThisWeek, verifiedThisWeek, reopenedThisWeek, recentResolutions] =
    await Promise.all([
      // New reports created in last 7 days
      prisma.problem.count({
        where: {
          createdAt: { gte: oneWeekAgo },
        },
      }),

      // Reports verified in last 7 days (via timeline event or status)
      prisma.problemTimeline.count({
        where: {
          toStatus: 'VERIFIED',
          createdAt: { gte: oneWeekAgo },
        },
      }),

      // Reports reopened in last 7 days
      prisma.problem.count({
        where: {
          status: 'REOPENED',
          updatedAt: { gte: oneWeekAgo },
        },
      }),

      // Sample resolutions to compute average turnaround
      prisma.resolution.findMany({
        take: 20,
        orderBy: { resolvedAt: 'desc' },
        include: {
          problem: {
            select: { createdAt: true },
          },
        },
      }),
    ]);

  let avgResolutionTime = '36 hrs';
  if (recentResolutions.length > 0) {
    let totalDurationMs = 0;
    let validCount = 0;
    recentResolutions.forEach((res) => {
      if (res.problem?.createdAt && res.resolvedAt) {
        const diff = res.resolvedAt.getTime() - res.problem.createdAt.getTime();
        if (diff > 0) {
          totalDurationMs += diff;
          validCount++;
        }
      }
    });

    if (validCount > 0) {
      const avgHours = Math.round(totalDurationMs / validCount / (1000 * 60 * 60));
      if (avgHours < 24) {
        avgResolutionTime = `${Math.max(1, avgHours)} hrs`;
      } else {
        const days = (avgHours / 24).toFixed(1);
        avgResolutionTime = `${days} days`;
      }
    }
  }

  return {
    kpis: {
      pendingReview: pendingReviewCount,
      critical: criticalCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
    },
    queue,
    awaitingReview,
    byCategory,
    thisWeek: {
      newReports: newReportsThisWeek,
      verified: verifiedThisWeek,
      reopened: reopenedThisWeek,
      avgResolutionTime,
    },
  };
};

export const getAdminProblems = async (
  query: AdminProblemsQueryInput
): Promise<AdminProblemsResult> => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 15));
  const skip = (page - 1) * limit;

  const where: Prisma.ProblemWhereInput = {};

  // 1. Priority Filter (checks admin override first, falls back to autoPriority)
  if (query.priority && query.priority !== 'ALL') {
    where.OR = [
      { adminPriority: query.priority as PriorityLevel },
      { adminPriority: null, autoPriority: query.priority as PriorityLevel },
    ];
  }

  // 2. Status Filter
  if (query.status && query.status !== 'ALL') {
    where.status = query.status as ProblemStatus;
  }

  // 3. Category Filter
  if (query.category && query.category !== 'ALL') {
    where.category = query.category as ProblemCategory;
  }

  // 4. Area Filter
  if (query.area && query.area !== 'ALL' && query.area.trim()) {
    where.area = {
      contains: query.area.trim(),
      mode: 'insensitive',
    };
  }

  // 5. Date Filter
  const now = new Date();
  if (query.date === 'today') {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    where.createdAt = { gte: startOfToday };
  } else if (query.date === '7days') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    where.createdAt = { gte: sevenDaysAgo };
  } else if (query.date === '30days') {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    where.createdAt = { gte: thirtyDaysAgo };
  } else if (query.startDate || query.endDate) {
    const dateRange: Prisma.DateTimeFilter = {};
    if (query.startDate) {
      dateRange.gte = new Date(query.startDate);
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      dateRange.lte = end;
    }
    where.createdAt = dateRange;
  }

  // 6. Search Filter
  if (query.search && query.search.trim()) {
    const searchTerm = query.search.trim();
    const searchFilter: Prisma.ProblemWhereInput = {
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { address: { contains: searchTerm, mode: 'insensitive' } },
        { area: { contains: searchTerm, mode: 'insensitive' } },
        { city: { contains: searchTerm, mode: 'insensitive' } },
      ],
    };

    if (where.AND) {
      if (Array.isArray(where.AND)) {
        where.AND.push(searchFilter);
      } else {
        where.AND = [where.AND, searchFilter];
      }
    } else {
      where.AND = [searchFilter];
    }
  }

  // 7. Sort Order
  let orderBy: Prisma.ProblemOrderByWithRelationInput[] = [{ createdAt: 'desc' }];
  if (query.sort === 'date_asc') {
    orderBy = [{ createdAt: 'asc' }];
  } else if (query.sort === 'reports') {
    orderBy = [{ reportCount: 'desc' }, { createdAt: 'desc' }];
  } else if (query.sort === 'supports') {
    orderBy = [{ supportCount: 'desc' }, { createdAt: 'desc' }];
  } else if (query.sort === 'priority') {
    // CRITICAL is sorted first in typical municipal workflows
    orderBy = [{ autoPriority: 'asc' }, { createdAt: 'desc' }];
  }

  // 8. Execute queries
  const [total, problems, distinctAreas] = await Promise.all([
    prisma.problem.count({ where }),
    prisma.problem.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        media: {
          select: {
            id: true,
            url: true,
            mediaType: true,
          },
          take: 1,
        },
      },
    }),
    prisma.problem.findMany({
      select: { area: true },
      distinct: ['area'],
      where: {
        area: {
          not: '',
        },
      },
      orderBy: { area: 'asc' },
    }),
  ]);

  const mappedProblems: AdminProblemItem[] = problems.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    area: p.area,
    city: p.city,
    address: p.address,
    reportCount: p.reportCount,
    supportCount: p.supportCount,
    peopleAffected: p.peopleAffected,
    autoPriority: p.autoPriority,
    adminPriority: p.adminPriority,
    priority: p.adminPriority ?? p.autoPriority,
    status: p.status,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    department: p.department,
    mediaUrl: p.media.length > 0 ? p.media[0].url : null,
  }));

  const areas = distinctAreas
    .map((a) => a.area?.trim())
    .filter((area): area is string => Boolean(area && area.length > 0))
    .filter((area, index, self) => self.indexOf(area) === index);

  return {
    problems: mappedProblems,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    areas,
  };
};

export const getAdminProblemDetail = async (
  id: string
): Promise<AdminProblemReviewData> => {
  const problem = await prisma.problem.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
        },
      },
      media: {
        select: {
          id: true,
          url: true,
          mediaType: true,
          createdAt: true,
        },
      },
      timeline: {
        orderBy: { createdAt: 'asc' },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      },
      comments: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
      reports: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      supports: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      resolution: {
        include: {
          proofMedia: {
            select: {
              id: true,
              url: true,
              mediaType: true,
              publicId: true,
            },
          },
        },
      },
    },
  });

  if (!problem) {
    const error: AppError = new Error('Problem not found');
    error.statusCode = 404;
    throw error;
  }

  // Run candidate duplicates search and department query in parallel
  const [candidateDuplicates, departments] = await Promise.all([
    findDuplicateProblems({
      category: problem.category,
      latitude: problem.latitude,
      longitude: problem.longitude,
      radiusMeters: 300,
      excludeProblemId: problem.id,
    }),
    getDepartments(),
  ]);

  // Calculate priority breakdown
  const priorityBreakdown = calculateAutoPriority({
    severity: problem.severity,
    peopleAffected: problem.peopleAffected,
    reportCount: problem.reportCount,
    supportCount: problem.supportCount,
  });

  return {
    problem,
    candidateDuplicates,
    priorityBreakdown,
    departments,
    allowedTransitions: getAllowedTransitions(problem.status),
  };
};

export const verifyProblem = async (
  id: string,
  actorId: string,
  options?: { note?: string; adminPriority?: PriorityLevel }
) => {
  const problem = await prisma.problem.findUnique({
    where: { id },
  });

  if (!problem) {
    const error: AppError = new Error('Problem not found');
    error.statusCode = 404;
    throw error;
  }

  if (problem.status !== 'VERIFIED') {
    validateTransition(problem.status, 'VERIFIED');
  }

  const updatedProblem = await prisma.$transaction(async (tx) => {
    // 1. Create ProblemTimeline event
    await tx.problemTimeline.create({
      data: {
        problemId: id,
        fromStatus: problem.status,
        toStatus: 'VERIFIED',
        note: options?.note || 'Problem verified by municipal triage officer',
        actorId,
      },
    });

    // 2. Update problem
    return tx.problem.update({
      where: { id },
      data: {
        status: 'VERIFIED',
        ...(options?.adminPriority ? { adminPriority: options.adminPriority } : {}),
      },
      include: {
        timeline: {
          orderBy: { createdAt: 'asc' },
          include: {
            actor: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });
  });

  // Notify stakeholders asynchronously
  try {
    await notifyProblemStakeholders(id, 'VERIFIED', {
      note: options?.note,
      actorId,
    });
  } catch {
    // Silently continue if notification fails
  }

  return updatedProblem;
};

export const rejectProblem = async (
  id: string,
  actorId: string,
  reason: string
) => {
  if (!reason || !reason.trim()) {
    const error: AppError = new Error('Rejection reason is required');
    error.statusCode = 400;
    throw error;
  }

  const problem = await prisma.problem.findUnique({
    where: { id },
  });

  if (!problem) {
    const error: AppError = new Error('Problem not found');
    error.statusCode = 404;
    throw error;
  }

  if (problem.status !== 'REJECTED') {
    validateTransition(problem.status, 'REJECTED');
  }

  const cleanReason = reason.trim();

  const updatedProblem = await prisma.$transaction(async (tx) => {
    // 1. Create ProblemTimeline event
    await tx.problemTimeline.create({
      data: {
        problemId: id,
        fromStatus: problem.status,
        toStatus: 'REJECTED',
        note: `Rejected: ${cleanReason}`,
        actorId,
      },
    });

    // 2. Update problem status
    return tx.problem.update({
      where: { id },
      data: {
        status: 'REJECTED',
      },
      include: {
        timeline: {
          orderBy: { createdAt: 'asc' },
          include: {
            actor: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });
  });

  // Notify stakeholders asynchronously
  try {
    await notifyProblemStakeholders(id, 'REJECTED', {
      note: cleanReason,
      actorId,
    });
  } catch {
    // Silently continue
  }

  return updatedProblem;
};

export const markProblemDuplicate = async (
  id: string,
  actorId: string,
  canonicalProblemId: string,
  note?: string
) => {
  if (!canonicalProblemId || canonicalProblemId.trim() === '') {
    const error: AppError = new Error('Canonical problem ID is required to mark as duplicate');
    error.statusCode = 400;
    throw error;
  }

  if (canonicalProblemId === id) {
    const error: AppError = new Error('A problem cannot be marked as a duplicate of itself');
    error.statusCode = 400;
    throw error;
  }

  const [currentProblem, canonicalProblem] = await Promise.all([
    prisma.problem.findUnique({ where: { id } }),
    prisma.problem.findUnique({ where: { id: canonicalProblemId } }),
  ]);

  if (!currentProblem) {
    const error: AppError = new Error('Problem to mark duplicate not found');
    error.statusCode = 404;
    throw error;
  }

  if (!canonicalProblem) {
    const error: AppError = new Error(`Canonical problem #${canonicalProblemId} not found`);
    error.statusCode = 404;
    throw error;
  }

  const cleanNote = note?.trim() || '';

  const { updatedCurrent, updatedCanonical } = await prisma.$transaction(async (tx) => {
    // 1. Timeline on duplicate problem
    await tx.problemTimeline.create({
      data: {
        problemId: id,
        fromStatus: currentProblem.status,
        toStatus: 'DUPLICATE',
        note: `Marked duplicate of #${canonicalProblemId}. ${cleanNote}`.trim(),
        actorId,
      },
    });

    // 2. Update duplicate problem status
    const updatedCurrent = await tx.problem.update({
      where: { id },
      data: {
        status: 'DUPLICATE',
      },
    });

    // 3. Increment report count on canonical problem
    const newReportCount = canonicalProblem.reportCount + 1;

    // Recalculate auto priority for canonical problem
    const newPriorityResult = calculateAutoPriority({
      severity: canonicalProblem.severity,
      peopleAffected: canonicalProblem.peopleAffected,
      reportCount: newReportCount,
      supportCount: canonicalProblem.supportCount,
    });

    // 4. Timeline on canonical problem
    await tx.problemTimeline.create({
      data: {
        problemId: canonicalProblemId,
        fromStatus: canonicalProblem.status,
        toStatus: canonicalProblem.status,
        note: `Eyewitness report from #${id} merged as duplicate. Report count incremented to ${newReportCount}.`,
        actorId,
      },
    });

    // 5. Update canonical problem
    const updatedCanonical = await tx.problem.update({
      where: { id: canonicalProblemId },
      data: {
        reportCount: newReportCount,
        autoPriority: newPriorityResult.priority,
      },
    });

    return { updatedCurrent, updatedCanonical };
  });

  return {
    problem: updatedCurrent,
    canonicalProblem: updatedCanonical,
  };
};

export const getDepartments = async () => {
  return prisma.department.findMany({
    orderBy: { name: 'asc' },
  });
};

export const assignProblem = async (
  id: string,
  actorId: string,
  input: AssignProblemInput
) => {
  const { departmentId, zone, team, note } = input;

  if (!departmentId || !departmentId.trim()) {
    const error: AppError = new Error('Department ID is required for assignment');
    error.statusCode = 400;
    throw error;
  }

  const [problem, department] = await Promise.all([
    prisma.problem.findUnique({
      where: { id },
      include: { department: true },
    }),
    prisma.department.findUnique({
      where: { id: departmentId.trim() },
    }),
  ]);

  if (!problem) {
    const error: AppError = new Error('Problem not found');
    error.statusCode = 404;
    throw error;
  }

  if (!department) {
    const error: AppError = new Error('Department not found');
    error.statusCode = 404;
    throw error;
  }

  if (problem.status !== 'ASSIGNED') {
    validateTransition(problem.status, 'ASSIGNED');
  }

  // Format descriptive timeline note
  const teamZoneParts: string[] = [];
  if (zone?.trim()) teamZoneParts.push(`Zone: ${zone.trim()}`);
  if (team?.trim()) teamZoneParts.push(`Team: ${team.trim()}`);
  const teamZoneStr = teamZoneParts.length > 0 ? ` (${teamZoneParts.join(', ')})` : '';

  const customNoteStr = note?.trim() ? ` Note: ${note.trim()}` : '';
  const timelineNote = `Assigned to ${department.name}${teamZoneStr}.${customNoteStr}`.trim();

  const updatedProblem = await prisma.$transaction(async (tx) => {
    // 1. Create ProblemTimeline entry
    await tx.problemTimeline.create({
      data: {
        problemId: id,
        fromStatus: problem.status,
        toStatus: 'ASSIGNED',
        note: timelineNote,
        actorId,
      },
    });

    // 2. Update problem status and department
    return tx.problem.update({
      where: { id },
      data: {
        departmentId: department.id,
        status: 'ASSIGNED',
      },
      include: {
        department: true,
        timeline: {
          orderBy: { createdAt: 'asc' },
          include: {
            actor: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });
  });

  // Notify stakeholders asynchronously
  try {
    await notifyProblemStakeholders(id, 'ASSIGNED', {
      departmentName: department.name,
      note: timelineNote,
      actorId,
    });
  } catch {
    // Silently continue
  }

  return updatedProblem;
};

/**
 * Phase 22: Status Management
 * Admin-controlled transitions: VERIFIED → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED (plus REOPENED).
 * Every change writes a ProblemTimeline event, validated by the transition map.
 */
export const updateProblemStatus = async (
  id: string,
  actorId: string,
  input: UpdateStatusInput
) => {
  const { status: toStatus, note, departmentId } = input;

  if (!toStatus) {
    const error: AppError = new Error('Target status is required');
    error.statusCode = 400;
    throw error;
  }

  const problem = await prisma.problem.findUnique({
    where: { id },
    include: { department: true },
  });

  if (!problem) {
    const error: AppError = new Error('Problem not found');
    error.statusCode = 404;
    throw error;
  }

  // 1. Validate transition using single transition-map service
  validateTransition(problem.status, toStatus);

  // If transitioning to ASSIGNED, verify department is assigned
  let assignedDepartmentId = problem.departmentId;
  let departmentName = problem.department?.name;

  if (toStatus === 'ASSIGNED') {
    if (departmentId?.trim()) {
      const dept = await prisma.department.findUnique({
        where: { id: departmentId.trim() },
      });
      if (!dept) {
        const error: AppError = new Error('Specified department not found');
        error.statusCode = 404;
        throw error;
      }
      assignedDepartmentId = dept.id;
      departmentName = dept.name;
    } else if (!assignedDepartmentId) {
      const error: AppError = new Error(
        'Cannot transition to ASSIGNED without an assigned department. Please assign a department.'
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // Standard lifecycle notes if none provided
  const defaultNotes: Record<ProblemStatus, string> = {
    SUBMITTED: 'Report submitted.',
    UNDER_REVIEW: 'Status moved to Under Review.',
    VERIFIED: 'Report verified by municipal officer.',
    ASSIGNED: `Assigned to ${departmentName || 'municipal department'}.`,
    IN_PROGRESS: 'Field crew deployed. Repair work in progress.',
    RESOLVED: 'Municipal work completed and marked resolved.',
    COMMUNITY_VERIFIED: 'Citizen community verified resolution.',
    CLOSED: 'Municipal problem case closed.',
    REJECTED: 'Problem report rejected.',
    DUPLICATE: 'Marked as duplicate problem.',
    REOPENED: 'Problem reopened for further municipal review and action.',
  };

  const timelineNote = note?.trim() || defaultNotes[toStatus] || `Status updated to ${toStatus}`;

  // 2. Perform DB transaction writing ProblemTimeline and updating Problem in one transaction
  const updatedProblem = await prisma.$transaction(async (tx) => {
    await tx.problemTimeline.create({
      data: {
        problemId: id,
        fromStatus: problem.status,
        toStatus,
        note: timelineNote,
        actorId,
      },
    });

    return tx.problem.update({
      where: { id },
      data: {
        status: toStatus,
        ...(assignedDepartmentId ? { departmentId: assignedDepartmentId } : {}),
      },
      include: {
        department: true,
        timeline: {
          orderBy: { createdAt: 'asc' },
          include: {
            actor: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });
  });

  // 3. Notify stakeholders
  try {
    const notifyEventMap: Partial<Record<ProblemStatus, NotificationEventType>> = {
      VERIFIED: 'VERIFIED',
      REJECTED: 'REJECTED',
      ASSIGNED: 'ASSIGNED',
      IN_PROGRESS: 'IN_PROGRESS',
      RESOLVED: 'RESOLVED',
      REOPENED: 'REOPENED',
      CLOSED: 'CLOSED',
    };

    const event = notifyEventMap[toStatus];
    if (event) {
      await notifyProblemStakeholders(id, event, {
        note: timelineNote,
        departmentName,
        actorId,
      });
    }
  } catch {
    // Silently continue if notification fails
  }

  return updatedProblem;
};

/**
 * Phase 23 — Resolution System
 * IN_PROGRESS → admin uploads proof → RESOLVED
 * Admin uploads after-photo/video + description, transitions to RESOLVED,
 * creates Resolution record, writes ProblemTimeline, and notifies stakeholders.
 */
export const resolveProblem = async (
  id: string,
  actorId: string,
  input: ResolveProblemInput
) => {
  const { description, proofMedia } = input;

  if (!description || !description.trim()) {
    const error: AppError = new Error('Resolution description is required');
    error.statusCode = 400;
    throw error;
  }

  const cleanDescription = description.trim();
  if (cleanDescription.length < 5) {
    const error: AppError = new Error('Resolution description must be at least 5 characters');
    error.statusCode = 400;
    throw error;
  }

  const problem = await prisma.problem.findUnique({
    where: { id },
    include: {
      resolution: true,
      department: true,
    },
  });

  if (!problem) {
    const error: AppError = new Error('Problem not found');
    error.statusCode = 404;
    throw error;
  }

  // Validate state machine transition: must be allowed to transition to RESOLVED (e.g. from IN_PROGRESS)
  if (problem.status !== 'RESOLVED') {
    validateTransition(problem.status, 'RESOLVED');
  }

  const timelineNote = `Marked resolved: ${cleanDescription}`.trim();

  const updatedProblem = await prisma.$transaction(async (tx) => {
    // 1. Create or update Resolution record
    if (problem.resolution) {
      await tx.resolution.update({
        where: { id: problem.resolution.id },
        data: {
          description: cleanDescription,
          resolvedAt: new Date(),
          isReopened: false,
        },
      });

      // If new proofMedia provided, create media records linked to this resolution
      if (proofMedia && proofMedia.length > 0) {
        await tx.media.createMany({
          data: proofMedia.map((m) => ({
            url: m.url,
            publicId: m.publicId || null,
            mediaType: m.mediaType || 'image',
            resolutionId: problem.resolution!.id,
          })),
        });
      }
    } else {
      await tx.resolution.create({
        data: {
          problemId: id,
          description: cleanDescription,
          resolvedAt: new Date(),
          isReopened: false,
          ...(proofMedia && proofMedia.length > 0
            ? {
                proofMedia: {
                  createMany: {
                    data: proofMedia.map((m) => ({
                      url: m.url,
                      publicId: m.publicId || null,
                      mediaType: m.mediaType || 'image',
                    })),
                  },
                },
              }
            : {}),
        },
      });
    }

    // 2. Create ProblemTimeline entry
    await tx.problemTimeline.create({
      data: {
        problemId: id,
        fromStatus: problem.status,
        toStatus: 'RESOLVED',
        note: timelineNote,
        actorId,
      },
    });

    // 3. Update problem status
    return tx.problem.update({
      where: { id },
      data: {
        status: 'RESOLVED',
      },
      include: {
        department: true,
        resolution: {
          include: {
            proofMedia: true,
          },
        },
        timeline: {
          orderBy: { createdAt: 'asc' },
          include: {
            actor: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });
  });

  // 4. Notify stakeholders asynchronously
  try {
    await notifyProblemStakeholders(id, 'RESOLVED', {
      note: cleanDescription,
      departmentName: problem.department?.name,
      actorId,
    });
  } catch {
    // Silently continue if notification fails
  }

  return updatedProblem;
};

export interface AdminAnalyticsQueryInput {
  range?: '7days' | '30days' | '90days' | 'year' | 'all';
}

export interface AnalyticsCategoryItem {
  category: ProblemCategory;
  count: number;
  percentage: number;
  resolvedCount: number;
}

export interface AnalyticsAreaItem {
  area: string;
  count: number;
  percentage: number;
  resolvedCount: number;
}

export interface AnalyticsPriorityItem {
  priority: PriorityLevel;
  count: number;
  percentage: number;
}

export interface AnalyticsStatusItem {
  status: ProblemStatus;
  count: number;
  percentage: number;
}

export interface AnalyticsResolutionRatio {
  resolved: number;
  unresolved: number;
  total: number;
  ratePercentage: number;
  resolutionRate?: number;
}

export interface AnalyticsMonthlyTrend {
  monthKey: string;
  monthLabel: string;
  newReports: number;
  resolvedCount: number;
  month?: string;
  label?: string;
  reports?: number;
  resolved?: number;
}

export interface AdminAnalyticsData {
  timeRange?: string;
  summary: {
    totalProblems: number;
    activeBacklog: number;
    resolvedTotal: number;
    resolvedCount?: number;
    resolutionRate: number;
    avgResolutionTime: string;
    avgResolutionHours: number;
    avgResolutionTimeHours?: number;
    avgResolutionTimeDays?: number;
    topCategory: string;
    topArea: string;
  };
  byCategory: AnalyticsCategoryItem[];
  byArea: AnalyticsAreaItem[];
  byPriority: AnalyticsPriorityItem[];
  byStatus: AnalyticsStatusItem[];
  resolutionRatio: AnalyticsResolutionRatio;
  monthlyTrends: AnalyticsMonthlyTrend[];
  monthlyTrend?: AnalyticsMonthlyTrend[];
}

/**
 * Phase 24 / 25 — Admin Analytics
 * Computes problems by Category, Area, Priority, Status, average resolution turnaround,
 * reports per month trends, and resolved vs unresolved ratios.
 */
export const getAdminAnalytics = async (
  query: AdminAnalyticsQueryInput = {}
): Promise<AdminAnalyticsData> => {
  const { range = 'all' } = query;
  const now = new Date();
  let startDate: Date | undefined;

  if (range === '7days') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (range === '30days') {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (range === '90days') {
    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  } else if (range === 'year') {
    startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  }

  const where: Prisma.ProblemWhereInput = startDate ? { createdAt: { gte: startDate } } : {};

  const problems = await prisma.problem.findMany({
    where,
    select: {
      id: true,
      category: true,
      area: true,
      status: true,
      adminPriority: true,
      autoPriority: true,
      createdAt: true,
      resolution: {
        select: {
          resolvedAt: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const totalProblems = problems.length;
  const RESOLVED_STATUSES: ProblemStatus[] = ['RESOLVED', 'COMMUNITY_VERIFIED', 'CLOSED'];

  let resolvedTotal = 0;
  let totalResolutionDurationMs = 0;
  let resolutionSampleCount = 0;

  // 1. By Category Aggregation
  const categoryCounts: Record<ProblemCategory, { total: number; resolved: number }> = {
    ROAD: { total: 0, resolved: 0 },
    WATER: { total: 0, resolved: 0 },
    GARBAGE: { total: 0, resolved: 0 },
    ELECTRICITY: { total: 0, resolved: 0 },
    TRAFFIC: { total: 0, resolved: 0 },
    OTHER: { total: 0, resolved: 0 },
  };

  // 2. By Area Aggregation
  const areaCounts: Record<string, { total: number; resolved: number }> = {};

  // 3. By Priority Aggregation
  const priorityCounts: Record<PriorityLevel, number> = {
    CRITICAL: 0,
    MAJOR: 0,
    LOW: 0,
  };

  // 4. By Status Aggregation
  const allStatuses: ProblemStatus[] = [
    'SUBMITTED',
    'UNDER_REVIEW',
    'VERIFIED',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'COMMUNITY_VERIFIED',
    'CLOSED',
    'REJECTED',
    'DUPLICATE',
    'REOPENED',
  ];
  const statusCounts: Record<ProblemStatus, number> = allStatuses.reduce(
    (acc, st) => ({ ...acc, [st]: 0 }),
    {} as Record<ProblemStatus, number>
  );

  // 5. Monthly Trends Map (last 6 months initialized)
  const monthlyTrendsMap: Record<string, { monthLabel: string; newReports: number; resolvedCount: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    monthlyTrendsMap[key] = { monthLabel: label, newReports: 0, resolvedCount: 0 };
  }

  // Single pass calculation
  problems.forEach((p) => {
    const isResolved = RESOLVED_STATUSES.includes(p.status);
    if (isResolved) resolvedTotal++;

    // Category
    if (categoryCounts[p.category]) {
      categoryCounts[p.category].total++;
      if (isResolved) categoryCounts[p.category].resolved++;
    }

    // Area
    const cleanArea = p.area?.trim() || 'Central District';
    if (!areaCounts[cleanArea]) {
      areaCounts[cleanArea] = { total: 0, resolved: 0 };
    }
    areaCounts[cleanArea].total++;
    if (isResolved) areaCounts[cleanArea].resolved++;

    // Effective Priority
    const effectivePriority = p.adminPriority ?? p.autoPriority;
    priorityCounts[effectivePriority] = (priorityCounts[effectivePriority] || 0) + 1;

    // Status
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;

    // Average resolution duration
    if (p.resolution?.resolvedAt && p.createdAt) {
      const diff = p.resolution.resolvedAt.getTime() - p.createdAt.getTime();
      if (diff > 0) {
        totalResolutionDurationMs += diff;
        resolutionSampleCount++;
      }
    }

    // Monthly trends
    const monthKey = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyTrendsMap[monthKey]) {
      const label = p.createdAt.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      monthlyTrendsMap[monthKey] = { monthLabel: label, newReports: 0, resolvedCount: 0 };
    }
    monthlyTrendsMap[monthKey].newReports++;
    if (isResolved) {
      monthlyTrendsMap[monthKey].resolvedCount++;
    }
  });

  // Calculate Average Resolution Time
  let avgResolutionTime = '36 hrs';
  let avgResolutionHours = 36;
  if (resolutionSampleCount > 0) {
    avgResolutionHours = Math.round(totalResolutionDurationMs / resolutionSampleCount / (1000 * 60 * 60));
    if (avgResolutionHours < 24) {
      avgResolutionTime = `${Math.max(1, avgResolutionHours)} hrs`;
    } else {
      const days = (avgResolutionHours / 24).toFixed(1);
      avgResolutionTime = `${days} days`;
    }
  }

  // Format Category Items
  const byCategory: AnalyticsCategoryItem[] = (
    Object.keys(categoryCounts) as ProblemCategory[]
  ).map((cat) => ({
    category: cat,
    count: categoryCounts[cat].total,
    percentage: totalProblems > 0 ? Math.round((categoryCounts[cat].total / totalProblems) * 100) : 0,
    resolvedCount: categoryCounts[cat].resolved,
  })).sort((a, b) => b.count - a.count);

  // Format Area Items
  const byArea: AnalyticsAreaItem[] = Object.keys(areaCounts)
    .map((area) => ({
      area,
      count: areaCounts[area].total,
      percentage: totalProblems > 0 ? Math.round((areaCounts[area].total / totalProblems) * 100) : 0,
      resolvedCount: areaCounts[area].resolved,
    }))
    .sort((a, b) => b.count - a.count);

  // Format Priority Items
  const byPriority: AnalyticsPriorityItem[] = (
    ['CRITICAL', 'MAJOR', 'LOW'] as PriorityLevel[]
  ).map((pri) => ({
    priority: pri,
    count: priorityCounts[pri],
    percentage: totalProblems > 0 ? Math.round((priorityCounts[pri] / totalProblems) * 100) : 0,
  }));

  // Format Status Items
  const byStatus: AnalyticsStatusItem[] = allStatuses.map((st) => ({
    status: st,
    count: statusCounts[st],
    percentage: totalProblems > 0 ? Math.round((statusCounts[st] / totalProblems) * 100) : 0,
  }));

  const activeBacklog = totalProblems - resolvedTotal;
  const resolutionRate = totalProblems > 0 ? Math.round((resolvedTotal / totalProblems) * 100) : 0;

  // Format Monthly Trends
  const monthlyTrends: AnalyticsMonthlyTrend[] = Object.keys(monthlyTrendsMap)
    .sort()
    .map((key) => ({
      monthKey: key,
      monthLabel: monthlyTrendsMap[key].monthLabel,
      newReports: monthlyTrendsMap[key].newReports,
      resolvedCount: monthlyTrendsMap[key].resolvedCount,
      month: key,
      label: monthlyTrendsMap[key].monthLabel,
      reports: monthlyTrendsMap[key].newReports,
      resolved: monthlyTrendsMap[key].resolvedCount,
    }));

  return {
    timeRange: query.range || 'all',
    summary: {
      totalProblems,
      activeBacklog,
      resolvedTotal,
      resolvedCount: resolvedTotal,
      resolutionRate,
      avgResolutionTime,
      avgResolutionHours,
      avgResolutionTimeHours: avgResolutionHours,
      avgResolutionTimeDays: Math.round((avgResolutionHours / 24) * 10) / 10,
      topCategory: byCategory[0]?.count > 0 ? byCategory[0].category : 'ROAD',
      topArea: byArea[0]?.count > 0 ? byArea[0].area : 'Metro Central',
    },
    byCategory,
    byArea,
    byPriority,
    byStatus,
    resolutionRatio: {
      resolved: resolvedTotal,
      unresolved: activeBacklog,
      total: totalProblems,
      ratePercentage: resolutionRate,
      resolutionRate,
    },
    monthlyTrends,
    monthlyTrend: monthlyTrends,
  };
};

/**
 * Phase 26 — Admin Map
 * Detailed spatial query with filters for:
 * ALL, CRITICAL, UNVERIFIED, IN_PROGRESS, UNRESOLVED
 * Includes marker payload with Assigned Department, priority breakdown, and backer stats.
 */
export type AdminMapFilter = 'ALL' | 'CRITICAL' | 'UNVERIFIED' | 'IN_PROGRESS' | 'UNRESOLVED';

export interface GetAdminMapQueryInput {
  filter?: AdminMapFilter;
  category?: ProblemCategory | 'ALL';
  departmentId?: string | 'ALL';
  bounds?: string;
  search?: string;
}

export interface AdminMapMarkerItem {
  id: string;
  title: string;
  description: string;
  category: ProblemCategory;
  priority: PriorityLevel;
  autoPriority: PriorityLevel;
  adminPriority: PriorityLevel | null;
  status: ProblemStatus;
  reportCount: number;
  supportCount: number;
  peopleAffected: number;
  latitude: number;
  longitude: number;
  address: string;
  area: string;
  city: string;
  departmentId: string | null;
  department: {
    id: string;
    name: string;
    code: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminMapResult {
  counts: {
    all: number;
    critical: number;
    unverified: number;
    inProgress: number;
    unresolved: number;
  };
  markers: AdminMapMarkerItem[];
}

export const getAdminMapProblems = async (
  query: GetAdminMapQueryInput
): Promise<AdminMapResult> => {
  const { filter = 'ALL', category, departmentId, bounds, search } = query;
  const where: Prisma.ProblemWhereInput = {};

  // 1. Primary Filter Rule
  switch (filter) {
    case 'CRITICAL':
      where.OR = [
        { adminPriority: 'CRITICAL' },
        { AND: [{ adminPriority: null }, { autoPriority: 'CRITICAL' }] },
      ];
      break;

    case 'UNVERIFIED':
      where.status = { in: ['SUBMITTED', 'UNDER_REVIEW'] };
      break;

    case 'IN_PROGRESS':
      where.status = 'IN_PROGRESS';
      break;

    case 'UNRESOLVED':
      where.status = {
        in: [
          'SUBMITTED',
          'UNDER_REVIEW',
          'VERIFIED',
          'ASSIGNED',
          'IN_PROGRESS',
          'REOPENED',
        ],
      };
      break;

    case 'ALL':
    default:
      // no status or priority constraint
      break;
  }

  // 2. Category Filter
  if (category && category !== 'ALL') {
    where.category = category;
  }

  // 3. Department Filter
  if (departmentId === 'UNASSIGNED') {
    where.departmentId = null;
  } else if (departmentId && departmentId !== 'ALL') {
    where.departmentId = departmentId;
  }

  // 4. Bounds Filter: "sw_lat,sw_lng,ne_lat,ne_lng"
  if (bounds) {
    const parts = bounds.split(',').map((p) => parseFloat(p.trim()));
    if (parts.length === 4 && parts.every((p) => !isNaN(p))) {
      const [swLat, swLng, neLat, neLng] = parts;
      where.latitude = { gte: Math.min(swLat, neLat), lte: Math.max(swLat, neLat) };
      where.longitude = { gte: Math.min(swLng, neLng), lte: Math.max(swLng, neLng) };
    }
  }

  // 5. Search Filter
  if (search && search.trim()) {
    const q = search.trim();
    const searchCondition: Prisma.ProblemWhereInput = {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { area: { contains: q, mode: 'insensitive' } },
      ],
    };

    if (where.AND) {
      where.AND = Array.isArray(where.AND)
        ? [...where.AND, searchCondition]
        : [where.AND, searchCondition];
    } else {
      where.AND = [searchCondition];
    }
  }

  // Live count aggregates for filter tabs
  const [allCount, criticalCount, unverifiedCount, inProgressCount, unresolvedCount] =
    await Promise.all([
      prisma.problem.count(),
      prisma.problem.count({
        where: {
          OR: [
            { adminPriority: 'CRITICAL' },
            { AND: [{ adminPriority: null }, { autoPriority: 'CRITICAL' }] },
          ],
        },
      }),
      prisma.problem.count({
        where: {
          status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
        },
      }),
      prisma.problem.count({
        where: {
          status: 'IN_PROGRESS',
        },
      }),
      prisma.problem.count({
        where: {
          status: {
            in: [
              'SUBMITTED',
              'UNDER_REVIEW',
              'VERIFIED',
              'ASSIGNED',
              'IN_PROGRESS',
              'REOPENED',
            ],
          },
        },
      }),
    ]);

  const rawMarkers = await prisma.problem.findMany({
    where,
    take: 500,
    orderBy: [{ reportCount: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      severity: true,
      autoPriority: true,
      adminPriority: true,
      status: true,
      reportCount: true,
      supportCount: true,
      peopleAffected: true,
      latitude: true,
      longitude: true,
      address: true,
      area: true,
      city: true,
      departmentId: true,
      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  const markers: AdminMapMarkerItem[] = rawMarkers.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    category: m.category,
    priority: m.adminPriority ?? m.autoPriority,
    autoPriority: m.autoPriority,
    adminPriority: m.adminPriority,
    status: m.status,
    reportCount: m.reportCount,
    supportCount: m.supportCount,
    peopleAffected: m.peopleAffected,
    latitude: m.latitude,
    longitude: m.longitude,
    address: m.address,
    area: m.area,
    city: m.city,
    departmentId: m.departmentId,
    department: m.department,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  }));

  return {
    counts: {
      all: allCount,
      critical: criticalCount,
      unverified: unverifiedCount,
      inProgress: inProgressCount,
      unresolved: unresolvedCount,
    },
    markers,
  };
};



