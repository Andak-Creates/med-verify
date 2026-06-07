import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock drug database
const MOCK_DRUGS: Record<string, {
  name: string; brand: string; nafdac: string; batch: string;
  expiry: string; manufacturer: string; status: 'authentic' | 'counterfeit';
  category: string; strength: string;
}> = {
  default: {
    name: 'Paracetamol BP',
    brand: 'Emzor',
    nafdac: 'A4-0118',
    batch: 'BT-882219',
    expiry: 'Dec 2026',
    manufacturer: 'Emzor Pharmaceutical Industries',
    status: 'authentic',
    category: 'Analgesic / Antipyretic',
    strength: '500mg Tablets',
  },
  MOCK_NAFDAC_12345: {
    name: 'Amoxicillin',
    brand: 'Ampiclox',
    nafdac: 'B3-2240',
    batch: 'BT-441120',
    expiry: 'Mar 2027',
    manufacturer: 'GlaxoSmithKline Nigeria',
    status: 'authentic',
    category: 'Antibiotic',
    strength: '500mg Capsules',
  },
};

export default function ResultScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();

  const drug = MOCK_DRUGS[code ?? ''] ?? MOCK_DRUGS.default;
  const isAuthentic = drug.status === 'authentic';

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, damping: 14, stiffness: 130, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const statusColor = isAuthentic ? '#16a34a' : '#dc2626';
  const statusBg = isAuthentic ? '#f0fdf4' : '#fef2f2';
  const statusBorder = isAuthentic ? '#bbf7d0' : '#fecaca';
  const statusIcon = isAuthentic ? 'shield-checkmark' : 'warning';
  const statusLabel = isAuthentic ? 'AUTHENTIC' : 'COUNTERFEIT';
  const statusMsg = isAuthentic
    ? 'This medication is verified and safe to use.'
    : 'WARNING: This product may be fake. Do not consume.';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
              shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="chevron-back" size={22} color="#0B1C5A" />
          </Pressable>
          <Text style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: '#0B1C5A', marginRight: 40 }}>
            Scan Result
          </Text>
        </View>

        {/* Status Badge */}
        <Animated.View style={{
          opacity: fadeAnim, transform: [{ scale: scaleAnim }],
          alignItems: 'center', paddingTop: 24, paddingBottom: 20, paddingHorizontal: 24,
        }}>
          <View style={{
            width: 100, height: 100, borderRadius: 50,
            backgroundColor: statusBg, borderWidth: 3, borderColor: statusBorder,
            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            shadowColor: statusColor, shadowOpacity: 0.25, shadowRadius: 20, elevation: 6,
          }}>
            <Ionicons name={statusIcon as any} size={52} color={statusColor} />
          </View>

          <View style={{
            backgroundColor: statusBg, borderWidth: 1.5, borderColor: statusBorder,
            borderRadius: 50, paddingHorizontal: 20, paddingVertical: 7, marginBottom: 10,
          }}>
            <Text style={{ color: statusColor, fontWeight: '900', fontSize: 13, letterSpacing: 2 }}>
              {statusLabel}
            </Text>
          </View>

          <Text style={{ color: '#374151', fontSize: 14, textAlign: 'center', lineHeight: 21, paddingHorizontal: 16 }}>
            {statusMsg}
          </Text>
        </Animated.View>

        {/* Drug Info Card */}
        <Animated.View style={{
          marginHorizontal: 20, marginBottom: 16,
          opacity: fadeAnim, transform: [{ translateY: slideAnim }],
        }}>
          <View style={{
            backgroundColor: '#fff', borderRadius: 24,
            padding: 20,
            shadowColor: '#0B1C5A', shadowOpacity: 0.05, shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 }, elevation: 3,
          }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#8E9CB2', letterSpacing: 2, marginBottom: 14, textTransform: 'uppercase' }}>
              Drug Information
            </Text>

            {[
              { label: 'Drug Name', value: drug.name },
              { label: 'Brand', value: drug.brand },
              { label: 'Strength', value: drug.strength },
              { label: 'Category', value: drug.category },
              { label: 'NAFDAC No.', value: drug.nafdac },
              { label: 'Batch No.', value: drug.batch },
              { label: 'Expiry Date', value: drug.expiry },
              { label: 'Manufacturer', value: drug.manufacturer },
            ].map((row, i, arr) => (
              <View key={row.label} style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
                paddingVertical: 11,
                borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                borderBottomColor: '#F3F4F6',
              }}>
                <Text style={{ fontSize: 13, color: '#8E9CB2', fontWeight: '600', flex: 1 }}>{row.label}</Text>
                <Text style={{ fontSize: 13, color: '#0B1C5A', fontWeight: '700', flex: 1.4, textAlign: 'right' }}>{row.value}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={{ paddingHorizontal: 20, gap: 12, opacity: fadeAnim }}>
          {/* Full Details */}
          <Pressable
            onPress={() => router.push({ pathname: '/(user)/home/drug-details', params: { code } } as any)}
            style={({ pressed }) => ({
              backgroundColor: '#0B1C5A', borderRadius: 16, paddingVertical: 16,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Ionicons name="information-circle-outline" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>View Full Drug Details</Text>
          </Pressable>

          {/* Report */}
          <Pressable
            onPress={() => router.push({ pathname: '/(user)/home/report', params: { code } } as any)}
            style={({ pressed }) => ({
              backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              borderWidth: 1.5, borderColor: '#e5e7eb',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Ionicons name="flag-outline" size={20} color="#dc2626" />
            <Text style={{ color: '#dc2626', fontSize: 15, fontWeight: '700' }}>Report Suspicious Drug</Text>
          </Pressable>

          {/* Scan Again */}
          <Pressable
            onPress={() => router.replace('/(user)/home/scan-qr' as any)}
            style={({ pressed }) => ({
              alignItems: 'center', paddingVertical: 12, opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ color: '#0B1C5A', fontSize: 13, fontWeight: '700', letterSpacing: 1 }}>
              SCAN ANOTHER DRUG
            </Text>
          </Pressable>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

