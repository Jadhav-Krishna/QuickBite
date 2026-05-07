import { API_BASE_URL } from './auth';

const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

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
        `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(address)}&format=json&limit=1`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to geocode address');
      
      const data = await response.json();
      if (!data || data.length === 0) {
        throw new Error('Address not found');
      }
      
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    } catch (error) {
      throw new Error('Unable to find coordinates for this address. Address will be saved without location.');
    }
  },

  async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        async (_error) => {
          try {
            const response = await fetch(`https://us1.locationiq.com/v1/balance?key=${LOCATIONIQ_API_KEY}`);
            
            if (!response.ok) {
              throw new Error('LocationIQ request failed');
            }
            
            const ipResponse = await fetch('https://ipapi.co/json/');
            if (!ipResponse.ok) {
              throw new Error('IP geolocation failed');
            }
            
            const ipData = await ipResponse.json();
            
            if (ipData.latitude && ipData.longitude) {
              resolve({
                latitude: parseFloat(ipData.latitude),
                longitude: parseFloat(ipData.longitude),
              });
            } else {
              reject(new Error('Unable to detect location. Please enter address manually.'));
            }
          } catch (err) {
            reject(new Error('Unable to detect location. Please enter address manually.'));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  },

  async reverseGeocode(latitude: number, longitude: number): Promise<{
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
  }> {
    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_API_KEY}&lat=${latitude}&lon=${longitude}&format=json`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to reverse geocode');
      
      const data = await response.json();
      const addr = data.address || {};
      
      const addressParts = [
        addr.house_number,
        addr.road || addr.street,
        addr.neighbourhood || addr.suburb || addr.quarter
      ].filter(Boolean);
      
      return {
        addressLine1: addressParts.join(', ') || data.display_name?.split(',')[0] || 'Address not found',
        city: addr.city || addr.town || addr.village || addr.municipality || '',
        state: addr.state || addr.province || '',
        pincode: addr.postcode || '',
      };
    } catch (error) {
      throw new Error('Unable to convert location to address. Please enter manually.');
    }
  },
};
