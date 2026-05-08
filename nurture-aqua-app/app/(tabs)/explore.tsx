import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

const API_BASE_URL = "http://192.168.1.4:8000";

// ── Dark aqua palette (same as home) ────────────────────────────
const C = {
  bg: "#0a1628",
  card: "#101e32",
  cardBorder: "#1a3050",
  accent: "#22d3ee",
  accentDim: "#0891b2",
  green: "#34d399",
  greenBg: "rgba(52,211,153,0.10)",
  orange: "#fb923c",
  orangeBg: "rgba(251,146,60,0.10)",
  red: "#f87171",
  redBg: "rgba(248,113,113,0.10)",
  textPrimary: "#e8edf2",
  textSecondary: "#7a9bb5",
  textMuted: "#4b6478",
  white: "#ffffff",
};

const getRiskColor = (level: string) => {
  const l = level?.toLowerCase() ?? "";
  if (l.includes("low"))
    return { bg: C.greenBg, text: C.green, badge: "#22c55e" };
  if (l.includes("moderate"))
    return { bg: C.orangeBg, text: C.orange, badge: "#f97316" };
  return { bg: C.redBg, text: C.red, badge: "#ef4444" };
};

const getRiskIcon = (level: string): keyof typeof MaterialIcons.glyphMap => {
  const l = level?.toLowerCase() ?? "";
  if (l.includes("low")) return "check-circle";
  if (l.includes("moderate")) return "warning";
  return "error";
};

// ── helpers ─────────────────────────────────────────────────────
const formatTimestamp = (ts: string) => {
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    return `${date}  ${time}`;
  } catch {
    return ts;
  }
};

