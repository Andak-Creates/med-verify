import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
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
import { MedVerifyLogo } from "../../../components/MedVerifyLogo";
import { getApiErrorMessage } from "@/api/client";
import { useLanguage } from "@/i18n";

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
  const { t, language, setLanguage, languages, currentLanguageOption } = useLanguage();
  const mainScrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      mainScrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
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
        t.common.error,
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
        t.common.permissionDenied,
        t.common.grantPermission,
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
        t.common.error,
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
      router.replace("/(auth)/login" as any);
    } finally {
      setSigningOut(false);
    }
  };

  const handleSignOut = () => {
    if (Platform.OS === "web") {
      if (
        typeof window !== "undefined" &&
        window.confirm("Are you sure you want to sign out?")
      ) {
        performSignOut();
      }
      return;
    }

    Alert.alert(t.common.signOut, "Are you sure you want to sign out?", [
      { text: t.common.cancel, style: "cancel" },
      { text: t.common.signOut, style: "destructive", onPress: performSignOut },
    ]);
  };

  const displayName = user?.fullName || user?.username || "MedVerify User";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        ref={mainScrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <MedVerifyLogo size="xs" showText={true} textColor="#0B1C5A" />
          <Pressable
            style={styles.iconButton}
            onPress={() => router.push('/(user)/account/notifications' as any)}
          >
            <Ionicons name="notifications-outline" size={20} color="#0B1C5A" />
          </Pressable>
        </View>

        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarImg, { backgroundColor: "#EEF1FB", alignItems: "center", justifyContent: "center" }]}>
                <Ionicons name="person-outline" size={36} color="#0B1C5A" />
              </View>
            )}
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
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isPro ? '#FFFBEB' : '#F1F5F9',
              borderWidth: 1,
              borderColor: isPro ? '#FDE68A' : '#E2E8F0',
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              marginTop: 10,
              marginBottom: 16,
            }}
            onPress={() => router.push(isPro ? '/(user)/account/subscription' : '/(user)/account/paywall' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name={isPro ? "diamond" : "star-outline"} size={14} color={isPro ? "#D97706" : "#64748B"} />
            <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: '800', color: isPro ? "#D97706" : "#475569", letterSpacing: 0.5 }}>
              {isPro ? "PRO MEMBER" : "BASIC PLAN"}
            </Text>
            <Ionicons name="chevron-forward" size={13} color={isPro ? "#D97706" : "#94A3B8"} style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.editBtn} onPress={openEdit}>
            <Text style={styles.editBtnText}>{t.account.editProfile}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Language Selection Card */}
        <Animated.View entering={FadeInDown.delay(180).springify()}>
          <Text style={styles.sectionTitle}>{t.account.language}</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setLangModalVisible(true)}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name="globe-outline" size={20} color="#0B1C5A" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{t.account.language}</Text>
                <Text style={styles.menuSub}>
                  {currentLanguageOption.flag} {currentLanguageOption.label} ({currentLanguageOption.nativeName})
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Billing & Subscription */}
        <Animated.View entering={FadeInDown.delay(220).springify()}>
          <Text style={styles.sectionTitle}>Billing & Subscription</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push(isPro ? '/(user)/account/subscription' : '/(user)/account/paywall' as any)}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: isPro ? '#FFFBEB' : '#EFF6FF' }]}>
                <Ionicons name={isPro ? "diamond" : "diamond-outline"} size={20} color={isPro ? "#D97706" : "#2563EB"} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Subscription Plan</Text>
                <Text style={styles.menuSub}>{isPro ? "MedVerify Pro • Active" : "Basic Free Plan • 3 Scans Limit"}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            {Platform.OS !== 'ios' && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(user)/account/payment-methods' as any)}>
                  <View style={styles.menuIconWrap}>
                    <Ionicons name="card-outline" size={20} color="#0B1C5A" />
                  </View>
                  <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>Payment Methods</Text>
                    <Text style={styles.menuSub}>View, add or manage cards</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>

        {/* Medical Profile Section */}
        <Animated.View entering={FadeInDown.delay(260).springify()}>
          <Text style={styles.sectionTitle}>{t.account.medicalProfile}</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity style={styles.menuItem} onPress={openEdit}>
              <View style={styles.menuIconWrap}>
                <Ionicons name="water-outline" size={20} color="#0B1C5A" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{t.account.bloodGroup}</Text>
                <Text style={styles.menuSub}>
                  {user?.bloodGroup || t.account.notSet}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem} onPress={openEdit}>
              <View style={styles.menuIconWrap}>
                <Ionicons name="warning-outline" size={20} color="#0B1C5A" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{t.account.allergies}</Text>
                <Text style={styles.menuSub}>
                  {user?.allergies || t.account.noneReported}
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
                  color="#0B1C5A"
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{t.account.chronicConditions}</Text>
                <Text style={styles.menuSub}>
                  {user?.chronicConditions || t.account.noneReported}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Security & Preferences */}
        <Animated.View entering={FadeInDown.delay(340).springify()}>
          <Text style={styles.sectionTitle}>{t.account.appSettings}</Text>
          <View style={styles.cardGroup}>
            <View style={styles.menuItem}>
              <View style={styles.menuIconWrap}>
                <Ionicons name="finger-print-outline" size={20} color="#0B1C5A" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{t.account.biometrics}</Text>
                <Text style={styles.menuSub}>{t.account.biometricsSub}</Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: "#E5E7EB", true: "#0B1C5A" }}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.menuItem}>
              <View style={styles.menuIconWrap}>
                <Ionicons name="notifications-outline" size={20} color="#0B1C5A" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{t.account.notifications}</Text>
                <Text style={styles.menuSub}>{t.account.notificationsSub}</Text>
              </View>
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ false: "#E5E7EB", true: "#0B1C5A" }}
              />
            </View>
          </View>
        </Animated.View>

        {/* Account Actions */}
        <Animated.View entering={FadeInDown.delay(420).springify()}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/(user)/account/delete-account' as any)}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="trash-outline" size={20} color="#DC2626" />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: '#DC2626' }]}>{t.account.deleteAccount}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSignOut}
              disabled={signingOut}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="log-out-outline" size={20} color="#475569" />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: '#475569' }]}>
                  {signingOut ? t.common.loading : t.common.signOut}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Version info */}
        <View style={styles.versionRow}>
          <Text style={styles.versionText}>MedVerify v1.0.0 • Public Drug Safety</Text>
        </View>
      </ScrollView>

      {/* ── Language Picker Modal ─────────────────────────────── */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setLangModalVisible(false)}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.account.selectLanguage}</Text>
              <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              {languages.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  style={[
                    styles.langRow,
                    language === item.code && styles.langRowActive,
                  ]}
                  onPress={() => {
                    setLanguage(item.code);
                    setLangModalVisible(false);
                  }}
                >
                  <Text style={{ fontSize: 24, marginRight: 14 }}>{item.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.langName}>{item.label}</Text>
                    <Text style={styles.langNative}>{item.nativeName}</Text>
                  </View>
                  {language === item.code && (
                    <Ionicons name="checkmark-circle" size={22} color="#0B1C5A" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* ── Edit Profile Modal ─────────────────────────────────── */}
      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setEditVisible(false)}
          >
            <Pressable
              style={styles.modalCard}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t.account.editProfile}</Text>
                <TouchableOpacity onPress={() => setEditVisible(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.inputLabel}>{t.account.fullName}</Text>
                <TextInput
                  style={styles.modalInput}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Your full name"
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.inputLabel}>{t.account.bloodGroup}</Text>
                <View style={styles.bloodGrid}>
                  {BLOOD_GROUPS.map((bg) => (
                    <TouchableOpacity
                      key={bg}
                      style={[
                        styles.bloodChip,
                        bloodGroup === bg && styles.bloodChipActive,
                      ]}
                      onPress={() => setBloodGroup(bg)}
                    >
                      <Text
                        style={[
                          styles.bloodChipText,
                          bloodGroup === bg && styles.bloodChipTextActive,
                        ]}
                      >
                        {bg}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>{t.account.allergies}</Text>
                <TextInput
                  style={styles.modalInput}
                  value={allergies}
                  onChangeText={setAllergies}
                  placeholder="e.g. Penicillin, Peanuts"
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.inputLabel}>{t.account.chronicConditions}</Text>
                <TextInput
                  style={styles.modalInput}
                  value={chronicConditions}
                  onChangeText={setChronicConditions}
                  placeholder="e.g. Asthma, Hypertension"
                  placeholderTextColor="#94A3B8"
                />

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSaveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>{t.common.save}</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingBottom: 110,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  profileCard: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0B1C5A",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#0B1C5A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0B1C5A",
  },
  userEmail: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    marginBottom: 14,
  },
  editBtn: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 16,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0B1C5A",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginHorizontal: 20,
    marginBottom: 8,
    marginTop: 10,
  },
  cardGroup: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  menuSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 64,
  },
  versionRow: {
    alignItems: "center",
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0B1C5A",
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  langRowActive: {
    backgroundColor: "#F8FAFC",
  },
  langName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },
  langNative: {
    fontSize: 12,
    color: "#64748B",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bloodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  bloodChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  bloodChipActive: {
    backgroundColor: "#0B1C5A",
  },
  bloodChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  bloodChipTextActive: {
    color: "#FFFFFF",
  },
  saveBtn: {
    backgroundColor: "#0B1C5A",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 10,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});
