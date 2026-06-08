import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { getApiErrorMessage } from "../../../lib/api";
import { getScanHistory, type ScanHistoryItem, type ScanHistoryStats } from "../../../lib/drugs";

const STATUS_DISPLAY: Record<ScanHistoryItem["status"], { label: string; bg: string; color: string; icon: string; iconBg: string }> = {
  verified: { label: "AUTHENTIC", bg: "#EBF5EB", color: "#2E7D32", icon: "link", iconBg: "#EEF1FB" },
  flagged: { label: "FLAGGED", bg: "#FFF7ED", color: "#C2410C", icon: "warning-outline", iconBg: "#FFF7ED" },
  not_found: { label: "NOT FOUND", bg: "#FEF2F2", color: "#B91C1C", icon: "warning-outline", iconBg: "#FEF2F2" },
};

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function HistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"meds" | "consultations">("meds");
  const [medFilter, setMedFilter] = useState<"all" | "authentic" | "flagged">(
    "all",
  );
  const [items, setItems] = useState<ScanHistoryItem[]>([]);
  const [stats, setStats] = useState<ScanHistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      setError(null);
      getScanHistory({ limit: 50 })
        .then(({ items: fetched, stats: fetchedStats }) => {
          if (cancelled) return;
          setItems(fetched);
          setStats(fetchedStats);
        })
        .catch((err) => {
          if (cancelled) return;
          setError(getApiErrorMessage(err, "Could not load your scan history."));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const filteredItems = items.filter((item) => {
    if (medFilter === "all") return true;
    if (medFilter === "authentic") return item.status === "verified";
    return item.status === "flagged" || item.status === "not_found";
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.logoText}>MedVerify</Text>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton}>
              <Ionicons
                name="notifications-outline"
                size={21}
                color="#0B1C5A"
              />
              <View style={styles.notifDot} />
            </Pressable>
            <Pressable style={styles.avatarButton} onPress={() => router.push('/(user)/account' as any)}>
              <Image
                source={{ uri: user?.profileImage || "https://i.pravatar.cc/150?img=47" }}
                style={styles.avatarImg}
              />
            </Pressable>
          </View>
        </View>

        {/* ── Title ───────────────────────────────────────── */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>History</Text>
          <Text style={styles.pageSubtitle}>
            Manage and review your recent drug authenticity verifications and
            consultation history.
          </Text>
        </View>

        {/* ── Main Tabs ──────────────────────────────────────── */}
        <View style={styles.tabContainer}>
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[
                styles.mainTab,
                activeTab === "meds" && styles.mainTabActive,
              ]}
              onPress={() => setActiveTab("meds")}
            >
              <Text
                style={[
                  styles.mainTabText,
                  activeTab === "meds" && styles.mainTabTextActive,
                ]}
              >
                Meds
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.mainTab,
                activeTab === "consultations" && styles.mainTabActive,
              ]}
              onPress={() => setActiveTab("consultations")}
            >
              <Text
                style={[
                  styles.mainTabText,
                  activeTab === "consultations" && styles.mainTabTextActive,
                ]}
              >
                Consultations
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tabDivider} />
        </View>

        {/* ── MEDS TAB CONTENT ─────────────────────────────────── */}
        {activeTab === "meds" && (
          <View style={styles.medsContent}>
            {/* Filter Pills */}
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[
                  styles.filterPill,
                  medFilter === "all" && styles.filterPillActive,
                ]}
                onPress={() => setMedFilter("all")}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    medFilter === "all" && styles.filterPillTextActive,
                  ]}
                >
                  All Scans
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterPill,
                  medFilter === "authentic" && styles.filterPillActive,
                ]}
                onPress={() => setMedFilter("authentic")}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    medFilter === "authentic" && styles.filterPillTextActive,
                  ]}
                >
                  Authentic
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterPill,
                  medFilter === "flagged" && styles.filterPillActive,
                ]}
                onPress={() => setMedFilter("flagged")}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    medFilter === "flagged" && styles.filterPillTextActive,
                  ]}
                >
                  Flagged
                </Text>
              </TouchableOpacity>
            </View>

            {/* Meds List */}
            {loading ? (
              <View style={{ paddingVertical: 60, alignItems: "center" }}>
                <ActivityIndicator size="large" color="#0B1C5A" />
              </View>
            ) : error ? (
              <View style={{ paddingVertical: 40, alignItems: "center", paddingHorizontal: 20 }}>
                <Ionicons name="alert-circle-outline" size={32} color="#9CA3AF" />
                <Text style={{ marginTop: 10, color: "#6B7280", textAlign: "center" }}>{error}</Text>
              </View>
            ) : filteredItems.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: "center", paddingHorizontal: 20 }}>
                <Ionicons name="document-text-outline" size={32} color="#9CA3AF" />
                <Text style={{ marginTop: 10, color: "#6B7280", textAlign: "center" }}>
                  {items.length === 0
                    ? "No scans yet. Verify a drug to see it appear here."
                    : "No scans match this filter."}
                </Text>
              </View>
            ) : (
              <View style={styles.cardList}>
                {filteredItems.map((item) => {
                  const display = STATUS_DISPLAY[item.status];
                  return (
                    <View key={item.id} style={styles.medCard}>
                      <View style={styles.medHeader}>
                        <View style={[styles.medIconWrap, { backgroundColor: display.iconBg }]}>
                          <Ionicons
                            name={display.icon as any}
                            size={20}
                            color={display.color}
                            style={display.icon === "link" ? { transform: [{ rotate: "45deg" }] } : undefined}
                          />
                        </View>
                        <View style={styles.medInfo}>
                          <Text style={styles.medName}>{item.drugName ?? item.nafdacNumber}</Text>
                          <Text style={styles.medBatch}>NAFDAC: {item.nafdacNumber}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: display.bg }]}>
                          <Text style={[styles.statusBadgeText, { color: display.color }]}>
                            {display.label}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.medFooter}>
                        <View style={styles.timeWrap}>
                          <Ionicons name="time-outline" size={14} color="#6B7280" />
                          <Text style={styles.timeText}>{formatRelativeTime(item.scannedAt)}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            const result = JSON.stringify({
                              nafdacNumber: item.nafdacNumber,
                              found: item.status !== 'not_found',
                              verificationResult: item.status,
                              productName: item.drugName,
                              manufacturer: item.manufacturer,
                              strength: item.strength,
                              category: item.category,
                              form: null,
                              activeIngredients: null,
                              registryStatus: item.status === 'verified' ? 'Active' : null,
                              approvalDate: null,
                            });
                            router.push({ pathname: '/(user)/home/result', params: { code: item.nafdacNumber, result } } as any);
                          }}
                        >
                          <Text style={[styles.actionText, { color: "#0B1C5A" }]}>
                            View Details ›
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Stats */}
            {stats && (
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>TOTAL SCANS</Text>
                  <Text style={styles.statValue}>{stats.totalScans}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>AUTHENTICITY RATE</Text>
                  <Text style={styles.statValue}>{stats.authenticityRate}%</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── CONSULTATIONS TAB CONTENT ───────────────────────────── */}
        {activeTab === "consultations" && (
          <View style={styles.consultationsContent}>
            {/* Upcoming Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>1 Session</Text>
              </View>
            </View>

            <View style={styles.consultCard}>
              <View style={styles.consultHeader}>
                <Image
                  source={{ uri: "https://i.pravatar.cc/150?img=32" }}
                  style={styles.docAvatar}
                />
                <View style={styles.docInfo}>
                  <Text style={styles.docName}>Dr. Sarah Chen</Text>
                  <Text style={styles.docSpec}>General Practitioner</Text>
                  <View style={styles.sessionTypeWrap}>
                    <Ionicons
                      name="videocam-outline"
                      size={14}
                      color="#6B7280"
                    />
                    <Text style={styles.sessionTypeText}>
                      Call & Chat Session
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: "#D1FAE5",
                      position: "absolute",
                      top: 0,
                      right: 0,
                    },
                  ]}
                >
                  <Text style={[styles.statusBadgeText, { color: "#065F46" }]}>
                    CONFIRMED
                  </Text>
                </View>
              </View>

              <View style={styles.calendarBlock}>
                <View style={styles.calendarStrip}>
                  <Ionicons name="calendar-outline" size={20} color="#0B1C5A" />
                </View>
                <View>
                  <Text style={styles.calDate}>Mon, 11 Dec</Text>
                  <Text style={styles.calTime}>
                    Starts at 02:00 PM (15 mins)
                  </Text>
                </View>
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.primaryBtn}>
                  <Ionicons name="play-circle-outline" size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>Join Session</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.outlineBtn}>
                  <Ionicons name="calendar-outline" size={18} color="#0B1C5A" />
                  <Text style={styles.outlineBtnText}>Reschedule</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Past Sessions Section */}
            <View style={[styles.sectionHeader, { marginTop: 10 }]}>
              <Text style={styles.sectionTitle}>Past Sessions</Text>
            </View>

            {/* Past Item 1 */}
            <View style={styles.pastCard}>
              <View style={styles.pastHeader}>
                <Image
                  source={{ uri: "https://i.pravatar.cc/150?img=11" }}
                  style={styles.docAvatarSmall}
                />
                <View style={styles.pastDocInfo}>
                  <Text style={styles.pastDocName}>Dr. James Wilson</Text>
                  <Text style={styles.pastDocSpec}>
                    Cardiologist • In-Person
                  </Text>
                </View>
                <View style={styles.pastDateWrap}>
                  <Text style={styles.pastDateText}>Dec 04,</Text>
                  <Text style={styles.pastDateText}>2023</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#8E9CB2"
                  style={{ marginLeft: 8 }}
                />
              </View>
              <View style={styles.pastDivider} />
              <View style={styles.chipsRow}>
                <View style={styles.chip}>
                  <Ionicons
                    name="document-text-outline"
                    size={12}
                    color="#6B7280"
                  />
                  <Text style={styles.chipText}>Prescription Issued</Text>
                </View>
                <View style={styles.chip}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={12}
                    color="#6B7280"
                  />
                  <Text style={styles.chipText}>Completed</Text>
                </View>
              </View>
            </View>

            {/* Past Item 2 */}
            <View style={styles.pastCard}>
              <View style={styles.pastHeader}>
                <View
                  style={[
                    styles.docAvatarSmall,
                    {
                      backgroundColor: "#DBEAFE",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <Ionicons name="medkit-outline" size={24} color="#4B5563" />
                </View>
                <View style={styles.pastDocInfo}>
                  <Text style={styles.pastDocName}>Clinic Visit</Text>
                  <Text style={styles.pastDocSpec}>
                    Lab Results Review • Walk-in
                  </Text>
                </View>
                <View style={styles.pastDateWrap}>
                  <Text style={styles.pastDateText}>Nov 28, 2023</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#8E9CB2"
                  style={{ marginLeft: 8 }}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  scrollContent: { paddingBottom: 100 },

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
    color: "#0B1C5A",
    letterSpacing: -0.3,
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  notifDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarImg: { width: "100%", height: "100%" },

  /* Title Section */
  titleSection: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 20 },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  pageSubtitle: { fontSize: 14, color: "#4B5563", lineHeight: 20 },

  /* Tabs */
  tabContainer: { paddingHorizontal: 22, marginBottom: 20 },
  tabRow: { flexDirection: "row", zIndex: 10 },
  mainTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  mainTabActive: { borderColor: "#0B1C5A", backgroundColor: "#fff" },
  mainTabText: { fontSize: 15, fontWeight: "700", color: "#6B7280" },
  mainTabTextActive: { color: "#0B1C5A" },
  tabDivider: {
    position: "absolute",
    bottom: 18,
    left: 22,
    right: 22,
    height: 1.5,
    backgroundColor: "#E5E7EB",
    zIndex: 0,
  },

  /* Meds Tab */
  medsContent: { paddingHorizontal: 22 },
  filterRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  filterPillActive: { backgroundColor: "#312E81" },
  filterPillText: { fontSize: 14, fontWeight: "600", color: "#4B5563" },
  filterPillTextActive: { color: "#fff" },

  cardList: { gap: 16 },
  medCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  medHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  medIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  medInfo: { flex: 1 },
  medName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 2,
  },
  medBatch: { fontSize: 12, color: "#6B7280" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  medFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  timeWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  timeText: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  actionText: { fontSize: 14, fontWeight: "700" },

  statsRow: { flexDirection: "row", gap: 12, marginTop: 24, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#4B5563",
    letterSpacing: 1,
    marginBottom: 8,
  },
  statValue: { fontSize: 24, fontWeight: "900", color: "#111827" },

  /* Consultations Tab */
  consultationsContent: { paddingHorizontal: 22 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 22, fontWeight: "800", color: "#0B1C5A" },
  countBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: { color: "#1E40AF", fontSize: 12, fontWeight: "700" },

  consultCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  consultHeader: {
    flexDirection: "row",
    marginBottom: 20,
    position: "relative",
  },
  docAvatar: { width: 64, height: 64, borderRadius: 16, marginRight: 16 },
  docInfo: { flex: 1, justifyContent: "center" },
  docName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0B1C5A",
    marginBottom: 2,
    paddingRight: 80,
  },
  docSpec: { fontSize: 14, color: "#6B7280", marginBottom: 6 },
  sessionTypeWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  sessionTypeText: { fontSize: 12, color: "#4B5563", fontWeight: "500" },

  calendarBlock: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#0B1C5A",
  },
  calendarStrip: { marginRight: 12 },
  calDate: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  calTime: { fontSize: 12, color: "#6B7280" },

  btnRow: { flexDirection: "row", gap: 12 },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#0B1C5A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    gap: 8,
  },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  outlineBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#0B1C5A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    gap: 8,
  },
  outlineBtnText: { color: "#0B1C5A", fontSize: 15, fontWeight: "700" },

  pastCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 12,
  },
  pastHeader: { flexDirection: "row", alignItems: "center" },
  docAvatarSmall: { width: 48, height: 48, borderRadius: 12, marginRight: 16 },
  pastDocInfo: { flex: 1 },
  pastDocName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#312E81",
    marginBottom: 4,
  },
  pastDocSpec: { fontSize: 12, color: "#6B7280" },
  pastDateWrap: { alignItems: "flex-end" },
  pastDateText: { fontSize: 12, color: "#4B5563", fontWeight: "600" },
  pastDivider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 14 },
  chipsRow: { flexDirection: "row", gap: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  chipText: { fontSize: 11, color: "#4B5563", fontWeight: "600" },
});
