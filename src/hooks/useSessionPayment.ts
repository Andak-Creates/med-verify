import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { getApiErrorMessage } from '@/api/client';
import { initializeSessionPayment, verifySessionPayment } from '@/services/payments.service';

const POLL_INTERVAL_MS = 3000;
const POLL_ATTEMPTS = 30; // ~90s, matches the Pro paywall flow

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Pay-to-join flow for an accepted consultation. Mirrors the Pro paywall:
 * initialize → open Paystack checkout in the browser → poll verify(reference)
 * until the charge settles. `openBrowserAsync` resolves immediately on web and
 * on browser dismissal on native, so we poll rather than checking once.
 */
export function useSessionPayment() {
  const [payingId, setPayingId] = useState<string | null>(null);

  const pay = useCallback(
    async (consultationId: string, onPaid?: () => void): Promise<boolean> => {
      if (payingId) return false;
      setPayingId(consultationId);
      try {
        const { authorizationUrl, reference } = await initializeSessionPayment(consultationId);

        await WebBrowser.openBrowserAsync(authorizationUrl);

        for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
          try {
            await verifySessionPayment(reference);
            onPaid?.();
            return true;
          } catch {
            // 402 while pending — keep polling.
          }
          await delay(POLL_INTERVAL_MS);
        }

        Alert.alert(
          'Still confirming',
          "We haven't seen your payment yet. If you were charged, it will unlock shortly — pull to refresh in a moment.",
        );
        return false;
      } catch (err) {
        Alert.alert('Could not start payment', getApiErrorMessage(err, 'Please try again in a moment.'));
        return false;
      } finally {
        setPayingId(null);
      }
    },
    [payingId],
  );

  return { pay, payingId };
}
