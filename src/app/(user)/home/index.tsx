import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { getScanHistory, type ScanHistoryItem } from '../../../lib/drugs';

const RECENT_STATUS_DISPLAY: Record<ScanHistoryItem['status'], { label: string; bg: string; color: string }> = {
  verified: { label: 'AUTHENTIC', bg: '#EBF5EB', color: '#2E7D32' },
  flagged: { label: 'FLAGGED', bg: '#FFF7ED', color: '#C2410C' },
  not_found: { label: 'NOT FOUND', bg: '#FEF2F2', color: '#B91C1C' },
};

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [recentScans, setRecentScans] = useState<ScanHistoryItem[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoadingRecent(true);
      getScanHistory({ limit: 2 })
        .then(({ items }) => {
          if (!cancelled) setRecentScans(items);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoadingRecent(false);
        });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const greetingName = user?.fullName?.split(' ')[0] || user?.username || 'there';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.logoText}>MedVerify</Text>

          <View style={styles.headerActions}>
            {/* Bell */}
            <Pressable style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={21} color="#0B1C5A" />
              <View style={styles.notifDot} />
            </Pressable>

            {/* Avatar */}
            <Pressable style={styles.avatarButton} onPress={() => router.push('/(user)/account' as any)}>
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={{ width: '100%', height: '100%', borderRadius: 19 }} />
              ) : (
                <Ionicons name="person-outline" size={20} color="#0B1C5A" />
              )}
            </Pressable>
          </View>
        </View>

        {/* ── Greeting ───────────────────────────────────────── */}
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greetingName}>Hello, {greetingName}</Text>
            <Text style={styles.greetingTag}>PEOPLE-FIRST PRECISION</Text>
          </View>

          {/* PRO badge */}
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>✦ PRO</Text>
          </View>
        </View>

        {/* ── Hero Scan Card ─────────────────────────────────── */}
        <Pressable
          onPress={() => router.push('/(user)/home/scan-qr' as any)}
          style={({ pressed }) => [styles.heroCard, pressed && { opacity: 0.92 }]}
        >
          {/* Watermark */}
          <View style={styles.heroWatermark}>
            <Ionicons name="checkmark-done-circle-outline" size={170} color="#0B1C5A" />
          </View>

          <View style={styles.heroContent}>
            {/* QR Icon block */}
            <View style={styles.heroIconBlock}>
              <Ionicons name="qr-code" size={30} color="#fff" />
            </View>

            <View style={styles.heroTextBlock}>
              <Text style={styles.heroTitle}>Scan QR/Barcode</Text>
              <Text style={styles.heroSub}>INSTANT VERIFICATION</Text>
            </View>
          </View>
        </Pressable>

        {/* ── Action Grid ────────────────────────────────────── */}
        <View style={styles.actionGrid}>
          <Pressable
            onPress={() => router.push('/(user)/home/scan-image' as any)}
            style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.actionIconWrap}>
              <Ionicons name="camera-outline" size={22} color="#0B1C5A" />
            </View>
            <Text style={styles.actionLabel}>Take a Photo</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(user)/home/scan-manual' as any)}
            style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.actionIconWrap}>
              <Ionicons name="grid-outline" size={22} color="#0B1C5A" />
            </View>
            <Text style={styles.actionLabel}>Enter NAFDAC</Text>
          </Pressable>
        </View>

        {/* ── Tip Banner ─────────────────────────────────────── */}
        <View style={styles.tipBanner}>
          <View style={styles.tipIconWrap}>
            <Ionicons name="bulb-outline" size={20} color="#0B1C5A" />
          </View>
          <Text style={styles.tipText}>
            <Text style={styles.tipBold}>Tip: </Text>
            Always check the expiry date before use.
          </Text>
        </View>

        {/* ── Recent Scans ───────────────────────────────────── */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Scans</Text>
            <TouchableOpacity onPress={() => router.push('/(user)/history' as any)}>
              <Text style={styles.seeAll}>SEE ALL</Text>
            </TouchableOpacity>
          </View>

          {loadingRecent ? (
            <View style={{ paddingVertical: 30, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#0B1C5A" />
            </View>
          ) : recentScans.length === 0 ? (
            <View style={[styles.scanItem, { justifyContent: 'center' }]}>
              <Text style={{ color: '#6B7280', fontSize: 13 }}>No scans yet — verify a drug to get started.</Text>
            </View>
          ) : (
            recentScans.map((item, index) => {
              const display = RECENT_STATUS_DISPLAY[item.status];
              const result = JSON.stringify({
                nafdacNumber: item.nafdacNumber,
                found: item.status !== 'not_found',
                verificationResult: item.status,
                productName: item.drugName,
                manufacturer: item.manufacturer,
                strength: item.strength,
                category: item.category,
                form: null,
                activeIngredients: null,
                registryStatus: item.status === 'verified' ? 'Active' : null,
                approvalDate: null,
              });
              return (
                <Pressable
                  key={item.id}
                  onPress={() => router.push({ pathname: '/(user)/home/result', params: { code: item.nafdacNumber, result } } as any)}
                  style={({ pressed }) => [styles.scanItem, index === recentScans.length - 1 && { marginBottom: 0 }, pressed && { opacity: 0.85 }]}
                >
                  <View style={[styles.scanIcon, index % 2 === 1 && { backgroundColor: '#1a8a7a' }]}>
                    <View style={styles.blisterGrid}>
                      {[...Array(6)].map((_, i) => (
                        <View key={i} style={styles.blisterPill} />
                      ))}
                    </View>
                  </View>

                  <View style={styles.scanInfo}>
                    <Text style={styles.scanName}>{item.drugName ?? item.nafdacNumber}</Text>
                    <Text style={styles.scanBatch}>NAFDAC: {item.nafdacNumber}</Text>
                  </View>

                  <View style={styles.scanRight}>
                    <View style={[styles.authenticBadge, { backgroundColor: display.bg }]}>
                      <Text style={[styles.authenticText, { color: display.color }]}>{display.label}</Text>
                    </View>
                    <Text style={styles.scanTime}>{formatRelativeTime(item.scannedAt)}</Text>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 120,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 10,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0B1C5A',
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  /* Greeting */
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingBottom: 16,
  },
  greetingName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0B1C5A',
    letterSpacing: -0.3,
  },
  greetingTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E9CB2',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 3,
  },
  proBadge: {
    backgroundColor: '#E5A800',
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: '#E5A800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  proBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },

  /* Hero card */
  heroCard: {
    marginHorizontal: 22,
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 28,
    padding: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#0B1C5A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 5,
  },
  heroWatermark: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    opacity: 0.04,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  heroIconBlock: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#0B1C5A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B1C5A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  heroTextBlock: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C5A',
    letterSpacing: -0.2,
    marginBottom: 5,
  },
  heroSub: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E9CB2',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  /* Action grid */
  actionGrid: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    gap: 12,
    marginBottom: 14,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 22,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#0B1C5A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    gap: 10,
  },
  actionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F0F3FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C5A',
    textAlign: 'center',
  },

  /* Tip */
  tipBanner: {
    marginHorizontal: 22,
    marginBottom: 22,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  tipIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EEF1FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: '800',
    color: '#0B1C5A',
  },

  /* Recent scans */
  recentSection: {
    paddingHorizontal: 22,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C5A',
    letterSpacing: -0.2,
  },
  seeAll: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0B5CBE',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  scanItem: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#0B1C5A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  scanIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#2D3E50',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 8,
  },
  /* Blister pack icon */
  blisterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 30,
    height: 20,
    gap: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blisterPill: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  /* Bottle icon */
  bottleCap: {
    position: 'absolute',
    top: 6,
    width: 14,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  bottleBody: {
    position: 'absolute',
    bottom: 8,
    width: 20,
    height: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  scanInfo: {
    flex: 1,
  },
  scanName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B1C5A',
    marginBottom: 4,
  },
  scanBatch: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E9CB2',
    letterSpacing: 0.5,
  },
  scanRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  authenticBadge: {
    backgroundColor: '#EBF5EB',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  authenticText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#2E7D32',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scanTime: {
    fontSize: 10,
    color: '#B0BAC9',
    fontWeight: '500',
  },
});
