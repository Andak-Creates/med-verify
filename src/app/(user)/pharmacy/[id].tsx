import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePharmacist } from '@/hooks/usePharmacists';
import type { ConsultationType } from '@/types/api';

export default function PharmacistDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pharmacist, isLoading, error, reload } = usePharmacist(id);

  const handleBook = (consultationType: ConsultationType) => {
    if (!pharmacist) return;
    router.push({
      pathname: '/(user)/pharmacy/book-consultation',
      params: { pharmacistProfileId: pharmacist.id, consultationType },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0B1C5A" />
        </Pressable>
        <Text style={styles.logoText}>MedVerify</Text>
        <Pressable style={styles.iconButton} onPress={() => router.push('/(user)/account/notifications' as any)}>
          <Ionicons name="notifications-outline" size={20} color="#0B1C5A" />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#312E81" />
        </View>
      ) : error || !pharmacist ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
          <Ionicons name="alert-circle-outline" size={36} color="#9CA3AF" />
          <Text style={{ marginTop: 12, color: '#6B7280', textAlign: 'center' }}>
            {error ?? 'Pharmacist not found.'}
          </Text>
          <TouchableOpacity onPress={reload} style={{ marginTop: 12 }}>
            <Text style={{ color: '#312E81', fontWeight: '700' }}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* ── Pharmacist Hero ─────────────────────────── */}
          <View style={styles.heroSection}>
            <View style={styles.avatarWrap}>
              {pharmacist.profileImage ? (
                <Image source={{ uri: pharmacist.profileImage }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Ionicons name="person-outline" size={44} color="#312E81" />
                </View>
              )}
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            </View>

            <Text style={styles.docName}>{pharmacist.fullName ?? 'Pharmacist'}</Text>

            <View style={styles.tagsRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>PCN Certified</Text>
              </View>
              {pharmacist.specialty && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{pharmacist.specialty}</Text>
                </View>
              )}
            </View>

            {pharmacist.pharmacyName && (
              <Text style={styles.specialtyText}>
                {pharmacist.pharmacyName}
                {pharmacist.pharmacyAddress ? ` • ${pharmacist.pharmacyAddress}` : ''}
              </Text>
            )}
          </View>

          {/* ── Stats Row ─────────────────────────────── */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star-outline" size={22} color="#312E81" style={{ marginBottom: 6 }} />
              <Text style={styles.statValue}>
                {pharmacist.avgRating > 0 ? pharmacist.avgRating.toFixed(1) : '—'}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={22} color="#312E81" style={{ marginBottom: 6 }} />
              <Text style={styles.statValue}>{pharmacist.totalConsultations}</Text>
              <Text style={styles.statLabel}>Consults</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color="#312E81" style={{ marginBottom: 6 }} />
              <Text style={styles.statValue}>{pharmacist.reviewCount}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>

          {/* ── Professional Bio ──────────────────────── */}
          {pharmacist.bio && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Professional Bio</Text>
              <Text style={styles.cardBody}>{pharmacist.bio}</Text>
            </View>
          )}

          {/* ── Availability notice ───────────────── */}
          {pharmacist.vacationMode && (
            <View style={[styles.card, { backgroundColor: '#FFF7ED' }]}>
              <Text style={[styles.cardTitle, { color: '#C2410C' }]}>Currently Unavailable</Text>
              <Text style={styles.cardBody}>
                This pharmacist is on vacation and is not accepting new bookings right now.
              </Text>
            </View>
          )}

          {/* ── Available Consultations ───────────────── */}
          <Text style={styles.sectionHeading}>Available Consultations</Text>

          <TouchableOpacity
            style={styles.consultCard}
            disabled={pharmacist.vacationMode}
            onPress={() => handleBook('audio')}
          >
            <View style={styles.consultIcon}>
              <Ionicons name="link" size={20} color="#312E81" style={{ transform: [{ rotate: '45deg' }] }} />
            </View>
            <View style={styles.consultInfo}>
              <Text style={styles.consultTitle}>Drug Inquiry</Text>
              <Text style={styles.consultSub}>Chat or audio session</Text>
            </View>
            <Text style={styles.consultPrice}>₦{pharmacist.feeDrugInquiry.toLocaleString()}</Text>
            <TouchableOpacity
              style={[styles.bookBtn, pharmacist.vacationMode && { opacity: 0.5 }]}
              disabled={pharmacist.vacationMode}
              onPress={() => handleBook('audio')}
            >
              <Text style={styles.bookBtnText}>Book Now →</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.consultCard, styles.consultCardDark]}
            disabled={pharmacist.vacationMode}
            onPress={() => handleBook('both')}
          >
            <View style={[styles.consultIcon, styles.consultIconDark]}>
              <Ionicons name="medkit" size={20} color="#fff" />
            </View>
            <View style={styles.consultInfo}>
              <Text style={[styles.consultTitle, styles.consultTitleDark]}>Full Consultation</Text>
              <Text style={[styles.consultSub, styles.consultSubDark]}>Chat + audio call session</Text>
            </View>
            <Text style={[styles.consultPrice, styles.consultPriceDark]}>
              ₦{pharmacist.feeFullConsultation.toLocaleString()}
            </Text>
            <TouchableOpacity
              style={[styles.bookBtn, styles.bookBtnDark, pharmacist.vacationMode && { opacity: 0.5 }]}
              disabled={pharmacist.vacationMode}
              onPress={() => handleBook('both')}
            >
              <Text style={styles.bookBtnText}>Book Now 🗓</Text>
            </TouchableOpacity>
          </TouchableOpacity>

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
  iconButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },

  /* Hero */
  heroSection: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 28 },
  avatarWrap: { position: 'relative', marginBottom: 16 },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, elevation: 5 },
  avatarFallback: { backgroundColor: '#EEF1FB', alignItems: 'center', justifyContent: 'center' },
  verifiedBadge: { position: 'absolute', bottom: 2, right: 2, width: 26, height: 26, borderRadius: 13, backgroundColor: '#312E81', borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  docName: { fontSize: 24, fontWeight: '900', color: '#111827', marginBottom: 10, textAlign: 'center' },
  tagsRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap', justifyContent: 'center' },
  tag: { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#EEF1FB', borderRadius: 20 },
  tagText: { fontSize: 12, fontWeight: '700', color: '#312E81' },
  specialtyText: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22 },

  /* Stats */
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 22, borderRadius: 20, paddingVertical: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 3, marginBottom: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#111827', marginBottom: 2 },
  statLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  statDivider: { width: 1, backgroundColor: '#E5E7EB' },

  /* Bio Card */
  card: { backgroundColor: '#fff', marginHorizontal: 22, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 2, marginBottom: 24 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#312E81', marginBottom: 10 },
  cardBody: { fontSize: 14, color: '#4B5563', lineHeight: 22 },

  /* Consultation Cards */
  sectionHeading: { fontSize: 18, fontWeight: '800', color: '#111827', paddingHorizontal: 22, marginBottom: 14 },
  consultCard: { backgroundColor: '#fff', marginHorizontal: 22, borderRadius: 20, padding: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, marginBottom: 14 },
  consultCardDark: { backgroundColor: '#312E81' },
  consultIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF1FB', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  consultIconDark: { backgroundColor: 'rgba(255,255,255,0.15)' },
  consultInfo: { marginBottom: 8 },
  consultTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 2 },
  consultTitleDark: { color: '#fff' },
  consultSub: { fontSize: 12, color: '#6B7280' },
  consultSubDark: { color: 'rgba(255,255,255,0.65)' },
  consultPrice: { fontSize: 22, fontWeight: '900', color: '#111827', marginBottom: 14 },
  consultPriceDark: { color: '#fff' },
  bookBtn: { backgroundColor: '#111827', height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bookBtnDark: { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
