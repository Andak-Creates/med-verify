import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Msg = { id: string; role: 'user' | 'pharmacist'; text: string; time: string };

function now() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const INITIAL: Msg[] = [
  { id: '0', role: 'user', text: "Hi doctor, I wanted to ask about the dosage for the medication.", time: now() },
];

export default function ConsultationLiveScreen() {
  const { isPast, callActive } = useLocalSearchParams();
  const isPastSession = isPast === 'true';
  const isCallActive = callActive === 'true';
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>(INITIAL);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const callBannerBlink = useRef(new Animated.Value(1)).current;

  // Patient Photo
  const patientAvatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80";

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Pulse animation for live dot
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.5, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Call banner blink animation
  useEffect(() => {
    if (!isCallActive) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(callBannerBlink, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        Animated.timing(callBannerBlink, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [isCallActive]);

  const fmt = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;

  const send = () => {
    const txt = input.trim();
    if (!txt) return;
    const userMsg: Msg = { id: Date.now().toString(), role: 'pharmacist', text: txt, time: now() };
    setMsgs(p => [...p, userMsg]);
    setInput('');
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const renderMsg = ({ item }: { item: Msg }) => {
    const isPharmacist = item.role === 'pharmacist';
    return (
      <View style={[styles.messageRow, isPharmacist ? styles.messageRowUser : styles.messageRowPharm]}>
        {!isPharmacist && (
          <Image source={{ uri: patientAvatar }} style={styles.msgAvatar} />
        )}
        <View style={styles.bubbleCol}>
          <View style={[styles.bubble, isPharmacist ? styles.bubbleUser : styles.bubblePharm]}>
            <Text style={[styles.bubbleText, isPharmacist ? styles.bubbleTextUser : styles.bubbleTextPharm]}>
              {item.text}
            </Text>
          </View>
          <Text style={[styles.timeLabel, { textAlign: isPharmacist ? 'right' : 'left' }]}>
            {item.time}
          </Text>
        </View>
        {isPharmacist && (
          <View style={styles.userAvatarPlaceholder}>
            <Ionicons name="medical" size={18} color="#fff" />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={{ uri: patientAvatar }} style={styles.headerAvatar} />
          <View>
            <Text style={styles.patientName}>Adewale Grace</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
              {!isPastSession && <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />}
              <Text style={[styles.liveLabel, isPastSession && { color: '#6B7280' }]}>{isPastSession ? 'Completed Session' : `Live Session • ${fmt}`}</Text>
            </View>
          </View>
        </View>
        {!isPastSession && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity onPress={() => router.push('/(pharmacist)/call' as any)} style={styles.actionBtn}>
              <Ionicons name="call" size={18} color="#0B1C5A" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace('/(pharmacist)/consults/post-summary' as any)} style={styles.endBtn}>
              <Text style={styles.endBtnText}>End</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Call In Progress Banner */}
      {isCallActive && (
        <TouchableOpacity
          style={styles.callBanner}
          onPress={() => router.push('/(pharmacist)/call' as any)}
          activeOpacity={0.85}
        >
          <Animated.View style={[styles.callBannerDot, { opacity: callBannerBlink }]} />
          <Ionicons name="call" size={14} color="#fff" />
          <Text style={styles.callBannerText}>Audio call in progress — tap to return</Text>
          <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        <FlatList
          ref={flatRef}
          data={msgs}
          keyExtractor={i => i.id}
          renderItem={renderMsg}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
          ListFooterComponent={typing ? (
            <View style={[styles.messageRow, styles.messageRowPharm]}>
              <Image source={{ uri: patientAvatar }} style={styles.msgAvatar} />
              <View style={[styles.bubble, styles.bubblePharm, { paddingVertical: 14, paddingHorizontal: 16 }]}>
                <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                  {[0,1,2].map(i => <View key={i} style={[styles.typingDot, { opacity: 0.4 + i * 0.2 }]} />)}
                </View>
              </View>
            </View>
          ) : null}
        />

        {/* Input */}
        {!isPastSession && (
          <View style={styles.inputBar}>
            <View style={styles.inputWrap}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Type your message..."
                placeholderTextColor="#9CA3AF"
                multiline
                style={styles.textInput}
              />
              <Pressable 
                onPress={send} 
                disabled={!input.trim()} 
                style={[styles.sendBtn, !input.trim() && { backgroundColor: '#E5E7EB' }]}
              >
                <Ionicons name="send" size={16} color={input.trim() ? '#fff' : '#9CA3AF'} />
              </Pressable>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.92)', borderBottomWidth: 1, borderBottomColor: '#F1F3F9',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E2E8F0' },
  patientName: { fontSize: 16, fontWeight: '800', color: '#0B1C5A' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  liveLabel: { fontSize: 12, color: '#ef4444', fontWeight: '700' },
  endBtn: { backgroundColor: '#FEF2F2', borderRadius: 14, paddingHorizontal: 16, height: 38, alignItems: 'center', justifyContent: 'center' },
  endBtnText: { color: '#dc2626', fontWeight: '800', fontSize: 13 },
  actionBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EEF1FB', alignItems: 'center', justifyContent: 'center' },
  
  messageList: { paddingHorizontal: 16, paddingVertical: 20, gap: 12, flexGrow: 1 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginVertical: 4 },
  messageRowUser: { justifyContent: 'flex-end' },
  messageRowPharm: { justifyContent: 'flex-start' },
  msgAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#E2E8F0', flexShrink: 0 },
  userAvatarPlaceholder: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#0B1C5A', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  
  bubbleCol: { maxWidth: '72%', gap: 3 },
  bubble: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12 },
  bubbleUser: { backgroundColor: '#0B1C5A', borderBottomRightRadius: 4 },
  bubblePharm: { backgroundColor: '#fff', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  bubbleTextUser: { color: '#fff' },
  bubbleTextPharm: { color: '#1F2937' },
  timeLabel: { fontSize: 11, color: '#9CA3AF', paddingHorizontal: 4 },
  
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0B1C5A' },
  
  inputBar: {
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    backgroundColor: 'rgba(255,255,255,0.92)', borderTopWidth: 1, borderTopColor: '#F1F3F9',
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: '#F3F4F6', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 6, gap: 8,
  },
  textInput: {
    flex: 1, fontSize: 15, color: '#111827', maxHeight: 100, paddingTop: 6, paddingBottom: 6,
  },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#0B1C5A', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  callBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#16A34A',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  callBannerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  callBannerText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#fff' },
});
