import { api } from '@/api/client';
import type { MedVerifyUser } from '@/types/api';

export async function initializeSubscription(): Promise<{ authorizationUrl: string; reference: string }> {
  const { data } = await api.post('/payments/initialize');
  return data.data;
}

export async function verifyPayment(reference: string): Promise<MedVerifyUser> {
  const { data } = await api.get(`/payments/verify/${encodeURIComponent(reference)}`);
  return data.data.user;
}

export async function cancelSubscription(): Promise<MedVerifyUser> {
  const { data } = await api.post('/payments/cancel');
  return data.data.user;
}
