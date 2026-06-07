import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 550,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.logoText}>MedVerify</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color="#0B1C5A" />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable body ────────────────────────────── */}
      <Animated.View
        style={[
          styles.body,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Welcome card */}
        <View style={styles.welcomeCard}>
          {/* Pill badge */}
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
          </View>

          <Text style={styles.welcomeTitle}>Welcome, Sarah!</Text>
          <Text style={styles.welcomeSubtitle}>
            Your account is verified and ready.
          </Text>
        </View>

        {/* Security badges row */}
        <View style={styles.badgeRow}>
          <View style={styles.securityCard}>
            <Ionicons name="shield-checkmark-outline" size={26} color="#0B1C5A" />
            <Text style={styles.securityLabel}>IDENTITY SECURE</Text>
          </View>

          <View style={styles.securityCard}>
            <Ionicons name="server-outline" size={26} color="#0B1C5A" />
            <Text style={styles.securityLabel}>VAULT LINKED</Text>
          </View>
        </View>

        {/* Doctor illustration */}
        <View style={styles.doctorCard}>
          <Image
            source={require("../../../../assets/images/doctor-illustration.png")}
            style={styles.doctorImage}
            resizeMode="cover"
          />
        </View>
      </Animated.View>

      {/* ── Fixed bottom ───────────────────────────────── */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          onPress={() => router.replace("/(user)/home")}
          style={styles.ctaButton}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Go to Home</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>

        <View style={styles.aesRow}>
          <Ionicons name="lock-closed" size={11} color="#8E9CB2" />
          <Text style={styles.aesText}>AES-256 ENCRYPTED ENVIRONMENT</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0B1C5A",
    letterSpacing: -0.3,
  },
  helpButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  /* Body */
  body: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 12,
  },
  /* Welcome card */
  welcomeCard: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  checkBadge: {
    width: 56,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0B1C5A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    shadowColor: "#0B1C5A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0B1C5A",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: "#5A677B",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 22,
  },
  /* Security badges */
  badgeRow: {
    flexDirection: "row",
    gap: 12,
  },
  securityCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  securityLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#5A677B",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  /* Doctor image */
  doctorCard: {
    flex: 1,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "#C8E6E4",
    minHeight: 220,
  },
  doctorImage: {
    width: "100%",
    height: "100%",
  },
  /* Bottom */
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 14,
  },
  ctaButton: {
    height: 56,
    backgroundColor: "#0B1C5A",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#0B1C5A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  aesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  aesText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#8E9CB2",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
});
