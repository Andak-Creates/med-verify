import { api } from '@/api/client';
import type { AuthSession, MedVerifyUser, UserRole } from '@/types/api';

export async function signup(
  email: string,
  password: string,
  role: UserRole,
): Promise<{ email: string; role: string }> {
  const { data } = await api.post('/auth/signup', { email, password, role });
  return data.data;
}

export async function resendOtp(email: string): Promise<void> {
  await api.post('/auth/resend-otp', { email });
}

export async function verifyOtp(email: string, otp: string): Promise<AuthSession> {
  const { data } = await api.post('/auth/verify-otp', { email, otp });
  return data.data;
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data;
}

export async function googleAuth(idToken: string): Promise<AuthSession> {
  const { data } = await api.post('/auth/google', { token: idToken });
  return data.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function getMe(): Promise<MedVerifyUser> {
  const { data } = await api.get('/auth/me');
  return data.data.user;
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await api.post('/auth/reset-password', { token, password });
}
