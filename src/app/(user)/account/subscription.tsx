import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApiErrorMessage } from '@/api/client';
import { syncSubscription } from '@/services/payments.service';
import { useAuth } from '../../../context/AuthContext';

function formatRenewalDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user, isPro, cancelSubscription, refreshProfile } = useAuth();
  const [cancelling, setCancelling] = useState(false);

  // Reconcile against Paystack on open so a payment that completed but wasn't
  // recorded (missed webhook) self-heals.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await syncSubscription();
        if (!cancelled) await refreshProfile();
      } catch {
        // Offline or payments unconfigured — leave the current state as-is.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshProfile]);

  const handleManage = () => {
    if (!isPro) {
      router.push('/(user)/account/paywall' as any);
      return;
    }
    Alert.alert(
      'Cancel subscription?',
      'Auto-renewal will stop, but you’ll keep Pro until your current period ends.',
      [
        { text: 'Keep Pro', style: 'cancel' },
        {
          text: 'Cancel Renewal',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await cancelSubscription();
              Alert.alert('Auto-renewal cancelled', 'You’ll keep Pro until it expires.');
            } catch (err) {
              Alert.alert('Could not cancel', getApiErrorMessage(err, 'Please try again in a moment.'));
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  const renewalDate = formatRenewalDate(user?.proExpiresAt ?? null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0B1C5A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          {isPro ? (
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>✦ PRO MEMBER</Text>
            </View>
          ) : (
            <View style={[styles.proBadge, { backgroundColor: '#6B7280' }]}>
              <Text style={styles.proBadgeText}>BASIC PLAN</Text>
            </View>
          )}
          <Text style={styles.title}>{isPro ? "You are on the Pro Plan" : "You are on the Basic Plan"}</Text>
          <Text style={styles.subtitle}>
            {isPro
              ? renewalDate
                ? `Your subscription renews on ${renewalDate}.`
                : "Your Pro subscription is active."
              : "Upgrade to Pro to unlock unlimited features."}
          </Text>
          
          <View style={styles.divider} />
          
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#0B1C5A" />
            <Text style={styles.featureText}>Unlimited Scans & Verifications</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#0B1C5A" />
            <Text style={styles.featureText}>Advanced AI Chat Consultations</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#0B1C5A" />
            <Text style={styles.featureText}>Priority Support</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.btnOutline, cancelling && { opacity: 0.6 }]} onPress={handleManage} disabled={cancelling}>
          {cancelling ? (
            <ActivityIndicator color="#0B1C5A" />
          ) : (
            <Text style={styles.btnOutlineText}>{isPro ? "Cancel Subscription" : "Upgrade to Pro"}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0B1C5A' },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  content: { paddingHorizontal: 20 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 24 },
  proBadge: { alignSelf: 'flex-start', backgroundColor: '#E5A800', borderRadius: 50, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 16 },
  proBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: '800', color: '#0B1C5A', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  featureText: { fontSize: 15, color: '#374151', fontWeight: '500' },
  btnOutline: { borderWidth: 2, borderColor: '#0B1C5A', borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center' },
  btnOutlineText: { color: '#0B1C5A', fontSize: 16, fontWeight: '800' },
});
