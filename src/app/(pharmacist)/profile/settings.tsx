import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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
  const { logout } = useAuth();
  const { profile, update: updateProfile } = usePharmacistProfile();
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    router.replace('/(onboarding)/role-select' as any);
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
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
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
        
        {/* CONSULTATION FEES */}
        <Text style={styles.sectionHeader}>CONSULTATION FEES</Text>
        <View style={styles.card}>
          
          <View style={styles.feeItem}>
            <View>
              <Text style={styles.feeTitle}>Drug-Specific Inquiry</Text>
              <Text style={styles.feeAmount}>
                {profile ? `₦${profile.feeDrugInquiry.toLocaleString()}` : '—'}
              </Text>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/(pharmacist)/profile/fee-settings' as any)}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.feeItem}>
            <View>
              <Text style={styles.feeTitle}>Full Health Consultation</Text>
              <Text style={styles.feeAmount}>
                {profile ? `₦${profile.feeFullConsultation.toLocaleString()}` : '—'}
              </Text>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/(pharmacist)/profile/fee-settings' as any)}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pricingInfoBox}>
            <View style={styles.pricingAccentBar} />
            <Text style={styles.pricingInfoText}>
              Prices must be within the ₦1,000 - ₦10,000 range. A 10% platform fee applies to all earnings.
            </Text>
          </View>

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
              <Ionicons name="calendar-outline" size={20} color="#1E1B4B" />
              <Text style={styles.listItemTitle}>Available for Bookings</Text>
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

      </ScrollView>

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
  feeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  feeAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B1C5A',
  },
  editBtn: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editBtnText: {
    color: '#1E1B4B',
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  pricingInfoBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  pricingAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#1E1B4B',
  },
  pricingInfoText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginLeft: 4,
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
