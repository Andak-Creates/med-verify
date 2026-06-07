import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LicenseVerifyScreen() {
  const router = useRouter();
  const [licenseNumber, setLicenseNumber] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#0B1C5A" />
          </TouchableOpacity>
          <View style={styles.progressWrap}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Pharmacist License</Text>
          <Text style={styles.subtitle}>Enter your PCN (Pharmacists Council of Nigeria) registration number to begin verification.</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="id-card-outline" size={20} color="#8E9CB2" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. PCN/123456"
              placeholderTextColor="#8E9CB2"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark" size={20} color="#0B1C5A" />
            <Text style={styles.infoText}>Your license information is encrypted and solely used to verify your credentials.</Text>
          </View>

          <TouchableOpacity 
            style={[styles.btn, !licenseNumber.trim() && styles.btnDisabled]} 
            disabled={!licenseNumber.trim()}
            onPress={() => router.push('/(onboarding)/pharmacist/license-upload' as any)}
          >
            <Text style={styles.btnText}>Verify License</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  progressWrap: { flexDirection: 'row', gap: 6 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E7EB' },
  progressDotActive: { backgroundColor: '#0B1C5A', width: 24 },
  content: { flex: 1, paddingHorizontal: 28, paddingTop: 40 },
  title: { fontSize: 28, fontWeight: '900', color: '#0B1C5A', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 24, marginBottom: 36 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, height: 60, marginBottom: 24, borderWidth: 1, borderColor: '#E5E7EB' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  infoBox: { flexDirection: 'row', backgroundColor: '#F0F3FA', padding: 16, borderRadius: 12, marginBottom: 32, gap: 12 },
  infoText: { flex: 1, color: '#374151', fontSize: 13, lineHeight: 20 },
  btn: { backgroundColor: '#0B1C5A', borderRadius: 16, height: 60, alignItems: 'center', justifyContent: 'center', shadowColor: '#0B1C5A', shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
