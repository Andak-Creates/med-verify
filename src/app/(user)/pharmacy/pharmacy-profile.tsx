import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PHARMACY = {
  name: 'MedPlus Pharmacy', address: '14 Adeola Odeku St, Victoria Island, Lagos',
  phone: '+234 812 345 6789', email: 'info@medplus.ng', rating: 4.9, reviews: 218,
  open: true, openHours: 'Monâ€“Sat: 8 AM â€“ 10 PM', badge: 'NAFDAC Certified',
  services: ['Drug Verification', 'Licensed Consultation', 'Home Delivery', 'Lab Tests', 'Telemedicine'],
  about: 'MedPlus Pharmacy is a fully licensed pharmacy registered with the Pharmacists Council of Nigeria (PCN) and NAFDAC. We specialise in drug verification, patient counselling, and quality pharmaceutical care.',
  pharmacists: [
    { name: 'Pharm. Dr. Adaeze Okafor', specialty: 'Clinical Pharmacist', available: true },
    { name: 'Pharm. Mr. Emeka Nwachukwu', specialty: 'Community Pharmacist', available: false },
  ],
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

export default function PharmacyProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0B1C5A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pharmacy Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="medical" size={36} color="#fff" />
          </View>
          <Text style={styles.heroName}>{PHARMACY.name}</Text>
          <Text style={styles.heroAddress}>{PHARMACY.address}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <StarRow rating={PHARMACY.rating} />
            <Text style={styles.ratingText}>{PHARMACY.rating} ({PHARMACY.reviews} reviews)</Text>
          </View>
          <View style={[styles.openBadge, !PHARMACY.open && { backgroundColor: '#F3F4F6' }]}>
            <Text style={[styles.openBadgeText, !PHARMACY.open && { color: '#6B7280' }]}>
              {PHARMACY.open ? 'â— OPEN NOW' : 'â—‹ CLOSED'}
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 16 }}>
          {/* Info */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Contact & Hours</Text>
            {[
              { icon: 'call-outline', text: PHARMACY.phone },
              { icon: 'mail-outline', text: PHARMACY.email },
              { icon: 'time-outline', text: PHARMACY.openHours },
              { icon: 'shield-checkmark-outline', text: PHARMACY.badge },
            ].map(row => (
              <View key={row.text} style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name={row.icon as any} size={15} color="#0B1C5A" />
                </View>
                <Text style={styles.infoText}>{row.text}</Text>
              </View>
            ))}
          </View>

          {/* About */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>{PHARMACY.about}</Text>
          </View>

          {/* Services */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Services Offered</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {PHARMACY.services.map(s => (
                <View key={s} style={styles.serviceChip}>
                  <Text style={styles.serviceChipText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Pharmacists */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Our Pharmacists</Text>
            {PHARMACY.pharmacists.map(p => (
              <View key={p.name} style={styles.pharmacistRow}>
                <View style={styles.pharmacistAvatar}>
                  <Ionicons name="person" size={20} color="#0B1C5A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pharmacistName}>{p.name}</Text>
                  <Text style={styles.pharmacistSpec}>{p.specialty}</Text>
                </View>
                <View style={[styles.availBadge, !p.available && { backgroundColor: '#F3F4F6' }]}>
                  <Text style={[styles.availText, !p.available && { color: '#9CA3AF' }]}>
                    {p.available ? 'Available' : 'Busy'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/(user)/pharmacy/book-consultation', params: { pharmacyId: '1' } } as any)}
            style={styles.ctaBtn}
          >
            <Ionicons name="calendar-outline" size={18} color="#fff" />
            <Text style={styles.ctaBtnText}>Book Consultation</Text>
          </TouchableOpacity>
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
  heroIcon: { width: 70, height: 70, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  heroName: { fontSize: 20, fontWeight: '900', color: '#fff', textAlign: 'center' },
  heroAddress: { fontSize: 12, color: 'rgba(255,255,255,0.65)', textAlign: 'center', marginTop: 6, lineHeight: 18 },
  ratingText: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  openBadge: { marginTop: 12, backgroundColor: '#F0FDF4', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  openBadgeText: { fontSize: 10, fontWeight: '800', color: '#16a34a', letterSpacing: 0.5 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 18, shadowColor: '#0B1C5A', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#0B1C5A', letterSpacing: 0.5, marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  infoIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: '#EEF1FB', alignItems: 'center', justifyContent: 'center' },
  infoText: { fontSize: 13, color: '#374151', fontWeight: '500', flex: 1 },
  aboutText: { fontSize: 13, color: '#6B7280', lineHeight: 21 },
  serviceChip: { backgroundColor: '#EEF1FB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  serviceChipText: { fontSize: 11, fontWeight: '700', color: '#0B1C5A' },
  pharmacistRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  pharmacistAvatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#EEF1FB', alignItems: 'center', justifyContent: 'center' },
  pharmacistName: { fontSize: 13, fontWeight: '800', color: '#0B1C5A' },
  pharmacistSpec: { fontSize: 11, color: '#8E9CB2', marginTop: 2 },
  availBadge: { backgroundColor: '#F0FDF4', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  availText: { fontSize: 10, fontWeight: '800', color: '#16a34a' },
  ctaBtn: { backgroundColor: '#0B1C5A', borderRadius: 16, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: '#0B1C5A', shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  ctaBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

