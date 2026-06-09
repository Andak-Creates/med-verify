import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
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

const STEPS = ['Drug', 'Pharmacy', 'Review', 'Submit'];

function StepIndicator({ current }: { current: number }) {
  return (
    <View style={styles.stepRow}>
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <View key={label} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              done && styles.stepDone,
              active && styles.stepActive,
            ]}>
              {done
                ? <Ionicons name="checkmark" size={14} color="#fff" />
                : <Text style={[styles.stepNum, active && { color: '#fff' }]}>{i + 1}</Text>
              }
            </View>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, (done || active) && styles.stepLineDone]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

export default function ReportScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const [step, setStep] = useState(0);

  // Step 1 - Drug Details
  const [medName, setMedName] = useState('');
  const [batchNo, setBatchNo] = useState('');

  // Step 2 - Pharmacy Details
  const [pharmacyName, setPharmacyName] = useState('');
  const [pharmacyAddress, setPharmacyAddress] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to attach a receipt.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const refId = `MV-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`;

  const handleNext = () => {
    if (step < 3) setStep(s => s + 1);
    else {
      // Navigate to confirm with ref id
      router.replace({
        pathname: '/(user)/home/report-confirm',
        params: { code, ref: refId },
      } as any);
    }
  };

  const canNext = () => {
    if (step === 0) return medName.trim().length > 0 && batchNo.trim().length > 0;
    if (step === 1) return pharmacyName.trim().length > 0;
    return true;
  };

  const renderStep1 = () => (
    <View style={styles.card}>
      <View style={styles.cardTitle}>
        <Ionicons name="medical-outline" size={17} color={BRAND} />
        <Text style={styles.cardTitleText}>Drug Details</Text>
      </View>
      <Text style={styles.fieldLabel}>Medication Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Paracetamol 500mg"
        placeholderTextColor="#9CA3AF"
        value={medName}
        onChangeText={setMedName}
      />
      <Text style={styles.fieldLabel}>Batch / Lot Number</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. BN123456"
        placeholderTextColor="#9CA3AF"
        value={batchNo}
        onChangeText={setBatchNo}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.card}>
      <View style={styles.cardTitle}>
        <Ionicons name="storefront-outline" size={17} color={BRAND} />
        <Text style={styles.cardTitleText}>Pharmacy Details</Text>
      </View>
      <Text style={styles.fieldLabel}>Pharmacy Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. HealthPlus Pharmacy"
        placeholderTextColor="#9CA3AF"
        value={pharmacyName}
        onChangeText={setPharmacyName}
      />
      <Text style={styles.fieldLabel}>Pharmacy Address / Location</Text>
      <TextInput
        style={[styles.input, { height: 88, textAlignVertical: 'top', paddingTop: 12 }]}
        placeholder="Full address or landmark"
        placeholderTextColor="#9CA3AF"
        value={pharmacyAddress}
        onChangeText={setPharmacyAddress}
        multiline
      />
      <Text style={styles.fieldLabel}>Upload Receipt or Pharmacy Photo</Text>
      <TouchableOpacity style={styles.photoBox} onPress={pickImage}>
        {receiptImage ? (
          <Image source={{ uri: receiptImage }} style={styles.photoPreview} resizeMode="cover" />
        ) : (
          <>
            <View style={styles.photoIconWrap}>
              <Ionicons name="camera-outline" size={28} color={BRAND} />
              <Ionicons name="add" size={14} color={BRAND} style={{ position: 'absolute', bottom: -2, right: -2 }} />
            </View>
            <Text style={styles.photoHint}>Tap to upload or take photo</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <>
      {/* Drug summary */}
      <View style={[styles.card, { marginBottom: 12 }]}>
        <View style={styles.reviewHeader}>
          <View style={styles.cardTitle}>
            <Ionicons name="medical-outline" size={15} color={BRAND} />
            <Text style={styles.cardTitleText}>Drug Details</Text>
          </View>
          <TouchableOpacity onPress={() => setStep(0)}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.reviewMain}>{medName || '—'}</Text>
        <Text style={styles.reviewSub}>Batch Number: {batchNo || '—'}</Text>
      </View>

      {/* Pharmacy summary */}
      <View style={[styles.card, { marginBottom: 12 }]}>
        <View style={styles.reviewHeader}>
          <View style={styles.cardTitle}>
            <Ionicons name="storefront-outline" size={15} color={BRAND} />
            <Text style={styles.cardTitleText}>Pharmacy Details</Text>
          </View>
          <TouchableOpacity onPress={() => setStep(1)}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.reviewMain}>{pharmacyName || '—'}</Text>
        {!!pharmacyAddress && <Text style={styles.reviewSub}>{pharmacyAddress}</Text>}
      </View>

      {/* Receipt */}
      <View style={styles.card}>
        <View style={styles.reviewHeader}>
          <View style={styles.cardTitle}>
            <Ionicons name="receipt-outline" size={15} color={BRAND} />
            <Text style={styles.cardTitleText}>Purchase Receipt</Text>
          </View>
          <TouchableOpacity onPress={() => setStep(1)}>
            <Text style={styles.editLink}>Change</Text>
          </TouchableOpacity>
        </View>
        {receiptImage ? (
          <Image source={{ uri: receiptImage }} style={styles.reviewImage} resizeMode="cover" />
        ) : (
          <Text style={styles.reviewSub}>No receipt attached</Text>
        )}
      </View>
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => step > 0 ? setStep(s => s - 1) : router.back()}
              style={styles.backBtn}
            >
              <Ionicons name="chevron-back" size={22} color={BRAND} />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <Pressable style={styles.notifBtn}>
                <Ionicons name="notifications-outline" size={20} color={BRAND} />
                <View style={styles.notifDot} />
              </Pressable>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={18} color="#fff" />
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 22 }}>
            <StepIndicator current={step} />

            <Text style={styles.title}>Submit Report</Text>
            <Text style={styles.subtitle}>
              Your report helps NAFDAC protect the public from dangerous medications. All information is confidential.
            </Text>

            {step === 0 && renderStep1()}
            {step === 1 && renderStep2()}
            {step === 2 && renderStep3()}

            {/* Buttons */}
            <View style={step > 0 ? styles.btnRow : null}>
              {step > 0 && (
                <TouchableOpacity
                  style={styles.backOutlineBtn}
                  onPress={() => setStep(s => s - 1)}
                >
                  <Text style={styles.backOutlineBtnText}>Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.nextBtn, !canNext() && { opacity: 0.45 }, step > 0 && { flex: 1 }]}
                onPress={handleNext}
                disabled={!canNext()}
              >
                <Text style={styles.nextBtnText}>{step === 2 ? 'Submit Report  ›' : 'Next'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notifBtn: { position: 'relative', padding: 4 },
  notifDot: {
    position: 'absolute', top: 2, right: 2,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#fff',
  },
  avatarCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#9CA3AF',
    alignItems: 'center', justifyContent: 'center',
  },

  /* Step Indicator */
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, marginTop: 4 },
  stepItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  stepActive: { backgroundColor: BRAND },
  stepDone: { backgroundColor: BRAND },
  stepNum: { fontSize: 13, fontWeight: '700', color: '#9CA3AF' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 4 },
  stepLineDone: { backgroundColor: BRAND },

  title: { fontSize: 26, fontWeight: '900', color: BRAND, marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 24 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
  },
  cardTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  cardTitleText: { fontSize: 14, fontWeight: '800', color: BRAND },

  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8, marginTop: 4 },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },

  photoBox: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 14,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  photoIconWrap: { position: 'relative', marginBottom: 8 },
  photoHint: { fontSize: 13, color: '#9CA3AF' },
  photoPreview: { width: '100%', height: '100%' },

  /* Review */
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  editLink: { fontSize: 13, fontWeight: '700', color: BRAND },
  reviewMain: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 4 },
  reviewSub: { fontSize: 13, color: '#6B7280' },
  reviewImage: { width: '100%', height: 150, borderRadius: 12, marginTop: 8 },

  /* Buttons */
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  nextBtn: {
    backgroundColor: BRAND,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  backOutlineBtn: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    paddingHorizontal: 28,
  },
  backOutlineBtnText: { fontSize: 15, fontWeight: '700', color: '#374151' },
});
