import { API_BASE_URL, authService, getOptionalAuthHeader, type UserDTO } from './auth';

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

class ApiRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

const parseIndianPhone = (value: string | undefined, userId: number) => {
  const digitsOnly = (value || '').replace(/\D/g, '');
  let normalized = '';

  if (digitsOnly.length >= 10) {
    normalized = digitsOnly.slice(-10);
  }

  if (!normalized) {
    const suffix = String(Math.abs(userId) % 1_000_000_000).padStart(9, '0');
    return `9${suffix}`;
  }

  if (!/^[6-9]/.test(normalized)) {
    return `9${normalized.slice(1)}`;
  }

  return normalized;
};

const getStoredUser = (): Partial<UserDTO> | null => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as Partial<UserDTO>;
  } catch {
    return null;
  }
};

const buildDefaultAgentPayload = (userId: number, userProfile: Partial<UserDTO>): DeliveryAgentDTO => ({
  id: 0,
  userId,
  fullName: userProfile.fullName || `Delivery Agent ${userId}`,
  phone: parseIndianPhone(userProfile.phone, userId),
  email: userProfile.email || `delivery-agent-${userId}@quickbite.local`,
  vehicleType: 'BIKE',
  vehicleNumber: `TEMP-${userId}`,
  licenseNumber: `PENDING-${userId}`,
});

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  if (!response.ok) {
    const message = await response.text();
    throw new ApiRequestError(
      response.status,
      message || `Request failed with status ${response.status}`,
    );
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
  registerAgent(payload: DeliveryAgentDTO) {
    return request<DeliveryAgentDTO>(`${API_BASE_URL}/v1/delivery/agents/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getOptionalAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
  },

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
    let agent: DeliveryAgentDTO;
    try {
      agent = await deliveryService.getAgentByUserId(userId);
    } catch (error) {
      if (!(error instanceof ApiRequestError) || error.status !== 404) {
        throw error;
      }

      const storedUser = getStoredUser();
      const profile = await authService.getUserById(userId).catch(() => null);
      const fallbackProfile: Partial<UserDTO> = {
        userId,
        email: profile?.email || storedUser?.email || '',
        fullName: profile?.fullName || storedUser?.fullName || '',
        phone: profile?.phone || storedUser?.phone || '',
      };

      try {
        agent = await deliveryService.registerAgent(buildDefaultAgentPayload(userId, fallbackProfile));
      } catch (registrationError) {
        if (
          registrationError instanceof ApiRequestError &&
          (registrationError.status === 409 || registrationError.status === 500)
        ) {
          agent = await deliveryService.getAgentByUserId(userId);
        } else {
          throw registrationError;
        }
      }
    }

    return {
      agent,
      agentId: agent.id,
    };
  },
};
