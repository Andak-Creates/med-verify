import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { api } from '@/api/client';
import type { MedVerifyUser } from '@/types/api';

// Safe lazy import helper for react-native-iap (prevents crashes in Expo Go where NitroModules are missing)
let RNIapModule: any = null;
function getRNIap() {
  if (Platform.OS !== 'ios') return null;

  // Skip loading native IAP module if running inside Expo Go (StoreClient)
  const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    (Constants as any).appOwnership === 'expo';
  if (isExpoGo) {
    return null;
  }

  if (!RNIapModule) {
    try {
      RNIapModule = require('react-native-iap');
    } catch (e: any) {
      console.warn('[AppleIAP] react-native-iap / NitroModules native module not available in this build. Use a Dev Client or standalone iOS build to test IAP.', e);
      return null;
    }
  }
  return RNIapModule;
}

// Product SKUs defined in App Store Connect
export const APPLE_SUBSCRIPTION_SKUS = [
  'com.medverify.subscription.monthly',
  'com.medverify.subscription.annual',
];

let purchaseUpdateSub: any = null;
let purchaseErrorSub: any = null;

/**
 * Initializes the Apple StoreKit connection and sets up listeners for incoming purchases.
 */
export async function setupAppleIap(
  onPurchaseSuccess?: (user: MedVerifyUser) => void,
  onPurchaseError?: (error: Error) => void
): Promise<boolean> {
  const iap = getRNIap();
  if (!iap) return false;

  try {
    const result = await iap.initConnection();

    // Setup Purchase Update Listener
    purchaseUpdateSub = iap.purchaseUpdatedListener(async (purchase: any) => {
      try {
        const token = purchase.transactionReceipt || purchase.purchaseToken;
        if (!token) {
          throw new Error('No receipt/token returned from Apple StoreKit');
        }

        let user: MedVerifyUser | null = null;
        let verifyError: Error | null = null;

        try {
          // Verify receipt with MedVerify backend
          const { data } = await api.post('/payments/verify-apple', {
            transactionReceipt: token,
            productId: purchase.productId,
            transactionId: purchase.transactionId,
          });
          user = data?.data?.user || null;
        } catch (apiErr: any) {
          const is404 = apiErr?.response?.status === 404;
          const msg = is404
            ? 'Backend endpoint /payments/verify-apple is missing (404). Please implement/deploy the Apple receipt verification endpoint on your backend server.'
            : (apiErr?.response?.data?.message || apiErr?.message || 'Backend receipt verification failed');
          verifyError = new Error(msg);
        } finally {
          // Always finish transaction with Apple once received so StoreKit queue doesn't lock up
          try {
            await iap.finishTransaction({ purchase, isConsumable: false });
          } catch (finishErr) {
            console.warn('[AppleIAP] finishTransaction failed:', finishErr);
          }
        }

        if (verifyError) {
          throw verifyError;
        }

        if (onPurchaseSuccess && user) {
          onPurchaseSuccess(user);
        }
      } catch (err: any) {
        console.error('[AppleIAP] Verification error:', err);
        if (onPurchaseError) {
          onPurchaseError(err instanceof Error ? err : new Error(err?.message || 'Verification failed'));
        }
      }
    });

    // Setup Purchase Error Listener
    purchaseErrorSub = iap.purchaseErrorListener((error: any) => {
      console.warn('[AppleIAP] Purchase error listener:', error);
      if (onPurchaseError) {
        onPurchaseError(new Error(error.message || 'Purchase cancelled or failed'));
      }
    });

    return !!result;
  } catch (error) {
    console.error('[AppleIAP] Init failed:', error);
    return false;
  }
}

/**
 * Clean up IAP listeners and disconnect StoreKit
 */
export async function teardownAppleIap() {
  if (purchaseUpdateSub) {
    purchaseUpdateSub.remove();
    purchaseUpdateSub = null;
  }
  if (purchaseErrorSub) {
    purchaseErrorSub.remove();
    purchaseErrorSub = null;
  }
  const iap = getRNIap();
  if (iap) {
    try {
      await iap.endConnection();
    } catch (e) {
      // Ignore disconnect errors on unmount
    }
  }
}

/**
 * Fetch localized subscription details from Apple App Store Connect
 */
export async function fetchAppleSubscriptions(
  skus: string[] = APPLE_SUBSCRIPTION_SKUS
): Promise<any[]> {
  const iap = getRNIap();
  if (!iap) return [];
  try {
    const products = await iap.fetchProducts({ skus, type: 'subs' });
    if (!products) return [];
    return products;
  } catch (error) {
    console.error('[AppleIAP] Failed to fetch subscriptions:', error);
    return [];
  }
}

/**
 * Trigger the native Apple Face ID / Touch ID / Apple Pay purchase sheet for a given SKU
 */
export async function buyAppleSubscription(sku: string): Promise<void> {
  const iap = getRNIap();
  if (!iap) {
    throw new Error('Apple In-App Purchases are not available in Expo Go. Please use a Dev Client or custom native build.');
  }

  try {
    // react-native-iap v14 requires nested request object with apple/ios platform properties
    await iap.requestPurchase({
      request: {
        apple: { sku },
        ios: { sku },
      },
      type: 'subs',
    });
  } catch (error: any) {
    console.error('[AppleIAP] Request purchase error:', error);
    throw new Error(error?.message || 'Failed to initiate Apple subscription');
  }
}

/**
 * Restores previous purchases for the current Apple ID
 */
export async function restoreApplePurchases(): Promise<MedVerifyUser | null> {
  const iap = getRNIap();
  if (!iap) return null;

  try {
    const purchases = await iap.getAvailablePurchases();
    if (!purchases || purchases.length === 0) {
      return null;
    }

    const latestPurchase = purchases[purchases.length - 1];
    const token = latestPurchase.transactionReceipt || latestPurchase.purchaseToken;

    if (!token) {
      throw new Error('No purchase token found during restore');
    }

    const { data } = await api.post('/payments/verify-apple', {
      transactionReceipt: token,
      productId: latestPurchase.productId,
      transactionId: latestPurchase.transactionId,
      isRestore: true,
    });

    await iap.finishTransaction({ purchase: latestPurchase, isConsumable: false });
    return data?.data?.user || null;
  } catch (error: any) {
    console.error('[AppleIAP] Restore purchases error:', error);
    throw new Error(error?.message || 'Failed to restore Apple purchases');
  }
}
