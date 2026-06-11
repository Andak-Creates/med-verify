import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
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

const BRAND = '#0B1C5A';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const today = new Date();
const DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(today);
  d.setDate(today.getDate() + i);
  return {
    label: d.toLocaleDateString('en-US', { weekday: 'short' }),
    num: d.getDate(),
  };
});

const MORNING_SLOTS = ['09:00 AM', '09:30 AM', '10:45 AM'];
const AFTERNOON_SLOTS = ['02:00 PM', '03:30 PM', '04:15 PM'];

const DEFAULT_TYPE = 'both';

// Doctor data keyed by pharmacyId / id param
const DOCTORS: Record<string, { name: string; title: string; rating: number; consults: string; image: string }> = {
  '1': { name: 'Dr. Julian Okoro', title: 'Senior Clinical Pharmacist', rating: 4.9, consults: '1.2k+ Consults', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80' },
  '2': { name: 'Dr. Marcus Chen',  title: 'Geriatric Specialist',        rating: 4.8, consults: '980+ Consults',  image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80' },
};

export default function BookConsultationScreen() {
  const router = useRouter();
  const { pharmacyId } = useLocalSearchParams<{ pharmacyId: string }>();
  const doctor = DOCTORS[pharmacyId ?? '1'] ?? DOCTORS['1'];

  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedTime, setSelectedTime] = useState('02:00 PM');
  const [reason, setReason] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'high'>('normal');
  const canBook = selectedTime && reason.trim().length >= 10;
  
  const currentPrice = urgency === 'high' ? '₦7,500' : '₦5,000';


  const handleBook = () => {
    router.push({
      pathname: '/(user)/pharmacy/booking-confirm',
      params: {
        type: DEFAULT_TYPE,
        day: DAYS[selectedDayIdx].label + ' ' + DAYS[selectedDayIdx].num,
        time: selectedTime,
        doctorName: doctor.name,
        doctorImage: doctor.image,
        reason,
        urgency,
        price: currentPrice,
      },
    } as any);
  };


  const currentMonth = MONTHS[today.getMonth()];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={BRAND} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color={BRAND} />
            <View style={styles.notifDot} />
          </Pressable>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={18} color="#fff" />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Doctor Card */}
        <View style={styles.doctorCard}>
          <Image source={{ uri: doctor.image }} style={styles.doctorImg} />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <View style={styles.doctorTitleRow}>
              <Ionicons name="briefcase-outline" size={13} color="#6B7280" />
              <Text style={styles.doctorTitle}>{doctor.title}</Text>
            </View>
            <View style={styles.doctorMetaRow}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.doctorMeta}>{doctor.rating}</Text>
              <Text style={styles.doctorMetaDot}>•</Text>
              <Text style={styles.doctorMeta}>{doctor.consults}</Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 22 }}>
          {/* Date Picker */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <TouchableOpacity style={styles.monthPill}>
              <Text style={styles.monthPillText}>{currentMonth} ›</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 28 }} contentContainerStyle={{ gap: 10, paddingRight: 8 }}>
            {DAYS.map((day, i) => {
              const active = selectedDayIdx === i;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedDayIdx(i)}
                  style={[styles.dayCell, active && styles.dayCellActive]}
                >
                  <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>{day.label}</Text>
                  <Text style={[styles.dayNum, active && styles.dayNumActive]}>{day.num}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Morning Slots */}
          <View style={styles.slotGroup}>
            <Ionicons name="sunny-outline" size={16} color={BRAND} />
            <Text style={styles.slotGroupLabel}>Morning Slots</Text>
          </View>
          <View style={styles.slotsRow}>
            {MORNING_SLOTS.map(slot => (
              <TouchableOpacity
                key={slot}
                onPress={() => setSelectedTime(slot)}
                style={[styles.slotPill, selectedTime === slot && styles.slotPillActive]}
              >
                <Text style={[styles.slotPillText, selectedTime === slot && styles.slotPillTextActive]}>{slot}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Afternoon Slots */}
          <View style={styles.slotGroup}>
            <Ionicons name="partly-sunny-outline" size={16} color={BRAND} />
            <Text style={styles.slotGroupLabel}>Afternoon Slots</Text>
          </View>
          <View style={[styles.slotsRow, { marginBottom: 28 }]}>
            {AFTERNOON_SLOTS.map(slot => (
              <TouchableOpacity
                key={slot}
                onPress={() => setSelectedTime(slot)}
                style={[styles.slotPill, selectedTime === slot && styles.slotPillActive]}
              >
                <Text style={[styles.slotPillText, selectedTime === slot && styles.slotPillTextActive]}>{slot}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Session Type Info */}
          <Text style={styles.sectionTitle}>Session Mode</Text>
          <View style={[styles.typeCard, styles.typeCardActive, { marginBottom: 24 }]}>
            <View style={[styles.typeIconBox, styles.typeIconBoxActive]}>
              <Ionicons name="headset-outline" size={22} color={BRAND} />
            </View>
            <Text style={[styles.typeLabel, styles.typeLabelActive]}>Call & Chat</Text>
            <Text style={styles.typeSub}>This session automatically includes both Text Chat and Direct Call options.</Text>
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

          {/* Book Button */}
          <Pressable
            onPress={handleBook}
            disabled={!canBook}
            style={({ pressed }) => ({
              backgroundColor: canBook ? BRAND : '#9CA3AF',
              borderRadius: 18, paddingVertical: 18,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
              opacity: pressed ? 0.85 : 1, marginTop: 24,
            })}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              Book Session • {currentPrice}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        </View>
      </ScrollView>
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
  notifDot: {
    position: 'absolute', top: 2, right: 2,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#fff',
  },
  avatarCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center',
  },

  /* Doctor Card */
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

  /* Consultation type */
  typeRow: { flexDirection: 'row', gap: 12 },
  typeCard: {
    flex: 1, backgroundColor: '#fff',
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
  typeSub: { fontSize: 11, color: '#9CA3AF', marginBottom: 10, lineHeight: 16 },
  typePriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typePrice: { fontSize: 16, fontWeight: '900', color: '#374151' },
  typePriceActive: { color: BRAND },
  typeCheck: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center',
  },

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
