import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApiErrorMessage } from '@/api/client';
import { usePharmacistConsultations } from '@/hooks/usePharmacistConsultations';
import { usePharmacistProfile } from '@/hooks/usePharmacistProfile';
import type { ConsultationType, PharmacistConsultation } from '@/types/api';

const TYPE_DISPLAY: Record<ConsultationType, { label: string; bg: string; color: string }> = {
  chat: { label: 'Drug Inquiry', bg: '#D1FAE5', color: '#065F46' },
  audio: { label: 'Drug Inquiry', bg: '#D1FAE5', color: '#065F46' },
  both: { label: 'Full Health', bg: '#E0E7FF', color: '#3730A3' },
};

const STATUS_DISPLAY: Record<string, { label: string; bg: string; color: string }> = {
  PENDING: { label: 'PENDING', bg: '#FEF3C7', color: '#92400E' },
  CONFIRMED: { label: 'CONFIRMED', bg: '#D1FAE5', color: '#065F46' },
  IN_PROGRESS: { label: 'IN PROGRESS', bg: '#DBEAFE', color: '#1E40AF' },
  DECLINED: { label: 'DECLINED', bg: '#FEE2E2', color: '#991B1B' },
  COMPLETED: { label: 'COMPLETED', bg: '#E5E7EB', color: '#374151' },
  CANCELLED: { label: 'CANCELLED', bg: '#F3F4F6', color: '#6B7280' },
};

function formatSessionDate(c: PharmacistConsultation): string {
  const date = new Date(`${c.consultationDate}T12:00:00`);
  return `${date.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })} • ${c.timeSlot}`;
}

