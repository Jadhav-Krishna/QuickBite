export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface AuthResponse {
  userId: number;
  email: string;
  fullName: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type SignupRole = 'CUSTOMER' | 'RESTAURANT_OWNER' | 'DELIVERY_AGENT' | string;

export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: SignupRole;
  restaurantName?: string;
  restaurantAddress?: string;
}

export interface UserProfile {
  userId: number;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  profilePictureUrl?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  oauthProvider?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface UserDTO {
  userId: number;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  profilePictureUrl?: string;
  isActive: boolean;
  isEmailVerified?: boolean;
  oauthProvider?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  profilePictureUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ApiMessage {
  message: string;
}

interface ApiErrorResponse {
  message?: string;
  fieldErrors?: Record<string, string>;
}

const parseErrorMessage = async (response: Response, fallback: string) => {
  let errorData: ApiErrorResponse | null = null;

  try {
    errorData = (await response.json()) as ApiErrorResponse;
  } catch {
    throw new Error(`${fallback} (status ${response.status})`);
  }

  if (errorData.fieldErrors && Object.keys(errorData.fieldErrors).length > 0) {
    const firstFieldError = Object.values(errorData.fieldErrors)[0];
    throw new Error(firstFieldError || fallback);
  }

  throw new Error(errorData.message || fallback);
};

export const getAuthHeader = () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('Your session has expired. Please log in again.');
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
};

export const getOptionalAuthHeader = (): Record<string, string> => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
};

const requestJson = async <T>(
  path: string,
  init: RequestInit,
  fallbackError: string,
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, init);

  if (!response.ok) {
    await parseErrorMessage(response, fallbackError);
  }

  return response.json() as Promise<T>;
};

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    return requestJson<AuthResponse>(
      '/auth/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email.trim(),
          password: data.password,
        }),
      },
      'Invalid credentials or login failed.',
    );
  },

  async signup(data: SignupRequest): Promise<AuthResponse> {
    return requestJson<AuthResponse>(
      '/auth/signup',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email.trim(),
          password: data.password,
          fullName: data.fullName.trim(),
          phone: data.phone?.trim() || undefined,
          role: data.role,
          restaurantName: data.restaurantName?.trim() || undefined,
          restaurantAddress: data.restaurantAddress?.trim() || undefined,
        }),
      },
      'Registration failed. Please try again.',
    );
  },

  async getProfile(): Promise<UserProfile> {
    return requestJson<UserProfile>(
      '/auth/profile',
      {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
        },
      },
      'Unable to fetch profile.',
    );
  },

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return requestJson<UserProfile>(
      '/auth/profile',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          fullName: data.fullName?.trim() || undefined,
          phone: data.phone?.trim() || undefined,
          profilePictureUrl: data.profilePictureUrl?.trim() || undefined,
        }),
      },
      'Unable to update profile.',
    );
  },

  async changePassword(data: ChangePasswordRequest): Promise<ApiMessage> {
    return requestJson<ApiMessage>(
      '/auth/password',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      },
      'Unable to change password.',
    );
  },

  async validateToken(): Promise<{ valid: boolean }> {
    return requestJson<{ valid: boolean }>(
      '/auth/validate',
      {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
        },
      },
      'Session validation failed.',
    );
  },

  async getAllUsers(): Promise<UserDTO[]> {
    return requestJson<UserDTO[]>(
      '/auth/users',
      {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
        },
      },
      'Unable to fetch users.',
    );
  },

  async getUsersByRole(role: string): Promise<UserDTO[]> {
    return requestJson<UserDTO[]>(
      `/auth/users/role/${encodeURIComponent(role)}`,
      {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
        },
      },
      'Unable to fetch users by role.',
    );
  },

  async getUserById(userId: number): Promise<UserDTO> {
    return requestJson<UserDTO>(
      `/auth/user/${userId}`,
      {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
        },
      },
      'Unable to fetch user.',
    );
  },

  async suspendUser(userId: number): Promise<{ message: string }> {
    return requestJson<{ message: string }>(
      `/auth/users/${userId}/suspend`,
      {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
        },
      },
      'Unable to suspend user.',
    );
  },

  async reactivateUser(userId: number): Promise<{ message: string }> {
    return requestJson<{ message: string }>(
      `/auth/users/${userId}/reactivate`,
      {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
        },
      },
      'Unable to reactivate user.',
    );
  },

  async deleteUser(userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      await parseErrorMessage(response, 'Unable to delete user.');
    }
  },

  async logoutFromServer(): Promise<void> {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch {
      // Logout should still clear local session even if server call fails.
    }
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }
};
