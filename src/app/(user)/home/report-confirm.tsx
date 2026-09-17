import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n';

const BRAND = '#0B1C5A';

export default function ReportConfirmScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const params = useLocalSearchParams<{
    ref?: string;
    medName?: string;
    batchNo?: string;
    nafdacNo?: string;
    pharmacyName?: string;
    pharmacyAddress?: string;
    reason?: string;
    comments?: string;
    receiptImage?: string;
    createdAt?: string;
  }>();

  const refId = params.ref || `MV-${Math.floor(1000 + Math.random() * 9000)}-XQ`;
  const formattedDate = new Date(params.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

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
  }, [fadeAnim, scaleAnim, slideAnim]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <Animated.View style={[styles.headerCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.shieldWrap}>
            <View style={styles.shieldCircle}>
              <Ionicons name="shield-checkmark" size={48} color="#16A34A" />
            </View>
          </View>

          <Text style={styles.successTitle}>{t.report.confirmTitle}</Text>
          <Text style={styles.successSub}>{t.report.confirmSubtitle}</Text>

          {/* Reference ID */}
          <View style={styles.refBox}>
            <Text style={styles.refLabel}>{t.report.referenceCode}</Text>
            <Text style={styles.refId}>{refId}</Text>
            <Text style={styles.refDate}>Logged on {formattedDate}</Text>
          </View>
        </Animated.View>

        {/* Report Summary Details Card */}
        <Animated.View style={[styles.summaryCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={18} color={BRAND} />
            <Text style={styles.cardTitle}>Incident Report Summary</Text>
          </View>

          {/* Drug info */}
          {params.medName ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Medication:</Text>
              <Text style={styles.summaryVal}>{params.medName}</Text>
            </View>
          ) : null}

          {params.batchNo ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Batch Number:</Text>
              <Text style={styles.summaryVal}>{params.batchNo}</Text>
            </View>
          ) : null}

          {params.nafdacNo ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>NAFDAC No:</Text>
              <Text style={styles.summaryVal}>{params.nafdacNo}</Text>
            </View>
          ) : null}

          {/* Pharmacy info */}
          {params.pharmacyName ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Store / Pharmacy:</Text>
              <Text style={styles.summaryVal}>{params.pharmacyName}</Text>
            </View>
          ) : null}

          {params.pharmacyAddress ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Location Address:</Text>
              <Text style={styles.summaryVal}>{params.pharmacyAddress}</Text>
            </View>
          ) : null}

          {/* Reason */}
          {params.reason ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Report Reason:</Text>
              <View style={styles.reasonBadge}>
                <Ionicons name="warning" size={12} color="#DC2626" />
                <Text style={styles.reasonBadgeText}>{params.reason}</Text>
              </View>
            </View>
          ) : null}

          {/* Comments */}
          {params.comments ? (
            <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
              <Text style={styles.summaryLabel}>Notes & Observations:</Text>
              <Text style={styles.commentsText}>"{params.comments}"</Text>
            </View>
          ) : null}

          {/* Attached Photo Evidence */}
          {params.receiptImage ? (
            <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Ionicons name="image-outline" size={16} color={BRAND} />
                <Text style={styles.summaryLabel}>Attached Photo Evidence:</Text>
              </View>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: params.receiptImage }}
                  style={styles.attachedImage}
                  resizeMode="cover"
                />
              </View>
            </View>
          ) : null}
        </Animated.View>

        {/* Notice */}
        <Animated.View style={{ opacity: fadeAnim, marginVertical: 12 }}>
          <View style={styles.noticeBox}>
            <Ionicons name="information-circle-outline" size={18} color="#2563EB" />
            <Text style={styles.noticeText}>{t.report.confirmNotice}</Text>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.replace('/(user)/home' as any)}
          >
            <Text style={styles.primaryBtnText}>{t.report.doneBtn}</Text>
            <Ionicons name="home-outline" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace('/(user)/home/report' as any)}
          >
            <Ionicons name="flag-outline" size={16} color={BRAND} />
            <Text style={styles.secondaryBtnText}>Report Another Medication</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: BRAND,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  shieldWrap: { marginBottom: 14 },
  shieldCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  successSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  refBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
  },
  refLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  refId: {
    fontSize: 18,
    fontWeight: '900',
    color: BRAND,
    letterSpacing: 1.2,
  },
  refDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: BRAND,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: BRAND,
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    textAlign: 'right',
  },
  reasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: '65%',
  },
  reasonBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    flexShrink: 1,
  },
  commentsText: {
    fontSize: 13,
    color: '#334155',
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 4,
  },
  imageContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F1F5F9',
  },
  attachedImage: {
    width: '100%',
    height: 180,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  noticeText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 17,
    flex: 1,
    fontWeight: '500',
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
  primaryBtn: {
    backgroundColor: BRAND,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: BRAND,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryBtn: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  secondaryBtnText: {
    color: BRAND,
    fontSize: 14,
    fontWeight: '700',
  },
});
