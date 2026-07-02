import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApiErrorMessage } from '@/api/client';
import { usePharmacistConsultations, usePharmacistDashboard } from '@/hooks/usePharmacistConsultations';
import { usePharmacistProfile } from '@/hooks/usePharmacistProfile';
import type { PendingRequest } from '@/types/api';

function formatRelativeTime(isoDate: string): string {
  const diffMins = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { profile, update: updateProfile } = usePharmacistProfile();
  const dashboard = usePharmacistDashboard();
  const past = usePharmacistConsultations('past');
  const pendingActions = usePharmacistConsultations();
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [acceptedIds, setAcceptedIds] = useState<Record<string, boolean>>({});

  // Availability maps to the profile's vacation mode (the only backend switch
  // that removes a pharmacist from the public "available" listing).
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

  const { completedCount, grossEarnings } = useMemo(() => {
    const completed = past.items.filter((c) => c.status === 'COMPLETED');
    return {
      completedCount: completed.length,
      grossEarnings: completed.reduce((sum, c) => sum + (c.feeAmount ?? 0), 0),
    };
  }, [past.items]);

  // Wallet balance = lifetime gross minus the 10% platform fee.
  const walletBalance = grossEarnings * 0.9;

  const handleAccept = async (request: PendingRequest) => {
    try {
      await pendingActions.accept(request.id);
      setAcceptedIds((prev) => ({ ...prev, [request.id]: true }));
      dashboard.refresh();
    } catch (err) {
      Alert.alert('Could not accept', getApiErrorMessage(err, 'This request may no longer be pending.'));
      dashboard.refresh();
    }
  };

  const handleDecline = async (request: PendingRequest) => {
    try {
      await pendingActions.decline(request.id);
      dashboard.refresh();
    } catch (err) {
      Alert.alert('Could not decline', getApiErrorMessage(err, 'This request may no longer be pending.'));
      dashboard.refresh();
    }
  };

  const refreshAll = () => {
    dashboard.refresh();
    past.refresh();
  };

  const stats = dashboard.stats;
  const visibleRequests = (stats?.recentRequests ?? []).slice(0, 3);
  const remainingCount = Math.max((stats?.totalPending ?? 0) - visibleRequests.length, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.push('/(pharmacist)/profile' as any)}>
            {profile?.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="person-outline" size={20} color="#0B1C5A" />
              </View>
            )}
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>MedVerify Pro</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isAvailable ? '#10B981' : '#9CA3AF' }} />
              <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600' }}>
                {isAvailable ? 'Available' : 'On Vacation'}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Switch
            value={isAvailable}
            onValueChange={handleToggleAvailability}
            disabled={togglingAvailability || !profile}
            trackColor={{ false: '#D1D5DB', true: '#10B981' }}
            thumbColor={'#ffffff'}
          />
          <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/(pharmacist)/notifications' as any)}>
            <Ionicons name="notifications-outline" size={24} color="#0B1C5A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={dashboard.isRefreshing || past.isRefreshing}
            onRefresh={refreshAll}
            tintColor="#0B1C5A"
          />
        }
      >
        {!isAvailable && (
          <View style={{ backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="information-circle" size={20} color="#EF4444" />
            <Text style={{ color: '#B91C1C', fontSize: 13, flex: 1, fontWeight: '500' }}>
              You are on vacation mode. You will not appear in searches or receive new consultation requests.
            </Text>
          </View>
        )}

        {/* Top Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Completed Consultations</Text>
            <Text style={styles.statValue}>{past.isLoading ? '—' : completedCount}</Text>
            <View style={styles.statTrendRow}>
              <Ionicons name="checkmark-done-outline" size={12} color="#10B981" />
              <Text style={styles.statTrend}>Lifetime sessions</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Gross Earnings</Text>
            <Text style={styles.statValue}>
              {past.isLoading ? '—' : `₦${grossEarnings.toLocaleString()}`}
            </Text>
            <View style={styles.statTrendRow}>
              <Ionicons name="cash-outline" size={12} color="#4B5563" />
              <Text style={styles.statNeutral}>Lifetime volume</Text>
            </View>
          </View>
        </View>

        {/* Wallet Balance Card */}
        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>Current Wallet Balance</Text>
          <Text style={styles.walletBalance}>
            {past.isLoading
              ? '—'
              : `₦${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </Text>

          <View style={styles.walletDivider} />

          <View style={styles.walletFooter}>
            <View style={styles.walletDisclaimer}>
              <Ionicons name="information-circle-outline" size={14} color="#fff" style={{ opacity: 0.8 }} />
              <Text style={styles.walletDisclaimerText}>10% Platform Fee deducted{'\n'}automatically from earnings.</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(pharmacist)/wallet' as any)}>
              <Text style={styles.viewBreakdownText}>View Breakdown</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Requests Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Consultation{'\n'}Requests</Text>
          <View style={styles.filtersRow}>
            <View style={[styles.filterPill, styles.filterPillActive]}>
              <Text style={[styles.filterPillText, styles.filterPillTextActive]}>
                {stats?.urgentPending ?? 0} Urgent
              </Text>
            </View>
            <View style={styles.filterPill}>
              <Text style={styles.filterPillText}>{stats?.totalPending ?? 0} Total Pending</Text>
            </View>
          </View>
        </View>

        {/* Inquiries List */}
        {dashboard.isLoading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0B1C5A" />
          </View>
        ) : dashboard.error ? (
          <View style={{ paddingVertical: 30, alignItems: 'center', paddingHorizontal: 20 }}>
            <Ionicons name="alert-circle-outline" size={32} color="#9CA3AF" />
            <Text style={{ marginTop: 10, color: '#6B7280', textAlign: 'center' }}>{dashboard.error}</Text>
            <TouchableOpacity onPress={refreshAll} style={{ marginTop: 12 }}>
              <Text style={{ color: '#0B1C5A', fontWeight: '700' }}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : visibleRequests.length === 0 ? (
          <View style={{ paddingVertical: 30, alignItems: 'center', paddingHorizontal: 20 }}>
            <Ionicons name="checkmark-done-circle-outline" size={32} color="#9CA3AF" />
            <Text style={{ marginTop: 10, color: '#6B7280', textAlign: 'center' }}>
              No pending requests right now. New bookings will appear here in real time.
            </Text>
          </View>
        ) : (
          <View style={styles.inquiriesList}>
            {visibleRequests.map((request) => {
              const accepted = acceptedIds[request.id];
              const acting = pendingActions.actingId === request.id;
              return (
                <View key={request.id} style={styles.inquiryCard}>
                  <View style={styles.inquiryHeader}>
                    <View style={styles.inquiryUserRow}>
                      {request.patient.profileImage ? (
                        <Image source={{ uri: request.patient.profileImage }} style={styles.patientAvatar} />
                      ) : (
                        <View style={styles.patientAvatar}>
                          <Ionicons name="person-outline" size={16} color="#0B1C5A" />
                        </View>
                      )}
                      <View>
                        <Text style={styles.patientName}>{request.patient.fullName ?? 'Patient'}</Text>
                        <Text style={styles.patientMeta}>
                          {formatRelativeTime(request.createdAt)} • {request.referenceCode}
                        </Text>
                      </View>
                    </View>
                    {request.urgency === 'high' ? (
                      <View style={styles.urgencyBadgeRed}>
                        <Text style={styles.urgencyTextRed}>HIGH URGENCY</Text>
                      </View>
                    ) : (
                      <View style={styles.urgencyBadgeGray}>
                        <Text style={styles.urgencyTextGray}>NORMAL</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.inquiryMessage}>
                    <Text style={styles.messageText}>"{request.reason}"</Text>
                  </View>

                  <View style={styles.inquiryFooter}>
                    <View style={styles.earningRow}>
                      <Ionicons name="cash-outline" size={16} color="#15803D" />
                      <Text style={styles.earningText}>₦{request.feeAmount.toLocaleString()}</Text>
                    </View>
                    {accepted ? (
                      <TouchableOpacity
                        style={styles.startBtn}
                        onPress={() =>
                          router.push({
                            pathname: '/(pharmacist)/consults/consultation-live',
                            params: { id: request.id },
                          } as any)
                        }
                      >
                        <Text style={styles.startBtnText}>Join Session</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                          style={styles.declineBtn}
                          disabled={acting}
                          onPress={() => handleDecline(request)}
                        >
                          <Text style={styles.declineBtnText}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.startBtn}
                          disabled={acting}
                          onPress={() => handleAccept(request)}
                        >
                          {acting ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Text style={styles.startBtnText}>Accept</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}

            {remainingCount > 0 && (
              <TouchableOpacity style={styles.viewMoreBtn} onPress={() => router.push('/(pharmacist)/consults' as any)}>
                <Text style={styles.viewMoreText}>
                  View {remainingCount} More Pending {remainingCount === 1 ? 'Inquiry' : 'Inquiries'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#0B1C5A" />
              </TouchableOpacity>
            )}
          </View>
        )}
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
