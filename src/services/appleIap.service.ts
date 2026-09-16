import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { api } from '@/api/client';
import type { MedVerifyUser } from '@/types/api';

// Safe lazy import helper for react-native-iap (prevents crashes in Expo Go where NitroModules are missing)
let RNIapModule: any = null;
// Cached result of the NitroModules availability check so we only probe once.
let nitroModulesAvailable: boolean | null = null;

/**
 * Returns true only when react-native-nitro-modules is present AND initialised
 * in the current runtime. In a dev-client build the JS bundle loads fine but
 * the native Nitro bridge may not have been bootstrapped yet, so we probe the
 * global NitroModules object (injected by the native side) as a cheap guard.
 */
function isNitroReady(): boolean {
  if (nitroModulesAvailable !== null) return nitroModulesAvailable;
  try {
    // react-native-nitro-modules exposes a global `NitroModules` object on the
    // native side. If it's missing or has no hybrid objects, Nitro isn't ready.
    const g = (typeof globalThis !== 'undefined' ? globalThis : {}) as any;
    if (g.NitroModules && typeof g.NitroModules.hasHybridObject === 'function') {
      nitroModulesAvailable = true;
      return true;
    }
    // Fallback: try require and check for the HybridObject base
    const nitro = require('react-native-nitro-modules');
    if (nitro && (nitro.NitroModules || nitro.HybridObject)) {
      nitroModulesAvailable = true;
      return true;
    }
  } catch {
    // nitro-modules not installed or not linked
  }
  nitroModulesAvailable = false;
  return false;
}

