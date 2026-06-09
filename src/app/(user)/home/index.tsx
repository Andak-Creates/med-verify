import React, { useState, useEffect, useRef } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';

const TIPS = [
  { text: "Always check the expiry date before use.", image: require('../../../../assets/images/tip_expiry.png') },
  { text: "Report suspicious or unsealed packaging immediately.", image: require('../../../../assets/images/tip_suspicious.png') },
  { text: "Consult your pharmacist before mixing medications.", image: require('../../../../assets/images/tip_pharmacist.png') }
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => {
        const next = (prev + 1) % TIPS.length;
        scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
        return next;
      });
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentTipIndex(newIndex);
  };

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

        {/* ── Tip Slideshow ──────────────────────────────────── */}
        <View style={styles.sliderContainer}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
            style={{ flexGrow: 0 }}
          >
            {TIPS.map((tip, index) => (
              <View key={index} style={{ width: SCREEN_WIDTH }}>
                <View style={styles.tipCard}>
                  <Image source={tip.image} style={styles.tipImage} resizeMode="cover" />
                  <View style={styles.tipOverlay}>
                    <View style={styles.tipOverlayContent}>
                      <View style={styles.tipIconWrap}>
                        <Ionicons name="bulb" size={20} color="#0B1C5A" />
                      </View>
                      <Text style={styles.tipTextLarge}>
                        {tip.text}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.paginationDots}>
            {TIPS.map((_, i) => (
              <View key={i} style={[styles.dot, currentTipIndex === i && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* ── Quick Actions ──────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        
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

        {/* ── Hero Scan Card ─────────────────────────────────── */}
        <Pressable
          onPress={() => router.push('/(user)/home/scan-qr' as any)}
          style={({ pressed }) => [styles.heroCard, pressed && { opacity: 0.92 }]}
        >
          <View style={styles.heroWatermark}>
            <Ionicons name="checkmark-done-circle-outline" size={170} color="#0B1C5A" />
          </View>

          <View style={styles.heroContent}>
            <View style={styles.heroIconBlock}>
              <Ionicons name="qr-code" size={30} color="#fff" />
            </View>
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroTitle}>Scan QR/Barcode</Text>
              <Text style={styles.heroSub}>INSTANT VERIFICATION</Text>
            </View>
          </View>
        </Pressable>
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

  /* Section Title */
  sectionHeader: {
    paddingHorizontal: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C5A',
    letterSpacing: -0.2,
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

  /* Large Tip Card Slider */
  sliderContainer: {
    marginBottom: 20,
  },
  tipCard: {
    marginHorizontal: 22,
    height: 240,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    // shadow needs to be on an outer view if inside horizontal scroll, or just use elevation
  },
  tipImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  tipOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(11, 28, 90, 0.3)',
    padding: 20,
  },
  tipOverlayContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#EEF1FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTextLarge: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1C5A',
    lineHeight: 20,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(11, 28, 90, 0.2)',
  },
  dotActive: {
    width: 16,
    backgroundColor: '#0B1C5A',
  },

});