// ── component ───────────────────────────────────────────────────
export default function ExploreScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [useCharts, setUseCharts] = useState(true);

  const loadData = useCallback(async () => {
    setError("");
    try {
      const [hRes, aRes] = await Promise.all([
        fetch(`${API_BASE_URL}/history`),
        fetch(`${API_BASE_URL}/analytics`),
      ]);
      const hData = await hRes.json();
      setHistory(Array.isArray(hData) ? hData.reverse() : []);
      const aData = await aRes.json();
      setAnalytics(aData);
    } catch {
      setError("Could not connect to server. Pull down to retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const chartWidth = Dimensions.get("window").width - 72;

  // ── safe chart data ───────────────────────────────────────────
  const safeSlice = (arr: any[] | undefined, n = 7) => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return null;
    const sliced = arr.slice(-n).map(Number);
    if (sliced.some(isNaN)) return null;
    return sliced;
  };

  const phData = safeSlice(analytics?.ph);
  const ammoniaData = safeSlice(analytics?.ammonia);
  const tempData = safeSlice(analytics?.temperature);

  // ── chart configs ─────────────────────────────────────────────
  const makeConfig = (color: string) => ({
    backgroundGradientFrom: C.card,
    backgroundGradientTo: C.card,
    decimalPlaces: color === "#fbbf24" ? 3 : 1,
    color: (opacity = 1) => color.replace("1)", `${opacity})`).includes("rgba") ? color : `rgba(${hexToRgb(color)},${opacity})`,
    labelColor: () => C.textMuted,
    propsForDots: { r: "4", strokeWidth: "2", stroke: color },
    propsForBackgroundLines: { stroke: "rgba(255,255,255,0.04)" },
  });

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  };

  // ── summary cards fallback (when charts disabled) ─────────────
  const renderSummaryCards = () => {
    if (!analytics) return null;
    const items = [
      { label: "pH", data: analytics.ph, icon: "opacity" as const, color: C.accent },
      { label: "Temperature", data: analytics.temperature, icon: "thermostat" as const, color: "#fb923c" },
      { label: "Ammonia", data: analytics.ammonia, icon: "water-drop" as const, color: "#fbbf24" },
      { label: "Nitrite", data: analytics.nitrite, icon: "water-drop" as const, color: "#a78bfa" },
      { label: "Nitrate", data: analytics.nitrate, icon: "water-drop" as const, color: "#34d399" },
    ];

    return (
      <View style={s.summaryGrid}>
        {items.map((item, i) => {
          const arr = item.data;
          if (!arr || !Array.isArray(arr) || arr.length === 0) return null;
          const last = Number(arr[arr.length - 1]);
          const avg = (arr.reduce((a: number, b: any) => a + Number(b), 0) / arr.length).toFixed(2);
          return (
            <View key={i} style={s.summaryCard}>
              <View style={[s.summaryIconBox, { backgroundColor: `${item.color}15` }]}>
                <MaterialIcons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={s.summaryLabel}>{item.label}</Text>
              <Text style={s.summaryValue}>{isNaN(last) ? "–" : last}</Text>
              <Text style={s.summaryAvg}>avg {avg}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  // ── render chart safely ───────────────────────────────────────
  const renderChart = (
    title: string, subtitle: string, data: number[] | null,
    color: string, iconColor: string,
  ) => {
    if (!data) return null;
    if (!useCharts) return null;

    try {
      return (
        <View style={s.chartCard}>
          <View style={s.chartHeader}>
            <View style={[s.iconBadge, { backgroundColor: `${iconColor}18` }]}>
              <MaterialIcons name="show-chart" size={20} color={iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.chartTitle}>{title}</Text>
              <Text style={s.chartSub}>{subtitle}</Text>
            </View>
          </View>
          <LineChart
            data={{
              labels: data.map((_, i) => `#${i + 1}`),
              datasets: [{ data }],
            }}
            width={chartWidth}
            height={185}
            chartConfig={makeConfig(color)}
            bezier
            style={s.chart}
            withVerticalLines={false}
          />
        </View>
      );
    } catch {
      return null;
    }
  };

  // ── loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        <ActivityIndicator size="large" color={C.accent} />
        <Text style={s.loadingText}>Loading analytics…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={C.accent}
          colors={[C.accent]}
          progressBackgroundColor={C.card}
        />
      }
    >
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── Header ──────────────────────────────────────────── */}
      <View style={s.header}>
        <Text style={s.headerEmoji}>📊</Text>
        <Text style={s.headerTitle}>History & Analytics</Text>
        <Text style={s.headerSub}>Water quality trends and prediction records</Text>
        <View style={s.headerLine} />
      </View>

      {/* ── Error banner ────────────────────────────────────── */}
      {error ? (
        <View style={s.errorBanner}>
          <MaterialIcons name="wifi-off" size={18} color={C.red} />
          <Text style={s.errorBannerText}>{error}</Text>
        </View>
      ) : null}

      {/* ── Refresh button ──────────────────────────────────── */}
      <View style={s.actionRow}>
        <TouchableOpacity style={s.refreshBtn} onPress={onRefresh} activeOpacity={0.7}>
          <MaterialIcons name="refresh" size={18} color={C.accent} />
          <Text style={s.refreshText}>Refresh Data</Text>
        </TouchableOpacity>
        {analytics && (
          <TouchableOpacity style={s.toggleBtn} onPress={() => setUseCharts(!useCharts)} activeOpacity={0.7}>
            <MaterialIcons name={useCharts ? "grid-view" : "show-chart"} size={16} color={C.textSecondary} />
            <Text style={s.toggleText}>{useCharts ? "Cards" : "Charts"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Trend Charts or Summary Cards ───────────────────── */}
      {analytics && !useCharts && renderSummaryCards()}

      {useCharts && (
        <>
          {renderChart("pH Trend", `Last ${phData?.length ?? 0} readings`, phData, C.accent, C.accent)}
          {renderChart("Ammonia Trend", `Last ${ammoniaData?.length ?? 0} readings (mg/L)`, ammoniaData, "#fbbf24", "#fbbf24")}
          {renderChart("Temperature Trend", `Last ${tempData?.length ?? 0} readings (°C)`, tempData, "#fb923c", "#fb923c")}
        </>
      )}

      {/* ── Recent Predictions ──────────────────────────────── */}
      <View style={s.sectionHeader}>
        <MaterialIcons name="history" size={20} color={C.accent} />
        <Text style={s.sectionTitle}>Recent Predictions</Text>
        {history.length > 0 && (
          <View style={s.countBadge}>
            <Text style={s.countText}>{Math.min(history.length, 10)}</Text>
          </View>
        )}
      </View>

      {history.length === 0 ? (
        <View style={s.emptyCard}>
          <MaterialIcons name="inbox" size={44} color={C.textMuted} />
          <Text style={s.emptyTitle}>No Predictions Yet</Text>
          <Text style={s.emptyText}>Go to the Predict tab and run your first water quality analysis!</Text>
        </View>
      ) : (
        history.slice(0, 10).map((item, index) => {
          const rc = getRiskColor(item.risk_level);
          return (
            <View key={index} style={s.historyCard}>
              {/* Top: risk + confidence */}
              <View style={s.historyTop}>
                <View style={[s.riskPill, { backgroundColor: rc.bg }]}>
                  <MaterialIcons name={getRiskIcon(item.risk_level)} size={14} color={rc.badge} />
                  <Text style={[s.riskPillText, { color: rc.text }]}>{item.risk_level}</Text>
                </View>
                <View style={s.confidencePill}>
                  <Text style={s.confidencePillText}>{item.confidence}%</Text>
                </View>
              </View>

              {/* Parameter grid */}
              <View style={s.paramGrid}>
                {[
                  { label: "pH", value: item.ph },
                  { label: "Temp", value: `${item.temperature_c}°C` },
                  { label: "NH₃", value: item.ammonia_mg_l },
                  { label: "NO₂", value: item.nitrite_mg_l },
                  { label: "NO₃", value: item.nitrate_mg_l },
                ].map((p, pi) => (
                  <View key={pi} style={s.paramItem}>
                    <Text style={s.paramLabel}>{p.label}</Text>
                    <Text style={s.paramValue}>{p.value}</Text>
                  </View>
                ))}
              </View>

              {/* Timestamp */}
              <View style={s.timestampRow}>
                <MaterialIcons name="access-time" size={12} color={C.textMuted} />
                <Text style={s.timestamp}>{formatTimestamp(item.timestamp)}</Text>
              </View>
            </View>
          );
        })
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ── styles ────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  contentContainer: { paddingBottom: 30 },

  // loading
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: C.bg },
  loadingText: { marginTop: 14, fontSize: 15, color: C.textSecondary },

  // header
  header: { alignItems: "center", paddingTop: 56, paddingBottom: 20, paddingHorizontal: 24 },
  headerEmoji: { fontSize: 44, marginBottom: 10 },
  headerTitle: { fontSize: 26, fontWeight: "800", color: C.white, letterSpacing: 0.3 },
  headerSub: { fontSize: 13, color: C.textSecondary, marginTop: 6, textAlign: "center" },
  headerLine: { width: 40, height: 3, backgroundColor: C.accent, borderRadius: 2, marginTop: 14 },

  // error banner
  errorBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginHorizontal: 16, marginBottom: 16, padding: 14,
    backgroundColor: C.redBg, borderRadius: 12, borderWidth: 1, borderColor: "rgba(248,113,113,0.15)",
  },
  errorBannerText: { color: C.red, fontSize: 13, flex: 1 },

  // action row
  actionRow: { flexDirection: "row", marginHorizontal: 16, marginBottom: 16, gap: 10 },
  refreshBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: C.accent,
  },
  refreshText: { fontSize: 14, fontWeight: "700", color: C.accent },
  toggleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  toggleText: { fontSize: 13, fontWeight: "600", color: C.textSecondary },

  // chart card
  chartCard: {
    backgroundColor: C.card, marginHorizontal: 16, marginBottom: 16, borderRadius: 18,
    padding: 18, borderWidth: 1, borderColor: C.cardBorder,
  },
  chartHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
  iconBadge: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  chartTitle: { fontSize: 15, fontWeight: "700", color: C.textPrimary },
  chartSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  chart: { borderRadius: 12, alignSelf: "center" },

  // summary grid (fallback)
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: 12, gap: 8, marginBottom: 16 },
  summaryCard: {
    backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.cardBorder,
    alignItems: "center", width: "47%" as any, flexGrow: 1, marginHorizontal: 4,
  },
  summaryIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  summaryLabel: { fontSize: 12, fontWeight: "600", color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  summaryValue: { fontSize: 22, fontWeight: "800", color: C.textPrimary, marginTop: 4 },
  summaryAvg: { fontSize: 11, color: C.textMuted, marginTop: 4 },

  // section header
  sectionHeader: { flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginTop: 24, marginBottom: 14, gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: C.textPrimary, flex: 1 },
  countBadge: { backgroundColor: "rgba(34,211,238,0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  countText: { fontSize: 13, fontWeight: "700", color: C.accent },

  // empty state
  emptyCard: {
    alignItems: "center", justifyContent: "center", backgroundColor: C.card,
    marginHorizontal: 16, borderRadius: 18, padding: 40, borderWidth: 1, borderColor: C.cardBorder,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: C.textPrimary, marginTop: 14 },
  emptyText: { marginTop: 8, fontSize: 13, color: C.textMuted, textAlign: "center", lineHeight: 20 },

  // history card
  historyCard: {
    backgroundColor: C.card, marginHorizontal: 16, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: C.cardBorder,
  },
  historyTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  riskPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  riskPillText: { fontSize: 13, fontWeight: "700" },
  confidencePill: { backgroundColor: "rgba(34,211,238,0.1)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  confidencePillText: { fontSize: 13, fontWeight: "700", color: C.accent },

  paramGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  paramItem: {
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    alignItems: "center", minWidth: 58, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  paramLabel: { fontSize: 10, fontWeight: "600", color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  paramValue: { fontSize: 14, fontWeight: "700", color: C.textPrimary, marginTop: 3 },

  timestampRow: { flexDirection: "row", alignItems: "center", gap: 5, borderTopWidth: 1, borderTopColor: C.cardBorder, paddingTop: 12 },
  timestamp: { fontSize: 12, color: C.textMuted },
});