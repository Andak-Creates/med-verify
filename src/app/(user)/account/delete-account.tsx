import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { getApiErrorMessage } from '@/api/client';

const CONFIRM_PHRASE = 'delete permanently';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { deleteAccount } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const phraseOk = confirmText.trim().toLowerCase() === CONFIRM_PHRASE;

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(user)/account' as any);
    }
  };

  const handleDeletePressed = () => {
    if (!phraseOk) return;
    setConfirmModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmModalVisible(false);
    setDeleting(true);
    try {
      await deleteAccount();
      // Session is cleared in AuthContext — navigate to onboarding
      router.replace('/(onboarding)/role-select' as any);
    } catch (err) {
      Alert.alert(
        'Deletion Failed',
        getApiErrorMessage(err, 'Something went wrong. Please try again.'),
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#0B1C5A" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name="trash-outline" size={36} color="#EF4444" />
          </View>

          <Text style={styles.title}>Delete Account</Text>
          <Text style={styles.subtitle}>
            This action is permanent and cannot be undone. All your scan history, AI chats, and profile data will be permanently erased.
          </Text>

          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={16} color="#B91C1C" style={{ marginRight: 8, marginTop: 2 }} />
            <Text style={styles.warningText}>
              Are you absolutely sure you want to delete your MedVerify account?
            </Text>
          </View>

          <Text style={styles.inputLabel}>
            Type <Text style={styles.phraseHighlight}>delete permanently</Text> to confirm
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="create-outline" size={20} color="#8E9CB2" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="delete permanently"
              placeholderTextColor="#8E9CB2"
              value={confirmText}
              onChangeText={setConfirmText}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, (!phraseOk || deleting) && styles.btnDisabled]}
            disabled={!phraseOk || deleting}
            onPress={handleDeletePressed}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.btnText}>Permanently Delete</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={goBack}>
            <Text style={styles.cancelBtnText}>Keep My Account</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Final Confirmation Modal */}
      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="warning" size={32} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Last chance!</Text>
            <Text style={styles.modalBody}>
              Your account and all associated data will be permanently deleted. This cannot be reversed.
            </Text>
            <TouchableOpacity
              style={styles.modalDeleteBtn}
              onPress={handleConfirmDelete}
            >
              <Text style={styles.modalDeleteBtnText}>Yes, Delete My Account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setConfirmModalVisible(false)}
            >
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  content: { flex: 1, paddingHorizontal: 28, paddingTop: 32 },
  iconWrap: { width: 72, height: 72, borderRadius: 24, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '900', color: '#EF4444', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 24, marginBottom: 24 },
  warningBox: { backgroundColor: '#FEF2F2', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA', marginBottom: 28, flexDirection: 'row', alignItems: 'flex-start' },
  warningText: { color: '#B91C1C', fontSize: 14, fontWeight: '600', lineHeight: 20, flex: 1 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 10 },
  phraseHighlight: { color: '#EF4444', fontWeight: '800' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, height: 60, marginBottom: 24, borderWidth: 1, borderColor: '#E5E7EB' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  btn: { backgroundColor: '#EF4444', borderRadius: 16, height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#EF4444', shadowOpacity: 0.25, shadowRadius: 10, elevation: 5, marginBottom: 16 },
  btnDisabled: { opacity: 0.45 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  cancelBtn: { height: 60, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { color: '#0B1C5A', fontSize: 16, fontWeight: '800' },

  // Confirmation modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(17,24,39,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 28, width: '100%', maxWidth: 360, alignItems: 'center' },
  modalIconWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#111827', marginBottom: 10 },
  modalBody: { fontSize: 14, color: '#6B7280', lineHeight: 22, textAlign: 'center', marginBottom: 24 },
  modalDeleteBtn: { backgroundColor: '#EF4444', borderRadius: 14, paddingVertical: 16, width: '100%', alignItems: 'center', marginBottom: 12 },
  modalDeleteBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  modalCancelBtn: { paddingVertical: 14, width: '100%', alignItems: 'center' },
  modalCancelBtnText: { color: '#0B1C5A', fontSize: 15, fontWeight: '700' },
});
