import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApiErrorMessage } from '@/api/client';
import { useAuth } from '../../../context/AuthContext';
import { usePharmacistProfile } from '@/hooks/usePharmacistProfile';

// ── Helpers ──────────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0‑23
const MINUTES = [0, 15, 30, 45];

function fmt(h: number, m: number) {
  const period = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  const mm = m.toString().padStart(2, '0');
  return `${hh}:${mm} ${period}`;
}

type DaySlot = {
  day: string;
  enabled: boolean;
  startH: number;
  startM: number;
  endH: number;
  endM: number;
};

const DEFAULT_SLOTS: DaySlot[] = [
  { day: 'Monday',    enabled: true,  startH: 9,  startM: 0, endH: 17, endM: 0 },
  { day: 'Tuesday',   enabled: true,  startH: 9,  startM: 0, endH: 17, endM: 0 },
  { day: 'Wednesday', enabled: true,  startH: 9,  startM: 0, endH: 17, endM: 0 },
  { day: 'Thursday',  enabled: true,  startH: 9,  startM: 0, endH: 17, endM: 0 },
  { day: 'Friday',    enabled: true,  startH: 9,  startM: 0, endH: 15, endM: 0 },
  { day: 'Saturday',  enabled: false, startH: 9,  startM: 0, endH: 13, endM: 0 },
  { day: 'Sunday',    enabled: false, startH: 9,  startM: 0, endH: 13, endM: 0 },
];

// ── Time Picker Modal ─────────────────────────────────────────────────────────

type TimePickerModalProps = {
  visible: boolean;
  title: string;
  hour: number;
  minute: number;
  onConfirm: (h: number, m: number) => void;
  onClose: () => void;
};

