import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withRepeat } from 'react-native-reanimated';

const STAGES = [
  { target: 0.25, text: 'Initializing auth' },
  { target: 0.60, text: 'Activating scanning' },
  { target: 0.92, text: 'Loading profile' },
];

function LoadingSplash() {
  const [currentText, setCurrentText] = useState(STAGES[0].text);
  const progress = useSharedValue(0);

  useEffect(() => {
    // Step 1: 0% -> 25% (Initializing auth)
    progress.value = withTiming(STAGES[0].target, { duration: 600, easing: Easing.out(Easing.quad) });

    // Step 2: 25% -> 60% (Activating scanning)
    const timer1 = setTimeout(() => {
      setCurrentText(STAGES[1].text);
      progress.value = withTiming(STAGES[1].target, { duration: 900, easing: Easing.out(Easing.quad) });
    }, 700);

    // Step 3: 60% -> 92% (Loading profile)
    const timer2 = setTimeout(() => {
      setCurrentText(STAGES[2].text);
      progress.value = withTiming(STAGES[2].target, { duration: 1200, easing: Easing.out(Easing.quad) });
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-sm bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-10 items-center shadow-2xl border border-white/50">
          <View className="bg-[#0b1c5a] w-16 h-12 rounded-2xl items-center justify-center mb-6">
            <View className="bg-white w-6 h-6 rounded-full items-center justify-center">
              <Text className="text-[#0b1c5a] font-black text-xs">✓</Text>
            </View>
          </View>
          <Text className="text-4xl font-extrabold text-[#0b1c5a] mb-2 tracking-tight">
            MedVerify
          </Text>
          <Text className="text-[10px] font-bold text-teal-700 tracking-[0.2em] mb-4">
            PRECISION YOU CAN TRUST
          </Text>
        </View>

        <View className="absolute bottom-20 w-full items-center px-10">
          <Text className="text-[#0b1c5a] font-semibold mb-3">Please Wait</Text>
          <Text className="text-gray-500 font-bold text-[10px] tracking-widest mb-3 uppercase">
            {currentText}...
          </Text>
          
          <View className="w-64 h-0.5 bg-gray-300 rounded-full mb-8 overflow-hidden">
            <Animated.View style={[{ height: '100%', backgroundColor: '#0b1c5a', borderRadius: 999 }, progressStyle]} />
          </View>

          <View className="flex-row items-center bg-white/60 backdrop-blur-md border border-white/50 px-4 py-2 rounded-full">
            <Text className="text-[10px] mr-2">🔒</Text>
            <Text className="text-[10px] font-bold text-[#0b1c5a] tracking-wider">
              AES-256 ENCRYPTED
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSplash />;
  }

  if (isAuthenticated) {
    if (user?.role === 'PHARMACIST') {
      return <Redirect href={'/(pharmacist)/dashboard' as any} />;
    }
    return <Redirect href={'/(user)/home' as any} />;
  }

  return <Redirect href={'/(onboarding)/splash' as any} />;
}
