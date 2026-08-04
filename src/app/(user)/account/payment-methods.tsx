import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApiErrorMessage } from '@/api/client';
import { getCardManageLink, listCards, removeCard } from '@/services/payments.service';
import type { SavedCard } from '@/types/api';

function brandIcon(cardType: string | null): keyof typeof Ionicons.glyphMap {
  const t = (cardType || '').toLowerCase();
  if (t.includes('visa')) return 'card';
  if (t.includes('master')) return 'card';
  return 'card-outline';
}

function expLabel(card: SavedCard): string {
  if (!card.expMonth || !card.expYear) return '';
  return `Exp ${card.expMonth}/${String(card.expYear).slice(-2)}`;
}

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await listCards();
      setCards(list);
    } catch (err) {
      Alert.alert('Could not load cards', getApiErrorMessage(err, 'Please try again in a moment.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddOrUpdate = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const link = await getCardManageLink();
      await WebBrowser.openBrowserAsync(link);
      // Card may have changed on Paystack's page — refresh.
      await load();
    } catch (err: any) {
      if (err?.response?.status === 400) {
        // No subscription yet — send them to subscribe first.
        Alert.alert('Subscribe first', 'Start your Pro subscription to add a card.', [
          { text: 'Not now', style: 'cancel' },
          { text: 'Subscribe', onPress: () => router.push('/(user)/account/paywall' as any) },
        ]);
      } else {
        Alert.alert('Could not open card manager', getApiErrorMessage(err, 'Please try again in a moment.'));
      }
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = (card: SavedCard) => {
    const warn = card.isSubscriptionCard
      ? 'This is the card your subscription bills. Removing it may stop auto-renewal — add another card first. Remove it anyway?'
      : 'Remove this card from your account? This deactivates it in Paystack.';
    Alert.alert('Remove card?', warn, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            const updated = await removeCard(card.authorizationCode);
            setCards(updated);
          } catch (err) {
            Alert.alert('Could not remove card', getApiErrorMessage(err, 'Please try again in a moment.'));
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0B1C5A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.centre}>
          <ActivityIndicator size="large" color="#0B1C5A" />
        </View>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(c) => c.authorizationCode}
          contentContainerStyle={styles.content}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="card-outline" size={36} color="#9CA3AF" />
              <Text style={styles.emptyText}>No saved cards yet.</Text>
              <Text style={styles.emptySub}>Your card is saved securely by Paystack when you subscribe.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <Ionicons name={brandIcon(item.cardType)} size={22} color="#0B1C5A" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>
                    {(item.cardType || 'Card')} •••• {item.last4}
                  </Text>
                  {item.isSubscriptionCard && (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>Subscription</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardSub}>
                  {[item.bank, expLabel(item)].filter(Boolean).join(' · ')}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleRemove(item)} disabled={busy} style={styles.removeBtn}>
                <Ionicons name="trash-outline" size={20} color="#DC2626" />
              </TouchableOpacity>
            </View>
          )}
          ListFooterComponent={
            <TouchableOpacity
              style={[styles.addBtn, busy && { opacity: 0.6 }]}
              onPress={handleAddOrUpdate}
              disabled={busy}
              activeOpacity={0.85}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text style={styles.addBtnText}>{cards.length ? 'Update / Add card' : 'Add card'}</Text>
                </>
              )}
            </TouchableOpacity>
          }
        />
      )}

      <Text style={styles.secureNote}>
        <Ionicons name="lock-closed" size={11} color="#8E9CB2" /> Cards are stored securely by Paystack. MedVerify never sees your full card number.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0B1C5A' },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  cardRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  cardIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF1FB', alignItems: 'center', justifyContent: 'center' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#0B1C5A' },
  cardSub: { fontSize: 13, color: '#6B7280', marginTop: 3 },
  chip: { backgroundColor: '#E5F0FF', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  chipText: { fontSize: 10, fontWeight: '800', color: '#0B1C5A', letterSpacing: 0.4 },
  removeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
  emptyBox: { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 30 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#374151', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#8E9CB2', textAlign: 'center', marginTop: 6, lineHeight: 19 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#0B1C5A', borderRadius: 16, height: 54, marginTop: 8,
  },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  secureNote: { fontSize: 11, color: '#8E9CB2', textAlign: 'center', paddingHorizontal: 30, paddingBottom: 16, lineHeight: 16 },
});
