import { Prisma, ProblemCategory, PriorityLevel } from '@prisma/client';
import { prisma } from '../../config/db';
import {
  GetProblemsQueryInput,
  GetMapQueryInput,
  CreateProblemInput,
  CheckDuplicatesQueryInput,
} from './problem.schema';
import { calculateAutoPriority } from './priority.service';
import { findDuplicateProblems } from './duplicate.service';
import { AppError } from '../../middleware/errorHandler';

const CATEGORY_DEPARTMENT_MAP: Record<ProblemCategory, string> = {
  ROAD: 'ROADS',
  WATER: 'WATER',
  GARBAGE: 'GARBAGE',
  ELECTRICITY: 'ELECTRICITY',
  TRAFFIC: 'TRAFFIC',
  OTHER: 'SANIS',
};

export const getProblems = async (query: GetProblemsQueryInput, currentUserId?: string) => {
  const { page, limit, category, priority, sort, search } = query;

  const skip = (page - 1) * limit;

  // Build Prisma Where Clause
  const where: Prisma.ProblemWhereInput = {};

  if (category) {
    where.category = category;
  }

  if (priority) {
    where.OR = [
      { adminPriority: priority },
      { AND: [{ adminPriority: null }, { autoPriority: priority }] },
    ];
  }

  if (search && search.trim()) {
    const searchTerm = search.trim();
    where.AND = [
      ...(where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : []),
      {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { address: { contains: searchTerm, mode: 'insensitive' } },
          { area: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
    ];
  }

  // Build OrderBy
  let orderBy: Prisma.ProblemOrderByWithRelationInput[] = [];

  switch (sort) {
    case 'most_supported':
      orderBy = [{ supportCount: 'desc' }, { createdAt: 'desc' }];
      break;
    case 'most_reported':
      orderBy = [{ reportCount: 'desc' }, { createdAt: 'desc' }];
      break;
    case 'highest_priority':
      orderBy = [{ autoPriority: 'asc' }, { createdAt: 'desc' }];
      break;
    case 'latest':
    default:
      orderBy = [{ createdAt: 'desc' }];
      break;
  }

  // Execute Count & Query in parallel
  const [total, problems] = await Promise.all([
    prisma.problem.count({ where }),
    prisma.problem.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
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
          take: 3,
        },
        supports: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    problems: problems.map((p) => {
      const isSupported = Boolean((p as any).supports && (p as any).supports.length > 0);
      const { supports, ...rest } = p as any;
      return {
        ...rest,
        isSupported,
        supported: isSupported,
        priority: p.adminPriority ?? p.autoPriority,
      };
    }),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

export const getMapProblems = async (query: GetMapQueryInput) => {
  const { bounds, category, priority } = query;
  const where: Prisma.ProblemWhereInput = {};

  // Bounds parsing: "sw_lat,sw_lng,ne_lat,ne_lng"
  if (bounds) {
    const parts = bounds.split(',').map((p) => parseFloat(p.trim()));
    if (parts.length === 4 && parts.every((p) => !isNaN(p))) {
      const [swLat, swLng, neLat, neLng] = parts;
      where.latitude = { gte: Math.min(swLat, neLat), lte: Math.max(swLat, neLat) };
      where.longitude = { gte: Math.min(swLng, neLng), lte: Math.max(swLng, neLng) };
    }
  }

  if (category) {
    where.category = category;
  }

  if (priority) {
    where.OR = [
      { adminPriority: priority },
      { AND: [{ adminPriority: null }, { autoPriority: priority }] },
    ];
  }

  // Select ONLY lightweight marker fields per spec
  const markers = await prisma.problem.findMany({
    where,
    take: 250,
    select: {
      id: true,
      latitude: true,
      longitude: true,
      title: true,
      autoPriority: true,
      adminPriority: true,
      status: true,
      reportCount: true,
      supportCount: true,
      address: true,
      area: true,
      city: true,
    },
  });

  return markers.map((m) => ({
    id: m.id,
    latitude: m.latitude,
    longitude: m.longitude,
    title: m.title,
    priority: m.adminPriority ?? m.autoPriority,
    status: m.status,
    reportCount: m.reportCount,
    supportCount: m.supportCount,
    address: m.address,
    area: m.area,
    city: m.city,
  }));
};

export const getProblemById = async (id: string, currentUserId?: string) => {
  const problem = await prisma.problem.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
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
      resolution: {
        include: {
          proofMedia: {
            select: {
              id: true,
              url: true,
              mediaType: true,
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

  let isSupportedByMe = false;
  let isReportedByMe = false;

  if (currentUserId) {
    const [support, report] = await Promise.all([
      prisma.problemSupport.findUnique({
        where: {
          problemId_userId: {
            problemId: id,
            userId: currentUserId,
          },
        },
      }),
      prisma.problemReport.findUnique({
        where: {
          problemId_userId: {
            problemId: id,
            userId: currentUserId,
          },
        },
      }),
    ]);

    isSupportedByMe = Boolean(support);
    isReportedByMe = problem.createdById === currentUserId || Boolean(report);
  }

  return {
    ...problem,
    priority: problem.adminPriority ?? problem.autoPriority,
    isSupportedByMe,
    isSupported: isSupportedByMe,
    supported: isSupportedByMe,
    isReportedByMe,
  };
};

/**
 * Check for duplicate/nearby open problems before creation
 */
export const checkDuplicates = async (query: CheckDuplicatesQueryInput) => {
  return findDuplicateProblems({
    category: query.category,
    latitude: query.latitude,
    longitude: query.longitude,
    radiusMeters: query.radiusMeters,
  });
};

/**
 * Phase 10: Create a new problem or link report to an existing one
 */
export const createProblem = async (data: CreateProblemInput, userId: string) => {
  // 1. If citizen chose to link to an existing problem
  if (data.existingProblemId) {
    const existingProblem = await prisma.problem.findUnique({
      where: { id: data.existingProblemId },
    });

    if (!existingProblem) {
      const error: AppError = new Error('Target problem for linking not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user already reported this problem
    const existingReport = await prisma.problemReport.findUnique({
      where: {
        problemId_userId: {
          problemId: existingProblem.id,
          userId,
        },
      },
    });

    if (!existingReport) {
      // Calculate updated autoPriority with incremented reportCount
      const newReportCount = existingProblem.reportCount + 1;
      const { priority: newAutoPriority } = calculateAutoPriority({
        severity: existingProblem.severity,
        peopleAffected: existingProblem.peopleAffected,
        reportCount: newReportCount,
        supportCount: existingProblem.supportCount,
      });

      const txOperations: any[] = [
        prisma.problemReport.create({
          data: {
            problemId: existingProblem.id,
            userId,
          },
        }),
        prisma.problem.update({
          where: { id: existingProblem.id },
          data: {
            reportCount: { increment: 1 },
            autoPriority: newAutoPriority,
          },
        }),
        prisma.problemTimeline.create({
          data: {
            problemId: existingProblem.id,
            toStatus: existingProblem.status,
            note: 'Additional citizen report linked to this issue.',
            actorId: userId,
          },
        }),
      ];

      if (data.media && data.media.length > 0) {
        txOperations.push(
          prisma.media.createMany({
            data: data.media.map((m) => ({
              url: m.url,
              publicId: m.publicId || null,
              mediaType: m.mediaType || 'image',
              problemId: existingProblem.id,
            })),
          })
        );
      }

      await prisma.$transaction(txOperations);
    }

    return getProblemById(existingProblem.id, userId);
  }

  // 2. Resolve Department (either provided or auto-mapped by category)
  let departmentId = data.departmentId;
  if (!departmentId) {
    const deptCode = CATEGORY_DEPARTMENT_MAP[data.category];
    if (deptCode) {
      const dept = await prisma.department.findUnique({
        where: { code: deptCode },
      });
      if (dept) {
        departmentId = dept.id;
      }
    }
  }

  // 3. Compute Auto Priority
  const { priority: calculatedAutoPriority } = calculateAutoPriority({
    severity: data.severity,
    peopleAffected: data.peopleAffected,
    reportCount: 1,
    supportCount: 0,
  });

  // 4. Create problem and all initial relational records in a transaction
  const createdProblem = await prisma.$transaction(async (tx) => {
    // A. Create Problem Record
    const problem = await tx.problem.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        severity: data.severity,
        peopleAffected: data.peopleAffected,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        area: data.area,
        city: data.city,
        state: data.state || 'Metro State',
        autoPriority: calculatedAutoPriority,
        status: 'SUBMITTED',
        reportCount: 1,
        supportCount: 0,
        createdById: userId,
        departmentId: departmentId || null,
      },
    });

    // B. Create Media Records if provided
    if (data.media && data.media.length > 0) {
      await tx.media.createMany({
        data: data.media.map((m) => ({
          url: m.url,
          publicId: m.publicId || null,
          mediaType: m.mediaType || 'image',
          problemId: problem.id,
        })),
      });
    }

    // C. Create ProblemReport for creator
    await tx.problemReport.create({
      data: {
        problemId: problem.id,
        userId,
      },
    });

    // D. Create Initial Timeline Event (SUBMITTED)
    await tx.problemTimeline.create({
      data: {
        problemId: problem.id,
        fromStatus: null,
        toStatus: 'SUBMITTED',
        note: 'Problem report submitted with evidence.',
        actorId: userId,
      },
    });

    // E. Notify Admins
    const admins = await tx.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    if (admins.length > 0) {
      await tx.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          title: `New Problem Reported: ${problem.title.substring(0, 50)}`,
          message: `A new ${problem.category} problem was reported at ${problem.area}, ${problem.city}.`,
          problemId: problem.id,
        })),
      });
    }

    // 5. Return complete problem structure with creator info, media, timeline, etc.
    return problem;
  });

  return getProblemById(createdProblem.id, userId);
};

/**
 * Phase 14: Add citizen support to an existing problem (POST /api/problems/:id/support)
 * UNIQUE(problemId, userId) enforced.
 */
export const addSupport = async (problemId: string, userId: string) => {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
  });

  if (!problem) {
    const error: AppError = new Error('Problem not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if user already supported
  const existingSupport = await prisma.problemSupport.findUnique({
    where: {
      problemId_userId: {
        problemId,
        userId,
      },
    },
  });

  if (existingSupport) {
    return {
      success: true,
      message: 'Problem already supported',
      supportCount: problem.supportCount,
      isSupported: true,
      supported: true,
      priority: problem.adminPriority ?? problem.autoPriority,
    };
  }

  const newSupportCount = problem.supportCount + 1;
  const { priority: newAutoPriority } = calculateAutoPriority({
    severity: problem.severity,
    peopleAffected: problem.peopleAffected,
    reportCount: problem.reportCount,
    supportCount: newSupportCount,
  });

  await prisma.$transaction([
    prisma.problemSupport.create({
      data: {
        problemId,
        userId,
      },
    }),
    prisma.problem.update({
      where: { id: problemId },
      data: {
        supportCount: { increment: 1 },
        autoPriority: newAutoPriority,
      },
    }),
  ]);

  return {
    success: true,
    message: 'Support registered successfully',
    supportCount: newSupportCount,
    isSupported: true,
    supported: true,
    priority: problem.adminPriority ?? newAutoPriority,
  };
};

/**
 * Phase 14: Remove citizen support from a problem (DELETE /api/problems/:id/support)
 */
export const removeSupport = async (problemId: string, userId: string) => {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
  });

  if (!problem) {
    const error: AppError = new Error('Problem not found');
    error.statusCode = 404;
    throw error;
  }

  const existingSupport = await prisma.problemSupport.findUnique({
    where: {
      problemId_userId: {
        problemId,
        userId,
      },
    },
  });

  if (!existingSupport) {
    return {
      success: true,
      message: 'Problem was not supported',
      supportCount: problem.supportCount,
      isSupported: false,
      supported: false,
      priority: problem.adminPriority ?? problem.autoPriority,
    };
  }

  const newSupportCount = Math.max(0, problem.supportCount - 1);
  const { priority: newAutoPriority } = calculateAutoPriority({
    severity: problem.severity,
    peopleAffected: problem.peopleAffected,
    reportCount: problem.reportCount,
    supportCount: newSupportCount,
  });

  await prisma.$transaction([
    prisma.problemSupport.delete({
      where: {
        problemId_userId: {
          problemId,
          userId,
        },
      },
    }),
    prisma.problem.update({
      where: { id: problemId },
      data: {
        supportCount: newSupportCount,
        autoPriority: newAutoPriority,
      },
    }),
  ]);

  return {
    success: true,
    message: 'Support removed successfully',
    supportCount: newSupportCount,
    isSupported: false,
    supported: false,
    priority: problem.adminPriority ?? newAutoPriority,
  };
};

