import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { getApiErrorMessage } from "@/api/client";
import { useLanguage } from "@/i18n";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 55;

export default function OtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyOtp, resendOtp } = useAuth();
  const { t } = useLanguage();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1);
    setOtp(newOtp);
    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend || !email) return;
    setResending(true);
    try {
      await resendOtp(email);
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimer(RESEND_SECONDS);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch (err) {
      Alert.alert(t.common.error, getApiErrorMessage(err, "Please try again in a moment."));
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    if (!email) return;
    setVerifying(true);
    try {
      await verifyOtp(email, otp.join(""));
      router.replace('/(user)/home' as any);
    } catch (err) {
      Alert.alert(t.common.error, getApiErrorMessage(err, "That code didn't work. Please try again."));
    } finally {
      setVerifying(false);
    }
  };

  const isComplete = otp.every((d) => d !== "");
  const formattedTimer = `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, "0")}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
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
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#0B1C5A" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: 36, paddingBottom: 40, alignItems: "center" }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Ionicons name="mail-unread-outline" size={36} color="#0B1C5A" />
            </View>

            <Text style={{ fontSize: 26, fontWeight: "800", color: "#0B1C5A", marginBottom: 8, textAlign: "center" }}>
              {t.onboarding.otpTitle}
            </Text>
            <Text style={{ fontSize: 14, color: "#64748B", textAlign: "center", lineHeight: 20, marginBottom: 4 }}>
              {t.onboarding.otpSubtitle}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#0B1C5A", marginBottom: 32 }}>
              {email}
            </Text>

            {/* OTP Boxes */}
            <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", marginBottom: 32 }}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  value={digit}
                  onChangeText={(text) => handleChange(text, i)}
                  onKeyPress={(e) => handleKeyPress(e, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  style={{
                    width: 48,
                    height: 56,
                    borderRadius: 14,
                    backgroundColor: "#fff",
                    textAlign: "center",
                    fontSize: 22,
                    fontWeight: "800",
                    color: "#0B1C5A",
                    borderWidth: 1.5,
                    borderColor: digit ? "#0B1C5A" : "#E2E8F0",
                    shadowColor: "#0B1C5A",
                    shadowOpacity: 0.03,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                />
              ))}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              onPress={handleVerify}
              disabled={!isComplete || verifying}
              style={{
                width: "100%",
                backgroundColor: "#0B1C5A",
                borderRadius: 18,
                paddingVertical: 18,
                alignItems: "center",
                marginBottom: 24,
                opacity: !isComplete || verifying ? 0.6 : 1,
              }}
            >
              {verifying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                  {t.onboarding.verifyCode}
                </Text>
              )}
            </TouchableOpacity>

            {/* Resend */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{ color: "#64748B", fontSize: 13 }}>Didn't receive the code?</Text>
              {canResend ? (
                <TouchableOpacity onPress={handleResend} disabled={resending}>
                  <Text style={{ color: "#0B5CBE", fontWeight: "700", fontSize: 13 }}>
                    {resending ? t.common.loading : t.onboarding.resendCode}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={{ color: "#94A3B8", fontWeight: "600", fontSize: 13 }}>
                  Resend in {formattedTimer}
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
