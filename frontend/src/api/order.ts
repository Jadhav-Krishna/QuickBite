import { API_BASE_URL, getOptionalAuthHeader } from './auth';
export interface OrderItemDTO {
  id?: number;
  menuItemId: number;
  itemName: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}
export interface OrderDTO {
  id: number;
  orderNumber: string;
  customerId: number;
  restaurantId: number;
  status: string;
  totalAmount: number;
  deliveryCharge: number;
  discountAmount: number;
  finalAmount: number;
  deliveryAddress: string;
  customerPhone: string;
  specialInstructions?: string;
  deliveryAgentId?: number;
  estimatedDeliveryTime?: string;
  paymentMethod: string;
  paymentStatus?: string;
  paymentCompleted?: boolean;
  items: OrderItemDTO[];
  createdAt?: string;
  updatedAt?: string;
}
export interface PlaceOrderRequest {
  customerId: number;
  restaurantId: number;
  deliveryAddress: string;
  customerPhone: string;
  specialInstructions?: string;
  paymentMethod: string;
  items: OrderItemDTO[];
  totalAmount: number;
  deliveryCharge: number;
  discountAmount: number;
  finalAmount: number;
}

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
};
export const orderService = {
  placeOrder(payload: PlaceOrderRequest) {
    return request<OrderDTO>(`${API_BASE_URL}/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getOptionalAuthHeader() },
      body: JSON.stringify(payload),
    });
  },
  getOrder(orderNumber: string) {
    return request<OrderDTO>(`${API_BASE_URL}/v1/orders/${orderNumber}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },
  getCustomerOrders(customerId: number) {
    return request<OrderDTO[]>(`${API_BASE_URL}/v1/orders/customer/${customerId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  getRestaurantOrders(restaurantId: number) {
    return request<OrderDTO[]>(`${API_BASE_URL}/v1/orders/restaurant/${restaurantId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  getAgentOrders(agentId: number) {
    return request<OrderDTO[]>(`${API_BASE_URL}/v1/orders/delivery-agent/${agentId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  getAvailableOrders() {
    return request<OrderDTO[]>(`${API_BASE_URL}/v1/orders/available`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  updateOrderStatus(orderNumber: string, status: string) {
    return request<OrderDTO>(`${API_BASE_URL}/v1/orders/${orderNumber}/status?status=${encodeURIComponent(status)}`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  confirmOrder(orderNumber: string) {
    return request<OrderDTO>(`${API_BASE_URL}/v1/orders/${orderNumber}/confirm`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  assignDeliveryAgent(orderNumber: string, deliveryAgentId: number) {
    return request<OrderDTO>(`${API_BASE_URL}/v1/orders/${orderNumber}/assign-delivery?deliveryAgentId=${deliveryAgentId}`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  claimOrder(orderNumber: string, deliveryAgentId: number) {
    return request<OrderDTO>(`${API_BASE_URL}/v1/orders/${orderNumber}/assign-delivery?deliveryAgentId=${deliveryAgentId}`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  cancelOrder(orderNumber: string, reason?: string) {
    const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return request<OrderDTO>(`${API_BASE_URL}/v1/orders/${orderNumber}/cancel${query}`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },
};
