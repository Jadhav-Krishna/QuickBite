import { API_BASE_URL, getAuthHeader } from '../api/auth';

export interface LocationUpdate {
  agentId: number;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  orderId?: number;
}

export interface Address {
  id?: number;
  userId: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  geohash?: string;
  isDefault?: boolean;
}

export interface NearbyAgent {
  agentId: number;
  latitude: number;
  longitude: number;
  distanceKm: number;
  estimatedTimeMinutes: number;
  isOnline: boolean;
  heading?: number;
  speed?: number;
}

export interface RouteRequest {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
}

export interface RouteResponse {
  distanceKm: number;
  durationMinutes: number;
  geometry: [number, number][];
}

export interface MultiRouteRequest {
  agentLat: number;
  agentLng: number;
  restaurantLat: number;
  restaurantLng: number;
  customerLat: number;
  customerLng: number;
}

export interface RouteSegment {
  distanceKm: number;
  durationMinutes: number;
  geometry: [number, number][];
  color: string;
}

export interface MultiRouteResponse {
  agentToRestaurant: RouteSegment;
  restaurantToCustomer: RouteSegment;
  totalDistanceKm: number;
  totalDurationMinutes: number;
}

const LOCATION_SERVICE_URL = `${API_BASE_URL}/v1/location`;
const ROUTING_SERVICE_URL = `${API_BASE_URL}/v1/routing`;

export const locationService = {
  // Address Management
  async saveAddress(address: Address): Promise<Address> {
    const response = await fetch(`${LOCATION_SERVICE_URL}/address`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(address),
    });
    if (!response.ok) throw new Error('Failed to save address');
    return response.json();
  },

  async getUserAddresses(userId: number): Promise<Address[]> {
    const response = await fetch(`${LOCATION_SERVICE_URL}/address/user/${userId}`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Failed to fetch addresses');
    return response.json();
  },

  async getDefaultAddress(userId: number): Promise<Address | null> {
    const response = await fetch(`${LOCATION_SERVICE_URL}/address/user/${userId}/default`, {
      headers: getAuthHeader(),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch default address');
    return response.json();
  },

  // Agent Location
  async updateAgentLocation(location: LocationUpdate): Promise<void> {
    const response = await fetch(`${LOCATION_SERVICE_URL}/agent/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(location),
    });
    if (!response.ok) throw new Error('Failed to update location');
  },

  async getAgentLocation(agentId: number): Promise<LocationUpdate> {
    const response = await fetch(`${LOCATION_SERVICE_URL}/agent/${agentId}`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Failed to fetch agent location');
    return response.json();
  },

  async markAgentOffline(agentId: number): Promise<void> {
    const response = await fetch(`${LOCATION_SERVICE_URL}/agent/${agentId}/offline`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Failed to mark agent offline');
  },

  async findNearbyAgents(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<NearbyAgent[]> {
    const response = await fetch(
      `${LOCATION_SERVICE_URL}/agent/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`,
      {
        headers: getAuthHeader(),
      }
    );
    if (!response.ok) throw new Error('Failed to find nearby agents');
    return response.json();
  },

  // Routing
  async getRoute(request: RouteRequest): Promise<RouteResponse> {
    const response = await fetch(`${ROUTING_SERVICE_URL}/route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to get route');
    return response.json();
  },

  async getMultiRoute(request: MultiRouteRequest): Promise<MultiRouteResponse> {
    const response = await fetch(`${ROUTING_SERVICE_URL}/multi-route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to get multi-route');
    return response.json();
  },
};

// Geolocation utilities
export const geolocationUtils = {
  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });
  },

  watchPosition(
    callback: (position: GeolocationPosition) => void,
    errorCallback?: (error: GeolocationPositionError) => void
  ): number {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported');
    }

    return navigator.geolocation.watchPosition(callback, errorCallback, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  },

  clearWatch(watchId: number): void {
    navigator.geolocation.clearWatch(watchId);
  },

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    // Using Nominatim (OpenStreetMap) for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    if (!response.ok) throw new Error('Failed to reverse geocode');
    const data = await response.json();
    return data.display_name;
  },
};
