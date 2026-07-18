import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
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

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
  gif: 'image/gif', pdf: 'application/pdf', doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function mimeFromUri(uri: string): string {
  const ext = uri.split('.').pop()?.toLowerCase() ?? '';
  return MIME_BY_EXT[ext] ?? 'application/octet-stream';
}

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
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [showAttachSheet, setShowAttachSheet] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const flatRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  const openAttachSheet = () => {
    setShowAttachSheet(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 150,
    }).start();
  };

  const closeAttachSheet = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowAttachSheet(false));
  };

  const pickFromGallery = async () => {
    closeAttachSheet();
    setTimeout(async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow access to your photo library to attach images.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setPendingImage(result.assets[0].uri);
      }
    }, 350);
  };

  const takePhoto = async () => {
    closeAttachSheet();
    setTimeout(async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow camera access to take photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setPendingImage(result.assets[0].uri);
      }
    }, 350);
  };

  const pickDocument = async () => {
    closeAttachSheet();
    setTimeout(async () => {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword',
               'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
               'image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setPendingFile({ uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream' });
      }
    }, 350);
  };

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

  const [uploading, setUploading] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text && !pendingImage && !pendingFile) return;
    if (!consultationId) return;
    setInput('');
    const imgUri = pendingImage;
    const fileAttach = pendingFile;
    setPendingImage(null);
    setPendingFile(null);
    try {
      let imageUrl: string | null = null;
      const attachment = imgUri
        ? { uri: imgUri, name: imgUri.split('/').pop() ?? 'photo.jpg', type: mimeFromUri(imgUri) }
        : fileAttach ?? null;
      if (attachment) {
        setUploading(true);
        imageUrl = await consultationsService.uploadMessageFile(consultationId, attachment);
        setUploading(false);
      }
      await session.sendMessage(text, imageUrl);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
    } catch {
      setUploading(false);
      setInput(text);
      if (imgUri) setPendingImage(imgUri);
      if (fileAttach) setPendingFile(fileAttach);
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
    const isImage = item.imageUrl && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(item.imageUrl);
    const isFile = item.imageUrl && !isImage;
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
          {isImage && (
            <TouchableOpacity onPress={() => setPreviewImageUrl(item.imageUrl!)}>
              <Image
                source={{ uri: item.imageUrl! }}
                style={styles.msgImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          {isFile && (
            <View style={[styles.bubble, isMine ? styles.bubbleUser : styles.bubblePharm, styles.fileBubble]}>
              <Ionicons name="document-attach" size={20} color={isMine ? '#fff' : '#0B1C5A'} />
              <Text style={[styles.bubbleText, isMine ? styles.bubbleTextUser : styles.bubbleTextPharm, { flex: 1 }]} numberOfLines={1}>
                {item.imageUrl!.split('/').pop()}
              </Text>
            </View>
          )}
          {item.message ? (
            <View style={[styles.bubble, isMine ? styles.bubbleUser : styles.bubblePharm]}>
              <Text style={[styles.bubbleText, isMine ? styles.bubbleTextUser : styles.bubbleTextPharm]}>
                {item.message}
              </Text>
            </View>
          ) : null}
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
          <>
            {/* Attachment preview */}
            {(pendingImage || pendingFile) && (
              <View style={styles.attachPreviewBar}>
                {pendingImage && (
                  <View style={styles.attachPreviewItem}>
                    <Image source={{ uri: pendingImage }} style={styles.attachThumb} resizeMode="cover" />
                    <TouchableOpacity onPress={() => setPendingImage(null)} style={styles.attachRemoveBtn}>
                      <Ionicons name="close-circle" size={22} color="#0B1C5A" />
                    </TouchableOpacity>
                  </View>
                )}
                {pendingFile && (
                  <View style={[styles.attachPreviewItem, styles.filePreviewItem]}>
                    <Ionicons name="document-attach" size={22} color="#0B1C5A" />
                    <Text style={styles.filePreviewName} numberOfLines={1}>{pendingFile.name}</Text>
                    <TouchableOpacity onPress={() => setPendingFile(null)} style={styles.attachRemoveBtn}>
                      <Ionicons name="close-circle" size={22} color="#0B1C5A" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
            <View style={styles.inputBar}>
              <View style={styles.inputWrap}>
                {/* Attach + button */}
                <TouchableOpacity onPress={openAttachSheet} style={styles.attachBtn}>
                  <Ionicons name="add" size={22} color="#0B1C5A" />
                </TouchableOpacity>
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
                  disabled={(!input.trim() && !pendingImage && !pendingFile) || session.isSending || uploading || !session.isConnected}
                  style={[styles.sendBtn, ((!input.trim() && !pendingImage && !pendingFile) || !session.isConnected) && { backgroundColor: '#E5E7EB' }]}
                >
                  {session.isSending || uploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="send" size={16} color={(input.trim() || pendingImage || pendingFile) && session.isConnected ? '#fff' : '#9CA3AF'} />
                  )}
                </Pressable>
              </View>
            </View>
          </>
        )}
      </KeyboardAvoidingView>

      {/* Full-screen image preview */}
      <Modal
        visible={!!previewImageUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImageUrl(null)}
      >
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={styles.previewClose}
            onPress={() => setPreviewImageUrl(null)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {previewImageUrl && (
            <Image
              source={{ uri: previewImageUrl }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Attachment Action Sheet */}
      {showAttachSheet && (
        <Modal transparent animationType="none" onRequestClose={closeAttachSheet}>
          <Pressable style={styles.sheetOverlay} onPress={closeAttachSheet}>
            <Animated.View style={[styles.sheetContainer, { transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Add Attachment</Text>
              <TouchableOpacity style={styles.sheetOption} onPress={takePhoto}>
                <View style={styles.sheetIconBg}>
                  <Ionicons name="camera" size={22} color="#0B1C5A" />
                </View>
                <View>
                  <Text style={styles.sheetOptionText}>Take Photo</Text>
                  <Text style={styles.sheetOptionSub}>Use your camera</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetOption} onPress={pickFromGallery}>
                <View style={styles.sheetIconBg}>
                  <Ionicons name="images" size={22} color="#0B1C5A" />
                </View>
                <View>
                  <Text style={styles.sheetOptionText}>Choose from Gallery</Text>
                  <Text style={styles.sheetOptionSub}>Select a photo or image</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sheetOption}
                onPress={pickDocument}
              >
                <View style={styles.sheetIconBg}>
                  <Ionicons name="document-attach" size={22} color="#0B1C5A" />
                </View>
                <View>
                  <Text style={styles.sheetOptionText}>File</Text>
                  <Text style={styles.sheetOptionSub}>PDF, DOC and more</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetCancel} onPress={closeAttachSheet}>
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          </Pressable>
        </Modal>
      )}
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
  msgImage: { width: 220, height: 160, borderRadius: 16, backgroundColor: '#E2E8F0' },
  fileBubble: { flexDirection: 'row', alignItems: 'center', gap: 10, maxWidth: 220 },
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

  /* Attach button */
  attachBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#EEF1FB', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },

  /* Attachment preview */
  attachPreviewBar: {
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  attachPreviewItem: { position: 'relative', alignSelf: 'flex-start' },
  filePreviewItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EEF1FB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, maxWidth: 260 },
  filePreviewName: { flex: 1, fontSize: 13, color: '#0B1C5A', fontWeight: '600' },
  attachThumb: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#E2E8F0' },
  attachRemoveBtn: {
    position: 'absolute', top: -8, right: -8,
    backgroundColor: '#fff', borderRadius: 11,
  },

  /* Full-screen image preview */
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.93)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '85%',
  },
  previewClose: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Action sheet */
  sheetOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 34 : 20, paddingHorizontal: 20,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 16 },
  sheetOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  sheetIconBg: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#EEF1FB', alignItems: 'center', justifyContent: 'center',
  },
  sheetOptionText: { fontSize: 15, fontWeight: '700', color: '#111827' },
  sheetOptionSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  sheetCancel: {
    marginTop: 16, paddingVertical: 14, alignItems: 'center',
    backgroundColor: '#F3F4F6', borderRadius: 14,
  },
  sheetCancelText: { fontSize: 15, fontWeight: '700', color: '#374151' },
});
