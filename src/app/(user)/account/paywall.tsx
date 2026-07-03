import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

export default function PaywallScreen() {
  const router = useRouter();
  const { subscribeToPro } = useAuth();

  const handleSubscribe = () => {
    // TODO: wire up real payment (Paystack / Flutterwave)
    subscribeToPro();
    Alert.alert('Subscribed!', 'You are now on the Pro Plan. Enjoy unlimited scans!');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color="#0B1C5A" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconWrap}>
          <Ionicons name="diamond" size={40} color="#E5A800" />
        </View>

        <Text style={styles.title}>Upgrade to Pro</Text>
        <Text style={styles.subtitle}>
          You've used your 3 free scans. Upgrade to unlock unlimited drug verification,
          AI health insights, and priority pharmacist consultations.
        </Text>

        {/* Benefits list */}
        {BENEFITS.map((b) => (
          <View key={b} style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color="#0B1C5A" />
            <Text style={styles.benefitText}>{b}</Text>
          </View>
        ))}

        {/* Plan card */}
        <View style={styles.planCard}>
          <View style={styles.planLeft}>
            <Text style={styles.planTitle}>Pro Plan</Text>
            <Text style={styles.planDesc}>Unlimited everything</Text>
          </View>
          <View style={styles.planRight}>
            <Text style={styles.planPrice}>₦3,000</Text>
            <Text style={styles.planPeriod}>/month</Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.btn} onPress={handleSubscribe} activeOpacity={0.85}>
          <Text style={styles.btnText}>Subscribe Now</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>Cancel anytime. Terms & Conditions apply.</Text>
      </View>
    </SafeAreaView>
  );
}

const BENEFITS = [
  'Unlimited drug verification scans',
  'AI-powered health insights',
  'Priority pharmacist consultations',
  'Full scan & consultation history',
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { paddingHorizontal: 20, paddingTop: 10, alignItems: 'flex-end' },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  iconWrap: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 30, fontWeight: '900', color: '#0B1C5A', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 23, marginBottom: 24 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  benefitText: { fontSize: 15, color: '#374151', fontWeight: '500', flex: 1 },
  planCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    borderWidth: 2, borderColor: '#0B1C5A', marginTop: 24, marginBottom: 24,
    shadowColor: '#0B1C5A', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
  },
  planLeft: { gap: 4 },
  planTitle: { fontSize: 17, fontWeight: '800', color: '#0B1C5A' },
  planDesc: { fontSize: 13, color: '#6B7280' },
  planRight: { alignItems: 'flex-end' },
  planPrice: { fontSize: 26, fontWeight: '900', color: '#0B1C5A' },
  planPeriod: { fontSize: 13, color: '#6B7280', marginTop: -2 },
  btn: {
    backgroundColor: '#0B1C5A', borderRadius: 16, height: 58,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#0B1C5A', shadowOpacity: 0.25, shadowRadius: 10,
    elevation: 5, marginBottom: 14,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  footerText: { textAlign: 'center', fontSize: 12, color: '#8E9CB2' },
});
