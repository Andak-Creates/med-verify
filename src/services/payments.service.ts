import { api } from '@/api/client';
import type { MedVerifyUser, SavedCard, SessionPaymentInit } from '@/types/api';

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

// ── Saved cards ───────────────────────────────────────────────────────────────

export async function listCards(): Promise<SavedCard[]> {
  const { data } = await api.get('/payments/cards');
  return data.data.cards;
}

/** Paystack hosted page where the user securely adds/switches their subscription card. */
export async function getCardManageLink(): Promise<string> {
  const { data } = await api.get('/payments/manage-link');
  return data.data.link;
}

export async function removeCard(authorizationCode: string): Promise<SavedCard[]> {
  const { data } = await api.post('/payments/cards/remove', { authorizationCode });
  return data.data.cards;
}

// ── Per-session pay-to-join ───────────────────────────────────────────────────

/** Start a one-off Paystack charge for an accepted consultation. */
export async function initializeSessionPayment(
  consultationId: string,
): Promise<SessionPaymentInit> {
  const { data } = await api.post('/payments/session/initialize', { consultationId });
  return data.data;
}

/**
 * Confirm a session charge by reference (client-side fallback to the webhook).
 * Resolves when the payment is confirmed; throws (402) while still pending.
 */
export async function verifySessionPayment(reference: string): Promise<void> {
  await api.get(`/payments/session/verify/${encodeURIComponent(reference)}`);
}
