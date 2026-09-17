import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n';

export default function LanguageScreen() {
  const router = useRouter();
  const { language, setLanguage, languages } = useLanguage();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(user)/account' as any))}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color="#0B1C5A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Choose your preferred language for the app.</Text>

        <View style={styles.list}>
          {languages.map((lang) => {
            const active = lang.code === language;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.row, active && styles.rowActive]}
                onPress={() => setLanguage(lang.code)}
                activeOpacity={0.7}
              >
                <Text style={styles.flag}>{lang.flag}</Text>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowName}>{lang.label}</Text>
                  <Text style={styles.rowNative}>{lang.nativeName}</Text>
                </View>
                {active && <Ionicons name="checkmark-circle" size={22} color="#0B1C5A" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0B1C5A' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  subtitle: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 20 },
  list: { gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  rowActive: { borderColor: '#0B1C5A', backgroundColor: '#F5F7FF' },
  flag: { fontSize: 26 },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 16, fontWeight: '700', color: '#0B1C5A', marginBottom: 2 },
  rowNative: { fontSize: 13, color: '#6B7280' },
});
