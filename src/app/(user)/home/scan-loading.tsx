import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScanLoadingScreen() {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotationAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
    ).start();

    // Mock API delay then redirect
    const timer = setTimeout(() => {
      router.replace({ pathname: '/(user)/home/result', params: { code: 'DEFAULT_SCAN' } } as any);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const rotateInterpolate = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.scannerRing, { transform: [{ scale: pulseAnim }] }]}>
          <Animated.View style={[styles.scannerInner, { transform: [{ rotate: rotateInterpolate }] }]}>
            <Ionicons name="scan-outline" size={60} color="#0B1C5A" />
          </Animated.View>
        </Animated.View>
        
        <Text style={styles.title}>Verifying Product...</Text>
        <Text style={styles.subtitle}>Checking NAFDAC database and cross-referencing batch numbers.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  scannerRing: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(11, 28, 90, 0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 40, borderWidth: 1, borderColor: 'rgba(11, 28, 90, 0.1)' },
  scannerInner: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#0B1C5A', shadowOpacity: 0.15, shadowRadius: 15, elevation: 8 },
  title: { fontSize: 24, fontWeight: '900', color: '#0B1C5A', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
});
