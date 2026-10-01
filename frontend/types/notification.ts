export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  problemId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  count: number;
  unreadCount: number;
  notifications: NotificationItem[];
}

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
  notification?: NotificationItem;
  updatedCount?: number;
}
