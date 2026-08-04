import { getApiErrorMessage } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaywallScreen() {
  const router = useRouter();
  const { refreshProfile, isPro } = useAuth();

  // Idempotent — a purchase (handled globally) flips isPro via the effect below,
  // while a manual restore calls this directly; either way it runs once.
  const activatedRef = useRef(false);
  const onProActivated = async () => {
    if (activatedRef.current) return;
    activatedRef.current = true;
    await refreshProfile();
    Alert.alert(
      "Welcome to Pro! 🎉",
      "Your subscription is active. Enjoy unlimited access.",
    );
    router.back();
  };

  // Apple purchases are verified + activated app-wide (AppleIapBootstrap →
  // refreshProfile), so the paywall reacts to Pro turning on rather than to a
  // per-hook callback.
  useEffect(() => {
    if (isPro) onProActivated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro]);

  const {
    loading: subLoading,
    error,
    appleSubscriptions,
    startSubscription,
    restoreOrSync,
    isIos,
  } = useSubscription((user) => {
    if (user.isPro) {
      onProActivated();
    }
  });

  const [checking, setChecking] = useState(false);

  const handleSubscribe = async (sku?: string) => {
    try {
      const res = await startSubscription(sku);
      if (!isIos && res?.authorizationUrl) {
        await WebBrowser.openBrowserAsync(res.authorizationUrl);
        // The user should come back and click "Already paid? Refresh status" if webhook is missed.
      }
    } catch (err: any) {
      Alert.alert(
        "Could not start payment",
        err.message || "Please try again in a moment.",
      );
    }
  };

  const handleRefreshStatus = async () => {
    if (checking) return;
    setChecking(true);
    try {
      const user = await restoreOrSync();
      if (user?.isPro) {
        await onProActivated();
      } else {
        Alert.alert(
          "No active subscription",
          "We couldn’t find an active subscription for your account yet.",
        );
      }
    } catch (err) {
      Alert.alert(
        "Could not check status",
        getApiErrorMessage(err, "Please try again in a moment."),
      );
    } finally {
      setChecking(false);
    }
  };

  const openTerms = () => Linking.openURL("https://medverify.app/terms");
  const openPrivacy = () => Linking.openURL("https://medverify.app/privacy");

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color="#0B1C5A" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconWrap}>
          <Ionicons name="diamond" size={40} color="#E5A800" />
        </View>

        <Text style={styles.title}>Upgrade to Pro</Text>
        <Text style={styles.subtitle}>
          You've used your 3 free scans. Upgrade to unlock unlimited drug
          verification, AI health insights, and priority pharmacist
          consultations.
        </Text>

        {/* Benefits list */}
        {BENEFITS.map((b) => (
          <View key={b} style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color="#0B1C5A" />
            <Text style={styles.benefitText}>{b}</Text>
          </View>
        ))}

        {/* Plan Cards */}
        {isIos && appleSubscriptions.length > 0 ? (
          appleSubscriptions.map((sub, index) => {
            const skuId =
              sub.productId ||
              (sub as any).id ||
              "com.medverify.subscription.monthly";
            const priceText =
              (sub as any).localizedPrice ||
              (sub as any).displayPrice ||
              "₦3,500";
            return (
              <TouchableOpacity
                key={skuId || index}
                style={styles.planCard}
                onPress={() => handleSubscribe(skuId)}
                disabled={subLoading}
              >
                <View style={styles.planLeft}>
                  <Text style={styles.planTitle}>
                    {sub.title || "MedVerify Pro"}
                  </Text>
                  <Text style={styles.planDesc}>
                    {sub.description || "Unlimited scans & AI insights"}
                  </Text>
                </View>
                <View style={styles.planRight}>
                  <Text style={styles.planPrice}>{priceText}</Text>
                  <Text style={styles.planPeriod}>/month</Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.planCard}>
            <View style={styles.planLeft}>
              <Text style={styles.planTitle}>Pro Plan</Text>
              <Text style={styles.planDesc}>Unlimited everything</Text>
            </View>
            <View style={styles.planRight}>
              <Text style={styles.planPrice}>
                {isIos ? "Loading..." : "₦3,000"}
              </Text>
              <Text style={styles.planPeriod}>{isIos ? "" : "/month"}</Text>
            </View>
          </View>
        )}

        {error && (
          <Text style={{ color: "red", textAlign: "center", marginBottom: 10 }}>
            Error: {error}
          </Text>
        )}

        {/* Temporary Debug Log Window */}
        <View
          style={{
            backgroundColor: "#f3f4f6",
            padding: 10,
            borderRadius: 8,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: "#d1d5db",
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "bold",
              marginBottom: 4,
              color: "#374151",
            }}
          >
            🛠 IAP Debug Logs:
          </Text>
          <Text style={{ fontSize: 9, color: "#4b5563" }}>
            Platform: {isIos ? "iOS" : "Other"}
          </Text>
          <Text style={{ fontSize: 9, color: "#4b5563" }}>
            SKUs Found: {appleSubscriptions.length}
          </Text>
          <Text style={{ fontSize: 9, color: "#4b5563" }}>
            Data:{" "}
            {JSON.stringify(
              appleSubscriptions.map((s) => ({
                id: s.productId,
                title: s.title,
                price: (s as any).localizedPrice,
              })),
            )}
          </Text>
        </View>

        {/* CTA */}
        {(!isIos || appleSubscriptions.length === 0) && (
          <TouchableOpacity
            style={[styles.btn, subLoading && { opacity: 0.7 }]}
            onPress={() => handleSubscribe()}
            activeOpacity={0.85}
            disabled={subLoading}
          >
            {subLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>
                {isIos ? "Subscribe with Apple Pay" : "Subscribe via Paystack"}
              </Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleRefreshStatus}
          disabled={subLoading || checking}
          style={styles.refreshBtn}
          activeOpacity={0.7}
        >
          {checking ? (
            <ActivityIndicator size="small" color="#0B1C5A" />
          ) : (
            <Text style={styles.refreshText}>
              {isIos
                ? "Restore Apple Purchases"
                : "Already paid? Refresh status"}
            </Text>
          )}
        </TouchableOpacity>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 10,
            marginTop: 10,
          }}
        >
          <TouchableOpacity onPress={openTerms}>
            <Text style={styles.footerText}>Terms of Use</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>•</Text>
          <TouchableOpacity onPress={openPrivacy}>
            <Text style={styles.footerText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const BENEFITS = [
  "Unlimited drug verification scans",
  "AI-powered health insights",
  "Priority pharmacist consultations",
  "Full scan & consultation history",
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  header: { paddingHorizontal: 20, alignItems: "flex-end" },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#0B1C5A",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 23,
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  benefitText: { fontSize: 15, color: "#374151", fontWeight: "500", flex: 1 },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: "#0B1C5A",
    marginTop: 24,
    marginBottom: 24,
    shadowColor: "#0B1C5A",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  planLeft: { gap: 4, flex: 1 },
  planTitle: { fontSize: 17, fontWeight: "800", color: "#0B1C5A" },
  planDesc: { fontSize: 13, color: "#6B7280" },
  planRight: { alignItems: "flex-end" },
  planPrice: { fontSize: 26, fontWeight: "900", color: "#0B1C5A" },
  planPeriod: { fontSize: 13, color: "#6B7280", marginTop: -2 },
  btn: {
    backgroundColor: "#0B1C5A",
    borderRadius: 16,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0B1C5A",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 14,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  refreshBtn: {
    alignItems: "center",
    justifyContent: "center",
    height: 32,
    marginBottom: 10,
  },
  refreshText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0B1C5A",
    textDecorationLine: "underline",
  },
  footerText: {
    textAlign: "center",
    fontSize: 12,
    color: "#8E9CB2",
    textDecorationLine: "underline",
  },
});
