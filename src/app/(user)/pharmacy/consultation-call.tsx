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

  // Chat Overlay State
  const [chatVisible, setChatVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2); // Simulated unread messages
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello, please can you confirm your symptoms?', sender: 'pharmacist', time: '02:00 PM' },
    { id: 2, text: 'I also noticed the image you attached has a blurry label.', sender: 'pharmacist', time: '02:01 PM' },
  ]);

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
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
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
                onPress={() => router.back()}
              >
                <Ionicons name="call" size={26} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
              </TouchableOpacity>
              <Text style={[styles.controlLabel, { color: '#EF4444', fontWeight: '800' }]}>END</Text>
            </View>

            {/* Chat */}
            <View style={styles.controlItem}>
              <TouchableOpacity
                style={[styles.controlBtn, chatVisible && styles.controlBtnActive]}
                onPress={() => {
                  setChatVisible(true);
                  setUnreadCount(0);
                }}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={24} color={chatVisible ? '#0B1C5A' : '#1E293B'} />
                {unreadCount > 0 && !chatVisible && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.controlLabel}>Chat</Text>
            </View>
          </View>
        </View>

        {/* Chat Overlay Modal */}
        <Modal visible={chatVisible} animationType="slide" transparent>
          <View style={styles.chatOverlay}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Session Chat</Text>
              <TouchableOpacity onPress={() => setChatVisible(false)}>
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.chatList}>
              {messages.map((m) => {
                const isMe = m.sender === 'user';
                return (
                  <View key={m.id} style={[styles.messageRow, isMe ? styles.messageMe : styles.messageThem]}>
                    <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                      <Text style={[styles.messageText, isMe ? styles.textMe : styles.textThem]}>{m.text}</Text>
                    </View>
                    <Text style={styles.messageTime}>{m.time}</Text>
                  </View>
                );
              })}
            </ScrollView>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={styles.chatInputRow}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Type a message..."
                  placeholderTextColor="#94A3B8"
                  value={messageInput}
                  onChangeText={setMessageInput}
                />
                <TouchableOpacity
                  style={styles.sendBtn}
                  onPress={() => {
                    if (messageInput.trim()) {
                      setMessages([...messages, { id: Date.now(), text: messageInput, sender: 'user', time: 'Now' }]);
                      setMessageInput('');
                    }
                  }}
                >
                  <Ionicons name="send" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
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
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  /* Chat Overlay */
  chatOverlay: {
    flex: 1,
    marginTop: 100,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  chatTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  chatList: { padding: 20, gap: 16, paddingBottom: 40 },
  messageRow: { maxWidth: '80%' },
  messageMe: { alignSelf: 'flex-end' },
  messageThem: { alignSelf: 'flex-start' },
  messageBubble: { padding: 14, borderRadius: 20 },
  bubbleMe: { backgroundColor: '#0B1C5A', borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: '#E2E8F0', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22 },
  textMe: { color: '#fff' },
  textThem: { color: '#1E293B' },
  messageTime: { fontSize: 11, color: '#94A3B8', marginTop: 4, alignSelf: 'flex-end' },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 34,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 15,
    marginRight: 10,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0B1C5A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
