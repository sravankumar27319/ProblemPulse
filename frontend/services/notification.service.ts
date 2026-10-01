import { apiClient } from './apiClient';
import { NotificationsResponse, MarkAsReadResponse } from '../types/notification';

export const notificationService = {
  async fetchNotifications(): Promise<NotificationsResponse> {
    const response = await apiClient.get<NotificationsResponse>('/notifications');
    return response.data;
  },

  async markAsRead(notificationId: string): Promise<MarkAsReadResponse> {
    const response = await apiClient.patch<MarkAsReadResponse>(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  },

  async markAllAsRead(): Promise<MarkAsReadResponse> {
    const response = await apiClient.patch<MarkAsReadResponse>('/notifications/read-all');
    return response.data;
  },

  async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/notifications/${notificationId}`
    );
    return response.data;
  },
};
