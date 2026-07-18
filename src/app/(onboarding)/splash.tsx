import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SplashLoading } from '../../components/SplashLoading';
import { ImageBackground, StyleSheet, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(onboarding)/role-select');
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={{ flex: 1 }}>

      <SplashLoading />
    </View>
  );
}
