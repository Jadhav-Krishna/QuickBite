import { API_BASE_URL, getOptionalAuthHeader } from './auth';

export interface ReviewDTO {
  id?: number;
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

export interface CreateReviewRequest {
  orderId: number;
  customerId: number;
  restaurantId: number;
  restaurantRating: number;
  restaurantReview?: string;
  deliveryRating?: number;
  deliveryReview?: string;
  deliveryAgentId?: number;
  isAnonymous?: boolean;
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
  createReview(data: CreateReviewRequest) {
    return request<ReviewDTO>(`${API_BASE_URL}/v1/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getOptionalAuthHeader(),
      },
      body: JSON.stringify(data),
    });
  },

  getReviewByOrder(orderId: number) {
    return request<ReviewDTO>(`${API_BASE_URL}/v1/reviews/order/${orderId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  getAllReviews() {
    return request<ReviewDTO[]>(`${API_BASE_URL}/v1/reviews`, {
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

  getCustomerReviews(customerId: number) {
    return request<ReviewDTO[]>(`${API_BASE_URL}/v1/reviews/customer/${customerId}`, {
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
