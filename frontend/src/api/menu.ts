import { API_BASE_URL, getOptionalAuthHeader } from './auth';

export interface MenuCategory {
  id: number;
  restaurantId: number;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  imageUrl?: string;
}

export interface MenuItem {
  id: number;
  restaurantId: number;
  categoryId?: number;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  isAvailable: boolean;
  isVegetarian: boolean;
  isSpicy?: boolean;
  preparationTime: number;
  orderCount?: number;
  rating?: number;
  imageUrl?: string;
}

const parseResponse = async <T>(response: Response, fallback: string): Promise<T> => {
  if (!response.ok) {
    throw new Error(fallback);
  }
  return response.json() as Promise<T>;
};

export const menuService = {
  async getMenuByRestaurant(restaurantId: number): Promise<MenuItem[]> {
    const response = await fetch(`${API_BASE_URL}/v1/menu/items/restaurant/${restaurantId}/available`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
    return parseResponse<MenuItem[]>(response, `Failed to fetch menu items: ${response.statusText}`);
  },

  async getRestaurantCategories(restaurantId: number): Promise<MenuCategory[]> {
    const response = await fetch(`${API_BASE_URL}/v1/menu/categories/restaurant/${restaurantId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
    return parseResponse<MenuCategory[]>(response, `Failed to fetch menu categories: ${response.statusText}`);
  },

  async getMenuItemById(id: number): Promise<MenuItem> {
    const response = await fetch(`${API_BASE_URL}/v1/menu/items/${id}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
    return parseResponse<MenuItem>(response, `Failed to fetch menu item: ${response.statusText}`);
  },

  async searchMenuItems(keyword: string): Promise<MenuItem[]> {
    const response = await fetch(`${API_BASE_URL}/v1/menu/items/search?keyword=${encodeURIComponent(keyword)}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
    return parseResponse<MenuItem[]>(response, `Failed to search menu items: ${response.statusText}`);
  },

  async updateItemAvailability(id: number, isAvailable: boolean): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/v1/menu/items/${id}/availability?isAvailable=${isAvailable}`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to update item availability: ${response.statusText}`);
    }
  }
};
