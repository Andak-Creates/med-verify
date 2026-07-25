import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { useConsultations } from "@/hooks/useConsultations";
import { useScanHistory } from "@/hooks/useDrugVerification";
import { useSessionPayment } from "@/hooks/useSessionPayment";
import type { Consultation, ConsultationStatus, ScanHistoryItem } from "@/types/api";

const STATUS_DISPLAY: Record<ScanHistoryItem["status"], { label: string; bg: string; color: string; icon: string; iconBg: string }> = {
  verified: { label: "AUTHENTIC", bg: "#EBF5EB", color: "#2E7D32", icon: "link", iconBg: "#EEF1FB" },
  flagged: { label: "FLAGGED", bg: "#FFF7ED", color: "#C2410C", icon: "warning-outline", iconBg: "#FFF7ED" },
  not_found: { label: "NOT FOUND", bg: "#FEF2F2", color: "#B91C1C", icon: "warning-outline", iconBg: "#FEF2F2" },
};

const CONSULT_STATUS_DISPLAY: Record<ConsultationStatus, { label: string; bg: string; color: string }> = {
  PENDING: { label: "PENDING", bg: "#FEF3C7", color: "#92400E" },
  CONFIRMED: { label: "CONFIRMED", bg: "#D1FAE5", color: "#065F46" },
  IN_PROGRESS: { label: "IN PROGRESS", bg: "#DBEAFE", color: "#1E40AF" },
  DECLINED: { label: "DECLINED", bg: "#FEE2E2", color: "#991B1B" },
  COMPLETED: { label: "COMPLETED", bg: "#E5E7EB", color: "#374151" },
  CANCELLED: { label: "CANCELLED", bg: "#F3F4F6", color: "#6B7280" },
};

