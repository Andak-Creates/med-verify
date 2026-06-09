import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(onboarding)/role-select' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color="#0B1C5A" />
          </TouchableOpacity>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80' }} 
            style={styles.avatar} 
          />
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
              <Text style={styles.feeAmount}>₦3,000</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/(pharmacist)/profile/fee-settings' as any)}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.feeItem}>
            <View>
              <Text style={styles.feeTitle}>Full Health Consultation</Text>
              <Text style={styles.feeAmount}>₦8,000</Text>
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
          <TouchableOpacity style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <Ionicons name="lock-closed-outline" size={20} color="#1E1B4B" />
              <Text style={styles.listItemTitle}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#1E1B4B" />
              <Text style={styles.listItemTitle}>Two-Factor Authentication</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <Ionicons name="link-outline" size={20} color="#1E1B4B" />
              <Text style={styles.listItemTitle}>Linked Accounts</Text>
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
              <Text style={styles.listItemTitle}>Availability Toggle</Text>
            </View>
            <Switch 
              value={true} 
              onValueChange={() => {}} 
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
