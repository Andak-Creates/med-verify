import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

const STAGES = [
  { target: 0.25, text: 'Initializing auth' },
  { target: 0.60, text: 'Activating scanning' },
  { target: 0.92, text: 'Loading profile' },
];

function LoadingSplash() {
  const [currentText, setCurrentText] = useState(STAGES[0].text);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(STAGES[0].target, { duration: 600, easing: Easing.out(Easing.quad) });

    const timer1 = setTimeout(() => {
      setCurrentText(STAGES[1].text);
      progress.value = withTiming(STAGES[1].target, { duration: 900, easing: Easing.out(Easing.quad) });
    }, 700);

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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <View style={{ width: '100%', maxWidth: 320, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 40, padding: 40, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' }}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={{ width: 80, height: 80, borderRadius: 20, marginBottom: 18 }}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#0b1c5a', marginBottom: 6, letterSpacing: -0.5 }}>
            MedVerify
          </Text>
          <Text style={{ fontSize: 10, fontWeight: '700', color: '#0F766E', letterSpacing: 2, marginBottom: 8 }}>
            PRECISION YOU CAN TRUST
          </Text>
        </View>

        <View style={{ position: 'absolute', bottom: 80, width: '100%', alignItems: 'center', paddingHorizontal: 40 }}>
          <Text style={{ color: '#0b1c5a', fontWeight: '600', marginBottom: 6 }}>Please Wait</Text>
          <Text style={{ color: '#64748B', fontWeight: '700', fontSize: 10, letterSpacing: 1.5, marginBottom: 12, textTransform: 'uppercase' }}>
            {currentText}...
          </Text>
          
          <View style={{ width: 240, height: 3, backgroundColor: '#E2E8F0', borderRadius: 999, marginBottom: 24, overflow: 'hidden' }}>
            <Animated.View style={[{ height: '100%', backgroundColor: '#0b1c5a', borderRadius: 999 }, progressStyle]} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
            <Ionicons name="lock-closed" size={12} color="#0b1c5a" style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#0b1c5a', letterSpacing: 1.5 }}>
              OFFICIAL DRUG REGISTRY
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSplash />;
  }

  if (isAuthenticated) {
    return <Redirect href={'/(user)/home' as any} />;
  }

  return <Redirect href={'/(onboarding)/splash' as any} />;
}
