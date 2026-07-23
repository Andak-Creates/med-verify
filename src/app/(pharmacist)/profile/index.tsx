import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePharmacistProfile } from '@/hooks/usePharmacistProfile';
import * as pharmacistsService from '@/services/pharmacists.service';
import type { PublicPharmacist, WorkingHoursEntry } from '@/types/api';

function formatTime(h: number, m: number): string {
  const period = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, '0')} ${period}`;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, isLoading, error, reload } = usePharmacistProfile();
  const [publicStats, setPublicStats] = useState<PublicPharmacist | null>(null);
  const [showPcnModal, setShowPcnModal] = useState(false);

  useEffect(() => {
    if (!profile?.profileId) return;
    pharmacistsService
      .getPharmacist(profile.profileId)
      .then(setPublicStats)
      .catch(() => setPublicStats(null));
  }, [profile?.profileId]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0B1C5A" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
          <Ionicons name="alert-circle-outline" size={36} color="#9CA3AF" />
          <Text style={{ marginTop: 12, color: '#6B7280', textAlign: 'center' }}>
            {error ?? 'Could not load your profile.'}
          </Text>
          <TouchableOpacity onPress={reload} style={{ marginTop: 12 }}>
            <Text style={{ color: '#0B1C5A', fontWeight: '700' }}>Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const enabledHours = (profile.workingHours ?? []).filter((e) => e.enabled);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {profile.profileImage ? (
            <Image source={{ uri: profile.profileImage }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, { backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="person-outline" size={16} color="#0B1C5A" />
            </View>
          )}
          <Text style={styles.headerTitle}>{(profile.fullName ?? profile.username ?? 'Profile').split(' ')[0]}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(pharmacist)/notifications' as any)}>
          <Ionicons name="notifications-outline" size={24} color="#0B1C5A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Hero */}
        <View style={styles.heroSection}>
          <View style={styles.avatarContainer}>
            {profile.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.largeAvatar} />
            ) : (
              <View style={[styles.largeAvatar, { backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="person-outline" size={44} color="#0B1C5A" />
              </View>
            )}
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#0B1C5A" style={{ backgroundColor: '#fff', borderRadius: 12 }} />
            </View>
          </View>

          <Text style={styles.doctorName}>{profile.fullName ?? profile.username}</Text>
          <Text style={styles.doctorTitle}>{profile.specialty ?? 'Pharmacist'}</Text>

          <View style={styles.verifiedTag}>
            <Ionicons name="checkmark-circle" size={14} color="#0B1C5A" />
            <Text style={styles.verifiedTagText}>
              {profile.status === 'APPROVED' ? 'Verified Professional' : profile.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{publicStats?.totalConsultations ?? '—'}</Text>
            <Text style={styles.statLabel}>Consults</Text>
          </View>
          <View style={styles.statBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Text style={styles.statValue}>
                {publicStats && publicStats.avgRating > 0 ? publicStats.avgRating.toFixed(1) : '—'}
              </Text>
              <Ionicons name="star" size={14} color="#F59E0B" />
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{publicStats?.reviewCount ?? '—'}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Specialty</Text>
          <Text style={styles.cardText}>{profile.specialty ?? 'Not set — add one in Edit Profile'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.cardText}>
            {profile.bio ?? 'No bio yet. Tell patients about your experience in Edit Profile.'}
          </Text>
        </View>

        {(profile.pharmacyName || profile.pharmacyAddress) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pharmacy</Text>
            <View style={styles.rowItem}>
              <Ionicons name="storefront-outline" size={22} color="#1E293B" style={styles.rowIcon} />
              <View>
                <Text style={styles.rowTitle}>{profile.pharmacyName ?? 'Pharmacy'}</Text>
                {profile.pharmacyAddress && <Text style={styles.rowSub}>{profile.pharmacyAddress}</Text>}
              </View>
            </View>
          </View>
        )}

        {/* Professional Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Professional Details</Text>
          <View style={styles.divider} />

          {/* PCN Licence — tappable */}
          <TouchableOpacity style={[styles.rowItem, styles.tappableRow]} onPress={() => setShowPcnModal(true)} activeOpacity={0.7}>
            <View style={styles.rowIconWrap}>
              <Ionicons name="id-card-outline" size={20} color="#0B1C5A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>PCN Licence</Text>
              <Text style={styles.rowSub}>{profile.pcn ? `••••${profile.pcn.slice(-4)}` : 'Not provided'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Business Hours */}
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <View style={styles.rowIconWrap}>
                <Ionicons name="time-outline" size={20} color="#0B1C5A" />
              </View>
              <Text style={styles.rowTitle}>Business Hours</Text>
            </View>
            {enabledHours.length === 0 ? (
              <Text style={[styles.rowSub, { paddingLeft: 48 }]}>Not configured</Text>
            ) : (
              <View style={styles.hoursGrid}>
                {enabledHours.map((entry) => (
                  <View key={entry.day} style={styles.hoursRow}>
                    <View style={styles.hoursDayBadge}>
                      <Text style={styles.hoursDay}>{entry.day.slice(0, 3).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.hoursTime}>
                      {formatTime(entry.startH, entry.startM)} – {formatTime(entry.endH, entry.endM)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.editBtn]} 
            onPress={() => router.push('/(pharmacist)/profile/edit-profile' as any)}
          >
            <Ionicons name="pencil" size={18} color="#fff" />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBtn, styles.shareBtn]}
            onPress={() => router.push('/(pharmacist)/profile/settings' as any)}
          >
            <Ionicons name="settings-outline" size={18} color="#0B1C5A" />
            <Text style={styles.shareBtnText}>Settings</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* PCN Licence Modal */}
      <Modal visible={showPcnModal} transparent animationType="slide" onRequestClose={() => setShowPcnModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowPcnModal(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>PCN Licence Details</Text>

            {/* Licence Number */}
            <View style={styles.licenceCard}>
              <View style={styles.licenceIconWrap}>
                <Ionicons name="id-card" size={28} color="#0B1C5A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.licenceLabel}>Licence Number</Text>
                <Text style={styles.licenceValue}>{profile.pcn ?? 'Not provided'}</Text>
              </View>
            </View>

            {/* Certificate Image */}
            {profile.certificateImage ? (
              <View style={{ marginTop: 16 }}>
                <Text style={styles.licenceLabel}>Uploaded Certificate</Text>
                <Image
                  source={{ uri: profile.certificateImage }}
                  style={styles.certificateImg}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <View style={styles.noCertBox}>
                <Ionicons name="document-outline" size={28} color="#94A3B8" />
                <Text style={{ marginTop: 8, color: '#64748B', textAlign: 'center' }}>No certificate uploaded</Text>
              </View>
            )}

            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowPcnModal(false)}>
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C5A',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  largeAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0B1C5A',
    marginBottom: 4,
  },
  doctorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  verifiedTagText: {
    color: '#0B1C5A',
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C5A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  card: {
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
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B1C5A',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tappableRow: {
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  rowIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 3,
  },
  rowSub: {
    fontSize: 13,
    color: '#64748B',
  },
  rowValue: {
    fontSize: 13,
    color: '#475569',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  hoursGrid: {
    marginTop: 12,
    gap: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#0B1C5A',
  },
  hoursDayBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  hoursDay: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0B1C5A',
    letterSpacing: 0.5,
  },
  hoursTime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  editBtn: {
    backgroundColor: '#0B1C5A',
  },
  editBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  shareBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0B1C5A',
  },
  shareBtnText: {
    color: '#0B1C5A',
    fontSize: 14,
    fontWeight: '700',
  },
  // PCN Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C5A',
    marginBottom: 20,
  },
  licenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  licenceIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  licenceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  licenceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C5A',
    letterSpacing: 1,
  },
  certificateImg: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: '#F1F5F9',
  },
  noCertBox: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginTop: 16,
  },
  modalCloseBtn: {
    backgroundColor: '#0B1C5A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  modalCloseBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
