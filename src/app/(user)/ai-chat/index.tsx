import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
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

export default function AiChatIntroScreen() {
  const router = useRouter();
  const [assistantName, setAssistantName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<"female" | "male">("female");
  // Skin tone hex colors
  const [selectedSkinTone, setSelectedSkinTone] = useState("EDB98A");

  const colorOptions = ["FFDBB4", "EDB98A", "D08B5B", "AE5D29", "392211"];

  // DiceBear Avataaars - customized for a friendly, professional look
  const avatarSeed = selectedAvatar === "female" ? "Jasmine" : "Oliver";
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${avatarSeed}&skinColor=${selectedSkinTone}&backgroundColor=e2e8f0&mouth=smile&eyes=happy&clothing=blazerAndShirt`;

  const handleStart = () => {
    // Navigate to the actual chat interface (assuming we'll create it later at ai-chat/chat)
    // Pass config as params
    router.push({
      pathname: "/(user)/ai-chat/chat",
      params: {
        name: assistantName,
        avatar: selectedAvatar,
        skinTone: selectedSkinTone,
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logoText}>MedVerify</Text>
            <View style={styles.headerActions}>
              <Pressable style={styles.iconButton}>
                <Ionicons
                  name="notifications-outline"
                  size={21}
                  color="#312E81"
                />
                <View style={styles.notifDot} />
              </Pressable>
              <Pressable style={styles.avatarButton}>
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80",
                  }}
                  style={styles.avatarImg}
                />
              </Pressable>
            </View>
          </View>

          {/* Graphic Area */}
          <View style={styles.graphicContainer}>
            {/* Background deco circles */}
            <View
              style={[
                styles.decoCircle,
                {
                  width: 250,
                  height: 250,
                  backgroundColor: `#${selectedSkinTone}`,
                  opacity: 0.15,
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
                  opacity: 0.25,
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
                  opacity: 0.2,
                  bottom: 20,
                  left: 40,
                },
              ]}
            />

            {/* Main Image Box */}
            <View style={styles.imageBox}>
              <Image
                source={{ uri: avatarUrl }}
                style={styles.robotImg}
              />
            </View>
          </View>

          {/* Avatar & Color Picker */}
          <View style={styles.pickerSection}>
            <View style={styles.avatarPicker}>
              <Text style={styles.inputLabel}>Select Avatar Style</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  onPress={() => setSelectedAvatar("female")}
                  style={[
                    styles.avatarBtn,
                    selectedAvatar === "female" && styles.avatarBtnActive,
                  ]}
                >
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
              <Text style={styles.inputLabel}>Select Skin Tone</Text>
              <View style={styles.colorRow}>
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
                      <Ionicons name="checkmark" size={14} color={color === 'FFDBB4' ? '#000' : '#fff'} />
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
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleStart}
          >
            <Text style={styles.primaryBtnText}>Start Conversing</Text>
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
  iconButton: { alignItems: "center", justifyContent: "center" },
  notifDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
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
  colorPicker: { width: "100%" },
  row: { flexDirection: "row", gap: 10 },
  avatarBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  avatarBtnActive: {
    borderColor: "#0B1C5A",
    borderWidth: 2,
    backgroundColor: "#EEF1FB",
  },
  avatarBtnText: { fontSize: 14, fontWeight: "600", color: "#4B5563" },
  avatarBtnTextActive: { color: "#0B1C5A", fontWeight: "700" },
  colorRow: { flexDirection: "row", gap: 12, alignItems: "center", height: 44, justifyContent: "flex-start" },
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
