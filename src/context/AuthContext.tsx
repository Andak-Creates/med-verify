import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { clearToken, getToken, onSessionExpired, setToken as persistToken } from '@/api/tokenManager';
import * as authService from '@/services/auth.service';
import * as usersService from '@/services/users.service';
import { registerForPushNotifications } from '@/utils/notifications';
import type {
  AuthSession,
  MedVerifyUser,
  UploadableFile,
  UserProfileUpdates,
  UserRole,
} from '@/types/api';

export type { MedVerifyUser } from '@/types/api';

interface AuthContextValue {
  user: MedVerifyUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // Auth
  signup: (email: string, password: string, role?: UserRole) => Promise<{ email: string; role: string }>;
  resendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<MedVerifyUser>;
  login: (email: string, password: string) => Promise<MedVerifyUser>;
  googleAuth: (idToken: string) => Promise<MedVerifyUser>;
  logout: () => Promise<void>;
  // Profile
  refreshProfile: () => Promise<MedVerifyUser | null>;
  updateProfile: (updates: UserProfileUpdates) => Promise<MedVerifyUser>;
  uploadAvatar: (file: UploadableFile) => Promise<MedVerifyUser>;
  deleteAccount: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MedVerifyUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback(async (session: AuthSession) => {
    await persistToken(session.token);
    setToken(session.token);
    setUser(session.user);
    return session.user;
  }, []);

  const resetSession = useCallback(async () => {
    await clearToken();
    setToken(null);
    setUser(null);
  }, []);

  // Auto-login on app restart: restore the stored JWT and validate it
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await getToken();
        if (storedToken) {
          setToken(storedToken);
          const profile = await usersService.getProfile();
          setUser(profile);
        }
      } catch {
        await resetSession();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [resetSession]);

  // The API client clears the token and notifies on 401
  useEffect(() => {
    return onSessionExpired(() => {
      setToken(null);
      setUser(null);
    });
  }, []);

  // Register for push notifications whenever a session becomes active
  useEffect(() => {
    if (!token) return;
    registerForPushNotifications()
      .then((pushToken) => {
        if (pushToken) return usersService.updatePushToken(pushToken);
      })
      .catch(() => {});
  }, [token]);

  const signup: AuthContextValue['signup'] = useCallback(
    (email, password, role = 'USER') => authService.signup(email, password, role),
    [],
  );

  const resendOtp: AuthContextValue['resendOtp'] = useCallback(
    (email) => authService.resendOtp(email),
    [],
  );

  const verifyOtp: AuthContextValue['verifyOtp'] = useCallback(
    async (email, otp) => applySession(await authService.verifyOtp(email, otp)),
    [applySession],
  );

  const login: AuthContextValue['login'] = useCallback(
    async (email, password) => applySession(await authService.login(email, password)),
    [applySession],
  );

  const googleAuth: AuthContextValue['googleAuth'] = useCallback(
    async (idToken) => applySession(await authService.googleAuth(idToken)),
    [applySession],
  );

  const logout: AuthContextValue['logout'] = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Proceed with local logout even if network fails
    } finally {
      await resetSession();
    }
  }, [resetSession]);

  const refreshProfile: AuthContextValue['refreshProfile'] = useCallback(async () => {
    if (!token) return null;
    const profile = await usersService.getProfile();
    setUser(profile);
    return profile;
  }, [token]);

  const updateProfile: AuthContextValue['updateProfile'] = useCallback(
    async (updates) => {
      const updated = await usersService.updateProfile(updates);
      setUser(updated);
      return updated;
    },
    [],
  );

  const uploadAvatar: AuthContextValue['uploadAvatar'] = useCallback(
    async (file) => {
      const updated = await usersService.uploadAvatar(file);
      setUser(updated);
      return updated;
    },
    [],
  );

  const deleteAccount: AuthContextValue['deleteAccount'] = useCallback(
    async (password) => {
      await usersService.deleteAccount(password);
      await resetSession();
    },
    [resetSession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      signup,
      resendOtp,
      verifyOtp,
      login,
      googleAuth,
      logout,
      refreshProfile,
      updateProfile,
      uploadAvatar,
      deleteAccount,
    }),
    [
      user,
      token,
      isLoading,
      signup,
      resendOtp,
      verifyOtp,
      login,
      googleAuth,
      logout,
      refreshProfile,
      updateProfile,
      uploadAvatar,
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
