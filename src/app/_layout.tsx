import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { Stack, ThemeProvider, DefaultTheme } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { setupAppleIap, teardownAppleIap } from "@/services/appleIap.service";
import { LanguageProvider } from "../i18n";
import * as SystemUI from "expo-system-ui";
import "../global.css";

// Force the root native view to be transparent
SystemUI.setBackgroundColorAsync("transparent");

const transparentTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

// Show notifications as banners when the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// For OAuth completion
WebBrowser.maybeCompleteAuthSession();

function AppleIapBootstrap() {
  const { refreshProfile } = useAuth();
  const refreshRef = useRef(refreshProfile);
  refreshRef.current = refreshProfile;

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    setupAppleIap(
      async () => {
        try {
          await refreshRef.current();
        } catch {
          // Ignore
        }
      },
      () => {},
    );
    return () => {
      teardownAppleIap();
    };
  }, []);

  return null;
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppleIapBootstrap />
        <SafeAreaProvider style={{ flex: 1, backgroundColor: 'transparent' }}>
          <ThemeProvider value={transparentTheme}>
            <Stack
              screenOptions={{
                contentStyle: { backgroundColor: "transparent" },
                headerShown: false,
                animation: "fade",
              }}
            />
          </ThemeProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
