import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const EAS_PROJECT_ID = 'acc68557-7acf-424f-b2eb-8dd2f4f02641';

export async function registerForPushNotifications(): Promise<string | null> {
  // Push notifications only work on physical devices with a registered app.
  // On web or simulator we skip silently.
  if (Platform.OS === 'web') return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: EAS_PROJECT_ID });
  return tokenData.data;
}
