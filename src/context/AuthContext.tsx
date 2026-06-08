import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { api, TOKEN_STORAGE_KEY } from '../lib/api';
import { getToken, setToken, deleteToken } from '../lib/tokenStorage';

export interface MedVerifyUser {
  id: string;
  email: string;
  fullName: string | null;
  username: string;
  role: 'USER' | 'PHARMACIST';
  authProvider: 'email' | 'google';
  emailVerified: boolean;
  profileImage: string | null;
  bloodGroup: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  createdAt: string;
}

interface AuthContextValue {
  user: MedVerifyUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signup: (email: string, password: string, role: 'USER' | 'PHARMACIST') => Promise<{ email: string; role: string }>;
  resendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<MedVerifyUser>;
  login: (email: string, password: string) => Promise<MedVerifyUser>;
  googleAuth: (idToken: string) => Promise<MedVerifyUser>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<MedVerifyUser | null>;
  updateProfile: (updates: Partial<{
    fullName: string;
    username: string;
    profileImage: string | null;
    bloodGroup: string | null;
    allergies: string | null;
    chronicConditions: string | null;
  }>) => Promise<MedVerifyUser>;
  uploadAvatar: (file: { uri: string; name: string; type: string }) => Promise<MedVerifyUser>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function persistSession(token: string) {
  await setToken(TOKEN_STORAGE_KEY, token);
}

async function clearSession() {
  await deleteToken(TOKEN_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MedVerifyUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedToken = await getToken(TOKEN_STORAGE_KEY);
      if (storedToken) {
        setToken(storedToken);
        try {
          const { data } = await api.get('/users/me');
          setUser(data.data.user);
        } catch {
          await clearSession();
          setToken(null);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const signup: AuthContextValue['signup'] = async (email, password, role) => {
    const { data } = await api.post('/auth/signup', { email, password, role });
    return data.data;
  };

  const resendOtp: AuthContextValue['resendOtp'] = async (email) => {
    await api.post('/auth/resend-otp', { email });
  };

  const verifyOtp: AuthContextValue['verifyOtp'] = async (email, otp) => {
    const { data } = await api.post('/auth/verify-otp', { email, otp });
    await persistSession(data.data.token);
    setToken(data.data.token);
    setUser(data.data.user);
    return data.data.user;
  };

  const login: AuthContextValue['login'] = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    await persistSession(data.data.token);
    setToken(data.data.token);
    setUser(data.data.user);
    return data.data.user;
  };

  const googleAuth: AuthContextValue['googleAuth'] = async (idToken) => {
    const { data } = await api.post('/auth/google', { token: idToken });
    await persistSession(data.data.token);
    setToken(data.data.token);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout: AuthContextValue['logout'] = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Token may already be invalid/expired — proceed with local cleanup regardless.
    }
    await clearSession();
    setToken(null);
    setUser(null);
  };

  const refreshProfile: AuthContextValue['refreshProfile'] = async () => {
    if (!token) return null;
    const { data } = await api.get('/users/me');
    setUser(data.data.user);
    return data.data.user;
  };

  const updateProfile: AuthContextValue['updateProfile'] = async (updates) => {
    const { data } = await api.patch('/users/me', updates);
    setUser(data.data.user);
    return data.data.user;
  };

  const uploadAvatar: AuthContextValue['uploadAvatar'] = async (file) => {
    const formData = new FormData();
    if (Platform.OS === 'web') {
      // Browsers' FormData requires a real Blob/File — the {uri, name, type}
      // shape only works with React Native's native FormData polyfill.
      const blob = await (await fetch(file.uri)).blob();
      formData.append('avatar', blob, file.name);
    } else {
      formData.append('avatar', file as any);
    }
    const { data } = await api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setUser(data.data.user);
    return data.data.user;
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(token),
    signup,
    resendOtp,
    verifyOtp,
    login,
    googleAuth,
    logout,
    refreshProfile,
    updateProfile,
    uploadAvatar,
  }), [user, token, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
