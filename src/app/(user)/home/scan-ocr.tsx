import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter, useFocusEffect } from "expo-router";
import { useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getApiErrorMessage } from "@/api/client";
import { useAuth } from "../../../context/AuthContext";
import { scanDrugImage } from "@/services/drugs.service";
import { useLanguage } from "@/i18n";

export default function ScanOcrScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanning, setScanning] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useFocusEffect(
    useCallback(() => {
      setScanning(false);
    }, [])
  );

  const handleCapture = async () => {
    if (scanning || !cameraRef.current) return;
    setScanning(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (!photo?.uri) throw new Error('Failed to capture image');

      const result = await scanDrugImage(photo.uri);
      router.push({
        pathname: "/(user)/home/result",
        params: { code: result.extractedNafdac, result: JSON.stringify(result) },
      } as any);
    } catch (err: any) {
      setScanning(false);
      const status = err?.response?.status;
      if (status === 422) {
        Alert.alert(
          "No Registration Number Found",
          "Could not detect a registration number on the label. Ensure the number is clearly visible, well-lit, and in focus, then try again.",
        );
      } else {
        Alert.alert(
          "Scan Failed",
          getApiErrorMessage(err, "Could not process the image. Please try again."),
        );
      }
    }
  };

  const isCameraAvailable = permission?.granted;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0B1C5A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.home.cameraScan}</Text>
        <View style={styles.avatar}>
          {user?.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={{ width: "100%", height: "100%" }} />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#EEF1FB" }}>
              <Ionicons name="person-outline" size={18} color="#0B1C5A" />
            </View>
          )}
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10 }}>
        <Text style={styles.title}>{t.home.cameraScan}</Text>
        <Text style={styles.subtitle}>
          {t.scanner.alignCamera}
        </Text>

        {/* Camera Box */}
        <View style={styles.cameraBox}>
          {isCameraAvailable ? (
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing="back"
              enableTorch={torchEnabled}
            />
          ) : (
            <View style={{ flex: 1, backgroundColor: "#0F172A", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <Ionicons name="camera-outline" size={48} color="#fff" style={{ marginBottom: 12 }} />
              <Text style={{ color: "#fff", textAlign: "center", fontSize: 14, marginBottom: 16 }}>
                Camera access is needed to scan medication labels.
              </Text>
              <TouchableOpacity
                onPress={requestPermission}
                style={{ backgroundColor: "#0B1C5A", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Allow Camera</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Overlay Box */}
          <View style={styles.overlayArea}>
            <View style={styles.crosshairTL} />
            <View style={styles.crosshairTR} />
            <View style={styles.crosshairBL} />
            <View style={styles.crosshairBR} />

            {scanning && (
              <View style={styles.scanningOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.scanningText}>{t.scanner.analyzing}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.torchBtn}
            onPress={() => setTorchEnabled((prev) => !prev)}
          >
            <Ionicons
              name={torchEnabled ? "flash" : "flash-off"}
              size={22}
              color={torchEnabled ? "#F59E0B" : "#0B1C5A"}
            />
            <Text style={styles.torchText}>
              {torchEnabled ? t.scanner.flashOn : t.scanner.flashOff}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureBtn}
            onPress={handleCapture}
            disabled={scanning || !isCameraAvailable}
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.torchBtn}
            onPress={() => router.push("/(user)/home/scan-manual" as any)}
          >
            <Ionicons name="keypad-outline" size={22} color="#0B1C5A" />
            <Text style={styles.torchText}>Manual</Text>
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
  overlayArea: {
    width: "80%",
    height: "55%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    borderRadius: 16,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  crosshairTL: {
    position: "absolute",
    top: -2,
    left: -2,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#38BDF8",
    borderTopLeftRadius: 16,
  },
  crosshairTR: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#38BDF8",
    borderTopRightRadius: 16,
  },
  crosshairBL: {
    position: "absolute",
    bottom: -2,
    left: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#38BDF8",
    borderBottomLeftRadius: 16,
  },
  crosshairBR: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#38BDF8",
    borderBottomRightRadius: 16,
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(11,28,90,0.75)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  scanningText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  torchBtn: {
    alignItems: "center",
    gap: 4,
    width: 64,
  },
  torchText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0B1C5A",
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: "#0B1C5A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0B1C5A",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  captureInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#0B1C5A",
  },
});
