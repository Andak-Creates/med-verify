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

export default function NameAssistantScreen() {
  const router = useRouter();
  const [name, setName] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#0B1C5A" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/(user)/ai-chat' as any)}>
            <Text style={styles.skipBtn}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name="sparkles" size={36} color="#fff" />
          </View>
          
          <Text style={styles.title}>Name your Assistant</Text>
          <Text style={styles.subtitle}>
            Give your AI health companion a friendly name so it feels more personal when you chat.
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons name="happy-outline" size={20} color="#8E9CB2" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. HealthBot, Baymax..."
              placeholderTextColor="#8E9CB2"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <TouchableOpacity 
            style={[styles.btn, !name.trim() && { opacity: 0.5 }]} 
            onPress={() => router.replace('/(user)/ai-chat' as any)}
            disabled={!name.trim()}
          >
            <Text style={styles.btnText}>Save Name</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  skipBtn: { fontSize: 15, fontWeight: '700', color: '#8E9CB2' },
  content: { flex: 1, paddingHorizontal: 28, paddingTop: 40 },
  iconWrap: { width: 72, height: 72, borderRadius: 24, backgroundColor: '#0B1C5A', alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: '#0B1C5A', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  title: { fontSize: 28, fontWeight: '900', color: '#0B1C5A', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 24, marginBottom: 36 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, height: 60, marginBottom: 24, borderWidth: 1, borderColor: '#E5E7EB' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  btn: { backgroundColor: '#0B1C5A', borderRadius: 16, height: 60, alignItems: 'center', justifyContent: 'center', shadowColor: '#0B1C5A', shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

