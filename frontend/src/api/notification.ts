import { API_BASE_URL, getOptionalAuthHeader } from './auth';
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
    return request<NotificationDTO[]>(`${API_BASE_URL}/v1/notifications/user/${userId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },
  getUnreadNotifications(userId: number) {
    return request<NotificationDTO[]>(`${API_BASE_URL}/v1/notifications/user/${userId}/unread`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },
  markAsRead(notificationId: number) {
    return request<void>(`${API_BASE_URL}/v1/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },
  markAllAsRead(userId: number) {
    return request<void>(`${API_BASE_URL}/v1/notifications/user/${userId}/read-all`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },
  sendTestNotification(payload: {
    eventType: string;
    orderId?: number;
    orderNumber?: string;
    userId?: number;
    customerId?: number;
    restaurantId?: number;
    deliveryAgentId?: number;
    title: string;
    message: string;
    notificationType?: string;
    recipientEmail?: string;
    recipientPhone?: string;
    recipientRole?: string;
  }) {
    return request<void>(`${API_BASE_URL}/v1/notifications/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getOptionalAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
  },
};
