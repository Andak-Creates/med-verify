import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const REPORT_REASONS = [
  'Suspected counterfeit drug',
  'Incorrect packaging / labelling',
  'Wrong pills inside packaging',
  'Unusual smell, colour or taste',
  'NAFDAC number invalid',
  'Purchased from unlicensed vendor',
  'Other',
];

export default function ReportScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [purchaseLocation, setPurchaseLocation] = useState('');

  const handleSubmit = () => {
    router.replace({ pathname: '/(user)/home/report-confirm', params: { code } } as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}
            >
              <Ionicons name="chevron-back" size={22} color="#0B1C5A" />
            </TouchableOpacity>
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: '#0B1C5A', marginRight: 40 }}>
              Report Drug
            </Text>
          </View>

          <View style={{ paddingHorizontal: 24 }}>
            {/* Warning Banner */}
            <View style={{ backgroundColor: '#FEF2F2', borderRadius: 18, padding: 16, flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 24, borderWidth: 1, borderColor: '#FECACA' }}>
              <Ionicons name="warning" size={22} color="#dc2626" style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#dc2626', marginBottom: 3 }}>Report to NAFDAC & Authorities</Text>
                <Text style={{ fontSize: 12, color: '#991B1B', lineHeight: 18 }}>
                  Your report helps protect others. It will be forwarded to NAFDAC for investigation. Please provide as much detail as possible.
                </Text>
              </View>
            </View>

            {/* Reason Selection */}
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#0B1C5A', letterSpacing: 0.5, marginBottom: 12 }}>
              Reason for Report *
            </Text>
            <View style={{ gap: 8, marginBottom: 24 }}>
              {REPORT_REASONS.map(reason => (
                <TouchableOpacity
                  key={reason}
                  onPress={() => setSelectedReason(reason)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    backgroundColor: selectedReason === reason ? '#EEF1FB' : '#fff',
                    borderRadius: 14, padding: 14,
                    borderWidth: 1.5, borderColor: selectedReason === reason ? '#0B1C5A' : '#E5E7EB',
                  }}
                >
                  <View style={{
                    width: 20, height: 20, borderRadius: 10,
                    borderWidth: 2, borderColor: selectedReason === reason ? '#0B1C5A' : '#CBD5E0',
                    backgroundColor: selectedReason === reason ? '#0B1C5A' : '#fff',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {selectedReason === reason && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />}
                  </View>
                  <Text style={{ fontSize: 13, color: selectedReason === reason ? '#0B1C5A' : '#374151', fontWeight: selectedReason === reason ? '700' : '500', flex: 1 }}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Purchase Location */}
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#0B1C5A', letterSpacing: 0.5, marginBottom: 10 }}>
              Where did you purchase it?
            </Text>
            <TextInput
              value={purchaseLocation}
              onChangeText={setPurchaseLocation}
              placeholder="e.g. Ketu Market, Lagos"
              placeholderTextColor="#CBD5E0"
              style={{
                backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
                fontSize: 14, color: '#111827', borderWidth: 1.5, borderColor: purchaseLocation ? '#0B1C5A' : '#E5E7EB',
                marginBottom: 20,
              }}
            />

            {/* Additional Details */}
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#0B1C5A', letterSpacing: 0.5, marginBottom: 10 }}>
              Additional Details
            </Text>
            <TextInput
              value={details}
              onChangeText={setDetails}
              placeholder="Describe what you noticed (optional)â€¦"
              placeholderTextColor="#CBD5E0"
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingTop: 14,
                fontSize: 14, color: '#111827', borderWidth: 1.5, borderColor: details ? '#0B1C5A' : '#E5E7EB',
                marginBottom: 28, minHeight: 100, textAlignVertical: 'top',
              }}
            />

            {/* Submit */}
            <Pressable
              onPress={handleSubmit}
              disabled={!selectedReason}
              style={({ pressed }) => ({
                backgroundColor: selectedReason ? '#dc2626' : '#dc262640',
                borderRadius: 18, paddingVertical: 18,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Ionicons name="flag" size={20} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Submit Report</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

