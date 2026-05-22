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
  
  // Handle 204 No Content responses
  if (response.status === 204) {
    return undefined as T;
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

  async deleteNotification(notificationId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/v1/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Failed to delete notification: ${response.status}`);
    }
  },

  async clearAllNotifications(userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/v1/notifications/user/${userId}`, {
      method: 'DELETE',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Failed to clear notifications: ${response.status}`);
    }
  },
};
