import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
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
  { id: '0', role: 'pharmacist', text: "Hello! I'm Pharm. Dr. Adaeze Okafor. How can I help you today?", time: now() },
];

export default function ConsultationLiveScreen() {
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>(INITIAL);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

  const fmt = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;

  const REPLIES = [
    "That's a great question. Based on what you've described, I'd recommend consulting with your prescribing physician before making any changes to your medication.",
    "Paracetamol and Ibuprofen can be alternated safely if both are taken at proper intervals. However, avoid combining them simultaneously.",
    "Please ensure you complete the full antibiotic course even if symptoms improve. Stopping early can lead to antibiotic resistance.",
    "I recommend checking the NAFDAC registration number using the MedVerify scanner to confirm authenticity before purchase.",
  ];
  let replyIdx = 0;

  const send = () => {
    const txt = input.trim();
    if (!txt) return;
    const userMsg: Msg = { id: Date.now().toString(), role: 'user', text: txt, time: now() };
    setMsgs(p => [...p, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply: Msg = { id: (Date.now() + 1).toString(), role: 'pharmacist', text: REPLIES[replyIdx++ % REPLIES.length], time: now() };
      setMsgs(p => [...p, reply]);
      setTyping(false);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
    }, 1600);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const renderMsg = ({ item }: { item: Msg }) => {
    const isUser = item.role === 'user';
    return (
      <View style={{ alignItems: isUser ? 'flex-end' : 'flex-start', marginBottom: 12, paddingHorizontal: 16 }}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubblePharmacist]}>
          <Text style={{ color: isUser ? '#fff' : '#111827', fontSize: 14, lineHeight: 20 }}>{item.text}</Text>
        </View>
        <Text style={styles.timeLabel}>{item.time}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.pharmName}>Pharm. Dr. Adaeze Okafor</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.liveLabel}>Live Â· {fmt}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.replace('/(user)/pharmacy' as any)} style={styles.endBtn}>
          <Text style={styles.endBtnText}>End</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        <FlatList
          ref={flatRef}
          data={msgs}
          keyExtractor={i => i.id}
          renderItem={renderMsg}
          contentContainerStyle={{ paddingVertical: 12 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
          ListFooterComponent={typing ? (
            <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
              <View style={[styles.bubble, styles.bubblePharmacist]}>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  {[0,1,2].map(i => <View key={i} style={[styles.typingDot, { opacity: 0.4 + i * 0.2 }]} />)}
                </View>
              </View>
            </View>
          ) : null}
        />

        {/* Input */}
        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a messageâ€¦"
            placeholderTextColor="#9CA3AF"
            multiline
            style={styles.textInput}
          />
          <Pressable onPress={send} disabled={!input.trim()} style={[styles.sendBtn, !input.trim() && { backgroundColor: '#E5E7EB' }]}>
            <Ionicons name="arrow-up" size={20} color={input.trim() ? '#fff' : '#9CA3AF'} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0B1C5A', alignItems: 'center', justifyContent: 'center' },
  pharmName: { fontSize: 14, fontWeight: '800', color: '#0B1C5A' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16a34a' },
  liveLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  endBtn: { backgroundColor: '#FEF2F2', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: '#FECACA' },
  endBtnText: { color: '#dc2626', fontWeight: '700', fontSize: 13 },
  bubble: { maxWidth: '82%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleUser: { backgroundColor: '#0B1C5A', borderBottomRightRadius: 4 },
  bubblePharmacist: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F0F0F0' },
  timeLabel: { fontSize: 10, color: '#B0BAC9', marginTop: 4, marginHorizontal: 4 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0B1C5A' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  textInput: {
    flex: 1, backgroundColor: 'transparent', borderRadius: 18,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#111827',
    maxHeight: 90, borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0B1C5A', alignItems: 'center', justifyContent: 'center' },
});

