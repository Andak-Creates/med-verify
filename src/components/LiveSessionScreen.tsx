import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Alert,
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
import { useAuth } from '@/context/AuthContext';
import { useCall } from '@/context/CallContext';
import { useChatSession } from '@/hooks/useChatSession';
import * as consultationsService from '@/services/consultations.service';
import type { ChatMessage } from '@/types/api';

interface LiveSessionScreenProps {
  consultationId: string | undefined;
  isPast: boolean;
  counterpartName: string;
  counterpartImage: string | null;
  /** Where to go after the session ends (review/summary screen). */
  onSessionEnded: () => void;
  /** Opens the audio-call screen. Omitted for chat-only sessions. */
  onOpenCall?: () => void;
}

function formatMessageTime(isoDate: string) {
  return new Date(isoDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Shared live consultation UI for both the user and the pharmacist. Live
 * sessions run over Socket.io (join_session/send_message/new_message);
 * past sessions just render the persisted transcript via REST.
 */
export function LiveSessionScreen({
  consultationId,
  isPast,
  counterpartName,
  counterpartImage,
  onSessionEnded,
  onOpenCall,
}: LiveSessionScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [ending, setEnding] = useState(false);
  const flatRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const session = useChatSession(isPast ? undefined : consultationId);
  const { registerConsultation, clearConsultation } = useCall();

  // Register this consultation as the globally "active" one for call
  // signaling, so an incoming call rings even while staying on this screen.
  useEffect(() => {
    if (isPast || !consultationId) return;
    if (session.role == null || session.consultationType == null) return;
    if (session.consultationType === 'chat') return;

    registerConsultation({
      id: consultationId,
      iceServers: session.iceServers,
      consultationType: session.consultationType,
      role: session.role,
      counterpartName,
      counterpartImage,
    });

    return () => clearConsultation(consultationId);
  }, [
    isPast,
    consultationId,
    session.role,
    session.consultationType,
    session.iceServers,
    counterpartName,
    counterpartImage,
    registerConsultation,
    clearConsultation,
  ]);

  // Past sessions: load the transcript over REST only.
  const [pastMessages, setPastMessages] = useState<ChatMessage[]>([]);
  const [pastLoading, setPastLoading] = useState(isPast);
  const [pastError, setPastError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPast || !consultationId) return;
    let cancelled = false;
    (async () => {
      try {
        const history = await consultationsService.getMessages(consultationId);
        if (!cancelled) setPastMessages(history);
      } catch {
        if (!cancelled) setPastError('Could not load the session transcript.');
      } finally {
        if (!cancelled) setPastLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isPast, consultationId]);

  // Session timer while live.
  useEffect(() => {
    if (isPast || session.sessionEnded) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [isPast, session.sessionEnded]);

  // Pulse animation for the live dot.
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.5, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulseAnim]);

  // When the other side ends the session, hand off to the review screen.
  useEffect(() => {
    if (session.sessionEnded) {
      onSessionEnded();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.sessionEnded]);

  const messages = isPast ? pastMessages : session.messages;

  const fmt = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    try {
      await session.sendMessage(text);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
    } catch {
      // Error is surfaced via session.error; restore the draft so nothing is lost.
      setInput(text);
    }
  };

  const handleEnd = async () => {
    setEnding(true);
    try {
      await session.endSession();
      onSessionEnded();
    } catch (err) {
      Alert.alert(
        'Could not end session',
        err instanceof Error ? err.message : 'Please try again.',
      );
    } finally {
      setEnding(false);
    }
  };

  const canCall =
    !isPast &&
    Boolean(onOpenCall) &&
    session.consultationType != null &&
    session.consultationType !== 'chat';

  const statusLabel = isPast
    ? 'Completed Session'
    : !session.isConnected
      ? 'Reconnecting…'
      : session.isJoining
        ? 'Joining session…'
        : session.participantOnline
          ? `Live Session • ${fmt}`
          : `Waiting for ${counterpartName.split(' ')[0]} • ${fmt}`;

  const renderMsg = ({ item }: { item: ChatMessage }) => {
    const isMine = item.senderId === user?.id;
    return (
      <View style={[styles.messageRow, isMine ? styles.messageRowUser : styles.messageRowPharm]}>
        {!isMine &&
          (counterpartImage ? (
            <Image source={{ uri: counterpartImage }} style={styles.msgAvatar} />
          ) : (
            <View style={[styles.msgAvatar, styles.avatarFallback]}>
              <Ionicons name="person" size={16} color="#0B1C5A" />
            </View>
          ))}
        <View style={styles.bubbleCol}>
          <View style={[styles.bubble, isMine ? styles.bubbleUser : styles.bubblePharm]}>
            <Text style={[styles.bubbleText, isMine ? styles.bubbleTextUser : styles.bubbleTextPharm]}>
              {item.message}
            </Text>
          </View>
          <Text style={[styles.timeLabel, { textAlign: isMine ? 'right' : 'left' }]}>
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
        {isMine && (
          <View style={styles.userAvatarPlaceholder}>
            <Ionicons name="person" size={18} color="#fff" />
          </View>
        )}
      </View>
    );
  };

  const loading = isPast ? pastLoading : session.isJoining;
  const fatalError = isPast ? pastError : !consultationId ? 'Missing consultation.' : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#0B1C5A" />
          </TouchableOpacity>
          {counterpartImage ? (
            <Image source={{ uri: counterpartImage }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, styles.avatarFallback]}>
              <Ionicons name="person" size={20} color="#0B1C5A" />
            </View>
          )}
          <View>
            <Text style={styles.pharmName}>{counterpartName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
              {!isPast && session.participantOnline && (
                <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
              )}
              <Text style={[styles.liveLabel, (isPast || !session.participantOnline) && { color: '#6B7280' }]}>
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {!isPast && (
            <>
              {canCall && (
                <TouchableOpacity onPress={onOpenCall} style={styles.actionBtn}>
                  <Ionicons name="call" size={18} color="#0B1C5A" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleEnd} style={styles.endBtn} disabled={ending}>
                {ending ? (
                  <ActivityIndicator size="small" color="#dc2626" />
                ) : (
                  <Text style={styles.endBtnText}>End</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Session error banner */}
      {(session.error || fatalError) && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={14} color="#fff" />
          <Text style={styles.errorBannerText}>{fatalError ?? session.error}</Text>
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#0B1C5A" />
          </View>
        ) : (
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMsg}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={{ paddingVertical: 60, alignItems: 'center', paddingHorizontal: 30 }}>
                <Ionicons name="chatbubbles-outline" size={34} color="#9CA3AF" />
                <Text style={{ marginTop: 12, color: '#6B7280', textAlign: 'center' }}>
                  {isPast
                    ? 'No messages were exchanged during this session.'
                    : 'No messages yet. Say hello to start the consultation.'}
                </Text>
              </View>
            }
          />
        )}

        {/* Input */}
        {!isPast && !session.sessionEnded && (
          <View style={styles.inputBar}>
            <View style={styles.inputWrap}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Type your message..."
                placeholderTextColor="#9CA3AF"
                multiline
                style={styles.textInput}
                editable={session.isConnected && !session.isJoining}
              />
              <Pressable
                onPress={send}
                disabled={!input.trim() || session.isSending || !session.isConnected}
                style={[styles.sendBtn, (!input.trim() || !session.isConnected) && { backgroundColor: '#E5E7EB' }]}
              >
                {session.isSending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={16} color={input.trim() && session.isConnected ? '#fff' : '#9CA3AF'} />
                )}
              </Pressable>
            </View>
          </View>
        )}
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  headerAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E2E8F0' },
  avatarFallback: { backgroundColor: '#EEF1FB', alignItems: 'center', justifyContent: 'center' },
  pharmName: { fontSize: 16, fontWeight: '800', color: '#0B1C5A' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  liveLabel: { fontSize: 12, color: '#ef4444', fontWeight: '700' },
  endBtn: { backgroundColor: '#FEF2F2', borderRadius: 14, paddingHorizontal: 16, height: 38, alignItems: 'center', justifyContent: 'center' },
  endBtnText: { color: '#dc2626', fontWeight: '800', fontSize: 13 },
  actionBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EEF1FB', alignItems: 'center', justifyContent: 'center' },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#DC2626', paddingHorizontal: 16, paddingVertical: 8,
  },
  errorBannerText: { flex: 1, fontSize: 12, fontWeight: '600', color: '#fff' },

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
