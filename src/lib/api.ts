import axios from 'axios';
import { Platform } from 'react-native';
import { getToken } from './tokenStorage';

// On web, the browser and backend run on the same machine — use localhost so
// requests aren't subject to the browser's Local Network Access / Private
// Network Access restrictions on private LAN IPs (which cause
// net::ERR_NETWORK_ACCESS_DENIED). Native (physical devices/emulators) still
// needs the LAN IP to reach the developer's machine over the network.
export const API_BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:4000'
  : 'http://192.168.100.249:4000';

export const TOKEN_STORAGE_KEY = 'medverify_token';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
}

export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiError | undefined;
    if (data?.message) return data.message;
  }
  return fallback;
}
