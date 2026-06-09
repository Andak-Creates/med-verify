import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';

export default function VerificationPendingScreen() {
  const router = useRouter();
  const { devLogin } = useAuth();

  // For testing purposes, we'll allow navigation to the dashboard
  const handleSupport = () => {
    router.replace('/(pharmacist)/dashboard' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <View style={styles.iconOutline}>
            <Ionicons name="shield-checkmark" size={48} color="#0369A1" />
          </View>
        </View>

        <Text style={styles.title}>Verification in Progress</Text>
        <Text style={styles.subtitle}>
          Your credentials are being reviewed by our medical board. This typically takes 24-48 hours.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && styles.btnPressed
          ]}
          onPress={handleSupport}
        >
          <Ionicons name="help-circle-outline" size={20} color="#fff" />
          <Text style={styles.primaryBtnText}>Contact Support</Text>
        </Pressable>

        {/* Development Bypass Button */}
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: '#0369A1', marginTop: -12 },
            pressed && styles.btnPressed
          ]}
          onPress={async () => {
            await devLogin("PHARMACIST");
            router.replace('/(pharmacist)/dashboard' as any);
          }}
        >
          <Ionicons name="code-working-outline" size={20} color="#fff" />
          <Text style={styles.primaryBtnText}>Bypass Verification (Dev)</Text>
        </Pressable>

        <Pressable style={styles.linkBtn}>
          <Text style={styles.linkText}>Read Guidelines</Text>
          <Ionicons name="open-outline" size={16} color="#0369A1" />
        </Pressable>

        <View style={styles.divider} />

        <View style={styles.referenceRow}>
          <Ionicons name="time-outline" size={14} color="#8E9CB2" />
          <Text style={styles.referenceText}>REFERENCE ID: MV-8829-PH</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconOutline: {
    width: 96,
    height: 96,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#E0F2FE',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0B1C5A',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  primaryBtn: {
    width: '100%',
    height: 56,
    backgroundColor: '#111827',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  btnPressed: {
    opacity: 0.85,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 32,
  },
  linkText: {
    color: '#0369A1',
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 24,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  referenceText: {
    color: '#8E9CB2',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
