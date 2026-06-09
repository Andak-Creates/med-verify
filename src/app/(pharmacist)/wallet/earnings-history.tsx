import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type EarningEntry = {
  id: string;
  patient: string;
  type: 'Full Health' | 'Drug Inquiry';
  date: string;
  gross: string;
  net: string;
  status: 'Settled' | 'Pending';
};

const EARNINGS: EarningEntry[] = [
  { id: '1', patient: 'Amara Okafor',    type: 'Full Health',  date: 'Oct 24, 2023', gross: '₦7,500',  net: '₦6,750', status: 'Settled' },
  { id: '2', patient: 'David Chen',      type: 'Drug Inquiry', date: 'Oct 23, 2023', gross: '₦2,500',  net: '₦2,250', status: 'Settled' },
  { id: '3', patient: 'Tunde Afolayan',  type: 'Drug Inquiry', date: 'Oct 21, 2023', gross: '₦2,500',  net: '₦2,250', status: 'Settled' },
  { id: '4', patient: 'Sarah Williams',  type: 'Full Health',  date: 'Oct 20, 2023', gross: '₦7,500',  net: '₦6,750', status: 'Settled' },
  { id: '5', patient: 'Ngozi Adeyemi',   type: 'Drug Inquiry', date: 'Oct 18, 2023', gross: '₦2,500',  net: '₦2,250', status: 'Settled' },
  { id: '6', patient: 'Emeka Obi',       type: 'Full Health',  date: 'Oct 15, 2023', gross: '₦7,500',  net: '₦6,750', status: 'Settled' },
  { id: '7', patient: 'Fatima Al-Rashid',type: 'Drug Inquiry', date: 'Oct 12, 2023', gross: '₦2,500',  net: '₦2,250', status: 'Pending' },
  { id: '8', patient: 'Chisom Eze',      type: 'Full Health',  date: 'Oct 10, 2023', gross: '₦7,500',  net: '₦6,750', status: 'Settled' },
];

const MONTHS = ['Oct 2023', 'Sep 2023', 'Aug 2023'];

export default function EarningsHistoryScreen() {
  const router = useRouter();

  const totalGross = '₦39,500.00';
  const totalNet = '₦35,550.00';
  const totalFees = '₦3,950.00';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0B1C5A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings History</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={22} color="#0B1C5A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Gross Earnings</Text>
              <Text style={styles.summaryValue}>{totalGross}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Net Received</Text>
              <Text style={[styles.summaryValue, { color: '#38BDF8' }]}>{totalNet}</Text>
            </View>
          </View>
          <View style={styles.feeNote}>
            <Ionicons name="information-circle-outline" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.feeNoteText}>Platform fee deducted: {totalFees}</Text>
          </View>
          {/* Decorative circle */}
          <View style={styles.decorCircle} />
        </View>

        {/* Month Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll} contentContainerStyle={styles.monthContainer}>
          {MONTHS.map((m, i) => (
            <TouchableOpacity key={m} style={[styles.monthPill, i === 0 && styles.monthPillActive]}>
              <Text style={[styles.monthPillText, i === 0 && styles.monthPillTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Earnings List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>October 2023</Text>
          <Text style={styles.sectionSub}>8 transactions</Text>
        </View>

        <View style={styles.list}>
          {EARNINGS.map((item, index) => (
            <View key={item.id}>
              <View style={styles.earningRow}>
                <View style={[styles.iconBox, { backgroundColor: item.type === 'Full Health' ? '#E0E7FF' : '#F3E8FF' }]}>
                  <Ionicons
                    name={item.type === 'Full Health' ? 'medkit-outline' : 'link-outline'}
                    size={20}
                    color={item.type === 'Full Health' ? '#3730A3' : '#6B21A8'}
                  />
                </View>
                <View style={styles.earningInfo}>
                  <Text style={styles.patientName}>{item.patient}</Text>
                  <Text style={styles.metaText}>{item.type} · {item.date}</Text>
                </View>
                <View style={styles.earningAmounts}>
                  <Text style={styles.netAmount}>+ {item.net}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: item.status === 'Settled' ? '#D1FAE5' : '#FEF9C3' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'Settled' ? '#065F46' : '#92400E' }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              </View>
              {index < EARNINGS.length - 1 && <View style={styles.rowDivider} />}
            </View>
          ))}
        </View>

      </ScrollView>
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
  filterBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
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
    position: 'absolute', top: -50, right: -50,
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  monthScroll: { marginBottom: 20 },
  monthContainer: { gap: 10, paddingRight: 20 },
  monthPill: {
    backgroundColor: '#E2E8F0', paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: 20,
  },
  monthPillActive: { backgroundColor: '#0B1C5A' },
  monthPillText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  monthPillTextActive: { color: '#fff' },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0B1C5A' },
  sectionSub: { fontSize: 13, color: '#64748B' },
  list: {
    backgroundColor: '#fff', borderRadius: 16,
    paddingHorizontal: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.02,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  earningRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, gap: 12,
  },
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
