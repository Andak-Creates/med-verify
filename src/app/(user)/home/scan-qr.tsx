import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter, useFocusEffect } from "expo-router";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getApiErrorMessage } from "@/api/client";
import { useAuth } from "../../../context/AuthContext";
import { verifyDrug } from "@/services/drugs.service";
import { useLanguage } from "@/i18n";

export default function ScanQrScreen() {
  const router = useRouter();
  const { user, isPro, scanCount, incrementScanCount } = useAuth();
  const { t } = useLanguage();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanned, setScanned] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setScanned(false);
      if (!isPro && scanCount >= 3) {
        router.replace('/(user)/account/paywall' as any);
      }
    }, [isPro, scanCount])
  );

  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    if (!isPro && scanCount >= 3) {
      router.replace('/(user)/account/paywall' as any);
      return;
    }
    setScanned(true);
    try {
      const result = await verifyDrug(data.trim());
      incrementScanCount();
      router.push({
        pathname: "/(user)/home/result",
        params: { code: data.trim(), result: JSON.stringify(result) },
      } as any);
    } catch (err) {
      Alert.alert(
        t.common.error,
        getApiErrorMessage(err, "Could not verify this code. Please try again."),
        [{ text: "OK", onPress: () => setScanned(false) }],
      );
    }
  };

  const isCameraAvailable = permission && permission.granted;

  const translateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 240],
  });

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0B1C5A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.home.qrScan}</Text>
        <View style={styles.avatar}>
          {user?.profileImage ? (
            <Image
              source={{ uri: user.profileImage }}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#EEF1FB",
              }}
            >
              <Ionicons name="person-outline" size={18} color="#0B1C5A" />
            </View>
          )}
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10 }}>
        <Text style={styles.title}>{t.home.qrScan}</Text>
        <Text style={styles.subtitle}>
          {t.scanner.alignBarcode}
        </Text>

        {/* Camera Box */}
        <View style={styles.cameraBox}>
          {isCameraAvailable ? (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              enableTorch={torchEnabled}
              barcodeScannerSettings={{
                barcodeTypes: [
                  "qr",
                  "ean13",
                  "ean8",
                  "code128",
                  "code39",
                  "datamatrix",
                ],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />
          ) : (
            <View
              style={{
                flex: 1,
                backgroundColor: "#0F172A",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
              }}
            >
              <Ionicons name="camera-outline" size={48} color="#fff" style={{ marginBottom: 12 }} />
              <Text style={{ color: "#fff", textAlign: "center", fontSize: 14, marginBottom: 16 }}>
                Camera access is needed to scan barcodes.
              </Text>
              <TouchableOpacity
                onPress={requestPermission}
                style={{
                  backgroundColor: "#0B1C5A",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Allow Camera</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Scanner Overlay */}
          <View style={styles.scanTarget}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />

            {/* Animated Laser Line */}
            {isCameraAvailable && (
              <Animated.View
                style={[
                  styles.laserLine,
                  { transform: [{ translateY }] },
                ]}
              />
            )}
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => setTorchEnabled((prev) => !prev)}
          >
            <Ionicons
              name={torchEnabled ? "flash" : "flash-off"}
              size={22}
              color={torchEnabled ? "#F59E0B" : "#0B1C5A"}
            />
            <Text style={styles.controlText}>
              {torchEnabled ? t.scanner.flashOn : t.scanner.flashOff}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => router.push("/(user)/home/scan-manual" as any)}
          >
            <Ionicons name="keypad-outline" size={22} color="#0B1C5A" />
            <Text style={styles.controlText}>Manual Entry</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0B1C5A",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0B1C5A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 16,
  },
  cameraBox: {
    height: 380,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#000",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  scanTarget: {
    width: 250,
    height: 250,
    position: "relative",
    alignItems: "center",
  },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 28,
    height: 28,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#38BDF8",
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#38BDF8",
    borderTopRightRadius: 16,
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 28,
    height: 28,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#38BDF8",
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#38BDF8",
    borderBottomRightRadius: 16,
  },
  laserLine: {
    width: 230,
    height: 2,
    backgroundColor: "#EF4444",
    shadowColor: "#EF4444",
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 24,
  },
  controlBtn: {
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0B1C5A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    minWidth: 130,
  },
  controlText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0B1C5A",
  },
});
