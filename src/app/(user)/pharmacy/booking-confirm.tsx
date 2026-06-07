import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TYPE_LABELS: Record<string, { label: string; icon: string; price: string }> = {
  video: { label: 'Video Call', icon: 'videocam-outline', price: 'â‚¦2,500' },
  chat:  { label: 'Text Chat',  icon: 'chatbubble-ellipses-outline', price: 'â‚¦1,500' },
  phone: { label: 'Phone Call', icon: 'call-outline', price: 'â‚¦2,000' },
};

export default function BookingConfirmScreen() {
  const router = useRouter();
  const { day, time, type } = useLocalSearchParams<{ day: string; time: string; type: string }>();
  const info = TYPE_LABELS[type ?? 'video'] ?? TYPE_LABELS.video;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, damping: 10, stiffness: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const ref = `BK-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        {/* Animated checkmark */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 24 }}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark-circle" size={62} color="#16a34a" />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Text style={styles.title}>Booking Confirmed!</Text>
          <Text style={styles.subtitle}>
            Your consultation has been scheduled. You'll receive a reminder before the session.
          </Text>

          {/* Booking summary card */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Booking Details</Text>

            {[
              { label: 'Type',      value: info.label,    icon: info.icon },
              { label: 'Date',      value: day ?? 'â€”',    icon: 'calendar-outline' },
              { label: 'Time',      value: time ?? 'â€”',   icon: 'time-outline' },
              { label: 'Amount',    value: info.price,    icon: 'card-outline' },
              { label: 'Reference', value: ref,           icon: 'receipt-outline' },
            ].map((row, i, arr) => (
              <View key={row.label} style={[styles.row, i < arr.length - 1 && styles.rowBorder]}>
                <View style={styles.rowIcon}>
                  <Ionicons name={row.icon as any} size={15} color="#0B1C5A" />
                </View>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowValue}>{row.value}</Text>
              </View>
            ))}
          </View>

          {/* Join session button */}
          <TouchableOpacity
            onPress={() => router.replace('/(user)/pharmacy/consultation-live' as any)}
            style={styles.primaryBtn}
          >
            <Ionicons name={info.icon as any} size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Join Session Now</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(user)/home' as any)} style={{ marginTop: 14 }}>
            <Text style={styles.secondaryLink}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  checkCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#F0FDF4', borderWidth: 3, borderColor: '#BBF7D0',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#16a34a', shadowOpacity: 0.2, shadowRadius: 18, elevation: 5,
  },
  title: { fontSize: 26, fontWeight: '900', color: '#0B1C5A', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  card: {
    width: '100%', backgroundColor: '#fff', borderRadius: 22, padding: 18,
    shadowColor: '#0B1C5A', shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, marginBottom: 24,
  },
  cardHeading: { fontSize: 11, fontWeight: '800', color: '#8E9CB2', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rowIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#EEF1FB', alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 13, color: '#6B7280', fontWeight: '600' },
  rowValue: { fontSize: 13, fontWeight: '800', color: '#0B1C5A', textAlign: 'right', maxWidth: '50%' },
  primaryBtn: {
    width: '100%', backgroundColor: '#0B1C5A', borderRadius: 16, height: 54,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#0B1C5A', shadowOpacity: 0.25, shadowRadius: 10, elevation: 5,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryLink: { fontSize: 13, fontWeight: '700', color: '#8E9CB2', letterSpacing: 0.5 },
});

