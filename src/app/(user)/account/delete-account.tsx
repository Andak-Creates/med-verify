import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#0B1C5A" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name="warning" size={36} color="#EF4444" />
          </View>
          
          <Text style={styles.title}>Delete Account</Text>
          <Text style={styles.subtitle}>
            This action is permanent and cannot be undone. All your scan history, AI chats, and profile data will be permanently erased.
          </Text>

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Are you absolutely sure you want to delete your MedVerify account?
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#8E9CB2" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter password to confirm"
              placeholderTextColor="#8E9CB2"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.btn, !password && styles.btnDisabled]} 
            disabled={!password}
            onPress={() => setConfirmDelete(true)}
          >
            <Text style={styles.btnText}>Permanently Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelBtnText}>Keep My Account</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  content: { flex: 1, paddingHorizontal: 28, paddingTop: 40 },
  iconWrap: { width: 72, height: 72, borderRadius: 24, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '900', color: '#EF4444', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 24, marginBottom: 24 },
  warningBox: { backgroundColor: '#FEF2F2', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA', marginBottom: 32 },
  warningText: { color: '#B91C1C', fontSize: 14, fontWeight: '600', lineHeight: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, height: 60, marginBottom: 24, borderWidth: 1, borderColor: '#E5E7EB' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  btn: { backgroundColor: '#EF4444', borderRadius: 16, height: 60, alignItems: 'center', justifyContent: 'center', shadowColor: '#EF4444', shadowOpacity: 0.25, shadowRadius: 10, elevation: 5, marginBottom: 16 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  cancelBtn: { height: 60, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { color: '#0B1C5A', fontSize: 16, fontWeight: '800' },
});
