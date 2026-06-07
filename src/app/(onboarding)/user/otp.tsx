import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 55;

export default function OtpScreen() {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
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

  const handleResend = () => {
    if (!canResend) return;
    setOtp(Array(OTP_LENGTH).fill(""));
    setTimer(RESEND_SECONDS);
    setCanResend(false);
    inputRefs.current[0]?.focus();
  };

  const handleVerify = () => {
    router.replace("/(onboarding)/user/welcome");
  };

  const isComplete = otp.every((d) => d !== "");
  const formattedTimer = `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, "0")}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FAF9' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 ml-5 w-10 h-10 items-center justify-center rounded-full bg-white/40"
          >
            <Ionicons name="arrow-back" size={24} color="#0B1C5A" />
          </TouchableOpacity>

          <View className="flex-1 px-6 pt-6">
            {/* Heading */}
            <Text className="text-[28px] font-bold text-[#0B1C5A] mb-3">
              Verify Identity
            </Text>
            <Text className="text-[15px] text-[#5A677B] leading-6 mb-10">
              We sent a 6-digit code to your registered{"\n"}device. Please
              enter it below to continue.
            </Text>

            {/* OTP inputs */}
            <View className="flex-row justify-between mb-8">
              {Array(OTP_LENGTH)
                .fill(0)
                .map((_, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    style={{
                      width: 44,
                      height: 56,
                      borderRadius: 16,
                      textAlign: "center",
                      fontSize: 22,
                      fontWeight: "bold",
                      backgroundColor: otp[index] ? "#ffffff" : "#EFF1F5",
                      borderWidth: 1.5,
                      borderColor: otp[index] ? "#0B1C5A" : "transparent",
                      color: "#0B1C5A",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.04,
                      shadowRadius: 3,
                      elevation: 1,
                    }}
                    maxLength={1}
                    keyboardType="number-pad"
                    value={otp[index]}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    selectTextOnFocus
                  />
                ))}
            </View>

            {/* Resend */}
            <View className="flex-row justify-center mb-8">
              <Text className="text-[#5A677B] text-[15px]">
                Didn't receive code?{" "}
              </Text>
              <TouchableOpacity onPress={handleResend} disabled={!canResend}>
                <Text
                  className={`text-[15px] font-semibold ${
                    canResend ? "text-[#0b5cbe]" : "text-[#8E9CB2]"
                  }`}
                >
                  {canResend ? "Resend now" : `Resend in ${formattedTimer}`}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Shield illustration */}
            <View className="items-center justify-center mb-10 flex-1">
              <Image
                source={require("../../../../assets/images/shield-illustration.png")}
                style={{ width: 220, height: 220 }}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Bottom CTA */}
          <View className="px-6 pb-8">
            <TouchableOpacity
              onPress={handleVerify}
              disabled={!isComplete}
              className={`w-full h-[56px] rounded-2xl flex-row items-center justify-center ${
                isComplete ? "bg-[#0b1c5a]" : "bg-[#0b1c5a]/40"
              }`}
            >
              <Text className="text-white font-semibold text-[16px] mr-2">
                Verify &amp; Continue
              </Text>
              <Ionicons name="chevron-forward" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
