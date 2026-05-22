import { addressService } from '../../api/address';
import { API_BASE_URL, getAuthHeader, getOptionalAuthHeader } from '../../api/auth';

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

const ADDRESS_SERVICE_URL = `${API_BASE_URL}/v1/auth/addresses`;
const DELIVERY_SERVICE_URL = `${API_BASE_URL}/v1/delivery`;

export const locationService = {
  // Address Management
  async saveAddress(address: Address): Promise<Address> {
    const response = await fetch(ADDRESS_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        label: address.isDefault ? 'Default' : 'Saved',
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        latitude: address.latitude,
        longitude: address.longitude,
        isDefault: address.isDefault,
      }),
    });
    if (!response.ok) throw new Error('Failed to save address');
    return response.json();
  },

  async getUserAddresses(_userId: number): Promise<Address[]> {
    const response = await fetch(ADDRESS_SERVICE_URL, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Failed to fetch addresses');
    return response.json();
  },

  async getDefaultAddress(_userId: number): Promise<Address | null> {
    const addresses = await this.getUserAddresses(_userId);
    return addresses.find((address) => address.isDefault) || null;
  },

  // Agent Location
  async updateAgentLocation(location: LocationUpdate): Promise<void> {
    const response = await fetch(`${DELIVERY_SERVICE_URL}/agents/${location.agentId}/location`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getOptionalAuthHeader(),
      },
      body: JSON.stringify({
        orderId: location.orderId ?? 0,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy?.toString(),
        address: location.orderId ? 'Live GPS update' : 'Current agent location',
        status: location.orderId ? 'IN_TRANSIT' : 'ONLINE',
      }),
    });
    if (!response.ok) throw new Error('Failed to update location');
  },

  async getAgentLocation(agentId: number): Promise<LocationUpdate> {
    const response = await fetch(`${DELIVERY_SERVICE_URL}/agents/${agentId}`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Failed to fetch agent location');
    const agent = await response.json();
    return {
      agentId,
      latitude: agent.currentLatitude || 0,
      longitude: agent.currentLongitude || 0,
    };
  },

  async markAgentOffline(agentId: number): Promise<void> {
    const response = await fetch(`${DELIVERY_SERVICE_URL}/agents/${agentId}/availability?isOnline=false`, {
      method: 'PUT',
      headers: getOptionalAuthHeader(),
    });
    if (!response.ok) throw new Error('Failed to mark agent offline');
  },

  async findNearbyAgents(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<NearbyAgent[]> {
    const response = await fetch(
      `${DELIVERY_SERVICE_URL}/agents/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`,
      {
        headers: getOptionalAuthHeader(),
      }
    );
    if (!response.ok) throw new Error('Failed to find nearby agents');
    return response.json();
  },

  // Routing
  async getRoute(request: RouteRequest): Promise<RouteResponse> {
    const response = await fetch(
      `${DELIVERY_SERVICE_URL}/route?startLon=${request.originLng}&startLat=${request.originLat}&endLon=${request.destLng}&endLat=${request.destLat}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!response.ok) throw new Error('Failed to get route');
    const data = await response.json();
    const route = data.routes?.[0];
    const geometry = route?.geometry?.coordinates?.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]) || [];
    return {
      distanceKm: Number(route?.distance || 0) / 1000,
      durationMinutes: Number(route?.duration || 0) / 60,
      geometry,
    };
  },

  async getMultiRoute(request: MultiRouteRequest): Promise<MultiRouteResponse> {
    const [agentToRestaurant, restaurantToCustomer] = await Promise.all([
      this.getRoute({
        originLat: request.agentLat,
        originLng: request.agentLng,
        destLat: request.restaurantLat,
        destLng: request.restaurantLng,
      }),
      this.getRoute({
        originLat: request.restaurantLat,
        originLng: request.restaurantLng,
        destLat: request.customerLat,
        destLng: request.customerLng,
      }),
    ]);

    return {
      agentToRestaurant: { ...agentToRestaurant, color: '#2563eb' },
      restaurantToCustomer: { ...restaurantToCustomer, color: '#f97316' },
      totalDistanceKm: agentToRestaurant.distanceKm + restaurantToCustomer.distanceKm,
      totalDurationMinutes: agentToRestaurant.durationMinutes + restaurantToCustomer.durationMinutes,
    };
  },
};

// Geolocation utilities
export const geolocationUtils = {
  getCurrentPosition(): Promise<GeolocationPosition> {
    return addressService.getCurrentLocation().then((coords) => ({
      coords: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: 0,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        toJSON: () => ({}),
      },
      timestamp: Date.now(),
      toJSON: () => ({}),
    } as GeolocationPosition));
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
    const address = await addressService.reverseGeocode(lat, lng);
    return [address.addressLine1, address.city, address.state, address.pincode]
      .filter(Boolean)
      .join(', ');
  },
};
