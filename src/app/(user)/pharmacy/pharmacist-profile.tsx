import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PHARM = {
  name: 'Pharm. Dr. Adaeze Okafor', title: 'Clinical Pharmacist',
  pharmacy: 'MedPlus Pharmacy, Victoria Island', experience: '8 years',
  rating: 4.9, reviews: 143, consultations: 1240, available: true,
  specialties: ['Drug Interaction Review', 'Medication Therapy Management', 'Chronic Disease Management', 'Paediatric Pharmacy'],
  languages: ['English', 'Igbo', 'Yoruba'],
  education: 'B.Pharm â€“ University of Nigeria\nPharm.D â€“ University of Lagos',
  about: 'Dr. Adaeze Okafor is a licensed clinical pharmacist with over 8 years of experience in patient-centred pharmaceutical care. She specialises in medication therapy management and has helped over 1,200 patients optimise their drug regimens safely.',
  price: 'â‚¦2,500 / session',
};

function StarRow({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {[1,2,3,4,5].map(i => (
        <Ionicons key={i} name={i <= Math.round(rating) ? 'star' : 'star-outline'} size={13} color="#F59E0B" />
      ))}
    </View>
  );
}

export default function PharmacistProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0B1C5A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pharmacist Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          <Text style={styles.heroName}>{PHARM.name}</Text>
          <Text style={styles.heroTitle}>{PHARM.title}</Text>
          <Text style={styles.heroPharmacy}>{PHARM.pharmacy}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <StarRow rating={PHARM.rating} />
            <Text style={styles.ratingText}>{PHARM.rating} ({PHARM.reviews})</Text>
          </View>
          {PHARM.available && (
            <View style={styles.availBadge}>
              <Text style={styles.availText}>â— Available Now</Text>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { label: 'Experience', value: PHARM.experience },
              { label: 'Consultations', value: PHARM.consultations.toLocaleString() },
              { label: 'Rating', value: String(PHARM.rating) },
            ].map(s => (
              <View key={s.label} style={styles.statCard}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* About */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bodyText}>{PHARM.about}</Text>
          </View>

          {/* Specialties */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Specialties</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {PHARM.specialties.map(s => (
                <View key={s} style={styles.chip}>
                  <Text style={styles.chipText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Education */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Education</Text>
            <Text style={styles.bodyText}>{PHARM.education}</Text>
          </View>

          {/* Languages */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {PHARM.languages.map(l => (
                <View key={l} style={[styles.chip, { backgroundColor: '#F0FDF4' }]}>
                  <Text style={[styles.chipText, { color: '#16a34a' }]}>{l}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Price + CTA */}
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.sectionTitle}>Consultation Fee</Text>
              <Text style={styles.price}>{PHARM.price}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/(user)/pharmacy/book-consultation', params: { pharmacyId: '1' } } as any)}
              style={styles.ctaBtn}
            >
              <Ionicons name="calendar-outline" size={18} color="#fff" />
              <Text style={styles.ctaBtnText}>Book Consultation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0B1C5A' },
  heroCard: { margin: 20, backgroundColor: '#0B1C5A', borderRadius: 24, padding: 24, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  heroName: { fontSize: 20, fontWeight: '900', color: '#fff', textAlign: 'center' },
  heroTitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  heroPharmacy: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4, textAlign: 'center' },
  ratingText: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  availBadge: { marginTop: 12, backgroundColor: '#F0FDF4', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  availText: { fontSize: 10, fontWeight: '800', color: '#16a34a', letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#0B1C5A', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  statValue: { fontSize: 18, fontWeight: '900', color: '#0B1C5A' },
  statLabel: { fontSize: 10, fontWeight: '700', color: '#8E9CB2', marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 18, shadowColor: '#0B1C5A', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#0B1C5A', letterSpacing: 0.5, marginBottom: 12 },
  bodyText: { fontSize: 13, color: '#6B7280', lineHeight: 21 },
  chip: { backgroundColor: '#EEF1FB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontSize: 11, fontWeight: '700', color: '#0B1C5A' },
  price: { fontSize: 17, fontWeight: '900', color: '#0B1C5A' },
  ctaBtn: { backgroundColor: '#0B1C5A', borderRadius: 14, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  ctaBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

