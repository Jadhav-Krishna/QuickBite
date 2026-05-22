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

export interface CreateMenuItemRequest {
  restaurantId: number;
  categoryId?: number;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  preparationTime: number;
  isVegetarian: boolean;
  isSpicy?: boolean;
}

export interface UpdateMenuItemRequest {
  name?: string;
  description?: string;
  price?: number;
  discountedPrice?: number;
  preparationTime?: number;
  isAvailable?: boolean;
  imageUrl?: string;
}

export interface CreateCategoryRequest {
  restaurantId: number;
  name: string;
  description?: string;
  displayOrder?: number;
}

const parseResponse = async <T>(response: Response, fallback: string): Promise<T> => {
  if (!response.ok) {
    throw new Error(fallback);
  }
  return response.json() as Promise<T>;
};

export const menuService = {
  async getAllDishes(): Promise<MenuItem[]> {
    const response = await fetch(`${API_BASE_URL}/v1/menu/items`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
    return parseResponse<MenuItem[]>(response, `Failed to fetch all dishes: ${response.statusText}`);
  },

  async getAllMenuByRestaurant(restaurantId: number): Promise<MenuItem[]> {
    const response = await fetch(`${API_BASE_URL}/v1/menu/items/restaurant/${restaurantId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
    return parseResponse<MenuItem[]>(response, `Failed to fetch all menu items: ${response.statusText}`);
  },

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

  async createCategory(payload: CreateCategoryRequest): Promise<MenuCategory> {
    const response = await fetch(`${API_BASE_URL}/v1/menu/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getOptionalAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    return parseResponse<MenuCategory>(response, `Failed to create category: ${response.statusText}`);
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
  },

  async createMenuItem(payload: CreateMenuItemRequest): Promise<MenuItem> {
    const response = await fetch(`${API_BASE_URL}/v1/menu/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getOptionalAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    return parseResponse<MenuItem>(response, `Failed to create menu item: ${response.statusText}`);
  },

  async updateMenuItem(id: number, payload: UpdateMenuItemRequest): Promise<MenuItem> {
    const response = await fetch(`${API_BASE_URL}/v1/menu/items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getOptionalAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    return parseResponse<MenuItem>(response, `Failed to update menu item: ${response.statusText}`);
  },

  async deleteMenuItem(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/v1/menu/items/${id}`, {
      method: 'DELETE',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to delete menu item: ${response.statusText}`);
    }
  },

  async uploadMenuItemImage(id: number, imageFile: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/v1/menu/items/${id}/upload-image`, {
      method: 'POST',
      headers: {
        ...getOptionalAuthHeader(),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to upload image: ${response.statusText}`);
    }

    return response.text();
  },

  async deleteMenuItemImage(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/v1/menu/items/${id}/delete-image`, {
      method: 'DELETE',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to delete image: ${response.statusText}`);
    }
  },
};
