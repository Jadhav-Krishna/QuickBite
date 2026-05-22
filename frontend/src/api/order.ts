import { API_BASE_URL, getOptionalAuthHeader } from './auth';

export interface OrderItemDTO {
  id?: number;
  menuItemId: number;
  itemName: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface CreateOrderRequest {
  customerId: number;
  restaurantId: number;
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  customerPhone: string;
  specialInstructions?: string;
  paymentMethod: 'CASH_ON_DELIVERY' | 'ONLINE' | 'CARD';
  items: OrderItemDTO[];
  totalAmount?: number;
  deliveryCharge?: number;
  discountAmount?: number;
  finalAmount?: number;
}

export interface OrderDTO {
  id: number;
  orderNumber: string;
  customerId: number;
  restaurantId: number;
  status: string;
  totalAmount: number;
  deliveryCharge: number;
  discountAmount?: number;
  finalAmount: number;
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  customerPhone: string;
  specialInstructions?: string;
  deliveryAgentId?: number;
  restaurantPickupConfirmed?: boolean;
  restaurantPickupConfirmedAt?: string;
  agentPickupConfirmed?: boolean;
  agentPickupConfirmedAt?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentCompleted?: boolean;
  items: OrderItemDTO[];
  createdAt: string;
  updatedAt?: string;
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
  async createOrder(request: CreateOrderRequest): Promise<OrderDTO> {
    const response = await fetch(`${API_BASE_URL}/v1/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getOptionalAuthHeader(),
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
  },

  async getCustomerOrders(customerId: number): Promise<OrderDTO[]> {
    return request<OrderDTO[]>(`${API_BASE_URL}/v1/orders/customer/${customerId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  async getRestaurantOrders(restaurantId: number): Promise<OrderDTO[]> {
    return request<OrderDTO[]>(`${API_BASE_URL}/v1/orders/restaurant/${restaurantId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  async getOrder(orderNumber: string): Promise<OrderDTO> {
    return request<OrderDTO>(`${API_BASE_URL}/v1/orders/${orderNumber}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  async confirmOrder(orderNumber: string): Promise<OrderDTO> {
    return request<OrderDTO>(`${API_BASE_URL}/v1/orders/${orderNumber}/confirm`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  async updateOrderStatus(orderNumber: string, status: string): Promise<OrderDTO> {
    return request<OrderDTO>(`${API_BASE_URL}/v1/orders/${orderNumber}/status?status=${status}`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  async cancelOrder(orderNumber: string, reason?: string): Promise<OrderDTO> {
    const url = reason 
      ? `${API_BASE_URL}/v1/orders/${orderNumber}/cancel?reason=${encodeURIComponent(reason)}`
      : `${API_BASE_URL}/v1/orders/${orderNumber}/cancel`;
    return request<OrderDTO>(url, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  async assignDeliveryAgent(orderNumber: string, deliveryAgentId: number): Promise<OrderDTO> {
    return request<OrderDTO>(`${API_BASE_URL}/v1/orders/${orderNumber}/assign-delivery?deliveryAgentId=${deliveryAgentId}`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  async confirmRestaurantPickup(orderNumber: string): Promise<OrderDTO> {
    return request<OrderDTO>(`${API_BASE_URL}/v1/orders/${orderNumber}/pickup/restaurant-confirm`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  async confirmAgentPickup(orderNumber: string, deliveryAgentId: number): Promise<OrderDTO> {
    return request<OrderDTO>(`${API_BASE_URL}/v1/orders/${orderNumber}/pickup/agent-confirm?deliveryAgentId=${deliveryAgentId}`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  async getDeliveryAgentOrders(agentId: number): Promise<OrderDTO[]> {
    return request<OrderDTO[]>(`${API_BASE_URL}/v1/orders/delivery-agent/${agentId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  async getAvailableOrdersForDelivery(): Promise<OrderDTO[]> {
    return request<OrderDTO[]>(`${API_BASE_URL}/v1/orders/delivery/available`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  async getAgentOrders(agentId: number): Promise<OrderDTO[]> {
    return request<OrderDTO[]>(`${API_BASE_URL}/v1/orders/delivery-agent/${agentId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  async getAvailableOrders(): Promise<OrderDTO[]> {
    return request<OrderDTO[]>(`${API_BASE_URL}/v1/orders/delivery/available`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  async claimOrder(orderNumber: string, agentId: number): Promise<OrderDTO> {
    return request<OrderDTO>(`${API_BASE_URL}/v1/orders/${orderNumber}/assign-delivery?deliveryAgentId=${agentId}`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  async confirmPickupByAgent(orderNumber: string, agentId: number): Promise<OrderDTO> {
    return request<OrderDTO>(`${API_BASE_URL}/v1/orders/${orderNumber}/pickup/agent-confirm?deliveryAgentId=${agentId}`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },
};
