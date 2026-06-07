import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScanImageScreen() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [imageSelected, setImageSelected] = useState(false);

  const handleSelectImage = () => {
    // Mock: simulate selecting a photo
    setImageSelected(true);
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      router.push({
        pathname: '/(user)/home/result',
        params: { code: 'default' },
      } as any);
    }, 2500);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}
        >
          <Ionicons name="chevron-back" size={22} color="#0B1C5A" />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: '#0B1C5A', marginRight: 40 }}>
          Scan Drug Image
        </Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 24, alignItems: 'center' }}>
        {/* Subtitle */}
        <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 21, marginBottom: 28 }}>
          Take a photo of the drug packaging or label. Our AI will extract and verify the details.
        </Text>

        {/* Image Preview / Upload Box */}
        <TouchableOpacity
          onPress={handleSelectImage}
          style={{
            width: '100%', height: 260, borderRadius: 24, overflow: 'hidden',
            backgroundColor: imageSelected ? '#000' : '#EEF1FB',
            borderWidth: 2, borderColor: imageSelected ? '#0B1C5A' : '#E0E5F5',
            borderStyle: imageSelected ? 'solid' : 'dashed',
            alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          }}
        >
          {imageSelected ? (
            <>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400' }}
                style={{ width: '100%', height: '100%', opacity: 0.85 }}
                resizeMode="cover"
              />
              {/* Overlay label */}
              <View style={{ position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="refresh-outline" size={14} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Change Photo</Text>
              </View>
            </>
          ) : (
            <View style={{ alignItems: 'center', gap: 12 }}>
              <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#0B1C5A', shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 }}>
                <Ionicons name="camera" size={30} color="#0B1C5A" />
              </View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#0B1C5A' }}>Tap to take a photo</Text>
              <Text style={{ fontSize: 12, color: '#8E9CB2' }}>Or pick from gallery</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Tips */}
        {!imageSelected && (
          <View style={{ width: '100%', backgroundColor: '#fff', borderRadius: 18, padding: 16, gap: 10, shadowColor: '#0B1C5A', shadowOpacity: 0.03, shadowRadius: 8, elevation: 2, marginBottom: 24 }}>
            {[
              { icon: 'sunny-outline', tip: 'Ensure good lighting for best results' },
              { icon: 'scan-outline', tip: 'Include the full label or packaging' },
              { icon: 'eye-outline', tip: 'Make sure the NAFDAC number is visible' },
            ].map(item => (
              <View key={item.tip} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#EEF1FB', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={item.icon as any} size={16} color="#0B1C5A" />
                </View>
                <Text style={{ fontSize: 13, color: '#374151', flex: 1 }}>{item.tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Analyze Button */}
        {imageSelected && (
          <Pressable
            onPress={handleAnalyze}
            disabled={analyzing}
            style={({ pressed }) => ({
              backgroundColor: '#0B1C5A', borderRadius: 18, paddingVertical: 18,
              width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            {analyzing ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Analyzing Imageâ€¦</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Analyze & Verify</Text>
              </>
            )}
          </Pressable>
        )}

        {/* Or scan QR */}
        <TouchableOpacity
          onPress={() => router.replace('/(user)/home/scan-qr' as any)}
          style={{ marginTop: 20 }}
        >
          <Text style={{ color: '#0B1C5A', fontSize: 13, fontWeight: '700', letterSpacing: 1 }}>
            SCAN QR CODE INSTEAD
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

