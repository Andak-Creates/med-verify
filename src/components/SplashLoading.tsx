import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";

const LOADING_TEXTS = [
  "Initializing secure connection...",
  "Authenticating...",
  "Loading scanner...",
  "Preparing dashboard...",
];

export function SplashLoading({ message }: { message?: string }) {
  const [textIndex, setTextIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Cycle text every 800ms if no hardcoded message is provided
    if (message) return;

    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_TEXTS.length);
    }, 800);
    return () => clearInterval(interval);
  }, [message]);

  useEffect(() => {
    // Loop the progress bar animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View className="flex-1 items-center justify-center px-6">
      {/* Central Glassmorphism Card */}
      <View className="w-full max-w-sm bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-10 items-center shadow-2xl border border-white/50">
        {/* Logo Icon */}
        <View className="bg-[#0b1c5a] w-16 h-12 rounded-2xl items-center justify-center mb-6">
          <View className="bg-white w-6 h-6 rounded-full items-center justify-center">
            <Text className="text-[#0b1c5a] font-black text-xs">✓</Text>
          </View>
        </View>

        {/* App Name */}
        <Text className="text-4xl font-extrabold text-[#0b1c5a] mb-2 tracking-tight">
          MedVerify
        </Text>

        {/* Tagline */}
        <Text className="text-[10px] font-bold text-teal-700 tracking-[0.2em] mb-4">
          PRECISION YOU CAN TRUST
        </Text>
      </View>

      {/* Bottom Section */}
      <View className="absolute bottom-20 w-full items-center px-10">
        <Text className="text-[#0b1c5a] font-semibold mb-3">Welcome</Text>
        <Text className="text-gray-500 font-bold text-[10px] tracking-widest mb-4 uppercase">
          {message || LOADING_TEXTS[textIndex]}
        </Text>

        {/* Animated Progress Bar */}
        <View className="w-64 h-1 bg-gray-300 rounded-full mb-8 overflow-hidden">
          <Animated.View
            style={{
              height: "100%",
              backgroundColor: "#0b1c5a",
              width: progressWidth,
              borderRadius: 9999,
            }}
          />
        </View>

        {/* Badge */}
        <View className="flex-row items-center bg-white/60 backdrop-blur-md border border-white/50 px-4 py-2 rounded-full">
          <Text className="text-[10px] mr-2">🔒</Text>
          <Text className="text-[10px] font-bold text-[#0b1c5a] tracking-wider">
            AES-256 ENCRYPTED
          </Text>
        </View>
      </View>
    </View>
  );
}
