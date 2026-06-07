import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountScreen() {
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>MedVerify</Text>
          <Pressable style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={21} color="#312E81" />
          </Pressable>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80' }} 
              style={styles.avatarImg} 
            />
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={12} color="#fff" />
            </View>
          </View>
          <Text style={styles.userName}>Alexander Henderson</Text>
          <Text style={styles.userEmail}>alex.henderson@medical.com</Text>
          
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Medical Profile Section */}
        <Text style={styles.sectionTitle}>Medical Profile</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="water-outline" size={20} color="#312E81" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Blood Group</Text>
              <Text style={styles.menuSub}>O Positive (O+)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="warning-outline" size={20} color="#312E81" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Allergies</Text>
              <Text style={styles.menuSub}>Penicillin, Peanuts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#312E81" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Chronic Conditions</Text>
              <Text style={styles.menuSub}>None reported</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Security & Preferences */}
        <Text style={styles.sectionTitle}>Security & Preferences</Text>
        <View style={styles.cardGroup}>
          <View style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="finger-print-outline" size={20} color="#312E81" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Biometric Login</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: '#D1D5DB', true: '#312E81' }}
              thumbColor={'#fff'}
            />
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="lock-closed-outline" size={20} color="#312E81" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="notifications-outline" size={20} color="#312E81" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Notification Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Support */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="help-circle-outline" size={20} color="#312E81" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="shield-outline" size={20} color="#312E81" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="document-text-outline" size={20} color="#312E81" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingBottom: 120 },

  /* Header */
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingTop: 12, paddingBottom: 10 },
  logoText: { fontSize: 22, fontWeight: '800', color: '#312E81', letterSpacing: -0.3 },
  iconButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },

  /* Profile Card */
  profileCard: { backgroundColor: '#fff', marginHorizontal: 22, borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3, marginBottom: 24, marginTop: 10 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatarImg: { width: 90, height: 90, borderRadius: 45, borderWidth: 4, borderColor: '#E0F2FE' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: '#312E81', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  userName: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  editBtn: { backgroundColor: '#312E81', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12, width: '100%', alignItems: 'center' },
  editBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  /* Section Styles */
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#4B5563', paddingHorizontal: 22, marginBottom: 10, marginTop: 10 },
  cardGroup: { backgroundColor: '#fff', marginHorizontal: 22, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: 24, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  menuIconWrap: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  menuContent: { flex: 1, paddingRight: 16 },
  menuTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  menuSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 20 },

  /* Sign Out Button */
  signOutBtn: { backgroundColor: '#fff', marginHorizontal: 22, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: 20 },
  signOutText: { fontSize: 16, fontWeight: '700', color: '#DC2626' },
});
