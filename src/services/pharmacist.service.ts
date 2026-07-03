import { Platform } from 'react-native';
import { api } from '@/api/client';
import type {
  AuthSession,
  ConsultationFilter,
  PharmacistConsultation,
  PharmacistDashboardStats,
  PharmacistMe,
  PharmacistProfile,
  PharmacistProfileUpdates,
  PharmacistStatusInfo,
  UploadableFile,
} from '@/types/api';

// ── Staged onboarding ───────────────────────────────────────────────────────

export async function signup(
  email: string,
  password: string,
  phone: string,
): Promise<{ email: string }> {
  const { data } = await api.post('/pharmacist/signup', { email, password, phone });
  return data.data;
}

export async function verifyOtp(email: string, otp: string): Promise<AuthSession> {
  const { data } = await api.post('/pharmacist/verify-otp', { email, otp });
  return data.data;
}

export async function resendOtp(email: string): Promise<void> {
  await api.post('/pharmacist/resend-otp', { email });
}

export async function submitCredentials(input: {
  nin: string;
  pcn: string;
  certificate?: UploadableFile;
}): Promise<void> {
  const formData = new FormData();
  formData.append('nin', input.nin);
  formData.append('pcn', input.pcn);
  if (input.certificate) {
    if (Platform.OS === 'web') {
      const blob = await (await fetch(input.certificate.uri)).blob();
      formData.append('certificate', blob, input.certificate.name);
    } else {
      formData.append('certificate', input.certificate as unknown as Blob);
    }
  }
  await api.post('/pharmacist/submit-credentials', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const { data } = await api.post('/pharmacist/login', { email, password });
  return data.data;
}

export async function getStatus(): Promise<PharmacistStatusInfo> {
  const { data } = await api.get('/pharmacist/status');
  return data.data;
}

// ── Profile & settings ──────────────────────────────────────────────────────

export async function getMe(): Promise<PharmacistMe> {
  const { data } = await api.get('/pharmacist/me');
  return data.data;
}

export async function updateProfile(updates: PharmacistProfileUpdates): Promise<PharmacistMe> {
  const { data } = await api.put('/pharmacist/update-profile', updates);
  return data.data;
}

export async function updateFees(fees: {
  feeDrugInquiry?: number;
  feeFullConsultation?: number;
}): Promise<PharmacistProfile> {
  const { data } = await api.put('/pharmacist/fees', fees);
  return data.data;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await api.post('/pharmacist/change-password', { currentPassword, newPassword });
}

// ── Consultations (pharmacist side) ─────────────────────────────────────────

export async function getDashboard(): Promise<PharmacistDashboardStats> {
  const { data } = await api.get('/pharmacist/consultations/dashboard');
  return data.data;
}

export async function listConsultations(
  options: { filter?: ConsultationFilter; limit?: number; offset?: number } = {},
): Promise<{ items: PharmacistConsultation[]; total: number }> {
  const { data } = await api.get('/pharmacist/consultations', { params: options });
  return data.data;
}

export async function acceptConsultation(id: string): Promise<PharmacistConsultation> {
  const { data } = await api.patch(`/pharmacist/consultations/${id}/accept`);
  return data.data;
}

export async function declineConsultation(id: string): Promise<PharmacistConsultation> {
  const { data } = await api.patch(`/pharmacist/consultations/${id}/decline`);
  return data.data;
}
