import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RoleSelectScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'user' | 'pharmacist' | null>(null);

  const handleContinue = () => {
    if (selectedRole === 'user') {
      router.push('/(onboarding)/user/slides' as any);
    } else if (selectedRole === 'pharmacist') {
      router.push('/(onboarding)/pharmacist/slides' as any);
    }
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoCheck}>✓</Text>
        </View>
        <Text style={styles.logoText}>MedVerify</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome to MedVerify.</Text>
        <Text style={styles.subtitle}>Choose your role to continue.</Text>

        {/* Role Options */}
        <View>
          <Pressable
            onPress={() => setSelectedRole('user')}
            style={[
              styles.roleCard,
              selectedRole === 'user' ? styles.roleCardSelected : styles.roleCardDefault,
            ]}
          >
            <View style={styles.roleIcon}>
              <Ionicons name="person-outline" size={24} color="#0b1c5a" />
            </View>
            <View style={styles.roleTextContainer}>
              <Text style={styles.roleTitle}>I am a User</Text>
              <Text style={styles.roleDesc}>
                Verify my medications and chat with health assistants.
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setSelectedRole('pharmacist')}
            style={[
              styles.roleCard,
              styles.roleCardGap,
              selectedRole === 'pharmacist' ? styles.roleCardSelected : styles.roleCardDefault,
            ]}
          >
            <View style={styles.roleIcon}>
              <Ionicons name="medkit-outline" size={24} color="#0b1c5a" />
            </View>
            <View style={styles.roleTextContainer}>
              <Text style={styles.roleTitle}>I am a Pharmacist</Text>
              <Text style={styles.roleDesc}>
                Manage consultations and verify professional requests.
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Continue Button */}
      <Pressable
        onPress={handleContinue}
        disabled={!selectedRole}
        style={[styles.continueBtn, { opacity: selectedRole ? 1 : 0.5 }]}
      >
        <Text style={styles.continueBtnText}>Continue with identity</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    backgroundColor: '#0b1c5a',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoCheck: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0b1c5a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0b1c5a',
    lineHeight: 36,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0b1c5a',
    marginBottom: 40,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
  },
  roleCardGap: {
    marginTop: 20,
  },
  roleCardSelected: {
    backgroundColor: '#ffffff',
    borderColor: '#0b1c5a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  roleCardDefault: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(209,213,219,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0b1c5a',
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
  continueBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: '#0b1c5a',
  },
  continueBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 17,
  },
});

