import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
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
    <View className="flex-1 px-6 pt-20 pb-10">
      
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <View className="bg-[#0b1c5a] w-10 h-10 rounded-full items-center justify-center mr-3">
          <Text className="text-white font-bold text-sm">✓</Text>
        </View>
        <Text className="text-2xl font-extrabold text-[#0b1c5a]">MedVerify</Text>
      </View>

      <View className="flex-1 justify-center">
        <Text className="text-3xl font-extrabold text-[#0b1c5a] leading-tight mb-2">
          Welcome to MedVerify.
        </Text>
        <Text className="text-2xl font-bold text-[#0b1c5a] mb-10">
          Choose your role to continue.
        </Text>

        {/* Role Options */}
        <View>
          <Pressable 
            onPress={() => setSelectedRole('user')}
            className={`flex-row items-center p-6 rounded-3xl border ${
              selectedRole === 'user' ? 'bg-white border-[#0b1c5a] shadow-lg' : 'bg-white/60 border-white/50 shadow-sm'
            }`}
          >
            <View className="w-12 h-12 rounded-full bg-gray-200/80 items-center justify-center mr-4">
              <Ionicons name="person-outline" size={24} color="#0b1c5a" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-[#0b1c5a] mb-1">I am a User</Text>
              <Text className="text-gray-600 text-sm leading-tight">
                Verify my medications and chat with health assistants.
              </Text>
            </View>
          </Pressable>

          <Pressable 
            onPress={() => setSelectedRole('pharmacist')}
            className={`flex-row items-center p-6 rounded-3xl border mt-5 ${
              selectedRole === 'pharmacist' ? 'bg-white border-[#0b1c5a] shadow-lg' : 'bg-white/60 border-white/50 shadow-sm'
            }`}
          >
            <View className="w-12 h-12 rounded-full bg-gray-200/80 items-center justify-center mr-4">
              <Ionicons name="medkit-outline" size={24} color="#0b1c5a" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-[#0b1c5a] mb-1">I am a Pharmacist</Text>
              <Text className="text-gray-600 text-sm leading-tight">
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
        className={`w-full py-4 rounded-full items-center ${
          selectedRole ? 'bg-[#0b1c5a]' : 'bg-[#0b1c5a]/50'
        }`}
      >
        <Text className="text-white font-semibold text-lg">
          Continue with identity
        </Text>
      </Pressable>

    </View>
  );
}
