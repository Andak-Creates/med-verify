import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LicenseUploadScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0B1C5A" />
        </TouchableOpacity>
        <View style={styles.progressWrap}>
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Upload License</Text>
        <Text style={styles.subtitle}>Please provide a clear photo or scan of your official pharmacist practicing license.</Text>

        <View style={styles.uploadBox}>
          <View style={styles.uploadIconWrap}>
            <Ionicons name="cloud-upload-outline" size={32} color="#0B1C5A" />
          </View>
          <Text style={styles.uploadTitle}>Tap to Upload File</Text>
          <Text style={styles.uploadSub}>Supports JPG, PNG, PDF (Max 5MB)</Text>
        </View>

        <TouchableOpacity 
          style={styles.cameraBtn}
          onPress={() => router.push('/(onboarding)/pharmacist/profile-setup' as any)}
        >
          <Ionicons name="camera-outline" size={20} color="#0B1C5A" />
          <Text style={styles.cameraBtnText}>Take a Photo</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />

        <TouchableOpacity 
          style={styles.btn} 
          onPress={() => router.push('/(onboarding)/pharmacist/profile-setup' as any)}
        >
          <Text style={styles.btnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  progressWrap: { flexDirection: 'row', gap: 6 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E7EB' },
  progressDotActive: { backgroundColor: '#0B1C5A', width: 24 },
  content: { flex: 1, paddingHorizontal: 28, paddingTop: 40 },
  title: { fontSize: 28, fontWeight: '900', color: '#0B1C5A', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 24, marginBottom: 36 },
  uploadBox: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed', borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: 16 },
  uploadIconWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#EEF1FB', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  uploadTitle: { fontSize: 16, fontWeight: '800', color: '#0B1C5A', marginBottom: 8 },
  uploadSub: { fontSize: 13, color: '#8E9CB2', fontWeight: '500' },
  cameraBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF1FB', borderRadius: 16, height: 60, gap: 8 },
  cameraBtnText: { color: '#0B1C5A', fontSize: 15, fontWeight: '800' },
  spacer: { flex: 1 },
  btn: { backgroundColor: '#0B1C5A', borderRadius: 16, height: 60, alignItems: 'center', justifyContent: 'center', shadowColor: '#0B1C5A', shadowOpacity: 0.25, shadowRadius: 10, elevation: 5, marginBottom: 16 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
