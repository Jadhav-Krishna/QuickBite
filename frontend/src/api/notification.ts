import { API_BASE_URL } from './auth';
export interface NotificationDTO {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
};
export const notificationService = {
  getUserNotifications(userId: number) {
    return request<NotificationDTO[]>(`${API_BASE_URL}/v1/notifications/user/${userId}`);
  },
  getUnreadNotifications(userId: number) {
    return request<NotificationDTO[]>(`${API_BASE_URL}/v1/notifications/user/${userId}/unread`);
  },
  markAsRead(notificationId: number) {
    return request<void>(`${API_BASE_URL}/v1/notifications/${notificationId}/read`, { method: 'PUT' });
  },
  markAllAsRead(userId: number) {
    return request<void>(`${API_BASE_URL}/v1/notifications/user/${userId}/read-all`, { method: 'PUT' });
  },
};
