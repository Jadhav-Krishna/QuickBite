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
  aadharNumber?: string;
  isVerified: boolean;
  isActive: boolean;
  isOnline: boolean;
  currentLatitude?: number;
  currentLongitude?: number;
  totalDeliveries?: number;
  totalEarnings?: number;
  todayEarnings?: number;
  todayDeliveries?: number;
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

export interface RouteResponse {
  routes: Array<{
    geometry: {
      coordinates: number[][];
    };
    distance: number;
    duration: number;
  }>;
}

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
};

export const deliveryService = {
  async getRoute(
    startLon: number,
    startLat: number,
    endLon: number,
    endLat: number
  ): Promise<RouteResponse> {
    const response = await fetch(
      `${API_BASE_URL}/v1/delivery/route?startLon=${startLon}&startLat=${startLat}&endLon=${endLon}&endLat=${endLat}`
    );
    if (!response.ok) throw new Error('Failed to fetch route');
    return response.json();
  },

  getAllAgents(): Promise<DeliveryAgentDTO[]> {
    return request<DeliveryAgentDTO[]>(`${API_BASE_URL}/v1/delivery/agents`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  getAgent(agentId: number): Promise<DeliveryAgentDTO> {
    return request<DeliveryAgentDTO>(`${API_BASE_URL}/v1/delivery/agents/${agentId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  getAgentByUserId(userId: number): Promise<DeliveryAgentDTO> {
    return request<DeliveryAgentDTO>(`${API_BASE_URL}/v1/delivery/agents/user/${userId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  updateAgentAvailability(agentId: number, isOnline: boolean): Promise<void> {
    return request<void>(`${API_BASE_URL}/v1/delivery/agents/${agentId}/availability?isOnline=${isOnline}`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  updateAgentLocation(agentId: number, locationUpdate: LocationUpdateDTO): Promise<void> {
    return request<void>(`${API_BASE_URL}/v1/delivery/agents/${agentId}/location`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getOptionalAuthHeader(),
      },
      body: JSON.stringify(locationUpdate),
    });
  },

  async resolveAgentForUser(userId: number): Promise<{ agentId: number; agent: DeliveryAgentDTO }> {
    const agent = await this.getAgentByUserId(userId);
    return { agentId: agent.id, agent };
  },

  getAgentEarnings(agentId: number): Promise<DeliveryAgentDTO> {
    return request<DeliveryAgentDTO>(`${API_BASE_URL}/v1/delivery/agents/${agentId}/earnings`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  toggleAvailability(agentId: number, isOnline: boolean): Promise<void> {
    return request<void>(`${API_BASE_URL}/v1/delivery/agents/${agentId}/availability?isOnline=${isOnline}`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  markDelivered(agentId: number, orderId: number, orderAmount: number): Promise<void> {
    return request<void>(`${API_BASE_URL}/v1/delivery/agents/${agentId}/orders/${orderId}/deliver?orderAmount=${orderAmount}`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  registerAgent(agentData: Partial<DeliveryAgentDTO>): Promise<DeliveryAgentDTO> {
    return request<DeliveryAgentDTO>(`${API_BASE_URL}/v1/delivery/agents/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getOptionalAuthHeader(),
      },
      body: JSON.stringify(agentData),
    });
  },

  updateAgentProfile(agentId: number, agentData: Partial<DeliveryAgentDTO>): Promise<DeliveryAgentDTO> {
    return request<DeliveryAgentDTO>(`${API_BASE_URL}/v1/delivery/agents/${agentId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getOptionalAuthHeader(),
      },
      body: JSON.stringify(agentData),
    });
  },

  getNearbyAgents(latitude: number, longitude: number, radiusKm: number = 5): Promise<DeliveryAgentDTO[]> {
    return request<DeliveryAgentDTO[]>(`${API_BASE_URL}/v1/delivery/agents/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },
};
