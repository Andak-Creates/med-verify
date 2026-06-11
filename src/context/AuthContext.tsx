import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";
import { api, TOKEN_STORAGE_KEY } from "../lib/api";
import { deleteToken, setToken } from "../lib/tokenStorage";

export interface MedVerifyUser {
  id: string;
  email: string;
  fullName: string | null;
  username: string;
  role: "USER" | "PHARMACIST";
  authProvider: "email" | "google";
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
  signup: (
    email: string,
    password: string,
    role: "USER" | "PHARMACIST",
  ) => Promise<{ email: string; role: string }>;
  resendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<MedVerifyUser>;
  login: (email: string, password: string) => Promise<MedVerifyUser>;
  googleAuth: (idToken: string) => Promise<MedVerifyUser>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<MedVerifyUser | null>;
  updateProfile: (
    updates: Partial<{
      fullName: string;
      username: string;
      profileImage: string | null;
      bloodGroup: string | null;
      allergies: string | null;
      chronicConditions: string | null;
    }>,
  ) => Promise<MedVerifyUser>;
  uploadAvatar: (file: {
    uri: string;
    name: string;
    type: string;
  }) => Promise<MedVerifyUser>;
  devLogin: (role: "USER" | "PHARMACIST") => Promise<void>;
  isPro: boolean;
  scanCount: number;
  incrementScanCount: () => void;
  subscribeToPro: () => void;
  unsubscribeFromPro: () => void;
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
  const [isPro, setIsPro] = useState(true);
  const [scanCount, setScanCount] = useState(0);

  const incrementScanCount = () => {
    setScanCount((c) => c + 1);
  };

  const subscribeToPro = () => {
    setIsPro(true);
  };

  const unsubscribeFromPro = () => {
    setIsPro(false);
  };

  useEffect(() => {
    // DISCONNECTED FROM BACKEND FOR UI DEVELOPMENT
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const signup: AuthContextValue["signup"] = async (email, password, role) => {
    // MOCK SIGNUP
    await new Promise((r) => setTimeout(r, 800));
    return { email, role };
  };

  const resendOtp: AuthContextValue["resendOtp"] = async (email) => {
    // MOCK RESEND OTP
    await new Promise((r) => setTimeout(r, 500));
  };

  const verifyOtp: AuthContextValue["verifyOtp"] = async (email, otp) => {
    // MOCK VERIFY OTP
    await new Promise((r) => setTimeout(r, 800));
    const role = email.includes('pharm') ? 'PHARMACIST' : 'USER';
    const fakeToken = "mock_token_" + Date.now();
    const fakeUser: MedVerifyUser = {
      id: "mock_" + Date.now(),
      email,
      fullName: "Mock User",
      username: email.split('@')[0],
      role: role as "USER" | "PHARMACIST",
      authProvider: "email",
      emailVerified: true,
      profileImage: null,
      bloodGroup: null,
      allergies: null,
      chronicConditions: null,
      createdAt: new Date().toISOString(),
    };
    await persistSession(fakeToken);
    setToken(fakeToken);
    setUser(fakeUser);
    return fakeUser;
  };

  const login: AuthContextValue["login"] = async (email, password) => {
    // MOCK LOGIN
    await new Promise((r) => setTimeout(r, 800));
    const role = email.includes('pharm') ? 'PHARMACIST' : 'USER';
    const fakeToken = "mock_token_" + Date.now();
    const fakeUser: MedVerifyUser = {
      id: "mock_" + Date.now(),
      email,
      fullName: "Mock User",
      username: email.split('@')[0],
      role: role as "USER" | "PHARMACIST",
      authProvider: "email",
      emailVerified: true,
      profileImage: null,
      bloodGroup: null,
      allergies: null,
      chronicConditions: null,
      createdAt: new Date().toISOString(),
    };
    await persistSession(fakeToken);
    setToken(fakeToken);
    setUser(fakeUser);
    return fakeUser;
  };

  const googleAuth: AuthContextValue["googleAuth"] = async (idToken) => {
    // MOCK GOOGLE AUTH
    await new Promise((r) => setTimeout(r, 800));
    const fakeToken = "mock_google_token_" + Date.now();
    const fakeUser: MedVerifyUser = {
      id: "mock_google_" + Date.now(),
      email: "google@user.com",
      fullName: "Google User",
      username: "google_user",
      role: "USER",
      authProvider: "google",
      emailVerified: true,
      profileImage: null,
      bloodGroup: null,
      allergies: null,
      chronicConditions: null,
      createdAt: new Date().toISOString(),
    };
    await persistSession(fakeToken);
    setToken(fakeToken);
    setUser(fakeUser);
    return fakeUser;
  };

  const logout: AuthContextValue["logout"] = async () => {
    // MOCK LOGOUT
    await new Promise((r) => setTimeout(r, 300));
    await clearSession();
    setToken(null);
    setUser(null);
  };

  const refreshProfile: AuthContextValue["refreshProfile"] = async () => {
    if (!token || !user) return null;
    return user;
  };

  const updateProfile: AuthContextValue["updateProfile"] = async (updates) => {
    // MOCK UPDATE PROFILE
    await new Promise((r) => setTimeout(r, 500));
    if (!user) throw new Error("Not logged in");
    const updatedUser = { ...user, ...updates } as MedVerifyUser;
    setUser(updatedUser);
    return updatedUser;
  };

  const uploadAvatar: AuthContextValue["uploadAvatar"] = async (file) => {
    // MOCK UPLOAD AVATAR
    await new Promise((r) => setTimeout(r, 800));
    if (!user) throw new Error("Not logged in");
    const updatedUser = { ...user, profileImage: file.uri } as MedVerifyUser;
    setUser(updatedUser);
    return updatedUser;
  };

  const devLogin: AuthContextValue["devLogin"] = async (role) => {
    const fakeToken = "dev_fake_token_" + role;
    const fakeUser: MedVerifyUser = {
      id: "dev_user_1",
      email: "dev@medverify.com",
      fullName: "Dev User",
      username: "dev_user",
      role: role,
      authProvider: "email",
      emailVerified: true,
      profileImage: null,
      bloodGroup: null,
      allergies: null,
      chronicConditions: null,
      createdAt: new Date().toISOString(),
    };
    await persistSession(fakeToken);
    setToken(fakeToken);
    setUser(fakeUser);
  };

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
      refreshProfile,
      updateProfile,
      uploadAvatar,
      devLogin,
      isPro,
      scanCount,
      incrementScanCount,
      subscribeToPro,
      unsubscribeFromPro,
    }),
    [user, token, isLoading, isPro, scanCount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
