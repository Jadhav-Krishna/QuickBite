import { API_BASE_URL } from './auth';

const CURRENT_LOCATION_CACHE_KEY = 'quickbite:last-browser-location';
let inFlightLocationRequest: Promise<{ latitude: number; longitude: number }> | null = null;

export interface AddressDTO {
  id: number;
  userId: number;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export interface CreateAddressRequest {
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  label?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const addressService = {
  async getAllAddresses(): Promise<AddressDTO[]> {
    const response = await fetch(`${API_BASE_URL}/v1/auth/addresses`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch addresses');
    return response.json();
  },

  async createAddress(request: CreateAddressRequest): Promise<AddressDTO> {
    const response = await fetch(`${API_BASE_URL}/v1/auth/addresses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to create address');
    return response.json();
  },

  async updateAddress(id: number, request: UpdateAddressRequest): Promise<AddressDTO> {
    const response = await fetch(`${API_BASE_URL}/v1/auth/addresses/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to update address');
    return response.json();
  },

  async deleteAddress(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/v1/auth/addresses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete address');
  },

  async setDefaultAddress(id: number): Promise<AddressDTO> {
    const response = await fetch(`${API_BASE_URL}/v1/auth/addresses/${id}/default`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to set default address');
    return response.json();
  },

  async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/v1/auth/addresses/geocode?address=${encodeURIComponent(address)}`,
        {
          headers: {
            Accept: 'application/json',
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to geocode address');
      
      const data = await response.json();
      const latitude = Number(data.latitude);
      const longitude = Number(data.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error('Address not found');
      }
      
      return {
        latitude,
        longitude,
      };
    } catch (error) {
      throw new Error('Unable to find coordinates for this address. Address will be saved without location.');
    }
  },

  async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    if (inFlightLocationRequest) {
      return inFlightLocationRequest;
    }

    inFlightLocationRequest = new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        inFlightLocationRequest = null;
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          console.log(`Latitude: ${coords.latitude}, Longitude: ${coords.longitude}`);
          localStorage.setItem(CURRENT_LOCATION_CACHE_KEY, JSON.stringify({
            ...coords,
            updatedAt: new Date().toISOString(),
          }));
          inFlightLocationRequest = null;
          resolve(coords);
        },
        (error) => {
          const cached = getCachedCurrentLocation();
          inFlightLocationRequest = null;
          if (cached) {
            resolve(cached);
            return;
          }
          reject(new Error(getGeolocationErrorMessage(error)));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000,
        }
      );
    });

    return inFlightLocationRequest;
  },

  async reverseGeocode(latitude: number, longitude: number): Promise<{
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/v1/auth/addresses/reverse-geocode?latitude=${latitude}&longitude=${longitude}`,
        {
          headers: {
            Accept: 'application/json',
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to reverse geocode');
      
      const data = await response.json();

      return {
        addressLine1: data.addressLine1 || data.displayName?.split(',')[0] || 'Address not found',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
      };
    } catch (error) {
      throw new Error('Unable to convert location to address. Please enter manually.');
    }
  },
};

const getCachedCurrentLocation = (): { latitude: number; longitude: number } | null => {
  try {
    const raw = localStorage.getItem(CURRENT_LOCATION_CACHE_KEY);
    if (!raw) return null;

    const cached = JSON.parse(raw) as { latitude?: unknown; longitude?: unknown; updatedAt?: string };
    const latitude = Number(cached.latitude);
    const longitude = Number(cached.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

    const updatedAt = cached.updatedAt ? new Date(cached.updatedAt).getTime() : 0;
    const cacheAgeMs = Date.now() - updatedAt;
    if (cacheAgeMs > 10 * 60 * 1000) return null;

    return { latitude, longitude };
  } catch {
    return null;
  }
};

const getGeolocationErrorMessage = (error: GeolocationPositionError) => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location permission denied. Please allow location access in your browser.';
    case error.POSITION_UNAVAILABLE:
      return 'Your current location is unavailable. Please try again or enter the address manually.';
    case error.TIMEOUT:
      return 'Location detection timed out. Please try again.';
    default:
      return error.message || 'Unable to detect location. Please enter address manually.';
  }
};
