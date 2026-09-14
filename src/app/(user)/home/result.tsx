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
import type { DrugVerificationResult } from '@/types/api';
import { useLanguage } from '@/i18n';

export default function ResultScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { code, result, from } = useLocalSearchParams<{ code: string; result?: string; from?: string }>();

  const handleBack = () => {
    if (from === 'history') {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(user)/history' as any);
      }
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(user)/home' as any);
      }
    }
  };

  const drug = useMemo<DrugVerificationResult | null>(() => {
    if (!result) return null;
    try {
      return JSON.parse(result) as DrugVerificationResult;
    } catch {
      return null;
    }
  }, [result]);

  const verificationResult = drug?.verificationResult ?? 'not_found';

  const statusConfig = {
    verified: {
      color: '#16a34a',
      bg: '#f0fdf4',
      border: '#bbf7d0',
      icon: 'shield-checkmark' as const,
      label: t.result.verifiedLabel,
      message: t.result.verifiedMsg,
    },
    flagged: {
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fde68a',
      icon: 'warning' as const,
      label: t.result.flaggedLabel,
      message: t.result.flaggedMsg,
    },
    not_found: {
      color: '#dc2626',
      bg: '#fef2f2',
      border: '#fecaca',
      icon: 'close-circle' as const,
      label: t.result.notFoundLabel,
      message: t.result.notFoundMsg,
    },
  };

  const status = statusConfig[verificationResult];
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
        { label: t.result.productName, value: drug.productName },
        { label: t.result.strength, value: drug.strength },
        { label: t.result.category, value: drug.category },
        { label: t.result.form, value: drug.form },
        { label: t.result.nafdacNo, value: drug.nafdacNumber },
        { label: t.result.manufacturer, value: drug.manufacturer },
        { label: t.result.registryStatus, value: drug.registryStatus },
        { label: t.result.approvalDate, value: drug.approvalDate },
      ].filter((row) => row.value)
    : [{ label: t.result.nafdacNo, value: nafdacNumber }];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
          <Pressable
            onPress={handleBack}
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
            {t.result.title}
          </Text>
        </View>

        {/* Status Badge */}
        <Animated.View style={{
          opacity: fadeAnim, transform: [{ scale: scaleAnim }],
          alignItems: 'center', paddingTop: 24, paddingBottom: 20, paddingHorizontal: 24,
        }}>
          <View style={{
            width: 96, height: 96, borderRadius: 48,
            backgroundColor: status.bg, borderWidth: 3, borderColor: status.border,
            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            shadowColor: status.color, shadowOpacity: 0.25, shadowRadius: 16, elevation: 6,
          }}>
            <Ionicons name={status.icon} size={48} color={status.color} />
          </View>

          <View style={{
            backgroundColor: status.bg, borderWidth: 1.5, borderColor: status.border,
            borderRadius: 50, paddingHorizontal: 18, paddingVertical: 6, marginBottom: 10,
          }}>
            <Text style={{ color: status.color, fontWeight: '900', fontSize: 12, letterSpacing: 1.5 }}>
              {status.label}
            </Text>
          </View>

          <Text style={{ color: '#334155', fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 }}>
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
            shadowColor: '#0B1C5A', shadowOpacity: 0.04, shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 }, elevation: 3,
            borderWidth: 1, borderColor: '#E2E8F0',
          }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#8E9CB2', letterSpacing: 1.5, marginBottom: 14, textTransform: 'uppercase' }}>
              {t.result.drugInfo}
            </Text>

            {infoRows.map((row, i, arr) => (
              <View key={row.label} style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
                paddingVertical: 10,
                borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                borderBottomColor: '#F1F5F9',
              }}>
                <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '600', flex: 1 }}>{row.label}</Text>
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
              onPress={() => router.push({ pathname: '/(user)/home/drug-details', params: { code: nafdacNumber, result, from } } as any)}
              style={({ pressed }) => ({
                backgroundColor: '#0B1C5A', borderRadius: 16, paddingVertical: 16,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Ionicons name="information-circle-outline" size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{t.result.viewDetails}</Text>
            </Pressable>
          )}

          {/* Report */}
          <Pressable
            onPress={() => router.push({ pathname: '/(user)/home/report', params: { code: nafdacNumber, drugName: drug?.productName } } as any)}
            style={({ pressed }) => ({
              backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              borderWidth: 1.5, borderColor: '#FEE2E2',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Ionicons name="flag-outline" size={20} color="#DC2626" />
            <Text style={{ color: '#DC2626', fontSize: 15, fontWeight: '700' }}>{t.result.reportSuspicious}</Text>
          </Pressable>

          {/* Scan Again */}
          <Pressable
            onPress={() => router.replace('/(user)/home/scan-ocr' as any)}
            style={({ pressed }) => ({
              alignItems: 'center', paddingVertical: 12, opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ color: '#0B1C5A', fontSize: 13, fontWeight: '700', letterSpacing: 1 }}>
              {t.result.scanAnother}
            </Text>
          </Pressable>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}
