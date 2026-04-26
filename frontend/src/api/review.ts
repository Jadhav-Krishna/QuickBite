import { API_BASE_URL, getOptionalAuthHeader } from './auth';

export interface ReviewDTO {
  id: number;
  orderId: number;
  customerId: number;
  restaurantId: number;
  restaurantRating: number;
  restaurantReview?: string;
  deliveryRating?: number;
  deliveryReview?: string;
  deliveryAgentId?: number;
  isAnonymous?: boolean;
  createdAt?: string;
}

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
};

export const reviewService = {
  getAllReviews() {
    return request<ReviewDTO[]>(`${API_BASE_URL}/v1/reviews/all`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  getRestaurantReviews(restaurantId: number) {
    return request<ReviewDTO[]>(`${API_BASE_URL}/v1/reviews/restaurant/${restaurantId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  getRestaurantRating(restaurantId: number) {
    return request<number>(`${API_BASE_URL}/v1/reviews/restaurant/${restaurantId}/rating`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  getDeliveryAgentReviews(agentId: number) {
    return request<ReviewDTO[]>(`${API_BASE_URL}/v1/reviews/delivery/${agentId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  getDeliveryAgentRating(agentId: number) {
    return request<number>(`${API_BASE_URL}/v1/reviews/delivery/${agentId}/rating`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },
};
