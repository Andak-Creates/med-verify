import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BRAND = '#0B1C5A';
const STEPS = ['Drug', 'Pharmacy', 'Review', 'Submit'];

export default function ReportConfirmScreen() {
  const router = useRouter();
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
      {/* Step bar - all complete */}
      <View style={styles.stepRow}>
        {STEPS.map((label, i) => (
          <View key={label} style={styles.stepItem}>
            <View style={styles.stepDone}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
            {i < STEPS.length - 1 && <View style={styles.stepLineDone} />}
          </View>
        ))}
      </View>

      <View style={styles.stepMeta}>
        <Text style={styles.stepMetaLeft}>Step 4 of 4</Text>
        <Text style={styles.stepMetaRight}>Completed</Text>
      </View>

      <Animated.View style={[styles.successCard, { transform: [{ scale: scaleAnim }] }]}>
        {/* Shield icon */}
        <View style={styles.shieldWrap}>
          <View style={styles.shieldCircle}>
            <Ionicons name="shield-checkmark" size={52} color={BRAND} />
          </View>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
          <Text style={styles.successTitle}>Report Successfully Submitted</Text>
          <Text style={styles.successSub}>
            Your report has been encrypted and sent to NAFDAC & PCN for review.
          </Text>

          {/* Reference ID */}
          <View style={styles.refBox}>
            <Text style={styles.refLabel}>REFERENCE ID</Text>
            <Text style={styles.refId}>{refId}</Text>
          </View>

          <View style={styles.encryptRow}>
            <Ionicons name="lock-closed-outline" size={13} color="#9CA3AF" />
            <Text style={styles.encryptText}>End-to-end encrypted protocol</Text>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Actions */}
      <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace('/(user)/home' as any)}
        >
          <Text style={styles.primaryBtnText}>View Status</Text>
          <Ionicons name="open-outline" size={16} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace('/(user)/home' as any)}
        >
          <Text style={styles.secondaryBtnText}>Return Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  /* Step Row */
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepDone: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: BRAND,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  stepLineDone: { flex: 1, height: 2, backgroundColor: BRAND, marginHorizontal: 4 },
  stepMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  stepMetaLeft: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  stepMetaRight: { fontSize: 13, fontWeight: '700', color: '#10B981' },

  /* Success Card */
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    marginBottom: 28,
  },
  shieldWrap: { marginBottom: 20 },
  shieldCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#EEF1FB',
    alignItems: 'center', justifyContent: 'center',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  successSub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
    marginBottom: 24,
  },

  /* Reference */
  refBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  refLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  refId: {
    fontSize: 22,
    fontWeight: '900',
    color: BRAND,
    letterSpacing: 2,
  },

  encryptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  encryptText: { fontSize: 12, color: '#9CA3AF' },

  /* Actions */
  actions: { gap: 12 },
  primaryBtn: {
    backgroundColor: BRAND,
    borderRadius: 18,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: BRAND,
  },
  secondaryBtnText: { color: BRAND, fontSize: 16, fontWeight: '700' },
});
