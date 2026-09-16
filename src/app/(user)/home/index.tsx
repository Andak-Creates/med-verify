import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { MedVerifyLogo } from '../../../components/MedVerifyLogo';
import { useLanguage } from '../../../i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TIP_IMAGES = [
  require('../../../../assets/images/tip_expiry.png'),
  require('../../../../assets/images/tip_suspicious.png'),
  require('../../../../assets/images/tip_pharmacist.png'),
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, refreshProfile, isPro, scanCount } = useAuth();
  const { t, currentLanguageOption, setLanguage, languages, language } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const handleScanAction = (targetRoute: string) => {
    if (!isPro && scanCount >= 3) {
      router.push('/(user)/account/paywall' as any);
    } else {
      router.push(targetRoute as any);
    }
  };

  const tips = [
    { text: t.home.tip1, image: TIP_IMAGES[0] },
    { text: t.home.tip2, image: TIP_IMAGES[1] },
    { text: t.home.tip3, image: TIP_IMAGES[2] },
  ];

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
    } catch {
      // Ignore network errors silently
    } finally {
      setRefreshing(false);
    }
  }, [refreshProfile]);

  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const mainScrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      mainScrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => {
        const next = (prev + 1) % tips.length;
        scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
        return next;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [tips.length]);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentTipIndex(newIndex);
  };

  const greetingName = user?.fullName?.split(' ')[0] || user?.username || 'there';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        ref={mainScrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#0B1C5A"
            colors={['#0B1C5A']}
          />
        }
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <MedVerifyLogo size="xs" showText={true} textColor="#0B1C5A" />

          <View style={styles.headerActions}>
            {/* Language Pill Button (Triggers floating Modal, never pushes UI) */}
            <Pressable
              style={styles.langPill}
              onPress={() => setLangModalVisible(true)}
            >
              <Text style={{ fontSize: 13 }}>{currentLanguageOption.flag}</Text>
              <Text style={styles.langPillText}>{currentLanguageOption.code.toUpperCase()}</Text>
              <Ionicons name="chevron-down" size={12} color="#0B1C5A" />
            </Pressable>

            {/* Notification Bell with Badge Dot */}
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push('/(user)/account/notifications' as any)}
            >
              <Ionicons name="notifications-outline" size={20} color="#0B1C5A" />
              <View style={styles.notifDot} />
            </Pressable>

            {/* User Avatar */}
            <Pressable
              style={styles.avatarButton}
              onPress={() => router.push('/(user)/account' as any)}
            >
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles.avatarImage}
                />
              ) : (
                <Ionicons name="person-outline" size={19} color="#0B1C5A" />
              )}
            </Pressable>
          </View>
        </View>

        {/* ── Greeting Banner ────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingName}>
              {t.home.greeting}, {greetingName} 👋
            </Text>
            <Text style={styles.greetingTag}>{t.home.tagline || 'PEOPLE-FIRST PRECISION'}</Text>
            {!isPro && (
              <Text style={styles.scanCounterText}>
                Free Scans: {Math.min(scanCount, 3)}/3 used
              </Text>
            )}
          </View>

          <Pressable
            onPress={() => router.push(isPro ? ('/(user)/account/subscription' as any) : ('/(user)/account/paywall' as any))}
            style={[styles.proBadge, !isPro && styles.basicBadge]}
          >
            <Ionicons name={isPro ? "sparkles" : "shield-outline"} size={12} color={isPro ? "#B45309" : "#475569"} />
            <Text style={[styles.proBadgeText, !isPro && styles.basicBadgeText]}>
              {isPro ? "PRO" : "BASIC"}
            </Text>
          </Pressable>
        </Animated.View>

        {/* ── Tip Slideshow with Rich Visual Imagery ─────────── */}
        <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.sliderContainer}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
            style={{ flexGrow: 0 }}
          >
            {tips.map((tip, index) => (
              <View key={index} style={{ width: SCREEN_WIDTH }}>
                <View style={styles.tipCard}>
                  <Image source={tip.image} style={styles.tipImage} resizeMode="cover" />
                  <View style={styles.tipOverlay}>
                    <View style={styles.tipOverlayContent}>
                      <View style={styles.tipIconWrap}>
                        <Ionicons name="bulb" size={20} color="#0B1C5A" />
                      </View>
                      <Text style={styles.tipTextLarge} numberOfLines={2}>
                        {tip.text}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View style={styles.paginationDots}>
            {tips.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, currentTipIndex === i && styles.dotActive]}
              />
            ))}
          </View>
        </Animated.View>

        {/* ── Quick Actions Grid ─────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(260).springify()} style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.home.scanOptions}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320).springify()} style={styles.actionGrid}>
          {/* Scan with Camera / AI OCR */}
          <Pressable
            onPress={() => handleScanAction('/(user)/home/scan-ocr')}
            style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.actionIconWrap}>
              <Ionicons name="camera-outline" size={24} color="#0B1C5A" />
            </View>
            <Text style={styles.actionLabel}>{t.home.cameraScan}</Text>
            <Text style={styles.actionSubLabel}>{t.home.cameraScanDesc}</Text>
          </Pressable>

          {/* Enter NAFDAC Manual */}
          <Pressable
            onPress={() => handleScanAction('/(user)/home/scan-manual')}
            style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.85 }]}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="keypad-outline" size={24} color="#92400E" />
            </View>
            <Text style={styles.actionLabel}>{t.home.manualScan}</Text>
            <Text style={styles.actionSubLabel}>{t.home.manualScanDesc}</Text>
          </Pressable>
        </Animated.View>

        {/* ── Hero Scan Card: QR & Barcode ───────────────────── */}
        <Animated.View entering={FadeInDown.delay(380).springify()}>
          <Pressable
            onPress={() => handleScanAction('/(user)/home/scan-qr')}
            style={({ pressed }) => [styles.heroCard, pressed && { opacity: 0.92 }]}
          >
            <View style={styles.heroWatermark}>
              <Ionicons name="shield-checkmark" size={160} color="rgba(255,255,255,0.08)" />
            </View>

            <View style={styles.heroContent}>
              <View style={styles.heroIconBlock}>
                <Ionicons name="qr-code" size={30} color="#fff" />
              </View>
              <View style={styles.heroTextBlock}>
                <Text style={styles.heroTitle}>{t.home.qrScan}</Text>
                <Text style={styles.heroSub}>{t.home.qrScanDesc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.7)" />
            </View>
          </Pressable>
        </Animated.View>

        {/* ── Report Suspicious Drug Banner ──────────────────── */}
        <Animated.View entering={FadeInDown.delay(440).springify()}>
          <Pressable
            onPress={() => router.push('/(user)/home/report' as any)}
            style={({ pressed }) => [styles.reportBanner, pressed && { opacity: 0.9 }]}
          >
            <View style={styles.reportIconWrap}>
              <Ionicons name="flag" size={22} color="#DC2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reportTitle}>{t.report.title}</Text>
              <Text style={styles.reportSub}>
                {t.report.reason1} / {t.report.reason2}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>
        </Animated.View>
      </ScrollView>

      {/* ── Floating Language Selection Modal (Floats above, never pushes UI) ── */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setLangModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.modalIconWrap}>
                  <Ionicons name="globe-outline" size={20} color="#0B1C5A" />
                </View>
                <Text style={styles.modalTitle}>{t.account.selectLanguage}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setLangModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {languages.map((item) => {
                const isActive = language === item.code;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[styles.langRow, isActive && styles.langRowActive]}
                    onPress={() => {
                      setLanguage(item.code);
                      setLangModalVisible(false);
                    }}
                  >
                    <Text style={{ fontSize: 24, marginRight: 14 }}>{item.flag}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.langName, isActive && styles.langNameActive]}>
                        {item.label}
                      </Text>
                      <Text style={styles.langNative}>{item.nativeName}</Text>
                    </View>
                    {isActive ? (
                      <Ionicons name="checkmark-circle" size={22} color="#0B1C5A" />
                    ) : (
                      <Ionicons name="ellipse-outline" size={20} color="#CBD5E1" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
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
  scrollContent: {
    paddingBottom: 110,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0B1C5A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  langPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0B1C5A',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B1C5A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#0B1C5A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 19,
  },

  /* Greeting */
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 6,
    paddingBottom: 16,
  },
  greetingName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0B1C5A',
    letterSpacing: -0.3,
  },
  greetingTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E9CB2',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  scanCounterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B1C5A',
    marginTop: 4,
    opacity: 0.85,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  proBadgeText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  basicBadge: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
  },
  basicBadgeText: {
    color: '#475569',
  },

  /* Tip Slideshow */
  sliderContainer: {
    marginBottom: 22,
  },
  tipCard: {
    marginHorizontal: 20,
    height: 230,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    shadowColor: '#0B1C5A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  tipImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  tipOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(11, 28, 90, 0.25)',
    padding: 16,
  },
  tipOverlayContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  tipIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEF1FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTextLarge: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C5A',
    lineHeight: 18,
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
    width: 18,
    backgroundColor: '#0B1C5A',
  },

  /* Section Title */
  sectionHeader: {
    paddingHorizontal: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B1C5A',
    letterSpacing: -0.2,
  },

  /* Quick Actions Grid */
  actionGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0B1C5A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B1C5A',
    marginBottom: 4,
  },
  actionSubLabel: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },

  /* Hero Card */
  heroCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#0B1C5A',
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#0B1C5A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 5,
  },
  heroWatermark: {
    position: 'absolute',
    right: -24,
    bottom: -24,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroIconBlock: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextBlock: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 3,
  },
  heroSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#93C5FD',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  /* Report Suspicious Drug Banner */
  reportBanner: {
    marginHorizontal: 20,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  reportIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 2,
  },
  reportSub: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },

  /* Floating Language Modal Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 90, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 26,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EEF1FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B1C5A',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 6,
  },
  langRowActive: {
    backgroundColor: '#EEF1FB',
  },
  langName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  langNameActive: {
    color: '#0B1C5A',
    fontWeight: '800',
  },
  langNative: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
});
