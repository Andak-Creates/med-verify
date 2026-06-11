import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TYPE_LABELS: Record<
  string,
  { label: string; icon: string; price: string }
> = {
  video: { label: "Video Call", icon: "videocam-outline", price: "₦2,500" },
  chat: {
    label: "Text Chat",
    icon: "chatbubble-ellipses-outline",
    price: "₦1,500",
  },
  phone: { label: "Phone Call", icon: "call-outline", price: "₦2,000" },
  both: { label: "Call & Chat", icon: "headset-outline", price: "₦5,000" },
};

export default function BookingConfirmScreen() {
  const router = useRouter();
  const { day, time, type, urgency, price } = useLocalSearchParams<{
    day: string;
    time: string;
    type: string;
    urgency: string;
    price: string;
  }>();
  const info = TYPE_LABELS[type ?? "both"] ?? TYPE_LABELS.both;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 10,
        stiffness: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const ref = `BK-${Math.floor(100000 + Math.random() * 900000)}`;

  const rows = [
    { label: "Session Type", value: info.label, icon: info.icon },
    { label: "Date", value: day ?? "—", icon: "calendar-outline" },
    { label: "Time", value: time ?? "—", icon: "time-outline" },
    {
      label: "Priority",
      value: urgency === "high" ? "⚡ High" : "Normal",
      icon: "flag-outline",
    },
    {
      label: "Amount",
      value: price ?? info.price,
      icon: "card-outline",
    },
    { label: "Reference", value: ref, icon: "receipt-outline" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Checkmark hero */}
        <Animated.View
          style={[styles.heroSection, { transform: [{ scale: scaleAnim }] }]}
        >
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark-circle" size={68} color="#16a34a" />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Title block */}
          <Text style={styles.title}>Booking Confirmed! 🎉</Text>
          <Text style={styles.subtitle}>
            Your consultation has been scheduled.{"\n"}You'll receive a reminder
            before the session.
          </Text>

          {/* Booking details card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color="#0B1C5A"
                />
              </View>
              <Text style={styles.cardHeading}>Booking Details</Text>
            </View>

            {rows.map((row, i) => (
              <View
                key={row.label}
                style={[styles.row, i < rows.length - 1 && styles.rowBorder]}
              >
                <View style={styles.rowIcon}>
                  <Ionicons name={row.icon as any} size={15} color="#0B1C5A" />
                </View>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowValue} numberOfLines={1}>
                  {row.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Status pill */}
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              Pharmacist will be notified shortly
            </Text>
          </View>

          {/* CTA buttons */}
          <TouchableOpacity
            onPress={() =>
              router.replace("/(user)/pharmacy/consultation-live" as any)
            }
            style={styles.primaryBtn}
          >
            <Ionicons name={info.icon as any} size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Join Session Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/(user)/home" as any)}
            style={styles.secondaryBtn}
          >
            <Ionicons name="home-outline" size={16} color="#6B7280" />
            <Text style={styles.secondaryLink}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 65,
  },

  heroSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F0FDF4",
    borderWidth: 3,
    borderColor: "#BBF7D0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#16a34a",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0B1C5A",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },

  card: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: "#0B1C5A",
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F3FA",
  },
  cardHeaderIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#EEF1FB",
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeading: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0B1C5A",
    letterSpacing: 0.5,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#EEF1FB",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowLabel: {
    flex: 1,
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
  rowValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0B1C5A",
    textAlign: "right",
    flexShrink: 1,
    marginLeft: 8,
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,163,74,0.1)",
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    marginBottom: 24,
    alignSelf: "center",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#16a34a",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16a34a",
  },

  primaryBtn: {
    width: "100%",
    backgroundColor: "#0B1C5A",
    borderRadius: 16,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#0B1C5A",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
    marginBottom: 12,
  },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },

  secondaryBtn: {
    width: "100%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  secondaryLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },
});
