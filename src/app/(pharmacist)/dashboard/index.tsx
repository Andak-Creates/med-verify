import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const [acceptedInquiries, setAcceptedInquiries] = useState<Record<string, boolean>>({});
  const [isOnline, setIsOnline] = useState(true);

  const acceptInquiry = (id: string) => {
    setAcceptedInquiries(prev => ({ ...prev, [id]: true }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.push('/(pharmacist)/profile' as any)}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80' }} 
              style={styles.avatar} 
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>MedVerify Pro</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isOnline ? '#10B981' : '#9CA3AF' }} />
              <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600' }}>{isOnline ? 'Online' : 'Offline'}</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Switch 
            value={isOnline} 
            onValueChange={setIsOnline} 
            trackColor={{ false: '#D1D5DB', true: '#10B981' }}
            thumbColor={'#ffffff'}
          />
          <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/(pharmacist)/notifications' as any)}>
            <Ionicons name="notifications-outline" size={24} color="#0B1C5A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!isOnline && (
          <View style={{ backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="information-circle" size={20} color="#EF4444" />
            <Text style={{ color: '#B91C1C', fontSize: 13, flex: 1, fontWeight: '500' }}>You are currently offline. You will not receive any new consultation requests.</Text>
          </View>
        )}
        
        {/* Top Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Consultations</Text>
            <Text style={styles.statValue}>452</Text>
            <View style={styles.statTrendRow}>
              <Ionicons name="trending-up" size={12} color="#10B981" />
              <Text style={styles.statTrend}>+18% this month</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Gross Earnings</Text>
            <Text style={styles.statValue}>₦14,250</Text>
            <View style={styles.statTrendRow}>
              <Ionicons name="cash-outline" size={12} color="#4B5563" />
              <Text style={styles.statNeutral}>Lifetime volume</Text>
            </View>
          </View>
        </View>

        {/* Wallet Balance Card */}
        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>Current Wallet Balance</Text>
          <Text style={styles.walletBalance}>₦2,332,956.27</Text>
          
          <View style={styles.walletDivider} />
          
          <View style={styles.walletFooter}>
            <View style={styles.walletDisclaimer}>
              <Ionicons name="information-circle-outline" size={14} color="#fff" style={{ opacity: 0.8 }} />
              <Text style={styles.walletDisclaimerText}>10% Platform Fee deducted{'\n'}automatically from earnings.</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.viewBreakdownText}>View Breakdown</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Requests Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Consultation{'\n'}Requests</Text>
          <View style={styles.filtersRow}>
            <View style={[styles.filterPill, styles.filterPillActive]}>
              <Text style={[styles.filterPillText, styles.filterPillTextActive]}>5 Urgent</Text>
            </View>
            <View style={styles.filterPill}>
              <Text style={styles.filterPillText}>12 Total Pending</Text>
            </View>
          </View>
        </View>

        {/* Inquiries List */}
        <View style={styles.inquiriesList}>
          
          {/* Inquiry 1 */}
          <View style={styles.inquiryCard}>
            <View style={styles.inquiryHeader}>
              <View style={styles.inquiryUserRow}>
                <View style={styles.patientAvatar}>
                  <Ionicons name="person-outline" size={16} color="#0B1C5A" />
                </View>
                <View>
                  <Text style={styles.patientName}>Sarah J.</Text>
                  <Text style={styles.patientMeta}>2 minutes ago • Patient Inquiry</Text>
                </View>
              </View>
              <View style={styles.urgencyBadgeRed}>
                <Text style={styles.urgencyTextRed}>HIGH URGENCY</Text>
              </View>
            </View>
            
            <View style={styles.inquiryMessage}>
              <Text style={styles.messageText}>
                "Can I take this medication with grapefruit juice? The label is unclear and I'm worried about interactions."
              </Text>
            </View>

            <View style={styles.inquiryFooter}>
              <View style={styles.earningRow}>
                <Ionicons name="cash-outline" size={16} color="#15803D" />
                <Text style={styles.earningText}>₦3,500 Est.</Text>
              </View>
              {acceptedInquiries['1'] ? (
                <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/(pharmacist)/consults/consultation-live' as any)}>
                  <Text style={styles.startBtnText}>Join Session</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={styles.declineBtn}>
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.startBtn} onPress={() => acceptInquiry('1')}>
                    <Text style={styles.startBtnText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Inquiry 2 */}
          <View style={styles.inquiryCard}>
            <View style={styles.inquiryHeader}>
              <View style={styles.inquiryUserRow}>
                <View style={[styles.patientAvatar, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="person-outline" size={16} color="#0369A1" />
                </View>
                <View>
                  <Text style={styles.patientName}>Marcus T.</Text>
                  <Text style={styles.patientMeta}>15 minutes ago • Medication Clarification</Text>
                </View>
              </View>
              <View style={styles.urgencyBadgeGray}>
                <Text style={styles.urgencyTextGray}>NORMAL</Text>
              </View>
            </View>
            
            <View style={styles.inquiryMessage}>
              <Text style={styles.messageText}>
                "Is the Lisinopril I just received the same as my previous generic brand? The pill color is slightly different."
              </Text>
            </View>

            <View style={styles.inquiryFooter}>
              <View style={styles.earningRow}>
                <Ionicons name="cash-outline" size={16} color="#15803D" />
                <Text style={styles.earningText}>₦3,500 Est.</Text>
              </View>
              {acceptedInquiries['2'] ? (
                <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/(pharmacist)/consults/consultation-live' as any)}>
                  <Text style={styles.startBtnText}>Join Session</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={styles.declineBtn}>
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.startBtn} onPress={() => acceptInquiry('2')}>
                    <Text style={styles.startBtnText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Inquiry 3 */}
          <View style={styles.inquiryCard}>
            <View style={styles.inquiryHeader}>
              <View style={styles.inquiryUserRow}>
                <View style={[styles.patientAvatar, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="person-outline" size={16} color="#0369A1" />
                </View>
                <View>
                  <Text style={styles.patientName}>Elena R.</Text>
                  <Text style={styles.patientMeta}>1 hour ago • Side Effects Support</Text>
                </View>
              </View>
              <View style={styles.urgencyBadgeGray}>
                <Text style={styles.urgencyTextGray}>NORMAL</Text>
              </View>
            </View>
            
            <View style={styles.inquiryMessage}>
              <Text style={styles.messageText}>
                "Confirming common side effects of the new booster shot. I have some mild fatigue and want to know if that's expected."
              </Text>
            </View>

            <View style={styles.inquiryFooter}>
              <View style={styles.earningRow}>
                <Ionicons name="cash-outline" size={16} color="#15803D" />
                <Text style={styles.earningText}>₦6,500 Est.</Text>
              </View>
              {acceptedInquiries['3'] ? (
                <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/(pharmacist)/consults/consultation-live' as any)}>
                  <Text style={styles.startBtnText}>Join Session</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={styles.declineBtn}>
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.startBtn} onPress={() => acceptInquiry('3')}>
                    <Text style={styles.startBtnText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* View More */}
          <TouchableOpacity style={styles.viewMoreBtn}>
            <Text style={styles.viewMoreText}>View 8 More Pending Inquiries</Text>
            <Ionicons name="arrow-forward" size={18} color="#0B1C5A" />
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
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0B1C5A',
    marginBottom: 12,
  },
  statTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statTrend: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  statNeutral: {
    fontSize: 11,
    fontWeight: '500',
    color: '#4B5563',
  },
  walletCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  walletLabel: {
    fontSize: 13,
    color: '#A5B4FC',
    fontWeight: '600',
    marginBottom: 8,
  },
  walletBalance: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  walletDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 20,
  },
  walletFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletDisclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
  },
  walletDisclaimerText: {
    fontSize: 10,
    color: '#E0E7FF',
    lineHeight: 14,
    opacity: 0.9,
  },
  viewBreakdownText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    lineHeight: 28,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#E0E7FF',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#312E81',
  },
  inquiriesList: {
    gap: 16,
  },
  inquiryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  inquiryUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  patientAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  patientMeta: {
    fontSize: 11,
    color: '#64748B',
  },
  urgencyBadgeRed: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  urgencyTextRed: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B91C1C',
  },
  urgencyBadgeGray: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  urgencyTextGray: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  inquiryMessage: {
    borderLeftWidth: 2,
    borderLeftColor: '#E2E8F0',
    paddingLeft: 12,
    marginLeft: 18,
    marginBottom: 16,
  },
  messageText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  inquiryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  earningText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  startBtn: {
    backgroundColor: '#1E1B4B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  declineBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  declineBtnText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  viewMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B1C5A',
  },
});
