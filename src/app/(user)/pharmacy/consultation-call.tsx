import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConsultationCallScreen() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);


  // Pulsing animation for the pharmacist avatar
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/(user)/pharmacy/consultation-live?callActive=true' as any)}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Top Label */}
        <View style={styles.topLabel}>
          <Ionicons name="shield-checkmark" size={14} color="#6EE7B7" />
          <Text style={styles.topLabelText}>Secure Medical Consultation</Text>
        </View>

        {/* Pharmacist Avatar + Active badge */}
        <View style={styles.centerSection}>
          <Animated.View style={[styles.avatarRing, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.avatarInner}>
              <Ionicons name="medical" size={54} color="#CBD5E1" />
            </View>
          </Animated.View>

          {/* Active badge */}
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>ACTIVE</Text>
          </View>

          <Text style={styles.pharmacistName}>Pharm. Dr. Adaeze Okafor</Text>
          <Text style={styles.pharmacistRole}>Clinical Pharmacist · PharmD</Text>
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
          <View style={styles.secureRow}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#64748B" />
            <Text style={styles.secureText}>SECURE AUDIO CALL</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsWrapper}>
          <View style={styles.controls}>
            {/* Mute */}
            <View style={styles.controlItem}>
              <TouchableOpacity
                style={[styles.controlBtn, muted && styles.controlBtnActive]}
                onPress={() => setMuted(!muted)}
              >
                <Ionicons name={muted ? 'mic-off' : 'mic'} size={24} color={muted ? '#0B1C5A' : '#1E293B'} />
              </TouchableOpacity>
              <Text style={styles.controlLabel}>{muted ? 'Unmute' : 'Mute'}</Text>
            </View>

            {/* Speaker */}
            <View style={styles.controlItem}>
              <TouchableOpacity
                style={[styles.controlBtn, speaker && styles.controlBtnActive]}
                onPress={() => setSpeaker(!speaker)}
              >
                <Ionicons name={speaker ? 'volume-high' : 'volume-mute'} size={24} color={speaker ? '#0B1C5A' : '#1E293B'} />
              </TouchableOpacity>
              <Text style={styles.controlLabel}>Speaker</Text>
            </View>

            {/* End Call */}
            <View style={styles.controlItem}>
              <TouchableOpacity
                style={styles.endBtn}
                onPress={() => router.replace('/(user)/pharmacy/post-review' as any)}
              >
                <Ionicons name="call" size={26} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
              </TouchableOpacity>
              <Text style={[styles.controlLabel, { color: '#EF4444', fontWeight: '800' }]}>END</Text>
            </View>

          </View>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  safeArea: { flex: 1 },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  topLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6EE7B7',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  avatarRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -20,
  },
  avatarInner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activeBadge: {
    backgroundColor: '#0B1C5A',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
    zIndex: 1,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  pharmacistName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
  },
  pharmacistRole: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 14,
  },
  timerText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#38BDF8',
    letterSpacing: 2,
    marginBottom: 10,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secureText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 1.5,
  },
  controlsWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  controlItem: { alignItems: 'center', gap: 8 },
  controlBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnActive: { backgroundColor: '#E0F2FE' },
  endBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
