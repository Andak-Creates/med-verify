import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePharmacyDetail } from '@/hooks/useNearbyPharmacies';

export default function PharmacyPlaceDetailScreen() {
  const router = useRouter();
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  const { pharmacy, isLoading, error, reload } = usePharmacyDetail(placeId);

  const handleCall = () => {
    if (pharmacy?.phone) Linking.openURL(`tel:${pharmacy.phone}`);
  };

  const handleWebsite = () => {
    if (pharmacy?.website) Linking.openURL(pharmacy.website);
  };

  const handleDirections = () => {
    if (!pharmacy) return;
    const query = encodeURIComponent(pharmacy.address || pharmacy.name);
    Linking.openURL(`https://maps.google.com/?q=${query}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0B1C5A" />
        </Pressable>
        <Text style={styles.logoText}>MedVerify</Text>
        <View style={{ width: 38 }} />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#312E81" />
          <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading pharmacy details…</Text>
        </View>
      ) : error || !pharmacy ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
          <Ionicons name="alert-circle-outline" size={36} color="#9CA3AF" />
          <Text style={{ marginTop: 12, color: '#6B7280', textAlign: 'center' }}>
            {error ?? 'Pharmacy not found.'}
          </Text>
          <TouchableOpacity onPress={reload} style={{ marginTop: 12 }}>
            <Text style={{ color: '#312E81', fontWeight: '700' }}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* ── Photo Gallery ─────────────────────── */}
          {pharmacy.photos.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.photoScroll}
            >
              {pharmacy.photos.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.photo} resizeMode="cover" />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.photoFallback}>
              <Ionicons name="storefront-outline" size={52} color="#312E81" />
            </View>
          )}

          {/* ── Open/Closed pill ──────────────────── */}
          {pharmacy.isOpen !== null && (
            <View style={styles.openPillRow}>
              <View style={[styles.openPill, { backgroundColor: pharmacy.isOpen ? '#D1FAE5' : '#FEE2E2' }]}>
                <View style={[styles.openDot, { backgroundColor: pharmacy.isOpen ? '#10B981' : '#EF4444' }]} />
                <Text style={[styles.openPillText, { color: pharmacy.isOpen ? '#065F46' : '#991B1B' }]}>
                  {pharmacy.isOpen ? 'Open now' : 'Closed now'}
                </Text>
              </View>
            </View>
          )}

          {/* ── Name & Rating ─────────────────────── */}
          <View style={styles.heroSection}>
            <Text style={styles.pharmName}>{pharmacy.name}</Text>

            {pharmacy.rating !== null && (
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.round(pharmacy.rating!) ? 'star' : 'star-outline'}
                    size={16}
                    color="#FBBF24"
                  />
                ))}
                <Text style={styles.ratingValue}>{pharmacy.rating.toFixed(1)}</Text>
                {pharmacy.userRatingsTotal > 0 && (
                  <Text style={styles.ratingCount}>({pharmacy.userRatingsTotal.toLocaleString()} reviews)</Text>
                )}
              </View>
            )}
          </View>

          {/* ── Action Buttons ────────────────────── */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCall} disabled={!pharmacy.phone}>
              <Ionicons name="call-outline" size={20} color={pharmacy.phone ? '#312E81' : '#9CA3AF'} />
              <Text style={[styles.actionBtnText, !pharmacy.phone && { color: '#9CA3AF' }]}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleDirections}>
              <Ionicons name="navigate-outline" size={20} color="#312E81" />
              <Text style={styles.actionBtnText}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleWebsite} disabled={!pharmacy.website}>
              <Ionicons name="globe-outline" size={20} color={pharmacy.website ? '#312E81' : '#9CA3AF'} />
              <Text style={[styles.actionBtnText, !pharmacy.website && { color: '#9CA3AF' }]}>Website</Text>
            </TouchableOpacity>
          </View>

          {/* ── Info Card ────────────────────────── */}
          <View style={styles.infoCard}>
            {/* Address */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrap}>
                <Ionicons name="location-outline" size={18} color="#312E81" />
              </View>
              <Text style={styles.infoText}>{pharmacy.address || 'Address not available'}</Text>
            </View>

            {/* Phone */}
            {pharmacy.phone && (
              <>
                <View style={styles.infoDivider} />
                <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
                  <View style={styles.infoIconWrap}>
                    <Ionicons name="call-outline" size={18} color="#312E81" />
                  </View>
                  <Text style={[styles.infoText, { color: '#312E81' }]}>{pharmacy.phone}</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Website */}
            {pharmacy.website && (
              <>
                <View style={styles.infoDivider} />
                <TouchableOpacity style={styles.infoRow} onPress={handleWebsite}>
                  <View style={styles.infoIconWrap}>
                    <Ionicons name="globe-outline" size={18} color="#312E81" />
                  </View>
                  <Text style={[styles.infoText, { color: '#312E81' }]} numberOfLines={1}>{pharmacy.website}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* ── Opening Hours ─────────────────────── */}
          {pharmacy.openingHours.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Opening Hours</Text>
              {pharmacy.openingHours.map((line, i) => {
                const [day, hours] = line.split(': ');
                return (
                  <View key={i} style={[styles.hoursRow, i < pharmacy.openingHours.length - 1 && styles.hoursRowBorder]}>
                    <Text style={styles.hoursDay}>{day}</Text>
                    <Text style={styles.hoursTime}>{hours ?? '—'}</Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingBottom: 100 },

  /* Header */
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 12, paddingBottom: 10 },
  logoText: { fontSize: 20, fontWeight: '800', color: '#0B1C5A' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },

  /* Photos */
  photoScroll: { height: 220 },
  photo: { width: 390, height: 220 },
  photoFallback: { height: 220, backgroundColor: '#EEF1FB', alignItems: 'center', justifyContent: 'center' },

  /* Open pill */
  openPillRow: { paddingHorizontal: 22, paddingTop: 16 },
  openPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  openDot: { width: 8, height: 8, borderRadius: 4 },
  openPillText: { fontSize: 12, fontWeight: '700' },

  /* Hero */
  heroSection: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 20 },
  pharmName: { fontSize: 24, fontWeight: '900', color: '#111827', marginBottom: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingValue: { fontSize: 14, fontWeight: '700', color: '#111827', marginLeft: 4 },
  ratingCount: { fontSize: 13, color: '#6B7280' },

  /* Action row */
  actionRow: { flexDirection: 'row', gap: 12, marginHorizontal: 22, marginBottom: 20 },
  actionBtn: { flex: 1, alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, gap: 6 },
  actionBtnText: { fontSize: 12, fontWeight: '700', color: '#312E81' },

  /* Info card */
  infoCard: { backgroundColor: '#fff', marginHorizontal: 22, borderRadius: 20, paddingVertical: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  infoIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#EEF1FB', alignItems: 'center', justifyContent: 'center' },
  infoText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 20 },
  infoDivider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 16 },

  /* Opening hours card */
  card: { backgroundColor: '#fff', marginHorizontal: 22, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, marginBottom: 20 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#312E81', marginBottom: 14 },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  hoursRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  hoursDay: { fontSize: 13, fontWeight: '600', color: '#374151', flex: 1 },
  hoursTime: { fontSize: 13, color: '#6B7280', textAlign: 'right', flex: 1 },
});
