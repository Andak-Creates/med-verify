import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

function formatNotifTime(isoDate: string): string {
  const diffMins = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(isoDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { notifications, markAllRead } = useSocket();

  useEffect(() => {
    markAllRead();
  }, [markAllRead, notifications.length]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(pharmacist)/dashboard' as any)}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#0B1C5A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(pharmacist)/dashboard' as any)}>
          {user?.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, { backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="person-outline" size={16} color="#0B1C5A" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.pageTitle}>Notifications</Text>
        <Text style={styles.pageSubtitle}>Stay updated on your consultation requests in real time.</Text>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: 'center', paddingHorizontal: 20 }}>
            <Ionicons name="notifications-off-outline" size={34} color="#94A3B8" />
            <Text style={{ marginTop: 12, color: '#64748B', textAlign: 'center', lineHeight: 20 }}>
              No notifications yet. New consultation requests will appear here the moment a patient books you.
            </Text>
          </View>
        ) : (
          notifications.map((n) => (
            <View key={n.id} style={styles.notifCard}>
              <View style={styles.notifHeader}>
                <View style={styles.notifHeaderLeft}>
                  <View style={[styles.iconWrap, { backgroundColor: n.type === 'new_consultation' ? '#CCFBF1' : '#F1F5F9' }]}>
                    <Ionicons
                      name={n.type === 'new_consultation' ? 'medkit-outline' : 'calendar-outline'}
                      size={20}
                      color={n.type === 'new_consultation' ? '#0F766E' : '#475569'}
                    />
                  </View>
                  <Text style={styles.notifTitle}>{n.title}</Text>
                </View>
                <Text style={styles.timeText}>{formatNotifTime(n.createdAt)}</Text>
              </View>
              <Text style={styles.notifDesc}>{n.body}</Text>
              {n.type === 'new_consultation' && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => router.push('/(pharmacist)/consults' as any)}
                >
                  <Text style={styles.actionBtnText}>View Details</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C5A',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
