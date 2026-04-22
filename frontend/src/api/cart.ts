import { API_BASE_URL } from './auth';

export interface CartItemDTO {
  id: number;
  menuItemId: number;
  itemName: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface CartDTO {
  id: number;
  customerId: number;
  restaurantId: number;
  items: CartItemDTO[];
  totalPrice: number;
  totalItems: number;
  isActive: boolean;
}

interface AddCartItemRequest {
  menuItemId: number;
  itemName: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
};

export const cartService = {
  getCart(customerId: number) {
    return request<CartDTO>(`${API_BASE_URL}/v1/cart?customerId=${customerId}`);
  },

  addItem(customerId: number, restaurantId: number, item: AddCartItemRequest) {
    return request<CartDTO>(
      `${API_BASE_URL}/v1/cart/items?customerId=${customerId}&restaurantId=${restaurantId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      },
    );
  },

  updateItem(customerId: number, restaurantId: number, itemId: number, quantity: number) {
    return request<CartDTO>(
      `${API_BASE_URL}/v1/cart/items/${itemId}?customerId=${customerId}&restaurantId=${restaurantId}&quantity=${quantity}`,
      {
        method: 'PUT',
      },
    );
  },

  removeItem(customerId: number, restaurantId: number, itemId: number) {
    return request<CartDTO>(
      `${API_BASE_URL}/v1/cart/items/${itemId}?customerId=${customerId}&restaurantId=${restaurantId}`,
      {
        method: 'DELETE',
      },
    );
  },

  clearCart(customerId: number) {
    return request<CartDTO>(`${API_BASE_URL}/v1/cart?customerId=${customerId}`, { method: 'DELETE' });
  },
};