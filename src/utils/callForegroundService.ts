import { Platform } from 'react-native';

// @notifee/react-native is a native module that only exists in a custom dev
// build / production build. In Expo Go and on web the native module is not
// linked, so we load it lazily with require() inside a try-catch and fall back
// to no-ops. The call still works; it just won't have a persistent foreground-
// service notification keeping the mic alive while backgrounded.

type Notifee = typeof import('@notifee/react-native').default;
type AndroidForegroundServiceType =
  typeof import('@notifee/react-native').AndroidForegroundServiceType;
type AndroidImportance =
  typeof import('@notifee/react-native').AndroidImportance;

function getNotifee(): {
  notifee: Notifee;
  AndroidForegroundServiceType: AndroidForegroundServiceType;
  AndroidImportance: AndroidImportance;
} | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('@notifee/react-native');
    return {
      notifee: mod.default ?? mod,
      AndroidForegroundServiceType: mod.AndroidForegroundServiceType,
      AndroidImportance: mod.AndroidImportance,
    };
  } catch {
    return null;
  }
}

// Android 11+ only lets an app keep using the microphone in the background
// while a foreground service of type `microphone` is running. We start such a
// service (backed by a persistent notification) for the duration of a call and
// stop it when the call ends. On iOS this is a no-op — background audio is
// handled by UIBackgroundModes in app.json.

const CHANNEL_ID = 'medverify_calls';
let channelReady = false;

/**
 * Registers the long-running foreground service task. Must be called once at
 * module scope from the app entry (not inside a component). The task returns a
 * promise that never resolves, keeping the service alive until we explicitly
 * call stopForegroundService().
 */
export function registerCallForegroundService(): void {
  if (Platform.OS !== 'android') return;
  const mod = getNotifee();
  if (!mod) return;
  mod.notifee.registerForegroundService(() => new Promise(() => {}));
}

export async function startCallForegroundService(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const mod = getNotifee();
  if (!mod) return;
  const { notifee, AndroidForegroundServiceType, AndroidImportance } = mod;
  try {
    if (!channelReady) {
      await notifee.createChannel({
        id: CHANNEL_ID,
        name: 'Ongoing calls',
        importance: AndroidImportance.LOW,
      });
      channelReady = true;
    }
    await notifee.displayNotification({
      title: 'Call in progress',
      body: 'Your MedVerify consultation call is active.',
      android: {
        channelId: CHANNEL_ID,
        asForegroundService: true,
        ongoing: true,
        foregroundServiceTypes: [
          AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_MICROPHONE,
        ],
        pressAction: { id: 'default' },
      },
    });
  } catch {
    // Non-fatal: the call still runs in the foreground even if the service
    // notification fails to start.
  }
}

export async function stopCallForegroundService(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const mod = getNotifee();
  if (!mod) return;
  try {
    await mod.notifee.stopForegroundService();
  } catch {
    // Ignore — nothing to stop.
  }
}
