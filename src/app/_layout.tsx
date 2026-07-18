import { BlurView } from "expo-blur";
import * as Notifications from "expo-notifications";
import { Stack, useRouter, ThemeProvider, DefaultTheme } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { ImageBackground } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { IncomingCallOverlay } from "../components/IncomingCallOverlay";
import { AuthProvider } from "../context/AuthContext";
import { CallProvider } from "../context/CallContext";
import { SocketProvider } from "../context/SocketContext";
import * as SystemUI from "expo-system-ui";
import { registerCallForegroundService } from "@/utils/callForegroundService";
import "../lib/webrtcGlobals";
import "../global.css";

// Force the root native view to be transparent so ImageBackground shows through
SystemUI.setBackgroundColorAsync("transparent");

// Register the Android foreground service that keeps a call's microphone alive
// while the app is backgrounded. No-op on iOS/web.
registerCallForegroundService();

const transparentTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

// Show notifications as banners even when the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Must run as early as possible (before routing/rendering) so that when the
// Google sign-in popup reloads this same app at the redirect URI, it's
// recognized as an OAuth completion, messages the opener, and closes itself
// instead of rendering a full second copy of the app inside the popup.
WebBrowser.maybeCompleteAuthSession();

function NotificationTapHandler() {
  const router = useRouter();
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { consultationId?: string };
      if (data?.consultationId) {
        // Navigate to the relevant consultation screen — route depends on the
        // user's role but the live session screen handles either side.
        router.push(`/(user)/pharmacy/consultation-live?id=${data.consultationId}` as any);
      }
    });
    return () => sub.remove();
  }, [router]);
  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SocketProvider>
      <CallProvider>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: 'transparent' }}>
        <ThemeProvider value={transparentTheme}>
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: "transparent" },
              cardStyle: { backgroundColor: "transparent" },
              headerShown: false,
              animation: "fade",
            }}
          />
        </ThemeProvider>
        <NotificationTapHandler />
      </SafeAreaProvider>
      <IncomingCallOverlay />
      </CallProvider>
      </SocketProvider>
      </AuthProvider>
  );
}
