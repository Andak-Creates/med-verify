import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { aiChatEditState } from "./_editState";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { MedVerifyLogo } from "../../../components/MedVerifyLogo";

const AI_SETUP_KEY = 'medverify_ai_setup';

export default function AiChatIntroScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const mainScrollRef = useRef<ScrollView>(null);

  const [assistantName, setAssistantName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<"female" | "male">("female");
  const [selectedSkinTone, setSelectedSkinTone] = useState("EDB98A");
  // Derived from SecureStore — true = first-timer, false = returning user
  const [isFirstTime, setIsFirstTime] = useState(true);
  // While we check storage, show nothing to avoid a flash
  const [checking, setChecking] = useState(true);

  // Run every time the screen comes into focus (tab tap, back navigation, etc.)
  // Read the module flag FIRST and consume it immediately so it never lingers.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      // Consume the edit flag immediately — reset so next focus doesn't wrongly
      // re-enter edit mode when the user taps the AI Chat tab normally.
      const isEditMode = aiChatEditState.isEdit;
      aiChatEditState.isEdit = false;

      setChecking(true);
      mainScrollRef.current?.scrollTo({ y: 0, animated: false });

      (async () => {
        try {
          const raw = await SecureStore.getItemAsync(AI_SETUP_KEY);
          if (raw && !cancelled) {
            const saved = JSON.parse(raw) as {
              name: string;
              avatar: 'female' | 'male';
              skinTone: string;
            };

            if (isEditMode) {
              // User came from the settings icon to edit — pre-fill form, stay on screen
              setAssistantName(saved.name);
              setSelectedAvatar(saved.avatar);
              setSelectedSkinTone(saved.skinTone);
              setIsFirstTime(false); // Always "Continue Conversing" in edit mode
            } else {
              // Returning user tapped AI Chat tab — redirect to chat immediately
              router.replace({
                pathname: '/(user)/ai-chat/chat',
                params: {
                  name: saved.name,
                  avatar: saved.avatar,
                  skinTone: saved.skinTone,
                },
              } as any);
              return; // Don't setChecking(false) — we're leaving this screen
            }
          } else if (!cancelled) {
            // No setup saved — first-time user, show the form
            setIsFirstTime(true);
          }
        } catch {
          // Storage error — fall through to setup
          if (!cancelled) setIsFirstTime(true);
        } finally {
          if (!cancelled) setChecking(false);
        }
      })();

      return () => { cancelled = true; };
    }, [])
  );


  const colorOptions = ["EDB98A", "D08B5B", "AE5D29"];

  const BITMOJIS: Record<"female" | "male", Record<string, any>> = {
    female: {
      EDB98A: require("../../../../assets/images/bitmoji-female-EDB98A.png"),
      D08B5B: require("../../../../assets/images/bitmoji-female-D08B5B.png"),
      AE5D29: require("../../../../assets/images/bitmoji-female-AE5D29.png"),
    },
    male: {
      EDB98A: require("../../../../assets/images/bitmoji-male-EDB98A.png"),
      D08B5B: require("../../../../assets/images/bitmoji-male-D08B5B.png"),
      AE5D29: require("../../../../assets/images/bitmoji-male-AE5D29.png"),
    },
  };

  const avatarSource = BITMOJIS[selectedAvatar][selectedSkinTone];

  const handleStart = async () => {
    const setup = {
      name: assistantName,
      avatar: selectedAvatar,
      skinTone: selectedSkinTone,
    };
    try {
      await SecureStore.setItemAsync(AI_SETUP_KEY, JSON.stringify(setup));
    } catch {
      // Non-fatal: proceed even if storage fails
    }
    router.replace({
      pathname: "/(user)/ai-chat/chat",
      params: setup,
    } as any);
  };

  // Don't flash setup screen while checking storage
  if (checking) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={mainScrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <MedVerifyLogo size="xs" showText={true} textColor="#0B1C5A" />
            <View style={styles.headerActions}>
              <Pressable style={styles.iconButton} onPress={() => router.push('/(user)/account/notifications' as any)}>
                <Ionicons name="notifications-outline" size={21} color="#0B1C5A" />
                <View style={styles.notifDot} />
              </Pressable>
              <Pressable style={styles.avatarButton} onPress={() => router.push('/(user)/account' as any)}>
                {user?.profileImage ? (
                  <Image source={{ uri: user.profileImage }} style={styles.avatarImg} />
                ) : (
                  <View style={[styles.avatarImg, { backgroundColor: '#EEF1FB', alignItems: 'center', justifyContent: 'center' }]}>
                    <Ionicons name="person-outline" size={20} color="#0B1C5A" />
                  </View>
                )}
              </Pressable>
            </View>
          </View>

          {/* Graphic Area */}
          <View style={styles.graphicContainer}>
            {/* Skin-tone-tinted deco circles */}
            <View
              style={[
                styles.decoCircle,
                {
                  width: 260,
                  height: 260,
                  backgroundColor: `#${selectedSkinTone}`,
                  opacity: 0.18,
                  top: 0,
                },
              ]}
            />
            <View
              style={[
                styles.decoCircle,
                {
                  width: 60,
                  height: 60,
                  backgroundColor: `#${selectedSkinTone}`,
                  opacity: 0.28,
                  top: 20,
                  right: 40,
                },
              ]}
            />
            <View
              style={[
                styles.decoCircle,
                {
                  width: 40,
                  height: 40,
                  backgroundColor: `#${selectedSkinTone}`,
                  opacity: 0.22,
                  bottom: 20,
                  left: 40,
                },
              ]}
            />

            {/* Main Bitmoji Box — skin-tinted background */}
            <View
              style={[
                styles.imageBox,
                { backgroundColor: `#${selectedSkinTone}22` },
              ]}
            >
              <Image source={avatarSource} style={styles.robotImg} />
            </View>
          </View>

          {/* Avatar + Skin Tone Pickers */}
          <View style={styles.pickerSection}>
            <View style={styles.avatarPicker}>
              <Text style={styles.inputLabel}>Select Assistant</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  onPress={() => setSelectedAvatar("female")}
                  style={[
                    styles.avatarBtn,
                    selectedAvatar === "female" && styles.avatarBtnActive,
                  ]}
                >
                  <Image
                    source={BITMOJIS.female[selectedSkinTone]}
                    style={styles.avatarThumb}
                  />
                  <Text
                    style={[
                      styles.avatarBtnText,
                      selectedAvatar === "female" && styles.avatarBtnTextActive,
                    ]}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedAvatar("male")}
                  style={[
                    styles.avatarBtn,
                    selectedAvatar === "male" && styles.avatarBtnActive,
                  ]}
                >
                  <Image
                    source={BITMOJIS.male[selectedSkinTone]}
                    style={styles.avatarThumb}
                  />
                  <Text
                    style={[
                      styles.avatarBtnText,
                      selectedAvatar === "male" && styles.avatarBtnTextActive,
                    ]}
                  >
                    Male
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.colorPicker}>
              <Text style={styles.inputLabel}>Skin Tone</Text>
              <View
                style={styles.colorRow}
                className="flex-row items-center justify-between w-40"
              >
                {colorOptions.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedSkinTone(color)}
                    style={[
                      styles.colorDot,
                      { backgroundColor: `#${color}` },
                      selectedSkinTone === color && styles.colorDotActive,
                    ]}
                  >
                    {selectedSkinTone === color && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={color === "FFDBB4" ? "#333" : "#fff"}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Text Area */}
          <View style={styles.textSection}>
            <Text style={styles.title}>
              Give your health assistant{"\n"}a name
            </Text>
            <Text style={styles.subtitle}>
              Personalize your journey by naming your clinical companion. It
              makes every health check feel more personal.
            </Text>
          </View>

          {/* Input Area */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Assistant Name</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="e.g., Medy AI"
                placeholderTextColor="#9CA3AF"
                value={assistantName}
                onChangeText={setAssistantName}
              />
              <Ionicons
                name="pencil-outline"
                size={20}
                color="#9CA3AF"
                style={styles.inputIcon}
              />
            </View>
            <Text style={styles.helperText}>Default name is Medy AI</Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleStart}>
            <Text style={styles.primaryBtnText}>
              {isFirstTime ? 'Start Conversing' : 'Continue Conversing'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>

          {/* Suggestions */}
          <View style={styles.suggestionsRow}>
            {["Dr. Pulse", "Vitalis", "HealthBot"].map((name) => (
              <TouchableOpacity
                key={name}
                style={styles.suggestionPill}
                onPress={() => setAssistantName(name)}
              >
                <Text style={styles.suggestionText}>{name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  scrollContent: { paddingBottom: 130, paddingHorizontal: 22 },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 10,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#312E81",
    letterSpacing: -0.3,
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarImg: { width: "100%", height: "100%" },

  /* Graphic Area */
  graphicContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    position: "relative",
  },
  decoCircle: { position: "absolute", borderRadius: 999, zIndex: 0 },
  imageBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 32,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
    zIndex: 1,
  },
  robotImg: { width: 160, height: 160, borderRadius: 20, resizeMode: "cover" },

  /* Text Section */
  textSection: { alignItems: "center", marginBottom: 24 },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#312E81",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },

  /* Input Section */
  inputSection: { marginBottom: 20 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    height: 56,
    paddingHorizontal: 16,
  },
  input: { flex: 1, fontSize: 16, color: "#111827" },
  inputIcon: { marginLeft: 10 },
  helperText: { fontSize: 12, color: "#6B7280", marginTop: 8 },

  /* Pickers */
  pickerSection: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 20,
    marginBottom: 24,
    width: "100%",
  },
  avatarPicker: { width: "100%" },
  row: { flexDirection: "row", gap: 10 },
  avatarBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  avatarBtnActive: {
    borderColor: "#0B1C5A",
    borderWidth: 2,
    backgroundColor: "#EEF1FB",
  },
  avatarThumb: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E2E8F0",
  },
  avatarBtnText: { fontSize: 14, fontWeight: "600", color: "#4B5563" },
  avatarBtnTextActive: { color: "#0B1C5A", fontWeight: "700" },
  colorPicker: { width: "100%" },
  colorRow: { flexDirection: "row", gap: 12, alignItems: "center", height: 44 },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  colorDotActive: {
    borderWidth: 3,
    borderColor: "#0B1C5A",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },

  /* Action Button */
  primaryBtn: {
    backgroundColor: "#312E81",
    borderRadius: 16,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 24,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  /* Suggestions */
  suggestionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  suggestionPill: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  suggestionText: { fontSize: 14, fontWeight: "600", color: "#111827" },
});
