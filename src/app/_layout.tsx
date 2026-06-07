import { Stack } from "expo-router";
import { ImageBackground } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

export default function RootLayout() {
  return (
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
  );
}
