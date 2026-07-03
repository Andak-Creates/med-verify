import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCall } from '@/context/CallContext';

/**
 * Global "incoming call" ringing screen. Renders above whatever screen the
 * user is currently on (e.g. the chat) whenever a `call_offer` arrives and
 * the audio-call screen isn't already showing its own ringing UI.
 */
export function IncomingCallOverlay() {
  const router = useRouter();
  const { activeConsultation, callStatus, isCallScreenActive, answerCall, hangUp } = useCall();

  if (!activeConsultation) return null;

  const visible = callStatus === 'ringing' && !isCallScreenActive;
  const counterpartRoleLabel = activeConsultation.role === 'USER' ? 'Pharmacist' : 'Patient';

  const handleAnswer = async () => {
    await answerCall();
    const pathname =
      activeConsultation.role === 'PHARMACIST' ? '/(pharmacist)/call' : '/(user)/pharmacy/consultation-call';
    router.push({ pathname, params: { id: activeConsultation.id } } as any);
  };

  const handleDecline = () => {
    hangUp();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleDecline}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {activeConsultation.counterpartImage ? (
            <Image source={{ uri: activeConsultation.counterpartImage }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Ionicons name="medical" size={36} color="#CBD5E1" />
            </View>
          )}
          <Text style={styles.name}>{activeConsultation.counterpartName}</Text>
          <Text style={styles.role}>{counterpartRoleLabel}</Text>
          <Text style={styles.subtitle}>Incoming audio call…</Text>

          <View style={styles.actions}>
            <View style={styles.actionItem}>
              <TouchableOpacity style={styles.declineBtn} onPress={handleDecline}>
                <Ionicons name="call" size={26} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
              </TouchableOpacity>
              <Text style={[styles.actionLabel, { color: '#EF4444' }]}>DECLINE</Text>
            </View>
            <View style={styles.actionItem}>
              <TouchableOpacity style={styles.answerBtn} onPress={handleAnswer}>
                <Ionicons name="call" size={26} color="#fff" />
              </TouchableOpacity>
              <Text style={[styles.actionLabel, { color: '#22C55E' }]}>ANSWER</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  avatar: { width: 88, height: 88, borderRadius: 44, marginBottom: 16 },
  avatarFallback: { backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 18, fontWeight: '700', color: '#fff' },
  role: { fontSize: 13, color: '#64748B', marginTop: 2, marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#94A3B8', marginBottom: 28 },
  actions: { flexDirection: 'row', gap: 48 },
  actionItem: { alignItems: 'center', gap: 8 },
  declineBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
});
