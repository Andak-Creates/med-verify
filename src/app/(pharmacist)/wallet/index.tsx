import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WalletScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80' }} 
            style={styles.avatar} 
          />
          <Text style={styles.headerTitle}>MedVerify</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color="#0B1C5A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceTop}>
            <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
            <Text style={styles.balanceAmount}>₦85,400.00</Text>
          </View>
          
          <View style={styles.balanceDivider} />
          
          <View style={styles.balanceBottom}>
            <Text style={styles.totalEarningsLabel}>Total Earnings</Text>
            <Text style={styles.totalEarningsAmount}>₦142,500.00</Text>
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

        <View style={styles.earningsList}>
          
          {/* Item 1 */}
          <View style={styles.earningItem}>
            <View style={styles.earningLeft}>
              <View style={[styles.earningIconBox, { backgroundColor: '#E0E7FF' }]}>
                <Ionicons name="medkit-outline" size={20} color="#3730A3" />
              </View>
              <View>
                <Text style={styles.earningName}>Amara Okafor</Text>
                <Text style={styles.earningMeta}>Full Health • Oct 24, 2023</Text>
              </View>
            </View>
            <View style={styles.earningRight}>
              <Text style={styles.earningValueGreen}>+ ₦6,750.00</Text>
              <Text style={styles.earningValueStrikethrough}>₦7,500</Text>
            </View>
          </View>

          {/* Item 2 */}
          <View style={styles.earningItem}>
            <View style={styles.earningLeft}>
              <View style={[styles.earningIconBox, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="link-outline" size={20} color="#6B21A8" />
              </View>
              <View>
                <Text style={styles.earningName}>David Chen</Text>
                <Text style={styles.earningMeta}>Drug Inquiry • Oct 23, 2023</Text>
              </View>
            </View>
            <View style={styles.earningRight}>
              <Text style={styles.earningValueGreen}>+ ₦2,250.00</Text>
              <Text style={styles.earningValueStrikethrough}>₦2,500</Text>
            </View>
          </View>

          {/* Item 3 */}
          <View style={styles.earningItem}>
            <View style={styles.earningLeft}>
              <View style={[styles.earningIconBox, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="link-outline" size={20} color="#6B21A8" />
              </View>
              <View>
                <Text style={styles.earningName}>Tunde Afolayan</Text>
                <Text style={styles.earningMeta}>Drug Inquiry • Oct 21, 2023</Text>
              </View>
            </View>
            <View style={styles.earningRight}>
              <Text style={styles.earningValueGreen}>+ ₦2,250.00</Text>
              <Text style={styles.earningValueStrikethrough}>₦2,500</Text>
            </View>
          </View>

          {/* Item 4 */}
          <View style={styles.earningItem}>
            <View style={styles.earningLeft}>
              <View style={[styles.earningIconBox, { backgroundColor: '#E0E7FF' }]}>
                <Ionicons name="medkit-outline" size={20} color="#3730A3" />
              </View>
              <View>
                <Text style={styles.earningName}>Sarah Williams</Text>
                <Text style={styles.earningMeta}>Full Health • Oct 20, 2023</Text>
              </View>
            </View>
            <View style={styles.earningRight}>
              <Text style={styles.earningValueGreen}>+ ₦6,750.00</Text>
              <Text style={styles.earningValueStrikethrough}>₦7,500</Text>
            </View>
          </View>

        </View>

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
