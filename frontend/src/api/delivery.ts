import { API_BASE_URL, getOptionalAuthHeader } from './auth';

export interface DeliveryAgentDTO {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
  isVerified?: boolean;
  isActive?: boolean;
  isOnline?: boolean;
  currentLatitude?: number;
  currentLongitude?: number;
  totalDeliveries?: number;
  averageRating?: number;
  createdAt?: string;
}

export interface LocationUpdateDTO {
  orderId: number;
  latitude: number;
  longitude: number;
  accuracy?: string;
  address?: string;
  status?: string;
}

export interface ResolvedDeliveryAgent {
  agent: DeliveryAgentDTO;
  agentId: number;
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
  if (response.headers.get('content-length') === '0') {
    return undefined as T;
  }
  return response.json() as Promise<T>;
};

export const deliveryService = {
  getAgent(agentId: number) {
    return request<DeliveryAgentDTO>(`${API_BASE_URL}/v1/delivery/agents/${agentId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  getAgentByUserId(userId: number) {
    return request<DeliveryAgentDTO>(`${API_BASE_URL}/v1/delivery/agents/user/${userId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  toggleAvailability(agentId: number, isOnline: boolean) {
    return request<void>(`${API_BASE_URL}/v1/delivery/agents/${agentId}/availability?isOnline=${isOnline}`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  updateLocation(agentId: number, payload: LocationUpdateDTO) {
    return request<void>(`${API_BASE_URL}/v1/delivery/agents/${agentId}/location`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getOptionalAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
  },

  markPickedUp(agentId: number, orderId: number) {
    return request<void>(`${API_BASE_URL}/v1/delivery/agents/${agentId}/orders/${orderId}/pickup`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  markDelivered(agentId: number, orderId: number) {
    return request<void>(`${API_BASE_URL}/v1/delivery/agents/${agentId}/orders/${orderId}/deliver`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  getAgentEarnings(agentId: number) {
    return request<DeliveryAgentDTO>(`${API_BASE_URL}/v1/delivery/agents/${agentId}/earnings`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  async resolveAgentForUser(userId: number): Promise<ResolvedDeliveryAgent> {
    const agent = await deliveryService.getAgentByUserId(userId);

    return {
      agent,
      agentId: agent.id,
    };
  },
};
