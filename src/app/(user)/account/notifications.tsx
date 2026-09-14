import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../../i18n';

interface NotificationSetting {
  id: string;
  label: string;
  sub: string;
  icon: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    scan_result: true,
    counterfeit: true,
    recalls: true,
    safety_tips: false,
    security: true,
  });

  const togglePref = (id: string) => {
    setPrefs(p => ({ ...p, [id]: !p[id] }));
  };

  const notificationGroups: { title: string; items: NotificationSetting[] }[] = [
    {
      title: 'Verification & Safety Alerts',
      items: [
        {
          id: 'scan_result',
          label: 'Scan Verification Results',
          sub: 'Receive instant confirmation and safety records after scanning',
          icon: 'scan-outline',
        },
        {
          id: 'counterfeit',
          label: 'Counterfeit & High-Risk Alerts',
          sub: 'Immediate notifications when a scanned drug is flagged as fake or suspicious',
          icon: 'warning-outline',
        },
        {
          id: 'recalls',
          label: 'Batch Recalls & Health Advisories',
          sub: 'Regulatory recall bulletins and batch contamination notices',
          icon: 'shield-alert-outline',
        },
      ],
    },
    {
      title: 'Account & Security',
      items: [
        {
          id: 'security',
          label: 'Security & Sign-in Alerts',
          sub: 'Notify me of logins from new devices or password changes',
          icon: 'lock-closed-outline',
        },
        {
          id: 'safety_tips',
          label: 'Drug Safety Tips & Updates',
          sub: 'Periodic guidance on identifying safe packaging and storage',
          icon: 'bulb-outline',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(user)/account' as any))}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={22} color="#0B1C5A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.account.notifications}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 24 }}>
        {notificationGroups.map((group) => (
          <View key={group.title}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.card}>
              {group.items.map((item, i, arr) => (
                <View key={item.id} style={[styles.prefRow, i < arr.length - 1 && styles.prefBorder]}>
                  <View style={styles.prefIcon}>
                    <Ionicons name={item.icon as any} size={18} color="#0B1C5A" />
                  </View>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.prefLabel}>{item.label}</Text>
                    <Text style={styles.prefSub}>{item.sub}</Text>
                  </View>
                  <Switch
                    value={prefs[item.id]}
                    onValueChange={() => togglePref(item.id)}
                    trackColor={{ false: '#E5E7EB', true: '#0B1C5A' }}
                    thumbColor="#fff"
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FD' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2FA',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0B1C5A' },
  groupTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8E9CB2',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#0B1C5A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  prefBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  prefIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEF1FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefLabel: { fontSize: 14, fontWeight: '700', color: '#111827' },
  prefSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2, lineHeight: 16 },
});


