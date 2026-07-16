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

/**
 * Asks the backend to reconcile Pro status straight from Paystack. Safe to call
 * repeatedly — it's authoritative and doesn't depend on webhook delivery or on
 * the checkout browser having closed.
 */
export async function syncSubscription(): Promise<MedVerifyUser> {
  const { data } = await api.post('/payments/sync');
  return data.data.user;
}

export async function cancelSubscription(): Promise<MedVerifyUser> {
  const { data } = await api.post('/payments/cancel');
  return data.data.user;
}
