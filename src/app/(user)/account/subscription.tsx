import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SubscriptionScreen() {
  const router = useRouter();

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
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>✦ PRO MEMBER</Text>
          </View>
          <Text style={styles.title}>You are on the Pro Plan</Text>
          <Text style={styles.subtitle}>Your subscription will automatically renew on Oct 24, 2026.</Text>
          
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

        <TouchableOpacity style={styles.btnOutline}>
          <Text style={styles.btnOutlineText}>Manage Subscription</Text>
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
