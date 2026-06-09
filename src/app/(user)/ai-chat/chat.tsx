import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
};

const QUICK_SUGGESTIONS = [
  "Is this drug safe?",
  "Check expiry date",
  "Drug interactions?",
  "NAFDAC registered?",
];

const MOCK_RESPONSES: Record<string, string> = {
  default:
    "I'm MedVerify AI, your health companion! I can help you verify medication authenticity, check drug interactions, and answer health-related questions. What would you like to know?",
  safe: "To check if a drug is safe, scan its QR code or enter its NAFDAC number. I'll cross-reference it against Nigeria's official drug registry instantly. Would you like to scan one now?",
  expiry:
    "To check an expiry date, go to the Scan tab and either scan the barcode or take a photo of the packaging. The AI will extract and verify the printed date against the batch record.",
  interaction:
    "Drug interactions can be serious. Please tell me the names of the medications you're concerned about, and I'll flag any known adverse combinations.",
  nafdac:
    "Every legitimate drug sold in Nigeria must have a NAFDAC registration number. I can verify this for you — just scan the packaging or enter the NAFDAC number manually.",
};

function getResponse(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("safe")) return MOCK_RESPONSES.safe;
  if (lower.includes("expiry") || lower.includes("date"))
    return MOCK_RESPONSES.expiry;
  if (lower.includes("interaction")) return MOCK_RESPONSES.interaction;
  if (lower.includes("nafdac") || lower.includes("register"))
    return MOCK_RESPONSES.nafdac;
  return MOCK_RESPONSES.default;
}

function TypingIndicator({ color }: { color: string }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -6,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

    const a1 = pulse(dot1, 0);
    const a2 = pulse(dot2, 150);
    const a3 = pulse(dot3, 300);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, []);

  return (
    <View style={styles.typingRow}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            styles.typingDot,
            { backgroundColor: color, transform: [{ translateY: dot }] },
          ]}
        />
      ))}
    </View>
  );
}

export default function AiChatScreen() {
  const router = useRouter();
  const { name, avatar, skinTone } = useLocalSearchParams<{
    name?: string;
    avatar?: string;
    skinTone?: string;
  }>();

  const assistantName = name || "Medy AI";
  const avatarGender = avatar === "male" ? "male" : "female";
  const tone = skinTone || "EDB98A";
  const avatarSeed = avatarGender === "female" ? "Mia" : "Oliver";
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${avatarSeed}&skinColor=${tone}&backgroundColor=e2e8f0&mouth=smile&eyes=happy&clothing=blazerAndShirt`;

  const BRAND_COLOR = "#0B1C5A";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      text: `Hi there! I'm ${assistantName}, your personal health companion. I can help verify medications, check NAFDAC registrations, and answer drug-related questions. How can I help you today?`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<FlatList>(null);

  const scrollToBottom = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);
    scrollToBottom();

    setTimeout(() => {
      setIsTyping(false);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: getResponse(trimmed),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      scrollToBottom();
    }, 1800);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.messageRowUser : styles.messageRowAi,
        ]}
      >
        {!isUser && (
          <Image source={{ uri: avatarUrl }} style={styles.msgAvatar} />
        )}
        <View style={styles.bubbleCol}>
          <View
            style={[
              styles.bubble,
              isUser
                ? [styles.bubbleUser, { backgroundColor: BRAND_COLOR }]
                : styles.bubbleAi,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                isUser ? styles.bubbleTextUser : styles.bubbleTextAi,
              ]}
            >
              {item.text}
            </Text>
          </View>
          <Text
            style={[
              styles.timeText,
              { textAlign: isUser ? "right" : "left" },
            ]}
          >
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={BRAND_COLOR} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
          <View>
            <Text style={styles.headerName}>{assistantName}</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>AI • Online</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={BRAND_COLOR} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.messageRow}>
                <Image source={{ uri: avatarUrl }} style={styles.msgAvatar} />
                <View style={[styles.bubble, styles.bubbleAi, styles.typingBubble]}>
                  <TypingIndicator color={BRAND_COLOR} />
                </View>
              </View>
            ) : null
          }
        />

        {/* Quick Suggestions */}
        <View style={styles.suggestionsWrap}>
          {QUICK_SUGGESTIONS.map((s) => (
            <TouchableOpacity
              key={s}
              style={styles.suggestionChip}
              onPress={() => sendMessage(s)}
            >
              <Text style={styles.suggestionChipText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Ask me anything..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              onSubmitEditing={() => sendMessage(inputText)}
              returnKeyType="send"
            />
            <Pressable
              onPress={() => sendMessage(inputText)}
              style={({ pressed }) => [
                styles.sendBtn,
                { backgroundColor: BRAND_COLOR, opacity: pressed ? 0.8 : 1 },
                !inputText.trim() && { opacity: 0.4 },
              ]}
              disabled={!inputText.trim() && !isTyping}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FF" },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F9",
    gap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E2E8F0",
  },
  headerName: { fontSize: 16, fontWeight: "800", color: "#0B1C5A" },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#10B981" },
  onlineText: { fontSize: 12, color: "#6B7280" },
  moreBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Messages */
  messageList: { paddingHorizontal: 16, paddingVertical: 20, gap: 12, flexGrow: 1 },
  messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginVertical: 4 },
  messageRowUser: { justifyContent: "flex-end" },
  messageRowAi: { justifyContent: "flex-start" },
  msgAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E2E8F0",
    flexShrink: 0,
  },
  userAvatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#0B1C5A",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bubbleCol: { maxWidth: "72%", gap: 3 },
  bubble: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12 },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleAi: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  bubbleTextUser: { color: "#fff" },
  bubbleTextAi: { color: "#1F2937" },
  timeText: { fontSize: 11, color: "#9CA3AF", paddingHorizontal: 4 },

  /* Typing */
  typingBubble: { paddingVertical: 14, paddingHorizontal: 16 },
  typingRow: { flexDirection: "row", gap: 5, alignItems: "center", height: 20 },
  typingDot: { width: 8, height: 8, borderRadius: 4 },

  /* Suggestions */
  suggestionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 4,
  },
  suggestionChip: {
    backgroundColor: "#EEF1FB",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#D1D9F0",
  },
  suggestionChipText: { fontSize: 12, color: "#0B1C5A", fontWeight: "600" },

  /* Input */
  inputBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F1F3F9",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    maxHeight: 100,
    paddingTop: 6,
    paddingBottom: 6,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
