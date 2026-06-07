import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerificationPendingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="time" size={60} color="#E5A800" />
        </View>
        
        <Text style={styles.title}>Verification Pending</Text>
        <Text style={styles.subtitle}>
          Thank you for applying. We are currently verifying your Pharmacist practicing license with the relevant authorities.
        </Text>

        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <Ionicons name="checkmark" size={16} color="#fff" />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Profile Created</Text>
              <Text style={styles.timelineSub}>Your details are saved.</Text>
            </View>
          </View>
          
          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={[styles.timelineIcon, { backgroundColor: '#E5A800' }]}>
              <Ionicons name="hourglass" size={14} color="#fff" />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>In Review</Text>
              <Text style={styles.timelineSub}>Usually takes 1-2 business days.</Text>
            </View>
          </View>

          <View style={[styles.timelineLine, { backgroundColor: '#F3F4F6' }]} />

          <View style={styles.timelineItem}>
            <View style={[styles.timelineIcon, { backgroundColor: '#E5E7EB' }]} />
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTitle, { color: '#8E9CB2' }]}>Approved</Text>
              <Text style={styles.timelineSub}>You will be notified via email.</Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity 
          style={styles.btnOutline} 
          onPress={() => router.replace('/(pharmacist)/dashboard' as any)}
        >
          <Text style={styles.btnOutlineText}>Preview Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { flex: 1, paddingHorizontal: 28, paddingTop: 60 },
  iconWrap: { width: 100, height: 100, borderRadius: 32, backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center', marginBottom: 32, shadowColor: '#E5A800', shadowOpacity: 0.15, shadowRadius: 15, elevation: 5 },
  title: { fontSize: 32, fontWeight: '900', color: '#0B1C5A', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#6B7280', lineHeight: 24, marginBottom: 40 },
  
  timeline: { paddingLeft: 10 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  timelineIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0B1C5A', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  timelineContent: { flex: 1, paddingTop: 2 },
  timelineTitle: { fontSize: 16, fontWeight: '800', color: '#0B1C5A', marginBottom: 4 },
  timelineSub: { fontSize: 13, color: '#6B7280' },
  timelineLine: { width: 2, height: 32, backgroundColor: '#0B1C5A', marginLeft: 13, marginVertical: 4 },

  spacer: { flex: 1 },
  btnOutline: { borderWidth: 2, borderColor: '#0B1C5A', borderRadius: 16, height: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  btnOutlineText: { color: '#0B1C5A', fontSize: 16, fontWeight: '800' },
});
