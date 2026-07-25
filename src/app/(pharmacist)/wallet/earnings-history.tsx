import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '@/hooks/useWallet';
import type { WalletTransaction } from '@/types/api';
import { formatKobo } from '@/utils/money';

const CATEGORY_META: Record<
  WalletTransaction['category'],
  { label: string; icon: string; iconBg: string; iconColor: string }
> = {
  session_earning: { label: 'Session Earning', icon: 'medkit-outline', iconBg: '#E0E7FF', iconColor: '#3730A3' },
  withdrawal: { label: 'Withdrawal', icon: 'cash-outline', iconBg: '#FEE2E2', iconColor: '#991B1B' },
  withdrawal_reversal: { label: 'Withdrawal Reversed', icon: 'refresh-outline', iconBg: '#FEF9C3', iconColor: '#92400E' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EarningsHistoryScreen() {
  const router = useRouter();
  const { wallet, transactions, isLoading, isRefreshing, error, refresh } = useWallet();

  const earnings = useMemo(
    () => transactions.filter((t) => t.category === 'session_earning'),
    [transactions],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(pharmacist)/wallet' as any)} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0B1C5A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings History</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0B1C5A" />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
          <Ionicons name="alert-circle-outline" size={36} color="#9CA3AF" />
          <Text style={{ marginTop: 12, color: '#6B7280', textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity onPress={refresh} style={{ marginTop: 12 }}>
            <Text style={{ color: '#0B1C5A', fontWeight: '700' }}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor="#0B1C5A" />}
        >
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Earned</Text>
                <Text style={styles.summaryValue}>{formatKobo(wallet?.totalEarnedKobo ?? 0)}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Available</Text>
                <Text style={[styles.summaryValue, { color: '#38BDF8' }]}>{formatKobo(wallet?.balanceKobo ?? 0)}</Text>
              </View>
            </View>
            <View style={styles.feeNote}>
              <Ionicons name="information-circle-outline" size={14} color="rgba(255,255,255,0.6)" />
              <Text style={styles.feeNoteText}>In escrow (pending completion): {formatKobo(wallet?.pendingKobo ?? 0)}</Text>
            </View>
            <View style={styles.decorCircle} />
          </View>

          {/* Earnings List */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Session Earnings</Text>
            <Text style={styles.sectionSub}>
              {earnings.length} {earnings.length === 1 ? 'entry' : 'entries'}
            </Text>
          </View>

          {earnings.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Ionicons name="wallet-outline" size={32} color="#9CA3AF" />
              <Text style={{ marginTop: 10, color: '#6B7280', textAlign: 'center' }}>
                No earnings yet. Completed paid sessions will appear here.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {earnings.map((item, index) => {
                const meta = CATEGORY_META[item.category];
                const settled = item.status === 'available';
                return (
                  <View key={item.id}>
                    <View style={styles.earningRow}>
                      <View style={[styles.iconBox, { backgroundColor: meta.iconBg }]}>
                        <Ionicons name={meta.icon as any} size={20} color={meta.iconColor} />
                      </View>
                      <View style={styles.earningInfo}>
                        <Text style={styles.patientName}>{meta.label}</Text>
                        <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
                      </View>
                      <View style={styles.earningAmounts}>
                        <Text style={styles.netAmount}>+ {formatKobo(item.amountKobo)}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: settled ? '#D1FAE5' : '#FEF9C3' }]}>
                          <Text style={[styles.statusText, { color: settled ? '#065F46' : '#92400E' }]}>
                            {settled ? 'Settled' : 'In escrow'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {index < earnings.length - 1 && <View style={styles.rowDivider} />}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0B1C5A' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  summaryCard: {
    backgroundColor: '#0B1460',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.15)' },
  summaryLabel: { fontSize: 12, fontWeight: '600', color: '#93C5FD', marginBottom: 6 },
  summaryValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  feeNote: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  feeNoteText: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  decorCircle: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0B1C5A' },
  sectionSub: { fontSize: 13, color: '#64748B' },
  list: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  earningRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  earningInfo: { flex: 1 },
  patientName: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 3 },
  metaText: { fontSize: 12, color: '#64748B' },
  earningAmounts: { alignItems: 'flex-end', gap: 4 },
  netAmount: { fontSize: 14, fontWeight: '800', color: '#065F46' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
  rowDivider: { height: 1, backgroundColor: '#F1F5F9' },
});
