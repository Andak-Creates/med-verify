import * as SecureStore from 'expo-secure-store';
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
import * as pharmacistService from '@/services/pharmacist.service';
import * as usersService from '@/services/users.service';
import { disconnectSocket } from '@/sockets/socketManager';
import type {
  AuthSession,
  MedVerifyUser,
  PharmacistStatusInfo,
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
  // User auth
  signup: (email: string, password: string, role: UserRole) => Promise<{ email: string; role: string }>;
  resendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<MedVerifyUser>;
  login: (email: string, password: string) => Promise<MedVerifyUser>;
  googleAuth: (idToken: string) => Promise<MedVerifyUser>;
  logout: () => Promise<void>;
  // Pharmacist staged onboarding (email/password only — Google is blocked)
  pharmacistSignup: (email: string, password: string, phone: string) => Promise<{ email: string }>;
  pharmacistVerifyOtp: (email: string, otp: string) => Promise<MedVerifyUser>;
  pharmacistResendOtp: (email: string) => Promise<void>;
  pharmacistLogin: (email: string, password: string) => Promise<MedVerifyUser>;
  submitPharmacistCredentials: (input: {
    nin: string;
    pcn: string;
    certificate?: UploadableFile;
  }) => Promise<void>;
  getPharmacistStatus: () => Promise<PharmacistStatusInfo>;
  // Profile
  refreshProfile: () => Promise<MedVerifyUser | null>;
  updateProfile: (updates: UserProfileUpdates) => Promise<MedVerifyUser>;
  uploadAvatar: (file: UploadableFile) => Promise<MedVerifyUser>;
  // Local subscription state (no backend support yet)
  isPro: boolean;
  scanCount: number;
  incrementScanCount: () => void;
  subscribeToPro: () => void;
  unsubscribeFromPro: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MedVerifyUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  // Load persisted scan count on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync('medverify_scan_count');
        if (stored) setScanCount(parseInt(stored, 10));
      } catch {
        // Ignore — start from 0 if storage fails
      }
    })();
  }, []);

  const applySession = useCallback(async (session: AuthSession) => {
    await persistToken(session.token);
    setToken(session.token);
    setUser(session.user);
    return session.user;
  }, []);

  const resetSession = useCallback(async () => {
    disconnectSocket();
    await clearToken();
    setToken(null);
    setUser(null);
  }, []);

  // Auto-login on app restart: restore the stored JWT and validate it against
  // the backend. An invalid/expired token clears the session.
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

  // The API client clears the token and notifies on 401 (expired/revoked JWT).
  useEffect(() => {
    return onSessionExpired(() => {
      disconnectSocket();
      setToken(null);
      setUser(null);
    });
  }, []);

  const signup: AuthContextValue['signup'] = useCallback(
    (email, password, role) => authService.signup(email, password, role),
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
      // Token may already be invalid/expired — proceed with local cleanup regardless.
    }
    await resetSession();
  }, [resetSession]);

  const pharmacistSignup: AuthContextValue['pharmacistSignup'] = useCallback(
    (email, password, phone) => pharmacistService.signup(email, password, phone),
    [],
  );

  const pharmacistVerifyOtp: AuthContextValue['pharmacistVerifyOtp'] = useCallback(
    async (email, otp) => applySession(await pharmacistService.verifyOtp(email, otp)),
    [applySession],
  );

  const pharmacistResendOtp: AuthContextValue['pharmacistResendOtp'] = useCallback(
    (email) => pharmacistService.resendOtp(email),
    [],
  );

  const pharmacistLogin: AuthContextValue['pharmacistLogin'] = useCallback(
    async (email, password) => applySession(await pharmacistService.login(email, password)),
    [applySession],
  );

  const submitPharmacistCredentials: AuthContextValue['submitPharmacistCredentials'] =
    useCallback((input) => pharmacistService.submitCredentials(input), []);

  const getPharmacistStatus: AuthContextValue['getPharmacistStatus'] = useCallback(
    () => pharmacistService.getStatus(),
    [],
  );

  const refreshProfile: AuthContextValue['refreshProfile'] = useCallback(async () => {
    if (!token) return null;
    const profile = await usersService.getProfile();
    setUser(profile);
    return profile;
  }, [token]);

  const updateProfile: AuthContextValue['updateProfile'] = useCallback(async (updates) => {
    const updated = await usersService.updateProfile(updates);
    setUser(updated);
    return updated;
  }, []);

  const uploadAvatar: AuthContextValue['uploadAvatar'] = useCallback(async (file) => {
    const updated = await usersService.uploadAvatar(file);
    setUser(updated);
    return updated;
  }, []);

  const incrementScanCount = useCallback(() => {
    setScanCount((c) => {
      const next = c + 1;
      SecureStore.setItemAsync('medverify_scan_count', String(next)).catch(() => {});
      return next;
    });
  }, []);
  const subscribeToPro = useCallback(() => setIsPro(true), []);
  const unsubscribeFromPro = useCallback(() => setIsPro(false), []);

  const value = useMemo<AuthContextValue>(
    () => ({
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
      pharmacistSignup,
      pharmacistVerifyOtp,
      pharmacistResendOtp,
      pharmacistLogin,
      submitPharmacistCredentials,
      getPharmacistStatus,
      refreshProfile,
      updateProfile,
      uploadAvatar,
      isPro,
      scanCount,
      incrementScanCount,
      subscribeToPro,
      unsubscribeFromPro,
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
      pharmacistSignup,
      pharmacistVerifyOtp,
      pharmacistResendOtp,
      pharmacistLogin,
      submitPharmacistCredentials,
      getPharmacistStatus,
      refreshProfile,
      updateProfile,
      uploadAvatar,
      isPro,
      scanCount,
      incrementScanCount,
      subscribeToPro,
      unsubscribeFromPro,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
