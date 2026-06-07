import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#0B1C5A" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name={submitted ? "mail-unread" : "lock-closed"} size={36} color="#0B1C5A" />
          </View>
          
          <Text style={styles.title}>{submitted ? 'Check your email' : 'Reset Password'}</Text>
          <Text style={styles.subtitle}>
            {submitted 
              ? `We've sent a password reset link to ${email || 'your email address'}.`
              : 'Enter the email associated with your account and weâ€™ll send an email with instructions to reset your password.'}
          </Text>

          {!submitted ? (
            <>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#8E9CB2" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#8E9CB2"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <TouchableOpacity style={styles.btn} onPress={() => setSubmitted(true)}>
                <Text style={styles.btnText}>Send Reset Link</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.btn} onPress={() => router.push('/(auth)/login' as any)}>
              <Text style={styles.btnText}>Back to Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  content: { flex: 1, paddingHorizontal: 28, paddingTop: 40 },
  iconWrap: { width: 72, height: 72, borderRadius: 24, backgroundColor: '#EEF1FB', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '900', color: '#0B1C5A', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 24, marginBottom: 36 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, height: 60, marginBottom: 24, borderWidth: 1, borderColor: '#E5E7EB' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  btn: { backgroundColor: '#0B1C5A', borderRadius: 16, height: 60, alignItems: 'center', justifyContent: 'center', shadowColor: '#0B1C5A', shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

