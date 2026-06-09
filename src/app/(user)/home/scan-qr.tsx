import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScanQrScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanned, setScanned] = useState(false);

  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (scanned) return;
    setScanned(true);
    setTimeout(() => {
      router.push({
        pathname: "/(user)/home/result",
        params: { code: data },
      } as any);
    }, 1000);
  };

  const isCameraAvailable = permission && permission.granted;

  const translateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 260],
  });

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F4F6FB" }}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0B1C5A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MedVerify</Text>
        <View style={styles.avatar}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100",
            }}
            style={{ width: "100%", height: "100%" }}
          />
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
        {/* Title */}
        <Text style={styles.title}>Scan Medication</Text>
        <Text style={styles.subtitle}>
          Align the QR code or barcode within the frame to verify authenticity.
        </Text>

        {/* Camera Box */}
        <View style={styles.cameraBox}>
          {isCameraAvailable ? (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              enableTorch={torchEnabled}
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "ean13", "ean8", "code128"],
              }}
              onBarcodeScanned={handleBarCodeScanned}
            />
          ) : (
            <View style={{ flex: 1, backgroundColor: "#1a1a2e" }}>
              <Image
                source={require("../../../../assets/images/scanner-medication.png")}
                style={{ width: "100%", height: "100%", opacity: 0.9 }}
                resizeMode="cover"
              />
              {(!permission || !permission.granted) && (
                <View style={styles.permissionOverlay}>
                  <Text style={styles.permissionText}>
                    Camera permission required for live scanning.
                  </Text>
                  <TouchableOpacity
                    onPress={requestPermission}
                    style={styles.grantBtn}
                  >
                    <Text style={styles.grantBtnText}>Grant Camera Access</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setScanned(true);
                      setTimeout(() => {
                        router.push({
                          pathname: "/(user)/home/result",
                          params: { code: "MOCK_NAFDAC_12345" },
                        } as any);
                      }, 1000);
                    }}
                    style={{ marginTop: 10 }}
                  >
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        fontSize: 11,
                        fontWeight: "bold",
                        textDecorationLine: "underline",
                      }}
                    >
                      Simulate verification scan
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Corner Brackets */}
          <View style={styles.bracketsContainer} pointerEvents="none">
            {/* Top row */}
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View
                style={[
                  styles.corner,
                  {
                    borderTopWidth: 3,
                    borderLeftWidth: 3,
                    borderTopLeftRadius: 8,
                  },
                ]}
              />
              <View
                style={[
                  styles.corner,
                  {
                    borderTopWidth: 3,
                    borderRightWidth: 3,
                    borderTopRightRadius: 8,
                  },
                ]}
              />
            </View>
            {/* Bottom row */}
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View
                style={[
                  styles.corner,
                  {
                    borderBottomWidth: 3,
                    borderLeftWidth: 3,
                    borderBottomLeftRadius: 8,
                  },
                ]}
              />
              <View
                style={[
                  styles.corner,
                  {
                    borderBottomWidth: 3,
                    borderRightWidth: 3,
                    borderBottomRightRadius: 8,
                  },
                ]}
              />
            </View>
          </View>

          {/* Laser Line */}
          <Animated.View
            style={[styles.laserLine, { transform: [{ translateY }] }]}
          />

          {/* Torch Button */}
          <TouchableOpacity
            onPress={() => setTorchEnabled(!torchEnabled)}
            style={styles.torchBtn}
          >
            <Ionicons
              name={torchEnabled ? "flash" : "flashlight-outline"}
              size={20}
              color="#0B1C5A"
            />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => router.push("/(user)/home/scan-image" as any)}
            style={styles.actionCard}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#EEF1FB" }]}>
              <Ionicons name="camera-outline" size={22} color="#0B1C5A" />
            </View>
            <Text style={styles.actionLabel}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(user)/home/scan-manual" as any)}
            style={styles.actionCard}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#E0F7FA" }]}>
              <Ionicons name="keypad-outline" size={22} color="#0B1C5A" />
            </View>
            <Text style={styles.actionLabel}>Enter NAFDAC</Text>
          </TouchableOpacity>
        </View>

        {/* Last Verified Pill */}
        <View style={styles.verifiedPill}>
          <Ionicons name="checkbox" size={20} color="#10B981" />
          <Text style={styles.verifiedText}>
            Last verified:{" "}
            <Text style={{ fontWeight: "700", color: "#374151" }}>
              Paracetamol BP 500mg
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0B1C5A",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0B1C5A",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#8E9CB2",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  cameraBox: {
    width: "100%",
    height: 300,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#000",
    position: "relative",
    shadowColor: "#0b1c5a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  bracketsContainer: {
    position: "absolute",
    top: 24,
    left: 24,
    right: 24,
    bottom: 24,
    justifyContent: "space-between",
  },
  corner: {
    width: 28,
    height: 28,
    borderColor: "#0B1C5A",
  },
  laserLine: {
    position: "absolute",
    left: "15%",
    right: "15%",
    height: 2,
    backgroundColor: "#00D2FF",
    borderRadius: 1,
    shadowColor: "#00D2FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  torchBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0B1C5A",
  },
  verifiedPill: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  verifiedText: {
    fontSize: 13,
    color: "#4B5563",
    marginLeft: 8,
  },
  permissionOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  permissionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  grantBtn: {
    backgroundColor: "#0B1C5A",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  grantBtnText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
