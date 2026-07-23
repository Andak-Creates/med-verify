import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSocket, type AppNotification } from '../../../context/SocketContext';

const NOTIF_DISPLAY: Record<AppNotification['type'], { icon: string; color: string; bg: string }> = {
  new_consultation: { icon: 'calendar', color: '#0B1C5A', bg: '#EEF1FB' },
  consultation_accepted: { icon: 'checkmark-circle', color: '#16a34a', bg: '#F0FDF4' },
  consultation_declined: { icon: 'close-circle', color: '#dc2626', bg: '#FEF2F2' },
};

function formatNotifTime(isoDate: string): string {
  const diffMins = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(isoDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const NOTIFICATION_GROUPS = [
  {
    title: 'Verification Alerts',
    items: [
      { id: 'scan_result',   label: 'Scan Results',         sub: 'Get notified after each drug scan',       icon: 'qr-code-outline' },
      { id: 'counterfeit',   label: 'Counterfeit Warnings',  sub: 'Alerts when a drug is flagged as fake',   icon: 'warning-outline' },
    ],
  },
  {
    title: 'Health & Pharmacy',
    items: [
      { id: 'consultation',  label: 'Consultation Reminders', sub: 'Upcoming bookings and session alerts',   icon: 'calendar-outline' },
      { id: 'pharmacy_news', label: 'Pharmacy Updates',       sub: 'New services from nearby pharmacies',    icon: 'medical-outline' },
    ],
  },
  {
    title: 'Account & Security',
    items: [
      { id: 'login_alert',   label: 'Login Alerts',          sub: 'New sign-in from a new device',           icon: 'shield-outline' },
      { id: 'promo',         label: 'Tips & Promotions',     sub: 'Health tips and special offers',          icon: 'bulb-outline' },
    ],
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, markAllRead } = useSocket();
  const [tab, setTab] = useState<'inbox' | 'settings'>('inbox');

  useEffect(() => {
    markAllRead();
  }, [markAllRead, notifications.length]);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    scan_result: true, counterfeit: true, consultation: true,
    pharmacy_news: false, login_alert: true, promo: false,
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(user)/account' as any)} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0B1C5A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['inbox', 'settings'] as const).map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tabBtn, tab === t && styles.tabBtnActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'inbox' ? 'Inbox' : 'Preferences'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {tab === 'inbox' ? (
          <View style={{ padding: 20, gap: 10 }}>
            {notifications.length === 0 ? (
              <View style={{ paddingVertical: 50, alignItems: 'center', paddingHorizontal: 20 }}>
                <Ionicons name="notifications-off-outline" size={34} color="#9CA3AF" />
                <Text style={{ marginTop: 12, color: '#6B7280', textAlign: 'center', lineHeight: 20 }}>
                  No notifications yet. Booking updates will appear here in real time.
                </Text>
              </View>
            ) : (
              notifications.map((n) => {
                const display = NOTIF_DISPLAY[n.type];
                return (
                  <View key={n.id} style={styles.notifCard}>
                    <View style={[styles.notifIcon, { backgroundColor: display.bg }]}>
                      <Ionicons name={display.icon as any} size={22} color={display.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.notifTitle}>{n.title}</Text>
                      <Text style={styles.notifBody}>{n.body}</Text>
                      <Text style={styles.notifTime}>{formatNotifTime(n.createdAt)}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        ) : (
          <View style={{ padding: 20, gap: 20 }}>
            {NOTIFICATION_GROUPS.map(group => (
              <View key={group.title}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                <View style={styles.card}>
                  {group.items.map((item, i, arr) => (
                    <View key={item.id} style={[styles.prefRow, i < arr.length - 1 && styles.prefBorder]}>
                      <View style={styles.prefIcon}>
                        <Ionicons name={item.icon as any} size={17} color="#0B1C5A" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.prefLabel}>{item.label}</Text>
                        <Text style={styles.prefSub}>{item.sub}</Text>
                      </View>
                      <Switch
                        value={prefs[item.id]}
                        onValueChange={v => setPrefs(p => ({ ...p, [item.id]: v }))}
                        trackColor={{ false: '#E5E7EB', true: '#0B1C5A' }}
                        thumbColor="#fff"
                      />
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0B1C5A' },
  tabRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 4, backgroundColor: '#F0F2FA', borderRadius: 14, padding: 4 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 11 },
  tabBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, fontWeight: '700', color: '#8E9CB2' },
  tabTextActive: { color: '#0B1C5A' },
  notifCard: { backgroundColor: '#fff', borderRadius: 18, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start', shadowColor: '#0B1C5A', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  notifIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  notifTitle: { fontSize: 14, fontWeight: '800', color: '#0B1C5A', marginBottom: 3 },
  notifBody: { fontSize: 12, color: '#6B7280', lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 10, color: '#B0BAC9' },
  groupTitle: { fontSize: 11, fontWeight: '800', color: '#8E9CB2', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#0B1C5A', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  prefRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  prefBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  prefIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#EEF1FB', alignItems: 'center', justifyContent: 'center' },
  prefLabel: { fontSize: 13, fontWeight: '700', color: '#111827' },
  prefSub: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
});

