import { prisma } from '../../config/db';
import { AppError } from '../../middleware/errorHandler';

export type NotificationEventType =
  | 'VERIFIED'
  | 'REJECTED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REOPENED'
  | 'CLOSED'
  | 'COMMUNITY_VERIFIED';


export interface NotifyStakeholdersOptions {
  note?: string;
  departmentName?: string;
  actorId?: string;
}

export const getNotifications = async (userId: string) => {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    }),
  ]);

  return {
    success: true,
    count: notifications.length,
    unreadCount,
    notifications,
  };
};

export const markAsRead = async (userId: string, notificationId: string) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    const error: AppError = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return {
    success: true,
    message: 'Notification marked as read',
    notification: updated,
  };
};

export const markAllAsRead = async (userId: string) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return {
    success: true,
    message: 'All notifications marked as read',
    updatedCount: result.count,
  };
};

export const deleteNotification = async (userId: string, notificationId: string) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    const error: AppError = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  return {
    success: true,
    message: 'Notification deleted successfully',
  };
};

/**
 * Dispatches notifications to all citizens associated with a problem:
 * - Creator
 * - Eyewitness duplicate reporters
 * - Backers / supporters
 */
export const notifyProblemStakeholders = async (
  problemId: string,
  event: NotificationEventType,
  options: NotifyStakeholdersOptions = {}
) => {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: {
      reports: { select: { userId: true } },
      supports: { select: { userId: true } },
      department: { select: { name: true } },
    },
  });

  if (!problem) return { dispatchedCount: 0 };

  // Collect distinct stakeholder user IDs
  const recipientSet = new Set<string>();
  if (problem.createdById) recipientSet.add(problem.createdById);
  problem.reports.forEach((r: { userId: string }) => recipientSet.add(r.userId));
  problem.supports.forEach((s: { userId: string }) => recipientSet.add(s.userId));

  // Exclude the actor who triggered the action if provided
  if (options.actorId) {
    recipientSet.delete(options.actorId);
  }

  const recipientIds = Array.from(recipientSet);
  if (recipientIds.length === 0) {
    return { dispatchedCount: 0 };
  }

  const problemTitleTruncated =
    problem.title.length > 50 ? `${problem.title.substring(0, 47)}...` : problem.title;

  let title = 'Problem Update';
  let message = `There is an update on "${problemTitleTruncated}".`;

  switch (event) {
    case 'VERIFIED':
      title = 'Report Verified';
      message = `Your report for "${problemTitleTruncated}" was verified by municipal authorities.`;
      break;
    case 'REJECTED':
      title = 'Report Rejected';
      message = `Your report for "${problemTitleTruncated}" was rejected.${
        options.note ? ` Reason: ${options.note}` : ''
      }`;
      break;
    case 'ASSIGNED': {
      const dept = options.departmentName || problem.department?.name || 'the responsible department';
      title = 'Department Assigned';
      message = `Your report for "${problemTitleTruncated}" was assigned to ${dept}.`;
      break;
    }
    case 'IN_PROGRESS':
      title = 'Work Started';
      message = `Municipal work crews have initiated on-site repairs for "${problemTitleTruncated}".`;
      break;
    case 'RESOLVED':
      title = 'Problem Resolved!';
      message = `Municipal work on "${problemTitleTruncated}" has been completed and marked resolved.`;
      break;
    case 'REOPENED':
      title = 'Problem Reopened';
      message = `Citizen feedback indicated "${problemTitleTruncated}" requires further action and has been reopened.${
        options.note ? ` Note: ${options.note}` : ''
      }`;
      break;
    case 'COMMUNITY_VERIFIED':
      title = 'Community Verified';
      message = `Citizens confirmed the resolution for "${problemTitleTruncated}".`;
      break;
    case 'CLOSED':
      title = 'Problem Closed';
      message = `The municipal record for "${problemTitleTruncated}" has been closed.`;
      break;
  }


  await prisma.notification.createMany({
    data: recipientIds.map((uid) => ({
      userId: uid,
      title,
      message,
      problemId,
    })),
  });

  return {
    dispatchedCount: recipientIds.length,
    title,
    message,
  };
};
