import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n';

const BRAND = '#0B1C5A';

export default function ReportConfirmScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { ref } = useLocalSearchParams<{ ref?: string }>();
  const refId = ref || `MV-${Math.floor(1000 + Math.random() * 9000)}-XQ`;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, damping: 12, stiffness: 120, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.successCard, { transform: [{ scale: scaleAnim }] }]}>
        {/* Shield icon */}
        <View style={styles.shieldWrap}>
          <View style={styles.shieldCircle}>
            <Ionicons name="shield-checkmark" size={52} color={BRAND} />
          </View>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
          <Text style={styles.successTitle}>{t.report.confirmTitle}</Text>
          <Text style={styles.successSub}>
            {t.report.confirmSubtitle}
          </Text>

          {/* Reference ID */}
          <View style={styles.refBox}>
            <Text style={styles.refLabel}>{t.report.referenceCode}</Text>
            <Text style={styles.refId}>{refId}</Text>
          </View>

          <Text style={styles.noticeText}>
            {t.report.confirmNotice}
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Actions */}
      <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace('/(user)/home' as any)}
        >
          <Text style={styles.primaryBtnText}>{t.report.doneBtn}</Text>
          <Ionicons name="home-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
    paddingTop: 32,
    justifyContent: 'center',
  },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    shadowColor: BRAND,
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  shieldWrap: { marginBottom: 20 },
  shieldCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 28,
  },
  successSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  refBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
  },
  refLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  refId: {
    fontSize: 20,
    fontWeight: '900',
    color: BRAND,
    letterSpacing: 1.5,
  },
  noticeText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  actions: { gap: 12 },
  primaryBtn: {
    backgroundColor: BRAND,
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: BRAND,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
