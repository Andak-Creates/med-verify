import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { getApiErrorMessage } from "../../../lib/api";

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80";

// Must match the backend's VALID_BLOOD_GROUPS in users.controller.js exactly.
const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export default function AccountScreen() {
  const router = useRouter();
  const { user, logout, updateProfile, uploadAvatar, isPro } = useAuth();
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup ?? "");
  const [allergies, setAllergies] = useState(user?.allergies ?? "");
  const [chronicConditions, setChronicConditions] = useState(
    user?.chronicConditions ?? "",
  );

  const openEdit = () => {
    setFullName(user?.fullName ?? "");
    setBloodGroup(user?.bloodGroup ?? "");
    setAllergies(user?.allergies ?? "");
    setChronicConditions(user?.chronicConditions ?? "");
    setEditVisible(true);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const updates: Parameters<typeof updateProfile>[0] = {
        bloodGroup: bloodGroup.trim() || null,
        allergies: allergies.trim() || null,
        chronicConditions: chronicConditions.trim() || null,
      };
      if (fullName.trim()) updates.fullName = fullName.trim();
      await updateProfile(updates);
      setEditVisible(false);
    } catch (err) {
      Alert.alert(
        "Could not save",
        getApiErrorMessage(err, "Please try again."),
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo library access to update your avatar.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const fileName = asset.fileName ?? `avatar-${Date.now()}.jpg`;
    const ext = fileName.includes(".") ? fileName.split(".").pop() : "jpg";

    setUploadingAvatar(true);
    try {
      await uploadAvatar({
        uri: asset.uri,
        name: fileName,
        type: asset.mimeType ?? `image/${ext}`,
      });
    } catch (err) {
      Alert.alert(
        "Upload failed",
        getApiErrorMessage(err, "Could not update your avatar."),
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const performSignOut = async () => {
    setSigningOut(true);
    try {
      await logout();
      router.replace("/(onboarding)/role-select" as any);
    } finally {
      setSigningOut(false);
    }
  };

  const handleSignOut = () => {
    // Alert.alert is a no-op on web (react-native-web has no implementation),
    // so the confirmation dialog never appears there — use window.confirm instead.
    if (Platform.OS === "web") {
      if (
        typeof window !== "undefined" &&
        window.confirm("Are you sure you want to sign out?")
      ) {
        performSignOut();
      }
      return;
    }

    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: performSignOut },
    ]);
  };

  const displayName = user?.fullName || user?.username || "MedVerify User";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>MedVerify</Text>
          <Pressable style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={21} color="#312E81" />
          </Pressable>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.profileImage || FALLBACK_AVATAR }}
              style={styles.avatarImg}
            />
            <Pressable
              style={styles.editBadge}
              onPress={handlePickAvatar}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="pencil" size={12} color="#fff" />
              )}
            </Pressable>
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isPro ? '#FFFBEB' : '#F3F4F6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginBottom: 20 }}
            onPress={() => router.push(isPro ? '/(user)/account/subscription' : '/(user)/account/paywall' as any)}
          >
             <Ionicons name={isPro ? "diamond" : "star-outline"} size={14} color={isPro ? "#E5A800" : "#6B7280"} />
             <Text style={{ marginLeft: 6, fontSize: 13, fontWeight: '800', color: isPro ? "#E5A800" : "#6B7280", letterSpacing: 0.5 }}>{isPro ? "PRO MEMBER" : "BASIC PLAN"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.editBtn} onPress={openEdit}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Medical Profile Section */}
        <Text style={styles.sectionTitle}>Medical Profile</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={styles.menuItem} onPress={openEdit}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="water-outline" size={20} color="#312E81" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Blood Group</Text>
              <Text style={styles.menuSub}>
                {user?.bloodGroup || "Not set"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem} onPress={openEdit}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="warning-outline" size={20} color="#312E81" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Allergies</Text>
              <Text style={styles.menuSub}>
                {user?.allergies || "None reported"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem} onPress={openEdit}>
            <View style={styles.menuIconWrap}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#312E81"
              />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Chronic Conditions</Text>
              <Text style={styles.menuSub}>
                {user?.chronicConditions || "None reported"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Security & Preferences */}
        <Text style={styles.sectionTitle}>Security & Preferences</Text>
        <View style={styles.cardGroup}>
          <View style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="finger-print-outline" size={20} color="#312E81" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Biometric Login</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: "#D1D5DB", true: "#312E81" }}
              thumbColor={"#fff"}
            />
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="lock-closed-outline" size={20} color="#312E81" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#312E81"
              />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Notification Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Support */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="help-circle-outline" size={20} color="#312E81" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="shield-outline" size={20} color="#312E81" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#312E81"
              />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Pressable onPress={() => setEditVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.fieldInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Your full name"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.fieldLabel}>Blood Group</Text>
              <View style={styles.bloodGroupRow}>
                {BLOOD_GROUPS.map((group) => (
                  <Pressable
                    key={group}
                    style={[
                      styles.bloodGroupChip,
                      bloodGroup === group && styles.bloodGroupChipActive,
                    ]}
                    onPress={() =>
                      setBloodGroup(bloodGroup === group ? "" : group)
                    }
                  >
                    <Text
                      style={[
                        styles.bloodGroupChipText,
                        bloodGroup === group && styles.bloodGroupChipTextActive,
                      ]}
                    >
                      {group}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Allergies</Text>
              <TextInput
                style={styles.fieldInput}
                value={allergies}
                onChangeText={setAllergies}
                placeholder="e.g. Penicillin, Peanuts"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.fieldLabel}>Chronic Conditions</Text>
              <TextInput
                style={styles.fieldInput}
                value={chronicConditions}
                onChangeText={setChronicConditions}
                placeholder="e.g. None reported"
                placeholderTextColor="#9CA3AF"
              />
            </ScrollView>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  scrollContent: { paddingBottom: 120 },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 10,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#312E81",
    letterSpacing: -0.3,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Profile Card */
  profileCard: {
    backgroundColor: "#fff",
    marginHorizontal: 22,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 24,
    marginTop: 10,
  },
  avatarContainer: { position: "relative", marginBottom: 16 },
  avatarImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: "#E0F2FE",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#312E81",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  userEmail: { fontSize: 14, color: "#6B7280", marginBottom: 20 },
  editBtn: {
    backgroundColor: "#312E81",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  editBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  /* Section Styles */
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4B5563",
    paddingHorizontal: 22,
    marginBottom: 10,
    marginTop: 10,
  },
  cardGroup: {
    backgroundColor: "#fff",
    marginHorizontal: 22,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 24,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  menuContent: { flex: 1, paddingRight: 16 },
  menuTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  menuSub: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginHorizontal: 20 },

  /* Sign Out Button */
  signOutBtn: {
    backgroundColor: "#fff",
    marginHorizontal: 22,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 20,
  },
  signOutText: { fontSize: 16, fontWeight: "700", color: "#DC2626" },

  /* Edit Profile Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 19, fontWeight: "800", color: "#111827" },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
  },
  fieldInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  bloodGroupRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  bloodGroupChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  bloodGroupChipActive: { backgroundColor: "#10B981", borderColor: "#10B981" },
  bloodGroupChipText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  bloodGroupChipTextActive: { color: "#fff" },
  saveBtn: {
    backgroundColor: "#312E81",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
