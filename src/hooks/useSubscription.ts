import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  setupAppleIap,
  teardownAppleIap,
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

  useEffect(() => {
    if (Platform.OS === 'ios') {
      let isMounted = true;

      setupAppleIap(
        (updatedUser) => {
          setLoading(false);
          if (onUserUpdated) onUserUpdated(updatedUser);
        },
        (err) => {
          setLoading(false);
          setError(err.message);
        }
      ).then((initialized) => {
        if (initialized && isMounted) {
          fetchAppleSubscriptions().then((subs) => {
            if (isMounted) setAppleSubscriptions(subs);
          });
        }
      });

      return () => {
        isMounted = false;
        teardownAppleIap();
      };
    }
  }, [onUserUpdated]);

  /**
   * Triggers subscription start based on platform:
   * - iOS: Launches Apple StoreKit Native Sheet
   * - Android/Web: Returns Paystack authorization URL
   */
  const startSubscription = useCallback(async (skuOrPlanId?: string) => {
    setLoading(true);
    setError(null);

    try {
      if (Platform.OS === 'ios') {
        const skuToBuy = skuOrPlanId || 'com.medverify.subscription.monthly';
        await buyAppleSubscription(skuToBuy);
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

  /**
   * Restores prior purchases (iOS) or syncs Paystack subscription status (Android/Web)
   */
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
