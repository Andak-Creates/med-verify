import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { useLocation } from '@/hooks/useLocation';
import { usePharmacists } from '@/hooks/usePharmacists';
import { useNearbyPharmacies } from '@/hooks/useNearbyPharmacies';
import { MedVerifyLogo } from '../../../components/MedVerifyLogo';
import type { NearbyPharmacy, PublicPharmacist } from '@/types/api';

const SEARCH_DEBOUNCE_MS = 400;

export default function PharmacyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const mainScrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      mainScrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const [activeTab, setActiveTab] = useState<'pharmacies' | 'pharmacists'>('pharmacies');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const { coords, isLocating, permissionDenied, requestLocation, openSettings, clearLocation, setCoords } = useLocation();

  useEffect(() => {
    const handle = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchInput]);

  // Auto-request location when landing on Pharmacies tab
  useEffect(() => {
    if (activeTab === 'pharmacies' && !coords && !isLocating) {
      requestLocation();
    }
  }, [activeTab]);

  const {
    items: pharmacists,
    isLoading: pharmacistsLoading,
    isRefreshing: pharmacistsRefreshing,
    isLoadingMore,
    error: pharmacistsError,
    refresh: refreshPharmacists,
    loadMore,
  } = usePharmacists({
    search,
    available: availableOnly || undefined,
    lat: coords?.lat,
    lng: coords?.lng,
  });

  const {
    items: nearbyPharmacies,
    isLoading: pharmaciesLoading,
    error: pharmaciesError,
    refresh: refreshPharmacies,
  } = useNearbyPharmacies(coords, search);

  const handleNearMe = async () => {
    if (coords) {
      clearLocation();
      return;
    }
    await requestLocation(true);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 240) {
      loadMore();
    }
  };

  const isLoading = activeTab === 'pharmacies' ? pharmaciesLoading : pharmacistsLoading;
  const isRefreshing = activeTab === 'pharmacists' ? pharmacistsRefreshing : false;
  const error = activeTab === 'pharmacies' ? pharmaciesError : pharmacistsError;
  const refresh = activeTab === 'pharmacies' ? refreshPharmacies : refreshPharmacists;

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

  const renderNearbyPharmacyCard = (p: NearbyPharmacy) => (
    <TouchableOpacity
      key={p.placeId}
      style={styles.pharmacyCard}
      activeOpacity={0.9}
      onPress={() => router.push(`/(user)/pharmacy/place/${encodeURIComponent(p.placeId)}` as any)}
    >
      {/* Photo Container */}
      <View style={styles.pharmacyPhotoWrap}>
        {p.photoUrl ? (
          <Image source={{ uri: p.photoUrl }} style={styles.pharmacyPhoto} resizeMode="cover" />
        ) : (
          <View style={styles.pharmacyPhotoFallback}>
            <Ionicons name="storefront-outline" size={44} color="#0B1C5A" />
          </View>
        )}

        {/* Floating Top Chips */}
        <View style={styles.floatingTopRow}>
          {p.isOpenNow !== null ? (
            <View style={[styles.openBadge, { backgroundColor: p.isOpenNow ? '#10B981' : '#EF4444' }]}>
              <View style={styles.openDot} />
              <Text style={styles.openBadgeText}>{p.isOpenNow ? 'OPEN NOW' : 'CLOSED'}</Text>
            </View>
          ) : (
            <View style={[styles.openBadge, { backgroundColor: '#475569' }]}>
              <Text style={styles.openBadgeText}>VERIFIED</Text>
            </View>
          )}

          {p.rating !== null && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.ratingText}>{p.rating.toFixed(1)}</Text>
              {p.userRatingsTotal > 0 && (
                <Text style={styles.ratingCount}>({p.userRatingsTotal})</Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Body Content */}
      <View style={styles.pharmacyBody}>
        <Text style={styles.pharmName} numberOfLines={2}>{p.name}</Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={15} color="#0B1C5A" style={{ marginTop: 2 }} />
          <Text style={styles.locationText} numberOfLines={2}>{p.address || 'Address unavailable'}</Text>
        </View>

        {/* Divider */}
        <View style={styles.cardDivider} />

        {/* Footer Actions */}
        <View style={styles.pharmacyFooter}>
          <View style={styles.smallBadge}>
            <Ionicons name="shield-checkmark" size={13} color="#0B1C5A" style={{ marginRight: 4 }} />
            <Text style={styles.smallBadgeText}>PHARMACY</Text>
          </View>

          <View style={styles.viewBtn}>
            <Text style={styles.viewBtnText}>View Details</Text>
            <Ionicons name="arrow-forward" size={14} color="#fff" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPharmaciesContent = () => {
    if (!coords && !isLocating) {
      return (
        <View style={styles.locationPromptCard}>
          <View style={styles.locationIconWrap}>
            <Ionicons name="navigate-circle" size={44} color="#0B1C5A" />
          </View>

          <Text style={styles.locationPromptTitle}>
            {permissionDenied ? 'Location Permission Needed' : 'Find Pharmacies Near You'}
          </Text>

          <Text style={styles.locationPromptSubtitle}>
            {permissionDenied
              ? 'Location access was declined. Open Settings to grant permission and locate pharmacies near your live coordinates.'
              : 'Share your location to view verified pharmacies, opening hours, and real-time distances in your neighborhood.'}
          </Text>

          {permissionDenied ? (
            <TouchableOpacity style={styles.enableLocationBtn} onPress={openSettings} activeOpacity={0.85}>
              <Ionicons name="settings-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.enableLocationBtnText}>Open Device Settings</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.enableLocationBtn}
              onPress={() => requestLocation(true)}
              disabled={isLocating}
              activeOpacity={0.85}
            >
              <Ionicons name="location" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.enableLocationBtnText}>Enable Location Access</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.defaultLocationBtn}
            onPress={() => setCoords({ lat: 6.5244, lng: 3.3792 })}
            activeOpacity={0.7}
          >
            <Ionicons name="business-outline" size={16} color="#0B1C5A" style={{ marginRight: 6 }} />
            <Text style={styles.defaultLocationBtnText}>
              Or explore Lagos, Nigeria (Default)
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (isLocating) {
      return (
        <View style={{ paddingVertical: 60, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#312E81" />
          <Text style={{ marginTop: 12, color: '#6B7280' }}>Getting your location…</Text>
        </View>
      );
    }
    const listState = renderListState();
    if (listState) return listState;
    if (nearbyPharmacies.length === 0) {
      return renderEmptyState(
        search
          ? 'No pharmacies match your search. Try a different keyword.'
          : 'No pharmacies found nearby. Try expanding your search radius.',
      );
    }
    return <View style={styles.cardList}>{nearbyPharmacies.map(renderNearbyPharmacyCard)}</View>;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        ref={mainScrollRef}
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
          <MedVerifyLogo size="xs" showText={true} textColor="#0B1C5A" />
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
                  ? coords
                    ? `${nearbyPharmacies.length} ${nearbyPharmacies.length === 1 ? 'pharmacy' : 'pharmacies'} found`
                    : 'Share location to find nearby pharmacies'
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
              placeholder={
                activeTab === 'pharmacies'
                  ? 'Search by pharmacy name…'
                  : 'Search by specialty, pharmacy or bio…'
              }
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

        {/* ── Filter Pills (pharmacists only) ──────────────────── */}
        {activeTab === 'pharmacists' && (
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
        )}

        {/* ── List ─────────────────────────────────── */}
        <View style={styles.tabContent}>
          {activeTab === 'pharmacies' ? (
            <View style={styles.cardList}>{renderPharmaciesContent()}</View>
          ) : (
            <View style={styles.cardList}>
              {renderListState() ?? (
                pharmacists.length === 0 ? (
                  renderEmptyState(
                    search
                      ? 'No pharmacists match your search. Try a different specialty or keyword.'
                      : 'No approved pharmacists are available yet. Please check back soon.',
                  )
                ) : (
                  <>
                    {pharmacists.map(renderPharmacistCard)}
                    {isLoadingMore && (
                      <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                        <ActivityIndicator size="small" color="#312E81" />
                      </View>
                    )}
                  </>
                )
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
  filterScroll: { flexGrow: 0, marginBottom: 12 },
  filterRow: { alignItems: 'center', paddingHorizontal: 16, gap: 10 },
  filterPill: { flexShrink: 0, alignSelf: 'flex-start', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, backgroundColor: '#E5E7EB' },
  filterPillActive: { backgroundColor: '#0B1C5A' },
  filterPillText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  filterPillTextActive: { color: '#fff' },
  cardList: { gap: 18, paddingHorizontal: 16 },

  /* Location Enable Card & Prompt */
  locationPromptCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0B1C5A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    marginVertical: 8,
  },
  locationIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEF1FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  locationPromptTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0B1C5A',
    textAlign: 'center',
    marginBottom: 8,
  },
  locationPromptSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  enableLocationBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#0B1C5A',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B1C5A',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  enableLocationBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  defaultLocationBtn: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  defaultLocationBtnText: {
    color: '#0B1C5A',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Empty / error states */
  emptyState: { paddingVertical: 40, alignItems: 'center', paddingHorizontal: 30 },
  emptyStateText: { marginTop: 12, color: '#6B7280', textAlign: 'center', lineHeight: 20 },

  /* Nearby Pharmacy Cards (Expansive, High Visual Impact) */
  pharmacyCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0B1C5A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  pharmacyPhotoWrap: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  pharmacyPhoto: {
    width: '100%',
    height: '100%',
  },
  pharmacyPhotoFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEF1FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingTopRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 5,
  },
  openBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  ratingCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  pharmacyBody: {
    padding: 18,
  },
  pharmName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C5A',
    lineHeight: 24,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 14,
  },
  locationText: {
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
    lineHeight: 19,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 14,
  },
  pharmacyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF1FB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  smallBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0B1C5A',
    letterSpacing: 0.5,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0B1C5A',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#0B1C5A',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  viewBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Pharmacist Cards */
  docCard: { backgroundColor: '#fff', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
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
  actionBtn: { flex: 1, marginLeft: 16, backgroundColor: '#0B1C5A', height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
