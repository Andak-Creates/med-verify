import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Platform,
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

const TXN_DISPLAY: Record<
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

export default function WalletScreen() {
  const router = useRouter();
  const mainScrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      mainScrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const { wallet, bankAccount, transactions, isLoading, isRefreshing, error, refresh } = useWallet();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/(pharmacist)/notifications' as any)}>
          <Ionicons name="notifications-outline" size={24} color="#0B1C5A" />
        </TouchableOpacity>
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
          ref={mainScrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor="#0B1C5A" />}
        >
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceTop}>
              <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
              <Text style={styles.balanceAmount}>{formatKobo(wallet?.balanceKobo ?? 0)}</Text>
            </View>

            <View style={styles.balanceDivider} />

            <View style={styles.balanceBottomRow}>
              <View>
                <Text style={styles.subLabel}>Pending (in escrow)</Text>
                <Text style={styles.subAmount}>{formatKobo(wallet?.pendingKobo ?? 0)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.subLabel}>Total Earned</Text>
                <Text style={styles.subAmount}>{formatKobo(wallet?.totalEarnedKobo ?? 0)}</Text>
              </View>
            </View>

            <View style={styles.decorativeCircle} />
          </View>

          {/* Withdraw Button */}
          <TouchableOpacity
            style={[styles.withdrawBtn, (wallet?.balanceKobo ?? 0) <= 0 && { opacity: 0.5 }]}
            disabled={(wallet?.balanceKobo ?? 0) <= 0}
            onPress={() => router.push('/(pharmacist)/wallet/withdraw' as any)}
          >
            <Ionicons name="cash-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.withdrawBtnText}>Withdraw Funds</Text>
          </TouchableOpacity>

          {/* Note */}
          <View style={styles.noteRow}>
            <Text style={styles.noteText}>
              Earnings are held in escrow and released to your{'\n'}balance once each session is completed.
            </Text>
            <TouchableOpacity onPress={() => router.push('/(pharmacist)/wallet/earnings-history' as any)}>
              <Text style={styles.historyLink}>History</Text>
            </TouchableOpacity>
          </View>

          {/* Payout Bank Account Card */}
          <View style={{ backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginVertical: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="card-outline" size={18} color="#0B1C5A" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0B1C5A' }}>Payout Bank Account</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(pharmacist)/wallet/withdraw' as any)}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#16a34a' }}>
                  {bankAccount ? 'Manage' : '+ Add Account'}
                </Text>
              </TouchableOpacity>
            </View>

            {bankAccount ? (
              <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#F1F5F9' }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#0B1C5A' }}>{bankAccount.accountName}</Text>
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  {bankAccount.bankName} • <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: '700' }}>{bankAccount.accountNumber}</Text>
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => router.push('/(pharmacist)/wallet/withdraw' as any)}
                style={{ backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <Ionicons name="alert-circle-outline" size={20} color="#D97706" />
                <Text style={{ fontSize: 12, color: '#B45309', flex: 1, fontWeight: '600' }}>
                  No payout account linked yet. Tap to add your 10-digit bank account.
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Recent Activity */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>

          {transactions.length === 0 ? (
            <View style={{ paddingVertical: 30, alignItems: 'center' }}>
              <Ionicons name="receipt-outline" size={32} color="#9CA3AF" />
              <Text style={{ marginTop: 10, color: '#6B7280', textAlign: 'center' }}>
                No transactions yet. Completed sessions will appear here.
              </Text>
            </View>
          ) : (
            <View style={styles.earningsList}>
              {transactions.slice(0, 8).map((t) => {
                const d = TXN_DISPLAY[t.category];
                const isCredit = t.type === 'credit';
                return (
                  <View key={t.id} style={styles.earningItem}>
                    <View style={styles.earningLeft}>
                      <View style={[styles.earningIconBox, { backgroundColor: d.iconBg }]}>
                        <Ionicons name={d.icon as any} size={20} color={d.iconColor} />
                      </View>
                      <View>
                        <Text style={styles.earningName}>{d.label}</Text>
                        <Text style={styles.earningMeta}>
                          {formatDate(t.createdAt)}
                          {t.status === 'pending' ? ' • In escrow' : ''}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.earningValue, { color: isCredit ? '#065F46' : '#991B1B' }]}>
                      {isCredit ? '+ ' : '− '}
                      {formatKobo(t.amountKobo)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#1E1B4B" style={{ marginTop: 2 }} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Escrow protection</Text>
              <Text style={styles.infoText}>
                A platform commission is deducted at payment. Your net earning is released to your withdrawable
                balance when the session is completed.
              </Text>
            </View>
          </View>
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
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0B1C5A' },
  notificationBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 20, paddingBottom: 120 },
  balanceCard: {
    backgroundColor: '#0B1460',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  balanceTop: { marginBottom: 4 },
  balanceLabel: { fontSize: 12, fontWeight: '700', color: '#93C5FD', letterSpacing: 0.5, marginBottom: 8 },
  balanceAmount: { fontSize: 36, fontWeight: '900', color: '#38BDF8', letterSpacing: -0.5 },
  balanceDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 16 },
  balanceBottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
  subLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 4 },
  subAmount: { fontSize: 18, fontWeight: '700', color: '#93C5FD' },
  decorativeCircle: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  withdrawBtn: {
    backgroundColor: '#1E1B4B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    marginBottom: 16,
  },
  withdrawBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  noteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  noteText: { fontSize: 13, color: '#64748B', lineHeight: 18, flex: 1 },
  historyLink: { fontSize: 15, fontWeight: '700', color: '#1E1B4B', marginLeft: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0B1C5A' },
  earningsList: { gap: 12, marginBottom: 24 },
  earningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
  },
  earningLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  earningIconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  earningName: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  earningMeta: { fontSize: 13, color: '#64748B' },
  earningValue: { fontSize: 15, fontWeight: '800' },
  infoBox: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 16, padding: 16, gap: 12 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#1E1B4B', marginBottom: 4 },
  infoText: { fontSize: 13, color: '#475569', lineHeight: 20 },
});
