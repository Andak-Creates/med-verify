import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PAST_SESSIONS = [
  {
    id: '1',
    patient: 'Amara Okafor',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80',
    type: 'Full Health',
    typeBg: '#E0E7FF',
    typeColor: '#3730A3',
    date: 'Oct 24, 2023 • 09:10 AM',
    earned: '₦6,750',
    rating: 5,
    duration: '22 min',
  },
  {
    id: '2',
    patient: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80',
    type: 'Drug Inquiry',
    typeBg: '#D1FAE5',
    typeColor: '#065F46',
    date: 'Oct 23, 2023 • 02:45 PM',
    earned: '₦2,250',
    rating: 4,
    duration: '11 min',
  },
  {
    id: '3',
    patient: 'Tunde Afolayan',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    type: 'Drug Inquiry',
    typeBg: '#D1FAE5',
    typeColor: '#065F46',
    date: 'Oct 21, 2023 • 11:00 AM',
    earned: '₦2,250',
    rating: 5,
    duration: '9 min',
  },
  {
    id: '4',
    patient: 'Sarah Williams',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    type: 'Full Health',
    typeBg: '#E0E7FF',
    typeColor: '#3730A3',
    date: 'Oct 20, 2023 • 03:30 PM',
    earned: '₦6,750',
    rating: 5,
    duration: '31 min',
  },
];

