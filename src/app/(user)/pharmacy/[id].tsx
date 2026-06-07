import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PHARMACISTS: Record<string, {
  name: string; title: string; specialty: string; rating: number;
  patients: string; experience: string; bio: string;
  tags: string[]; image: string; consultations: { icon: string; title: string; sub: string; price: string }[];
}> = {
  '1': {
    name: 'Dr. Julian Okoro',
    title: 'Clinical Pharmacist',
    specialty: 'Specializing in clinical drug management and pediatric pharmaceutical care with over 12 years of verified practice.',
    rating: 4.9,
    patients: '1.2k',
    experience: '12y',
    bio: 'Dr. Okoro is a dedicated consultant known for precision in medication therapy management. He bridges the gap between diagnosis and recovery by ensuring patients understand their prescriptions and managing potential drug-drug interactions effectively.',
    tags: ['PCN Certified', 'Clinical Pharmacist'],
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80',
    consultations: [
      { icon: 'link', title: 'Drug Inquiry', sub: '15-min Quick Call', price: '₦3,000' },
      { icon: 'medkit', title: 'Full Health Review', sub: '45-min Deep Dive', price: '₦10,000' },
    ],
  },
  '2': {
    name: 'Dr. Marcus Chen',
    title: 'Geriatric Specialist',
    specialty: 'Expert in Cardiology and elderly patient pharmaceutical management with over 10 years of practice.',
    rating: 4.8,
    patients: '980',
    experience: '10y',
    bio: 'Dr. Chen brings deep expertise in managing complex multi-drug regimens for older adults. He works closely with cardiologists to optimize medication protocols and reduce adverse drug events in geriatric care.',
    tags: ['PCN Certified', 'Geriatric Specialist'],
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80',
    consultations: [
      { icon: 'heart', title: 'Cardiac Medication Review', sub: '20-min Consultation', price: '₦4,500' },
      { icon: 'medkit', title: 'Comprehensive Geriatric Assessment', sub: '60-min Session', price: '₦12,000' },
    ],
  },
};

export default function PharmacistProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const pharm = PHARMACISTS[id ?? '1'] ?? PHARMACISTS['1'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0B1C5A" />
        </Pressable>
        <Text style={styles.logoText}>MedVerify</Text>
        <Pressable style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={20} color="#0B1C5A" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Doctor Hero ─────────────────────────── */}
        <View style={styles.heroSection}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: pharm.image }} style={styles.avatar} />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>
          </View>

          <Text style={styles.docName}>{pharm.name}</Text>

          <View style={styles.tagsRow}>
            {pharm.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.specialtyText}>{pharm.specialty}</Text>
        </View>

        {/* ── Stats Row ─────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="star-outline" size={22} color="#312E81" style={{ marginBottom: 6 }} />
            <Text style={styles.statValue}>{pharm.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={22} color="#312E81" style={{ marginBottom: 6 }} />
            <Text style={styles.statValue}>{pharm.patients}</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={22} color="#312E81" style={{ marginBottom: 6 }} />
            <Text style={styles.statValue}>{pharm.experience}</Text>
            <Text style={styles.statLabel}>Exp.</Text>
          </View>
        </View>

        {/* ── Professional Bio ──────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Professional Bio</Text>
          <Text style={styles.cardBody}>{pharm.bio}</Text>
        </View>

        {/* ── Available Consultations ───────────────── */}
        <Text style={styles.sectionHeading}>Available Consultations</Text>

        {pharm.consultations.map((c, i) => (
          <TouchableOpacity
            key={c.title}
            style={[styles.consultCard, i === 1 && styles.consultCardDark]}
            onPress={() => router.push({ pathname: '/(user)/pharmacy/book-consultation', params: { pharmacyId: id } } as any)}
          >
            <View style={[styles.consultIcon, i === 1 && styles.consultIconDark]}>
              <Ionicons name={c.icon as any} size={20} color={i === 1 ? '#fff' : '#312E81'} style={{ transform: [{ rotate: c.icon === 'link' ? '45deg' : '0deg' }] }} />
            </View>
            <View style={styles.consultInfo}>
              <Text style={[styles.consultTitle, i === 1 && styles.consultTitleDark]}>{c.title}</Text>
              <Text style={[styles.consultSub, i === 1 && styles.consultSubDark]}>{c.sub}</Text>
            </View>
            <Text style={[styles.consultPrice, i === 1 && styles.consultPriceDark]}>{c.price}</Text>

            <TouchableOpacity
              style={[styles.bookBtn, i === 1 && styles.bookBtnDark]}
              onPress={() => router.push({ pathname: '/(user)/pharmacy/book-consultation', params: { pharmacyId: id } } as any)}
            >
              <Text style={[styles.bookBtnText, i === 1 && styles.bookBtnTextDark]}>
                Book Now {i === 1 ? '🗓' : '→'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  verifiedBadge: { position: 'absolute', bottom: 2, right: 2, width: 26, height: 26, borderRadius: 13, backgroundColor: '#312E81', borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  docName: { fontSize: 24, fontWeight: '900', color: '#111827', marginBottom: 10, textAlign: 'center' },
  tagsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
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
  bookBtnTextDark: { color: '#fff' },
});