const SESSION_TYPE_LABEL: Record<Consultation["consultationType"], { label: string; icon: string }> = {
  chat: { label: "Chat Session", icon: "chatbubble-outline" },
  audio: { label: "Audio Call Session", icon: "call-outline" },
  both: { label: "Call & Chat Session", icon: "videocam-outline" },
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

function formatConsultationDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export default function HistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"meds" | "consultations">("meds");
  const [medFilter, setMedFilter] = useState<"all" | "authentic" | "flagged">("all");

  const {
    items,
    stats,
    isLoading: loading,
    isRefreshing,
    isLoadingMore,
    error,
    refresh,
    loadMore,
  } = useScanHistory();

  const upcoming = useConsultations("upcoming");
  const past = useConsultations("past");
  const { pay, payingId } = useSessionPayment();

  const filteredItems = items.filter((item) => {
    if (medFilter === "all") return true;
    if (medFilter === "authentic") return item.status === "verified";
    return item.status === "flagged" || item.status === "not_found";
  });

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (activeTab !== "meds") return;
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 240) {
      loadMore();
    }
  };

  const handleRefresh = () => {
    if (activeTab === "meds") {
      refresh();
    } else {
      upcoming.refresh();
      past.refresh();
    }
  };

  const openScanDetails = (item: ScanHistoryItem) => {
    const result = JSON.stringify({
      nafdacNumber: item.nafdacNumber,
      found: item.status !== "not_found",
      verificationResult: item.status,
      productName: item.drugName,
      manufacturer: item.manufacturer,
      strength: item.strength,
      category: item.category,
      form: null,
      activeIngredients: null,
      registryStatus: item.status === "verified" ? "Active" : null,
      approvalDate: null,
    });
    router.push({ pathname: "/(user)/home/result", params: { code: item.nafdacNumber, result, from: "history" } } as any);
  };

  const renderConsultationCard = (c: Consultation) => {
    const statusDisplay = CONSULT_STATUS_DISPLAY[c.status];
    const sessionType = SESSION_TYPE_LABEL[c.consultationType];
    // Accepted but not yet paid → must pay to unlock the session.
    const needsPayment = c.status === "CONFIRMED" && c.paymentStatus !== "paid";
    const canJoin =
      (c.status === "CONFIRMED" && c.paymentStatus === "paid") || c.status === "IN_PROGRESS";
    const isPaying = payingId === c.id;
    return (
      <View key={c.id} style={styles.consultCard}>
        <View style={styles.consultHeader}>
          {c.pharmacist.profileImage ? (
            <Image source={{ uri: c.pharmacist.profileImage }} style={styles.docAvatar} />
          ) : (
            <View style={[styles.docAvatar, { backgroundColor: "#EEF1FB", alignItems: "center", justifyContent: "center" }]}>
              <Ionicons name="person-outline" size={28} color="#0B1C5A" />
            </View>
          )}
          <View style={styles.docInfo}>
            <Text style={styles.docName}>{c.pharmacist.fullName ?? "Pharmacist"}</Text>
            <Text style={styles.docSpec}>{c.pharmacist.specialty ?? c.pharmacist.pharmacyName ?? "Pharmacist"}</Text>
            <View style={styles.sessionTypeWrap}>
              <Ionicons name={sessionType.icon as any} size={14} color="#6B7280" />
              <Text style={styles.sessionTypeText}>{sessionType.label}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusDisplay.bg, position: "absolute", top: 0, right: 0 }]}>
            <Text style={[styles.statusBadgeText, { color: statusDisplay.color }]}>{statusDisplay.label}</Text>
          </View>
        </View>

        <View style={styles.calendarBlock}>
          <View style={styles.calendarStrip}>
            <Ionicons name="calendar-outline" size={20} color="#0B1C5A" />
          </View>
          <View>
            <Text style={styles.calDate}>{formatConsultationDate(c.consultationDate)}</Text>
            <Text style={styles.calTime}>Starts at {c.timeSlot} • Ref {c.referenceCode}</Text>
          </View>
        </View>

        {needsPayment && (
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.payBtn, isPaying && { opacity: 0.7 }]}
              disabled={isPaying}
              onPress={() => pay(c.id, upcoming.refresh)}
            >
              {isPaying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="card-outline" size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>
                    Pay ₦{c.feeAmount.toLocaleString()} to Join
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {canJoin && (
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() =>
                router.push({ pathname: "/(user)/pharmacy/consultation-live", params: { id: c.id } } as any)
              }
            >
              <Ionicons name="play-circle-outline" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>Join Session</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderPastCard = (c: Consultation) => {
    const statusDisplay = CONSULT_STATUS_DISPLAY[c.status];
    const sessionType = SESSION_TYPE_LABEL[c.consultationType];
    return (
      <TouchableOpacity
        key={c.id}
        style={styles.pastCard}
        onPress={() =>
          router.push({ pathname: "/(user)/pharmacy/consultation-live", params: { id: c.id, isPast: "true" } } as any)
        }
      >
        <View style={styles.pastHeader}>
          {c.pharmacist.profileImage ? (
            <Image source={{ uri: c.pharmacist.profileImage }} style={styles.docAvatarSmall} />
          ) : (
            <View style={[styles.docAvatarSmall, { backgroundColor: "#DBEAFE", alignItems: "center", justifyContent: "center" }]}>
              <Ionicons name="medkit-outline" size={24} color="#4B5563" />
            </View>
          )}
          <View style={styles.pastDocInfo}>
            <Text style={styles.pastDocName}>{c.pharmacist.fullName ?? "Pharmacist"}</Text>
            <Text style={styles.pastDocSpec}>
              {(c.pharmacist.specialty ?? "Pharmacist") + " • " + sessionType.label}
            </Text>
          </View>
          <View style={styles.pastDateWrap}>
            <Text style={styles.pastDateText}>
              {new Date(`${c.consultationDate}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" })}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8E9CB2" style={{ marginLeft: 8 }} />
        </View>
        <View style={styles.pastDivider} />
        <View style={styles.chipsRow}>
          <View style={[styles.chip, { backgroundColor: statusDisplay.bg }]}>
            <Text style={[styles.chipText, { color: statusDisplay.color }]}>{statusDisplay.label}</Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="time-outline" size={12} color="#6B7280" />
            <Text style={styles.chipText}>{c.timeSlot}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const consultationsLoading = upcoming.isLoading || past.isLoading;
  const consultationsError = upcoming.error ?? past.error;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={200}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || upcoming.isRefreshing || past.isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#0B1C5A"
          />
        }
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.logoText}>MedVerify</Text>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton} onPress={() => router.push('/(user)/account/notifications' as any)}>
              <Ionicons name="notifications-outline" size={21} color="#0B1C5A" />
            </Pressable>
            <Pressable style={styles.avatarButton} onPress={() => router.push('/(user)/account' as any)}>
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.avatarImg} />
              ) : (
                <View style={[styles.avatarImg, { backgroundColor: "rgba(255,255,255,0.85)", alignItems: "center", justifyContent: "center" }]}>
                  <Ionicons name="person-outline" size={20} color="#0B1C5A" />
                </View>
              )}
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
              style={[styles.mainTab, activeTab === "meds" && styles.mainTabActive]}
              onPress={() => setActiveTab("meds")}
            >
              <Text style={[styles.mainTabText, activeTab === "meds" && styles.mainTabTextActive]}>
                Meds
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mainTab, activeTab === "consultations" && styles.mainTabActive]}
              onPress={() => setActiveTab("consultations")}
            >
              <Text style={[styles.mainTabText, activeTab === "consultations" && styles.mainTabTextActive]}>
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
              {(
                [
                  { key: "all", label: "All Scans" },
                  { key: "authentic", label: "Authentic" },
                  { key: "flagged", label: "Flagged" },
                ] as const
              ).map((pill) => (
                <TouchableOpacity
                  key={pill.key}
                  style={[styles.filterPill, medFilter === pill.key && styles.filterPillActive]}
                  onPress={() => setMedFilter(pill.key)}
                >
                  <Text style={[styles.filterPillText, medFilter === pill.key && styles.filterPillTextActive]}>
                    {pill.label}
                  </Text>
                </TouchableOpacity>
              ))}
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
                <TouchableOpacity onPress={refresh} style={{ marginTop: 12 }}>
                  <Text style={{ color: "#0B1C5A", fontWeight: "700" }}>Try again</Text>
                </TouchableOpacity>
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
                        <TouchableOpacity onPress={() => openScanDetails(item)}>
                          <Text style={[styles.actionText, { color: "#0B1C5A" }]}>
                            View Details ›
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
                {isLoadingMore && (
                  <View style={{ paddingVertical: 16, alignItems: "center" }}>
                    <ActivityIndicator size="small" color="#0B1C5A" />
                  </View>
                )}
              </View>
            )}

            {/* Stats */}
            {stats && !loading && (
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
            {consultationsLoading ? (
              <View style={{ paddingVertical: 60, alignItems: "center" }}>
                <ActivityIndicator size="large" color="#0B1C5A" />
              </View>
            ) : consultationsError ? (
              <View style={{ paddingVertical: 40, alignItems: "center", paddingHorizontal: 20 }}>
                <Ionicons name="alert-circle-outline" size={32} color="#9CA3AF" />
                <Text style={{ marginTop: 10, color: "#6B7280", textAlign: "center" }}>{consultationsError}</Text>
                <TouchableOpacity onPress={handleRefresh} style={{ marginTop: 12 }}>
                  <Text style={{ color: "#0B1C5A", fontWeight: "700" }}>Try again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Upcoming Section */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Upcoming</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {upcoming.items.length} {upcoming.items.length === 1 ? "Session" : "Sessions"}
                    </Text>
                  </View>
                </View>

                {upcoming.items.length === 0 ? (
                  <View style={{ paddingVertical: 24, alignItems: "center", paddingHorizontal: 20 }}>
                    <Ionicons name="calendar-outline" size={32} color="#9CA3AF" />
                    <Text style={{ marginTop: 10, color: "#6B7280", textAlign: "center" }}>
                      No upcoming consultations. Book a session with a pharmacist to get started.
                    </Text>
                  </View>
                ) : (
                  upcoming.items.map(renderConsultationCard)
                )}

                {/* Past Sessions Section */}
                <View style={[styles.sectionHeader, { marginTop: 10 }]}>
                  <Text style={styles.sectionTitle}>Past Sessions</Text>
                </View>

                {past.items.length === 0 ? (
                  <View style={{ paddingVertical: 24, alignItems: "center", paddingHorizontal: 20 }}>
                    <Ionicons name="time-outline" size={32} color="#9CA3AF" />
                    <Text style={{ marginTop: 10, color: "#6B7280", textAlign: "center" }}>
                      Past consultations will appear here.
                    </Text>
                  </View>
                ) : (
                  past.items.map(renderPastCard)
                )}
              </>
            )}
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
  payBtn: {
    flex: 1,
    backgroundColor: "#065F46",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    gap: 8,
  },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

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
