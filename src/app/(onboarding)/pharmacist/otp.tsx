import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OtpScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(55);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/(onboarding)/pharmacist/license-upload' as any);
    }, 1000);
  };

  const renderCodeBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      const char = code[i] || '';
      boxes.push(
        <View key={i} style={[styles.codeBox, char && styles.codeBoxFilled]}>
          <Text style={styles.codeText}>{char}</Text>
        </View>
      );
    }
    return boxes;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Verify Identity</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to your registered device. Please enter it below to continue.
          </Text>

          {/* Hidden Input for Keyboard */}
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            style={styles.hiddenInput}
            autoFocus
          />

          {/* Code Boxes */}
          <Pressable style={styles.codeContainer} onPress={() => inputRef.current?.focus()}>
            {renderCodeBoxes()}
          </Pressable>

          {/* Resend Timer */}
          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't receive code? </Text>
            {timer > 0 ? (
              <Text style={styles.resendLinkDisabled}>Resend in 0:{timer.toString().padStart(2, '0')}</Text>
            ) : (
              <TouchableOpacity onPress={() => setTimer(55)}>
                <Text style={styles.resendLink}>Resend now</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Shield Image */}
          <View style={styles.imageContainer}>
            <View style={styles.shieldWrapper}>
              <Ionicons name="shield-checkmark" size={120} color="#93C5FD" style={{ opacity: 0.8 }} />
              <View style={styles.crossOverlay}>
                <Ionicons name="add" size={40} color="#fff" style={{ fontWeight: '900' }} />
              </View>
            </View>
          </View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Verify Button */}
          <Pressable
            onPress={handleVerify}
            disabled={loading || code.length !== 6}
            style={({ pressed }) => [
              styles.verifyBtn,
              (loading || code.length !== 6) && styles.verifyBtnDisabled,
              pressed && styles.verifyBtnPressed
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.btnContent}>
                <Text style={styles.verifyBtnText}>Verify & Continue</Text>
                <Ionicons name="chevron-forward" size={18} color="#fff" style={{ marginTop: 2 }} />
              </View>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0B1C5A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 40,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  codeBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxFilled: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#0B1C5A',
  },
  codeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  resendText: {
    fontSize: 15,
    color: '#4B5563',
  },
  resendLinkDisabled: {
    fontSize: 15,
    color: '#8B5CF6',
  },
  resendLink: {
    fontSize: 15,
    color: '#6D28D9',
    fontWeight: '700',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  shieldWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtn: {
    backgroundColor: '#0B1C5A',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
  },
  verifyBtnDisabled: {
    opacity: 0.7,
  },
  verifyBtnPressed: {
    opacity: 0.85,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  verifyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
