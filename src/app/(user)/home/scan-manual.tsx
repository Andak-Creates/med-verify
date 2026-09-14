import { getApiErrorMessage } from "@/api/client";
import { verifyDrug } from "@/services/drugs.service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "@/i18n";

export default function ScanManualScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [nafdacCode, setNafdacCode] = useState("");
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(false);
    }, []),
  );

  const handleVerify = async () => {
    const code = nafdacCode.trim();
    if (!code) return;
    setLoading(true);
    try {
      const result = await verifyDrug(code);
      router.push({
        pathname: "/(user)/home/result",
        params: {
          code,
          result: JSON.stringify(result),
        },
      } as any);
    } catch (err) {
      Alert.alert(
        t.common.error,
        getApiErrorMessage(
          err,
          "Could not verify this registration number. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const QUICK_EXAMPLES = ["A4-0118", "B3-2240", "04-5567"];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#fff",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Ionicons name="chevron-back" size={22} color="#0B1C5A" />
            </TouchableOpacity>
            <Text
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: 17,
                fontWeight: "800",
                color: "#0B1C5A",
                marginRight: 40,
              }}
            >
              {t.scanner.manualTitle}
            </Text>
          </View>

          <View style={{ paddingHorizontal: 24 }}>
            {/* Icon + Subtitle */}
            <View style={{ alignItems: "center", marginBottom: 28, marginTop: 10 }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 24,
                  backgroundColor: "#EEF2FF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons name="keypad" size={34} color="#0B1C5A" />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#0B1C5A",
                  textAlign: "center",
                  marginBottom: 6,
                }}
              >
                {t.scanner.manualTitle}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#64748B",
                  textAlign: "center",
                  lineHeight: 19,
                  paddingHorizontal: 12,
                }}
              >
                {t.scanner.manualSubtitle}
              </Text>
            </View>

            {/* Input Card */}
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 20,
                padding: 20,
                marginBottom: 24,
                shadowColor: "#0B1C5A",
                shadowOpacity: 0.04,
                shadowRadius: 10,
                elevation: 2,
                borderWidth: 1,
                borderColor: "#E2E8F0",
              }}
            >
              <TextInput
                value={nafdacCode}
                onChangeText={setNafdacCode}
                placeholder={t.scanner.manualPlaceholder}
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                autoCorrect={false}
                style={{
                  backgroundColor: "#F8FAFC",
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#0B1C5A",
                  letterSpacing: 1.5,
                  borderWidth: 1.5,
                  borderColor: nafdacCode ? "#0B1C5A" : "#E2E8F0",
                  marginBottom: 16,
                }}
              />

              {/* Verify Button */}
              <TouchableOpacity
                onPress={handleVerify}
                disabled={!nafdacCode.trim() || loading}
                style={{
                  backgroundColor: "#0B1C5A",
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: !nafdacCode.trim() || loading ? 0.6 : 1,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: "800",
                    letterSpacing: 0.5,
                  }}
                >
                  {loading ? t.common.loading : t.scanner.verifyBtn}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quick Examples */}
            <View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: "#64748B",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Quick Examples
              </Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {QUICK_EXAMPLES.map((ex) => (
                  <Pressable
                    key={ex}
                    onPress={() => setNafdacCode(ex)}
                    style={({ pressed }) => ({
                      flex: 1,
                      backgroundColor: "#fff",
                      borderRadius: 12,
                      paddingVertical: 10,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#0B1C5A",
                      }}
                    >
                      {ex}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
