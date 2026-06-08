import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DrugVerificationResult } from '../../../lib/drugs';

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

function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
      <Text style={{ fontSize: 13, color: '#8E9CB2', fontWeight: '600', flex: 1 }}>{label}</Text>
      <Text style={{ fontSize: 13, color: '#0B1C5A', fontWeight: '700', flex: 1.5, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

export default function DrugDetailsScreen() {
  const router = useRouter();
  const { code, result } = useLocalSearchParams<{ code: string; result?: string }>();

  const drug = useMemo<DrugVerificationResult | null>(() => {
    if (!result) return null;
    try {
      return JSON.parse(result) as DrugVerificationResult;
    } catch {
      return null;
    }
  }, [result]);

  const isActive = drug?.registryStatus === 'Active';
  const statusColor = isActive ? '#16a34a' : '#d97706';
  const statusLabel = drug?.registryStatus ?? 'Unknown';

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
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#fff' }}>{drug?.productName ?? 'Unknown Product'}</Text>
            {drug?.strength ? (
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{drug.strength}</Text>
            ) : null}
            <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ backgroundColor: statusColor, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 }}>
                  {isActive ? '✓ ' : ''}{statusLabel.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <SectionCard title="Registry Information" icon="document-text-outline">
          <InfoRow label="NAFDAC No." value={drug?.nafdacNumber ?? code ?? null} />
          <InfoRow label="Category" value={drug?.category ?? null} />
          <InfoRow label="Form" value={drug?.form ?? null} />
          <InfoRow label="Approval Date" value={drug?.approvalDate ?? null} />
          <InfoRow label="Registry Status" value={drug?.registryStatus ?? null} />
          {drug?.manufacturer ? (
            <View style={{ paddingVertical: 8 }}>
              <Text style={{ fontSize: 13, color: '#8E9CB2', fontWeight: '600', marginBottom: 4 }}>Manufacturer</Text>
              <Text style={{ fontSize: 13, color: '#0B1C5A', fontWeight: '700', lineHeight: 20 }}>{drug.manufacturer}</Text>
            </View>
          ) : null}
        </SectionCard>

        {drug?.activeIngredients ? (
          <SectionCard title="Active Ingredients" icon="flask-outline">
            <Text style={{ fontSize: 13, color: '#374151', lineHeight: 20 }}>{drug.activeIngredients}</Text>
          </SectionCard>
        ) : null}

        {/* Disclaimer */}
        <View style={{ backgroundColor: '#FFF8E7', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#FDE68A', marginBottom: 8 }}>
          <Text style={{ fontSize: 11, color: '#92400E', lineHeight: 18, textAlign: 'center' }}>
            ⚠️ This shows the official NAFDAC registry record only. For dosage, side effects, and clinical guidance, always consult a licensed pharmacist or physician.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
