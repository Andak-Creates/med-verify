import { Stack } from "expo-router";
import { View } from "react-native";

export default function OnboardingUserLayout() {
  return (
    <View style={{ flex: 1 }}>
      {/* Frosted overlay — makes text readable over the background photo */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 252, 248, 0.55)",
        }}
        pointerEvents="none"
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
          animation: "slide_from_right",
        }}
      />
    </View>
  );
}
