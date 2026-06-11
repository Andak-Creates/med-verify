import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
  { id: '0', role: 'pharmacist', text: "Hello! I'm Pharm. Dr. Adaeze Okafor. I can see your booking details. How can I help you today?", time: now() },
];

export default function ConsultationLiveScreen() {
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>(INITIAL);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Professional Pharmacist Photo
  const pharmAvatar = "https://images.unsplash.com/photo-1594824436998-dd40e4f3a763?w=200&q=80";

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
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowPharm]}>
        {!isUser && (
          <Image source={{ uri: pharmAvatar }} style={styles.msgAvatar} />
        )}
        <View style={styles.bubbleCol}>
          <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubblePharm]}>
            <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextPharm]}>
              {item.text}
            </Text>
          </View>
          <Text style={[styles.timeLabel, { textAlign: isUser ? 'right' : 'left' }]}>
            {item.time}
          </Text>
        </View>
        {isUser && (
          <View style={styles.userAvatarPlaceholder}>
            <Ionicons name="person" size={18} color="#fff" />
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
          <Image source={{ uri: pharmAvatar }} style={styles.headerAvatar} />
          <View>
            <Text style={styles.pharmName}>Dr. Adaeze Okafor</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.liveLabel}>Live Session • {fmt}</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity onPress={() => router.push('/(user)/pharmacy/consultation-call' as any)} style={styles.actionBtn}>
            <Ionicons name="call" size={18} color="#0B1C5A" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(user)/pharmacy/consultation-call' as any)} style={styles.actionBtn}>
            <Ionicons name="videocam" size={18} color="#0B1C5A" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/(user)/pharmacy' as any)} style={styles.endBtn}>
            <Text style={styles.endBtnText}>End</Text>
          </TouchableOpacity>
        </View>
      </View>

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
              <Image source={{ uri: pharmAvatar }} style={styles.msgAvatar} />
              <View style={[styles.bubble, styles.bubblePharm, { paddingVertical: 14, paddingHorizontal: 16 }]}>
                <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                  {[0,1,2].map(i => <View key={i} style={[styles.typingDot, { opacity: 0.4 + i * 0.2 }]} />)}
                </View>
              </View>
            </View>
          ) : null}
        />

        {/* Input */}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.92)', borderBottomWidth: 1, borderBottomColor: '#F1F3F9',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E2E8F0' },
  pharmName: { fontSize: 16, fontWeight: '800', color: '#0B1C5A' },
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
});
