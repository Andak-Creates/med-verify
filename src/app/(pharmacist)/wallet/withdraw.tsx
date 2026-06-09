import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BANKS = ['Access Bank', 'First Bank', 'GTBank', 'UBA', 'Zenith Bank', 'Opay', 'Palmpay'];

export default function WithdrawScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('GTBank');
  const [accountNumber, setAccountNumber] = useState('**** **** 4521');
  const [step, setStep] = useState<'form' | 'confirm'>('form');

  const available = 85400;
  const withdrawAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const fee = withdrawAmount * 0.015;
  const youReceive = withdrawAmount - fee;

  const formatNum = (n: number) =>
    n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (step === 'confirm') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('form')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#0B1C5A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm Withdrawal</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Amount display */}
          <View style={styles.confirmAmountCard}>
            <Text style={styles.confirmLabel}>Withdrawing</Text>
            <Text style={styles.confirmAmount}>₦{formatNum(withdrawAmount)}</Text>
            <View style={styles.decorCircle} />
          </View>

          {/* Breakdown */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Transaction Summary</Text>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryKey}>Amount</Text>
              <Text style={styles.summaryVal}>₦{formatNum(withdrawAmount)}</Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryKey}>Transfer Fee (1.5%)</Text>
              <Text style={[styles.summaryVal, { color: '#EF4444' }]}>− ₦{formatNum(fee)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryLine}>
              <Text style={[styles.summaryKey, { fontWeight: '800', color: '#0B1C5A' }]}>You Receive</Text>
              <Text style={[styles.summaryVal, { fontWeight: '800', color: '#065F46' }]}>₦{formatNum(youReceive)}</Text>
            </View>
          </View>

          {/* Bank details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Destination Account</Text>
            <View style={styles.bankRow}>
              <View style={styles.bankIcon}>
                <Ionicons name="business-outline" size={20} color="#0B1C5A" />
              </View>
              <View>
                <Text style={styles.bankName}>{selectedBank}</Text>
                <Text style={styles.accountNum}>{accountNumber}</Text>
              </View>
            </View>
          </View>

          <View style={styles.warningBox}>
            <Ionicons name="information-circle-outline" size={20} color="#0B1C5A" />
            <Text style={styles.warningText}>
              Funds will be credited within 24 hours. Contact support if you don't receive your payment.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomBtns}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setStep('form')}>
            <Text style={styles.cancelBtnText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmBtn} onPress={() => router.back()}>
            <Text style={styles.confirmBtnText}>Confirm Withdrawal</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0B1C5A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw Funds</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Balance pill */}
        <View style={styles.balancePill}>
          <Ionicons name="wallet-outline" size={16} color="#0B1C5A" />
          <Text style={styles.balancePillText}>Available: <Text style={{ fontWeight: '800' }}>₦{formatNum(available)}</Text></Text>
        </View>

        {/* Amount Input */}
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Withdrawal Amount</Text>
          <View style={styles.amountInputRow}>
            <Text style={styles.currencySymbol}>₦</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#CBD5E1"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
          <View style={styles.quickAmounts}>
            {['5,000', '10,000', '25,000', '50,000'].map((q) => (
              <TouchableOpacity key={q} style={styles.quickBtn} onPress={() => setAmount(q)}>
                <Text style={styles.quickBtnText}>₦{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bank Select */}
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Select Bank</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bankScroll}>
            {BANKS.map((b) => (
              <TouchableOpacity
                key={b}
                style={[styles.bankPill, selectedBank === b && styles.bankPillActive]}
                onPress={() => setSelectedBank(b)}
              >
                <Text style={[styles.bankPillText, selectedBank === b && styles.bankPillTextActive]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.inputLabel, { marginTop: 16 }]}>Account Number</Text>
          <TextInput
            style={styles.textInput}
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
          />
        </View>

        {/* Fee note */}
        {withdrawAmount > 0 && (
          <View style={styles.feeCard}>
            <View style={styles.feeLine}>
              <Text style={styles.feeKey}>Transfer fee (1.5%)</Text>
              <Text style={styles.feeVal}>₦{formatNum(fee)}</Text>
            </View>
            <View style={styles.feeLine}>
              <Text style={[styles.feeKey, { fontWeight: '800', color: '#0B1C5A' }]}>You receive</Text>
              <Text style={[styles.feeVal, { fontWeight: '800', color: '#065F46' }]}>₦{formatNum(youReceive)}</Text>
            </View>
          </View>
        )}

      </ScrollView>

      <View style={styles.bottomBtns}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmBtn, withdrawAmount <= 0 && { opacity: 0.5 }]}
          onPress={() => withdrawAmount > 0 && setStep('confirm')}
        >
          <Text style={styles.confirmBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
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
  scrollContent: { padding: 20, paddingBottom: 120 },
  balancePill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#EEF2FF', paddingHorizontal: 16,
    paddingVertical: 10, borderRadius: 20,
    alignSelf: 'flex-start', marginBottom: 20,
  },
  balancePillText: { fontSize: 14, color: '#0B1C5A', fontWeight: '600' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.02,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#0B1C5A', marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 8 },
  amountInputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 12, paddingHorizontal: 14, height: 56,
  },
  currencySymbol: { fontSize: 22, fontWeight: '800', color: '#0B1C5A', marginRight: 6 },
  amountInput: { flex: 1, fontSize: 22, fontWeight: '800', color: '#0B1C5A' },
  quickAmounts: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  quickBtn: {
    backgroundColor: '#F1F5F9', paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 20,
  },
  quickBtnText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  bankScroll: { gap: 8, paddingBottom: 4 },
  bankPill: {
    backgroundColor: '#F1F5F9', paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 20,
  },
  bankPillActive: { backgroundColor: '#0B1C5A' },
  bankPillText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  bankPillTextActive: { color: '#fff' },
  textInput: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#1E293B',
  },
  feeCard: {
    backgroundColor: '#EEF2FF', borderRadius: 12, padding: 16, gap: 8,
  },
  feeLine: { flexDirection: 'row', justifyContent: 'space-between' },
  feeKey: { fontSize: 13, color: '#475569' },
  feeVal: { fontSize: 13, color: '#475569' },
  bottomBtns: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12, padding: 20,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1, borderTopColor: '#E2E8F0',
  },
  cancelBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: '#94A3B8',
  },
  cancelBtnText: { color: '#475569', fontSize: 14, fontWeight: '700' },
  confirmBtn: {
    flex: 2, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 12, backgroundColor: '#0B1C5A',
  },
  confirmBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  // Confirm step
  confirmAmountCard: {
    backgroundColor: '#0B1460', borderRadius: 20, padding: 32,
    alignItems: 'center', marginBottom: 20, overflow: 'hidden',
  },
  confirmLabel: { fontSize: 13, color: '#93C5FD', fontWeight: '600', marginBottom: 8 },
  confirmAmount: { fontSize: 36, fontWeight: '900', color: '#fff' },
  decorCircle: {
    position: 'absolute', top: -40, right: -40,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  summaryLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryKey: { fontSize: 14, color: '#475569' },
  summaryVal: { fontSize: 14, color: '#1E293B', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 4, marginBottom: 12 },
  bankRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bankIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center',
  },
  bankName: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  accountNum: { fontSize: 13, color: '#64748B' },
  warningBox: {
    flexDirection: 'row', gap: 10, backgroundColor: '#EEF2FF',
    borderRadius: 12, padding: 14, marginTop: 4,
  },
  warningText: { flex: 1, fontSize: 13, color: '#475569', lineHeight: 20 },
});
