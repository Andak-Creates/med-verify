import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
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

export default function ScanOcrScreen() {
  const router = useRouter();
  const { user, incrementScanCount } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanning, setScanning] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleCapture = async () => {
    if (scanning || !cameraRef.current) return;
    setScanning(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (!photo?.uri) throw new Error('Failed to capture image');

      const result = await scanDrugImage(photo.uri);
      incrementScanCount();
      router.push({
        pathname: "/(user)/home/result",
        params: { code: result.extractedNafdac, result: JSON.stringify(result) },
      } as any);
    } catch (err: any) {
      setScanning(false);
      const status = err?.response?.status;
      if (status === 422) {
        Alert.alert(
          "No NAFDAC Number Found",
          "Could not detect a NAFDAC number on the label. Ensure the number is clearly visible, well-lit, and in focus, then try again.",
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F6FB" }} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0B1C5A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MedVerify</Text>
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

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
        <Text style={styles.title}>Scan Drug Label</Text>
        <Text style={styles.subtitle}>
          Point the camera at the NAFDAC number on the drug packaging and tap Capture.
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
            <View style={{ flex: 1, backgroundColor: "#1a1a2e" }}>
              <Image
                source={require("../../../../assets/images/scanner-medication.png")}
                style={{ width: "100%", height: "100%", opacity: 0.9 }}
                resizeMode="cover"
              />
              {(!permission || !permission.granted) && (
                <View style={styles.permissionOverlay}>
                  <Text style={styles.permissionText}>
                    Camera permission required for scanning.
                  </Text>
                  <TouchableOpacity onPress={requestPermission} style={styles.grantBtn}>
                    <Text style={styles.grantBtnText}>Grant Camera Access</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.replace("/(user)/home/scan-manual" as any)}
                    style={{ marginTop: 10 }}
                  >
                    <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "bold", textDecorationLine: "underline" }}>
                      Enter the NAFDAC number manually instead
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Corner Brackets */}
          <View style={styles.bracketsContainer} pointerEvents="none">
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={[styles.corner, { borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 }]} />
              <View style={[styles.corner, { borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 }]} />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={[styles.corner, { borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 }]} />
              <View style={[styles.corner, { borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 }]} />
            </View>
          </View>

          {/* OCR hint label */}
          <View style={styles.hintBadge} pointerEvents="none">
            <Ionicons name="text-outline" size={13} color="#fff" />
            <Text style={styles.hintText}>Aim at printed NAFDAC number</Text>
          </View>

          {/* Torch Button */}
          <TouchableOpacity onPress={() => setTorchEnabled(!torchEnabled)} style={styles.torchBtn}>
            <Ionicons name={torchEnabled ? "flash" : "flashlight-outline"} size={20} color="#0B1C5A" />
          </TouchableOpacity>

          {/* Loading overlay */}
          {scanning && (
            <View style={styles.scanningOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.scanningText}>Reading label…</Text>
            </View>
          )}
        </View>

        {/* Capture Button */}
        <TouchableOpacity
          style={[styles.captureBtn, (!isCameraAvailable || scanning) && { opacity: 0.5 }]}
          onPress={handleCapture}
          disabled={!isCameraAvailable || scanning}
        >
          <Ionicons name="camera" size={22} color="#fff" />
          <Text style={styles.captureBtnText}>Capture Label</Text>
        </TouchableOpacity>

        {/* Action row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => router.push("/(user)/home/scan-manual" as any)}
            style={styles.actionCard}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#E0F7FA" }]}>
              <Ionicons name="keypad-outline" size={22} color="#0B1C5A" />
            </View>
            <Text style={styles.actionLabel}>Enter NAFDAC</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(user)/home/scan-qr" as any)}
            style={styles.actionCard}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#F3E8FF" }]}>
              <Ionicons name="qr-code-outline" size={22} color="#0B1C5A" />
            </View>
            <Text style={styles.actionLabel}>Scan Barcode</Text>
          </TouchableOpacity>
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
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#0B1C5A" },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center",
  },
  avatar: { width: 38, height: 38, borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: "#E5E7EB" },
  title: { fontSize: 24, fontWeight: "800", color: "#0B1C5A", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#8E9CB2", textAlign: "center", marginBottom: 20, lineHeight: 22, paddingHorizontal: 10 },
  cameraBox: {
    width: "100%", height: 280, borderRadius: 28, overflow: "hidden",
    backgroundColor: "#000", position: "relative",
    shadowColor: "#0b1c5a", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10,
  },
  bracketsContainer: { position: "absolute", top: 24, left: 24, right: 24, bottom: 24, justifyContent: "space-between" },
  corner: { width: 28, height: 28, borderColor: "#0B1C5A" },
  hintBadge: {
    position: "absolute", bottom: 14, alignSelf: "center",
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  hintText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  torchBtn: {
    position: "absolute", top: 16, right: 16,
    width: 42, height: 42, borderRadius: 12, backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  scanningOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center", justifyContent: "center", gap: 14,
  },
  scanningText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  captureBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "#0B1C5A", borderRadius: 20, paddingVertical: 16, marginTop: 18,
  },
  captureBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  actionRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  actionCard: {
    flex: 1, backgroundColor: "#fff", borderRadius: 20, paddingVertical: 20,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#F0F0F0",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  actionIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  actionLabel: { fontSize: 13, fontWeight: "700", color: "#0B1C5A" },
  permissionOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 16,
  },
  permissionText: { color: "#fff", fontSize: 12, fontWeight: "bold", textAlign: "center", marginBottom: 12 },
  grantBtn: { backgroundColor: "#0B1C5A", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  grantBtnText: { color: "#fff", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.8 },
});
