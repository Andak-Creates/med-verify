import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
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
import * as pharmacistService from '@/services/pharmacist.service';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, deleteAccount } = useAuth();
  const { profile, update: updateProfile, reload: reloadProfile } = usePharmacistProfile();

  useFocusEffect(
    useCallback(() => {
      reloadProfile();
    }, [reloadProfile])
  );

  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Delete Account
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    router.replace('/(onboarding)/role-select' as any);
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm.');
      return;
    }
    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      setDeleteModalVisible(false);
      router.replace('/(onboarding)/role-select' as any);
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'Could not delete account. Please check your password.'));
    } finally {
      setDeleting(false);
    }
  };

  const isAvailable = profile ? !profile.vacationMode : true;

  const handleToggleAvailability = async (next: boolean) => {
    if (!profile) return;
    setTogglingAvailability(true);
    try {
      await updateProfile({ vacationMode: !next });
    } catch (err) {
      Alert.alert('Could not update availability', getApiErrorMessage(err));
    } finally {
      setTogglingAvailability(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    setPasswordError(null);
    setChangingPassword(true);
    try {
      await pharmacistService.changePassword(currentPassword, newPassword);
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('Password changed', 'Your password has been updated.');
    } catch (err) {
      setPasswordError(getApiErrorMessage(err, 'Could not change your password.'));
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(pharmacist)/profile' as any)} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color="#0B1C5A" />
          </TouchableOpacity>
          {profile?.profileImage ? (
            <Image source={{ uri: profile.profileImage }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="person-outline" size={20} color="#0B1C5A" />
            </View>
          )}
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/(pharmacist)/notifications' as any)}>
          <Ionicons name="notifications-outline" size={24} color="#0B1C5A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        


        {/* FINANCE & PAYOUTS */}
        <Text style={styles.sectionHeader}>FINANCE & PAYOUTS</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => router.push('/(pharmacist)/wallet/withdraw' as any)}
          >
            <View style={styles.listItemLeft}>
              <Ionicons name="card-outline" size={20} color="#1E1B4B" />
              <Text style={styles.listItemTitle}>Payout Bank Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* ACCOUNT SECURITY */}
        <Text style={styles.sectionHeader}>ACCOUNT SECURITY</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.listItem} onPress={() => setPasswordModalVisible(true)}>
            <View style={styles.listItemLeft}>
              <Ionicons name="lock-closed-outline" size={20} color="#1E1B4B" />
              <Text style={styles.listItemTitle}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* PREFERENCES */}
        <Text style={styles.sectionHeader}>PREFERENCES</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <Ionicons name="notifications-outline" size={20} color="#1E1B4B" />
              <Text style={styles.listItemTitle}>Notification Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <Ionicons name="globe-outline" size={20} color="#1E1B4B" />
              <Text style={styles.listItemTitle}>Language</Text>
            </View>
            <View style={styles.listItemRight}>
              <Text style={styles.listItemValue}>English</Text>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <Ionicons name="radio-button-on" size={20} color="#1E1B4B" />
              <Text style={styles.listItemTitle}>Available for Consultations</Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={handleToggleAvailability}
              disabled={togglingAvailability || !profile}
              trackColor={{ false: '#E2E8F0', true: '#1E1B4B' }}
              thumbColor={'#fff'}
            />
          </View>
        </View>

        {/* SUPPORT */}
        <Text style={styles.sectionHeader}>SUPPORT</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <Ionicons name="help-circle-outline" size={20} color="#1E1B4B" />
              <Text style={styles.listItemTitle}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <Ionicons name="shield-outline" size={20} color="#1E1B4B" />
              <Text style={styles.listItemTitle}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.listItem} onPress={handleLogout}>
            <View style={styles.listItemLeft}>
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
              <Text style={[styles.listItemTitle, { color: '#DC2626' }]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* DANGER ZONE */}
        <Text style={[styles.sectionHeader, { color: '#DC2626' }]}>DANGER ZONE</Text>
        <View style={[styles.card, { borderColor: '#FEE2E2', borderWidth: 1 }]}>
          <TouchableOpacity style={styles.listItem} onPress={() => setDeleteModalVisible(true)}>
            <View style={styles.listItemLeft}>
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
              <Text style={[styles.listItemTitle, { color: '#DC2626', fontWeight: '700' }]}>
                Delete Account & Profile
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#FCA5A5" />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="warning" size={24} color="#DC2626" />
                <Text style={[styles.modalTitle, { color: '#DC2626' }]}>Delete Account</Text>
              </View>
              <Pressable onPress={() => setDeleteModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </Pressable>
            </View>

            <Text style={{ fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 16 }}>
              Are you sure you want to delete your consultant profile? This will permanently erase your profile, consultations, and account data. This action cannot be reversed.
            </Text>

            <Text style={styles.modalLabel}>Confirm Password</Text>
            <TextInput
              style={styles.modalInput}
              secureTextEntry
              value={deletePassword}
              onChangeText={(text) => {
                setDeletePassword(text);
                setDeleteError(null);
              }}
              placeholder="Enter your current password"
              placeholderTextColor="#94A3B8"
            />

            {deleteError && <Text style={styles.modalError}>{deleteError}</Text>}

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: '#DC2626', marginTop: 20 }, (deleting || !deletePassword) && { opacity: 0.6 }]}
              onPress={handleDeleteAccount}
              disabled={deleting || !deletePassword}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalBtnText}>Permanently Delete Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <Pressable onPress={() => setPasswordModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </Pressable>
            </View>

            <Text style={styles.modalLabel}>Current Password</Text>
            <TextInput
              style={styles.modalInput}
              secureTextEntry
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                setPasswordError(null);
              }}
              placeholder="Enter current password"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.modalLabel}>New Password</Text>
            <TextInput
              style={styles.modalInput}
              secureTextEntry
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setPasswordError(null);
              }}
              placeholder="At least 8 characters"
              placeholderTextColor="#94A3B8"
            />

            {passwordError && <Text style={styles.modalError}>{passwordError}</Text>}

            <TouchableOpacity
              style={[styles.modalBtn, (changingPassword || !currentPassword || !newPassword) && { opacity: 0.6 }]}
              onPress={handleChangePassword}
              disabled={changingPassword || !currentPassword || !newPassword}
            >
              {changingPassword ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalBtnText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0B1C5A' },
  modalLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 6, marginTop: 8 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 8,
  },
  modalError: { color: '#DC2626', fontSize: 13, marginTop: 4 },
  modalBtn: {
    backgroundColor: '#0B1C5A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  modalBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C5A',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 8,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listItemTitle: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listItemValue: {
    fontSize: 14,
    color: '#64748B',
  },
});
