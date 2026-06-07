import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaywallScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#0B1C5A" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="diamond" size={40} color="#E5A800" />
        </View>
        <Text style={styles.title}>Upgrade to Pro</Text>
        <Text style={styles.subtitle}>Unlock unlimited scans, AI health insights, and priority pharmacist access.</Text>

        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planTitle}>Annual Plan</Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>SAVE 20%</Text>
            </View>
          </View>
          <Text style={styles.planPrice}>$49.99<Text style={styles.planPeriod}> / year</Text></Text>
        </View>

        <View style={styles.planCardOutline}>
          <Text style={styles.planTitle}>Monthly Plan</Text>
          <Text style={styles.planPrice}>$4.99<Text style={styles.planPeriod}> / month</Text></Text>
        </View>

        <TouchableOpacity style={styles.btn}>
          <Text style={styles.btnText}>Start 7-Day Free Trial</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>Cancel anytime. Terms & Conditions apply.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { paddingHorizontal: 20, paddingTop: 10, alignItems: 'flex-end' },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  iconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '900', color: '#0B1C5A', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#6B7280', lineHeight: 24, marginBottom: 32 },
  planCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 2, borderColor: '#0B1C5A', marginBottom: 16, shadowColor: '#0B1C5A', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  planTitle: { fontSize: 16, fontWeight: '800', color: '#0B1C5A' },
  saveBadge: { backgroundColor: '#E5A800', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  saveBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  planPrice: { fontSize: 24, fontWeight: '900', color: '#0B1C5A' },
  planPeriod: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  planCardOutline: { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 32 },
  btn: { backgroundColor: '#0B1C5A', borderRadius: 16, height: 60, alignItems: 'center', justifyContent: 'center', shadowColor: '#0B1C5A', shadowOpacity: 0.25, shadowRadius: 10, elevation: 5, marginBottom: 16 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  footerText: { textAlign: 'center', fontSize: 12, color: '#8E9CB2' },
});
