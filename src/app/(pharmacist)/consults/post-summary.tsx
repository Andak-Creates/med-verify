import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as pharmacistService from '@/services/pharmacist.service';
import type { PharmacistConsultation } from '@/types/api';

export default function PostSummaryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<PharmacistConsultation | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const { items } = await pharmacistService.listConsultations({ filter: 'past', limit: 50 });
        if (!cancelled) setBooking(items.find((c) => c.id === id) ?? null);
      } catch {
        // The summary still renders with generic labels.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Session Completed</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Patient Details */}
        <View style={styles.patientCard}>
          {booking?.patient.profileImage ? (
            <Image source={{ uri: booking.patient.profileImage }} style={styles.patientAvatar} />
          ) : (
            <View style={styles.patientAvatar}>
              <Ionicons name="person-outline" size={24} color="#0B1C5A" />
            </View>
          )}
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{booking?.patient.fullName ?? 'Patient'}</Text>
            <Text style={styles.patientMeta}>
              {booking ? `Ref ${booking.referenceCode} • ${booking.timeSlot}` : 'Consultation session'}
            </Text>
          </View>
        </View>

        {/* Session summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.sectionSub}>
            The consultation has ended and the transcript has been saved. The patient can rate the
            session from their app.
          </Text>
          {booking && (
            <View style={styles.summaryRows}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Patient concern</Text>
                <Text style={styles.summaryValue}>{booking.reason}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Session fee</Text>
                <Text style={styles.summaryValue}>₦{booking.feeAmount.toLocaleString()}</Text>
              </View>
              {booking.rating != null && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Patient rating</Text>
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    {Array.from({ length: booking.rating }).map((_, i) => (
                      <Ionicons key={i} name="star" size={14} color="#F59E0B" />
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={() => router.replace('/(pharmacist)/dashboard' as any)}
        >
          <Text style={styles.submitBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
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
  summaryRows: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    gap: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  submitBtn: {
    backgroundColor: '#0B1C5A',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
