import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DRUG_DETAILS: Record<string, {
  name: string; brand: string; nafdac: string; batch: string; expiry: string;
  manufacturer: string; category: string; strength: string; status: string;
  activeIngredient: string; indications: string[]; dosage: string;
  sideEffects: string[]; contraindications: string[]; storage: string;
}> = {
  default: {
    name: 'Paracetamol BP', brand: 'Emzor', nafdac: 'A4-0118', batch: 'BT-882219',
    expiry: 'December 2026', manufacturer: 'Emzor Pharmaceutical Industries Ltd.',
    category: 'Analgesic / Antipyretic', strength: '500mg Tablets', status: 'Authentic',
    activeIngredient: 'Paracetamol (Acetaminophen) 500mg',
    indications: ['Mild to moderate pain relief', 'Fever reduction', 'Headache and migraine'],
    dosage: '1â€“2 tablets every 4â€“6 hours. Max 8 tablets per day. Do not exceed recommended dose.',
    sideEffects: ['Nausea (rare)', 'Skin rash (rare)', 'Liver damage with overdose'],
    contraindications: ['Known hypersensitivity to paracetamol', 'Severe liver impairment'],
    storage: 'Store below 30Â°C in a cool, dry place. Keep out of reach of children.',
  },
  MOCK_NAFDAC_12345: {
    name: 'Amoxicillin', brand: 'Ampiclox', nafdac: 'B3-2240', batch: 'BT-441120',
    expiry: 'March 2027', manufacturer: 'GlaxoSmithKline Consumer Nigeria Plc.',
    category: 'Antibiotic (Penicillin group)', strength: '500mg Capsules', status: 'Authentic',
    activeIngredient: 'Amoxicillin (as Amoxicillin Trihydrate) 500mg',
    indications: ['Bacterial infections', 'Respiratory tract infections', 'Urinary tract infections'],
    dosage: '250â€“500mg every 8 hours. Complete full course even if feeling better.',
    sideEffects: ['Diarrhoea', 'Nausea', 'Skin rash', 'Allergic reaction (rare)'],
    contraindications: ['Penicillin allergy', 'Severe renal impairment', 'Infectious mononucleosis'],
    storage: 'Store below 25Â°C. Keep away from moisture and direct sunlight.',
  },
};

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <View style={{
      backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 14,
      shadowColor: '#0B1C5A', shadowOpacity: 0.04, shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 }, elevation: 2,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#EEF1FB', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon as any} size={17} color="#0B1C5A" />
        </View>
        <Text style={{ fontSize: 13, fontWeight: '800', color: '#0B1C5A', letterSpacing: 0.5 }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
      <Text style={{ fontSize: 13, color: '#8E9CB2', fontWeight: '600', flex: 1 }}>{label}</Text>
      <Text style={{ fontSize: 13, color: '#0B1C5A', fontWeight: '700', flex: 1.5, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View style={{ gap: 7 }}>
      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0B1C5A', marginTop: 6 }} />
          <Text style={{ fontSize: 13, color: '#374151', lineHeight: 20, flex: 1 }}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export default function DrugDetailsScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const drug = DRUG_DETAILS[code ?? ''] ?? DRUG_DETAILS.default;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}
        >
          <Ionicons name="chevron-back" size={22} color="#0B1C5A" />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: '#0B1C5A', marginRight: 40 }}>Drug Details</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingTop: 8 }}>
        {/* Title Hero */}
        <View style={{
          backgroundColor: '#0B1C5A', borderRadius: 24, padding: 20, marginBottom: 16,
          flexDirection: 'row', alignItems: 'center', gap: 16,
        }}>
          <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="medkit" size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#fff' }}>{drug.name}</Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{drug.brand} Â· {drug.strength}</Text>
            <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ backgroundColor: '#16a34a', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 }}>âœ“ {drug.status.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        </View>

        <SectionCard title="Product Information" icon="document-text-outline">
          <InfoRow label="NAFDAC No." value={drug.nafdac} />
          <InfoRow label="Batch No." value={drug.batch} />
          <InfoRow label="Expiry Date" value={drug.expiry} />
          <InfoRow label="Category" value={drug.category} />
          <View style={{ paddingVertical: 8 }}>
            <Text style={{ fontSize: 13, color: '#8E9CB2', fontWeight: '600', marginBottom: 4 }}>Manufacturer</Text>
            <Text style={{ fontSize: 13, color: '#0B1C5A', fontWeight: '700', lineHeight: 20 }}>{drug.manufacturer}</Text>
          </View>
        </SectionCard>

        <SectionCard title="Active Ingredient" icon="flask-outline">
          <Text style={{ fontSize: 13, color: '#374151', lineHeight: 20 }}>{drug.activeIngredient}</Text>
        </SectionCard>

        <SectionCard title="Indications (Uses)" icon="list-outline">
          <BulletList items={drug.indications} />
        </SectionCard>

        <SectionCard title="Dosage & Administration" icon="timer-outline">
          <Text style={{ fontSize: 13, color: '#374151', lineHeight: 21 }}>{drug.dosage}</Text>
        </SectionCard>

        <SectionCard title="Side Effects" icon="alert-circle-outline">
          <BulletList items={drug.sideEffects} />
        </SectionCard>

        <SectionCard title="Contraindications" icon="close-circle-outline">
          <BulletList items={drug.contraindications} />
        </SectionCard>

        <SectionCard title="Storage" icon="cube-outline">
          <Text style={{ fontSize: 13, color: '#374151', lineHeight: 21 }}>{drug.storage}</Text>
        </SectionCard>

        {/* Disclaimer */}
        <View style={{ backgroundColor: '#FFF8E7', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#FDE68A', marginBottom: 8 }}>
          <Text style={{ fontSize: 11, color: '#92400E', lineHeight: 18, textAlign: 'center' }}>
            âš ï¸ This information is for reference only. Always consult a licensed pharmacist or physician before taking any medication.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

