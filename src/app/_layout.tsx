import { BlurView } from "expo-blur";
import { Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { ImageBackground, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import "../global.css";

// Must run as early as possible (before routing/rendering) so that when the
// Google sign-in popup reloads this same app at the redirect URI, it's
// recognized as an OAuth completion, messages the opener, and closes itself
// instead of rendering a full second copy of the app inside the popup.
WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider style={{ flex: 1 }}>
        <ImageBackground
          source={require("../../assets/images/background.png")}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          <BlurView
            intensity={70}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          {/* Fallback extra white overlay to ensure content is readable */}
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(255,255,255,0.4)" },
            ]}
          />

          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: "transparent" },
              headerShown: false,
              animation: "fade",
            }}
          />
        </ImageBackground>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
