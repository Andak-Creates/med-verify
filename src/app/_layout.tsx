import { BlurView } from "expo-blur";
import { Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { ImageBackground, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { IncomingCallOverlay } from "../components/IncomingCallOverlay";
import { AuthProvider } from "../context/AuthContext";
import { CallProvider } from "../context/CallContext";
import { SocketProvider } from "../context/SocketContext";
import "../lib/webrtcGlobals";
import "../global.css";

// Must run as early as possible (before routing/rendering) so that when the
// Google sign-in popup reloads this same app at the redirect URI, it's
// recognized as an OAuth completion, messages the opener, and closes itself
// instead of rendering a full second copy of the app inside the popup.
WebBrowser.maybeCompleteAuthSession();

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
      </SafeAreaProvider>
      <IncomingCallOverlay />
      </CallProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
