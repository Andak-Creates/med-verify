import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  fetchAppleSubscriptions,
  buyAppleSubscription,
  restoreApplePurchases,
} from '@/services/appleIap.service';
import { initializeSubscription, syncSubscription } from '@/services/payments.service';
import type { MedVerifyUser } from '@/types/api';

export function useSubscription(onUserUpdated?: (user: MedVerifyUser) => void) {
  const [loading, setLoading] = useState<boolean>(false);
  const [appleSubscriptions, setAppleSubscriptions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch Apple product details for display (iOS only). StoreKit is connected
  // globally at app root (see AppleIapBootstrap in app/_layout.tsx), so there is
  // NO per-screen initConnection/endConnection here — that was the source of the
  // "Connection not initialized" thrash. Purchase success is handled globally and
  // flows to Pro via AuthContext.refreshProfile().
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let isMounted = true;
    fetchAppleSubscriptions().then((subs) => {
      if (isMounted) setAppleSubscriptions(subs);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const startSubscription = useCallback(async (skuOrPlanId?: string) => {
    setLoading(true);
    setError(null);

    try {
      if (Platform.OS === 'ios') {
        const skuToBuy = skuOrPlanId || 'com.medverify.subscription.monthly';
        try {
          await buyAppleSubscription(skuToBuy);
        } finally {
          setLoading(false);
        }
      } else {
        const paystackData = await initializeSubscription();
        setLoading(false);
        return paystackData;
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Failed to initiate purchase');
      throw err;
    }
  }, []);

  const restoreOrSync = useCallback(async (): Promise<MedVerifyUser | null> => {
    setLoading(true);
    setError(null);

    try {
      if (Platform.OS === 'ios') {
        const updatedUser = await restoreApplePurchases();
        setLoading(false);
        if (updatedUser && onUserUpdated) {
          onUserUpdated(updatedUser);
        }
        return updatedUser;
      } else {
        const updatedUser = await syncSubscription();
        setLoading(false);
        if (updatedUser && onUserUpdated) {
          onUserUpdated(updatedUser);
        }
        return updatedUser;
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Failed to restore purchases');
      return null;
    }
  }, [onUserUpdated]);

  return {
    loading,
    error,
    appleSubscriptions,
    startSubscription,
    restoreOrSync,
    isIos: Platform.OS === 'ios',
  };
}
