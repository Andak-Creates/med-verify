import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FeeType = {
  id: string;
  label: string;
  description: string;
  amount: string;
  icon: string;
};

const INITIAL_FEES: FeeType[] = [
  { id: '1', label: 'Drug-Specific Inquiry', description: 'Quick questions about specific medications', amount: '3000', icon: 'link-outline' },
  { id: '2', label: 'Full Health Consultation', description: 'Comprehensive patient consultation session', amount: '8000', icon: 'medkit-outline' },
];

export default function FeeSettingsScreen() {
  const router = useRouter();
  const [fees, setFees] = useState(INITIAL_FEES);
  const [editingId, setEditingId] = useState<string | null>(null);

  const updateAmount = (id: string, val: string) => {
    setFees((prev) => prev.map((f) => f.id === id ? { ...f, amount: val.replace(/[^0-9]/g, '') } : f));
  };

  const platformMin = 1000;
  const platformMax = 10000;

  const isValid = (amount: string) => {
    const n = parseInt(amount, 10);
    return !isNaN(n) && n >= platformMin && n <= platformMax;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0B1C5A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fee Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <Text style={styles.pageSubtitle}>
          Set your consultation fees. All prices must be within the platform's allowed range.
        </Text>

        {/* Range info card */}
        <View style={styles.rangeCard}>
          <View style={styles.rangeAccentBar} />
          <View style={styles.rangeContent}>
            <Text style={styles.rangeTitle}>Platform Fee Policy</Text>
            <Text style={styles.rangeText}>
              Consultation fees must be between{' '}
              <Text style={{ fontWeight: '800', color: '#0B1C5A' }}>₦1,000</Text> and{' '}
              <Text style={{ fontWeight: '800', color: '#0B1C5A' }}>₦10,000</Text>.{'\n'}
              A <Text style={{ fontWeight: '800' }}>10% platform commission</Text> is automatically deducted from each payout.
            </Text>
          </View>
        </View>

        {/* Fee Cards */}
        {fees.map((fee) => {
          const isEditing = editingId === fee.id;
          const valid = isValid(fee.amount);
          const net = valid ? (parseInt(fee.amount) * 0.9).toLocaleString('en-NG') : '—';

          return (
            <View key={fee.id} style={styles.feeCard}>
              {/* Card Header */}
              <View style={styles.feeCardHeader}>
                <View style={styles.feeIconWrap}>
                  <Ionicons name={fee.icon as any} size={20} color="#0B1C5A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.feeLabel}>{fee.label}</Text>
                  <Text style={styles.feeDesc}>{fee.description}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Amount row */}
              <View style={styles.amountRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.amountLabel}>Your Price</Text>
                  {isEditing ? (
                    <View style={styles.inputRow}>
                      <Text style={styles.currencyPrefix}>₦</Text>
                      <TextInput
                        style={[styles.amountInput, !valid && { borderColor: '#EF4444' }]}
                        keyboardType="numeric"
                        value={fee.amount}
                        onChangeText={(v) => updateAmount(fee.id, v)}
                        autoFocus
                      />
                    </View>
                  ) : (
                    <Text style={styles.amountDisplay}>₦{parseInt(fee.amount).toLocaleString('en-NG')}</Text>
                  )}
                </View>
                <View style={styles.netColumn}>
                  <Text style={styles.amountLabel}>You Receive</Text>
                  <Text style={styles.netAmount}>₦{net}</Text>
                </View>
              </View>

              {!valid && isEditing && (
                <Text style={styles.errorText}>Must be between ₦1,000 – ₦10,000</Text>
              )}

              {/* Edit / Save toggle */}
              <TouchableOpacity
                style={[styles.editBtn, isEditing && valid && styles.saveBtn]}
                onPress={() => setEditingId(isEditing ? null : fee.id)}
              >
                <Ionicons
                  name={isEditing ? 'checkmark' : 'pencil'}
                  size={16}
                  color={isEditing && valid ? '#fff' : '#0B1C5A'}
                />
                <Text style={[styles.editBtnText, isEditing && valid && { color: '#fff' }]}>
                  {isEditing ? 'Save Price' : 'Edit Price'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Save all button */}
        <TouchableOpacity style={styles.saveAllBtn} onPress={() => router.back()}>
          <Text style={styles.saveAllText}>Save All Changes</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0B1C5A' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  pageSubtitle: { fontSize: 14, color: '#475569', marginBottom: 20, lineHeight: 20 },
  rangeCard: {
    flexDirection: 'row', backgroundColor: '#EEF2FF',
    borderRadius: 12, marginBottom: 24, overflow: 'hidden',
  },
  rangeAccentBar: { width: 4, backgroundColor: '#0B1C5A' },
  rangeContent: { flex: 1, padding: 14 },
  rangeTitle: { fontSize: 13, fontWeight: '800', color: '#0B1C5A', marginBottom: 6 },
  rangeText: { fontSize: 13, color: '#475569', lineHeight: 20 },
  feeCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.02,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  feeCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  feeIconWrap: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center',
  },
  feeLabel: { fontSize: 14, fontWeight: '800', color: '#0B1C5A', marginBottom: 3 },
  feeDesc: { fontSize: 12, color: '#64748B', lineHeight: 16 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 14 },
  amountRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  amountLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 4 },
  amountDisplay: { fontSize: 22, fontWeight: '900', color: '#0B1C5A' },
  netColumn: { alignItems: 'flex-end' },
  netAmount: { fontSize: 18, fontWeight: '800', color: '#065F46' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  currencyPrefix: { fontSize: 20, fontWeight: '800', color: '#0B1C5A', marginRight: 4 },
  amountInput: {
    fontSize: 20, fontWeight: '800', color: '#0B1C5A',
    borderBottomWidth: 2, borderBottomColor: '#0B1C5A',
    paddingBottom: 2, minWidth: 80,
  },
  errorText: { fontSize: 12, color: '#EF4444', marginBottom: 8 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#EEF2FF', paddingVertical: 10, borderRadius: 10,
  },
  saveBtn: { backgroundColor: '#0B1C5A' },
  editBtnText: { fontSize: 13, fontWeight: '700', color: '#0B1C5A' },
  saveAllBtn: {
    backgroundColor: '#0B1C5A', paddingVertical: 16,
    borderRadius: 14, alignItems: 'center', marginTop: 8,
  },
  saveAllText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