export default function ConsultsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [acceptedSessions, setAcceptedSessions] = useState<Record<string, boolean>>({});

  const acceptSession = (id: string) => {
    setAcceptedSessions(prev => ({ ...prev, [id]: true }));
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
          <Text style={styles.headerTitle}>MedVerify</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/(pharmacist)/notifications' as any)}>
          <Ionicons name="notifications-outline" size={24} color="#0B1C5A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Toggle Switch */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={activeTab === 'active' ? styles.toggleActive : styles.toggleInactive}
            onPress={() => setActiveTab('active')}
          >
            <Text style={activeTab === 'active' ? styles.toggleTextActive : styles.toggleTextInactive}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={activeTab === 'past' ? styles.toggleActive : styles.toggleInactive}
            onPress={() => setActiveTab('past')}
          >
            <Text style={activeTab === 'past' ? styles.toggleTextActive : styles.toggleTextInactive}>Past</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'active' ? (
          <>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>3 Today</Text>
              </View>
            </View>

            {/* Sessions List */}
            <View style={styles.sessionsList}>

              {/* Session 1 */}
              <View style={styles.sessionCard}>
                <View style={styles.sessionHeaderRow}>
                  <View style={styles.sessionUserInfo}>
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' }}
                      style={styles.patientImage}
                    />
                    <View>
                      <Text style={styles.patientName}>Adewale Grace</Text>
                      <View style={styles.timeRow}>
                        <Ionicons name="time-outline" size={14} color="#0B1C5A" />
                        <Text style={styles.timeText}>10:30 AM</Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.typeBadge, { backgroundColor: '#D1FAE5' }]}>
                    <Text style={[styles.typeBadgeText, { color: '#065F46' }]}>Drug Inquiry</Text>
                  </View>
                </View>
                <View style={styles.cardDivider} />
                <View style={styles.sessionFooterRow}>
                  <Text style={styles.earningText}>₦1k - ₦5k</Text>
                  {acceptedSessions['1'] ? (
                    <TouchableOpacity style={styles.joinBtn} onPress={() => router.push('/(pharmacist)/consults/consultation-live' as any)}>
                      <Text style={styles.joinBtnText}>Join Session</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity style={styles.declineBtn}>
                        <Text style={styles.declineBtnText}>Decline</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.joinBtn} onPress={() => acceptSession('1')}>
                        <Text style={styles.joinBtnText}>Accept</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              {/* Session 2 */}
              <View style={styles.sessionCard}>
                <View style={styles.sessionHeaderRow}>
                  <View style={styles.sessionUserInfo}>
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' }}
                      style={styles.patientImage}
                    />
                    <View>
                      <Text style={styles.patientName}>Chidi Azubuike</Text>
                      <View style={styles.timeRow}>
                        <Ionicons name="time-outline" size={14} color="#0B1C5A" />
                        <Text style={styles.timeText}>02:15 PM</Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.typeBadge, { backgroundColor: '#A7F3D0' }]}>
                    <Text style={[styles.typeBadgeText, { color: '#064E3B' }]}>Full Health</Text>
                  </View>
                </View>
                <View style={styles.cardDivider} />
                <View style={styles.sessionFooterRow}>
                  <Text style={styles.earningText}>₦3k - ₦10k</Text>
                  {acceptedSessions['2'] ? (
                    <TouchableOpacity style={styles.joinBtn} onPress={() => router.push('/(pharmacist)/consults/consultation-live' as any)}>
                      <Text style={styles.joinBtnText}>Join Session</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity style={styles.declineBtn}>
                        <Text style={styles.declineBtnText}>Decline</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.joinBtn} onPress={() => acceptSession('2')}>
                        <Text style={styles.joinBtnText}>Accept</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

            </View>
          </>
        ) : (
          <>
            {/* Past Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Completed Sessions</Text>
              <View style={[styles.countBadge, { backgroundColor: '#F3E8FF' }]}>
                <Text style={[styles.countBadgeText, { color: '#6B21A8' }]}>4 This Month</Text>
              </View>
            </View>

            {/* Past Sessions */}
            <View style={styles.sessionsList}>
              {PAST_SESSIONS.map((session) => (
                <TouchableOpacity 
                  key={session.id} 
                  style={styles.sessionCard}
                  onPress={() => router.push('/(pharmacist)/consults/consultation-live?isPast=true' as any)}
                >
                  <View style={styles.sessionHeaderRow}>
                    <View style={styles.sessionUserInfo}>
                      <Image source={{ uri: session.avatar }} style={styles.patientImage} />
                      <View>
                        <Text style={styles.patientName}>{session.patient}</Text>
                        <Text style={styles.pastDateText}>{session.date}</Text>
                      </View>
                    </View>
                    <View style={[styles.typeBadge, { backgroundColor: session.typeBg }]}>
                      <Text style={[styles.typeBadgeText, { color: session.typeColor }]}>{session.type}</Text>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.pastFooterRow}>
                    {/* Duration */}
                    <View style={styles.pastMeta}>
                      <Ionicons name="time-outline" size={14} color="#64748B" />
                      <Text style={styles.pastMetaText}>{session.duration}</Text>
                    </View>
                    {/* Rating */}
                    <View style={styles.pastMeta}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Ionicons
                          key={i}
                          name={i < session.rating ? 'star' : 'star-outline'}
                          size={14}
                          color="#F59E0B"
                        />
                      ))}
                    </View>
                    {/* Earned */}
                    <Text style={styles.pastEarned}>{session.earned}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#E2E8F0' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0B1C5A' },
  notificationBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleActive: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  toggleInactive: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  toggleTextActive: { fontSize: 14, fontWeight: '700', color: '#0B1C5A' },
  toggleTextInactive: { fontSize: 14, fontWeight: '600', color: '#475569' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  countBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  countBadgeText: { fontSize: 12, fontWeight: '700', color: '#0369A1' },
  sessionsList: { gap: 16 },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionUserInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  patientImage: { width: 48, height: 48, borderRadius: 24 },
  patientName: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 13, color: '#0B1C5A', fontWeight: '500' },
  pastDateText: { fontSize: 12, color: '#64748B' },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  typeBadgeText: { fontSize: 11, fontWeight: '600' },
  cardDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  sessionFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningText: { fontSize: 14, fontWeight: '800', color: '#065F46' },
  joinBtn: {
    backgroundColor: '#1E1B4B',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  joinBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  declineBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  declineBtnText: { color: '#475569', fontSize: 14, fontWeight: '600' },
  pastFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pastMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pastMetaText: { fontSize: 13, color: '#64748B' },
  pastEarned: { fontSize: 14, fontWeight: '800', color: '#065F46' },
});
