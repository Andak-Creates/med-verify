import { useCallback, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { MedVerifyLogo } from "../../../components/MedVerifyLogo";
import { useScanHistory } from "@/hooks/useDrugVerification";
import type { ScanHistoryItem } from "@/types/api";
import { useLanguage } from "@/i18n";

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
  const { t } = useLanguage();
  const mainScrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      mainScrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "flagged" | "not_found">("all");

  const {
    items,
    stats,
    isLoading: loading,
    isRefreshing,
    isLoadingMore,
    refresh,
    loadMore,
  } = useScanHistory();

  const statusDisplay: Record<ScanHistoryItem["status"], { label: string; bg: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
    verified: { label: t.history.filterVerified, bg: "#ECFDF5", color: "#059669", icon: "shield-checkmark" },
    flagged: { label: t.history.filterFlagged, bg: "#FFFBEB", color: "#D97706", icon: "warning" },
    not_found: { label: t.history.filterNotFound, bg: "#FEF2F2", color: "#DC2626", icon: "close-circle" },
  };

  const filteredItems = items.filter((item) => {
    // Status filter
    if (statusFilter !== "all" && item.status !== statusFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = item.drugName?.toLowerCase().includes(q);
      const nafdacMatch = item.nafdacNumber.toLowerCase().includes(q);
      const mfgMatch = item.manufacturer?.toLowerCase().includes(q);
      return nameMatch || nafdacMatch || mfgMatch;
    }
    return true;
  });

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 80;
    if (isCloseToBottom) {
      loadMore();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        ref={mainScrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor="#0B1C5A"
            colors={["#0B1C5A"]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <MedVerifyLogo size="xs" showText={true} textColor="#0B1C5A" />
          <Pressable
            style={styles.iconBtn}
            onPress={() => router.push('/(user)/account/notifications' as any)}
          >
            <Ionicons name="notifications-outline" size={20} color="#0B1C5A" />
          </Pressable>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>{t.history.title}</Text>
        </View>

        {/* Stats Card */}
        {stats && (
          <View style={styles.statsCard}>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{stats.totalScans || items.length}</Text>
              <Text style={styles.statLabel}>Total Scans</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={[styles.statVal, { color: '#059669' }]}>
                {stats.authenticityRate ? `${Math.round(stats.authenticityRate)}%` : '100%'}
              </Text>
              <Text style={styles.statLabel}>Authenticity Rate</Text>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={t.history.searchPlaceholder}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {[
            { key: "all", label: t.history.filterAll },
            { key: "verified", label: t.history.filterVerified },
            { key: "flagged", label: t.history.filterFlagged },
            { key: "not_found", label: t.history.filterNotFound },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterPill,
                statusFilter === f.key && styles.filterPillActive,
              ]}
              onPress={() => setStatusFilter(f.key as any)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  statusFilter === f.key && styles.filterPillTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        {loading && !isRefreshing ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#0B1C5A" />
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="time-outline" size={40} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>{t.history.emptyTitle}</Text>
            <Text style={styles.emptySubtitle}>{t.history.emptySubtitle}</Text>

            <TouchableOpacity
              style={styles.scanNowBtn}
              onPress={() => router.push('/(user)/home/scan-ocr' as any)}
            >
              <Ionicons name="camera-outline" size={18} color="#fff" />
              <Text style={styles.scanNowBtnText}>Start First Scan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredItems.map((item) => {
              const statusCfg = statusDisplay[item.status] || statusDisplay.not_found;
              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [styles.itemCard, pressed && { opacity: 0.85 }]}
                  onPress={() =>
                    router.push({
                      pathname: "/(user)/home/result",
                      params: {
                        code: item.nafdacNumber,
                        result: JSON.stringify({
                          nafdacNumber: item.nafdacNumber,
                          found: item.status === "verified" || item.status === "flagged",
                          verificationResult: item.status,
                          productName: item.drugName,
                          manufacturer: item.manufacturer,
                          strength: item.strength,
                          category: item.category,
                        }),
                        from: "history",
                      },
                    } as any)
                  }
                >
                  <View style={styles.itemHeader}>
                    <View style={styles.itemTitleBlock}>
                      <Text style={styles.drugName} numberOfLines={1}>
                        {item.drugName || item.nafdacNumber}
                      </Text>
                      {item.manufacturer ? (
                        <Text style={styles.mfgText} numberOfLines={1}>
                          {item.manufacturer}
                        </Text>
                      ) : null}
                    </View>

                    {/* Status badge */}
                    <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                      <Ionicons name={statusCfg.icon} size={12} color={statusCfg.color} />
                      <Text style={[styles.statusBadgeText, { color: statusCfg.color }]}>
                        {statusCfg.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.itemFooter}>
                    <View style={styles.nafdacBadge}>
                      <Text style={styles.nafdacText}>REG: {item.nafdacNumber}</Text>
                    </View>
                    <Text style={styles.timeText}>{formatRelativeTime(item.scannedAt)}</Text>
                  </View>
                </Pressable>
              );
            })}

            {isLoadingMore && (
              <View style={{ paddingVertical: 16 }}>
                <ActivityIndicator size="small" color="#0B1C5A" />
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 10,
  },
  iconBtn: {
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
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0B1C5A",
  },
  statsCard: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0B1C5A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
  },
  statVal: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0B1C5A",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#E2E8F0",
  },
  searchWrap: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },
  filterRow: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  filterPillActive: {
    backgroundColor: "#0B1C5A",
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  filterPillTextActive: {
    color: "#FFFFFF",
  },
  listContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0B1C5A",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  itemTitleBlock: {
    flex: 1,
    marginRight: 10,
  },
  drugName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0B1C5A",
  },
  mfgText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
  },
  nafdacBadge: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  nafdacText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 11,
    color: "#94A3B8",
  },
  centerLoading: {
    paddingVertical: 50,
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0B1C5A",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 24,
  },
  scanNowBtn: {
    backgroundColor: "#0B1C5A",
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scanNowBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
