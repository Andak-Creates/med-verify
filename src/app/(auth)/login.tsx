import { getApiErrorMessage } from "@/api/client";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { FormError } from "../../components/FormError";
import { useAuth } from "../../context/AuthContext";
import { useGoogleSignIn } from "../../hooks/useGoogleSignIn";
import { useLanguage } from "@/i18n";

export default function LoginScreen() {
  const router = useRouter();
  const { login, googleAuth } = useAuth();
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { ready: googleReady, promptAsync: promptGoogleSignIn } =
    useGoogleSignIn(
      async (idToken) => {
        setGoogleLoading(true);
        setFormError(null);
        try {
          await googleAuth(idToken);
          router.replace("/(user)/home" as any);
        } catch (err) {
          setFormError(
            getApiErrorMessage(
              err,
              "Could not sign in with Google. That email may already be registered with a password — try logging in with your password instead.",
            ),
          );
        } finally {
          setGoogleLoading(false);
        }
      },
      (message) => {
        setGoogleLoading(false);
        setFormError(message);
      },
    );

  const handleGoogleSignIn = async () => {
    setFormError(null);
    try {
      await promptGoogleSignIn();
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Could not start Google sign-in"));
    }
  };

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      setFormError("Enter your email and password to continue.");
      return;
    }

    setFormError(null);
    setLoading(true);
    try {
      await login(identifier.trim().toLowerCase(), password);
      router.replace("/(user)/home" as any);
    } catch (err) {
      setFormError(
        getApiErrorMessage(
          err,
          "Incorrect email or password. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push("/(onboarding)/user/sign-up" as any);
  };

  const handleForgotPassword = () => {
    router.push("/(auth)/forgot-password" as any);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: 28,
            paddingTop: 72,
            paddingBottom: 40,
          }}
        >
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 40,
              opacity: pressed ? 0.6 : 1,
              alignSelf: "flex-start",
            })}
          >
            <Ionicons name="arrow-back" size={20} color="#0b1c5a" style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 14, color: "#0b1c5a", fontWeight: "600" }}>
              {t.common.back}
            </Text>
          </Pressable>

          {/* Header */}
          <Text
            style={{
              fontSize: 34,
              fontWeight: "800",
              color: "#0b1c5a",
              marginBottom: 8,
            }}
          >
            {t.onboarding.loginTitle}
          </Text>
          <Text style={{ fontSize: 15, color: "#6b7280", marginBottom: 36 }}>
            {t.onboarding.loginSubtitle}
          </Text>

          {/* Email Input */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 8,
            }}
          >
            {t.onboarding.email}
          </Text>
          <TextInput
            value={identifier}
            onChangeText={(text) => {
              setIdentifier(text);
              setFormError(null);
            }}
            placeholder="example@email.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              backgroundColor: "rgba(255,255,255,0.85)",
              borderRadius: 14,
              paddingHorizontal: 18,
              paddingVertical: 16,
              fontSize: 15,
              color: "#111827",
              borderWidth: 1.5,
              borderColor: "rgba(11,28,90,0.15)",
              marginBottom: 20,
            }}
          />

          {/* Password Input */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151" }}>
              {t.onboarding.password}
            </Text>
            <Pressable onPress={handleForgotPassword}>
              <Text
                style={{ fontSize: 13, color: "#0b5cbe", fontWeight: "600" }}
              >
                {t.onboarding.forgotPassword}
              </Text>
            </Pressable>
          </View>
          <View style={{ position: "relative", marginBottom: 28 }}>
            <TextInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setFormError(null);
              }}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showPassword}
              style={{
                backgroundColor: "rgba(255,255,255,0.85)",
                borderRadius: 14,
                paddingHorizontal: 18,
                paddingVertical: 16,
                paddingRight: 50,
                fontSize: 15,
                color: "#111827",
                borderWidth: 1.5,
                borderColor: "rgba(11,28,90,0.15)",
              }}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 16,
                top: 0,
                bottom: 0,
                justifyContent: "center",
              }}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#6B7280"
              />
            </Pressable>
          </View>

          <FormError message={formError} />

          {/* Log In Button */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => ({
              backgroundColor: "#0b1c5a",
              borderRadius: 50,
              paddingVertical: 18,
              alignItems: "center",
              marginBottom: 24,
              opacity: pressed || loading ? 0.85 : 1,
            })}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                {t.onboarding.login}
              </Text>
            )}
          </Pressable>

          {/* Divider */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
            <Text
              style={{ marginHorizontal: 12, color: "#9ca3af", fontSize: 13 }}
            >
              {t.onboarding.orContinueWith}
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
          </View>

          {/* Google Sign In */}
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={!googleReady || googleLoading}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: 14,
              paddingVertical: 16,
              marginBottom: 32,
              borderWidth: 1.5,
              borderColor: "#e5e7eb",
              opacity: pressed || !googleReady || googleLoading ? 0.6 : 1,
            })}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color="#374151" />
            ) : (
              <>
                <FontAwesome name="google" size={20} color="#DB4437" />
                <Text
                  style={{
                    fontWeight: "600",
                    fontSize: 15,
                    color: "#374151",
                    marginLeft: 8,
                  }}
                >
                  {t.onboarding.googleSignIn}
                </Text>
              </>
            )}
          </Pressable>

          {/* Don't have an account */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#6b7280", fontSize: 14 }}>
              {t.onboarding.noAccount}{" "}
            </Text>
            <Pressable onPress={handleSignUp}>
              <Text
                style={{ color: "#0b5cbe", fontWeight: "700", fontSize: 14 }}
              >
                {t.onboarding.signUp}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
