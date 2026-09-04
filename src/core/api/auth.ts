import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useErrorStore, parseErrorMessage } from '../store/errorStore'

// Types
interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  is_superuser: boolean;
  role: 'admin' | 'staff';
  staff_name: string | null;
  staff_position: string | null;
  
  // Legacy fields kept as optional to avoid breaking existing UI
  name?: string;
  phone_number?: string;
  has_active_shift?: boolean;
  is_mobile_user?: boolean;
  can_view_quantity?: boolean;
  store_read?: {
    name: string;
    address: string;
  };
}

export interface TokenResponse {
  access: string;
  refresh: string;
  user: User;
}

// Constants
const getBaseURL = (): string => {
  return 'https://zen-coffee.uz/api/admin/';
};
const TOKEN_ENDPOINT = 'auth/login/';
const REFRESH_ENDPOINT = 'auth/refresh/';
const ME_ENDPOINT = 'auth/me/';

// Local storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// API client
const authApi = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add error interceptor to authApi
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't show error modal for 401 — the main api interceptor handles logout
    if (error.response?.status === 401) {
      return Promise.reject(error);
    }
    const errorMessage = parseErrorMessage(error.response?.data);
    useErrorStore.getState().setError(errorMessage);
    return Promise.reject(error);
  },
);

// Helper functions
const getAccessToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY);
const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY);
const setTokens = (access: string, refresh?: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  }
};
const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Export getAccessToken for use in api.ts
export { getAccessToken };

// Auth functions
export const login = async (credentials: LoginCredentials): Promise<TokenResponse> => {
  const response = await authApi.post<TokenResponse>(TOKEN_ENDPOINT, {
    username: credentials.username,
    password: credentials.password,
  });
  setTokens(response.data.access, response.data.refresh);
  return response.data;
};

export const refreshToken = async (): Promise<string> => {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('No refresh token available');

  const response = await authApi.post<{ access: string }>(REFRESH_ENDPOINT, { refresh });
  localStorage.setItem(ACCESS_TOKEN_KEY, response.data.access);
  return response.data.access;
};


export const logout = (): void => {
  clearTokens();
};

export const getCurrentUser = async (): Promise<User> => {
  const token = getAccessToken();
  if (!token) throw new Error('No access token available');

  const response = await authApi.get<User>(ME_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// React Query hooks
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.clear();
    },
  });
};


export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    enabled: !!getAccessToken(),
    retry: false,
  });
};

// Auth state
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

export default authApi;