function TimePickerModal({ visible, title, hour, minute, onConfirm, onClose }: TimePickerModalProps) {
  const [selH, setSelH] = useState(hour);
  const [selM, setSelM] = useState(minute);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{title}</Text>

          {/* Preview */}
          <View style={styles.timePreview}>
            <Text style={styles.timePreviewText}>{fmt(selH, selM)}</Text>
          </View>

          {/* Hour Picker */}
          <Text style={styles.pickerLabel}>Hour</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerRow}>
            {HOURS.map((h) => (
              <TouchableOpacity
                key={h}
                style={[styles.pickerItem, selH === h && styles.pickerItemActive]}
                onPress={() => setSelH(h)}
              >
                <Text style={[styles.pickerItemText, selH === h && styles.pickerItemTextActive]}>
                  {h % 12 === 0 ? 12 : h % 12}
                  {h < 12 ? 'am' : 'pm'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Minute Picker */}
          <Text style={styles.pickerLabel}>Minute</Text>
          <View style={styles.minuteRow}>
            {MINUTES.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.minuteItem, selM === m && styles.pickerItemActive]}
                onPress={() => setSelM(m)}
              >
                <Text style={[styles.pickerItemText, selM === m && styles.pickerItemTextActive]}>
                  :{m.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Confirm */}
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => { onConfirm(selH, selM); onClose(); }}
          >
            <Text style={styles.confirmBtnText}>Set Time</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, isLoading, error, update, updateFees, reload } = usePharmacistProfile();
  const { uploadAvatar } = useAuth();

  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [pharmacyAddress, setPharmacyAddress] = useState('');
  const [vacationMode, setVacationMode] = useState(false);
  const [slots, setSlots] = useState<DaySlot[]>(DEFAULT_SLOTS);
  const [saving, setSaving] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Fee state
  const [feeDrugInquiry, setFeeDrugInquiry] = useState('');
  const [feeFullConsultation, setFeeFullConsultation] = useState('');
  const [editingFee, setEditingFee] = useState<'feeDrugInquiry' | 'feeFullConsultation' | null>(null);

  // Prefill the form once the profile loads.
  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName ?? '');
    setSpecialty(profile.specialty ?? '');
    setBio(profile.bio ?? '');
    setPharmacyName(profile.pharmacyName ?? '');
    setPharmacyAddress(profile.pharmacyAddress ?? '');
    setVacationMode(profile.vacationMode);
    setAvatarUri(profile.profileImage ?? null);
    setFeeDrugInquiry(String(profile.feeDrugInquiry ?? ''));
    setFeeFullConsultation(String(profile.feeFullConsultation ?? ''));
    if (profile.workingHours && profile.workingHours.length > 0) {
      // Merge saved entries into the full 7-day template so every day
      // always appears in the UI even if the DB only stored a subset.
      const merged = DEFAULT_SLOTS.map(def => {
        const saved = profile.workingHours!.find(s => s.day === def.day);
        return saved ?? def;
      });
      setSlots(merged);
    }
  }, [profile]);

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to add a profile photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const fileName = asset.fileName ?? `avatar-${Date.now()}.jpg`;
    const ext = fileName.includes('.') ? fileName.split('.').pop() : 'jpg';
    setUploadingAvatar(true);
    try {
      const updated = await uploadAvatar({
        uri: asset.uri,
        name: fileName,
        type: asset.mimeType ?? `image/${ext}`,
      });
      setAvatarUri(updated.profileImage);
      reload();
    } catch (err) {
      Alert.alert('Upload failed', getApiErrorMessage(err, 'Could not upload your photo.'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const feeInquiryNum = parseInt(feeDrugInquiry, 10);
      const feeConsultNum = parseInt(feeFullConsultation, 10);
      if (!isNaN(feeInquiryNum) && !isNaN(feeConsultNum)) {
        await updateFees({ feeDrugInquiry: feeInquiryNum, feeFullConsultation: feeConsultNum });
      }
      await update({
        fullName: fullName.trim(),
        specialty: specialty.trim(),
        bio: bio.trim(),
        pharmacyName: pharmacyName.trim(),
        pharmacyAddress: pharmacyAddress.trim(),
        vacationMode,
        workingHours: slots,
      });
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(pharmacist)/profile' as any);
      }
    } catch (err) {
      Alert.alert('Could not save', getApiErrorMessage(err, 'Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  // Modal state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{ index: number; field: 'start' | 'end' } | null>(null);

  const toggleDay = (index: number) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], enabled: !updated[index].enabled };
    setSlots(updated);
  };

  const openPicker = (index: number, field: 'start' | 'end') => {
    setPickerTarget({ index, field });
    setPickerVisible(true);
  };

  const handleTimeConfirm = (h: number, m: number) => {
    if (!pickerTarget) return;
    const updated = [...slots];
    const { index, field } = pickerTarget;
    if (field === 'start') {
      updated[index] = { ...updated[index], startH: h, startM: m };
    } else {
      updated[index] = { ...updated[index], endH: h, endM: m };
    }
    setSlots(updated);
  };

  const currentSlot = pickerTarget ? slots[pickerTarget.index] : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(pharmacist)/profile' as any)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#0B1C5A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(pharmacist)/notifications' as any)}>
          <Ionicons name="notifications-outline" size={24} color="#0B1C5A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <Text style={styles.screenSubtitle}>Manage your professional information and availability.</Text>

        {error && (
          <View style={{ backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 16 }}>
            <Text style={{ color: '#B91C1C', fontSize: 13 }}>{error}</Text>
          </View>
        )}

        {/* Professional Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Professional Details</Text>

          <TouchableOpacity style={styles.avatarUpload} onPress={handlePickAvatar} disabled={uploadingAvatar}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarCircle} />
            ) : (
              <View style={[styles.avatarCircle, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={36} color="#94A3B8" />
              </View>
            )}
            <View style={styles.avatarAddBtn}>
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera" size={14} color="#fff" />
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. Pharm. John Doe"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>Specialty</Text>
          <TextInput
            style={styles.input}
            value={specialty}
            onChangeText={setSpecialty}
            placeholder="e.g. Clinical Pharmacy Specialist"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>About</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell patients about your experience…"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>Pharmacy Name</Text>
          <TextInput
            style={styles.input}
            value={pharmacyName}
            onChangeText={setPharmacyName}
            placeholder="e.g. WellSpring Pharmacy"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>Pharmacy Address</Text>
          <TextInput
            style={styles.input}
            value={pharmacyAddress}
            onChangeText={setPharmacyAddress}
            placeholder="Street, city"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Consultation Fees */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Consultation Fees</Text>
          <Text style={[styles.hintText, { marginBottom: 16 }]}>
            Set your rates. Must be ₦1,000–₦10,000. A 10% platform commission applies to all payouts.
          </Text>

          {[
            { id: 'feeDrugInquiry' as const, label: 'Drug-Specific Inquiry', desc: 'Quick questions about specific medications', icon: 'link-outline', value: feeDrugInquiry, set: setFeeDrugInquiry },
            { id: 'feeFullConsultation' as const, label: 'Full Health Consultation', desc: 'Comprehensive patient consultation session', icon: 'medkit-outline', value: feeFullConsultation, set: setFeeFullConsultation },
          ].map((fee) => {
            const isEditing = editingFee === fee.id;
            const num = parseInt(fee.value, 10);
            const valid = !isNaN(num) && num >= 1000 && num <= 10000;
            const net = valid ? (num * 0.9).toLocaleString('en-NG') : '—';
            return (
              <View key={fee.id} style={styles.feeCard}>
                <View style={styles.feeCardHeader}>
                  <View style={styles.feeIconWrap}>
                    <Ionicons name={fee.icon as any} size={18} color="#0B1C5A" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.feeCardLabel}>{fee.label}</Text>
                    <Text style={styles.feeCardDesc}>{fee.desc}</Text>
                  </View>
                </View>
                <View style={styles.feeAmountRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.feeAmountMeta}>Your Price</Text>
                    {isEditing ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={styles.feeCurrency}>₦</Text>
                        <TextInput
                          style={[styles.feeInput, !valid && { borderColor: '#EF4444' }]}
                          keyboardType="numeric"
                          value={fee.value}
                          onChangeText={(v) => fee.set(v.replace(/[^0-9]/g, ''))}
                          autoFocus
                        />
                      </View>
                    ) : (
                      <Text style={styles.feeAmountDisplay}>
                        {valid ? `₦${num.toLocaleString('en-NG')}` : '—'}
                      </Text>
                    )}
                    {isEditing && !valid && (
                      <Text style={{ fontSize: 11, color: '#EF4444', marginTop: 2 }}>
                        Must be ₦1,000–₦10,000
                      </Text>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.feeAmountMeta}>You Receive</Text>
                    <Text style={styles.feeNetAmount}>₦{net}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.feeEditBtn, isEditing && valid && styles.feeEditBtnActive]}
                  onPress={() => setEditingFee(isEditing ? null : fee.id)}
                >
                  <Ionicons name={isEditing ? 'checkmark' : 'pencil'} size={14} color={isEditing && valid ? '#fff' : '#0B1C5A'} />
                  <Text style={[styles.feeEditBtnText, isEditing && valid && { color: '#fff' }]}>
                    {isEditing ? 'Done' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Availability & Hours */}
        <View style={styles.card}>
          <View style={styles.availabilityHeader}>
            <Text style={styles.sectionTitle}>Availability & Hours</Text>
            <View style={[styles.vacationTag, vacationMode && { backgroundColor: '#FEF2F2' }]}>
              {vacationMode && <Ionicons name="airplane-outline" size={14} color="#DC2626" style={{ marginRight: 4 }} />}
              <Text style={[styles.vacationText, vacationMode && { color: '#DC2626' }]}>
                {vacationMode ? 'On Vacation' : 'Vacation Mode'}
              </Text>
              <Switch
                value={vacationMode}
                onValueChange={setVacationMode}
                trackColor={{ false: '#E2E8F0', true: '#10B981' }}
                thumbColor="#fff"
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
          </View>

          <Text style={styles.label}>Timezone</Text>
          <View style={styles.dropdownInput}>
            <Text style={styles.dropdownText}>
              {profile?.timezone === 'Africa/Lagos' || !profile?.timezone
                ? 'West Africa Standard Time (WAT) – GMT+1'
                : profile.timezone}
            </Text>
          </View>

          <Text style={[styles.label, { marginTop: 16, marginBottom: 4 }]}>Working Hours</Text>
          <Text style={styles.hintText}>Tap the time to change your hours for any day.</Text>

          {slots.map((slot, index) => (
            <View key={index} style={[styles.dayRow, !slot.enabled && styles.dayRowDisabled]}>
              {/* Toggle + Day Name */}
              <View style={styles.dayLeft}>
                <Switch
                  value={slot.enabled}
                  onValueChange={() => toggleDay(index)}
                  trackColor={{ false: '#E2E8F0', true: '#0B1C5A' }}
                  thumbColor="#fff"
                  style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                />
                <Text style={[styles.dayText, !slot.enabled && styles.dayTextDisabled]}>
                  {slot.day.slice(0, 3)}
                </Text>
              </View>

              {/* Time Selectors or Unavailable */}
              {slot.enabled ? (
                <View style={styles.timeSelectors}>
                  <TouchableOpacity
                    style={styles.timeChip}
                    onPress={() => openPicker(index, 'start')}
                  >
                    <Text style={styles.timeChipText}>{fmt(slot.startH, slot.startM)}</Text>
                  </TouchableOpacity>
                  <Text style={styles.timeSep}>→</Text>
                  <TouchableOpacity
                    style={styles.timeChip}
                    onPress={() => openPicker(index, 'end')}
                  >
                    <Text style={styles.timeChipText}>{fmt(slot.endH, slot.endM)}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.unavailableText}>Unavailable</Text>
              )}
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.saveBtn, (saving || isLoading) && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving || isLoading}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={() => router.canGoBack() ? router.back() : router.replace('/(pharmacist)/profile' as any)}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Time Picker Modal */}
      {pickerTarget && currentSlot && (
        <TimePickerModal
          visible={pickerVisible}
          title={`${currentSlot.day} — ${pickerTarget.field === 'start' ? 'Start' : 'End'} Time`}
          hour={pickerTarget.field === 'start' ? currentSlot.startH : currentSlot.endH}
          minute={pickerTarget.field === 'start' ? currentSlot.startM : currentSlot.endM}
          onConfirm={handleTimeConfirm}
          onClose={() => setPickerVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0B1C5A' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 20, paddingBottom: 120 },
  screenSubtitle: { fontSize: 14, color: '#475569', marginBottom: 20 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0B1C5A', marginBottom: 16 },
  avatarUpload: { alignSelf: 'center', marginBottom: 16 },
  avatarCircle: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  avatarPlaceholder: { backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  avatarAddBtn: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: '#0B1C5A', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  label: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#1E293B', marginBottom: 16,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  availabilityHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  vacationTag: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F1F5F9', paddingHorizontal: 8,
    paddingVertical: 4, borderRadius: 20, gap: 4,
  },
  vacationText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  dropdownInput: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 4,
  },
  dropdownText: { fontSize: 13, color: '#1E293B' },
  hintText: { fontSize: 12, color: '#94A3B8', marginBottom: 12 },
  dayRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  dayRowDisabled: { opacity: 0.5 },
  dayLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dayText: { fontSize: 14, fontWeight: '700', color: '#1E293B', width: 34 },
  dayTextDisabled: { color: '#94A3B8' },
  timeSelectors: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeChip: {
    backgroundColor: '#EEF2FF', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: '#C7D2FE',
  },
  timeChipText: { fontSize: 13, fontWeight: '700', color: '#0B1C5A' },
  timeSep: { fontSize: 14, color: '#94A3B8', fontWeight: '700' },
  unavailableText: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  actionBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 12,
  },
  saveBtn: { backgroundColor: '#0B1C5A' },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  cancelBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#94A3B8' },
  cancelBtnText: { color: '#0B1C5A', fontSize: 14, fontWeight: '700' },

  // ── Fee card styles ──
  feeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  feeCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  feeIconWrap: {
    width: 36, height: 36, borderRadius: 9,
    backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center',
  },
  feeCardLabel: { fontSize: 13, fontWeight: '800', color: '#0B1C5A', marginBottom: 2 },
  feeCardDesc: { fontSize: 11, color: '#64748B' },
  feeAmountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  feeAmountMeta: { fontSize: 10, fontWeight: '700', color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  feeAmountDisplay: { fontSize: 20, fontWeight: '900', color: '#0B1C5A' },
  feeNetAmount: { fontSize: 16, fontWeight: '800', color: '#065F46' },
  feeCurrency: { fontSize: 16, fontWeight: '800', color: '#0B1C5A' },
  feeInput: {
    flex: 1, borderWidth: 1.5, borderColor: '#C7D2FE',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    fontSize: 16, fontWeight: '700', color: '#0B1C5A',
  },
  feeEditBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EEF2FF', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start',
  },
  feeEditBtnActive: { backgroundColor: '#0B1C5A' },
  feeEditBtnText: { fontSize: 12, fontWeight: '700', color: '#0B1C5A' },

  // ── Modal ──
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24, paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: {
    fontSize: 16, fontWeight: '800', color: '#0B1C5A',
    textAlign: 'center', marginBottom: 16,
  },
  timePreview: {
    backgroundColor: '#0B1C5A', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', marginBottom: 20,
  },
  timePreviewText: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  pickerLabel: {
    fontSize: 11, fontWeight: '700', color: '#94A3B8',
    letterSpacing: 1, marginBottom: 8,
  },
  pickerRow: { gap: 8, paddingBottom: 4, marginBottom: 16 },
  pickerItem: {
    backgroundColor: '#F1F5F9', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, minWidth: 52, alignItems: 'center',
  },
  pickerItemActive: { backgroundColor: '#0B1C5A' },
  pickerItemText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  pickerItemTextActive: { color: '#fff' },
  minuteRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  minuteItem: {
    flex: 1, backgroundColor: '#F1F5F9',
    borderRadius: 10, paddingVertical: 12, alignItems: 'center',
  },
  confirmBtn: {
    backgroundColor: '#0B1C5A', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
