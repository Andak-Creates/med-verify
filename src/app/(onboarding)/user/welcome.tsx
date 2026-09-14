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
import { MedVerifyLogo } from "../../../components/MedVerifyLogo";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "@/i18n";

export default function WelcomeScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
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

  const displayName = user?.fullName?.split(' ')[0] || user?.username || 'there';

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <MedVerifyLogo size="xs" showText={true} textColor="#0B1C5A" />
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
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
          </View>

          <Text style={styles.welcomeTitle}>{t.home.greeting}, {displayName}!</Text>
          <Text style={styles.welcomeSubtitle}>
            Your account is verified and ready.
          </Text>
        </View>

        {/* Security badges row */}
        <View style={styles.badgeRow}>
          <View style={styles.securityCard}>
            <Ionicons name="shield-checkmark-outline" size={26} color="#0B1C5A" />
            <Text style={styles.securityLabel}>SAFETY VERIFIED</Text>
          </View>

          <View style={styles.securityCard}>
            <Ionicons name="finger-print-outline" size={26} color="#0B1C5A" />
            <Text style={styles.securityLabel}>ACCOUNT SECURED</Text>
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
          onPress={() => router.replace("/(user)/home" as any)}
          style={styles.ctaButton}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Start Scanning</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>

        <View style={styles.aesRow}>
          <Ionicons name="lock-closed" size={11} color="#8E9CB2" />
          <Text style={styles.aesText}>OFFICIAL REGULATORY DATABASE</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 12,
  },
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
