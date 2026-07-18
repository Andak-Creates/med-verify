import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCall } from '@/context/CallContext';
import { RemoteAudioPlayer } from './RemoteAudioPlayer';

interface AudioCallScreenProps {
  consultationId: string | undefined;
  counterpartName: string;
  counterpartRole: string;
  counterpartImage?: string | null;
}

/**
 * WebRTC audio call over the consultation's Socket.io signaling relay. The
 * ICE servers come from the backend's `join_session` ack — they are never
 * hardcoded here.
 */
export function AudioCallScreen({
  consultationId,
  counterpartName,
  counterpartRole,
  counterpartImage,
}: AudioCallScreenProps) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);

  const {
    activeConsultation,
    callStatus,
    error,
    webrtcSupported,
    startCall,
    answerCall,
    hangUp,
    setMicEnabled,
    setCallScreenActive,
    remoteStream,
  } = useCall();

  // Let the global incoming-call overlay know this screen is showing its own
  // ringing UI, so the two don't both appear at once.
  useEffect(() => {
    setCallScreenActive(true);
    return () => setCallScreenActive(false);
  }, [setCallScreenActive]);

  // Caller flow: arriving here with an idle signaling state means this
  // device just tapped the call icon — kick off the call automatically.
  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (autoStartedRef.current) return;
    if (!activeConsultation || activeConsultation.id !== consultationId) return;
    if (callStatus !== 'idle') return;
    if (!webrtcSupported) return;
    if (activeConsultation.iceServers.length === 0) return;
    autoStartedRef.current = true;
    startCall();
  }, [activeConsultation, consultationId, callStatus, webrtcSupported, startCall]);

  const iceServers = activeConsultation?.iceServers ?? [];

  // Call timer while connected.
  useEffect(() => {
    if (callStatus !== 'in_call') return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [callStatus]);

  // Pulsing animation for the avatar.
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const navigateToChat = () => {
    if (activeConsultation) {
      const pathname =
        activeConsultation.role === 'PHARMACIST'
          ? '/(pharmacist)/consults/consultation-live'
          : '/(user)/pharmacy/consultation-live';
      router.replace({ pathname, params: { id: activeConsultation.id } } as any);
    } else {
      router.back();
    }
  };

  // Leave the screen shortly after the call ends.
  useEffect(() => {
    if (callStatus !== 'ended') return;
    const t = setTimeout(() => {
      navigateToChat();
    }, 1200);
    return () => clearTimeout(t);
  }, [callStatus, router, activeConsultation]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleEnd = () => {
    hangUp();
    navigateToChat();
  };

  const statusText: Record<string, string> = {
    idle: 'Ready to call',
    calling: 'Calling…',
    ringing: 'Incoming call…',
    connecting: 'Connecting…',
    in_call: formatTime(seconds),
    ended: 'Call ended',
  };

  const displayError = error;

  return (
    <View style={styles.container}>
      <RemoteAudioPlayer stream={remoteStream} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Back button — returns to the chat without ending the call */}
        <TouchableOpacity style={styles.backBtn} onPress={navigateToChat}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Top Label */}
        <View style={styles.topLabel}>
          <Ionicons name="shield-checkmark" size={14} color="#6EE7B7" />
          <Text style={styles.topLabelText}>Secure Medical Consultation</Text>
        </View>

        {/* Avatar + status */}
        <View style={styles.centerSection}>
          <Animated.View style={[styles.avatarRing, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.avatarInner}>
              {counterpartImage ? (
                <Image source={{ uri: counterpartImage }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="medical" size={54} color="#CBD5E1" />
              )}
            </View>
          </Animated.View>

          <View style={[styles.activeBadge, callStatus !== 'in_call' && { backgroundColor: '#475569' }]}>
            <Text style={styles.activeBadgeText}>
              {callStatus === 'in_call' ? 'ACTIVE' : callStatus.toUpperCase().replace('_', ' ')}
            </Text>
          </View>

          <Text style={styles.pharmacistName}>{counterpartName}</Text>
          <Text style={styles.pharmacistRole}>{counterpartRole}</Text>
          <Text style={styles.timerText}>{statusText[callStatus]}</Text>
          <View style={styles.secureRow}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#64748B" />
            <Text style={styles.secureText}>SECURE AUDIO CALL</Text>
          </View>

          {displayError && <Text style={styles.errorText}>{displayError}</Text>}
          {!webrtcSupported && !displayError && (
            <Text style={styles.errorText}>
              Audio calls require a development build with WebRTC support on this device.
            </Text>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controlsWrapper}>
          {callStatus === 'idle' ? (
            <TouchableOpacity
              style={[styles.startCallBtn, (!webrtcSupported || iceServers.length === 0) && { opacity: 0.6 }]}
              onPress={startCall}
              disabled={!webrtcSupported || iceServers.length === 0}
            >
              {iceServers.length === 0 && !displayError ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="call" size={22} color="#fff" />
                  <Text style={styles.startCallText}>Start Audio Call</Text>
                </>
              )}
            </TouchableOpacity>
          ) : callStatus === 'ringing' ? (
            <View style={styles.controls}>
              <View style={styles.controlItem}>
                <TouchableOpacity style={styles.answerBtn} onPress={answerCall} disabled={!webrtcSupported}>
                  <Ionicons name="call" size={26} color="#fff" />
                </TouchableOpacity>
                <Text style={[styles.controlLabel, { color: '#22C55E', fontWeight: '800' }]}>ANSWER</Text>
              </View>
              <View style={styles.controlItem}>
                <TouchableOpacity style={styles.endBtn} onPress={handleEnd}>
                  <Ionicons name="call" size={26} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
                </TouchableOpacity>
                <Text style={[styles.controlLabel, { color: '#EF4444', fontWeight: '800' }]}>DECLINE</Text>
              </View>
            </View>
          ) : (
            <View style={styles.controls}>
              {/* Mute */}
              <View style={styles.controlItem}>
                <TouchableOpacity
                  style={[styles.controlBtn, muted && styles.controlBtnActive]}
                  onPress={() =>
                    setMuted((m) => {
                      setMicEnabled(m); // previous muted state → re-enable when unmuting
                      return !m;
                    })
                  }
                >
                  <Ionicons name={muted ? 'mic-off' : 'mic'} size={24} color={muted ? '#0B1C5A' : '#1E293B'} />
                </TouchableOpacity>
                <Text style={styles.controlLabel}>{muted ? 'Unmute' : 'Mute'}</Text>
              </View>

              {/* End Call */}
              <View style={styles.controlItem}>
                <TouchableOpacity style={styles.endBtn} onPress={handleEnd}>
                  <Ionicons name="call" size={26} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
                </TouchableOpacity>
                <Text style={[styles.controlLabel, { color: '#EF4444', fontWeight: '800' }]}>END</Text>
              </View>
            </View>
          )}
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
    paddingHorizontal: 24,
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
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
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
  errorText: {
    marginTop: 16,
    fontSize: 13,
    color: '#FCA5A5',
    textAlign: 'center',
    lineHeight: 19,
  },
  controlsWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  startCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#22C55E',
    borderRadius: 28,
    paddingVertical: 18,
  },
  startCallText: { color: '#fff', fontSize: 16, fontWeight: '800' },
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
  answerBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
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
