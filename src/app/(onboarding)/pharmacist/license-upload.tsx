import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LicenseUploadScreen() {
  const router = useRouter();
  const [licenseNumber, setLicenseNumber] = useState('');
  const [ninNumber, setNinNumber] = useState('');

  const handleSubmit = () => {
    router.push('/(onboarding)/pharmacist/verification-pending' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Professional Verification</Text>
          <Text style={styles.subtitle}>
            Please upload your Pharmacists Council of Nigeria (PCN) License or NAFDAC Registration Number to verify your practitioner status.
          </Text>

          {/* Certificate Upload */}
          <Text style={styles.label}>Pharmacy Council of Nigeria (PCN) Certificate</Text>
          <Pressable style={styles.uploadBox}>
            <View style={styles.uploadIconWrap}>
              <Ionicons name="document-text" size={24} color="#312E81" />
              <View style={styles.uploadArrow}>
                <Ionicons name="arrow-up" size={12} color="#fff" />
              </View>
            </View>
            <Text style={styles.uploadTitle}>Tap to upload or drag & drop</Text>
            <Text style={styles.uploadSub}>PDF, JPG or PNG (Max 10MB)</Text>
          </Pressable>

          {/* License Number Input */}
          <Text style={styles.label}>PCN License or NAFDAC Registration Number</Text>
          <View style={styles.inputWrap}>
            <TextInput
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              placeholder="e.g., PCN/2023/XXXX"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
            <Ionicons name="id-card-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
          </View>

          {/* NIN Input */}
          <Text style={styles.label}>NIN card/slip</Text>
          <View style={styles.inputWrap}>
            <TextInput
              value={ninNumber}
              onChangeText={setNinNumber}
              placeholder="e.g., 12345678901"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
            <Ionicons name="id-card-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
          </View>

          {/* Encryption Badge */}
          <View style={styles.encryptionRow}>
            <Ionicons name="lock-closed" size={12} color="#0B1C5A" />
            <Text style={styles.encryptionText}>AES-256 ENCRYPTED</Text>
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitBtn,
              pressed && styles.submitBtnPressed
            ]}
          >
            <View style={styles.btnContent}>
              <Text style={styles.submitBtnText}>Submit for Review</Text>
              <Ionicons name="send" size={18} color="#fff" style={{ transform: [{ rotate: '-45deg' }], marginTop: -2 }} />
            </View>
          </Pressable>

          {/* Verification Process Info */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={24} color="#0284C7" style={{ marginTop: 2 }} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Verification Process</Text>
              <Text style={styles.infoText}>
                Reviews typically take 24-48 business hours. You will receive a notification once your status is updated.
              </Text>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0B1C5A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  uploadBox: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  uploadArrow: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#312E81',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#EEF2FF',
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1C5A',
    marginBottom: 4,
  },
  uploadSub: {
    fontSize: 13,
    color: '#6B7280',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
    color: '#111827',
  },
  inputIcon: {
    marginLeft: 10,
  },
  encryptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
  },
  encryptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B1C5A',
    letterSpacing: 0.5,
  },
  submitBtn: {
    backgroundColor: '#0B1C5A',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    marginBottom: 24,
  },
  submitBtnPressed: {
    opacity: 0.85,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0284C7',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
});