export default function ConsultsScreen() {
  const router = useRouter();
  const { profile } = usePharmacistProfile();
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  const upcoming = usePharmacistConsultations('upcoming');
  const past = usePharmacistConsultations('past');
  const current = activeTab === 'active' ? upcoming : past;

  const handleAccept = async (c: PharmacistConsultation) => {
    try {
      await upcoming.accept(c.id);
    } catch (err) {
      Alert.alert('Could not accept', getApiErrorMessage(err, 'This request may no longer be pending.'));
    }
  };

  const handleDecline = async (c: PharmacistConsultation) => {
    try {
      await upcoming.decline(c.id);
    } catch (err) {
      Alert.alert('Could not decline', getApiErrorMessage(err, 'This request may no longer be pending.'));
    }
  };

  const renderPatientAvatar = (c: PharmacistConsultation) =>
    c.patient.profileImage ? (
      <Image source={{ uri: c.patient.profileImage }} style={styles.patientImage} />
    ) : (
      <View style={[styles.patientImage, { backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }]}>
        <Ionicons name="person-outline" size={20} color="#0B1C5A" />
      </View>
    );

  const renderActiveCard = (c: PharmacistConsultation) => {
    const typeDisplay = TYPE_DISPLAY[c.consultationType];
    const acting = upcoming.actingId === c.id;
    const canJoin = c.status === 'CONFIRMED' || c.status === 'IN_PROGRESS';
    return (
      <View key={c.id} style={styles.sessionCard}>
        <View style={styles.sessionHeaderRow}>
          <View style={styles.sessionUserInfo}>
            {renderPatientAvatar(c)}
            <View>
              <Text style={styles.patientName}>{c.patient.fullName ?? 'Patient'}</Text>
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={14} color="#0B1C5A" />
                <Text style={styles.timeText}>{formatSessionDate(c)}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: typeDisplay.bg }]}>
            <Text style={[styles.typeBadgeText, { color: typeDisplay.color }]}>{typeDisplay.label}</Text>
          </View>
        </View>
        <View style={styles.cardDivider} />
        <View style={styles.sessionFooterRow}>
          <Text style={styles.earningText}>₦{c.feeAmount.toLocaleString()}</Text>
          {c.status === 'PENDING' ? (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={styles.declineBtn} disabled={acting} onPress={() => handleDecline(c)}>
                <Text style={styles.declineBtnText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.joinBtn} disabled={acting} onPress={() => handleAccept(c)}>
                {acting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.joinBtnText}>Accept</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : canJoin ? (
            <TouchableOpacity
              style={styles.joinBtn}
              onPress={() =>
                router.push({ pathname: '/(pharmacist)/consults/consultation-live', params: { id: c.id } } as any)
              }
            >
              <Text style={styles.joinBtnText}>Join Session</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.typeBadge, { backgroundColor: STATUS_DISPLAY[c.status]?.bg ?? '#F3F4F6' }]}>
              <Text style={[styles.typeBadgeText, { color: STATUS_DISPLAY[c.status]?.color ?? '#6B7280' }]}>
                {STATUS_DISPLAY[c.status]?.label ?? c.status}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderPastCard = (c: PharmacistConsultation) => {
    const typeDisplay = TYPE_DISPLAY[c.consultationType];
    const statusDisplay = STATUS_DISPLAY[c.status] ?? STATUS_DISPLAY.COMPLETED;
    return (
      <TouchableOpacity
        key={c.id}
        style={styles.sessionCard}
        onPress={() =>
          router.push({
            pathname: '/(pharmacist)/consults/consultation-live',
            params: { id: c.id, isPast: 'true' },
          } as any)
        }
      >
        <View style={styles.sessionHeaderRow}>
          <View style={styles.sessionUserInfo}>
            {renderPatientAvatar(c)}
            <View>
              <Text style={styles.patientName}>{c.patient.fullName ?? 'Patient'}</Text>
              <Text style={styles.pastDateText}>{formatSessionDate(c)}</Text>
            </View>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: typeDisplay.bg }]}>
            <Text style={[styles.typeBadgeText, { color: typeDisplay.color }]}>{typeDisplay.label}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.pastFooterRow}>
          <View style={[styles.typeBadge, { backgroundColor: statusDisplay.bg }]}>
            <Text style={[styles.typeBadgeText, { color: statusDisplay.color }]}>{statusDisplay.label}</Text>
          </View>
          {c.rating != null && (
            <View style={styles.pastMeta}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < (c.rating ?? 0) ? 'star' : 'star-outline'}
                  size={14}
                  color="#F59E0B"
                />
              ))}
            </View>
          )}
          <Text style={styles.pastEarned}>₦{c.feeAmount.toLocaleString()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.push('/(pharmacist)/profile' as any)}>
            {profile?.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="person-outline" size={20} color="#0B1C5A" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MedVerify</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/(pharmacist)/notifications' as any)}>
          <Ionicons name="notifications-outline" size={24} color="#0B1C5A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={current.isRefreshing} onRefresh={current.refresh} tintColor="#0B1C5A" />
        }
      >
        {/* Toggle Switch */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={activeTab === 'active' ? styles.toggleActive : styles.toggleInactive}
            onPress={() => setActiveTab('active')}
          >
            <Text style={activeTab === 'active' ? styles.toggleTextActive : styles.toggleTextInactive}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={activeTab === 'past' ? styles.toggleActive : styles.toggleInactive}
            onPress={() => setActiveTab('past')}
          >
            <Text style={activeTab === 'past' ? styles.toggleTextActive : styles.toggleTextInactive}>Past</Text>
          </TouchableOpacity>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'active' ? 'Upcoming Sessions' : 'Completed Sessions'}
          </Text>
          <View style={[styles.countBadge, activeTab === 'past' && { backgroundColor: '#F3E8FF' }]}>
            <Text style={[styles.countBadgeText, activeTab === 'past' && { color: '#6B21A8' }]}>
              {current.items.length} Total
            </Text>
          </View>
        </View>

        {/* List */}
        {current.isLoading ? (
          <View style={{ paddingVertical: 50, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0B1C5A" />
          </View>
        ) : current.error ? (
          <View style={{ paddingVertical: 30, alignItems: 'center', paddingHorizontal: 20 }}>
            <Ionicons name="alert-circle-outline" size={32} color="#9CA3AF" />
            <Text style={{ marginTop: 10, color: '#6B7280', textAlign: 'center' }}>{current.error}</Text>
            <TouchableOpacity onPress={current.refresh} style={{ marginTop: 12 }}>
              <Text style={{ color: '#0B1C5A', fontWeight: '700' }}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : current.items.length === 0 ? (
          <View style={{ paddingVertical: 30, alignItems: 'center', paddingHorizontal: 20 }}>
            <Ionicons
              name={activeTab === 'active' ? 'calendar-outline' : 'time-outline'}
              size={32}
              color="#9CA3AF"
            />
            <Text style={{ marginTop: 10, color: '#6B7280', textAlign: 'center' }}>
              {activeTab === 'active'
                ? 'No upcoming sessions. New bookings will appear here in real time.'
                : 'Completed sessions will appear here.'}
            </Text>
          </View>
        ) : (
          <View style={styles.sessionsList}>
            {current.items.map(activeTab === 'active' ? renderActiveCard : renderPastCard)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#E2E8F0' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0B1C5A' },
  notificationBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleActive: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  toggleInactive: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  toggleTextActive: { fontSize: 14, fontWeight: '700', color: '#0B1C5A' },
  toggleTextInactive: { fontSize: 14, fontWeight: '600', color: '#475569' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  countBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  countBadgeText: { fontSize: 12, fontWeight: '700', color: '#0369A1' },
  sessionsList: { gap: 16 },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionUserInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  patientImage: { width: 48, height: 48, borderRadius: 24 },
  patientName: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 13, color: '#0B1C5A', fontWeight: '500' },
  pastDateText: { fontSize: 12, color: '#64748B' },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  typeBadgeText: { fontSize: 11, fontWeight: '600' },
  cardDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  sessionFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningText: { fontSize: 14, fontWeight: '800', color: '#065F46' },
  joinBtn: {
    backgroundColor: '#1E1B4B',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  joinBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  declineBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  declineBtnText: { color: '#475569', fontSize: 14, fontWeight: '600' },
  pastFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pastMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pastEarned: { fontSize: 14, fontWeight: '800', color: '#065F46' },
});