/**
 * Phase 15 — Comments
 */
export const getComments = async (problemId: string) => {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    select: { id: true },
  });

  if (!problem) {
    const error: AppError = new Error('Problem not found');
    error.statusCode = 404;
    throw error;
  }

  const comments = await prisma.comment.findMany({
    where: { problemId },
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
  });

  return {
    success: true,
    count: comments.length,
    comments,
  };
};

export const createComment = async (
  problemId: string,
  userId: string,
  content: string
) => {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    select: { id: true },
  });

  if (!problem) {
    const error: AppError = new Error('Problem not found');
    error.statusCode = 404;
    throw error;
  }

  const comment = await prisma.comment.create({
    data: {
      problemId,
      userId,
      content,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  return {
    success: true,
    message: 'Comment posted successfully',
    comment,
  };
};

export const flagComment = async (problemId: string, commentId: string) => {
  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      problemId,
    },
  });

  if (!comment) {
    const error: AppError = new Error('Comment not found');
    error.statusCode = 404;
    throw error;
  }

  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: { isFlagged: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  return {
    success: true,
    message: 'Comment reported for moderation review',
    comment: updatedComment,
  };
};

/**
 * Phase 16 — User Activity
 */
export const getUserActivity = async (userId: string) => {
  const problemInclude = {
    createdBy: {
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    },
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
      take: 3,
    },
  };

  const [rawReported, rawSupported, rawResolved] = await Promise.all([
    // 1. My Reports: Problems created by the user OR linked as duplicate report
    prisma.problem.findMany({
      where: {
        OR: [
          { createdById: userId },
          { reports: { some: { userId } } },
        ],
      },
      include: problemInclude,
      orderBy: { createdAt: 'desc' },
    }),

    // 2. Supported Problems: Problems backed by the user
    prisma.problem.findMany({
      where: {
        supports: {
          some: { userId },
        },
      },
      include: problemInclude,
      orderBy: { createdAt: 'desc' },
    }),

    // 3. Resolved Problems: Problems user reported or supported that are resolved/closed
    prisma.problem.findMany({
      where: {
        AND: [
          {
            OR: [
              { createdById: userId },
              { reports: { some: { userId } } },
              { supports: { some: { userId } } },
            ],
          },
          {
            status: {
              in: ['RESOLVED', 'COMMUNITY_VERIFIED', 'CLOSED'],
            },
          },
        ],
      },
      include: problemInclude,
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  const mapProblem = (p: typeof rawReported[number]) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    severity: p.severity,
    priority: p.adminPriority ?? p.autoPriority,
    autoPriority: p.autoPriority,
    adminPriority: p.adminPriority,
    status: p.status,
    reportCount: p.reportCount,
    supportCount: p.supportCount,
    peopleAffected: p.peopleAffected,
    address: p.address,
    area: p.area,
    city: p.city,
    state: p.state,
    latitude: p.latitude,
    longitude: p.longitude,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    createdBy: p.createdBy,
    department: p.department,
    media: p.media,
  });

  const reportedProblems = rawReported.map(mapProblem);
  const supportedProblems = rawSupported.map(mapProblem);
  const resolvedProblems = rawResolved.map(mapProblem);

  return {
    success: true,
    summary: {
      reportedCount: reportedProblems.length,
      supportedCount: supportedProblems.length,
      resolvedCount: resolvedProblems.length,
    },
    reportedProblems,
    supportedProblems,
    resolvedProblems,
  };
};



