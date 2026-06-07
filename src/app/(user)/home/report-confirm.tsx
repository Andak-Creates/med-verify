import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReportConfirmScreen() {
  const router = useRouter();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, damping: 10, stiffness: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        {/* Checkmark */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 28 }}>
          <View style={{
            width: 110, height: 110, borderRadius: 55,
            backgroundColor: '#F0FDF4', borderWidth: 4, borderColor: '#BBF7D0',
            alignItems: 'center', justifyContent: 'center',
            shadowColor: '#16a34a', shadowOpacity: 0.25, shadowRadius: 20, elevation: 6,
          }}>
            <Ionicons name="checkmark-circle" size={60} color="#16a34a" />
          </View>
        </Animated.View>

        {/* Text */}
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Text style={{ fontSize: 26, fontWeight: '900', color: '#0B1C5A', textAlign: 'center', marginBottom: 10 }}>
            Report Submitted
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>
            Thank you for helping keep medications safe.{'\n'}Your report has been forwarded to NAFDAC and our review team.
          </Text>

          {/* Reference */}
          <View style={{ backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 14, marginBottom: 36, borderWidth: 1, borderColor: '#E5E7EB' }}>
            <Text style={{ fontSize: 11, color: '#8E9CB2', textAlign: 'center', marginBottom: 4 }}>Report Reference Number</Text>
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#0B1C5A', textAlign: 'center', letterSpacing: 2 }}>
              RPT-{Math.floor(100000 + Math.random() * 900000)}
            </Text>
          </View>

          {/* Actions */}
          <TouchableOpacity
            onPress={() => router.replace('/(user)/home' as any)}
            style={{ backgroundColor: '#0B1C5A', borderRadius: 18, paddingVertical: 16, paddingHorizontal: 40, marginBottom: 14 }}
          >
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(user)/home/scan-qr' as any)}>
            <Text style={{ color: '#0B1C5A', fontSize: 13, fontWeight: '700', letterSpacing: 1 }}>SCAN ANOTHER DRUG</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

