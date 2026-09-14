import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { MedVerifyLogo } from '../../../components/MedVerifyLogo';
import { useLanguage } from '../../../i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const { t, currentLanguageOption, setLanguage, languages } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [langPickerVisible, setLangPickerVisible] = useState(false);

  const tips = [
    { text: t.home.tip1, icon: 'time-outline' as const },
    { text: t.home.tip2, icon: 'warning-outline' as const },
    { text: t.home.tip3, icon: 'shield-checkmark-outline' as const },
  ];

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
    } catch {
      // Ignore
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
        scrollRef.current?.scrollTo({ x: next * (SCREEN_WIDTH - 40), animated: true });
        return next;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [tips.length]);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 40));
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
            {/* Language Selector Pill */}
            <Pressable
              style={styles.langPill}
              onPress={() => setLangPickerVisible(!langPickerVisible)}
            >
              <Text style={{ fontSize: 14 }}>{currentLanguageOption.flag}</Text>
              <Text style={styles.langPillText}>{currentLanguageOption.code.toUpperCase()}</Text>
              <Ionicons name="chevron-down" size={12} color="#0B1C5A" />
            </Pressable>

            {/* Notifications */}
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push('/(user)/account/notifications' as any)}
            >
              <Ionicons name="notifications-outline" size={20} color="#0B1C5A" />
            </Pressable>

            {/* Avatar */}
            <Pressable
              style={styles.avatarButton}
              onPress={() => router.push('/(user)/account' as any)}
            >
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={{ width: '100%', height: '100%', borderRadius: 18 }}
                />
              ) : (
                <Ionicons name="person-outline" size={18} color="#0B1C5A" />
              )}
            </Pressable>
          </View>
        </View>

        {/* ── Language Dropdown Modal / Strip ─────────────────── */}
        {langPickerVisible && (
          <View style={styles.langDropdown}>
            <Text style={styles.langDropdownTitle}>{t.account.selectLanguage}</Text>
            <View style={styles.langGrid}>
              {languages.map((item) => (
                <Pressable
                  key={item.code}
                  style={[
                    styles.langOption,
                    currentLanguageOption.code === item.code && styles.langOptionActive,
                  ]}
                  onPress={() => {
                    setLanguage(item.code);
                    setLangPickerVisible(false);
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{item.flag}</Text>
                  <Text
                    style={[
                      styles.langOptionText,
                      currentLanguageOption.code === item.code && styles.langOptionTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ── Greeting Banner ────────────────────────────────── */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingName}>{t.home.greeting}, {greetingName} 👋</Text>
          <Text style={styles.greetingTag}>{t.home.tagline}</Text>
        </View>

        {/* ── Primary Hero: AI Camera Scan ───────────────────── */}
        <Pressable
          onPress={() => router.push('/(user)/home/scan-ocr' as any)}
          style={({ pressed }) => [styles.heroCard, pressed && { opacity: 0.92 }]}
        >
          <View style={styles.heroWatermark}>
            <Ionicons name="shield-checkmark" size={160} color="rgba(255,255,255,0.08)" />
          </View>

          <View style={styles.heroContent}>
            <View style={styles.heroIconBlock}>
              <Ionicons name="camera" size={32} color="#0B1C5A" />
            </View>
            <View style={styles.heroTextBlock}>
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={11} color="#fff" />
                <Text style={styles.aiBadgeText}>AI OCR SCANNER</Text>
              </View>
              <Text style={styles.heroTitle}>{t.home.cameraScan}</Text>
              <Text style={styles.heroSub}>{t.home.cameraScanDesc}</Text>
            </View>
          </View>
        </Pressable>

        {/* ── Secondary Methods Grid ─────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.home.scanOptions}</Text>
        </View>

        <View style={styles.gridRow}>
          {/* QR & Barcode */}
          <Pressable
            onPress={() => router.push('/(user)/home/scan-qr' as any)}
            style={({ pressed }) => [styles.gridCard, pressed && { opacity: 0.85 }]}
          >
            <View style={[styles.gridIconWrap, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="qr-code-outline" size={24} color="#0B1C5A" />
            </View>
            <Text style={styles.gridCardTitle}>{t.home.qrScan}</Text>
            <Text style={styles.gridCardDesc}>{t.home.qrScanDesc}</Text>
          </Pressable>

          {/* Manual Entry */}
          <Pressable
            onPress={() => router.push('/(user)/home/scan-manual' as any)}
            style={({ pressed }) => [styles.gridCard, pressed && { opacity: 0.85 }]}
          >
            <View style={[styles.gridIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="keypad-outline" size={24} color="#92400E" />
            </View>
            <Text style={styles.gridCardTitle}>{t.home.manualScan}</Text>
            <Text style={styles.gridCardDesc}>{t.home.manualScanDesc}</Text>
          </Pressable>
        </View>

        {/* ── Report Suspicious Drug Banner ──────────────────── */}
        <Pressable
          onPress={() => router.push('/(user)/home/report' as any)}
          style={({ pressed }) => [styles.reportBanner, pressed && { opacity: 0.9 }]}
        >
          <View style={styles.reportIconWrap}>
            <Ionicons name="flag" size={22} color="#DC2626" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.reportTitle}>{t.report.title}</Text>
            <Text style={styles.reportSub}>{t.report.reason1} / {t.report.reason2}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </Pressable>

        {/* ── Health & Verification Tips Slider ──────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.home.healthTips}</Text>
        </View>

        <View style={styles.tipContainer}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
          >
            {tips.map((tip, index) => (
              <View key={index} style={{ width: SCREEN_WIDTH - 40 }}>
                <View style={styles.tipCard}>
                  <View style={styles.tipIconBlock}>
                    <Ionicons name={tip.icon} size={22} color="#0B1C5A" />
                  </View>
                  <Text style={styles.tipText}>{tip.text}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.paginationDots}>
            {tips.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, currentTipIndex === i && styles.dotActive]}
              />
            ))}
          </View>
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
  scrollContent: {
    paddingBottom: 110,
  },
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
    gap: 8,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0B1C5A',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#0B1C5A',
  },
  langDropdown: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#0B1C5A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  langDropdownTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  langOptionActive: {
    backgroundColor: '#0B1C5A',
  },
  langOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  langOptionTextActive: {
    color: '#FFFFFF',
  },
  greetingSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greetingName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0B1C5A',
    letterSpacing: -0.3,
  },
  greetingTag: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  heroCard: {
    marginHorizontal: 20,
    backgroundColor: '#0B1C5A',
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0B1C5A',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  heroWatermark: {
    position: 'absolute',
    right: -20,
    bottom: -25,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroIconBlock: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTextBlock: {
    flex: 1,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  heroSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B1C5A',
    letterSpacing: 0.3,
  },
  gridRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#0B1C5A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C5A',
    marginBottom: 4,
  },
  gridCardDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  reportBanner: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    shadowColor: '#DC2626',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reportIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
  },
  reportSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  tipContainer: {
    paddingHorizontal: 20,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0B1C5A',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  tipIconBlock: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '500',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#0B1C5A',
  },
});
