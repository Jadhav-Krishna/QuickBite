import { API_BASE_URL, getAuthHeader } from './auth';

export interface Address {
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
  createdAt?: string;
  updatedAt?: string;
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

const parseErrorMessage = async (response: Response, fallback: string) => {
  try {
    const errorData = await response.json();
    throw new Error(errorData.message || fallback);
  } catch {
    throw new Error(`${fallback} (status ${response.status})`);
  }
};

export const addressService = {
  async getAllAddresses(): Promise<Address[]> {
    const response = await fetch(`${API_BASE_URL}/addresses`, {
      method: 'GET',
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      await parseErrorMessage(response, 'Failed to fetch addresses.');
    }

    return response.json();
  },

  async getAddressById(id: number): Promise<Address> {
    const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'GET',
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      await parseErrorMessage(response, 'Failed to fetch address.');
    }

    return response.json();
  },

  async createAddress(data: CreateAddressRequest): Promise<Address> {
    const response = await fetch(`${API_BASE_URL}/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      await parseErrorMessage(response, 'Failed to create address.');
    }

    return response.json();
  },

  async updateAddress(id: number, data: UpdateAddressRequest): Promise<Address> {
    const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      await parseErrorMessage(response, 'Failed to update address.');
    }

    return response.json();
  },

  async deleteAddress(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      await parseErrorMessage(response, 'Failed to delete address.');
    }
  },

  async setDefaultAddress(id: number): Promise<Address> {
    const response = await fetch(`${API_BASE_URL}/addresses/${id}/default`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      await parseErrorMessage(response, 'Failed to set default address.');
    }

    return response.json();
  },
};

// Geolocation helper
export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
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
      (error) => {
        reject(new Error(`Location error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

// Reverse geocoding (convert lat/lng to address)
export const reverseGeocode = async (latitude: number, longitude: number): Promise<{
  city: string;
  state: string;
  pincode: string;
  addressLine1: string;
}> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'QuickBite-App',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch location details');
    }

    const data = await response.json();
    const address = data.address || {};

    return {
      city: address.city || address.town || address.village || '',
      state: address.state || '',
      pincode: address.postcode || '',
      addressLine1: `${address.road || ''} ${address.suburb || ''}`.trim() || data.display_name,
    };
  } catch (error) {
    throw new Error('Failed to get address from location');
  }
};
