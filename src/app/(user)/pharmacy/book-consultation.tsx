import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApiErrorMessage } from '@/api/client';
import { FormError } from '../../../components/FormError';
import { usePharmacist } from '@/hooks/usePharmacists';
import * as consultationsService from '@/services/consultations.service';
import * as pharmacistsService from '@/services/pharmacists.service';
import type { ConsultationType, ConsultationUrgency } from '@/types/api';

const BRAND = '#0B1C5A';

function toDateParam(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

const today = new Date();
const DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(today);
  d.setDate(today.getDate() + i);
  return {
    label: d.toLocaleDateString('en-US', { weekday: 'short' }),
    num: d.getDate(),
    param: toDateParam(d),
    month: d.toLocaleDateString('en-US', { month: 'long' }),
  };
});

const TYPE_INFO: Record<ConsultationType, { label: string; sub: string; icon: string }> = {
  chat: { label: 'Drug Inquiry • Chat', sub: 'Text chat session with the pharmacist.', icon: 'chatbubble-outline' },
  audio: { label: 'Drug Inquiry • Audio', sub: 'Direct audio call with the pharmacist.', icon: 'call-outline' },
  both: { label: 'Call & Chat', sub: 'This session includes both Text Chat and Direct Call options.', icon: 'headset-outline' },
};

