import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#0B1C5A" />
          </TouchableOpacity>
          <View style={styles.progressWrap}>
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
            <View style={[styles.progressDot, styles.progressDotActive]} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Complete Profile</Text>
          <Text style={styles.subtitle}>Help users know who they are consulting with.</Text>

          <View style={styles.avatarUpload}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={40} color="#8E9CB2" />
            </View>
            <View style={styles.avatarAddBtn}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name (with title)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#8E9CB2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Pharm. John Doe"
                placeholderTextColor="#8E9CB2"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Specialty / Focus Area</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="medical-outline" size={20} color="#8E9CB2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Clinical Pharmacy"
                placeholderTextColor="#8E9CB2"
                value={specialty}
                onChangeText={setSpecialty}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.btn, (!fullName.trim() || !specialty.trim()) && styles.btnDisabled]} 
            disabled={!fullName.trim() || !specialty.trim()}
            onPress={() => router.push('/(onboarding)/pharmacist/verification-pending' as any)}
          >
            <Text style={styles.btnText}>Complete Setup</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  content: { paddingHorizontal: 28, paddingTop: 40, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', color: '#0B1C5A', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 24, marginBottom: 32 },
  avatarUpload: { alignSelf: 'center', marginBottom: 32 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  avatarAddBtn: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: '#0B1C5A', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  inputContainer: { marginBottom: 24 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, height: 60, borderWidth: 1, borderColor: '#E5E7EB' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  btn: { backgroundColor: '#0B1C5A', borderRadius: 16, height: 60, alignItems: 'center', justifyContent: 'center', shadowColor: '#0B1C5A', shadowOpacity: 0.25, shadowRadius: 10, elevation: 5, marginTop: 16 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
