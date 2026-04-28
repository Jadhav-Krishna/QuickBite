import { API_BASE_URL, getOptionalAuthHeader } from './auth';

export interface NotificationDTO {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  eventType: string;
  referenceId?: number;
  isRead: boolean;
  createdAt: string;
}

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
};

export const notificationService = {
  getUserNotifications(userId: number): Promise<NotificationDTO[]> {
    return request<NotificationDTO[]>(`${API_BASE_URL}/v1/notifications/user/${userId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  getUnreadNotifications(userId: number): Promise<NotificationDTO[]> {
    return request<NotificationDTO[]>(`${API_BASE_URL}/v1/notifications/user/${userId}/unread`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  markAsRead(notificationId: number): Promise<void> {
    return request<void>(`${API_BASE_URL}/v1/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  markAllAsRead(userId: number): Promise<void> {
    return request<void>(`${API_BASE_URL}/v1/notifications/user/${userId}/read-all`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },
};
