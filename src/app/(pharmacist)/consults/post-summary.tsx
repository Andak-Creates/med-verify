import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PostSummaryScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');

  const handleSubmit = () => {
    // In a real app, this would send the summary to the backend
    router.replace('/(pharmacist)/dashboard' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Post-Consultation Summary</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Patient Details */}
          <View style={styles.patientCard}>
            <View style={styles.patientAvatar}>
              <Ionicons name="person-outline" size={24} color="#0B1C5A" />
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>Sarah J.</Text>
              <Text style={styles.patientMeta}>Medication Clarification</Text>
            </View>
          </View>

          {/* Notes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Consultation Notes</Text>
            <Text style={styles.sectionSub}>Summarize the patient's concerns and your advice.</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Patient experienced mild stomach ache after taking antibiotics. Advised to take with food..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {/* Prescription Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prescribe Medication (Optional)</Text>
            <Text style={styles.sectionSub}>Add any OTC or refill medications recommended during the call.</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Paracetamol 500mg, twice daily"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={prescription}
              onChangeText={setPrescription}
            />
          </View>

          <View style={{ height: 20 }} />

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, (!notes.trim()) && styles.submitBtnDisabled]}
            disabled={!notes.trim()}
            onPress={handleSubmit}
          >
            <Text style={styles.submitBtnText}>Submit Summary</Text>
          </TouchableOpacity>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF1FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  patientMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#111827',
    minHeight: 120,
  },
  submitBtn: {
    backgroundColor: '#0B1C5A',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
