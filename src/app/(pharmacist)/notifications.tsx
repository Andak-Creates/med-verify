import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Bookings', 'Earnings', 'System'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerLogo}>MedVerify</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={24} color="#0B1C5A" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Image 
              source={{ uri: user?.profileImage || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80' }} 
              style={styles.headerAvatar} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.pageTitle}>Notifications</Text>
        <Text style={styles.pageSubtitle}>Stay updated on your consultations and earnings.</Text>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContainer}>
          {filters.map((f) => (
            <TouchableOpacity 
              key={f} 
              style={[styles.filterPill, activeFilter === f && styles.filterPillActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Notifications List */}
        
        {/* New Consultation Request */}
        <View style={styles.notifCard}>
          <View style={styles.notifHeader}>
            <View style={styles.notifHeaderLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#CCFBF1' }]}>
                <Ionicons name="medkit-outline" size={20} color="#0F766E" />
              </View>
              <Text style={styles.notifTitle}>New Consultation Request</Text>
            </View>
            <Text style={styles.timeText}>4m ago</Text>
          </View>
          <Text style={styles.notifDesc}>
            <Text style={{ color: '#94A3B8' }}>Patient </Text>
            <Text style={{ color: '#1E293B', fontWeight: '600' }}>John Doe</Text>
            <Text style={{ color: '#94A3B8' }}> requested a drug-specific inquiry.</Text>
          </Text>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>View Details</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Received */}
        <View style={styles.notifCard}>
          <View style={styles.notifHeader}>
            <View style={styles.notifHeaderLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="wallet-outline" size={20} color="#475569" />
              </View>
              <Text style={styles.notifTitle}>Payment Received</Text>
            </View>
            <Text style={styles.timeText}>2h ago</Text>
          </View>
          <Text style={styles.notifDesc}>
            Payout of <Text style={{ color: '#0B1C5A', fontWeight: '700' }}>₦8,500</Text> for consultation #MV-9920 has been processed to your wallet.
          </Text>
        </View>

        {/* Consultation Reminder */}
        <View style={styles.notifCard}>
          <View style={styles.notifHeader}>
            <View style={styles.notifHeaderLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#FFEDD5' }]}>
                <Ionicons name="alarm-outline" size={20} color="#C2410C" />
              </View>
              <Text style={styles.notifTitle}>Consultation Reminder</Text>
            </View>
            <Text style={styles.timeText}>Earlier</Text>
          </View>
          <Text style={styles.notifDesc}>
            Upcoming session with <Text style={{ color: '#1E293B', fontWeight: '600' }}>Sarah Jenkins</Text> in 30 minutes.
          </Text>
          <TouchableOpacity style={styles.outlineBtn}>
            <Text style={styles.outlineBtnText}>Prepare</Text>
          </TouchableOpacity>
        </View>

        {/* Verification Approved */}
        <View style={styles.notifCard}>
          <View style={styles.notifHeader}>
            <View style={styles.notifHeaderLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="checkmark-seal-outline" size={20} color="#475569" />
              </View>
              <Text style={styles.notifTitle}>Verification Approved</Text>
            </View>
            <Text style={styles.timeText}>Yesterday</Text>
          </View>
          <Text style={styles.notifDesc}>
            Your updated license document has been verified.
          </Text>
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
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C5A',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 4,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  filterScroll: {
    marginBottom: 20,
  },
  filterContainer: {
    gap: 10,
    paddingRight: 20,
  },
  filterPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterPillActive: {
    backgroundColor: '#0B1C5A',
  },
  filterText: {
    color: '#1E1B4B',
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  notifCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notifHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  timeText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  notifDesc: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  actionBtn: {
    backgroundColor: '#0B1C5A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  outlineBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0B1C5A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  outlineBtnText: {
    color: '#0B1C5A',
    fontSize: 13,
    fontWeight: '700',
  },
});
