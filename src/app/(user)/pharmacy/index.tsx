import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { useLocation } from '@/hooks/useLocation';
import { usePharmacists } from '@/hooks/usePharmacists';
import type { PublicPharmacist } from '@/types/api';

const SEARCH_DEBOUNCE_MS = 400;

export default function PharmacyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pharmacies' | 'pharmacists'>('pharmacists');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const { coords, isLocating, requestLocation, clearLocation } = useLocation();

  useEffect(() => {
    const handle = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const {
    items: pharmacists,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    refresh,
    loadMore,
  } = usePharmacists({
    search,
    available: availableOnly || undefined,
    lat: coords?.lat,
    lng: coords?.lng,
  });

  const handleNearMe = async () => {
    if (coords) {
      clearLocation();
      return;
    }
    await requestLocation();
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 240) {
      loadMore();
    }
  };

  // The backend models pharmacies through their pharmacists — the Pharmacies
  // tab surfaces the same approved pharmacists, framed by their pharmacy.
  const pharmacies = pharmacists.filter((p) => p.pharmacyName);

  const formatDistance = (distanceKm: number | null) =>
    distanceKm != null ? `${distanceKm} km away` : null;

  const renderEmptyState = (message: string) => (
    <View style={styles.emptyState}>
      <Ionicons name="medkit-outline" size={36} color="#9CA3AF" />
      <Text style={styles.emptyStateText}>{message}</Text>
    </View>
  );

  const renderListState = () => {
    if (isLoading) {
      return (
        <View style={{ paddingVertical: 60, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#312E81" />
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={36} color="#9CA3AF" />
          <Text style={styles.emptyStateText}>{error}</Text>
          <TouchableOpacity onPress={refresh} style={{ marginTop: 12 }}>
            <Text style={{ color: '#312E81', fontWeight: '700' }}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  const renderPharmacistCard = (p: PublicPharmacist) => {
    const available = p.isOnline && !p.vacationMode;
    return (
      <View key={p.id} style={styles.docCard}>
        <View style={styles.docHeaderRow}>
          <View style={styles.docAvatarWrap}>
            {p.profileImage ? (
              <Image source={{ uri: p.profileImage }} style={styles.docAvatarImg} />
            ) : (
              <View style={[styles.docAvatarImg, styles.avatarFallback]}>
                <Ionicons name="person-outline" size={28} color="#312E81" />
              </View>
            )}
            <View style={[styles.onlineDot, { backgroundColor: available ? '#10B981' : '#9CA3AF' }]} />
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={styles.docName}>{p.fullName ?? 'Pharmacist'}</Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#312E81" />
                <Text style={styles.ratingText}>{p.avgRating > 0 ? p.avgRating.toFixed(1) : 'New'}</Text>
              </View>
            </View>
            <Text style={styles.docSpec}>{p.specialty ?? 'Pharmacist'}</Text>

            <View style={styles.docMetaRow}>
              <View
                style={[
                  styles.smallBadge,
                  { backgroundColor: available ? '#D1FAE5' : '#E5E7EB', marginEnd: 8 },
                ]}
              >
                <Text style={[styles.smallBadgeText, { color: available ? '#065F46' : '#374151' }]}>
                  {p.vacationMode ? 'ON VACATION' : p.isOnline ? 'ONLINE' : 'OFFLINE'}
                </Text>
              </View>
              {formatDistance(p.distanceKm) && (
                <>
                  <Ionicons name="location-outline" size={12} color="#6B7280" />
                  <Text style={styles.docMetaText}>{formatDistance(p.distanceKm)}</Text>
                </>
              )}
            </View>
          </View>
        </View>

        <View style={styles.docFooterRow}>
          <Text style={styles.reviewCount}>
            {p.reviewCount}{'\n'}{p.reviewCount === 1 ? 'review' : 'reviews'}
          </Text>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push(`/(user)/pharmacy/${p.id}` as any)}
          >
            <Text style={styles.actionBtnText}>View Pharmacist</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPharmacyCard = (p: PublicPharmacist) => (
    <View key={p.id} style={styles.pharmacyCard}>
      <View style={styles.pharmHeaderRow}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <View style={styles.pharmNameRow}>
            <Text style={styles.pharmName}>{p.pharmacyName}</Text>
            <Ionicons name="checkmark-circle" size={16} color="#312E81" style={{ marginLeft: 4 }} />
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text style={styles.locationText} numberOfLines={1}>
              {[formatDistance(p.distanceKm), p.pharmacyAddress].filter(Boolean).join(' • ') ||
                'Address not provided'}
            </Text>
          </View>
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#312E81" />
          <Text style={styles.ratingText}>{p.avgRating > 0 ? p.avgRating.toFixed(1) : 'New'}</Text>
        </View>
      </View>

      <View style={styles.pharmFooterRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.statusTextBlue}>
            {p.vacationMode ? 'CURRENTLY UNAVAILABLE' : p.isOnline ? 'PHARMACIST ONLINE' : 'PHARMACIST OFFLINE'}
          </Text>
          <View style={styles.badgeRow}>
            <View style={[styles.smallBadge, { backgroundColor: '#DBEAFE' }]}>
              <Text style={[styles.smallBadgeText, { color: '#1E40AF' }]}>
                {(p.fullName ?? 'PHARMACIST').toUpperCase()}
              </Text>
            </View>
            <View style={[styles.smallBadge, { backgroundColor: '#D1FAE5' }]}>
              <Text style={[styles.smallBadgeText, { color: '#065F46' }]}>
                FROM ₦{p.feeDrugInquiry.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => router.push(`/(user)/pharmacy/${p.id}` as any)}
        >
          <Text style={styles.viewBtnText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={200}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor="#312E81" />
        }
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.logoText}>MedVerify</Text>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton} onPress={() => router.push('/(user)/account/notifications' as any)}>
              <Ionicons name="notifications-outline" size={21} color="#0B1C5A" />
            </Pressable>
            <Pressable style={styles.avatarButton} onPress={() => router.push('/(user)/account' as any)}>
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.avatarImg} />
              ) : (
                <View style={[styles.avatarImg, styles.avatarFallback]}>
                  <Ionicons name="person-outline" size={20} color="#0B1C5A" />
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* ── Title ───────────────────────────── */}
        <View style={styles.titleSection}>
          <View style={styles.titleLeft}>
            <Text style={styles.pageTitle}>
              {activeTab === 'pharmacies' ? 'Nearby Pharmacies' : 'Available Pharmacists'}
            </Text>
            <Text style={styles.pageSubtitle}>
              {isLoading
                ? 'Searching…'
                : activeTab === 'pharmacies'
                  ? `${pharmacies.length} ${pharmacies.length === 1 ? 'pharmacy' : 'pharmacies'} found`
                  : `${pharmacists.length} ${pharmacists.length === 1 ? 'expert' : 'experts'} found`}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.mapBtn, coords && { backgroundColor: '#312E81' }]}
            onPress={handleNearMe}
            disabled={isLocating}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color="#312E81" />
            ) : (
              <>
                <Ionicons name="navigate-outline" size={20} color={coords ? '#fff' : '#312E81'} />
                <Text style={[styles.mapBtnText, coords && { color: '#fff' }]}>Near{'\n'}Me</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Tabs ──────────────────────────────────────── */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.mainTab, activeTab === 'pharmacies' && styles.mainTabActive]}
            onPress={() => setActiveTab('pharmacies')}
          >
            <Text style={[styles.mainTabText, activeTab === 'pharmacies' && styles.mainTabTextActive]}>Pharmacies</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mainTab, activeTab === 'pharmacists' && styles.mainTabActive]}
            onPress={() => setActiveTab('pharmacists')}
          >
            <Text style={[styles.mainTabText, activeTab === 'pharmacists' && styles.mainTabTextActive]}>Pharmacists</Text>
          </TouchableOpacity>
        </View>

        {/* ── Search Bar ──────────────────────────────────────── */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by specialty, pharmacy or bio…"
              placeholderTextColor="#9CA3AF"
              value={searchInput}
              onChangeText={setSearchInput}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {searchInput.length > 0 && (
              <TouchableOpacity onPress={() => setSearchInput('')}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Filter Pills ─────────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, availableOnly && styles.filterPillActive]}
            onPress={() => setAvailableOnly((v) => !v)}
          >
            <Text style={[styles.filterPillText, availableOnly && styles.filterPillTextActive]}>
              Available Now
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, coords != null && styles.filterPillActive]}
            onPress={handleNearMe}
          >
            <Text style={[styles.filterPillText, coords != null && styles.filterPillTextActive]}>
              Near Me
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ── List ─────────────────────────────────── */}
        <View style={styles.tabContent}>
          {renderListState() ?? (
            <View style={styles.cardList}>
              {activeTab === 'pharmacists' ? (
                pharmacists.length === 0 ? (
                  renderEmptyState(
                    search
                      ? 'No pharmacists match your search. Try a different specialty or keyword.'
                      : 'No approved pharmacists are available yet. Please check back soon.',
                  )
                ) : (
                  pharmacists.map(renderPharmacistCard)
                )
              ) : pharmacies.length === 0 ? (
                renderEmptyState(
                  search
                    ? 'No pharmacies match your search.'
                    : 'No registered pharmacies are available yet. Please check back soon.',
                )
              ) : (
                pharmacies.map(renderPharmacyCard)
              )}
              {isLoadingMore && (
                <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#312E81" />
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingBottom: 115 },

  /* Header */
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingTop: 12, paddingBottom: 10 },
  logoText: { fontSize: 22, fontWeight: '800', color: '#0B1C5A', letterSpacing: -0.3 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.85)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  avatarButton: { width: 38, height: 38, borderRadius: 19, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  avatarImg: { width: '100%', height: '100%' },
  avatarFallback: { backgroundColor: '#EEF1FB', alignItems: 'center', justifyContent: 'center' },

  /* Title & Near Me Section */
  titleSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingTop: 10, paddingBottom: 20 },
  titleLeft: { flex: 1, paddingRight: 16 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: '#4B5563', lineHeight: 18 },
  mapBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: '#312E81' },
  mapBtnText: { fontSize: 13, fontWeight: '700', color: '#312E81', textAlign: 'center' },

  /* Segmented Control Tabs */
  tabContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', marginHorizontal: 22, borderRadius: 12, padding: 4, marginBottom: 20 },
  mainTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  mainTabActive: { backgroundColor: '#312E81' },
  mainTabText: { fontSize: 14, fontWeight: '700', color: '#4B5563' },
  mainTabTextActive: { color: '#fff' },

  /* Search Bar */
  searchContainer: { paddingHorizontal: 22, marginBottom: 20 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, height: 50, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },

  /* Tab Content Shared */
  tabContent: { flex: 1 },
  filterScroll: { flexGrow: 0, marginBottom: 8 },
  filterRow: { alignItems: 'center', paddingHorizontal: 22, gap: 10 },
  filterPill: { flexShrink: 0, alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E5E7EB' },
  filterPillActive: { backgroundColor: '#312E81' },
  filterPillText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  filterPillTextActive: { color: '#fff' },
  cardList: { gap: 16, paddingHorizontal: 22 },

  /* Empty / error states */
  emptyState: { paddingVertical: 40, alignItems: 'center', paddingHorizontal: 30 },
  emptyStateText: { marginTop: 12, color: '#6B7280', textAlign: 'center', lineHeight: 20 },

  /* Pharmacy Cards */
  pharmacyCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  pharmHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  pharmNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  pharmName: { fontSize: 18, fontWeight: '800', color: '#111827' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, color: '#6B7280', flexShrink: 1 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EEF1FB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#312E81' },
  pharmFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  statusTextBlue: { fontSize: 11, fontWeight: '800', color: '#312E81', letterSpacing: 0.5, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  smallBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  smallBadgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  viewBtn: { backgroundColor: '#312E81', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 24 },
  viewBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  /* Pharmacist Cards */
  docCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  docHeaderRow: { flexDirection: 'row', marginBottom: 16 },
  docAvatarWrap: { position: 'relative', marginRight: 16 },
  docAvatarImg: { width: 72, height: 72, borderRadius: 16, backgroundColor: '#F3F4F6' },
  onlineDot: { position: 'absolute', top: -4, right: -4, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#fff' },
  docName: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4, flexShrink: 1, paddingRight: 10 },
  docSpec: { fontSize: 13, color: '#4B5563', marginBottom: 8, lineHeight: 18 },
  docMetaRow: { flexDirection: 'row', alignItems: 'center' },
  docMetaText: { fontSize: 11, color: '#6B7280', marginLeft: 2 },
  docFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewCount: { fontSize: 12, color: '#6B7280', lineHeight: 16 },
  actionBtn: { flex: 1, marginLeft: 16, backgroundColor: '#312E81', height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