export default function BookConsultationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ pharmacistProfileId: string; consultationType?: string }>();
  const pharmacistProfileId = params.pharmacistProfileId;
  const consultationType: ConsultationType =
    params.consultationType === 'chat' || params.consultationType === 'audio'
      ? params.consultationType
      : 'both';

  const { pharmacist, isLoading: loadingPharmacist, error: pharmacistError } = usePharmacist(pharmacistProfileId);

  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [slots, setSlots] = useState<string[]>([]);
  const [isWorkingDay, setIsWorkingDay] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [urgency, setUrgency] = useState<ConsultationUrgency>('normal');
  const [booking, setBooking] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedDay = DAYS[selectedDayIdx];

  const loadSlots = useCallback(async () => {
    if (!pharmacistProfileId) return;
    setLoadingSlots(true);
    setFormError(null);
    setSelectedTime(null);
    try {
      const result = await pharmacistsService.getAvailableSlots(pharmacistProfileId, selectedDay.param);
      setSlots(result.slots);
      setIsWorkingDay(result.isWorkingDay);
    } catch (err) {
      setSlots([]);
      setIsWorkingDay(true);
      setFormError(getApiErrorMessage(err, 'Could not load available time slots.'));
    } finally {
      setLoadingSlots(false);
    }
  }, [pharmacistProfileId, selectedDay.param]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const { morningSlots, afternoonSlots } = useMemo(() => {
    return {
      morningSlots: slots.filter((s) => s.toUpperCase().includes('AM')),
      afternoonSlots: slots.filter((s) => s.toUpperCase().includes('PM')),
    };
  }, [slots]);

  const fee =
    consultationType === 'both' ? pharmacist?.feeFullConsultation : pharmacist?.feeDrugInquiry;
  const priceLabel = fee != null ? `₦${fee.toLocaleString()}` : '';
  const canBook = Boolean(selectedTime) && reason.trim().length >= 10 && !booking;
  const typeInfo = TYPE_INFO[consultationType];

  const handleBook = async () => {
    if (!pharmacistProfileId || !selectedTime) return;
    setFormError(null);
    setBooking(true);
    try {
      const confirmation = await consultationsService.bookConsultation({
        pharmacistProfileId,
        consultationDate: selectedDay.param,
        timeSlot: selectedTime,
        consultationType,
        urgency,
        reason: reason.trim(),
      });
      router.push({
        pathname: '/(user)/pharmacy/booking-confirm',
        params: { booking: JSON.stringify(confirmation) },
      } as any);
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Could not book this session. Please try another slot.'));
      // The slot may have just been taken — refresh availability.
      loadSlots();
    } finally {
      setBooking(false);
    }
  };

  const renderSlotPills = (group: string[]) => (
    <View style={styles.slotsRow}>
      {group.map((slot) => (
        <TouchableOpacity
          key={slot}
          onPress={() => setSelectedTime(slot)}
          style={[styles.slotPill, selectedTime === slot && styles.slotPillActive]}
        >
          <Text style={[styles.slotPillText, selectedTime === slot && styles.slotPillTextActive]}>{slot}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={BRAND} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconBtn} onPress={() => router.push('/(user)/account/notifications' as any)}>
            <Ionicons name="notifications-outline" size={20} color={BRAND} />
          </Pressable>
        </View>
      </View>

      {loadingPharmacist ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      ) : pharmacistError || !pharmacist ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
          <Ionicons name="alert-circle-outline" size={36} color="#9CA3AF" />
          <Text style={{ marginTop: 12, color: '#6B7280', textAlign: 'center' }}>
            {pharmacistError ?? 'Pharmacist not found.'}
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Pharmacist Card */}
          <View style={styles.doctorCard}>
            {pharmacist.profileImage ? (
              <Image source={{ uri: pharmacist.profileImage }} style={styles.doctorImg} />
            ) : (
              <View style={[styles.doctorImg, { alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="person-outline" size={30} color="#9CA3AF" />
              </View>
            )}
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{pharmacist.fullName ?? 'Pharmacist'}</Text>
              <View style={styles.doctorTitleRow}>
                <Ionicons name="briefcase-outline" size={13} color="#6B7280" />
                <Text style={styles.doctorTitle}>{pharmacist.specialty ?? 'Pharmacist'}</Text>
              </View>
              <View style={styles.doctorMetaRow}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.doctorMeta}>
                  {pharmacist.avgRating > 0 ? pharmacist.avgRating.toFixed(1) : 'New'}
                </Text>
                <Text style={styles.doctorMetaDot}>•</Text>
                <Text style={styles.doctorMeta}>{pharmacist.totalConsultations} Consults</Text>
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 22 }}>
            {/* Date Picker */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Select Date</Text>
              <View style={styles.monthPill}>
                <Text style={styles.monthPillText}>{selectedDay.month}</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 28 }} contentContainerStyle={{ gap: 10, paddingRight: 8 }}>
              {DAYS.map((day, i) => {
                const active = selectedDayIdx === i;
                return (
                  <TouchableOpacity
                    key={day.param}
                    onPress={() => setSelectedDayIdx(i)}
                    style={[styles.dayCell, active && styles.dayCellActive]}
                  >
                    <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>{day.label}</Text>
                    <Text style={[styles.dayNum, active && styles.dayNumActive]}>{day.num}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Time Slots — live availability from the pharmacist's working hours */}
            {loadingSlots ? (
              <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={BRAND} />
                <Text style={{ marginTop: 8, color: '#6B7280', fontSize: 13 }}>Checking availability…</Text>
              </View>
            ) : !isWorkingDay ? (
              <View style={styles.noSlotsBox}>
                <Ionicons name="moon-outline" size={22} color="#6B7280" />
                <Text style={styles.noSlotsText}>
                  The pharmacist is not available on this date. Try another day.
                </Text>
              </View>
            ) : slots.length === 0 ? (
              <View style={styles.noSlotsBox}>
                <Ionicons name="calendar-outline" size={22} color="#6B7280" />
                <Text style={styles.noSlotsText}>
                  All slots for this date are booked. Try another day.
                </Text>
              </View>
            ) : (
              <>
                {morningSlots.length > 0 && (
                  <>
                    <View style={styles.slotGroup}>
                      <Ionicons name="sunny-outline" size={16} color={BRAND} />
                      <Text style={styles.slotGroupLabel}>Morning Slots</Text>
                    </View>
                    {renderSlotPills(morningSlots)}
                  </>
                )}
                {afternoonSlots.length > 0 && (
                  <>
                    <View style={styles.slotGroup}>
                      <Ionicons name="partly-sunny-outline" size={16} color={BRAND} />
                      <Text style={styles.slotGroupLabel}>Afternoon Slots</Text>
                    </View>
                    <View style={{ marginBottom: 8 }}>{renderSlotPills(afternoonSlots)}</View>
                  </>
                )}
              </>
            )}

            {/* Session Type Info */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Session Mode</Text>
            <View style={[styles.typeCard, styles.typeCardActive, { marginBottom: 24 }]}>
              <View style={[styles.typeIconBox, styles.typeIconBoxActive]}>
                <Ionicons name={typeInfo.icon as any} size={22} color={BRAND} />
              </View>
              <Text style={[styles.typeLabel, styles.typeLabelActive]}>{typeInfo.label}</Text>
              <Text style={styles.typeSub}>{typeInfo.sub}</Text>
            </View>

            {/* Urgency Level */}
            <Text style={styles.sectionTitle}>Urgency Level</Text>
            <View style={styles.urgencyRow}>
              <TouchableOpacity
                style={[styles.urgencyPill, urgency === 'normal' && styles.urgencyPillActive]}
                onPress={() => setUrgency('normal')}
              >
                <Ionicons name="time-outline" size={16} color={urgency === 'normal' ? '#fff' : '#475569'} />
                <Text style={[styles.urgencyText, urgency === 'normal' && styles.urgencyTextActive]}>Normal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.urgencyPill, styles.urgencyPillHigh, urgency === 'high' && styles.urgencyPillHighActive]}
                onPress={() => setUrgency('high')}
              >
                <Ionicons name="alert-circle-outline" size={16} color={urgency === 'high' ? '#fff' : '#B91C1C'} />
                <Text style={[styles.urgencyText, styles.urgencyTextHigh, urgency === 'high' && styles.urgencyTextActive]}>High Priority</Text>
              </TouchableOpacity>
            </View>

            {/* Reason for Consultation */}
            <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 8 }]}>Reason for Consultation</Text>
            <Text style={styles.reasonHint}>Briefly describe your concern so the pharmacist can prepare. (min. 10 characters)</Text>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <TextInput
                style={styles.reasonInput}
                placeholder="e.g. I've been experiencing side effects after taking my new prescription and would like to understand if it's normal..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={reason}
                onChangeText={setReason}
              />
              {reason.trim().length > 0 && reason.trim().length < 10 && (
                <Text style={styles.reasonError}>Please provide at least 10 characters.</Text>
              )}
            </KeyboardAvoidingView>

            <View style={{ marginTop: 16 }}>
              <FormError message={formError} />
            </View>

            {/* Book Button */}
            <Pressable
              onPress={handleBook}
              disabled={!canBook}
              style={({ pressed }) => ({
                backgroundColor: canBook ? BRAND : '#9CA3AF',
                borderRadius: 18, paddingVertical: 18,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                opacity: pressed ? 0.85 : 1, marginTop: 8,
              })}
            >
              {booking ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                    Book Session{priceLabel ? ` • ${priceLabel}` : ''}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { position: 'relative', padding: 4 },

  /* Pharmacist Card */
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 22,
    marginBottom: 24,
    borderRadius: 20,
    padding: 14,
    gap: 14,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 3,
  },
  doctorImg: { width: 72, height: 72, borderRadius: 16, backgroundColor: '#F3F4F6' },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 4 },
  doctorTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  doctorTitle: { fontSize: 12, color: '#6B7280' },
  doctorMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  doctorMeta: { fontSize: 12, fontWeight: '700', color: '#374151' },
  doctorMetaDot: { color: '#D1D5DB', marginHorizontal: 2 },

  /* Section header */
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 14 },
  monthPill: {
    paddingHorizontal: 14, paddingVertical: 6,
    backgroundColor: '#EEF1FB', borderRadius: 20,
  },
  monthPillText: { fontSize: 13, fontWeight: '700', color: BRAND },

  /* Day cells */
  dayCell: {
    width: 60, height: 74, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  dayCellActive: { backgroundColor: BRAND, borderColor: BRAND },
  dayLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', marginBottom: 4 },
  dayLabelActive: { color: 'rgba(255,255,255,0.7)' },
  dayNum: { fontSize: 22, fontWeight: '900', color: '#111827' },
  dayNumActive: { color: '#fff' },

  /* Slot groups */
  slotGroup: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  slotGroupLabel: { fontSize: 14, fontWeight: '700', color: '#374151' },
  slotsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  slotPill: {
    paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: 14, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  slotPillActive: { backgroundColor: BRAND, borderColor: BRAND },
  slotPillText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  slotPillTextActive: { color: '#fff' },
  noSlotsBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F3F4F6', borderRadius: 14, padding: 16, marginBottom: 8,
  },
  noSlotsText: { flex: 1, fontSize: 13, color: '#6B7280', lineHeight: 19 },

  /* Consultation type */
  typeCard: {
    backgroundColor: '#fff',
    borderRadius: 18, padding: 16,
    borderWidth: 2, borderColor: '#E5E7EB',
  },
  typeCardActive: { borderColor: BRAND, backgroundColor: '#F5F7FF' },
  typeIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  typeIconBoxActive: { backgroundColor: '#EEF1FB' },
  typeLabel: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 4 },
  typeLabelActive: { color: BRAND },
  typeSub: { fontSize: 11, color: '#9CA3AF', lineHeight: 16 },

  /* Urgency */
  urgencyRow: { flexDirection: 'row', gap: 12 },
  urgencyPill: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 14, backgroundColor: '#F3F4F6',
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  urgencyPillActive: { backgroundColor: BRAND, borderColor: BRAND },
  urgencyPillHigh: { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' },
  urgencyPillHighActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  urgencyText: { fontSize: 14, fontWeight: '700', color: '#475569' },
  urgencyTextHigh: { color: '#B91C1C' },
  urgencyTextActive: { color: '#fff' },

  /* Reason Input */
  reasonHint: { fontSize: 13, color: '#6B7280', marginBottom: 12, lineHeight: 18 },
  reasonInput: {
    backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 16, padding: 16, fontSize: 15, color: '#111827',
    minHeight: 120,
  },
  reasonError: { fontSize: 12, color: '#EF4444', marginTop: 8, marginLeft: 4 },
});
