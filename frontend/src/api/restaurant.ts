import { API_BASE_URL, getOptionalAuthHeader } from './auth';

export interface Restaurant {
  id: number;
  ownerId?: number;
  name: string;
  description: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  phoneNumber?: string;
  email?: string;
  rating: number;
  reviewCount?: number;
  isActive: boolean;
  isOpen?: boolean;
  isApproved?: boolean;
  cuisineType: string;
  cuisines?: string;
  openingTime?: string;
  closingTime?: string;
  imageUrl?: string;
  deliveryFee?: number;
  estimatedDeliveryMin?: number;
  createdAt?: string;
  updatedAt?: string;
}

const parseResponse = async <T>(response: Response, fallback: string): Promise<T> => {
  if (!response.ok) {
    throw new Error(fallback);
  }
  return response.json() as Promise<T>;
};

export const restaurantService = {
  async getAllRestaurants(): Promise<Restaurant[]> {
    const response = await fetch(`${API_BASE_URL}/v1/restaurants/active`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
    return parseResponse<Restaurant[]>(response, `Failed to fetch restaurants: ${response.statusText}`);
  },

  async getRestaurantById(id: number): Promise<Restaurant> {
    const response = await fetch(`${API_BASE_URL}/v1/restaurants/${id}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
    return parseResponse<Restaurant>(response, `Failed to fetch restaurant: ${response.statusText}`);
  },

  async searchRestaurants(keyword: string): Promise<Restaurant[]> {
    const response = await fetch(`${API_BASE_URL}/v1/restaurants/search?keyword=${encodeURIComponent(keyword)}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
    return parseResponse<Restaurant[]>(response, `Failed to search restaurants: ${response.statusText}`);
  },

  async getRestaurantsByCuisine(cuisineType: string): Promise<Restaurant[]> {
    const response = await fetch(`${API_BASE_URL}/v1/restaurants/cuisine/${encodeURIComponent(cuisineType)}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
    return parseResponse<Restaurant[]>(response, `Failed to filter restaurants: ${response.statusText}`);
  },

  async getRestaurantsByOwner(ownerId: number): Promise<Restaurant[]> {
    const response = await fetch(`${API_BASE_URL}/v1/restaurants/owner/${ownerId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
    return parseResponse<Restaurant[]>(response, `Failed to fetch owner restaurants: ${response.statusText}`);
  },

  async getAllRestaurantsForAdmin(): Promise<Restaurant[]> {
    const response = await fetch(`${API_BASE_URL}/v1/restaurants`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
    return parseResponse<Restaurant[]>(response, `Failed to fetch all restaurants: ${response.statusText}`);
  },

  async approveRestaurant(id: number): Promise<Restaurant> {
    const response = await fetch(`${API_BASE_URL}/v1/restaurants/${id}/approve`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
    return parseResponse<Restaurant>(response, `Failed to approve restaurant: ${response.statusText}`);
  },

  async toggleRestaurantOpen(id: number): Promise<Restaurant> {
    const response = await fetch(`${API_BASE_URL}/v1/restaurants/${id}/toggle-open`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
    return parseResponse<Restaurant>(response, `Failed to update open status: ${response.statusText}`);
  },

  async toggleRestaurantActive(id: number): Promise<Restaurant> {
    const response = await fetch(`${API_BASE_URL}/v1/restaurants/${id}/toggle-active`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
    return parseResponse<Restaurant>(response, `Failed to update restaurant status: ${response.statusText}`);
  },
};
