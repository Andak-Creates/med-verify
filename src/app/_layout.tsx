import { BlurView } from "expo-blur";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { ImageBackground } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { IncomingCallOverlay } from "../components/IncomingCallOverlay";
import { AuthProvider } from "../context/AuthContext";
import { CallProvider } from "../context/CallContext";
import { SocketProvider } from "../context/SocketContext";
import "../lib/webrtcGlobals";
import "../global.css";

// Show notifications as banners even when the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
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
      <SafeAreaProvider style={{ flex: 1 }}>
        <ImageBackground
          source={require("../../assets/images/background.png")}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: "transparent" },
              headerShown: false,
              animation: "fade",
            }}
          />
        </ImageBackground>
        <NotificationTapHandler />
      </SafeAreaProvider>
      <IncomingCallOverlay />
      </CallProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
