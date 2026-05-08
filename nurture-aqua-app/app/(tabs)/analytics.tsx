import { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  RefreshControl, StatusBar, TouchableOpacity, Dimensions,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { MaterialIcons } from "@expo/vector-icons";
import { C } from "@/constants/theme";
import { API_BASE_URL } from "@/constants/api";

const screenW = Dimensions.get("window").width;

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
};

const CLAMP: Record<string, { min: number; max: number }> = {
  ph: { min: 0, max: 14 },
  temperature: { min: 15, max: 45 },
  ammonia: { min: 0, max: 10 },
  nitrite: { min: 0, max: 10 },
  nitrate: { min: 0, max: 200 },
};

const clampArr = (arr: number[], key: string) => {
  const c = CLAMP[key] || { min: 0, max: 999 };
  return arr.map((v) => Math.max(c.min, Math.min(c.max, v)));
};

export default function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [useCharts, setUseCharts] = useState(true);

  const loadData = useCallback(async () => {
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/analytics`);
      const data = await res.json();
      setAnalytics(data);
    } catch {
      setError("Could not connect to server. Pull down to retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  const onRefresh = useCallback(() => { setRefreshing(true); loadData(); }, [loadData]);

  const chartW = screenW - 72;

  const safeSlice = (arr: any[] | undefined, n = 7) => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return null;
    const sliced = arr.slice(-n).map(Number);
    if (sliced.some(isNaN)) return null;
    return sliced;
  };

  const makeConfig = (color: string, decimals = 1) => ({
    backgroundGradientFrom: C.card,
    backgroundGradientTo: C.card,
    decimalPlaces: decimals,
    color: (opacity = 1) => `rgba(${hexToRgb(color)},${opacity})`,
    labelColor: () => C.textMuted,
    propsForDots: { r: "4", strokeWidth: "2", stroke: color },
    propsForBackgroundLines: { stroke: "rgba(255,255,255,0.04)" },
  });

  const renderChart = (title: string, sub: string, data: number[] | null, color: string, key: string, decimals = 1) => {
    if (!data || !useCharts) return null;
    const clamped = clampArr(data, key);
    try {
      return (
        <View style={s.chartCard}>
          <View style={s.chartHead}>
            <View style={[s.chartIcon, { backgroundColor: `${color}18` }]}>
              <MaterialIcons name="show-chart" size={20} color={color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.chartTitle}>{title}</Text>
              <Text style={s.chartSub}>{sub}</Text>
            </View>
          </View>
          <LineChart
            data={{ labels: clamped.map((_, i) => `#${i + 1}`), datasets: [{ data: clamped }] }}
            width={chartW} height={185}
            chartConfig={makeConfig(color, decimals)}
            bezier style={s.chart}
            withVerticalLines={false}
          />
        </View>
      );
    } catch { return null; }
  };

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
      <View style={s.sumGrid}>
        {items.map((item, i) => {
          const arr = item.data;
          if (!arr || !Array.isArray(arr) || arr.length === 0) return null;
          const last = Number(arr[arr.length - 1]);
          const avg = (arr.reduce((a: number, b: any) => a + Number(b), 0) / arr.length).toFixed(2);
          return (
            <View key={i} style={s.sumCard}>
              <View style={[s.sumIconBox, { backgroundColor: `${item.color}15` }]}>
                <MaterialIcons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={s.sumLabel}>{item.label}</Text>
              <Text style={s.sumVal}>{isNaN(last) ? "–" : last}</Text>
              <Text style={s.sumAvg}>avg {avg}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={s.loadWrap}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        <View style={s.loadIcon}><MaterialIcons name="bar-chart" size={32} color={C.accent} /></View>
        <ActivityIndicator size="large" color={C.accent} style={{ marginTop: 20 }} />
        <Text style={s.loadText}>Loading analytics…</Text>
      </View>
    );
  }

  const phData = safeSlice(analytics?.ph);
  const ammoniaData = safeSlice(analytics?.ammonia);
  const tempData = safeSlice(analytics?.temperature);
  const nitrateData = safeSlice(analytics?.nitrate);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} colors={[C.accent]} progressBackgroundColor={C.card} />}>

        <View style={s.header}>
          <View style={s.hIcon}><MaterialIcons name="bar-chart" size={28} color={C.accent} /></View>
          <Text style={s.hTitle}>Analytics</Text>
          <Text style={s.hSub}>Water quality trends and insights</Text>
          <View style={s.hLine} />
        </View>

        {error ? <View style={s.errBox}><MaterialIcons name="wifi-off" size={18} color={C.red} /><Text style={s.errTxt}>{error}</Text></View> : null}

        <View style={s.actRow}>
          <TouchableOpacity style={s.refBtn} onPress={onRefresh} activeOpacity={0.7}>
            <MaterialIcons name="refresh" size={18} color={C.accent} /><Text style={s.refText}>Refresh</Text>
          </TouchableOpacity>
          {analytics && (
            <TouchableOpacity style={s.togBtn} onPress={() => setUseCharts(!useCharts)} activeOpacity={0.7}>
              <MaterialIcons name={useCharts ? "grid-view" : "show-chart"} size={16} color={C.textSecondary} />
              <Text style={s.togText}>{useCharts ? "Cards" : "Charts"}</Text>
            </TouchableOpacity>
          )}
        </View>

        {analytics && !useCharts && renderSummaryCards()}

        {renderChart("pH Trend", `Last ${phData?.length ?? 0} readings`, phData, C.accent, "ph")}
        {renderChart("Temperature Trend", `Last ${tempData?.length ?? 0} readings (°C)`, tempData, "#fb923c", "temperature")}
        {renderChart("Ammonia Trend", `Last ${ammoniaData?.length ?? 0} readings (mg/L)`, ammoniaData, "#fbbf24", "ammonia", 3)}
        {renderChart("Nitrate Trend", `Last ${nitrateData?.length ?? 0} readings (mg/L)`, nitrateData, "#34d399", "nitrate")}

        {!analytics && !error && (
          <View style={s.emptyCard}>
            <MaterialIcons name="bar-chart" size={48} color={C.textMuted} />
            <Text style={s.emptyTitle}>No Analytics Data</Text>
            <Text style={s.emptyText}>Run some predictions first to see trends!</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  loadWrap: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: C.bg },
  loadIcon: { width: 64, height: 64, borderRadius: 22, backgroundColor: "rgba(34,211,238,0.1)", justifyContent: "center", alignItems: "center" },
  loadText: { marginTop: 16, fontSize: 15, color: C.textSecondary },
  header: { alignItems: "center", paddingTop: 56, paddingBottom: 20, paddingHorizontal: 24 },
  hIcon: { width: 56, height: 56, borderRadius: 20, backgroundColor: "rgba(34,211,238,0.1)", borderWidth: 1, borderColor: "rgba(34,211,238,0.2)", justifyContent: "center", alignItems: "center", marginBottom: 14 },
  hTitle: { fontSize: 26, fontWeight: "800", color: "#fff", letterSpacing: 0.3 },
  hSub: { fontSize: 13, color: C.textSecondary, marginTop: 6, textAlign: "center" },
  hLine: { width: 40, height: 3, backgroundColor: C.accent, borderRadius: 2, marginTop: 14 },
  errBox: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, marginBottom: 16, padding: 14, backgroundColor: C.redBg, borderRadius: 14, borderWidth: 1, borderColor: "rgba(248,113,113,0.15)" },
  errTxt: { color: C.red, fontSize: 13, flex: 1 },
  actRow: { flexDirection: "row", marginHorizontal: 16, marginBottom: 16, gap: 10 },
  refBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, borderColor: C.accent },
  refText: { fontSize: 14, fontWeight: "700", color: C.accent },
  togBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  togText: { fontSize: 13, fontWeight: "600", color: C.textSecondary },
  chartCard: { backgroundColor: C.card, marginHorizontal: 16, marginBottom: 16, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: C.cardBorder },
  chartHead: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
  chartIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  chartTitle: { fontSize: 15, fontWeight: "700", color: C.textPrimary },
  chartSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  chart: { borderRadius: 12, alignSelf: "center" },
  sumGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: 12, gap: 8, marginBottom: 16 },
  sumCard: { backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.cardBorder, alignItems: "center", width: "47%" as any, flexGrow: 1, marginHorizontal: 4 },
  sumIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  sumLabel: { fontSize: 12, fontWeight: "600", color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  sumVal: { fontSize: 22, fontWeight: "800", color: C.textPrimary, marginTop: 4 },
  sumAvg: { fontSize: 11, color: C.textMuted, marginTop: 4 },
  emptyCard: { alignItems: "center", backgroundColor: C.card, marginHorizontal: 16, borderRadius: 20, padding: 48, borderWidth: 1, borderColor: C.cardBorder },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: C.textPrimary, marginTop: 14 },
  emptyText: { marginTop: 8, fontSize: 13, color: C.textMuted, textAlign: "center" },
});
