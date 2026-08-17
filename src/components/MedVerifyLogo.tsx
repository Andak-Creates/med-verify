import React from "react";
import { Image, StyleSheet, Text, View, ViewStyle } from "react-native";

interface MedVerifyLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  textColor?: string;
  style?: ViewStyle;
}

export function MedVerifyLogo({
  size = "md",
  showText = false,
  textColor = "#0B1C5A",
  style,
}: MedVerifyLogoProps) {
  const iconSizes = {
    xs: 24,
    sm: 36,
    md: 48,
    lg: 64,
    xl: 88,
  };

  const fontSizes = {
    xs: 14,
    sm: 18,
    md: 22,
    lg: 28,
    xl: 34,
  };

  const iconDim = iconSizes[size] || 48;
  const fontSize = fontSizes[size] || 22;

  return (
    <View style={[styles.container, showText && styles.row, style]}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={{
          width: iconDim,
          height: iconDim,
          borderRadius: iconDim * 0.22,
        }}
        resizeMode="contain"
      />
      {showText && (
        <Text style={[styles.text, { color: textColor, fontSize }]}>
          MedVerify
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  text: {
    fontWeight: "800",
    letterSpacing: -0.5,
  },
});


