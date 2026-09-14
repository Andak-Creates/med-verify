import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const TOKEN_STORAGE_KEY = 'medverify_token';

// expo-secure-store has no web implementation — fall back to localStorage there.
const isWeb = Platform.OS === 'web';

// In-memory cache so the request interceptor doesn't hit secure storage on
// every API call.
let cachedToken: string | null | undefined;

type SessionExpiredListener = () => void;
const sessionExpiredListeners = new Set<SessionExpiredListener>();

export async function getToken(): Promise<string | null> {
  if (cachedToken !== undefined) return cachedToken;
  if (isWeb) {
    cachedToken =
      typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
  } else {
    cachedToken = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
  }
  return cachedToken;
}

export async function setToken(value: string): Promise<void> {
  cachedToken = value;
  if (isWeb) {
    if (typeof localStorage !== 'undefined') localStorage.setItem(TOKEN_STORAGE_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, value);
}

export async function clearToken(): Promise<void> {
  cachedToken = null;
  if (isWeb) {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(TOKEN_STORAGE_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
}

/**
 * Called by the API client when the backend answers 401 for an authenticated
 * request (expired/revoked JWT). AuthContext subscribes to reset the session.
 */
export function onSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener);
  return () => sessionExpiredListeners.delete(listener);
}

export function notifySessionExpired(): void {
  sessionExpiredListeners.forEach((listener) => listener());
}
