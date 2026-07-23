import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePharmacistProfile } from '@/hooks/usePharmacistProfile';
import { usePharmacistConsultations } from '@/hooks/usePharmacistConsultations';

function formatEarningDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function WalletScreen() {
  const router = useRouter();
  const { profile } = usePharmacistProfile();
  const firstName = (profile?.fullName ?? profile?.username ?? 'Wallet').split(' ')[0];

  const { items: pastConsultations, isLoading } = usePharmacistConsultations('past');
  
  const completed = pastConsultations.filter(c => c.status === 'COMPLETED');
  const totalEarnings = completed.reduce((sum, c) => sum + (c.feeAmount * 0.9), 0);
  const availableBalance = totalEarnings; // Assuming all completed earnings are available

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.push('/(pharmacist)/profile' as any)}>
            {profile?.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="person-outline" size={18} color="#0B1C5A" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{firstName}</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/(pharmacist)/notifications' as any)}>
          <Ionicons name="notifications-outline" size={24} color="#0B1C5A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceTop}>
            <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
            <Text style={styles.balanceAmount}>₦{availableBalance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </View>
          
          <View style={styles.balanceDivider} />
          
          <View style={styles.balanceBottom}>
            <Text style={styles.totalEarningsLabel}>Total Earnings</Text>
            <Text style={styles.totalEarningsAmount}>₦{totalEarnings.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </View>

          {/* Decorative Circle */}
          <View style={styles.decorativeCircle} />
        </View>

        {/* Withdraw Button */}
        <TouchableOpacity style={styles.withdrawBtn} onPress={() => router.push('/(pharmacist)/wallet/withdraw' as any)}>
          <Ionicons name="cash-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.withdrawBtnText}>Withdraw Funds</Text>
        </TouchableOpacity>

        {/* Note */}
        <View style={styles.noteRow}>
          <Text style={styles.noteText}>
            Note: 10% platform fee applies to all{'\n'}consultation payouts.
          </Text>
          <TouchableOpacity onPress={() => router.push('/(pharmacist)/wallet/earnings-history' as any)}>
            <Text style={styles.historyLink}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Earnings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Earnings</Text>
          <TouchableOpacity>
            <Ionicons name="filter-outline" size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#0B1C5A" style={{ marginTop: 20, marginBottom: 40 }} />
        ) : (
          <View style={styles.earningsList}>
            {completed.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#64748B', marginTop: 10, marginBottom: 20 }}>No earnings yet.</Text>
            ) : (
              completed.slice(0, 5).map((consultation) => {
                const isDrug = consultation.consultationType !== 'both' && consultation.feeAmount < 4000; // heuristic or check fee amount
                const iconName = consultation.feeAmount > 4000 ? 'medkit-outline' : 'link-outline';
                const iconColor = consultation.feeAmount > 4000 ? '#3730A3' : '#6B21A8';
                const iconBg = consultation.feeAmount > 4000 ? '#E0E7FF' : '#F3E8FF';
                const typeLabel = consultation.feeAmount > 4000 ? 'Full Health' : 'Drug Inquiry';

                const netFee = consultation.feeAmount * 0.9;

                return (
                  <View key={consultation.id} style={styles.earningItem}>
                    <View style={styles.earningLeft}>
                      <View style={[styles.earningIconBox, { backgroundColor: iconBg }]}>
                        <Ionicons name={iconName} size={20} color={iconColor} />
                      </View>
                      <View>
                        <Text style={styles.earningName}>{consultation.patient.fullName ?? 'Patient'}</Text>
                        <Text style={styles.earningMeta}>{typeLabel} • {formatEarningDate(consultation.consultationDate)}</Text>
                      </View>
                    </View>
                    <View style={styles.earningRight}>
                      <Text style={styles.earningValueGreen}>+ ₦{netFee.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                      <Text style={styles.earningValueStrikethrough}>₦{consultation.feeAmount.toLocaleString('en-NG')}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#1E1B4B" style={{ marginTop: 2 }} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Payout Verification</Text>
            <Text style={styles.infoText}>Earnings are verified and settled within 24 hours of consultation completion.</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C5A',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  balanceCard: {
    backgroundColor: '#0B1460',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  balanceTop: {
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#93C5FD',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: -0.5,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 16,
  },
  balanceBottom: {},
  totalEarningsLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  totalEarningsAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#93C5FD',
  },
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
  withdrawBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  noteText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  historyLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C5A',
  },
  earningsList: {
    gap: 12,
    marginBottom: 24,
  },
  earningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
  },
  earningLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  earningIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earningName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  earningMeta: {
    fontSize: 13,
    color: '#64748B',
  },
  earningRight: {
    alignItems: 'flex-end',
  },
  earningValueGreen: {
    fontSize: 15,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 4,
  },
  earningValueStrikethrough: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
});
