import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/(onboarding)/pharmacist/otp' as any);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to start consulting & earning</Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="example@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="enter phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Create Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="At least 8 characters"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                style={styles.input}
              />
            </View>

            {/* Sign Up Button */}
            <Pressable
              onPress={handleSignup}
              disabled={loading || !email || !phone || !password}
              style={({ pressed }) => [
                styles.signupBtn,
                (loading || !email || !phone || !password) && styles.signupBtnDisabled,
                pressed && styles.signupBtnPressed
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signupBtnText}>Sign Up</Text>
              )}
            </Pressable>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialGroup}>
            <Pressable style={({ pressed }) => [styles.socialBtn, styles.googleBtn, pressed && styles.socialBtnPressed]}>
              <FontAwesome name="google" size={20} color="#DB4437" />
              <Text style={styles.googleBtnText}>Google</Text>
            </Pressable>

            <Pressable style={({ pressed }) => [styles.socialBtn, styles.appleBtn, pressed && styles.socialBtnPressed]}>
              <FontAwesome name="apple" size={20} color="#fff" />
              <Text style={styles.appleBtnText}>Apple</Text>
            </Pressable>
          </View>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Pressable onPress={() => router.push('/(auth)/login' as any)}>
              <Text style={styles.loginLink}>Log In</Text>
            </Pressable>
          </View>

          {/* Bottom Indicator (Simulated Home Indicator spacer) */}
          <View style={styles.homeIndicator} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F9',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0B1C5A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 32,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    color: '#111827',
  },
  signupBtn: {
    backgroundColor: '#0B1C5A',
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  signupBtnDisabled: {
    opacity: 0.7,
  },
  signupBtnPressed: {
    opacity: 0.85,
  },
  signupBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6B7280',
    fontSize: 14,
  },
  socialGroup: {
    gap: 12,
    marginBottom: 40,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
  },
  socialBtnPressed: {
    opacity: 0.8,
  },
  googleBtn: {
    backgroundColor: '#fff',
    borderColor: '#E5E7EB',
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 10,
  },
  appleBtn: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  appleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: {
    color: '#6B7280',
    fontSize: 14,
  },
  loginLink: {
    color: '#0B1C5A',
    fontSize: 14,
    fontWeight: '700',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
  },
});
