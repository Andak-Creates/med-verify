import React from 'react';
import { View, Text } from 'react-native';

interface MedVerifyLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export function MedVerifyLogo({ size = 'md', showText = true }: MedVerifyLogoProps) {
  const scale = {
    sm: { box: 36, radius: 10, vWidth: 16, vHeight: 12, text: 16 },
    md: { box: 48, radius: 14, vWidth: 22, vHeight: 16, text: 20 },
    lg: { box: 72, radius: 20, vWidth: 32, vHeight: 24, text: 28 },
    xl: { box: 96, radius: 28, vWidth: 44, vHeight: 32, text: 36 },
  }[size];

  return (
    <View className="items-center justify-center flex-row gap-3">
      {/* Hyper-Minimal Icon Squircle */}
      <View
        style={{
          width: scale.box,
          height: scale.box,
          borderRadius: scale.radius,
          backgroundColor: '#0B1C5A',
        }}
        className="items-center justify-center shadow-sm"
      >
        {/* Minimalist 'V' Checkmark Mark */}
        <View
          style={{
            width: scale.vWidth,
            height: scale.vHeight,
            borderLeftWidth: 3,
            borderBottomWidth: 3,
            borderColor: '#00C6FF',
            transform: [{ rotate: '-45deg' }],
            marginTop: -2,
            marginLeft: 2,
          }}
        />
      </View>

      {/* Clean Wordmark */}
      {showText && (
        <Text
          style={{ fontSize: scale.text }}
          className="font-bold text-[#0B1C5A] tracking-tight"
        >
          Med<Text className="text-[#00C6FF]">Verify</Text>
        </Text>
      )}
    </View>
  );
}
