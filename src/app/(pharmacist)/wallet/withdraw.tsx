import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApiErrorMessage } from '@/api/client';
import * as walletService from '@/services/wallet.service';
import type { Bank, BankAccount, Wallet } from '@/types/api';
import { formatKobo, nairaToKobo } from '@/utils/money';

const MIN_WITHDRAWAL_KOBO = 100_000; // ₦1,000 — matches the backend minimum

export default function WithdrawScreen() {
  const router = useRouter();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [bank, setBank] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Bank setup form
  const [banks, setBanks] = useState<Bank[]>([]);
  const [editingBank, setEditingBank] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [selectedBankCode, setSelectedBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [savingBank, setSavingBank] = useState(false);

  // Withdrawal
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [submitting, setSubmitting] = useState(false);

  const available = wallet?.balanceKobo ?? 0;
  const amountKobo = nairaToKobo(amount);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [w, b] = await Promise.all([walletService.getWallet(), walletService.getBankAccount()]);
      setWallet(w);
      setBank(b);
      if (!b) {
        setEditingBank(true);
        const list = await walletService.getBanks();
        setBanks(list);
      }
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Could not load your wallet.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredBanks = useMemo(() => {
    const term = bankSearch.trim().toLowerCase();
    const list = term ? banks.filter((b) => b.name.toLowerCase().includes(term)) : banks;
    return list.slice(0, 30);
  }, [banks, bankSearch]);

  const startEditingBank = async () => {
    setEditingBank(true);
    if (banks.length === 0) {
      try {
        setBanks(await walletService.getBanks());
      } catch (err) {
        Alert.alert('Could not load banks', getApiErrorMessage(err));
      }
    }
  };

  const handleSaveBank = async () => {
    if (!selectedBankCode) {
      Alert.alert('Select a bank', 'Please choose your bank from the list.');
      return;
    }
    if (!/^\d{10}$/.test(accountNumber)) {
      Alert.alert('Invalid account number', 'Enter your 10-digit account number.');
      return;
    }
    setSavingBank(true);
    try {
      const saved = await walletService.saveBankAccount({ bankCode: selectedBankCode, accountNumber });
      setBank(saved);
      setEditingBank(false);
      Alert.alert('Account verified', `Payouts will go to ${saved.accountName}.`);
    } catch (err) {
      Alert.alert('Could not save account', getApiErrorMessage(err, 'Please check the details and try again.'));
    } finally {
      setSavingBank(false);
    }
  };

  const handleSubmitWithdrawal = async () => {
    setSubmitting(true);
    try {
      await walletService.createWithdrawal(amountKobo);
      Alert.alert(
        'Withdrawal requested',
        'Your payout is being processed and will arrive shortly.',
        [{ text: 'Done', onPress: () => router.back() }],
      );
    } catch (err) {
      Alert.alert('Withdrawal failed', getApiErrorMessage(err, 'Please try again in a moment.'));
      setStep('form');
    } finally {
      setSubmitting(false);
    }
  };

  const validationError = (): string | null => {
    if (amountKobo <= 0) return null;
    if (amountKobo < MIN_WITHDRAWAL_KOBO) return `Minimum withdrawal is ${formatKobo(MIN_WITHDRAWAL_KOBO, false)}`;
    if (amountKobo > available) return 'Amount exceeds your available balance';
    return null;
  };
  const amountError = validationError();
  const canContinue = amountKobo >= MIN_WITHDRAWAL_KOBO && amountKobo <= available && !!bank;

  // ── Loading / error ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0B1C5A" />
        </View>
      </SafeAreaView>
    );
  }
  if (loadError) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
          <Ionicons name="alert-circle-outline" size={36} color="#9CA3AF" />
          <Text style={{ marginTop: 12, color: '#6B7280', textAlign: 'center' }}>{loadError}</Text>
          <TouchableOpacity onPress={loadData} style={{ marginTop: 12 }}>
            <Text style={{ color: '#0B1C5A', fontWeight: '700' }}>Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Confirm step ────────────────────────────────────────────────────────────
  if (step === 'confirm' && bank) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('form')} style={styles.backBtn} disabled={submitting}>
            <Ionicons name="arrow-back" size={24} color="#0B1C5A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm Withdrawal</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.confirmAmountCard}>
            <Text style={styles.confirmLabel}>Withdrawing</Text>
            <Text style={styles.confirmAmount}>{formatKobo(amountKobo)}</Text>
            <View style={styles.decorCircle} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Destination Account</Text>
            <View style={styles.bankRow}>
              <View style={styles.bankIcon}>
                <Ionicons name="business-outline" size={20} color="#0B1C5A" />
              </View>
              <View>
                <Text style={styles.bankName}>{bank.bankName ?? bank.accountName}</Text>
                <Text style={styles.accountNum}>
                  {bank.accountName} • {bank.accountNumber}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.warningBox}>
            <Ionicons name="information-circle-outline" size={20} color="#0B1C5A" />
            <Text style={styles.warningText}>
              Funds are transferred to your bank via Paystack. This usually completes within minutes.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomBtns}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setStep('form')} disabled={submitting}>
            <Text style={styles.cancelBtnText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.confirmBtn, submitting && { opacity: 0.7 }]} onPress={handleSubmitWithdrawal} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Confirm Withdrawal</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Form step ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(pharmacist)/wallet' as any)} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0B1C5A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw Funds</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Balance pill */}
        <View style={styles.balancePill}>
          <Ionicons name="wallet-outline" size={16} color="#0B1C5A" />
          <Text style={styles.balancePillText}>
            Available: <Text style={{ fontWeight: '800' }}>{formatKobo(available)}</Text>
          </Text>
        </View>

        {/* Bank account section */}
        {bank && !editingBank ? (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>Payout Account</Text>
              <TouchableOpacity onPress={startEditingBank}>
                <Text style={styles.changeLink}>Change</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bankRow}>
              <View style={styles.bankIcon}>
                <Ionicons name="business-outline" size={20} color="#0B1C5A" />
              </View>
              <View>
                <Text style={styles.bankName}>{bank.bankName ?? 'Bank account'}</Text>
                <Text style={styles.accountNum}>
                  {bank.accountName} • {bank.accountNumber}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Add Payout Account</Text>

            <Text style={styles.inputLabel}>Search bank</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. GTBank"
              placeholderTextColor="#94A3B8"
              value={bankSearch}
              onChangeText={setBankSearch}
            />
            <View style={styles.bankList}>
              {filteredBanks.map((b) => (
                <TouchableOpacity
                  key={b.code}
                  style={[styles.bankOption, selectedBankCode === b.code && styles.bankOptionActive]}
                  onPress={() => setSelectedBankCode(b.code)}
                >
                  <Text style={[styles.bankOptionText, selectedBankCode === b.code && styles.bankOptionTextActive]}>
                    {b.name}
                  </Text>
                  {selectedBankCode === b.code && <Ionicons name="checkmark-circle" size={18} color="#0B1C5A" />}
                </TouchableOpacity>
              ))}
              {filteredBanks.length === 0 && <Text style={styles.emptyHint}>No banks match your search.</Text>}
            </View>

            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Account Number</Text>
            <TextInput
              style={styles.textInput}
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="numeric"
              maxLength={10}
              placeholder="10-digit account number"
              placeholderTextColor="#94A3B8"
            />

            <TouchableOpacity
              style={[styles.verifyBtn, savingBank && { opacity: 0.7 }]}
              onPress={handleSaveBank}
              disabled={savingBank}
            >
              {savingBank ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyBtnText}>Verify & Save Account</Text>}
            </TouchableOpacity>
            {bank && (
              <TouchableOpacity style={{ alignItems: 'center', marginTop: 12 }} onPress={() => setEditingBank(false)}>
                <Text style={styles.changeLink}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Amount — only once a bank is saved */}
        {bank && !editingBank && (
          <>
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
                {['5,000', '10,000', '25,000'].map((q) => (
                  <TouchableOpacity key={q} style={styles.quickBtn} onPress={() => setAmount(q)}>
                    <Text style={styles.quickBtnText}>₦{q}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.quickBtn}
                  onPress={() => setAmount(String(Math.floor(available / 100)))}
                >
                  <Text style={styles.quickBtnText}>Max</Text>
                </TouchableOpacity>
              </View>
              {amountError && <Text style={styles.errorText}>{amountError}</Text>}
            </View>
          </>
        )}
      </ScrollView>

      {bank && !editingBank && (
        <View style={styles.bottomBtns}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmBtn, !canContinue && { opacity: 0.5 }]}
            disabled={!canContinue}
            onPress={() => setStep('confirm')}
          >
            <Text style={styles.confirmBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
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
  scrollContent: { padding: 20, paddingBottom: 120 },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  balancePillText: { fontSize: 14, color: '#0B1C5A', fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#0B1C5A', marginBottom: 16 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  changeLink: { fontSize: 13, fontWeight: '700', color: '#0B1C5A', marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 8 },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 56,
  },
  currencySymbol: { fontSize: 22, fontWeight: '800', color: '#0B1C5A', marginRight: 6 },
  amountInput: { flex: 1, fontSize: 22, fontWeight: '800', color: '#0B1C5A' },
  quickAmounts: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  quickBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  quickBtnText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  errorText: { marginTop: 12, fontSize: 13, color: '#B91C1C', fontWeight: '600' },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1E293B',
  },
  bankList: { marginTop: 10, gap: 8 },
  bankOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bankOptionActive: { borderColor: '#0B1C5A', backgroundColor: '#EEF2FF' },
  bankOptionText: { fontSize: 14, color: '#334155', fontWeight: '600' },
  bankOptionTextActive: { color: '#0B1C5A', fontWeight: '800' },
  emptyHint: { fontSize: 13, color: '#94A3B8', paddingVertical: 8 },
  verifyBtn: {
    marginTop: 16,
    backgroundColor: '#0B1C5A',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  bottomBtns: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  cancelBtnText: { color: '#475569', fontSize: 14, fontWeight: '700' },
  confirmBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0B1C5A',
  },
  confirmBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  confirmAmountCard: {
    backgroundColor: '#0B1460',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  confirmLabel: { fontSize: 13, color: '#93C5FD', fontWeight: '600', marginBottom: 8 },
  confirmAmount: { fontSize: 36, fontWeight: '900', color: '#fff' },
  decorCircle: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  bankRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bankIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  accountNum: { fontSize: 13, color: '#64748B' },
  warningBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  warningText: { flex: 1, fontSize: 13, color: '#475569', lineHeight: 20 },
});
