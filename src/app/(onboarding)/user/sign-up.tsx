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
import { useAuth } from "../../../context/AuthContext";
import { getApiErrorMessage } from "../../../lib/api";
import { useGoogleSignIn } from "../../../hooks/useGoogleSignIn";
import { FormError } from "../../../components/FormError";

export default function SignUpScreen() {
  const router = useRouter();
  const { signup, googleAuth } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { ready: googleReady, promptAsync: promptGoogleSignIn } = useGoogleSignIn(
    async (idToken) => {
      setGoogleLoading(true);
      setFormError(null);
      try {
        const user = await googleAuth(idToken);
        router.replace((user.role === "PHARMACIST" ? "/(pharmacist)/dashboard" : "/(user)/home") as any);
      } catch (err) {
        setFormError(getApiErrorMessage(err, "Could not sign up with Google. That email may already be registered with a password — try logging in instead."));
      } finally {
        setGoogleLoading(false);
      }
    },
    (message) => {
      setGoogleLoading(false);
      setFormError(message);
    }
  );

  const handleGoogleSignIn = async () => {
    setFormError(null);
    try {
      await promptGoogleSignIn();
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Could not start Google sign-in"));
    }
  };

  const handleSignUp = async () => {
    const email = identifier.trim().toLowerCase();
    if (!email) {
      setFormError("Enter your email address to continue.");
      return;
    }
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    setFormError(null);
    setLoading(true);
    try {
      await signup(email, password, "USER");
      router.replace({ pathname: "/(onboarding)/user/otp" as any, params: { email } });
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Could not create your account. That email may already be in use — try logging in instead."));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push("/(auth)/login" as any);
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
          {/* Header */}
          <Text
            style={{
              fontSize: 36,
              fontWeight: "800",
              color: "#0b1c5a",
              marginBottom: 8,
            }}
          >
            Create Account
          </Text>
          <Text style={{ fontSize: 16, color: "#6b7280", marginBottom: 40 }}>
            Sign up to start verifying medications
          </Text>

          {/* Email / Phone Input */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 8,
            }}
          >
            Email or Phone Number
          </Text>
          <TextInput
            value={identifier}
            onChangeText={(text) => { setIdentifier(text); setFormError(null); }}
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
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 8,
            }}
          >
            Create Password
          </Text>
          <View style={{ position: "relative", marginBottom: 32 }}>
            <TextInput
              value={password}
              onChangeText={(text) => { setPassword(text); setFormError(null); }}
              placeholder="At least 8 characters"
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
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={22}
                color="#6B7280"
              />
            </Pressable>
          </View>

          <FormError message={formError} />

          {/* Sign Up Button */}
          <Pressable
            onPress={handleSignUp}
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
                Sign Up
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
              Or continue with
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
          </View>

          {/* Social Buttons */}
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
              marginBottom: 12,
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
                    marginLeft: 5,
                  }}
                >
                  Google
                </Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#000",
              borderRadius: 14,
              paddingVertical: 16,
              marginBottom: 40,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <FontAwesome name="apple" size={20} color="#ffffffff" />
            <Text
              style={{
                fontWeight: "700",
                fontSize: 15,
                color: "#fff",
                letterSpacing: 1,
                marginLeft: 5,
              }}
            >
              Apple
            </Text>
          </Pressable>

          {/* Already have an account */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#6b7280", fontSize: 14 }}>
              Already have an account?{" "}
            </Text>
            <Pressable onPress={handleLogin}>
              <Text
                style={{ color: "#0b5cbe", fontWeight: "700", fontSize: 14 }}
              >
                Log In
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
