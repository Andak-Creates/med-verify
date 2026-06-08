import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DrugVerificationResult } from '../../../lib/drugs';

const STATUS_CONFIG: Record<DrugVerificationResult['verificationResult'], {
  color: string; bg: string; border: string; icon: keyof typeof Ionicons.glyphMap; label: string; message: string;
}> = {
  verified: {
    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: 'shield-checkmark', label: 'VERIFIED',
    message: 'This medication is registered and active with NAFDAC.',
  },
  flagged: {
    color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: 'warning', label: 'FLAGGED',
    message: 'This NAFDAC number is registered but not currently active. Proceed with caution.',
  },
  not_found: {
    color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: 'close-circle', label: 'NOT FOUND',
    message: 'No registered drug was found for this NAFDAC number. This product may be counterfeit.',
  },
};

export default function ResultScreen() {
  const router = useRouter();
  const { code, result } = useLocalSearchParams<{ code: string; result?: string }>();

  const drug = useMemo<DrugVerificationResult | null>(() => {
    if (!result) return null;
    try {
      return JSON.parse(result) as DrugVerificationResult;
    } catch {
      return null;
    }
  }, [result]);

  const verificationResult = drug?.verificationResult ?? 'not_found';
  const status = STATUS_CONFIG[verificationResult];
  const nafdacNumber = drug?.nafdacNumber ?? code;

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

  const infoRows = drug?.found
    ? [
        { label: 'Drug Name', value: drug.productName },
        { label: 'Strength', value: drug.strength },
        { label: 'Category', value: drug.category },
        { label: 'Form', value: drug.form },
        { label: 'NAFDAC No.', value: drug.nafdacNumber },
        { label: 'Manufacturer', value: drug.manufacturer },
        { label: 'Registry Status', value: drug.registryStatus },
        { label: 'Approval Date', value: drug.approvalDate },
      ].filter((row) => row.value)
    : [{ label: 'NAFDAC No. Entered', value: nafdacNumber }];

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
            backgroundColor: status.bg, borderWidth: 3, borderColor: status.border,
            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            shadowColor: status.color, shadowOpacity: 0.25, shadowRadius: 20, elevation: 6,
          }}>
            <Ionicons name={status.icon} size={52} color={status.color} />
          </View>

          <View style={{
            backgroundColor: status.bg, borderWidth: 1.5, borderColor: status.border,
            borderRadius: 50, paddingHorizontal: 20, paddingVertical: 7, marginBottom: 10,
          }}>
            <Text style={{ color: status.color, fontWeight: '900', fontSize: 13, letterSpacing: 2 }}>
              {status.label}
            </Text>
          </View>

          <Text style={{ color: '#374151', fontSize: 14, textAlign: 'center', lineHeight: 21, paddingHorizontal: 16 }}>
            {status.message}
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

            {infoRows.map((row, i, arr) => (
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
          {drug?.found && (
            <Pressable
              onPress={() => router.push({ pathname: '/(user)/home/drug-details', params: { code: nafdacNumber, result } } as any)}
              style={({ pressed }) => ({
                backgroundColor: '#0B1C5A', borderRadius: 16, paddingVertical: 16,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Ionicons name="information-circle-outline" size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>View Full Drug Details</Text>
            </Pressable>
          )}

          {/* Report */}
          <Pressable
            onPress={() => router.push({ pathname: '/(user)/home/report', params: { code: nafdacNumber } } as any)}
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
            onPress={() => router.replace('/(user)/home/scan-manual' as any)}
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
