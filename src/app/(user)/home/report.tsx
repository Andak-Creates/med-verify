import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { reportDrug } from '@/services/drugs.service';
import { saveReportLocally } from '@/services/reportStorage.service';
import { useLanguage } from '@/i18n';

const BRAND = '#0B1C5A';

export default function ReportScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const params = useLocalSearchParams<{ code?: string; drugName?: string }>();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 - Drug Details
  const [medName, setMedName] = useState(params.drugName || '');
  const [batchNo, setBatchNo] = useState('');
  const [nafdacNo, setNafdacNo] = useState(params.code || '');

  // Step 2 - Pharmacy Details
  const [pharmacyName, setPharmacyName] = useState('');
  const [pharmacyAddress, setPharmacyAddress] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  // Step 3 - Reason & Comments
  const [selectedReason, setSelectedReason] = useState(t.report.reason1);
  const [comments, setComments] = useState('');

  const steps = [t.report.stepDrug, t.report.stepPharmacy, t.report.stepReview, t.report.stepSubmit];

  const reasons = [
    t.report.reason1,
    t.report.reason2,
    t.report.reason3,
    t.report.reason4,
    t.report.reason5,
  ];

  const handleSelectPhotoOption = () => {
    Alert.alert(
      'Attach Evidence',
      'Choose a photo of the store, receipt, or medicine packaging',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const perm = await ImagePicker.requestCameraPermissionsAsync();
            if (!perm.granted) {
              Alert.alert(t.common.permissionDenied, 'Camera access is required to take a photo.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              quality: 0.8,
              allowsEditing: true,
            });
            if (!result.canceled && result.assets?.[0]) {
              setReceiptImage(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
              Alert.alert(t.common.permissionDenied, t.common.grantPermission);
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
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep((s) => s + 1);
    } else {
      setSubmitting(true);
      try {
        const res = await reportDrug({
          drugName: medName.trim(),
          batchNumber: batchNo.trim(),
          nafdacNumber: nafdacNo.trim() || undefined,
          pharmacyName: pharmacyName.trim(),
          pharmacyAddress: pharmacyAddress.trim() || undefined,
          reason: selectedReason,
          comments: comments.trim() || undefined,
          receiptImage: receiptImage || undefined,
        });

        await saveReportLocally({
          id: res.reportId || `REP-${Date.now()}`,
          referenceCode: res.referenceCode,
          drugName: medName.trim(),
          batchNumber: batchNo.trim(),
          nafdacNumber: nafdacNo.trim() || undefined,
          pharmacyName: pharmacyName.trim(),
          pharmacyAddress: pharmacyAddress.trim() || undefined,
          reason: selectedReason,
          comments: comments.trim() || undefined,
          receiptImage: receiptImage || undefined,
          status: 'RECEIVED',
          createdAt: res.createdAt || new Date().toISOString(),
        });

        router.replace({
          pathname: '/(user)/home/report-confirm',
          params: {
            ref: res.referenceCode,
            medName: medName.trim(),
            batchNo: batchNo.trim(),
            nafdacNo: nafdacNo.trim(),
            pharmacyName: pharmacyName.trim(),
            pharmacyAddress: pharmacyAddress.trim(),
            reason: selectedReason,
            comments: comments.trim(),
            receiptImage: receiptImage || '',
            createdAt: res.createdAt || new Date().toISOString(),
          },
        } as any);
      } catch (err: any) {
        Alert.alert(t.common.error, err.message || 'Could not submit report.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const canNext = () => {
    if (step === 0) return medName.trim().length > 0 && batchNo.trim().length > 0;
    if (step === 1) return pharmacyName.trim().length > 0;
    return true;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (step > 0 ? setStep((s) => s - 1) : router.back())}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={22} color={BRAND} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.report.title}</Text>
      </View>

      {/* Step Indicator */}
      <View style={styles.stepRow}>
        {steps.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <View key={i} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  done && styles.stepDone,
                  active && styles.stepActive,
                ]}
              >
                {done ? (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                ) : (
                  <Text style={[styles.stepNum, active && { color: '#fff' }]}>{i + 1}</Text>
                )}
              </View>
              {i < steps.length - 1 && (
                <View style={[styles.stepLine, (done || active) && styles.stepLineDone]} />
              )}
            </View>
          );
        })}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Step 0: Drug Details */}
          {step === 0 && (
            <Animated.View entering={FadeInDown.springify()} style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="medkit-outline" size={18} color={BRAND} />
                <Text style={styles.cardTitleText}>{t.report.stepDrug}</Text>
              </View>

              <Text style={styles.fieldLabel}>{t.report.drugNameLabel} *</Text>
              <TextInput
                style={styles.input}
                placeholder={t.report.drugNamePlaceholder}
                placeholderTextColor="#94A3B8"
                value={medName}
                onChangeText={setMedName}
              />

              <Text style={styles.fieldLabel}>{t.report.batchLabel} *</Text>
              <TextInput
                style={styles.input}
                placeholder={t.report.batchPlaceholder}
                placeholderTextColor="#94A3B8"
                value={batchNo}
                onChangeText={setBatchNo}
              />

              <Text style={styles.fieldLabel}>{t.report.nafdacLabel}</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 04-1234"
                placeholderTextColor="#94A3B8"
                value={nafdacNo}
                onChangeText={setNafdacNo}
              />
            </Animated.View>
          )}

          {/* Step 1: Pharmacy Details */}
          {step === 1 && (
            <Animated.View entering={FadeInDown.springify()} style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="storefront-outline" size={18} color={BRAND} />
                <Text style={styles.cardTitleText}>{t.report.stepPharmacy}</Text>
              </View>

              <Text style={styles.fieldLabel}>{t.report.pharmacyNameLabel} *</Text>
              <TextInput
                style={styles.input}
                placeholder={t.report.pharmacyNamePlaceholder}
                placeholderTextColor="#94A3B8"
                value={pharmacyName}
                onChangeText={setPharmacyName}
              />

              <Text style={styles.fieldLabel}>{t.report.addressLabel}</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
                placeholder={t.report.addressPlaceholder}
                placeholderTextColor="#94A3B8"
                value={pharmacyAddress}
                onChangeText={setPharmacyAddress}
                multiline
              />

              <Text style={styles.fieldLabel}>{t.report.receiptLabel}</Text>
              {receiptImage ? (
                <View style={styles.previewCard}>
                  <Image source={{ uri: receiptImage }} style={styles.receiptLargePreview} resizeMode="cover" />
                  <View style={styles.previewActions}>
                    <TouchableOpacity
                      style={styles.changePhotoBtn}
                      onPress={handleSelectPhotoOption}
                    >
                      <Ionicons name="camera-outline" size={16} color={BRAND} />
                      <Text style={styles.changePhotoText}>Change Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removePhotoBtn}
                      onPress={() => setReceiptImage(null)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                      <Text style={styles.removePhotoText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={handleSelectPhotoOption} style={styles.uploadArea}>
                  <View style={styles.uploadIconCircle}>
                    <Ionicons name="camera-outline" size={26} color={BRAND} />
                  </View>
                  <Text style={styles.uploadPrompt}>Take Photo or Choose Image</Text>
                  <Text style={styles.uploadSubPrompt}>Storefront, receipt, or suspicious packaging</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}

          {/* Step 2: Reason & Description */}
          {step === 2 && (
            <Animated.View entering={FadeInDown.springify()} style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="warning-outline" size={18} color={BRAND} />
                <Text style={styles.cardTitleText}>{t.report.reasonLabel}</Text>
              </View>

              <View style={{ gap: 8, marginBottom: 16 }}>
                {reasons.map((reason, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.reasonChip,
                      selectedReason === reason && styles.reasonChipActive,
                    ]}
                    onPress={() => setSelectedReason(reason)}
                  >
                    <Ionicons
                      name={selectedReason === reason ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={selectedReason === reason ? BRAND : '#94A3B8'}
                    />
                    <Text
                      style={[
                        styles.reasonChipText,
                        selectedReason === reason && styles.reasonChipTextActive,
                      ]}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>{t.report.commentsLabel}</Text>
              <TextInput
                style={[styles.input, { height: 90, textAlignVertical: 'top', paddingTop: 10 }]}
                placeholder={t.report.commentsPlaceholder}
                placeholderTextColor="#94A3B8"
                value={comments}
                onChangeText={setComments}
                multiline
              />
            </Animated.View>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <Animated.View entering={FadeInDown.springify()} style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="clipboard-outline" size={18} color={BRAND} />
                <Text style={styles.cardTitleText}>{t.report.stepReview}</Text>
              </View>

              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>{t.report.drugNameLabel}:</Text>
                <Text style={styles.reviewVal}>{medName}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>{t.report.batchLabel}:</Text>
                <Text style={styles.reviewVal}>{batchNo}</Text>
              </View>
              {nafdacNo ? (
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>NAFDAC No:</Text>
                  <Text style={styles.reviewVal}>{nafdacNo}</Text>
                </View>
              ) : null}
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>{t.report.pharmacyNameLabel}:</Text>
                <Text style={styles.reviewVal}>{pharmacyName}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>{t.report.reasonLabel}:</Text>
                <Text style={styles.reviewVal}>{selectedReason}</Text>
              </View>

              {receiptImage && (
                <View style={{ marginTop: 14 }}>
                  <Text style={styles.reviewLabel}>Attached Evidence Photo:</Text>
                  <View style={[styles.previewCard, { marginTop: 8 }]}>
                    <Image source={{ uri: receiptImage }} style={styles.receiptLargePreview} resizeMode="cover" />
                  </View>
                </View>
              )}
            </Animated.View>
          )}

          {/* Actions */}
          <TouchableOpacity
            onPress={handleNext}
            disabled={!canNext() || submitting}
            style={[styles.submitBtn, (!canNext() || submitting) && { opacity: 0.5 }]}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>
                {step === 3 ? t.report.submitReport : t.common.continue}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    color: BRAND,
    marginRight: 40,
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 14,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    backgroundColor: BRAND,
  },
  stepDone: {
    backgroundColor: '#16A34A',
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  stepLine: {
    width: 38,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  stepLineDone: {
    backgroundColor: '#16A34A',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0B1C5A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  cardTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: BRAND,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  uploadArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  uploadIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadPrompt: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '700',
  },
  uploadSubPrompt: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  previewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginTop: 8,
  },
  receiptLargePreview: {
    width: '100%',
    height: 190,
    backgroundColor: '#F1F5F9',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: '700',
    color: BRAND,
  },
  removePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
  },
  removePhotoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  reasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reasonChipActive: {
    borderColor: BRAND,
    backgroundColor: '#EEF2FF',
  },
  reasonChipText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
  },
  reasonChipTextActive: {
    color: BRAND,
    fontWeight: '700',
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  reviewLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  reviewVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    textAlign: 'right',
  },
  submitBtn: {
    backgroundColor: BRAND,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