function getRNIap() {
  if (Platform.OS !== 'ios') return null;

  // Skip loading native IAP module if running inside Expo Go (StoreClient)
  const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    (Constants as any).appOwnership === 'expo';
  if (isExpoGo) return null;

  // If NitroModules native bridge isn't ready, don't even load react-native-iap.
  // Calling initConnection() without Nitro causes [RN-IAP] internal error logs
  // that we can't suppress from outside the library.
  if (!isNitroReady()) return null;

  if (!RNIapModule) {
    try {
      const mod = require('react-native-iap');
      if (mod && typeof mod.initConnection === 'function') {
        RNIapModule = mod;
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }
  return RNIapModule;
}

// Product SKUs defined in App Store Connect. Only the monthly product exists
// today; add the annual SKU back here once it's created in App Store Connect.
export const APPLE_SUBSCRIPTION_SKUS = [
  'com.medverify.subscription.monthly',
];

// ---------------------------------------------------------------------------
// Connection lifecycle — StoreKit is connected ONCE for the app's lifetime.
// Per-screen init/teardown races with StoreKit's async transaction delivery and
// throws "Connection not initialized. Call initConnection() first." from
// finishTransaction, so we guard every native call behind ensureConnected().
// ---------------------------------------------------------------------------

let connected = false;
let connectingPromise: Promise<boolean> | null = null;
let listenersRegistered = false;
let purchaseUpdateSub: any = null;
let purchaseErrorSub: any = null;
// Set to true permanently when NitroModules isn't ready (e.g. in dev client
// builds before a full production EAS build). Prevents repeated error logs.
let nitroUnavailable = false;

// Callbacks are held at module scope so the (once-registered) listeners always
// call the latest handlers without needing to re-subscribe.
let successCb: ((user: MedVerifyUser) => void) | undefined;
let errorCb: ((error: Error) => void) | undefined;

/** Initialize the StoreKit connection if needed. De-dupes concurrent callers. */
async function ensureConnected(): Promise<boolean> {
  if (nitroUnavailable) return false;
  const iap = getRNIap();
  if (!iap) return false;
  if (connected) return true;
  if (connectingPromise) return connectingPromise;

  connectingPromise = (async () => {
    try {
      await iap.initConnection();
      connected = true;
      return true;
    } catch (e: any) {
      const msg: string = e?.message ?? String(e);
      // NitroModules not yet initialized — this is expected in dev client builds
      // that haven't run a full EAS production build with native modules linked.
      if (msg.includes('Nitro runtime') || msg.includes('nitro-modules')) {
        nitroUnavailable = true;
        console.warn('[AppleIAP] NitroModules not ready — IAP disabled for this session. Use a production EAS build to test in-app purchases.');
      } else {
        console.warn('[AppleIAP] initConnection failed:', msg);
      }
      connected = false;
      return false;
    } finally {
      connectingPromise = null;
    }
  })();
  return connectingPromise;
}

/**
 * Connects StoreKit (once) and registers purchase listeners (once). Safe to call
 * repeatedly — subsequent calls only swap the success/error callbacks. Call this
 * a single time at app startup so queued/pending transactions on launch are drained
 * against a live connection.
 */
export async function setupAppleIap(
  onPurchaseSuccess?: (user: MedVerifyUser) => void,
  onPurchaseError?: (error: Error) => void
): Promise<boolean> {
  const iap = getRNIap();
  if (!iap) return false;

  successCb = onPurchaseSuccess;
  errorCb = onPurchaseError;

  const ok = await ensureConnected();
  if (!ok) return false;

  if (listenersRegistered) return true;

  purchaseUpdateSub = iap.purchaseUpdatedListener(async (purchase: any) => {
    try {
      const token = purchase.transactionReceipt || purchase.purchaseToken;
      if (!token) {
        throw new Error('No receipt/token returned from Apple StoreKit');
      }

      // Debug: log the full purchase fields so BE dev can see the token format
      console.log('[AppleIAP] Purchase received:', {
        productId: purchase.productId,
        transactionId: purchase.transactionId,
        originalTransactionId: purchase.originalTransactionIdentifierIOS,
        receiptType: purchase.transactionReceipt ? 'transactionReceipt' : 'purchaseToken',
        receiptLength: token?.length,
        receiptPreview: token?.slice(0, 80) + '...',
      });

      let user: MedVerifyUser | null = null;
      let verifyError: Error | null = null;

      try {
        const payload = {
          transactionReceipt: token,
          productId: purchase.productId,
          transactionId: purchase.transactionId,
        };
        console.log('[AppleIAP] Sending to backend /payments/verify-apple:', {
          productId: payload.productId,
          transactionId: payload.transactionId,
          receiptLength: token?.length,
        });
        const { data } = await api.post('/payments/verify-apple', payload);
        user = data?.data?.user || null;
        console.log('[AppleIAP] Backend responded with user isPro:', user?.isPro);
      } catch (apiErr: any) {
        const is404 = apiErr?.response?.status === 404;
        const msg = is404
          ? 'Backend endpoint /payments/verify-apple is missing (404). Please implement/deploy the Apple receipt verification endpoint on your backend server.'
          : (apiErr?.response?.data?.message || apiErr?.message || 'Backend receipt verification failed');
        verifyError = new Error(msg);
      } finally {
        try {
          await ensureConnected();
          await iap.finishTransaction({ purchase, isConsumable: false });
        } catch (finishErr) {
          console.warn('[AppleIAP] finishTransaction failed:', finishErr);
        }
      }

      if (verifyError) {
        throw verifyError;
      }

      if (successCb && user) {
        successCb(user);
      }
    } catch (err: any) {
      console.warn('[AppleIAP] Verification result:', err?.message || err);
      if (errorCb) {
        errorCb(err instanceof Error ? err : new Error(err?.message || 'Verification failed'));
      }
    }
  });

  purchaseErrorSub = iap.purchaseErrorListener((error: any) => {
    console.warn('[AppleIAP] Purchase error listener:', error);

    // 'already-owned' means Apple's device cache still holds the previous
    // purchase receipt (e.g. after clearing Sandbox history). Auto-restore so
    // the existing subscription is verified and Pro is activated.
    if (error?.code === 'already-owned') {
      console.log('[AppleIAP] "already-owned" — attempting automatic restore...');
      ensureConnected().then(() => {
        const iap = getRNIap();
        if (!iap) return;
        iap.getAvailablePurchases().then(async (purchases: any[]) => {
          if (!purchases || purchases.length === 0) {
            console.warn('[AppleIAP] No available purchases found during auto-restore.');
            if (errorCb) errorCb(new Error('No active subscription found. Please try again or contact support.'));
            return;
          }
          const latestPurchase = purchases[purchases.length - 1];
          const token = latestPurchase.transactionReceipt || latestPurchase.purchaseToken;
          if (!token) {
            if (errorCb) errorCb(new Error('Could not read purchase receipt. Please try again.'));
            return;
          }
          try {
            const { api } = require('@/api/client');
            const { data } = await api.post('/payments/verify-apple', {
              transactionReceipt: token,
              productId: latestPurchase.productId,
              transactionId: latestPurchase.transactionId,
              isRestore: true,
            });
            await iap.finishTransaction({ purchase: latestPurchase, isConsumable: false });
            const user = data?.data?.user;
            if (user && successCb) {
              successCb(user);
            }
          } catch (apiErr: any) {
            const is402 = apiErr?.response?.status === 402;
            const msg = is402
              ? 'Your subscription has expired. Please subscribe again.'
              : (apiErr?.response?.data?.message || apiErr?.message || 'Could not verify existing subscription.');
            console.warn('[AppleIAP] Auto-restore verification failed:', msg);
            if (errorCb) errorCb(new Error(msg));
          }
        }).catch((restoreErr: any) => {
          console.warn('[AppleIAP] Auto-restore getAvailablePurchases failed:', restoreErr?.message);
          if (errorCb) errorCb(new Error('Could not access purchase history. Please use "Restore Purchases" button.'));
        });
      });
      return;
    }

    if (errorCb) {
      errorCb(new Error(error.message || 'Purchase cancelled or failed'));
    }
  });

  listenersRegistered = true;
  return true;
}

/**
 * Full teardown — intended for app shutdown only. Do NOT call this on screen
 * unmount: it ends the connection other (queued) transactions still need.
 */
export async function teardownAppleIap() {
  try {
    if (purchaseUpdateSub && typeof purchaseUpdateSub.remove === 'function') {
      purchaseUpdateSub.remove();
    }
  } catch {}
  purchaseUpdateSub = null;

  try {
    if (purchaseErrorSub && typeof purchaseErrorSub.remove === 'function') {
      purchaseErrorSub.remove();
    }
  } catch {}
  purchaseErrorSub = null;

  listenersRegistered = false;
  try {
    const iap = getRNIap();
    if (iap && connected && typeof iap.endConnection === 'function') {
      await iap.endConnection();
    }
  } catch (e) {
    // Ignore disconnect errors on unmount
  }
  connected = false;
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
    await ensureConnected();
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

  const ok = await ensureConnected();
  if (!ok) {
    throw new Error('Could not connect to the App Store. Please try again in a moment.');
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
    await ensureConnected();
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
