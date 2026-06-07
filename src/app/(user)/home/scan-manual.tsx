import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
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

export default function ScanManualScreen() {
  const router = useRouter();
  const [nafdacCode, setNafdacCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    if (!nafdacCode.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push({
        pathname: '/(user)/home/result',
        params: { code: nafdacCode.trim() },
      } as any);
    }, 1500);
  };

  const QUICK_EXAMPLES = ['A4-0118', 'B3-2240', 'C1-5567'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}
            >
              <Ionicons name="chevron-back" size={22} color="#0B1C5A" />
            </TouchableOpacity>
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: '#0B1C5A', marginRight: 40 }}>
              Enter NAFDAC Number
            </Text>
          </View>

          <View style={{ paddingHorizontal: 24 }}>
            {/* Icon + Subtitle */}
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <View style={{
                width: 72, height: 72, borderRadius: 22, backgroundColor: '#0B1C5A',
                alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                shadowColor: '#0B1C5A', shadowOpacity: 0.3, shadowRadius: 14, elevation: 6,
              }}>
                <Ionicons name="keypad" size={32} color="#fff" />
              </View>
              <Text style={{ fontSize: 22, fontWeight: '900', color: '#0B1C5A', marginBottom: 6 }}>
                Manual Verification
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 21 }}>
                Enter the NAFDAC registration number found on the drug packaging to verify authenticity.
              </Text>
            </View>

            {/* Input Card */}
            <View style={{
              backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 20,
              shadowColor: '#0B1C5A', shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
            }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#8E9CB2', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' }}>
                NAFDAC Registration No.
              </Text>
              <TextInput
                value={nafdacCode}
                onChangeText={setNafdacCode}
                placeholder="e.g. A4-0118"
                placeholderTextColor="#CBD5E0"
                autoCapitalize="characters"
                style={{
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  borderColor: nafdacCode ? '#0B1C5A' : '#E5E7EB',
                  borderRadius: 14,
                  paddingHorizontal: 18,
                  paddingVertical: 16,
                  fontSize: 20,
                  fontWeight: '800',
                  color: '#0B1C5A',
                  letterSpacing: 3,
                  marginBottom: 12,
                  textAlign: 'center',
                }}
              />
              <Text style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', lineHeight: 17 }}>
                Usually formatted as XX-XXXX (e.g. A4-0118).{'\n'}Found on the drug label or packaging.
              </Text>
            </View>

            {/* Quick examples */}
            <View style={{ marginBottom: 28 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#8E9CB2', letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase' }}>
                Try an example
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {QUICK_EXAMPLES.map((ex) => (
                  <TouchableOpacity
                    key={ex}
                    onPress={() => setNafdacCode(ex)}
                    style={{
                      backgroundColor: nafdacCode === ex ? '#0B1C5A' : '#EEF1FB',
                      borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: nafdacCode === ex ? '#fff' : '#0B1C5A', letterSpacing: 1 }}>
                      {ex}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Verify Button */}
            <Pressable
              onPress={handleVerify}
              disabled={!nafdacCode.trim() || loading}
              style={({ pressed }) => ({
                backgroundColor: nafdacCode.trim() && !loading ? '#0B1C5A' : '#0B1C5A50',
                borderRadius: 18, paddingVertical: 18,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              {loading ? (
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Verifyingâ€¦</Text>
              ) : (
                <>
                  <Ionicons name="search" size={20} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Verify Drug</Text>
                </>
              )}
            </Pressable>

            {/* Or scan */}
            <TouchableOpacity
              onPress={() => router.replace('/(user)/home/scan-qr' as any)}
              style={{ alignItems: 'center', marginTop: 20 }}
            >
              <Text style={{ color: '#0B1C5A', fontSize: 13, fontWeight: '700', letterSpacing: 1 }}>
                SCAN QR / BARCODE INSTEAD
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

