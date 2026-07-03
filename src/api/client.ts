import axios, { AxiosError } from 'axios';
import { Platform } from 'react-native';
import type { ApiErrorBody } from '@/types/api';
import { clearToken, getToken, notifySessionExpired } from './tokenManager';

// Configure via EXPO_PUBLIC_API_URL (set in .env for local dev, eas.json for builds).
const DEV_FALLBACK_URL = 'https://med-verify-backend.onrender.com';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? DEV_FALLBACK_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    // A 401 on an authenticated request means the JWT expired or was revoked.
    // Clear the session and let AuthContext route back to login. Auth
    // endpoints themselves (wrong password etc.) also return 401 but carry no
    // Authorization header, so they are not affected.
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      await clearToken();
      notifySessionExpired();
    }
    return Promise.reject(error);
  },
);

/**
 * Maps any thrown error to a user-facing message: backend-provided message
 * when present, otherwise a network/timeout-specific message, otherwise the
 * fallback.
 */
export function getApiErrorMessage(
  err: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorBody | undefined;
    if (data?.message) return data.message;
    if (err.code === 'ECONNABORTED') {
      return 'The request timed out. Please check your connection and try again.';
    }
    if (!err.response) {
      return 'Could not reach the server. Please check your internet connection.';
    }
  }
  return fallback;
}

export function isUnauthorizedError(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 401;
}
